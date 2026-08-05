import { describe, it, expect } from 'vitest';
import { buildBlueprint, BUSINESS_TYPE_OPTIONS, type QuickStartAnswers } from './businessBlueprint';

describe('businessBlueprint', () => {
  it('builds a fintech blueprint with raise + team defaults', () => {
    const bp = buildBlueprint({ businessType: 'fintech', customers: null, problem: null, monetization: null, team: null, businessName: null, funding: 'raise', state: null });
    expect(bp.businessType).toBe('fintech');
    expect(bp.lane).toBe('Digital Banking');
    expect(bp.structure).toBe('C-Corp');
    expect(bp.fundingStrategy).toContain('Seed');
    expect(bp.foundersCount).toContain('Co-founding');
    expect(bp.filingState).toBe('Delaware');
    expect(bp.selectedApis).toContain('KYC Identity Decisioning');
  });

  it('builds a retail blueprint with bootstrap defaults', () => {
    const bp = buildBlueprint({ businessType: 'retail', customers: null, problem: null, monetization: null, team: null, businessName: null, funding: null, state: null });
    expect(bp.businessType).toBe('retail');
    expect(bp.lane).toBe('Retail & E-Commerce');
    expect(bp.structure).toBe('LLC');
    expect(bp.fundingStrategy).toContain('Bootstrapped');
    expect(bp.filingState).toBe('California');
  });

  it('builds a consulting blueprint with virtual HQ', () => {
    const bp = buildBlueprint({ businessType: 'consulting', customers: null, problem: null, monetization: null, team: null, businessName: null, funding: 'bootstrap', state: 'Texas' });
    expect(bp.hqType).toBe('Virtual office address');
    expect(bp.filingState).toBe('Texas');
    expect(bp.monetization).toContain('Service');
  });

  it('maps transaction monetization to a transaction model', () => {
    const bp = buildBlueprint({ businessType: 'fintech', customers: null, problem: null, monetization: 'transaction', team: null, businessName: null, funding: null, state: null });
    expect(bp.monetization).toContain('Transactional');
  });

  it('uses custom business name and customers', () => {
    const bp = buildBlueprint({ businessType: 'food', customers: 'Downtown office workers', problem: 'No quick lunch options', monetization: 'service', team: 'solo', businessName: 'Ember Kitchen', funding: 'bootstrap', state: 'Florida' });
    expect(bp.businessName).toBe('Ember Kitchen');
    expect(bp.selectedCohort).toBe('Downtown office workers');
    expect(bp.problem).toBe('No quick lunch options');
    expect(bp.foundersCount).toContain('Solo');
    expect(bp.equitySplit).toContain('100% Control');
  });

  it('always produces a blueprint even with all answers skipped', () => {
    const empty: QuickStartAnswers = { businessType: null, customers: null, problem: null, monetization: null, team: null, businessName: null, funding: null, state: null };
    const bp = buildBlueprint(empty);
    expect(bp.businessName.length).toBeGreaterThan(0);
    expect(bp.lane.length).toBeGreaterThan(0);
    expect(bp.structure).toBeTruthy();
  });

  it('exposes all business type options', () => {
    expect(BUSINESS_TYPE_OPTIONS.length).toBeGreaterThanOrEqual(6);
    expect(BUSINESS_TYPE_OPTIONS.map(o => o.id)).toContain('fintech');
  });
});
