import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('@sentry/react', () => ({
  init: vi.fn(),
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  setUser: vi.fn(),
  addBreadcrumb: vi.fn(),
  browserTracingIntegration: vi.fn(),
  replayIntegration: vi.fn(),
  ErrorBoundary: () => null,
}));

describe('monitoring', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('captureError returns early when not initialized', async () => {
    const { captureError } = await import('./monitoring');
    const Sentry = await import('@sentry/react');
    captureError(new Error('test'));
    expect(Sentry.captureException).not.toHaveBeenCalled();
  });

  it('captureMessage returns early when not initialized', async () => {
    const { captureMessage } = await import('./monitoring');
    const Sentry = await import('@sentry/react');
    captureMessage('test message');
    expect(Sentry.captureMessage).not.toHaveBeenCalled();
  });

  it('setUser and clearUser return early when not initialized', async () => {
    const { setUser, clearUser } = await import('./monitoring');
    const Sentry = await import('@sentry/react');
    setUser({ id: '123' });
    expect(Sentry.setUser).not.toHaveBeenCalled();
    clearUser();
    expect(Sentry.setUser).not.toHaveBeenCalledWith(null);
  });

  it('addBreadcrumb returns early when not initialized', async () => {
    const { addBreadcrumb } = await import('./monitoring');
    const Sentry = await import('@sentry/react');
    addBreadcrumb({ message: 'test' });
    expect(Sentry.addBreadcrumb).not.toHaveBeenCalled();
  });

  it('reportWebVitals logs to console before init', async () => {
    const { reportWebVitals } = await import('./monitoring');
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    reportWebVitals({ name: 'LCP', value: 1200, id: 'abc', rating: 'good' });
    expect(infoSpy).toHaveBeenCalledWith('[WebVital]', { name: 'LCP', value: 1200, id: 'abc', rating: 'good' });
    infoSpy.mockRestore();
  });

  it('reportWebVitals returns early when not initialized', async () => {
    const { reportWebVitals } = await import('./monitoring');
    const Sentry = await import('@sentry/react');
    reportWebVitals({ name: 'LCP', value: 1200 });
    expect(Sentry.captureMessage).not.toHaveBeenCalled();
  });

  it('initializes gracefully without DSN', async () => {
    const { initMonitoring } = await import('./monitoring');
    const Sentry = await import('@sentry/react');
    initMonitoring();
    expect(Sentry.init).not.toHaveBeenCalled();
  });

  it('can be called multiple times without error', async () => {
    const { initMonitoring } = await import('./monitoring');
    initMonitoring();
    initMonitoring();
    initMonitoring();
    expect(true).toBe(true);
  });

  describe('with Sentry DSN configured', () => {
    beforeEach(() => {
      vi.resetModules();
    });

    it('calls Sentry.init with DSN and enabled config', async () => {
      const { initMonitoring } = await import('./monitoring');
      const Sentry = await import('@sentry/react');
      initMonitoring({ dsn: 'https://key@sentry.io/project', enabled: true });
      expect(Sentry.init).toHaveBeenCalledTimes(1);
      expect(Sentry.init).toHaveBeenCalledWith(expect.objectContaining({
        dsn: 'https://key@sentry.io/project',
      }));
    });

    it('does not call Sentry.init when enabled is false despite DSN', async () => {
      const { initMonitoring } = await import('./monitoring');
      const Sentry = await import('@sentry/react');
      initMonitoring({ dsn: 'https://key@sentry.io/project', enabled: false });
      expect(Sentry.init).not.toHaveBeenCalled();
    });

    it('does not call Sentry.init in development environment without explicit enabled', async () => {
      const { initMonitoring } = await import('./monitoring');
      const Sentry = await import('@sentry/react');
      initMonitoring({ dsn: 'https://key@sentry.io/project', environment: 'development' });
      expect(Sentry.init).not.toHaveBeenCalled();
    });

    it('filters ResizeObserver loop errors in beforeSend', async () => {
      const { initMonitoring } = await import('./monitoring');
      const Sentry = await import('@sentry/react');
      initMonitoring({ dsn: 'https://key@sentry.io/project', enabled: true });
      const opts = vi.mocked(Sentry.init).mock.calls[0][0] as any;
      const resizeEvent = { exception: { values: [{ value: 'ResizeObserver loop limit exceeded' }] } };
      expect(opts.beforeSend(resizeEvent)).toBeNull();
      const normalEvent = { exception: { values: [{ value: 'Some error' }] } };
      expect(opts.beforeSend(normalEvent)).toEqual(normalEvent);
    });

    it('captureError sends exception with context', async () => {
      const { initMonitoring, captureError } = await import('./monitoring');
      const Sentry = await import('@sentry/react');
      initMonitoring({ dsn: 'https://key@sentry.io/project', enabled: true });
      vi.clearAllMocks();
      captureError(new Error('test error'), { userId: '123' });
      expect(Sentry.captureException).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({ extra: { userId: '123' } }),
      );
    });

    it('captureMessage sends message with different levels', async () => {
      const { initMonitoring, captureMessage } = await import('./monitoring');
      const Sentry = await import('@sentry/react');
      initMonitoring({ dsn: 'https://key@sentry.io/project', enabled: true });
      vi.clearAllMocks();
      captureMessage('info message', 'info');
      expect(Sentry.captureMessage).toHaveBeenCalledWith('info message', expect.objectContaining({ level: 'info' }));
      captureMessage('warning message', 'warning');
      expect(Sentry.captureMessage).toHaveBeenCalledWith('warning message', expect.objectContaining({ level: 'warning' }));
      captureMessage('error message', 'error');
      expect(Sentry.captureMessage).toHaveBeenCalledWith('error message', expect.objectContaining({ level: 'error' }));
    });

    it('setUser and clearUser work after init', async () => {
      const { initMonitoring, setUser, clearUser } = await import('./monitoring');
      const Sentry = await import('@sentry/react');
      initMonitoring({ dsn: 'https://key@sentry.io/project', enabled: true });
      vi.clearAllMocks();
      setUser({ id: '123', email: 'a@b.com' });
      expect(Sentry.setUser).toHaveBeenCalledWith({ id: '123', email: 'a@b.com' });
      clearUser();
      expect(Sentry.setUser).toHaveBeenCalledWith(null);
    });

    it('addBreadcrumb works after init', async () => {
      const { initMonitoring, addBreadcrumb } = await import('./monitoring');
      const Sentry = await import('@sentry/react');
      initMonitoring({ dsn: 'https://key@sentry.io/project', enabled: true });
      vi.clearAllMocks();
      addBreadcrumb({ message: 'test', category: 'ui', data: { x: 1 } });
      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({ message: 'test', category: 'ui', data: { x: 1 } });
    });

    it('reportWebVitals sends Sentry.captureMessage after init', async () => {
      const { initMonitoring, reportWebVitals } = await import('./monitoring');
      const Sentry = await import('@sentry/react');
      initMonitoring({ dsn: 'https://key@sentry.io/project', enabled: true });
      vi.clearAllMocks();
      reportWebVitals({ name: 'LCP', value: 1200, id: 'abc', rating: 'good' });
      expect(Sentry.captureMessage).toHaveBeenCalledWith('Web Vital: LCP', expect.objectContaining({ level: 'info' }));
    });

    it('ErrorBoundary is re-exported from Sentry', async () => {
      const mod = await import('./monitoring');
      const Sentry = await import('@sentry/react');
      expect(mod.ErrorBoundary).toBe(Sentry.ErrorBoundary);
    });

    it('initMonitoring is idempotent when called multiple times with DSN', async () => {
      const { initMonitoring } = await import('./monitoring');
      const Sentry = await import('@sentry/react');
      initMonitoring({ dsn: 'https://key@sentry.io/project', enabled: true });
      initMonitoring({ dsn: 'https://key@sentry.io/project', enabled: true });
      expect(Sentry.init).toHaveBeenCalledTimes(1);
    });

    it('captureError works without extra context', async () => {
      const { initMonitoring, captureError } = await import('./monitoring');
      const Sentry = await import('@sentry/react');
      initMonitoring({ dsn: 'https://key@sentry.io/project', enabled: true });
      vi.clearAllMocks();
      captureError(new Error('simple error'));
      expect(Sentry.captureException).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({}),
      );
    });

    it('setUser works with minimal fields', async () => {
      const { initMonitoring, setUser } = await import('./monitoring');
      const Sentry = await import('@sentry/react');
      initMonitoring({ dsn: 'https://key@sentry.io/project', enabled: true });
      vi.clearAllMocks();
      setUser({ id: '123' });
      expect(Sentry.setUser).toHaveBeenCalledWith({ id: '123' });
    });
  });
});
