// Type Imports
import type {
  MetricName,
  MetricPayloadUnion,
  MetricRating,
  NavigationType,
  PerformanceEntryMap,
  RatingThresholds,
} from './types.mts';

// Local Variables
const metricThresholds: Record<MetricName, RatingThresholds> = {
  CLS: [0.1, 0.25],
  LCP: [2_500, 4_000],
  TTFB: [800, 1_800],
};

// Local Functions
/**
 * Create a performance metric payload object to be sent to an analytics endpoint.
 * @param name Metric name.
 * @param value Metric value.
 * @param entries `PerformanceEntry` items associated this metric.
 * @returns A `MetricPayload` object.
 */
function buildMetricPayload<T extends MetricName>(
  name: T,
  value: number,
  entries: Extract<MetricPayloadUnion, { name: T }>['entries'],
) {
  const navigationEntry = getNavigationEntry();
  let navigationType: NavigationType = 'navigate';
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- prerendering can be false
  if (document.prerendering || getActivationStart() > 0) {
    navigationType = 'prerender';
  } else if (document.wasDiscarded) {
    navigationType = 'restore';
  } else if (navigationEntry?.type) {
    navigationType = navigationEntry.type.replaceAll('_', '-') as NavigationType; // back_forward -> back-forward
  }
  return {
    entries,
    id: crypto.randomUUID(),
    name,
    navigationType,
    rating: getRating(value, name),
    value,
  } as Extract<MetricPayloadUnion, { name: T }>;
}

/**
 * Get the `DOMHighResTimeStamp` representing the duration between document prerendering start and
 * activation in milliseconds.
 * @returns `number` containing the `activationStart` value.
 */
function getActivationStart() {
  const navigationEntry = getNavigationEntry();
  return navigationEntry?.activationStart ?? 0;
}

/**
 * Get a `PerformanceNavigationTiming` object for the currently-loaded HTML document from the
 * performance timeline. If none exists, return `undefined`.
 * @returns A `PerformanceNavigationTiming` object else `undefined`.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/PerformanceNavigationTiming
 */
// eslint-disable-next-line consistent-return -- implicit undefined return ok here
function getNavigationEntry() {
  const navigationEntry = (
    performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
  )[0];

  // Check to ensure the `responseStart` property is present and valid. In some cases no value is
  // reported by the browser (for privacy/security reasons), and in other cases (bugs) the value is
  // negative or is larger than the current page time. Ignore these cases:
  // https://github.com/GoogleChrome/web-vitals/issues/137
  // https://github.com/GoogleChrome/web-vitals/issues/162
  // https://github.com/GoogleChrome/web-vitals/issues/275
  if (
    navigationEntry &&
    navigationEntry.responseStart > 0 &&
    navigationEntry.responseStart < performance.now()
  ) {
    return navigationEntry;
  }
}

/**
 * Get a metric's rating based on its current value and established thresholds.
 * @param value Current metric value.
 * @param metricName Metric name (e.g. LCP).
 * @returns A metric rating value.
 */
function getRating(value: number, metricName: MetricName): MetricRating {
  const [needsImprovementThreshold, poorThreshold] = metricThresholds[metricName];
  if (value > needsImprovementThreshold) {
    return value > poorThreshold ? 'poor' : 'needs-improvement';
  }
  return 'good';
}

/**
 * Observe performance timeline entries based on their type if they are supported by the current
 * browser. All entries are passed to a provided callback function.
 * @param type Performance entry type.
 * @param callback Callback function.
 * @param options Initialization options for the `PerformanceObserver`.
 * @returns A `PerformanceObserver` object if the provided type is supported by the current browser.
 * @see https://developer.mozilla.org/docs/Web/API/PerformanceObserver/supportedEntryTypes_static
 */
// eslint-disable-next-line consistent-return -- only return a truthy value with full support and no errors
function observe<T extends keyof PerformanceEntryMap>(
  type: T,
  callback: (entries: PerformanceEntryMap[T]) => void,
  options: PerformanceObserverInit = {},
) {
  try {
    if (PerformanceObserver.supportedEntryTypes.includes(type)) {
      const po = new PerformanceObserver((list) => {
        // Delay by a microtask to workaround a bug in Safari where the callback is invoked
        // immediately rather than in a separate task.
        // See: https://github.com/GoogleChrome/web-vitals/issues/277
        Promise.resolve()
          .then(() => {
            callback(list.getEntries() as PerformanceEntryMap[T]);
          })
          .catch(() => {});
      });
      po.observe({ buffered: true, type, ...options });
      return po;
    }
  } catch {
    // Do nothing
  }
}

/**
 * Call a function when prerendering isn't happening.
 * @param callback Callback function.
 */
function onNotPrerender(callback: () => void) {
  if (document.prerendering) {
    globalThis.addEventListener('prerenderingchange', callback, true);
  } else {
    callback();
  }
}

/**
 * Execute a callback when the page is fully loaded and not prerendering.
 * @param callback Callback function.
 */
function onPageLoad(callback: () => void) {
  if (document.prerendering) {
    onNotPrerender(() => onPageLoad(callback));
    // eslint-disable-next-line unicorn/no-negated-condition -- negation makes intent more direct/clear
  } else if (document.readyState !== 'complete') {
    globalThis.addEventListener('load', callback);
  } else {
    setTimeout(callback);
  }
}

/**
 * Execute a callback function when the browser is idle.
 * @param callback
 */
// function onIdle(callback: () => void) {
//   if (requestIdleCallback) {
//     requestIdleCallback(callback);
//   }
//   setTimeout(callback);
// }

// Module Exports
export {
  buildMetricPayload,
  getActivationStart,
  getNavigationEntry,
  getRating,
  observe,
  onNotPrerender,
  onPageLoad,
};
