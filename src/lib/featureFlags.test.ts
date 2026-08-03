import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getFeatureFlag: vi.fn(),
}));

vi.mock('./analytics', () => ({
  getFeatureFlag: mocks.getFeatureFlag,
}));

import { isFlagEnabled, overrideFlag, clearOverride, clearAllOverrides, getAllFlags } from './featureFlags';

describe('featureFlags', () => {
  beforeEach(() => {
    localStorage.clear();
    mocks.getFeatureFlag.mockReset();
    mocks.getFeatureFlag.mockReturnValue(undefined);
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('isFlagEnabled', () => {
    it('returns false when no override and no server value', () => {
      expect(isFlagEnabled('new-dashboard')).toBe(false);
    });

    it('returns true when override is true', () => {
      overrideFlag('new-dashboard', true);
      expect(isFlagEnabled('new-dashboard')).toBe(true);
    });

    it('returns false when override is false', () => {
      overrideFlag('new-dashboard', false);
      expect(isFlagEnabled('new-dashboard')).toBe(false);
    });

    it('returns true when server value is true', () => {
      mocks.getFeatureFlag.mockReturnValue(true);
      expect(isFlagEnabled('new-dashboard')).toBe(true);
    });

    it('returns false when server value is false', () => {
      mocks.getFeatureFlag.mockReturnValue(false);
      expect(isFlagEnabled('new-dashboard')).toBe(false);
    });

    it('returns true when server value is "true" string', () => {
      mocks.getFeatureFlag.mockReturnValue('true');
      expect(isFlagEnabled('new-dashboard')).toBe(true);
    });

    it('returns false when server value is "false" string', () => {
      mocks.getFeatureFlag.mockReturnValue('false');
      expect(isFlagEnabled('new-dashboard')).toBe(false);
    });

    it('local override takes precedence over server value', () => {
      mocks.getFeatureFlag.mockReturnValue(true);
      overrideFlag('new-dashboard', false);
      expect(isFlagEnabled('new-dashboard')).toBe(false);
    });
  });

  describe('overrideFlag and clearOverride', () => {
    it('clears an override and falls back to server value', () => {
      overrideFlag('new-dashboard', true);
      expect(isFlagEnabled('new-dashboard')).toBe(true);
      clearOverride('new-dashboard');
      mocks.getFeatureFlag.mockReturnValue(false);
      expect(isFlagEnabled('new-dashboard')).toBe(false);
    });

    it('clearing a non-existent override is a no-op', () => {
      clearOverride('new-dashboard');
      expect(isFlagEnabled('new-dashboard')).toBe(false);
    });
  });

  describe('clearAllOverrides', () => {
    it('removes all overrides from localStorage', () => {
      overrideFlag('new-dashboard', true);
      overrideFlag('new-onboarding', true);
      clearAllOverrides();
      expect(isFlagEnabled('new-dashboard')).toBe(false);
      expect(isFlagEnabled('new-onboarding')).toBe(false);
    });
  });

  describe('getAllFlags', () => {
    it('returns 4 known flags with overridden false by default', () => {
      const flags = getAllFlags();
      expect(flags).toHaveLength(4);
      expect(flags.every(f => f.overridden === false)).toBe(true);
    });

    it('marks a flag as overridden when set', () => {
      overrideFlag('new-dashboard', true);
      const flags = getAllFlags();
      const dashFlag = flags.find(f => f.flag === 'new-dashboard')!;
      expect(dashFlag.overridden).toBe(true);
      expect(dashFlag.enabled).toBe(true);
    });
  });
});
