const STORAGE_PREFIX = 'fintech_';

export function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function safeSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function safeRemoveItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // no-op
  }
}

export function getJSON<T>(key: string, fallback: T): T {
  const raw = safeGetItem(key);
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function setJSON<T>(key: string, value: T): boolean {
  try {
    return safeSetItem(key, JSON.stringify(value));
  } catch {
    return false;
  }
}

export function getNumber(key: string, fallback: number): number {
  const raw = safeGetItem(key);
  if (raw === null) return fallback;
  const n = parseInt(raw, 10);
  return Number.isNaN(n) ? fallback : n;
}

export function getString(key: string, fallback: string): string {
  const raw = safeGetItem(key);
  return raw === null ? fallback : raw;
}

export const storageKeys = {
  completedModules: 'completed_modules',
  completedLessons: 'completed_lessons',
  customModules: 'custom_modules',
  userXp: 'user_xp',
  userStreak: 'user_streak',
  userBadges: 'user_badges',
  gameTimeSeconds: 'game_time_seconds',
  isDarkMode: 'is_dark_mode',
  stockSimMetrics: 'stock_sim_metrics',
  wealthChaptersCompleted: 'wealth_chapters_completed',
  glossaryBookmarks: 'glossary_bookmarks',
  fintechMapSteps: 'fintech_map_completed_steps',
  capstoneChecklists: 'capstone_checklists',
  featureOverrides: 'fintech_feature_overrides',
} as const;
