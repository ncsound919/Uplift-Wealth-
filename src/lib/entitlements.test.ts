import { describe, it, expect } from 'vitest';
import { isPremiumModule, requiredTier, canAccess } from './entitlements';

describe('entitlements', () => {
  it('treats modules 0-5 as free', () => {
    expect(isPremiumModule('module-0')).toBe(false);
    expect(isPremiumModule('module-5')).toBe(false);
    expect(requiredTier('module-3')).toBe('free');
  });

  it('treats modules 6+ as premium', () => {
    expect(isPremiumModule('module-6')).toBe(true);
    expect(isPremiumModule('module-15')).toBe(true);
    expect(requiredTier('module-9')).toBe('premium');
  });

  it('grants access by tier', () => {
    expect(canAccess('free', 'module-2')).toBe(true);
    expect(canAccess('free', 'module-9')).toBe(false);
    expect(canAccess(undefined, 'module-9')).toBe(false); // guests are free
    expect(canAccess('premium', 'module-9')).toBe(true);
    expect(canAccess('institutional', 'module-15')).toBe(true);
  });
});
