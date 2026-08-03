import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  safeGetItem,
  safeSetItem,
  safeRemoveItem,
  getJSON,
  setJSON,
  getNumber,
  getString,
  storageKeys,
} from './storage';

describe('storage utilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  describe('getJSON', () => {
    it('returns fallback for missing key', () => {
      expect(getJSON('missing-key', 'fallback')).toBe('fallback');
      expect(getJSON<number[]>('missing-key', [1, 2])).toEqual([1, 2]);
    });

    it('returns fallback for corrupt JSON', () => {
      localStorage.setItem('corrupt', '{invalid');
      expect(getJSON('corrupt', 'fallback')).toBe('fallback');
      expect(getJSON<string[]>('corrupt', [])).toEqual([]);
    });

    it('parses valid JSON correctly', () => {
      localStorage.setItem('valid', JSON.stringify({ a: 1, b: [2, 3] }));
      expect(getJSON<{ a: number; b: number[] }>('valid', { a: 0, b: [] })).toEqual({ a: 1, b: [2, 3] });
    });
  });

  describe('setJSON', () => {
    it('round-trips data through getJSON', () => {
      const data = { name: 'FinTech', scores: [90, 100], meta: { active: true } };
      expect(setJSON('roundtrip', data)).toBe(true);
      expect(getJSON('roundtrip', null)).toEqual(data);
    });

    it('writes serialized JSON to localStorage', () => {
      setJSON('raw', [1, 2]);
      expect(localStorage.getItem('raw')).toBe('[1,2]');
    });

    it('returns false when JSON.stringify throws', () => {
      const circular: any = {};
      circular.self = circular;
      expect(setJSON('circular', circular)).toBe(false);
    });
  });

  describe('getNumber', () => {
    it('returns fallback for non-numeric', () => {
      localStorage.setItem('bad', 'abc');
      expect(getNumber('bad', 42)).toBe(42);
      localStorage.setItem('bad2', '');
      expect(getNumber('bad2', -1)).toBe(-1);
    });

    it('returns fallback for missing key', () => {
      expect(getNumber('nope', 7)).toBe(7);
    });

    it('parses valid numbers', () => {
      localStorage.setItem('num', '42');
      expect(getNumber('num', 0)).toBe(42);
      localStorage.setItem('neg', '-3');
      expect(getNumber('neg', 0)).toBe(-3);
    });
  });

  describe('getString', () => {
    it('returns fallback for missing key', () => {
      expect(getString('missing', 'default')).toBe('default');
    });

    it('returns stored value', () => {
      localStorage.setItem('str', 'hello');
      expect(getString('str', 'default')).toBe('hello');
    });
  });

  describe('safeGetItem', () => {
    it('returns stored value', () => {
      localStorage.setItem('k', 'v');
      expect(safeGetItem('k')).toBe('v');
    });

    it('returns null for missing key', () => {
      expect(safeGetItem('missing')).toBeNull();
    });

    it('returns null when localStorage throws', () => {
      vi.stubGlobal('localStorage', {
        getItem: () => { throw new Error('SecurityError: localStorage is disabled'); },
        setItem: () => {},
        removeItem: () => {},
      });
      expect(safeGetItem('k')).toBeNull();
    });
  });

  describe('safeSetItem', () => {
    it('writes value and returns true', () => {
      expect(safeSetItem('k', 'v')).toBe(true);
      expect(localStorage.getItem('k')).toBe('v');
    });

    it('returns false when localStorage.setItem throws', () => {
      vi.stubGlobal('localStorage', {
        getItem: () => null,
        setItem: () => { throw new Error('QuotaExceededError'); },
        removeItem: () => {},
      });
      expect(safeSetItem('k', 'v')).toBe(false);
    });
  });

  describe('safeRemoveItem', () => {
    it('removes the key', () => {
      localStorage.setItem('k', 'v');
      safeRemoveItem('k');
      expect(localStorage.getItem('k')).toBeNull();
    });

    it('does not throw when localStorage.removeItem throws', () => {
      vi.stubGlobal('localStorage', {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => { throw new Error('SecurityError'); },
      });
      expect(() => safeRemoveItem('k')).not.toThrow();
    });
  });

  describe('storageKeys', () => {
    it('defines the expected centralized keys', () => {
      expect(storageKeys.stockSimMetrics).toBe('stock_sim_metrics');
      expect(storageKeys.wealthChaptersCompleted).toBe('wealth_chapters_completed');
      expect(storageKeys.glossaryBookmarks).toBe('glossary_bookmarks');
      expect(storageKeys.fintechMapSteps).toBe('fintech_map_completed_steps');
      expect(storageKeys.capstoneChecklists).toBe('capstone_checklists');
      expect(storageKeys.featureOverrides).toBe('fintech_feature_overrides');
    });
  });
});
