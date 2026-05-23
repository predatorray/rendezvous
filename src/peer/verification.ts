// The verified-meeting handshake, tying together the encoding/verify
// primitives and the WebAuthn ceremony.
//
// Trust chain a guest checks:
//   1. identity public key  --fingerprint-->  the value pinned in the URL
//   2. identity passkey      --WebAuthn cert-->  ephemeral session public key
//   3. session key           --raw signature-->  this guest's fresh nonce
// (1) pins who the host is, (2) lets the host sign for guests without a
// biometric prompt per guest, (3) proves the host is live right now.

import { AuthResponsePayload } from '../types';
import {
  base64urlToBytes,
  bytesToBase64url,
  concatBytes,
  randomBytes,
  sha256,
  utf8,
} from '../crypto/encoding';
import {
  fingerprintOf,
  verifySessionSignature,
  verifyWebAuthnAssertion,
} from '../crypto/verify';
import { credentialIdToBytes } from './hostIdentity';

const CERT_CONTEXT = 'rendezvous-session-cert-v1';
const LIVENESS_CONTEXT = 'rendezvous-liveness-v1';

/** The bytes the host's passkey signs to vouch for a session key. Exported for
 *  tests that synthesize a host response. */
export async function sessionCertChallenge(
  code: string,
  sessionPublicKeySpki: Uint8Array
): Promise<Uint8Array> {
  return sha256(
    concatBytes(utf8(`${CERT_CONTEXT}:${code}:`), sessionPublicKeySpki)
  );
}

/** The bytes the session key signs for a specific guest nonce. */
export function livenessData(code: string, nonce: string): Uint8Array {
  return utf8(`${LIVENESS_CONTEXT}:${code}:${nonce}`);
}

export function freshNonce(): string {
  return bytesToBase64url(randomBytes(32));
}

// ---- Host side ----

export interface HostSessionInput {
  code: string;
  identityCredentialId: string | null; // null when relying on a synced passkey
  identityPublicKey: string; // SPKI base64url (from storage or the invite URL)
  identityAlg: number;
}

/**
 * Runs the host's once-per-meeting passkey ceremony: it mints an ephemeral
 * session key and has the passkey sign it. Must be called from a user gesture
 * (it triggers the biometric prompt). The returned object can then sign any
 * number of guest challenges with no further prompts.
 */
export class HostSession {
  private constructor(
    private readonly code: string,
    private readonly sessionPrivateKey: CryptoKey,
    private readonly sessionPublicKeySpki: Uint8Array,
    private readonly identityPublicKey: string,
    private readonly identityAlg: number,
    private readonly cert: {
      authenticatorData: string;
      clientDataJSON: string;
      signature: string;
    }
  ) {}

  static async create(input: HostSessionInput): Promise<HostSession> {
    const keyPair = await crypto.subtle.generateKey(
      { name: 'ECDSA', namedCurve: 'P-256' },
      true,
      ['sign', 'verify']
    );
    const sessionPublicKeySpki = new Uint8Array(
      await crypto.subtle.exportKey('spki', keyPair.publicKey)
    );

    const challenge = await sessionCertChallenge(
      input.code,
      sessionPublicKeySpki
    );
    const allowCredentials: PublicKeyCredentialDescriptor[] =
      input.identityCredentialId
        ? [
            {
              type: 'public-key',
              id: credentialIdToBytes(input.identityCredentialId),
            },
          ]
        : [];

    const assertion = (await navigator.credentials.get({
      publicKey: {
        challenge: challenge.slice().buffer,
        allowCredentials,
        userVerification: 'preferred',
      },
    })) as PublicKeyCredential | null;
    if (!assertion) throw new Error('Passkey verification was cancelled.');

    const response = assertion.response as AuthenticatorAssertionResponse;
    const cert = {
      authenticatorData: bytesToBase64url(
        new Uint8Array(response.authenticatorData)
      ),
      clientDataJSON: bytesToBase64url(new Uint8Array(response.clientDataJSON)),
      signature: bytesToBase64url(new Uint8Array(response.signature)),
    };

    const session = new HostSession(
      input.code,
      keyPair.privateKey,
      sessionPublicKeySpki,
      input.identityPublicKey,
      input.identityAlg,
      cert
    );

    // Self-check: confirm the passkey we just used actually matches the
    // identity pinned in the invite URL. Catches "wrong passkey picked" on a
    // second device before any guest fails verification.
    const probe = await session.signFor(freshNonce());
    const ok = await verifyAuthResponse({
      payload: probe,
      expectedFingerprint: await fingerprintOf(input.identityPublicKey),
      code: input.code,
      nonce: '', // ignored: selfCheck skips the liveness step
      origin: window.location.origin,
      rpId: window.location.hostname,
      selfCheck: true,
    });
    if (!ok.ok) {
      throw new Error(
        'The selected passkey does not match this meeting. Pick the passkey you used to create the link.'
      );
    }
    return session;
  }

