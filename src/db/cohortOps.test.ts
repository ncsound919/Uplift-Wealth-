import { describe, it, expect } from 'vitest';
import { createCohort, joinCohort, leaveCohort, deleteCohort, listMyCohorts, cohortLeaderboard, getCohort } from './cohortOps';
import type { DatabaseSchema } from './types';

function makeDb(): DatabaseSchema {
  return {
    users: {
      u1: { id: 'u1', name: 'Nia', role: 'student', track: 'all', badges: [], streakDays: 1, lastActive: 't' },
      u2: { id: 'u2', name: 'Kofi', role: 'student', track: 'all', badges: [], streakDays: 1, lastActive: 't' },
      u3: { id: 'u3', name: 'Amina', role: 'student', track: 'all', badges: [], streakDays: 1, lastActive: 't' },
      admin: { id: 'admin', name: 'Admin', role: 'admin', track: 'all', badges: [], streakDays: 1, lastActive: 't' },
    },
    progress: {
      u1: { userId: 'u1', completedLessons: ['a', 'b'], completedModules: ['m1'], quizScores: {}, certificates: [], xp: 500 },
      u2: { userId: 'u2', completedLessons: ['a'], completedModules: [], quizScores: {}, certificates: [], xp: 200 },
    },
    sandboxes: {},
    donations: [],
    auditLogs: [],
    waitlist: [],
    threads: [],
    comments: [],
    reports: [],
    cohorts: [],
  notifications: [],
  lessonOverrides: [],
  contentRevisions: [],
  creatorApplications: [],
  };
}

describe('cohortOps', () => {
  it('creates a cohort with the owner as the first member', () => {
    const db = makeDb();
    const c = createCohort(db, { ownerId: 'u1', name: '  Sunday Finance Circle  ', type: 'church', description: 'Bible study + budgeting' });
    expect(c.name).toBe('Sunday Finance Circle');
    expect(c.type).toBe('church');
    expect(c.memberIds).toEqual(['u1']);
    expect(c.inviteCode.length).toBeGreaterThan(0);
  });

  it('falls back to general type for unknown types', () => {
    const db = makeDb();
    expect(createCohort(db, { ownerId: 'u1', name: 'X', type: 'nonsense' }).type).toBe('general');
  });

  it('validates the cohort name', () => {
    const db = makeDb();
    expect(() => createCohort(db, { ownerId: 'u1', name: '  ' })).toThrow(/name/i);
  });

  it('join adds a member and rejects duplicates', () => {
    const db = makeDb();
    const c = createCohort(db, { ownerId: 'u1', name: 'Circle' });
    joinCohort(db, c.id, 'u2');
    expect(db.cohorts[0].memberIds).toEqual(['u1', 'u2']);
    expect(() => joinCohort(db, c.id, 'u2')).toThrow(/already a member/i);
  });

  it('leave removes a member but not the owner', () => {
    const db = makeDb();
    const c = createCohort(db, { ownerId: 'u1', name: 'Circle' });
    joinCohort(db, c.id, 'u2');
    leaveCohort(db, c.id, 'u2');
    expect(db.cohorts[0].memberIds).toEqual(['u1']);
    expect(() => leaveCohort(db, c.id, 'u1')).toThrow(/owner/i);
  });

  it('lists cohorts the user belongs to', () => {
    const db = makeDb();
    const c = createCohort(db, { ownerId: 'u1', name: 'A' });
    const other = createCohort(db, { ownerId: 'u2', name: 'B' });
    joinCohort(db, other.id, 'u1');
    const mine = listMyCohorts(db, 'u1');
    expect(mine.map(x => x.id).sort()).toEqual([c.id, other.id].sort());
  });

  it('produces a leaderboard sorted by XP', () => {
    const db = makeDb();
    const c = createCohort(db, { ownerId: 'u1', name: 'Circle' });
    joinCohort(db, c.id, 'u2');
    joinCohort(db, c.id, 'u3');
    const { cohort, members } = cohortLeaderboard(db, c.id, 'u1');
    expect(cohort!.memberCount).toBe(3);
    expect(members.map(m => m.id)).toEqual(['u1', 'u2', 'u3']);
    expect(members[0].xp).toBe(500);
  });

  it('only the owner or an admin can delete a cohort', () => {
    const db = makeDb();
    const c = createCohort(db, { ownerId: 'u1', name: 'Circle' });
    expect(() => deleteCohort(db, c.id, 'u2', 'student')).toThrow(/owner/i);
    expect(deleteCohort(db, c.id, 'u1', 'student').deleted).toBe(true);
    const c2 = createCohort(db, { ownerId: 'u1', name: 'Other' });
    expect(deleteCohort(db, c2.id, 'admin', 'admin').deleted).toBe(true);
  });
});
