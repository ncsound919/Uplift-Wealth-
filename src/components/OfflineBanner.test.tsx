import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { OfflineBanner } from './OfflineBanner';

const mocks = vi.hoisted(() => ({
  flushPendingStats: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('../lib/apiClient', () => ({ apiClient: { flushPendingStats: mocks.flushPendingStats } }));

describe('OfflineBanner', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    mocks.flushPendingStats.mockClear();
  });

  it('renders nothing when online', () => {
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: true });
    const { container } = render(<OfflineBanner />);
    expect(container.innerHTML).toBe('');
  });

  it('appears when the browser goes offline', () => {
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: true });
    const { container } = render(<OfflineBanner />);
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(container.textContent).toContain('offline');
  });

  it('flushes pending stats when back online and hides itself', () => {
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: true });
    const { container } = render(<OfflineBanner />);
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    expect(mocks.flushPendingStats).toHaveBeenCalled();
    expect(container.innerHTML).toBe('');
  });
});
