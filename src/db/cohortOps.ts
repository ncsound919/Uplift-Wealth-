/**
 * Cohort (group learning circle) operations — pure functions over the store.
 * Testable in isolation; server.ts wires these to auth + HTTP.
 */
import type { DatabaseSchema, Cohort, CohortType } from './types';

export interface CohortWithMeta extends Cohort {
  ownerName: string;
  memberCount: number;
}

function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function newInviteCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

const VALID_TYPES: CohortType[] = ['general', 'church', 'hbcu', 'family', 'club'];

export function listMyCohorts(db: DatabaseSchema, userId: string): CohortWithMeta[] {
  return db.cohorts
    .filter((c) => c.memberIds.includes(userId) || c.ownerId === userId)
    .map((c) => ({ ...c, ownerName: db.users[c.ownerId]?.name || 'Scholar', memberCount: c.memberIds.length }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getCohort(db: DatabaseSchema, cohortId: string): CohortWithMeta | null {
  const cohort = db.cohorts.find((c) => c.id === cohortId);
  if (!cohort) return null;
  return { ...cohort, ownerName: db.users[cohort.ownerId]?.name || 'Scholar', memberCount: cohort.memberIds.length };
}

export function createCohort(
  db: DatabaseSchema,
  input: { ownerId: string; name: string; type?: string; description?: string }
): Cohort {
  const name = (input.name || '').trim().slice(0, 80);
  if (!name) throw new Error('A cohort name is required.');
  const type: CohortType = VALID_TYPES.includes(input.type as CohortType) ? (input.type as CohortType) : 'general';
  const cohort: Cohort = {
    id: newId('coh'),
    name,
    type,
    description: (input.description || '').trim().slice(0, 500) || undefined,
    ownerId: input.ownerId,
    createdAt: new Date().toISOString(),
    memberIds: [input.ownerId],
    inviteCode: newInviteCode(),
  };
  db.cohorts.push(cohort);
  return cohort;
}

export function joinCohort(db: DatabaseSchema, cohortId: string, userId: string): Cohort {
  const cohort = db.cohorts.find((c) => c.id === cohortId);
  if (!cohort) throw new Error('Cohort not found.');
  if (cohort.memberIds.includes(userId)) throw new Error('You are already a member.');
  cohort.memberIds.push(userId);
  return cohort;
}

/** Join a cohort by its shareable invite code. */
export function joinCohortByCode(db: DatabaseSchema, code: string, userId: string): Cohort {
  const normalized = code.trim().toUpperCase();
  const cohort = db.cohorts.find((c) => c.inviteCode === normalized);
  if (!cohort) throw new Error('Invalid invite code.');
  return joinCohort(db, cohort.id, userId);
}

export function leaveCohort(db: DatabaseSchema, cohortId: string, userId: string): Cohort {
  const cohort = db.cohorts.find((c) => c.id === cohortId);
  if (!cohort) throw new Error('Cohort not found.');
  if (cohort.ownerId === userId) throw new Error('The owner cannot leave a cohort.');
  const idx = cohort.memberIds.indexOf(userId);
  if (idx === -1) throw new Error('You are not a member.');
  cohort.memberIds.splice(idx, 1);
  return cohort;
}

export function deleteCohort(
  db: DatabaseSchema,
  cohortId: string,
  callerId: string,
  callerRole: string
): { deleted: boolean } {
  const idx = db.cohorts.findIndex((c) => c.id === cohortId);
  if (idx === -1) throw new Error('Cohort not found.');
  const cohort = db.cohorts[idx];
  const isAdmin = callerRole === 'admin' || callerRole === 'institution';
  if (!isAdmin && cohort.ownerId !== callerId) throw new Error('Only the owner can delete this cohort.');
  db.cohorts.splice(idx, 1);
  return { deleted: true };
}

/** Teacher/owner assigns a curriculum (module ids) to a cohort. */
export function setCohortCurriculum(
  db: DatabaseSchema,
  cohortId: string,
  moduleIds: string[],
  callerId: string,
  callerRole: string
): Cohort {
  const cohort = db.cohorts.find((c) => c.id === cohortId);
  if (!cohort) throw new Error('Cohort not found.');
  const isAdmin = callerRole === 'admin' || callerRole === 'institution';
  if (!isAdmin && cohort.ownerId !== callerId) throw new Error('Only the cohort owner can set the curriculum.');
  cohort.moduleIds = (Array.isArray(moduleIds) ? moduleIds : []).map(String).slice(0, 20);
  return cohort;
}

/** Per-member completion of the cohort's assigned modules (teacher roster). */
export function cohortRoster(
  db: DatabaseSchema,
  cohortId: string,
  callerId: string,
  callerRole: string
): { roster: Array<{ id: string; name: string; completedModules: string[]; xp: number }> } {
  const cohort = db.cohorts.find((c) => c.id === cohortId);
  if (!cohort) throw new Error('Cohort not found.');
  const isAdmin = callerRole === 'admin' || callerRole === 'institution';
  if (!isAdmin && cohort.ownerId !== callerId) throw new Error('Only the cohort owner can view the roster.');
  const memberIds = new Set([...cohort.memberIds, cohort.ownerId]);
  const roster = [...memberIds].map((id) => {
    const p = db.progress[id];
    return {
      id,
      name: db.users[id]?.name || 'Scholar',
      completedModules: p?.completedModules ?? [],
      xp: p?.xp ?? 0,
    };
  });
  return { roster };
}

/** Leaderboard: cohort members sorted by XP then completed lessons. */
export function cohortLeaderboard(
  db: DatabaseSchema,
  cohortId: string,
  userId: string
): { cohort: CohortWithMeta | null; members: Array<{ id: string; name: string; xp: number; completedModules: number; completedLessons: number }> } {
  const cohort = getCohort(db, cohortId);
  if (!cohort) return { cohort: null, members: [] };
  const memberIds = new Set([...cohort.memberIds, cohort.ownerId]);
  const members = [...memberIds]
    .map((id) => {
      const p = db.progress[id];
      return {
        id,
        name: db.users[id]?.name || 'Scholar',
        xp: p?.xp ?? 0,
        completedModules: p?.completedModules?.length ?? 0,
        completedLessons: p?.completedLessons?.length ?? 0,
      };
    })
    .sort((a, b) => b.xp - a.xp || b.completedLessons - a.completedLessons);
  return { cohort, members };
}
