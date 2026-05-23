// Verification primitives for the "verified meeting" feature.
//
// A guest never touches a passkey. It only *verifies*: it checks that the
// public key the host presents matches the fingerprint pinned in the invite
// URL, that a WebAuthn assertion over the host's ephemeral session key is
// valid, and that the session key signed a fresh per-guest nonce. All of that
// is plain WebCrypto, which is why this module has no WebAuthn ceremony code.

import {
  base64urlToBytes,
  bytesEqual,
  bytesToBase64url,
  concatBytes,
  fromUtf8,
  sha256,
  utf8,
} from './encoding';

// COSE algorithm identifiers we accept for the host identity passkey.
// Platform passkeys (iCloud Keychain, Google Password Manager) issue ES256;
// RS256 is supported as a fallback for older Windows Hello credentials.
export const COSE_ES256 = -7;
export const COSE_RS256 = -257;

export function isSupportedAlg(alg: number): boolean {
  return alg === COSE_ES256 || alg === COSE_RS256;
}

/**
 * Converts an ASN.1 DER ECDSA signature (`SEQUENCE { r INTEGER, s INTEGER }`)
 * into the fixed-width `r || s` form WebCrypto expects. WebAuthn authenticators
 * emit DER; WebCrypto's `verify` wants raw, so every ES256 assertion has to be
 * translated here.
 */
export function derEcdsaToRaw(der: Uint8Array, coordSize = 32): Uint8Array {
  let offset = 0;
  if (der[offset++] !== 0x30) throw new Error('Invalid DER: expected sequence');
  // Sequence length (assume short form — ECDSA sigs are well under 128 bytes).
  let seqLen = der[offset++];
  if (seqLen & 0x80) {
    const n = seqLen & 0x7f;
    seqLen = 0;
    for (let i = 0; i < n; i++) seqLen = (seqLen << 8) | der[offset++];
  }
  const readInt = (): Uint8Array => {
    if (der[offset++] !== 0x02) throw new Error('Invalid DER: expected integer');
    const len = der[offset++];
    let bytes = der.slice(offset, offset + len);
    offset += len;
    // Strip leading sign byte, then left-pad to the coordinate width.
    while (bytes.length > coordSize && bytes[0] === 0x00) bytes = bytes.slice(1);
    if (bytes.length < coordSize) {
      const padded = new Uint8Array(coordSize);
      padded.set(bytes, coordSize - bytes.length);
      bytes = padded;
    }
    return bytes;
  };
  const r = readInt();
  const s = readInt();
  return concatBytes(r, s);
}

async function importVerifyKey(
  spki: Uint8Array,
  alg: number
): Promise<CryptoKey> {
  const buf = spki.slice().buffer;
  if (alg === COSE_ES256) {
    return crypto.subtle.importKey(
      'spki',
      buf,
      { name: 'ECDSA', namedCurve: 'P-256' },
      false,
      ['verify']
    );
  }
  if (alg === COSE_RS256) {
    return crypto.subtle.importKey(
      'spki',
      buf,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['verify']
    );
  }
  throw new Error(`Unsupported key algorithm ${alg}`);
}

async function verifySignature(
  spki: Uint8Array,
  alg: number,
  rawOrDerSignature: Uint8Array,
  data: Uint8Array,
  signatureIsDer: boolean
): Promise<boolean> {
  const key = await importVerifyKey(spki, alg);
  const dataBuf = data.slice().buffer;
  if (alg === COSE_ES256) {
    const raw = signatureIsDer
      ? derEcdsaToRaw(rawOrDerSignature)
      : rawOrDerSignature;
    return crypto.subtle.verify(
      { name: 'ECDSA', hash: 'SHA-256' },
      key,
      raw.slice().buffer,
      dataBuf
    );
  }
  // RS256 signatures are raw in both WebAuthn and WebCrypto.
  return crypto.subtle.verify(
    { name: 'RSASSA-PKCS1-v1_5' },
    key,
    rawOrDerSignature.slice().buffer,
    dataBuf
  );
}

/** A fingerprint is the SHA-256 of the SPKI public key, shown SSH-style. */
export async function fingerprintOf(publicKeySpkiB64url: string): Promise<string> {
  const digest = await sha256(base64urlToBytes(publicKeySpkiB64url));
  return bytesToBase64url(digest);
}

/**
 * Renders a fingerprint the way OpenSSH does (`SHA256:<base64>`), so the value
 * the host reads aloud or pastes into a calendar invite is unambiguous and
 * recognizable.
 */
export function displayFingerprint(fingerprintB64url: string): string {
  return `SHA256:${fingerprintB64url}`;
}

interface ClientData {
  type: string;
  challenge: string;
  origin: string;
}

function parseClientData(clientDataJSON: Uint8Array): ClientData {
  return JSON.parse(fromUtf8(clientDataJSON));
}

export interface AssertionVerifyInput {
  // The trusted identity key, taken from the invite URL fingerprint chain.
  identityPublicKeySpki: Uint8Array;
  identityAlg: number;
  // Raw WebAuthn assertion fields.
  authenticatorData: Uint8Array;
  clientDataJSON: Uint8Array;
  signature: Uint8Array;
  // What the guest expects to have been signed / where.
  expectedChallenge: Uint8Array;
  expectedOrigin: string;
  expectedRpId: string;
}

/**
 * Verifies a WebAuthn assertion the host produced over its session key.
 * Returns true only if the assertion is structurally valid, was generated for
 * this origin/RP, signed exactly the challenge we expected, and the signature
 * checks out against the pinned identity key.
 */
export async function verifyWebAuthnAssertion(
  input: AssertionVerifyInput
): Promise<boolean> {
  const client = parseClientData(input.clientDataJSON);
  if (client.type !== 'webauthn.get') return false;
  if (client.origin !== input.expectedOrigin) return false;
  if (client.challenge !== bytesToBase64url(input.expectedChallenge)) {
    return false;
  }

  // authenticatorData = rpIdHash(32) || flags(1) || signCount(4) || ...
  if (input.authenticatorData.length < 37) return false;
  const rpIdHash = input.authenticatorData.slice(0, 32);
  const expectedRpIdHash = await sha256(utf8(input.expectedRpId));
  if (!bytesEqual(rpIdHash, expectedRpIdHash)) return false;
  const flags = input.authenticatorData[32];
  const userPresent = (flags & 0x01) === 0x01;
  if (!userPresent) return false;

  const clientDataHash = await sha256(input.clientDataJSON);
  const signedData = concatBytes(input.authenticatorData, clientDataHash);
  return verifySignature(
    input.identityPublicKeySpki,
    input.identityAlg,
    input.signature,
    signedData,
    /* signatureIsDer */ true
  );
}

/**
 * Verifies a raw ECDSA-P256 signature made by the host's ephemeral session
 * key (not a passkey — a WebCrypto key), used for the fresh per-guest liveness
 * proof.
 */
export async function verifySessionSignature(
  sessionPublicKeySpki: Uint8Array,
  signature: Uint8Array,
  data: Uint8Array
): Promise<boolean> {
  return verifySignature(
    sessionPublicKeySpki,
    COSE_ES256,
    signature,
    data,
    /* signatureIsDer */ false
  );
}
