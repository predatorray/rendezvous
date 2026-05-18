import {
  generateMeetingCode,
  isValidMeetingCode,
  newMessageId,
  normalizeMeetingCode,
  peerIdForMeeting,
  randomClientPeerId,
} from './code';

describe('generateMeetingCode', () => {
  it('produces a 6-letter lowercase code from the safe alphabet', () => {
    for (let i = 0; i < 50; i++) {
      const code = generateMeetingCode();
      expect(code).toMatch(/^[abcdefghjkmnpqrstuvwxyz]{6}$/);
    }
  });

  it('does not include visually ambiguous letters l, o, i', () => {
    for (let i = 0; i < 50; i++) {
      expect(generateMeetingCode()).not.toMatch(/[loi]/);
    }
  });
});

describe('normalizeMeetingCode', () => {
  it('trims, lowercases, strips non-letters, and caps at 6 chars', () => {
    expect(normalizeMeetingCode('  AbC-Xyz  ')).toBe('abcxyz');
    expect(normalizeMeetingCode('AbCdEfGhIjK')).toBe('abcdef');
    expect(normalizeMeetingCode('123!@#abc')).toBe('abc');
    expect(normalizeMeetingCode('')).toBe('');
  });
});

describe('isValidMeetingCode', () => {
  it('accepts 6 lowercase letters', () => {
    expect(isValidMeetingCode('abcdef')).toBe(true);
  });

  it('rejects wrong length or non-lowercase', () => {
    expect(isValidMeetingCode('abcde')).toBe(false);
    expect(isValidMeetingCode('abcdefg')).toBe(false);
    expect(isValidMeetingCode('ABCDEF')).toBe(false);
    expect(isValidMeetingCode('abc123')).toBe(false);
    expect(isValidMeetingCode('')).toBe(false);
  });
});

describe('peerIdForMeeting', () => {
  it('namespaces the code with rendezvous-', () => {
    expect(peerIdForMeeting('abcdef')).toBe('rendezvous-abcdef');
  });
});

describe('randomClientPeerId', () => {
  it('starts with the namespaced meeting prefix', () => {
    const id = randomClientPeerId('abcdef');
    expect(id).toMatch(/^rendezvous-abcdef-[a-z0-9]+$/);
  });

  it('returns different values on repeat calls', () => {
    const a = randomClientPeerId('abcdef');
    const b = randomClientPeerId('abcdef');
    expect(a).not.toBe(b);
  });
});

describe('newMessageId', () => {
  it('returns a non-empty string', () => {
    expect(newMessageId().length).toBeGreaterThan(0);
  });

  it('produces unique values on consecutive calls', () => {
    const ids = new Set(Array.from({ length: 20 }, () => newMessageId()));
    expect(ids.size).toBe(20);
  });
});
