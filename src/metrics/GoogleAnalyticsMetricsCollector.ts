import {
  ConnectionErrorMetric,
  GuestJoinedMetric,
  MeetingEndedMetric,
  MeetingStartedMetric,
  MetricsCollector,
} from './MetricsCollector';

export type Gtag = (...args: unknown[]) => void;

type Params = Record<string, string | number | boolean>;

// GA4 drops event parameter values longer than 100 characters.
const MAX_PARAM_LENGTH = 100;

/**
 * Publishes metrics as GA4 events through the global `gtag` loaded in
 * public/index.html. The function is looked up on every call so that a gtag
 * removed (or replaced) after construction is handled gracefully.
 */
export class GoogleAnalyticsMetricsCollector implements MetricsCollector {
  private readonly getGtag: () => Gtag | undefined;

  constructor(getGtag: () => Gtag | undefined) {
    this.getGtag = getGtag;
  }

  meetingStarted({ role }: MeetingStartedMetric): void {
    this.send('meeting_started', { role });
  }

  guestJoined({ participantCount }: GuestJoinedMetric): void {
    this.send('guest_joined', { participant_count: participantCount });
  }

  meetingEnded({
    role,
    reason,
    durationMs,
    guestCount,
    peakParticipants,
  }: MeetingEndedMetric): void {
    const params: Params = {
      role,
      reason,
      duration_sec: Math.max(0, Math.round(durationMs / 1000)),
      peak_participants: peakParticipants,
    };
    if (guestCount !== undefined) params.guest_count = guestCount;
    this.send('meeting_ended', params);
  }

  connectionError({
    role,
    stage,
    category,
    errorType,
  }: ConnectionErrorMetric): void {
    this.send('connection_error', {
      role,
      stage,
      category,
      error_type: errorType.slice(0, MAX_PARAM_LENGTH),
    });
  }

  private send(name: string, params: Params): void {
    const gtag = this.getGtag();
    if (typeof gtag === 'function') gtag('event', name, params);
  }
}
