import {
  livenessData,
  sessionCertChallenge,
  verifyAuthResponse,
} from './verification';
import { AuthResponsePayload } from '../types';
import { fingerprintOf } from '../crypto/verify';
import {
  bytesToBase64url,
  concatBytes,
  sha256,
  utf8,
} from '../crypto/encoding';

const ORIGIN = 'https://www.predatorray.me';
const RP_ID = 'www.predatorray.me';
const CODE = 'abcdef';

// --- helpers (the test plays the role of an honest host) ---

async function genEcdsa(): Promise<CryptoKeyPair> {
  return crypto.subtle.generateKey(
    { name: 'ECDSA', namedCurve: 'P-256' },
    true,
    ['sign', 'verify']
  );
}

async function exportSpki(key: CryptoKey): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.exportKey('spki', key));
}

async function signRaw(key: CryptoKey, data: Uint8Array): Promise<Uint8Array> {
  return new Uint8Array(
    await crypto.subtle.sign(
      { name: 'ECDSA', hash: 'SHA-256' },
      key,
      data.slice().buffer
    )
  );
}

// WebAuthn assertions carry DER-encoded ECDSA signatures; WebCrypto emits raw
// r||s, so the test re-encodes to DER the way an authenticator would.
function rawToDer(raw: Uint8Array): Uint8Array {
  const encodeInt = (bytes: Uint8Array): number[] => {
    let i = 0;
    while (i < bytes.length - 1 && bytes[i] === 0) i++;
    let v = Array.from(bytes.slice(i));
    if (v[0] & 0x80) v = [0x00, ...v];
    return [0x02, v.length, ...v];
  };
  const r = encodeInt(raw.slice(0, 32));
  const s = encodeInt(raw.slice(32, 64));
  const body = [...r, ...s];
  return Uint8Array.from([0x30, body.length, ...body]);
}

interface HostKit {
  payload: AuthResponsePayload;
  expectedFingerprint: string;
  nonce: string;
}

interface Overrides {
  origin?: string;
  rpId?: string;
  userPresent?: boolean;
  certChallengeCode?: string; // bind the cert to a different code
  livenessNonce?: string; // sign a different nonce than the guest sent
}

async function makeHostResponse(
  nonce: string,
  o: Overrides = {}
): Promise<HostKit> {
  const identity = await genEcdsa();
  const session = await genEcdsa();
  const identitySpki = await exportSpki(identity.publicKey);
  const sessionSpki = await exportSpki(session.publicKey);
  const identityPublicKey = bytesToBase64url(identitySpki);
  const sessionPublicKey = bytesToBase64url(sessionSpki);

  // Session cert: identity "passkey" signs an authenticatorData||hash(clientData).
  const challenge = await sessionCertChallenge(
    o.certChallengeCode ?? CODE,
    sessionSpki
  );
  const clientData = utf8(
    JSON.stringify({
      type: 'webauthn.get',
      challenge: bytesToBase64url(challenge),
      origin: o.origin ?? ORIGIN,
      crossOrigin: false,
    })
  );
  const rpIdHash = await sha256(utf8(o.rpId ?? RP_ID));
  const flags = o.userPresent === false ? 0x00 : 0x01;
  const authData = concatBytes(
    rpIdHash,
    Uint8Array.from([flags]),
    Uint8Array.from([0, 0, 0, 0]) // signCount
  );
  const signedData = concatBytes(authData, await sha256(clientData));
  const certSigDer = rawToDer(await signRaw(identity.privateKey, signedData));

  // Liveness: session key signs the guest's nonce.
  const liveness = await signRaw(
    session.privateKey,
    livenessData(CODE, o.livenessNonce ?? nonce)
  );

  const payload: AuthResponsePayload = {
    identityPublicKey,
    identityAlg: -7,
    sessionPublicKey,
    sessionCert: {
      authenticatorData: bytesToBase64url(authData),
      clientDataJSON: bytesToBase64url(clientData),
      signature: bytesToBase64url(certSigDer),
    },
    liveness: bytesToBase64url(liveness),
  };
  return {
    payload,
    expectedFingerprint: await fingerprintOf(identityPublicKey),
    nonce,
  };
}

describe('verifyAuthResponse', () => {
  it('accepts an honest host response', async () => {
    const kit = await makeHostResponse('nonce-1');
    const result = await verifyAuthResponse({
      payload: kit.payload,
      expectedFingerprint: kit.expectedFingerprint,
      code: CODE,
      nonce: kit.nonce,
      origin: ORIGIN,
      rpId: RP_ID,
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.fingerprint).toBe(kit.expectedFingerprint);
  });

  it('rejects when the fingerprint does not match the pinned URL value', async () => {
    const kit = await makeHostResponse('nonce-2');
    const result = await verifyAuthResponse({
      payload: kit.payload,
      expectedFingerprint: 'totally-different-fingerprint',
      code: CODE,
      nonce: kit.nonce,
      origin: ORIGIN,
      rpId: RP_ID,
    });
    expect(result).toEqual({ ok: false, reason: 'fingerprint-mismatch' });
  });

  it('rejects a replayed certificate that signed a stale nonce', async () => {
    const kit = await makeHostResponse('fresh-nonce', {
      livenessNonce: 'old-nonce',
    });
    const result = await verifyAuthResponse({
      payload: kit.payload,
      expectedFingerprint: kit.expectedFingerprint,
      code: CODE,
      nonce: 'fresh-nonce',
      origin: ORIGIN,
      rpId: RP_ID,
    });
    expect(result).toEqual({ ok: false, reason: 'liveness-invalid' });
  });

  it('rejects an assertion produced for a different origin', async () => {
    const kit = await makeHostResponse('nonce-3', {
      origin: 'https://evil.example.com',
    });
    const result = await verifyAuthResponse({
      payload: kit.payload,
      expectedFingerprint: kit.expectedFingerprint,
      code: CODE,
      nonce: kit.nonce,
      origin: ORIGIN,
      rpId: RP_ID,
    });
    expect(result).toEqual({ ok: false, reason: 'cert-invalid' });
  });

  it('rejects when user-presence flag is not set', async () => {
    const kit = await makeHostResponse('nonce-4', { userPresent: false });
    const result = await verifyAuthResponse({
      payload: kit.payload,
      expectedFingerprint: kit.expectedFingerprint,
      code: CODE,
      nonce: kit.nonce,
      origin: ORIGIN,
      rpId: RP_ID,
    });
    expect(result).toEqual({ ok: false, reason: 'cert-invalid' });
  });

  it('rejects a cert bound to a different meeting code', async () => {
    const kit = await makeHostResponse('nonce-5', {
      certChallengeCode: 'zzzzzz',
    });
    const result = await verifyAuthResponse({
      payload: kit.payload,
      expectedFingerprint: kit.expectedFingerprint,
      code: CODE,
      nonce: kit.nonce,
      origin: ORIGIN,
      rpId: RP_ID,
    });
    expect(result).toEqual({ ok: false, reason: 'cert-invalid' });
  });
});
