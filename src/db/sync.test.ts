import { describe, it, expect, beforeEach } from 'vitest';
import {
  syncUser,
  syncProgress,
  syncSandbox,
  syncDonation,
  syncAuditLog,
  syncFullDb,
  loadFullDb,
} from './sync';
import type { DbQueryRunner } from './client';
import type { DatabaseSchema } from './types';

interface Call {
  text: string;
  params: unknown[];
}

function recordingRunner(selectResults: Record<string, unknown[]> = {}) {
  const calls: Call[] = [];
  const runner: DbQueryRunner = {
    async query<T>(text: string, params: unknown[] = []): Promise<T[]> {
      calls.push({ text, params });
      if (text.trim().startsWith('SELECT')) {
        const table = text.trim().split(/\s+/)[3] || '';
        return (selectResults[table] ?? []) as T[];
      }
      return [];
    },
  };
  return { runner, calls };
}

const baseDb: DatabaseSchema = {
  users: {
    u1: { id: 'u1', name: 'Nia', role: 'student', track: 'all', badges: ['pioneer'], streakDays: 3, lastActive: 't1' },
  },
  progress: {
    u1: { userId: 'u1', completedLessons: ['m1-l1'], completedModules: [], quizScores: { m1: 100 }, certificates: [] },
  },
  sandboxes: {
    u1: [{ id: 'sb1', sandboxType: 'trading', stateData: { balance: 5000 }, savedAt: 't2' }],
  },
  donations: [{ id: 'd1', userId: 'u1', amount: 50, tierLabel: 'Community', timestamp: 't3' }],
  auditLogs: [{ id: 'l1', timestamp: 't4', ip: '1.2.3.4', method: 'GET', path: '/api/health', action: 'GET /api/health' }],
  waitlist: [],
};

describe('sync: upserts', () => {
  let r: { runner: DbQueryRunner; calls: Call[] };

  beforeEach(() => {
    r = recordingRunner();
  });

  it('syncUser issues an upsert into users', async () => {
    await syncUser(r.runner, baseDb.users.u1);
    expect(r.calls).toHaveLength(1);
    expect(r.calls[0].text).toContain('INSERT INTO users');
    expect(r.calls[0].text).toContain('ON CONFLICT (id) DO UPDATE');
    const [id, name, , , , badges, streak, lastActive, email, passwordHash] = r.calls[0].params;
    expect(id).toBe('u1');
    expect(name).toBe('Nia');
    expect(JSON.parse(badges as string)).toEqual(['pioneer']);
    expect(streak).toBe(3);
    expect(email).toBeNull();
    expect(passwordHash).toBeNull();
  });

  it('syncProgress issues an upsert into progress', async () => {
    await syncProgress(r.runner, baseDb.progress.u1);
    expect(r.calls[0].text).toContain('INSERT INTO progress');
    expect(JSON.parse(r.calls[0].params[1] as string)).toEqual(['m1-l1']);
    expect(JSON.parse(r.calls[0].params[3] as string)).toEqual({ m1: 100 });
  });

  it('syncSandbox issues an upsert into sandboxes', async () => {
    await syncSandbox(r.runner, { ...baseDb.sandboxes.u1[0], userId: 'u1' });
    expect(r.calls[0].text).toContain('INSERT INTO sandboxes');
    expect(JSON.parse(r.calls[0].params[3] as string)).toEqual({ balance: 5000 });
  });

  it('syncDonation issues an insert with ON CONFLICT DO NOTHING', async () => {
    await syncDonation(r.runner, baseDb.donations[0]);
    expect(r.calls[0].text).toContain('INSERT INTO donations');
    expect(r.calls[0].text).toContain('ON CONFLICT (id) DO NOTHING');
  });

  it('syncAuditLog issues an insert into audit_logs', async () => {
    await syncAuditLog(r.runner, baseDb.auditLogs[0]);
    expect(r.calls[0].text).toContain('INSERT INTO audit_logs');
  });
});

describe('sync: full database', () => {
  it('syncFullDb writes every record', async () => {
    const { runner, calls } = recordingRunner();
    await syncFullDb(runner, baseDb);
    expect(calls.length).toBe(5); // 1 user + 1 progress + 1 sandbox + 1 donation + 1 audit log
    expect(calls.some(c => c.text.includes('INSERT INTO users'))).toBe(true);
    expect(calls.some(c => c.text.includes('INSERT INTO progress'))).toBe(true);
    expect(calls.some(c => c.text.includes('INSERT INTO sandboxes'))).toBe(true);
    expect(calls.some(c => c.text.includes('INSERT INTO donations'))).toBe(true);
    expect(calls.some(c => c.text.includes('INSERT INTO audit_logs'))).toBe(true);
  });

  it('loadFullDb hydrates the in-memory shape from rows', async () => {
    const { runner } = recordingRunner({
      users: [{ id: 'u1', name: 'Nia', role: 'student', track: 'all', avatar: null, badges: ['pioneer'], streak_days: 3, last_active: 't1', email: 'nia@x.dev', password_hash: 'hash' }],
      progress: [{ user_id: 'u1', completed_lessons: ['m1-l1'], completed_modules: [], quiz_scores: { m1: 100 }, certificates: [] }],
      sandboxes: [{ id: 'sb1', user_id: 'u1', sandbox_type: 'trading', state_data: { balance: 5000 }, saved_at: 't2', notes: null }],
      donations: [{ id: 'd1', user_id: 'u1', amount: '50', tier_label: 'Community', timestamp: 't3' }],
      audit_logs: [{ id: 'l1', timestamp: 't4', ip: '1.2.3.4', method: 'GET', path: '/api/health', user_id: 'u1', action: 'GET /api/health' }],
    });

    const db = await loadFullDb(runner);

    expect(db.users.u1).toEqual({
      id: 'u1', name: 'Nia', role: 'student', track: 'all', avatar: undefined,
      badges: ['pioneer'], streakDays: 3, lastActive: 't1', email: 'nia@x.dev', passwordHash: 'hash',
    });
    expect(db.progress.u1.completedLessons).toEqual(['m1-l1']);
    expect(db.progress.u1.quizScores).toEqual({ m1: 100 });
    expect(db.sandboxes.u1).toEqual([{ id: 'sb1', sandboxType: 'trading', stateData: { balance: 5000 }, savedAt: 't2', notes: undefined }]);
    expect(db.donations[0].amount).toBe(50); // numeric string -> number
    expect(db.auditLogs[0].userId).toBe('u1');
  });

  it('loadFullDb handles empty tables', async () => {
    const { runner } = recordingRunner();
    const db = await loadFullDb(runner);
    expect(db).toEqual({ users: {}, progress: {}, sandboxes: {}, donations: [], auditLogs: [], waitlist: [] });
  });
});
