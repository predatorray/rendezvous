import { MetricsCollector } from './MetricsCollector';

// A Record keyed by the interface, so adding a metric without listing it
// here is a type error.
const METHODS: Record<keyof MetricsCollector, true> = {
  meetingStarted: true,
  guestJoined: true,
  meetingEnded: true,
  connectionError: true,
};

/**
 * Wraps a collector so that publishing can never break the caller: missing
 * methods are skipped and anything thrown is swallowed.
 */
export function safeMetricsCollector(inner: MetricsCollector): MetricsCollector {
  const safe = {} as Record<keyof MetricsCollector, (metric: any) => void>;
  (Object.keys(METHODS) as Array<keyof MetricsCollector>).forEach((method) => {
    safe[method] = (metric) => {
      try {
        const fn = (inner as any)?.[method];
        if (typeof fn === 'function') fn.call(inner, metric);
      } catch {}
    };
  });
  return safe as MetricsCollector;
}
