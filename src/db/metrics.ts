/**
 * Aggregate platform metrics computed from the in-memory store.
 * Pure function so it is unit-testable; wired to /api/admin/metrics (admin-only).
 */
import type { DatabaseSchema } from './types';

export interface PlatformMetrics {
  totalUsers: number;
  signedUpUsers: number;
  totalLessonsCompleted: number;
  totalModulesCompleted: number;
  totalQuizAttempts: number;
  avgQuizScore: number;
  totalDonations: number;
  totalDonationAmount: number;
  activeToday: number;
  activeThisWeek: number;
  topBadges: Array<{ badge: string; count: number }>;
}

const DAY_MS = 24 * 60 * 60 * 1000;

export function computeMetrics(db: DatabaseSchema, now: number = Date.now()): PlatformMetrics {
  const users = Object.values(db.users);
  const progressRows = Object.values(db.progress);

  let totalLessonsCompleted = 0;
  let totalModulesCompleted = 0;
  let totalQuizAttempts = 0;
  let quizScoreSum = 0;

  for (const p of progressRows) {
    totalLessonsCompleted += p.completedLessons?.length ?? 0;
    totalModulesCompleted += p.completedModules?.length ?? 0;
    const entries = Object.entries(p.quizScores ?? {});
    totalQuizAttempts += entries.length;
    quizScoreSum += entries.reduce((acc, [, s]) => acc + s, 0);
  }

  const lastActive = (ts: string | undefined): number => {
    const t = ts ? Date.parse(ts) : NaN;
    return Number.isFinite(t) ? t : NaN;
  };

  const activeToday = users.filter((u) => now - lastActive(u.lastActive) <= DAY_MS).length;
  const activeThisWeek = users.filter((u) => now - lastActive(u.lastActive) <= 7 * DAY_MS).length;

  const badgeCounts = new Map<string, number>();
  for (const u of users) {
    for (const b of u.badges ?? []) {
      badgeCounts.set(b, (badgeCounts.get(b) || 0) + 1);
    }
  }
  const topBadges = [...badgeCounts.entries()]
    .map(([badge, count]) => ({ badge, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalUsers: users.length,
    signedUpUsers: users.filter((u) => !!u.email).length,
    totalLessonsCompleted,
    totalModulesCompleted,
    totalQuizAttempts,
    avgQuizScore: totalQuizAttempts > 0 ? Math.round(quizScoreSum / totalQuizAttempts) : 0,
    totalDonations: db.donations.length,
    totalDonationAmount: Math.round(db.donations.reduce((acc, d) => acc + (d.amount || 0), 0)),
    activeToday,
    activeThisWeek,
    topBadges,
  };
}
