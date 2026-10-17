import { MetricsCollector } from './MetricsCollector';

const METHODS: Array<keyof MetricsCollector> = [
  'meetingStarted',
  'guestJoined',
  'meetingEnded',
  'connectionError',
];

/**
 * Wraps a collector so that publishing can never break the caller: missing
 * methods are skipped and anything thrown is swallowed.
 */
export function safeMetricsCollector(inner: MetricsCollector): MetricsCollector {
  const safe = {} as Record<keyof MetricsCollector, (metric: any) => void>;
  METHODS.forEach((method) => {
    safe[method] = (metric) => {
      try {
        const fn = (inner as any)?.[method];
        if (typeof fn === 'function') fn.call(inner, metric);
      } catch {}
    };
  });
  return safe as MetricsCollector;
}
