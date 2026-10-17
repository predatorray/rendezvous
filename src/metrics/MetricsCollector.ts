/**
 * App-level metrics, independent of the backend they are published to.
 *
 * Implementations must be fire-and-forget: callers never await them and the
 * meeting flow must keep working even if publishing fails. Wrap any
 * implementation with `safeMetricsCollector` to guarantee that.
 */

export type MeetingRole = 'host' | 'guest';

export type MeetingEndReason =
  | 'host-left'
  | 'self-left'
  | 'kicked'
  | 'error'
  | 'page-closed';

/**
 * Coarse bucket for why a connection could not be established or was lost.
 *  - network: signaling server / socket / ICE credential fetch problems
 *  - peerjs:  broker-level rejections (unknown peer, id taken, bad key, ...)
 *  - webrtc:  browser WebRTC failures (unsupported, negotiation, ICE, ...)
 *  - unknown: anything we could not classify
 */
export type ConnectionErrorCategory = 'network' | 'peerjs' | 'webrtc' | 'unknown';

/** Where in the meeting lifecycle a connection error was observed. */
export type ConnectionErrorStage =
  | 'ice-servers'
  | 'start'
  | 'peer'
  | 'data-connection'
  | 'media-call';

export interface MeetingStartedMetric {
  role: MeetingRole;
}

export interface GuestJoinedMetric {
  /** Participants in the meeting (including host) right after joining. */
  participantCount: number;
}

export interface MeetingEndedMetric {
  role: MeetingRole;
  reason: MeetingEndReason;
  durationMs: number;
  /** Host only: distinct guests that joined during the meeting. */
  guestCount?: number;
  /** Most participants (including host) seen at once. */
  peakParticipants: number;
}

export interface ConnectionErrorMetric {
  role: MeetingRole;
  stage: ConnectionErrorStage;
  category: ConnectionErrorCategory;
  /** Short machine-readable error code, e.g. PeerJS `err.type`. */
  errorType: string;
}

export interface MetricsCollector {
  /** Host's meeting is open and accepting guests. */
  meetingStarted(metric: MeetingStartedMetric): void;
  /** A guest got the host's welcome, i.e. joined successfully. */
  guestJoined(metric: GuestJoinedMetric): void;
  /** A meeting that was live for this participant has ended. */
  meetingEnded(metric: MeetingEndedMetric): void;
  /** A connection could not be established or failed. */
  connectionError(metric: ConnectionErrorMetric): void;
}
