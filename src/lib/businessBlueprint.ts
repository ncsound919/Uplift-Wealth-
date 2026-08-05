export type BusinessType =
  | 'fintech'
  | 'retail'
  | 'food'
  | 'services'
  | 'consulting'
  | 'real_estate'
  | 'other';

export type MonetizationType =
  | 'subscription'
  | 'transaction'
  | 'margin'
  | 'service';

export type TeamSize = 'solo' | 'team';

export type FundingChoice = 'bootstrap' | 'raise';

export interface QuickStartAnswers {
  businessType: BusinessType | null;
  customers: string | null;
  problem: string | null;
  monetization: MonetizationType | null;
  team: TeamSize | null;
  businessName: string | null;
  funding: FundingChoice | null;
  state: string | null;
}

/** Resolved blueprint that seeds the full Step-by-Step builder. */
export interface BusinessBlueprint {
  businessType: BusinessType;
  lane: string;
  problem: string;
  selectedCohort: string;
  reachUsers: number;
  monetization: string;
  monthlyFee: number;
  txVolume: number;
  businessName: string;
  structure: 'LLC' | 'C-Corp' | 'Solo';
  filingState: string;
  hqType: string;
  foundersCount: string;
  selectedApis: string[];
  marketingChannel: string;
  founderName: string;
  founderState: string;
  fundingStrategy: string;
  equitySplit: string;
  brandStyle: string;
}

/** Human label + short description for the business type picker. */
export const BUSINESS_TYPE_OPTIONS: { id: BusinessType; label: string; desc: string; icon: string }[] = [
  { id: 'fintech', label: 'Fintech / Digital Finance', desc: 'Payments, banking, lending, or investing software', icon: '💳' },
  { id: 'retail', label: 'Retail & E-Commerce', desc: 'Online store, shop, or brand selling products', icon: '🛍️' },
  { id: 'food', label: 'Food & Restaurants', desc: 'Restaurant, food truck, catering, or meal service', icon: '🍽️' },
  { id: 'services', label: 'Services & Trades', desc: 'Cleaning, repair, beauty, or handyman services', icon: '🛠️' },
  { id: 'consulting', label: 'Consulting & Coaching', desc: 'Advice, training, or professional services', icon: '📊' },
  { id: 'real_estate', label: 'Real Estate', desc: 'Rental property, flipping, or property management', icon: '🏠' },
  { id: 'other', label: 'Something Else', desc: 'Describe your own business', icon: '✨' },
];

export const MONETIZATION_OPTIONS: { id: MonetizationType; label: string; desc: string }[] = [
  { id: 'subscription', label: 'Subscription / Recurring Fee', desc: 'Customers pay monthly or yearly' },
  { id: 'transaction', label: 'Fee Per Transaction', desc: 'You earn a small cut of each sale' },
  { id: 'margin', label: 'Product Margin', desc: 'You buy low, sell high' },
  { id: 'service', label: 'Service Fee / Hourly', desc: 'You charge for your time or expertise' },
];

export const TEAM_OPTIONS: { id: TeamSize; label: string; desc: string }[] = [
  { id: 'solo', label: 'Just me', desc: 'Solo founder, full control' },
  { id: 'team', label: 'Me + partner(s)', desc: 'Co-founding partnership' },
];

export const FUNDING_OPTIONS: { id: FundingChoice; label: string; desc: string }[] = [
  { id: 'bootstrap', label: 'Grow with my own money', desc: 'Bootstrapped — no outside investors' },
  { id: 'raise', label: 'Raise investor money', desc: 'Seek venture capital or funding' },
];

export const US_STATE_OPTIONS = ['Delaware', 'Wyoming', 'California', 'Texas', 'New York', 'Florida'];

/**
 * Deterministic assembler: converts the 8 QuickStart answers into a full
 * BusinessBlueprint that seeds the Step-by-Step builder. Any skipped answer
 * falls back to a sensible default so the pipeline always produces a plan.
 */
