import {
  Gtag,
  GoogleAnalyticsMetricsCollector,
} from './GoogleAnalyticsMetricsCollector';
import { MetricsCollector } from './MetricsCollector';
import { NoopMetricsCollector } from './NoopMetricsCollector';
import { safeMetricsCollector } from './safeMetricsCollector';

export * from './MetricsCollector';
export { GoogleAnalyticsMetricsCollector } from './GoogleAnalyticsMetricsCollector';
export { NoopMetricsCollector } from './NoopMetricsCollector';
export { safeMetricsCollector } from './safeMetricsCollector';
export { categorizeConnectionError, errorTypeOf } from './connectionErrors';

function readGtag(): Gtag | undefined {
  try {
    const gtag = (window as unknown as { gtag?: unknown }).gtag;
    return typeof gtag === 'function' ? (gtag as Gtag) : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Picks the Google Analytics collector when gtag is loaded (production builds
 * with REACT_APP_GA_ID set) and a no-op otherwise. The result is always
 * wrapped so it never throws.
 */
export function createMetricsCollector(): MetricsCollector {
  const inner = readGtag()
    ? new GoogleAnalyticsMetricsCollector(readGtag)
    : new NoopMetricsCollector();
  return safeMetricsCollector(inner);
}
