// The host's long-term cryptographic identity for verified meetings.
//
// The identity *is* a passkey (WebAuthn credential). The private key never
// leaves the authenticator and syncs across the host's devices via iCloud
// Keychain / Google Password Manager. We only persist the *public* parts
// (credential id + public key) locally so links can be minted without a
// ceremony and so we can target the right credential when re-authenticating.

import {
  base64urlToBytes,
  bytesToBase64url,
  randomBytes,
} from '../crypto/encoding';
import { COSE_ES256, COSE_RS256, isSupportedAlg } from '../crypto/verify';

const STORAGE_KEY = 'rendezvous.hostIdentity.v1';

export interface HostIdentity {
  credentialId: string; // base64url of the WebAuthn credential raw id
  publicKey: string; // base64url SPKI
  alg: number; // COSE algorithm id
  createdAt: number;
}

export function webAuthnAvailable(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.PublicKeyCredential === 'function' &&
    typeof navigator !== 'undefined' &&
    !!navigator.credentials
  );
}

export function loadHostIdentity(): HostIdentity | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as HostIdentity;
    if (!parsed.credentialId || !parsed.publicKey || !isSupportedAlg(parsed.alg)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function storeHostIdentity(identity: HostIdentity): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(identity));
  } catch {
    // Non-fatal: the identity still works for this session, links just won't
    // be instant next time.
  }
}

/**
 * Returns the existing host identity, or creates one by registering a new
 * passkey. Registration shows the platform's biometric / passkey UI, so this
 * must be called from within a user gesture.
 */
export async function getOrCreateHostIdentity(): Promise<HostIdentity> {
  const existing = loadHostIdentity();
  if (existing) return existing;

  if (!webAuthnAvailable()) {
    throw new Error('Passkeys are not supported in this browser.');
  }

  const credential = (await navigator.credentials.create({
    publicKey: {
      // rp.id is intentionally omitted so it defaults to the current domain
      // (works on localhost in dev and www.predatorray.me in prod).
      rp: { name: 'Rendezvous' },
      user: {
        id: randomBytes(16),
        name: 'rendezvous-host',
        displayName: 'Rendezvous Host',
      },
      challenge: randomBytes(32),
      pubKeyCredParams: [
        { type: 'public-key', alg: COSE_ES256 },
        { type: 'public-key', alg: COSE_RS256 },
      ],
      authenticatorSelection: {
        residentKey: 'required',
        requireResidentKey: true,
        userVerification: 'preferred',
      },
      attestation: 'none',
    },
  })) as PublicKeyCredential | null;

  if (!credential) throw new Error('Passkey creation was cancelled.');

  const response = credential.response as AuthenticatorAttestationResponse;
  if (typeof response.getPublicKey !== 'function') {
    throw new Error('This browser cannot expose the passkey public key.');
  }
  const spki = response.getPublicKey();
  if (!spki) throw new Error('Passkey did not return a public key.');
  const alg = response.getPublicKeyAlgorithm();
  if (!isSupportedAlg(alg)) {
    throw new Error(`Passkey uses an unsupported algorithm (${alg}).`);
  }

  const identity: HostIdentity = {
    credentialId: bytesToBase64url(new Uint8Array(credential.rawId)),
    publicKey: bytesToBase64url(new Uint8Array(spki)),
    alg,
    createdAt: Date.now(),
  };
  storeHostIdentity(identity);
  return identity;
}

export function credentialIdToBytes(id: string): Uint8Array {
  return base64urlToBytes(id);
}
