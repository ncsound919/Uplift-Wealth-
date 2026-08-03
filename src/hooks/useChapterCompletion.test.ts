import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useChapterCompletion } from './useChapterCompletion';
import { storageKeys } from '../lib/storage';

describe('useChapterCompletion', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('starts empty when nothing is stored', () => {
    const { result } = renderHook(() => useChapterCompletion());
    expect(result.current.completed).toEqual([]);
    expect(result.current.isComplete('ch1')).toBe(false);
  });

  it('loads existing completions from storage', () => {
    localStorage.setItem(storageKeys.wealthChaptersCompleted, JSON.stringify(['ch1', 'ch2']));
    const { result } = renderHook(() => useChapterCompletion());
    expect(result.current.completed).toEqual(['ch1', 'ch2']);
    expect(result.current.isComplete('ch1')).toBe(true);
    expect(result.current.isComplete('ch3')).toBe(false);
  });

  it('starts empty when stored JSON is corrupt', () => {
    localStorage.setItem(storageKeys.wealthChaptersCompleted, '{not valid json');
    const { result } = renderHook(() => useChapterCompletion());
    expect(result.current.completed).toEqual([]);
  });

  it('markComplete adds an id and persists it', () => {
    const { result } = renderHook(() => useChapterCompletion());
    act(() => {
      result.current.markComplete('ch1');
    });
    expect(result.current.isComplete('ch1')).toBe(true);
    expect(result.current.completed).toContain('ch1');
    expect(JSON.parse(localStorage.getItem(storageKeys.wealthChaptersCompleted) || '[]')).toContain('ch1');
  });

  it('markComplete is idempotent', () => {
    const { result } = renderHook(() => useChapterCompletion());
    act(() => {
      result.current.markComplete('ch1');
      result.current.markComplete('ch1');
    });
    expect(result.current.completed).toEqual(['ch1']);
  });

  it('reset clears completions and storage', () => {
    localStorage.setItem(storageKeys.wealthChaptersCompleted, JSON.stringify(['ch1', 'ch2']));
    const { result } = renderHook(() => useChapterCompletion());
    act(() => {
      result.current.reset();
    });
    expect(result.current.completed).toEqual([]);
    expect(localStorage.getItem(storageKeys.wealthChaptersCompleted)).toBeNull();
  });

  it('syncs with storage events for the same key', () => {
    const { result } = renderHook(() => useChapterCompletion());
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', {
        key: storageKeys.wealthChaptersCompleted,
        newValue: JSON.stringify(['ch9']),
      }));
    });
    expect(result.current.isComplete('ch9')).toBe(true);
  });

  it('ignores storage events for other keys', () => {
    const { result } = renderHook(() => useChapterCompletion());
    act(() => {
      result.current.markComplete('ch1');
    });
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'some-other-key',
        newValue: JSON.stringify(['ch9']),
      }));
    });
    expect(result.current.isComplete('ch1')).toBe(true);
    expect(result.current.isComplete('ch9')).toBe(false);
  });

  it('clears state on storage event with invalid JSON', () => {
    const { result } = renderHook(() => useChapterCompletion());
    act(() => {
      result.current.markComplete('ch1');
    });
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', {
        key: storageKeys.wealthChaptersCompleted,
        newValue: '{bad',
      }));
    });
    expect(result.current.completed).toEqual([]);
  });

  it('removes the storage listener on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useChapterCompletion());
    unmount();
    expect(removeSpy).toHaveBeenCalledWith('storage', expect.any(Function));
    removeSpy.mockRestore();
  });
});
