/**
 * PostgreSQL synchronization layer.
 *
 * Translates the in-memory `DatabaseSchema` into rows and back. Every function
 * accepts a `DbQueryRunner` so the logic is unit-testable with a fake runner
 * and runs against a real `pg` pool in production.
 */
import type { DatabaseSchema, StoredUser, StoredProgress, Sandbox, Donation, AuditLog, WaitlistEntry } from './types';
import type { DbQueryRunner } from './client';

function json(value: unknown): string {
  return JSON.stringify(value ?? null);
}

// ---- upserts -------------------------------------------------------------

export async function syncUser(runner: DbQueryRunner, u: StoredUser): Promise<void> {
  await runner.query(
    `INSERT INTO users (id, name, role, track, avatar, badges, streak_days, last_active, email, password_hash)
     VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7,$8,$9,$10)
     ON CONFLICT (id) DO UPDATE SET
       name = EXCLUDED.name,
       role = EXCLUDED.role,
       track = EXCLUDED.track,
       avatar = EXCLUDED.avatar,
       badges = EXCLUDED.badges,
       streak_days = EXCLUDED.streak_days,
       last_active = EXCLUDED.last_active,
       email = EXCLUDED.email,
       password_hash = EXCLUDED.password_hash`,
    [u.id, u.name, u.role, u.track, u.avatar ?? null, json(u.badges), u.streakDays, u.lastActive, u.email ?? null, u.passwordHash ?? null]
  );
}

export async function syncProgress(runner: DbQueryRunner, p: StoredProgress): Promise<void> {
  await runner.query(
    `INSERT INTO progress (user_id, completed_lessons, completed_modules, quiz_scores, certificates, xp, game_time_seconds, updated_at)
     VALUES ($1,$2::jsonb,$3::jsonb,$4::jsonb,$5::jsonb,$6,$7,$8)
     ON CONFLICT (user_id) DO UPDATE SET
       completed_lessons = EXCLUDED.completed_lessons,
       completed_modules = EXCLUDED.completed_modules,
       quiz_scores = EXCLUDED.quiz_scores,
       certificates = EXCLUDED.certificates,
       xp = EXCLUDED.xp,
       game_time_seconds = EXCLUDED.game_time_seconds,
       updated_at = EXCLUDED.updated_at`,
    [p.userId, json(p.completedLessons), json(p.completedModules), json(p.quizScores), json(p.certificates), p.xp ?? 0, p.gameTimeSeconds ?? 0, new Date().toISOString()]
  );
}

export interface SandboxRowInput extends Sandbox {
  userId: string;
}

export async function syncSandbox(runner: DbQueryRunner, s: SandboxRowInput): Promise<void> {
  await runner.query(
    `INSERT INTO sandboxes (id, user_id, sandbox_type, state_data, saved_at, notes)
     VALUES ($1,$2,$3,$4::jsonb,$5,$6)
     ON CONFLICT (id) DO UPDATE SET
       state_data = EXCLUDED.state_data,
       saved_at = EXCLUDED.saved_at,
       notes = EXCLUDED.notes`,
    [s.id, s.userId, s.sandboxType, json(s.stateData), s.savedAt, s.notes ?? null]
  );
}

export async function syncDonation(runner: DbQueryRunner, d: Donation): Promise<void> {
  await runner.query(
    `INSERT INTO donations (id, user_id, amount, tier_label, timestamp)
     VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (id) DO NOTHING`,
    [d.id, d.userId, d.amount, d.tierLabel ?? null, d.timestamp]
  );
}

export async function syncAuditLog(runner: DbQueryRunner, log: AuditLog): Promise<void> {
  await runner.query(
    `INSERT INTO audit_logs (id, timestamp, ip, method, path, user_id, action)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     ON CONFLICT (id) DO NOTHING`,
    [log.id, log.timestamp, log.ip, log.method, log.path, log.userId ?? null, log.action]
  );
}

export async function syncWaitlist(runner: DbQueryRunner, w: WaitlistEntry): Promise<void> {
  await runner.query(
    `INSERT INTO waitlist_emails (email, source, created_at)
     VALUES ($1,$2,$3)
     ON CONFLICT (email) DO UPDATE SET
       source = EXCLUDED.source,
       created_at = EXCLUDED.created_at`,
    [w.email, w.source ?? null, w.createdAt]
  );
}

