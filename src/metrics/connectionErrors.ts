import { ConnectionErrorCategory } from './MetricsCollector';

// PeerJS error types (PeerErrorType / BaseConnectionErrorType) by category.
const CATEGORY_BY_TYPE: Record<string, ConnectionErrorCategory> = {
  network: 'network',
  disconnected: 'network',
  'server-error': 'network',
  'socket-error': 'network',
  'socket-closed': 'network',
  'ssl-unavailable': 'network',
  'peer-unavailable': 'peerjs',
  'unavailable-id': 'peerjs',
  'invalid-id': 'peerjs',
  'invalid-key': 'peerjs',
  webrtc: 'webrtc',
  'browser-incompatible': 'webrtc',
  'negotiation-failed': 'webrtc',
  'connection-closed': 'webrtc',
  'not-open-yet': 'webrtc',
  'message-too-big': 'webrtc',
};

/**
 * A short code identifying the error without leaking its message (which may
 * contain peer ids / meeting codes): PeerJS `type`, else the error `name`.
 */
export function errorTypeOf(err: unknown): string {
  const e = err as { type?: unknown; name?: unknown } | null | undefined;
  if (e && typeof e.type === 'string' && e.type) return e.type;
  if (e && typeof e.name === 'string' && e.name) return e.name;
  return 'unknown';
}

export function categorizeConnectionError(
  err: unknown,
  fallback: ConnectionErrorCategory = 'unknown'
): ConnectionErrorCategory {
  const e = err as { type?: unknown; name?: unknown } | null | undefined;
  if (e && typeof e.type === 'string' && CATEGORY_BY_TYPE[e.type]) {
    return CATEGORY_BY_TYPE[e.type];
  }
  // fetch() rejects with a TypeError when the network is unreachable.
  if (e && e.name === 'TypeError') return 'network';
  return fallback;
}
