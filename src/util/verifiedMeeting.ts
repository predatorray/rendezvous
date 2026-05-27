// Glue between the verified-meeting crypto and the rest of the app: the
// experimental on/off flag and the invite-URL query parameters that carry the
// host's identity key.

const EXPERIMENTAL_KEY = 'rendezvous.experimental.verified';

// Query params on a verified invite link:
//   vk = host identity public key, SPKI base64url
//   va = COSE algorithm id of that key (e.g. -7)
export const VK_PARAM = 'vk';
export const VA_PARAM = 'va';

export interface VerifiedKey {
  publicKey: string; // SPKI base64url
  alg: number;
}

export function isVerifiedFeatureEnabled(): boolean {
  try {
    return localStorage.getItem(EXPERIMENTAL_KEY) === '1';
  } catch {
    return false;
  }
}

export function setVerifiedFeatureEnabled(enabled: boolean): void {
  try {
    if (enabled) localStorage.setItem(EXPERIMENTAL_KEY, '1');
    else localStorage.removeItem(EXPERIMENTAL_KEY);
  } catch {
    // ignore storage failures
  }
}

export function parseVerifiedKey(params: URLSearchParams): VerifiedKey | null {
  const publicKey = params.get(VK_PARAM);
  const algRaw = params.get(VA_PARAM);
  if (!publicKey || !algRaw) return null;
  const alg = Number(algRaw);
  if (!Number.isFinite(alg)) return null;
  return { publicKey, alg };
}

export function verifiedKeyParams(key: VerifiedKey): Record<string, string> {
  return { [VK_PARAM]: key.publicKey, [VA_PARAM]: String(key.alg) };
}
