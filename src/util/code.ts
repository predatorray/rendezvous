// 6 lowercase letters → 26^6 ≈ 308M combinations.
// Excludes visually ambiguous letters (l, o, i) to keep codes easy to read aloud.
const ALPHABET = 'abcdefghjkmnpqrstuvwxyz';
const LENGTH = 6;

export function generateMeetingCode(): string {
  const buf = new Uint32Array(LENGTH);
  crypto.getRandomValues(buf);
  let out = '';
  for (let i = 0; i < LENGTH; i++) {
    out += ALPHABET[buf[i] % ALPHABET.length];
  }
  return out;
}

export function normalizeMeetingCode(input: string): string {
  return input.trim().toLowerCase().replace(/[^a-z]/g, '').slice(0, LENGTH);
}

export function isValidMeetingCode(code: string): boolean {
  return code.length === LENGTH && /^[a-z]+$/.test(code);
}

// Codes are stored and routed in lowercase, but presented to humans
// in uppercase to make them easier to read aloud and transcribe.
export function displayMeetingCode(code: string): string {
  return code.toUpperCase();
}

// PeerJS peer IDs must be DNS-ish; we namespace to avoid colliding with
// other PeerJS apps using the public broker.
export function peerIdForMeeting(code: string): string {
  return `rendezvous-${code}`;
}

export function randomClientPeerId(code: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `rendezvous-${code}-${rand}`;
}

export function newMessageId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
