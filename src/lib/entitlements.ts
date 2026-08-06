/**
 * Client-side entitlement rules. Free users get modules 0–5; premium +
 * institutional tiers unlock the rest. The server is the source of truth for
 * tier (see /api/billing/status); this file only decides *what* a tier unlocks.
 */
export type BillingTier = 'free' | 'premium' | 'institutional';

export function moduleNumber(moduleId: string): number {
  const m = /module-(\d+)/.exec(moduleId);
  return m ? Number(m[1]) : Number.MAX_SAFE_INTEGER;
}

/** Modules 0–5 are free; everything else requires a paid tier. */
export function isPremiumModule(moduleId: string): boolean {
  return moduleNumber(moduleId) > 5;
}

export function requiredTier(moduleId: string): BillingTier {
  return isPremiumModule(moduleId) ? 'premium' : 'free';
}

export function canAccess(tier: BillingTier | undefined, moduleId: string): boolean {
  if (!tier) tier = 'free';
  return tier === 'premium' || tier === 'institutional' || !isPremiumModule(moduleId);
}
