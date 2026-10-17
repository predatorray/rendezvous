import { createMetricsCollector } from '.';

describe('createMetricsCollector', () => {
  afterEach(() => {
    delete (window as any).gtag;
  });

  it('publishes to gtag when it is loaded', () => {
    const gtag = jest.fn();
    (window as any).gtag = gtag;
    createMetricsCollector().meetingStarted({ role: 'host' });
    expect(gtag).toHaveBeenCalledWith('event', 'meeting_started', {
      role: 'host',
    });
  });

  it('falls back to a no-op when gtag is missing', () => {
    const c = createMetricsCollector();
    // Defining gtag later must not make the no-op start publishing.
    const gtag = jest.fn();
    (window as any).gtag = gtag;
    c.meetingStarted({ role: 'host' });
    expect(gtag).not.toHaveBeenCalled();
  });

  it('falls back to a no-op when gtag is not a function', () => {
    (window as any).gtag = {};
    expect(() =>
      createMetricsCollector().meetingStarted({ role: 'host' })
    ).not.toThrow();
  });

  it('keeps working when gtag is removed after creation', () => {
    (window as any).gtag = jest.fn();
    const c = createMetricsCollector();
    delete (window as any).gtag;
    expect(() => c.guestJoined({ participantCount: 2 })).not.toThrow();
  });

  it('never throws even if gtag throws', () => {
    (window as any).gtag = () => {
      throw new Error('blocked');
    };
    expect(() =>
      createMetricsCollector().connectionError({
        role: 'guest',
        stage: 'peer',
        category: 'network',
        errorType: 'network',
      })
    ).not.toThrow();
  });

  it('never throws when reading gtag throws', () => {
    Object.defineProperty(window, 'gtag', {
      configurable: true,
      get() {
        throw new Error('denied');
      },
    });
    expect(() =>
      createMetricsCollector().meetingStarted({ role: 'host' })
    ).not.toThrow();
  });
});
