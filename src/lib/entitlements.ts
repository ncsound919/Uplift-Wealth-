/**
 * Client-side entitlement rules. All curriculum is FREE for every member.
 * Only institutional (classroom) plans are paid — they unlock cohort/classroom
 * management, not module access. The server is the source of truth for tier.
 */
export type BillingTier = 'free' | 'institutional';

export function moduleNumber(moduleId: string): number {
  const m = /module-(\d+)/.exec(moduleId);
  return m ? Number(m[1]) : Number.MAX_SAFE_INTEGER;
}

/** The full curriculum is free — no paid module tiers. */
export function isPremiumModule(_moduleId: string): boolean {
  return false;
}

export function requiredTier(_moduleId: string): BillingTier {
  return 'free';
}

export function canAccess(_tier: BillingTier | undefined, _moduleId: string): boolean {
  return true;
}
