type Gtag = (...args: unknown[]) => void;

// Fire-and-forget Google Analytics event. Analytics must never break the
// app, so a missing/blocked gtag or any thrown error is silently ignored.
export function trackEvent(
  name: string,
  params: Record<string, string | number | boolean> = {}
): void {
  try {
    const gtag = (window as unknown as { gtag?: Gtag }).gtag;
    if (typeof gtag === 'function') gtag('event', name, params);
  } catch {}
}
