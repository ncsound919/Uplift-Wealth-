import { getActiveExperimentVariant, capture } from './analytics';

export interface Experiment {
  key: string;
  name: string;
  description: string;
  variants: string[];
  trafficSplit: number[];
  metric: string;
}

export const ACTIVE_EXPERIMENTS: Experiment[] = [
  {
    key: 'onboarding-flow',
    name: 'Onboarding Flow Redesign',
    description: 'Tests the new guided onboarding vs. the current sidebar-first experience.',
    variants: ['control', 'guided-tour'],
    trafficSplit: [50, 50],
    metric: 'lesson_start (first 7 days)',
  },
];

export function getVariant(experimentKey: string): string {
  const active = ACTIVE_EXPERIMENTS.find(e => e.key === experimentKey);
  if (!active) return 'control';

  const serverVariant = getActiveExperimentVariant(experimentKey);
  if (serverVariant && active.variants.includes(serverVariant)) return serverVariant;

  const stored = localStorage.getItem(`experiment_${experimentKey}`);
  if (stored && active.variants.includes(stored)) return stored;

  const hash = hashUserId(experimentKey);
  let cumulative = 0;
  const rand = (hash % 100) / 100;
  for (let i = 0; i < active.variants.length; i++) {
    cumulative += active.trafficSplit[i] / 100;
    if (rand < cumulative) {
      localStorage.setItem(`experiment_${experimentKey}`, active.variants[i]);
      return active.variants[i];
    }
  }
  return active.variants[0];
}

export function trackExperimentView(experimentKey: string) {
  const variant = getVariant(experimentKey);
  capture('experiment_viewed', { experiment: experimentKey, variant });
}

export function trackExperimentConversion(experimentKey: string) {
  const variant = getVariant(experimentKey);
  capture('experiment_converted', { experiment: experimentKey, variant });
}

function hashUserId(key: string): number {
  let hash = 0;
  const str = `${key}_${localStorage.getItem('fintech_user_id') || 'anon'}`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}
