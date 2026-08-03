import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const mockPostHog = {
  init: vi.fn(),
  capture: vi.fn(),
  identify: vi.fn(),
  reset: vi.fn(),
  getFeatureFlag: vi.fn(),
  opt_out_capturing: vi.fn(),
};

vi.mock('posthog-js', () => ({
  default: mockPostHog,
}));

describe('analytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('does not initialize PostHog without VITE_POSTHOG_KEY', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', '');
    vi.resetModules();
    const { initAnalytics } = await import('./analytics');
    initAnalytics();
    expect(mockPostHog.init).not.toHaveBeenCalled();
  });

  it('initializes PostHog when VITE_POSTHOG_KEY is set', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'phc_test123');
    vi.resetModules();
    const { initAnalytics } = await import('./analytics');
    initAnalytics();
    expect(mockPostHog.init).toHaveBeenCalledWith(
      'phc_test123',
      expect.objectContaining({ capture_pageview: false })
    );
  });

  it('is idempotent when called multiple times', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'phc_test_idempotent');
    vi.resetModules();
    const { initAnalytics } = await import('./analytics');
    initAnalytics();
    initAnalytics();
    initAnalytics();
    expect(mockPostHog.init).toHaveBeenCalledTimes(1);
  });

  it('capture is a no-op without PostHog configured', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', '');
    vi.resetModules();
    const { capture } = await import('./analytics');
    capture('page_view', { path: '/test', title: 'Test' });
    expect(mockPostHog.capture).not.toHaveBeenCalled();
  });

  it('capture forwards events to PostHog when configured', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'phc_test_capture');
    vi.resetModules();
    const { capture, initAnalytics } = await import('./analytics');
    initAnalytics();
    capture('page_view', { path: '/test', title: 'Test' });
    expect(mockPostHog.capture).toHaveBeenCalledWith('page_view', { path: '/test', title: 'Test' });
  });

  it('capture silently handles posthog errors', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'phc_test_capture_err');
    vi.resetModules();
    mockPostHog.capture.mockImplementationOnce(() => { throw new Error('fail'); });
    const { capture, initAnalytics } = await import('./analytics');
    initAnalytics();
    expect(() => {
      capture('page_view', { path: '/test', title: 'Test' });
    }).not.toThrow();
  });

  it('identify is a no-op without PostHog configured', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', '');
    vi.resetModules();
    const { identify } = await import('./analytics');
    identify('user-123', { name: 'Alice' });
    expect(mockPostHog.identify).not.toHaveBeenCalled();
  });

  it('identify forwards to PostHog when configured', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'phc_test_identify');
    vi.resetModules();
    const { identify, initAnalytics } = await import('./analytics');
    initAnalytics();
    identify('user-1', { name: 'Bob' });
    expect(mockPostHog.identify).toHaveBeenCalledWith('user-1', { name: 'Bob' });
  });

  it('identify silently handles errors', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'phc_test_identify_err');
    vi.resetModules();
    mockPostHog.identify.mockImplementationOnce(() => { throw new Error('fail'); });
    const { identify, initAnalytics } = await import('./analytics');
    initAnalytics();
    expect(() => { identify('u', {}); }).not.toThrow();
  });

  it('resetAnalytics is a no-op without PostHog configured', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', '');
    vi.resetModules();
    const { resetAnalytics } = await import('./analytics');
    resetAnalytics();
    expect(mockPostHog.reset).not.toHaveBeenCalled();
  });

  it('resetAnalytics forwards to PostHog when configured', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'phc_test_reset');
    vi.resetModules();
    const { resetAnalytics, initAnalytics } = await import('./analytics');
    initAnalytics();
    resetAnalytics();
    expect(mockPostHog.reset).toHaveBeenCalled();
  });

  it('resetAnalytics silently handles errors', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'phc_test_reset_err');
    vi.resetModules();
    mockPostHog.reset.mockImplementationOnce(() => { throw new Error('fail'); });
    const { resetAnalytics, initAnalytics } = await import('./analytics');
    initAnalytics();
    expect(() => { resetAnalytics(); }).not.toThrow();
  });

  it('getFeatureFlag returns undefined without PostHog configured', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', '');
    vi.resetModules();
    const { getFeatureFlag } = await import('./analytics');
    expect(getFeatureFlag('test-flag')).toBeUndefined();
  });

  it('getFeatureFlag forwards to PostHog when configured', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'phc_test_flag');
    vi.resetModules();
    mockPostHog.getFeatureFlag.mockReturnValue('enabled');
    const { getFeatureFlag, initAnalytics } = await import('./analytics');
    initAnalytics();
    expect(getFeatureFlag('my-flag')).toBe('enabled');
  });

  it('getFeatureFlag returns undefined on error', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'phc_test_flag_err');
    vi.resetModules();
    mockPostHog.getFeatureFlag.mockImplementationOnce(() => { throw new Error('fail'); });
    const { getFeatureFlag, initAnalytics } = await import('./analytics');
    initAnalytics();
    expect(getFeatureFlag('my-flag')).toBeUndefined();
  });

  it('getActiveExperimentVariant returns undefined without PostHog configured', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', '');
    vi.resetModules();
    const { getActiveExperimentVariant } = await import('./analytics');
    expect(getActiveExperimentVariant('test-experiment')).toBeUndefined();
  });

  it('getActiveExperimentVariant returns string from server when available', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'phc_test_exp');
    vi.resetModules();
    mockPostHog.getFeatureFlag.mockReturnValue('variant-b');
    const { getActiveExperimentVariant, initAnalytics } = await import('./analytics');
    initAnalytics();
    expect(getActiveExperimentVariant('some-experiment')).toBe('variant-b');
  });

  it('getActiveExperimentVariant returns undefined for non-string values', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'phc_test_exp_bool');
    vi.resetModules();
    mockPostHog.getFeatureFlag.mockReturnValue(true);
    const { getActiveExperimentVariant, initAnalytics } = await import('./analytics');
    initAnalytics();
    expect(getActiveExperimentVariant('some-experiment')).toBeUndefined();
  });

  it('getActiveExperimentVariant returns undefined on error', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'phc_test_exp_err');
    vi.resetModules();
    mockPostHog.getFeatureFlag.mockImplementationOnce(() => { throw new Error('fail'); });
    const { getActiveExperimentVariant, initAnalytics } = await import('./analytics');
    initAnalytics();
    expect(getActiveExperimentVariant('some-experiment')).toBeUndefined();
  });

  it('getPostHog returns null without PostHog configured', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', '');
    vi.resetModules();
    const { getPostHog } = await import('./analytics');
    expect(getPostHog()).toBeNull();
  });

  it('getPostHog returns posthog instance when configured', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'phc_test_ph');
    vi.resetModules();
    const { getPostHog, initAnalytics } = await import('./analytics');
    initAnalytics();
    const ph = getPostHog();
    expect(ph).not.toBeNull();
    expect(ph).toBe(mockPostHog);
  });

  it('initAnalytics handles init failure gracefully', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'phc_test_init_fail');
    vi.resetModules();
    mockPostHog.init.mockImplementationOnce(() => { throw new Error('init failed'); });
    const { initAnalytics } = await import('./analytics');
    expect(() => initAnalytics()).not.toThrow();
  });

  it('initAnalytics disables capturing in dev mode', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'phc_test_dev');
    vi.resetModules();
    const { initAnalytics } = await import('./analytics');
    initAnalytics();
    const initArgs = mockPostHog.init.mock.calls[0];
    const loadedFn = initArgs[1].loaded;
    loadedFn(mockPostHog);
    expect(mockPostHog.opt_out_capturing).toHaveBeenCalled();
  });
});
