import { MetricsCollector } from './MetricsCollector';

/** Drops every metric. Used when no analytics backend is available. */
export class NoopMetricsCollector implements MetricsCollector {
  meetingStarted(): void {}
  guestJoined(): void {}
  meetingEnded(): void {}
  connectionError(): void {}
}
