import '@testing-library/jest-dom';
import { TextDecoder, TextEncoder } from 'util';

if (typeof (global as any).TextEncoder === 'undefined') {
  (global as any).TextEncoder = TextEncoder;
}
if (typeof (global as any).TextDecoder === 'undefined') {
  (global as any).TextDecoder = TextDecoder;
}

if (!('ResizeObserver' in window)) {
  (window as any).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// jsdom doesn't ship WebCrypto's SubtleCrypto, which the verified-meeting
// code relies on. Borrow Node's implementation so those modules (and their
// tests) have real getRandomValues + subtle.
{
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const nodeCrypto = require('crypto').webcrypto;
  const existing = (window as any).crypto;
  if (!existing || !existing.subtle) {
    (window as any).crypto = nodeCrypto;
  }
  if (typeof (global as any).crypto === 'undefined') {
    (global as any).crypto = (window as any).crypto;
  }
}
