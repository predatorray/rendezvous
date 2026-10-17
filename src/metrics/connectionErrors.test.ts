import { categorizeConnectionError, errorTypeOf } from './connectionErrors';

describe('categorizeConnectionError', () => {
  it.each([
    ['network', 'network'],
    ['socket-error', 'network'],
    ['socket-closed', 'network'],
    ['server-error', 'network'],
    ['disconnected', 'network'],
    ['ssl-unavailable', 'network'],
    ['peer-unavailable', 'peerjs'],
    ['unavailable-id', 'peerjs'],
    ['invalid-id', 'peerjs'],
    ['invalid-key', 'peerjs'],
    ['webrtc', 'webrtc'],
    ['browser-incompatible', 'webrtc'],
    ['negotiation-failed', 'webrtc'],
    ['connection-closed', 'webrtc'],
  ])('maps PeerJS type %s to %s', (type, category) => {
    expect(categorizeConnectionError({ type })).toBe(category);
  });

  it('treats fetch TypeErrors as network errors', () => {
    expect(categorizeConnectionError(new TypeError('Failed to fetch'))).toBe(
      'network'
    );
  });

  it('falls back for unknown or empty errors', () => {
    expect(categorizeConnectionError({ type: 'weird' })).toBe('unknown');
    expect(categorizeConnectionError(new Error('x'), 'webrtc')).toBe('webrtc');
    expect(categorizeConnectionError(null)).toBe('unknown');
    expect(categorizeConnectionError(undefined, 'network')).toBe('network');
  });
});

describe('errorTypeOf', () => {
  it('prefers the PeerJS type, then the error name', () => {
    expect(errorTypeOf({ type: 'peer-unavailable', name: 'Error' })).toBe(
      'peer-unavailable'
    );
    expect(errorTypeOf(new TypeError('x'))).toBe('TypeError');
  });

  it('never leaks the error message', () => {
    expect(errorTypeOf({ message: 'Could not connect to rendezvous-abc' })).toBe(
      'unknown'
    );
    expect(errorTypeOf({ type: '', name: '' })).toBe('unknown');
    expect(errorTypeOf(null)).toBe('unknown');
    expect(errorTypeOf('string error')).toBe('unknown');
  });
});
