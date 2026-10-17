import { GoogleAnalyticsMetricsCollector } from './GoogleAnalyticsMetricsCollector';

describe('GoogleAnalyticsMetricsCollector', () => {
  let gtag: jest.Mock;
  let collector: GoogleAnalyticsMetricsCollector;

  beforeEach(() => {
    gtag = jest.fn();
    collector = new GoogleAnalyticsMetricsCollector(() => gtag);
  });

  it('sends meeting_started', () => {
    collector.meetingStarted({ role: 'host' });
    expect(gtag).toHaveBeenCalledWith('event', 'meeting_started', {
      role: 'host',
    });
  });

  it('sends guest_joined', () => {
    collector.guestJoined({ participantCount: 3 });
    expect(gtag).toHaveBeenCalledWith('event', 'guest_joined', {
      participant_count: 3,
    });
  });

  it('sends meeting_ended with the duration in seconds', () => {
    collector.meetingEnded({
      role: 'host',
      reason: 'self-left',
      durationMs: 61_499,
      guestCount: 2,
      peakParticipants: 3,
    });
    expect(gtag).toHaveBeenCalledWith('event', 'meeting_ended', {
      role: 'host',
      reason: 'self-left',
      duration_sec: 61,
      peak_participants: 3,
      guest_count: 2,
    });
  });

  it('omits guest_count when absent and clamps negative durations', () => {
    collector.meetingEnded({
      role: 'guest',
      reason: 'kicked',
      durationMs: -5000,
      peakParticipants: 2,
    });
    expect(gtag).toHaveBeenCalledWith('event', 'meeting_ended', {
      role: 'guest',
      reason: 'kicked',
      duration_sec: 0,
      peak_participants: 2,
    });
  });

  it('sends connection_error and truncates long error types', () => {
    collector.connectionError({
      role: 'guest',
      stage: 'peer',
      category: 'peerjs',
      errorType: 'x'.repeat(150),
    });
    expect(gtag).toHaveBeenCalledWith('event', 'connection_error', {
      role: 'guest',
      stage: 'peer',
      category: 'peerjs',
      error_type: 'x'.repeat(100),
    });
  });

  it('looks gtag up on every call and skips when it disappears', () => {
    let current: any = gtag;
    collector = new GoogleAnalyticsMetricsCollector(() => current);
    current = undefined;
    expect(() => collector.meetingStarted({ role: 'host' })).not.toThrow();
    current = 'not a function';
    expect(() => collector.meetingStarted({ role: 'host' })).not.toThrow();
    expect(gtag).not.toHaveBeenCalled();
  });
});
