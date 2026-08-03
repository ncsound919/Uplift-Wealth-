import { describe, it, expect, vi } from 'vitest';
import { preloadComponent, usePreloadOnHover } from './preload';

describe('preload', () => {
  describe('preloadComponent', () => {
    it('calls the import function', () => {
      let called = false;
      const importFn = () => {
        called = true;
        return Promise.resolve({ default: { name: 'Test' } });
      };
      preloadComponent(importFn);
      expect(called).toBe(true);
    });

    it('caches by function reference to avoid duplicate calls', () => {
      let callCount = 0;
      const importFn = () => {
        callCount++;
        return Promise.resolve({ default: { name: 'Test' } });
      };
      preloadComponent(importFn);
      preloadComponent(importFn);
      preloadComponent(importFn);
      expect(callCount).toBe(1);
    });

    it('removes from cache on import error', async () => {
      let importFn1Count = 0;
      const importFn1 = () => {
        importFn1Count++;
        return Promise.reject(new Error('Load failed'));
      };
      preloadComponent(importFn1);
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(importFn1Count).toBe(1);

      let importFn2Count = 0;
      const importFn2 = () => {
        importFn2Count++;
        return Promise.resolve({ default: {} });
      };
      preloadComponent(importFn2);
      expect(importFn2Count).toBe(1);
    });
  });

  describe('usePreloadOnHover', () => {
    it('returns onMouseEnter and onFocus handlers', () => {
      const importFn = () => Promise.resolve({ default: {} });
      const handlers = usePreloadOnHover(importFn);
      expect(handlers.onMouseEnter).toBeDefined();
      expect(handlers.onFocus).toBeDefined();
    });

    it('handlers call the import function when invoked', () => {
      let callCount = 0;
      const importFn = () => {
        callCount++;
        return Promise.resolve({ default: {} });
      };
      const handlers = usePreloadOnHover(importFn);
      handlers.onMouseEnter();
      handlers.onFocus();
      expect(callCount).toBe(1);
    });
  });
});
