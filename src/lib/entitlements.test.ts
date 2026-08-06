import { describe, it, expect } from 'vitest';
import { isPremiumModule, requiredTier, canAccess } from './entitlements';

describe('entitlements', () => {
  it('treats every module as free (no paid tiers)', () => {
    expect(isPremiumModule('module-0')).toBe(false);
    expect(isPremiumModule('module-5')).toBe(false);
    expect(isPremiumModule('module-9')).toBe(false);
    expect(isPremiumModule('module-15')).toBe(false);
  });

  it('grants access to every module regardless of tier', () => {
    expect(canAccess('free', 'module-9')).toBe(true);
    expect(canAccess(undefined, 'module-15')).toBe(true);
    expect(canAccess('institutional', 'module-0')).toBe(true);
    expect(requiredTier('module-12')).toBe('free');
  });
});
