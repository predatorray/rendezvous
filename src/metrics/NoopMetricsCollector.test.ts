import { NoopMetricsCollector } from './NoopMetricsCollector';

describe('NoopMetricsCollector', () => {
  it('accepts every metric without doing anything', () => {
    const c = new NoopMetricsCollector();
    expect(() => {
      c.meetingStarted();
      c.guestJoined();
      c.meetingEnded();
      c.connectionError();
    }).not.toThrow();
  });
});
