import { describe, it, expect } from 'vitest';
import { computeMetrics } from './metrics';
import type { DatabaseSchema } from './types';

function makeDb(overrides: Partial<DatabaseSchema> = {}): DatabaseSchema {
  return {
    users: {
      u1: { id: 'u1', name: 'A', role: 'student', track: 'all', badges: ['wise_wizard'], streakDays: 1, lastActive: new Date().toISOString() },
      u2: { id: 'u2', name: 'B', role: 'student', track: 'all', badges: ['wise_wizard', 'card_commander'], streakDays: 2, lastActive: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(), email: 'b@x.dev' },
      u3: { id: 'u3', name: 'C', role: 'student', track: 'all', badges: [], streakDays: 0, lastActive: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(), email: 'c@x.dev' },
    },
    progress: {
      u1: { userId: 'u1', completedLessons: ['a', 'b'], completedModules: ['m1'], quizScores: { m1: 90 }, certificates: [] },
      u2: { userId: 'u2', completedLessons: ['c'], completedModules: [], quizScores: { m1: 70, m2: 100 }, certificates: [] },
    },
    sandboxes: {},
    donations: [
      { id: 'd1', userId: 'u1', amount: 50, timestamp: 't' },
      { id: 'd2', userId: 'u2', amount: 25.5, timestamp: 't' },
    ],
    auditLogs: [],
    waitlist: [],
    threads: [],
    comments: [],
    reports: [],
  cohorts: [],
    ...overrides,
  };
}

describe('computeMetrics', () => {
  const now = Date.now();
  const m = computeMetrics(makeDb(), now);

  it('counts users and signed-up users', () => {
    expect(m.totalUsers).toBe(3);
    expect(m.signedUpUsers).toBe(2);
  });

  it('aggregates lesson/module/quiz completion', () => {
    expect(m.totalLessonsCompleted).toBe(3);
    expect(m.totalModulesCompleted).toBe(1);
    expect(m.totalQuizAttempts).toBe(3);
    expect(m.avgQuizScore).toBe(87); // (90 + 70 + 100) / 3 = 86.67 -> 87
  });

  it('sums donations', () => {
    expect(m.totalDonations).toBe(2);
    expect(m.totalDonationAmount).toBe(76);
  });

  it('buckets activity windows', () => {
    expect(m.activeToday).toBe(1); // u1
    expect(m.activeThisWeek).toBe(2); // u1 + u2
  });

  it('ranks top badges by frequency', () => {
    expect(m.topBadges[0]).toEqual({ badge: 'wise_wizard', count: 2 });
  });

  it('handles an empty store', () => {
    const empty = computeMetrics(makeDb({ users: {}, progress: {}, donations: [] }));
    expect(empty.totalUsers).toBe(0);
    expect(empty.totalLessonsCompleted).toBe(0);
    expect(empty.avgQuizScore).toBe(0);
    expect(empty.topBadges).toEqual([]);
  });
});
