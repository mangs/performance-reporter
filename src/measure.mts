// Internal Imports
import {
  buildMetricPayload,
  getActivationStart,
  getNavigationEntry,
  observe,
  onNotPrerender,
  onPageLoad,
} from './utils.mts';

// Type Imports
import type { MetricPayloadCLS, MetricPayloadLCP, MetricPayloadTTFB } from './types.mts';

// Local Functions
/**
 * Measure Content Layout Shift.
 * @param onReport Reporter function.
 * @see https://web.dev/articles/cls
 */
function measureCLS(onReport: (payload: MetricPayloadCLS) => void) {
  onNotPrerender(() => {
    const po = observe('layout-shift', (entries) => {
      console.log('ENTRIES', entries);
      for (const entry of entries) {
        // if (entry.hadRecentInput) {
        //   continue; // eslint-disable-line no-continue -- skip shifts with recent input
        // }
        console.log('CLS VALUE', entry.value);
      }
      // po!.disconnect();
    });
  });
}

/**
 * Measure Largest Contentful Paint.
 * @param onReport Reporter function.
 * @see https://web.dev/articles/lcp
 */
function measureLCP(onReport: (payload: MetricPayloadLCP) => void) {
  onNotPrerender(() => {
    const po = observe('largest-contentful-paint', (entries) => {
      const lastEntry = entries.at(-1);
      if (lastEntry) {
        const value = Math.max(0, lastEntry.startTime - getActivationStart());
        const lcpPayload = buildMetricPayload('LCP', value, [lastEntry]);
        onReport(lcpPayload);
        po!.disconnect();
      }
    });
  });
}

function measureTTFB(onReport: (payload: MetricPayloadTTFB) => void) {
  onPageLoad(() => {
    const navigationEntry = getNavigationEntry();
    if (!navigationEntry) {
      return;
    }
    const value = Math.max(0, navigationEntry.responseStart - getActivationStart());
    const ttfbPayload = buildMetricPayload('TTFB', value, [navigationEntry]);
  });
}

// Module Exports
export { measureCLS, measureLCP };