export function buildBlueprint(answers: QuickStartAnswers): BusinessBlueprint {
  const type: BusinessType = answers.businessType ?? 'fintech';
  const funding: FundingChoice = answers.funding ?? (type === 'fintech' ? 'raise' : 'bootstrap');
  const team: TeamSize = answers.team ?? (funding === 'raise' ? 'team' : 'solo');
  const state: string = answers.state ?? (type === 'fintech' ? 'Delaware' : 'California');
  const name: string = answers.businessName?.trim() || defaultName(type);

  return {
    businessType: type,
    lane: laneFor(type),
    problem: answers.problem || problemFor(type),
    selectedCohort: answers.customers || cohortFor(type),
    reachUsers: type === 'fintech' ? 10000 : 1000,
    monetization: monetizationFor(type, answers.monetization),
    monthlyFee: priceFor(type, answers.monetization),
    txVolume: answers.monetization === 'transaction' ? 150000 : 50000,
    businessName: name,
    structure: funding === 'raise' ? 'C-Corp' : 'LLC',
    filingState: state,
    hqType: type === 'services' || type === 'consulting' ? 'Virtual office address' : 'Shared / Coworking space',
    foundersCount: team === 'team' ? 'Co-founding partnership' : 'Solo founder (bootstrap)',
    selectedApis: apisFor(type, funding),
    marketingChannel: marketingFor(type),
    founderName: '',
    founderState: state,
    fundingStrategy: fundingStrategyFor(funding),
    equitySplit: equityFor(team),
    brandStyle: 'Clean',
  };
}

function laneFor(type: BusinessType): string {
  switch (type) {
    case 'fintech': return 'Digital Banking';
    case 'retail': return 'Retail & E-Commerce';
    case 'food': return 'Food & Restaurants';
    case 'services': return 'Services & Trades';
    case 'consulting': return 'Consulting & Coaching';
    case 'real_estate': return 'Real Estate';
    default: return 'General Business';
  }
}

function problemFor(type: BusinessType): string {
  switch (type) {
    case 'fintech': return 'High transaction friction and slow settlement corridors.';
    case 'retail': return 'Customers lack convenient access to quality products at fair prices.';
    case 'food': return 'People want great food but lack convenient, affordable options.';
    case 'services': return 'Customers struggle to find reliable, vetted local service providers.';
    case 'consulting': return 'Businesses and individuals need expert guidance they can afford.';
    case 'real_estate': return 'People need safe, affordable housing and smart property guidance.';
    default: return 'A real, underserved customer need in the local market.';
  }
}

function cohortFor(type: BusinessType): string {
  switch (type) {
    case 'fintech': return 'Gig workers & Freelancers';
    case 'retail': return 'Online shoppers';
    case 'food': return 'Local residents & workers';
    case 'services': return 'Local homeowners & small businesses';
    case 'consulting': return 'Small business owners';
    case 'real_estate': return 'Renters & first-time buyers';
    default: return 'Local community members';
  }
}

function monetizationFor(type: BusinessType, choice: MonetizationType | null): string {
  const resolved = choice ?? (type === 'fintech' ? 'subscription' : type === 'food' || type === 'retail' ? 'margin' : 'service');
  switch (resolved) {
    case 'subscription': return 'Subscription model (recurring software software license fee)';
    case 'transaction': return 'Transactional fee (small percentage + flat cost per transaction)';
    case 'margin': return 'Product margin (markup on goods sold)';
    case 'service': return 'Service fee (hourly or per-project pricing)';
  }
}

function priceFor(type: BusinessType, choice: MonetizationType | null): number {
  const resolved = choice ?? (type === 'fintech' ? 'subscription' : type === 'food' || type === 'retail' ? 'margin' : 'service');
  switch (resolved) {
    case 'subscription': return 12;
    case 'transaction': return 1;
    case 'margin': return 25;
    case 'service': return 75;
  }
}

function apisFor(type: BusinessType, funding: FundingChoice): string[] {
  if (type === 'fintech') {
    return funding === 'raise'
      ? ['Payments API Integration', 'KYC Identity Decisioning']
      : ['Payments API Integration', 'BaaS Ledger Aggregator'];
  }
  return ['Payments API Integration', 'BaaS Ledger Aggregator'];
}

function marketingFor(type: BusinessType): string {
  switch (type) {
    case 'fintech': return 'Developer Relations & API documentation';
    case 'retail':
    case 'food': return 'Interactive Fin-Ed SEO & Calculators';
    case 'services': return 'Niche B2B Outbound Campaigns';
    default: return 'Interactive Fin-Ed SEO & Calculators';
  }
}

function fundingStrategyFor(funding: FundingChoice): string {
  return funding === 'raise'
    ? 'Seed Venture Capital SAFE ($500K - $2M)'
    : 'Bootstrapped (0% Equity Diluted)';
}

function equityFor(team: TeamSize): string {
  return team === 'team'
    ? 'Equal 50/50 Split (4-Year Vesting with 1-Year Cliff)'
    : 'Solo Retained 100% Control';
}

function defaultName(type: BusinessType): string {
  switch (type) {
    case 'fintech': return 'Velo';
    case 'retail': return 'Atlas Goods';
    case 'food': return 'Ember Kitchen';
    case 'services': return 'Prime Services';
    case 'consulting': return 'Clarity Advisory';
    case 'real_estate': return 'Solid Ground Properties';
    default: return 'Meridian';
  }
}
