// Global Types
/**
 * Add types for native browser features
 */
declare global {
  interface Document {
    /**
     * @see https://developer.mozilla.org/docs/Web/API/Document/prerendering
     */
    prerendering?: boolean;

    /**
     * @see https://developer.chrome.com/docs/web-platform/page-lifecycle-api#new_features_added_in_chrome_68
     */
    wasDiscarded?: boolean;
  }

  /**
   * @see https://wicg.github.io/layout-instability/#sec-layout-shift-attribution
   */
  interface LayoutShiftAttribution {
    currentRect: DOMRectReadOnly;
    node?: Node;
    previousRect: DOMRectReadOnly;
  }

  /**
   * @see https://developer.mozilla.org/docs/Web/API/LayoutShift#instance_properties
   */
  interface LayoutShift extends PerformanceEntry {
    duration: 0;
    entryType: 'layout-shift';
    hadRecentInput: boolean;
    lastInputTime: DOMHighResTimeStamp;
    name: 'layout-shift';
    sources: LayoutShiftAttribution[];
    startTime: DOMHighResTimeStamp;
    value: number;
  }

  /**
   * @see https://developer.mozilla.org/docs/Web/API/PerformanceNavigationTiming/activationStart
   */
  interface PerformanceNavigationTiming {
    activationStart?: number;
  }
}

// Local Types
type MetricName = 'CLS' | 'LCP' | 'TTFB';
type MetricRating = 'good' | 'needs-improvement' | 'poor';
type NavigationType =
  | 'back-forward-cache'
  | 'back-forward'
  | 'navigate'
  | 'prerender'
  | 'reload'
  | 'restore';
type RatingThresholds = [number, number];

interface MetricPayload {
  entries: PerformanceEntry[];
  id: string;
  name: MetricName;
  navigationType: NavigationType;
  rating: MetricRating;
  value: number;
}

interface MetricPayloadCLS extends MetricPayload {
  name: 'CLS';
}

interface MetricPayloadLCP extends MetricPayload {
  entries: LargestContentfulPaint[];
  name: 'LCP';
}

interface MetricPayloadTTFB extends MetricPayload {
  name: 'TTFB';
}

type MetricPayloadUnion = MetricPayloadCLS | MetricPayloadLCP;

interface PerformanceEntryMap {
  event: PerformanceEventTiming[];
  'first-input': PerformanceEventTiming[];
  'largest-contentful-paint': LargestContentfulPaint[];
  'layout-shift': LayoutShift[];
  // 'long-animation-frame': PerformanceLongAnimationFrameTiming[];
  navigation: PerformanceNavigationTiming[];
  paint: PerformancePaintTiming[];
  resource: PerformanceResourceTiming[];
}

// Module Exports
export type {
  MetricName,
  MetricPayload,
  MetricPayloadCLS,
  MetricPayloadLCP,
  MetricPayloadTTFB,
  MetricPayloadUnion,
  MetricRating,
  NavigationType,
  PerformanceEntryMap,
  RatingThresholds,
};
