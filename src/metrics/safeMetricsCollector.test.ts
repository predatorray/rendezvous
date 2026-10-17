import { MetricsCollector } from './MetricsCollector';
import { safeMetricsCollector } from './safeMetricsCollector';

const metric = { role: 'host' } as any;

describe('safeMetricsCollector', () => {
  it('forwards every method to the wrapped collector', () => {
    const inner: MetricsCollector = {
      meetingStarted: jest.fn(),
      guestJoined: jest.fn(),
      meetingEnded: jest.fn(),
      connectionError: jest.fn(),
    };
    const safe = safeMetricsCollector(inner);
    safe.meetingStarted(metric);
    safe.guestJoined(metric);
    safe.meetingEnded(metric);
    safe.connectionError(metric);
    Object.values(inner).forEach((fn) =>
      expect(fn).toHaveBeenCalledWith(metric)
    );
  });

  it('keeps `this` bound to the wrapped collector', () => {
    class Collector {
      seen: unknown[] = [];
      meetingStarted(m: unknown) {
        this.seen.push(m);
      }
    }
    const inner = new Collector();
    safeMetricsCollector(inner as any).meetingStarted(metric);
    expect(inner.seen).toEqual([metric]);
  });

  it('swallows errors thrown by the wrapped collector', () => {
    const boom = () => {
      throw new Error('boom');
    };
    const safe = safeMetricsCollector({
      meetingStarted: boom,
      guestJoined: boom,
      meetingEnded: boom,
      connectionError: boom,
    });
    expect(() => {
      safe.meetingStarted(metric);
      safe.guestJoined(metric);
      safe.meetingEnded(metric);
      safe.connectionError(metric);
    }).not.toThrow();
  });

  it('tolerates missing methods and a missing collector', () => {
    expect(() =>
      safeMetricsCollector({} as any).meetingEnded(metric)
    ).not.toThrow();
    expect(() =>
      safeMetricsCollector(undefined as any).connectionError(metric)
    ).not.toThrow();
  });
});