/** Writes the entire in-memory store to PostgreSQL (backfill / boot sync). */
export async function syncFullDb(runner: DbQueryRunner, db: DatabaseSchema): Promise<void> {
  for (const u of Object.values(db.users)) {
    await syncUser(runner, u);
  }
  for (const p of Object.values(db.progress)) {
    await syncProgress(runner, p);
  }
  for (const [userId, list] of Object.entries(db.sandboxes)) {
    for (const s of list) {
      await syncSandbox(runner, { ...s, userId });
    }
  }
  for (const d of db.donations) {
    await syncDonation(runner, d);
  }
  for (const log of db.auditLogs) {
    await syncAuditLog(runner, log);
  }
  for (const w of db.waitlist ?? []) {
    await syncWaitlist(runner, w);
  }
}

// ---- hydration -----------------------------------------------------------

interface UserRow {
  id: string;
  name: string;
  role: string;
  track: string;
  avatar: string | null;
  badges: string[];
  streak_days: number;
  last_active: string;
  email: string | null;
  password_hash: string | null;
}

interface ProgressRow {
  user_id: string;
  completed_lessons: string[];
  completed_modules: string[];
  quiz_scores: Record<string, number>;
  certificates: Array<{ moduleId: string; issuedAt: string; score: number }>;
  xp?: number;
  game_time_seconds?: number;
}

interface SandboxRow {
  id: string;
  user_id: string;
  sandbox_type: string;
  state_data: Record<string, unknown>;
  saved_at: string;
  notes: string | null;
}

interface DonationRow {
  id: string;
  user_id: string;
  amount: string;
  tier_label: string | null;
  timestamp: string;
}

interface AuditLogRow {
  id: string;
  timestamp: string;
  ip: string;
  method: string;
  path: string;
  user_id: string | null;
  action: string;
}

interface WaitlistRow {
  email: string;
  source: string | null;
  created_at: string;
}

/** Reads the full store back out of PostgreSQL into the in-memory shape. */
export async function loadFullDb(runner: DbQueryRunner): Promise<DatabaseSchema> {
  const userRows = await runner.query<UserRow>('SELECT * FROM users');
  const progressRows = await runner.query<ProgressRow>('SELECT * FROM progress');
  const sandboxRows = await runner.query<SandboxRow>('SELECT * FROM sandboxes');
  const donationRows = await runner.query<DonationRow>('SELECT * FROM donations');
  const logRows = await runner.query<AuditLogRow>('SELECT * FROM audit_logs');
  const waitlistRows = await runner.query<WaitlistRow>('SELECT * FROM waitlist_emails');

  const users: DatabaseSchema['users'] = {};
  for (const r of userRows) {
    users[r.id] = {
      id: r.id,
      name: r.name,
      role: r.role as StoredUser['role'],
      track: r.track,
      avatar: r.avatar ?? undefined,
      badges: r.badges ?? [],
      streakDays: r.streak_days,
      lastActive: r.last_active,
      email: r.email ?? undefined,
      passwordHash: r.password_hash ?? undefined,
    };
  }

  const progress: DatabaseSchema['progress'] = {};
  for (const r of progressRows) {
    progress[r.user_id] = {
      userId: r.user_id,
      completedLessons: r.completed_lessons ?? [],
      completedModules: r.completed_modules ?? [],
      quizScores: r.quiz_scores ?? {},
      certificates: r.certificates ?? [],
      xp: r.xp ?? 0,
      gameTimeSeconds: r.game_time_seconds ?? 0,
    };
  }

  const sandboxes: DatabaseSchema['sandboxes'] = {};
  for (const r of sandboxRows) {
    if (!sandboxes[r.user_id]) sandboxes[r.user_id] = [];
    sandboxes[r.user_id].push({
      id: r.id,
      sandboxType: r.sandbox_type,
      stateData: r.state_data ?? {},
      savedAt: r.saved_at,
      notes: r.notes ?? undefined,
    });
  }

  const donations: DatabaseSchema['donations'] = donationRows.map((r) => ({
    id: r.id,
    userId: r.user_id,
    amount: Number(r.amount),
    tierLabel: r.tier_label ?? undefined,
    timestamp: r.timestamp,
  }));

  const auditLogs: DatabaseSchema['auditLogs'] = logRows.map((r) => ({
    id: r.id,
    timestamp: r.timestamp,
    ip: r.ip,
    method: r.method,
    path: r.path,
    userId: r.user_id ?? undefined,
    action: r.action,
  }));

  const waitlist: DatabaseSchema['waitlist'] = waitlistRows.map((r) => ({
    email: r.email,
    source: r.source ?? undefined,
    createdAt: r.created_at,
  }));

  return { users, progress, sandboxes, donations, auditLogs, waitlist };
}
