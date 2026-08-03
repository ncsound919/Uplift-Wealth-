import { getFeatureFlag } from './analytics';
import { getJSON, setJSON, safeRemoveItem, storageKeys } from './storage';

export type FeatureFlag =
  | 'new-onboarding'
  | 'new-dashboard'
  | 'show-glossary-beta'
  | 'show-market-data-beta';

function getLocalOverrides(): Record<string, boolean> {
  return getJSON<Record<string, boolean>>(storageKeys.featureOverrides, {});
}

function setLocalOverrides(overrides: Record<string, boolean>) {
  setJSON(storageKeys.featureOverrides, overrides);
}

export function isFlagEnabled(flag: FeatureFlag): boolean {
  const overrides = getLocalOverrides();
  if (flag in overrides) return overrides[flag];

  const serverValue = getFeatureFlag(flag);
  if (serverValue === true || serverValue === 'true') return true;
  if (serverValue === false || serverValue === 'false') return false;

  return false;
}

export function overrideFlag(flag: FeatureFlag, value: boolean) {
  const overrides = getLocalOverrides();
  overrides[flag] = value;
  setLocalOverrides(overrides);
}

export function clearOverride(flag: FeatureFlag) {
  const overrides = getLocalOverrides();
  delete overrides[flag];
  setLocalOverrides(overrides);
}

export function clearAllOverrides() {
  safeRemoveItem(storageKeys.featureOverrides);
}

export function getAllFlags(): { flag: FeatureFlag; label: string; enabled: boolean; overridden: boolean }[] {
  const overrides = getLocalOverrides();
  const flags: { flag: FeatureFlag; label: string; enabled: boolean; overridden: boolean }[] = [
    { flag: 'new-onboarding', label: 'New Onboarding Flow', enabled: false, overridden: false },
    { flag: 'new-dashboard', label: 'New Dashboard Layout', enabled: false, overridden: false },
    { flag: 'show-glossary-beta', label: 'Glossary Beta Badge', enabled: false, overridden: false },
    { flag: 'show-market-data-beta', label: 'Market Data Beta Badge', enabled: false, overridden: false },
  ];
  return flags.map(f => ({
    ...f,
    enabled: f.flag in overrides ? overrides[f.flag] : false,
    overridden: f.flag in overrides,
  }));
}
