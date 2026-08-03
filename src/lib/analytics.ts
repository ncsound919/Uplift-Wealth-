import posthog from 'posthog-js';

type EventMap = {
  page_view: { path: string; title: string };
  lesson_start: { moduleId: string; lessonId: string };
  lesson_complete: { moduleId: string; lessonId: string; timeSpent?: number };
  quiz_attempt: { moduleId: string; score: number; passed: boolean };
  game_start: { gameType: string };
  game_complete: { gameType: string; score?: number; timeSpent?: number };
  module_complete: { moduleId: string };
  certificate_download: { moduleId: string };
  sign_in: { method?: string };
  sign_up: {};
  search: { query: string; resultsCount: number };
  experiment_viewed: { experiment: string; variant: string };
  experiment_converted: { experiment: string; variant: string };
};

const POSTHOG_KEY = (() => {
  try {
    return import.meta.env.VITE_POSTHOG_KEY as string | undefined;
  } catch {
    /* v8 ignore next -- @preserve import.meta.env never throws in supported runtimes */
    return undefined;
  }
})();
const POSTHOG_HOST = (() => {
  try {
    return import.meta.env.VITE_POSTHOG_HOST as string | undefined;
  } catch {
    /* v8 ignore next -- @preserve import.meta.env never throws in supported runtimes */
    return undefined;
  }
})();
const isDev = (() => {
  try {
    return import.meta.env.DEV;
  } catch {
    /* v8 ignore next -- @preserve import.meta.env never throws in supported runtimes */
    return false;
  }
})();

let initialized = false;

export function initAnalytics() {
  if (initialized) return;
  initialized = true;

  if (!POSTHOG_KEY) {
    console.log('[Analytics] Disabled (no VITE_POSTHOG_KEY)');
    return;
  }

  try {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST || 'https://us.i.posthog.com',
      loaded: (ph) => {
        if (isDev) ph.opt_out_capturing();
      },
      capture_pageview: false,
    });
  } catch {
    console.warn('[Analytics] Failed to initialize PostHog');
  }
}

export function getPostHog() {
  return POSTHOG_KEY ? posthog : null;
}

export function capture<E extends keyof EventMap>(event: E, properties: EventMap[E]) {
  if (!POSTHOG_KEY || !initialized) return;
  try {
    posthog.capture(event, properties);
  } catch {
    // silent
  }
}

export function identify(userId: string, traits?: Record<string, unknown>) {
  if (!POSTHOG_KEY || !initialized) return;
  try {
    posthog.identify(userId, traits);
  } catch {
    // silent
  }
}

export function resetAnalytics() {
  if (!POSTHOG_KEY || !initialized) return;
  try {
    posthog.reset();
  } catch {
    // silent
  }
}

export function getFeatureFlag(key: string): string | boolean | undefined {
  if (!POSTHOG_KEY || !initialized) return undefined;
  try {
    return posthog.getFeatureFlag(key);
  } catch {
    return undefined;
  }
}

export function getActiveExperimentVariant(experimentKey: string): string | undefined {
  if (!POSTHOG_KEY || !initialized) return undefined;
  try {
    const variant = posthog.getFeatureFlag(experimentKey);
    return typeof variant === 'string' ? variant : undefined;
  } catch {
    return undefined;
  }
}