  async signFor(nonce: string): Promise<AuthResponsePayload> {
    const signature = new Uint8Array(
      await crypto.subtle.sign(
        { name: 'ECDSA', hash: 'SHA-256' },
        this.sessionPrivateKey,
        livenessData(this.code, nonce).slice().buffer
      )
    );
    return {
      identityPublicKey: this.identityPublicKey,
      identityAlg: this.identityAlg,
      sessionPublicKey: bytesToBase64url(this.sessionPublicKeySpki),
      sessionCert: this.cert,
      liveness: bytesToBase64url(signature),
    };
  }
}

// ---- Guest side ----

export interface VerifyInput {
  payload: AuthResponsePayload;
  expectedFingerprint: string; // base64url SHA-256 of the pinned identity key
  code: string;
  nonce: string;
  origin: string;
  rpId: string;
  // When true, skip the liveness/nonce check (used by the host self-test where
  // the nonce was generated internally and we only care about the cert chain).
  selfCheck?: boolean;
}

export type VerifyResult =
  | { ok: true; fingerprint: string }
  | { ok: false; reason: string };

/**
 * The guest's full check of an `auth-response`. Returns ok only when every
 * link in the trust chain holds.
 */
export async function verifyAuthResponse(
  input: VerifyInput
): Promise<VerifyResult> {
  const { payload } = input;
  try {
    const identitySpki = base64urlToBytes(payload.identityPublicKey);

    // (1) Pin: the presented identity key must hash to the URL fingerprint.
    const presentedFingerprint = await fingerprintOf(payload.identityPublicKey);
    if (presentedFingerprint !== input.expectedFingerprint) {
      return {
        ok: false,
        reason: 'fingerprint-mismatch',
      };
    }

    // (2) Cert: the passkey vouches for the session key.
    const sessionSpki = base64urlToBytes(payload.sessionPublicKey);
    const expectedChallenge = await sessionCertChallenge(input.code, sessionSpki);
    const certOk = await verifyWebAuthnAssertion({
      identityPublicKeySpki: identitySpki,
      identityAlg: payload.identityAlg,
      authenticatorData: base64urlToBytes(payload.sessionCert.authenticatorData),
      clientDataJSON: base64urlToBytes(payload.sessionCert.clientDataJSON),
      signature: base64urlToBytes(payload.sessionCert.signature),
      expectedChallenge,
      expectedOrigin: input.origin,
      expectedRpId: input.rpId,
    });
    if (!certOk) return { ok: false, reason: 'cert-invalid' };

    // (3) Liveness: the session key signed this guest's fresh nonce.
    if (!input.selfCheck) {
      const livenessOk = await verifySessionSignature(
        sessionSpki,
        base64urlToBytes(payload.liveness),
        livenessData(input.code, input.nonce)
      );
      if (!livenessOk) return { ok: false, reason: 'liveness-invalid' };
    }

    return { ok: true, fingerprint: presentedFingerprint };
  } catch (e) {
    return { ok: false, reason: 'malformed' };
  }
}
