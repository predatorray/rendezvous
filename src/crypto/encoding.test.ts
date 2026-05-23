import {
  base64urlToBytes,
  bytesEqual,
  bytesToBase64url,
  concatBytes,
  fromUtf8,
  randomBytes,
  sha256,
  utf8,
} from './encoding';

describe('base64url', () => {
  it('round-trips arbitrary bytes', () => {
    for (const len of [0, 1, 2, 3, 16, 31, 32, 91, 256]) {
      const bytes = randomBytes(len);
      const encoded = bytesToBase64url(bytes);
      expect(encoded).not.toMatch(/[+/=]/); // url-safe, unpadded
      expect(bytesEqual(base64urlToBytes(encoded), bytes)).toBe(true);
    }
  });

  it('matches a known vector', () => {
    // "hello" -> base64 "aGVsbG8=" -> base64url "aGVsbG8"
    expect(bytesToBase64url(utf8('hello'))).toBe('aGVsbG8');
    expect(fromUtf8(base64urlToBytes('aGVsbG8'))).toBe('hello');
  });
});

describe('sha256', () => {
  it('hashes the empty string to the known digest', async () => {
    const digest = await sha256(utf8(''));
    expect(bytesToBase64url(digest)).toBe(
      '47DEQpj8HBSa-_TImW-5JCeuQeRkm5NMpJWZG3hSuFU'
    );
  });
});

describe('concatBytes / bytesEqual', () => {
  it('concatenates in order', () => {
    const out = concatBytes(
      Uint8Array.from([1, 2]),
      Uint8Array.from([3]),
      Uint8Array.from([4, 5])
    );
    expect(Array.from(out)).toEqual([1, 2, 3, 4, 5]);
  });

  it('compares equal and unequal arrays', () => {
    expect(bytesEqual(Uint8Array.from([1, 2]), Uint8Array.from([1, 2]))).toBe(
      true
    );
    expect(bytesEqual(Uint8Array.from([1, 2]), Uint8Array.from([1, 3]))).toBe(
      false
    );
    expect(bytesEqual(Uint8Array.from([1]), Uint8Array.from([1, 2]))).toBe(
      false
    );
  });
});
