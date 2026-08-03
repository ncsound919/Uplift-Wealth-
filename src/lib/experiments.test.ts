import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getActiveExperimentVariant: vi.fn(),
  capture: vi.fn(),
}));

vi.mock('./analytics', () => ({
  getActiveExperimentVariant: mocks.getActiveExperimentVariant,
  capture: mocks.capture,
}));

import { getVariant, trackExperimentView, trackExperimentConversion, ACTIVE_EXPERIMENTS } from './experiments';

describe('experiments', () => {
  beforeEach(() => {
    localStorage.clear();
    mocks.getActiveExperimentVariant.mockReset();
    mocks.capture.mockReset();
    mocks.getActiveExperimentVariant.mockReturnValue(undefined);
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('ACTIVE_EXPERIMENTS', () => {
    it('has at least one experiment defined', () => {
      expect(ACTIVE_EXPERIMENTS.length).toBeGreaterThan(0);
    });

    it('every experiment has key, name, variants, trafficSplit, metric', () => {
      for (const exp of ACTIVE_EXPERIMENTS) {
        expect(exp.key).toBeTruthy();
        expect(exp.name).toBeTruthy();
        expect(exp.variants.length).toBeGreaterThan(0);
        expect(exp.trafficSplit.length).toBe(exp.variants.length);
        expect(exp.metric).toBeTruthy();
      }
    });

    it('traffic splits sum to 100', () => {
      for (const exp of ACTIVE_EXPERIMENTS) {
        const sum = exp.trafficSplit.reduce((a, b) => a + b, 0);
        expect(sum).toBe(100);
      }
    });
  });

  describe('getVariant', () => {
    it('returns control for unknown experiment', () => {
      expect(getVariant('non-existent-experiment')).toBe('control');
    });

    it('returns server variant when available', () => {
      mocks.getActiveExperimentVariant.mockReturnValue('guided-tour');
      expect(getVariant('onboarding-flow')).toBe('guided-tour');
    });

    it('returns cached localStorage variant', () => {
      localStorage.setItem('experiment_onboarding-flow', 'guided-tour');
      mocks.getActiveExperimentVariant.mockReturnValue(undefined);
      expect(getVariant('onboarding-flow')).toBe('guided-tour');
    });

    it('ignores invalid localStorage value and re-assigns', () => {
      localStorage.setItem('experiment_onboarding-flow', 'invalid-variant');
      mocks.getActiveExperimentVariant.mockReturnValue(undefined);
      const variant = getVariant('onboarding-flow');
      expect(['control', 'guided-tour']).toContain(variant);
    });

    it('returns one of the configured variants for the onboarding experiment', () => {
      const variant = getVariant('onboarding-flow');
      expect(['control', 'guided-tour']).toContain(variant);
    });

    it('produces a stable variant for the same user', () => {
      const v1 = getVariant('onboarding-flow');
      const v2 = getVariant('onboarding-flow');
      expect(v1).toBe(v2);
    });

    it('falls back to the first variant when the random bucket is missed', () => {
      const originalSplit = [...ACTIVE_EXPERIMENTS[0].trafficSplit];
      try {
        (ACTIVE_EXPERIMENTS[0] as any).trafficSplit = [0, 0];
        expect(getVariant('onboarding-flow')).toBe('control');
      } finally {
        (ACTIVE_EXPERIMENTS[0] as any).trafficSplit = originalSplit;
      }
    });
  });

  describe('trackExperimentView', () => {
    it('captures an experiment_viewed event with current variant', () => {
      trackExperimentView('onboarding-flow');
      expect(mocks.capture).toHaveBeenCalledWith('experiment_viewed', expect.objectContaining({
        experiment: 'onboarding-flow',
        variant: expect.stringMatching(/control|guided-tour/),
      }));
    });
  });

  describe('trackExperimentConversion', () => {
    it('captures an experiment_converted event with current variant', () => {
      trackExperimentConversion('onboarding-flow');
      expect(mocks.capture).toHaveBeenCalledWith('experiment_converted', expect.objectContaining({
        experiment: 'onboarding-flow',
        variant: expect.stringMatching(/control|guided-tour/),
      }));
    });
  });
});
