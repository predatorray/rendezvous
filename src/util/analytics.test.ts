import { trackEvent } from './analytics';

describe('trackEvent', () => {
  afterEach(() => {
    delete (window as any).gtag;
  });

  it('forwards the event to gtag', () => {
    const gtag = jest.fn();
    (window as any).gtag = gtag;
    trackEvent('meeting_feedback', { rating: 'up' });
    expect(gtag).toHaveBeenCalledWith('event', 'meeting_feedback', {
      rating: 'up',
    });
  });

  it('is a no-op when gtag is missing', () => {
    expect(() => trackEvent('meeting_feedback')).not.toThrow();
  });

  it('swallows errors thrown by gtag', () => {
    (window as any).gtag = () => {
      throw new Error('blocked');
    };
    expect(() => trackEvent('meeting_feedback')).not.toThrow();
  });
});
