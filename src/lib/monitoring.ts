import * as Sentry from '@sentry/react';

interface MonitoringConfig {
  dsn?: string;
  enabled: boolean;
  environment: 'development' | 'production' | 'staging';
  release?: string;
  tracesSampleRate: number;
}

let initialized = false;

export function initMonitoring(config?: Partial<MonitoringConfig>) {
  if (initialized) return;

  const dsn = config?.dsn || (import.meta as any).env?.VITE_SENTRY_DSN as string | undefined;
  const env = (config?.environment || (import.meta as any).env?.MODE || 'production') as MonitoringConfig['environment'];
  const enabled = !!dsn && (config?.enabled ?? env === 'production');

  if (!enabled) {
    console.info('[Monitoring] Sentry disabled (no DSN configured)');
    initialized = true;
    return;
  }

  Sentry.init({
    dsn,
    environment: env,
    release: config?.release,
    tracesSampleRate: config?.tracesSampleRate ?? 0.1,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    beforeSend(event) {
      if (event.exception?.values?.[0]?.value?.includes('ResizeObserver loop')) {
        return null;
      }
      return event;
    },
  });

  initialized = true;
  console.info('[Monitoring] Sentry initialized', { environment: env });
}

export function captureError(error: Error, context?: Record<string, unknown>) {
  if (!initialized) return;
  Sentry.captureException(error, {
    extra: context,
  });
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: Record<string, unknown>) {
  if (!initialized) return;
  Sentry.captureMessage(message, {
    level,
    extra: context,
  });
}

export function setUser(user: { id: string; email?: string; username?: string }) {
  if (!initialized) return;
  Sentry.setUser(user);
}

export function clearUser() {
  if (!initialized) return;
  Sentry.setUser(null);
}

export function addBreadcrumb(breadcrumb: { message: string; category?: string; data?: Record<string, unknown> }) {
  if (!initialized) return;
  Sentry.addBreadcrumb(breadcrumb);
}

export const ErrorBoundary = Sentry.ErrorBoundary;

export function reportWebVitals(metric: { name: string; value: number; id?: string; rating?: string }) {
  if (!initialized) {
    if (typeof console !== 'undefined') {
      console.info('[WebVital]', metric);
    }
    return;
  }
  Sentry.captureMessage(`Web Vital: ${metric.name}`, {
    level: 'info',
    extra: metric,
  });
}
