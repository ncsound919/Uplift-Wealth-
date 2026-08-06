/**
 * PostgreSQL client for Overlay Wealth.
 *
 * Postgres is optional at runtime: when `DATABASE_URL` is set the server
 * dual-writes to it; when unset (local dev, tests) the file-backed store is
 * used exactly as before. This keeps development and CI dependency-free.
 */
import { Pool, type PoolClient, type QueryResultRow } from 'pg';

export interface DbQueryRunner {
  query<T extends QueryResultRow>(text: string, params?: unknown[]): Promise<T[]>;
}

let pool: Pool | null = null;

export function isDbConfigured(): boolean {
  return !!process.env.DATABASE_URL;
}

export function getPool(): Pool {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not set. Configure PostgreSQL before using the DB pool.');
    }
    const max = Number(process.env.DATABASE_POOL_SIZE) || 10;
    pool = new Pool({ connectionString: process.env.DATABASE_URL, max });
    pool.on('error', (err) => {
      console.error('[DB] idle client error:', err);
    });
  }
  return pool;
}

/** Thin query wrapper so server/sync code can run against a live pool. */
export const query: DbQueryRunner = {
  query<T extends QueryResultRow>(text: string, params?: unknown[]): Promise<T[]> {
    return getPool().query<T>(text, params).then((res) => res.rows);
  },
};

/** Ensures tables exist (idempotent). Used on boot when DATABASE_URL is set. */
export async function ensureTables(): Promise<void> {
  const client: PoolClient = await getPool().connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id text PRIMARY KEY NOT NULL,
        name text NOT NULL,
        role text DEFAULT 'student' NOT NULL,
        track text DEFAULT 'all' NOT NULL,
        avatar text,
        badges jsonb DEFAULT '[]'::jsonb NOT NULL,
        streak_days integer DEFAULT 0 NOT NULL,
        last_active text NOT NULL,
        email text,
        password_hash text,
        created_at text DEFAULT to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL
      );
      CREATE TABLE IF NOT EXISTS progress (
        user_id text PRIMARY KEY NOT NULL,
        completed_lessons jsonb DEFAULT '[]'::jsonb NOT NULL,
        completed_modules jsonb DEFAULT '[]'::jsonb NOT NULL,
        quiz_scores jsonb DEFAULT '{}'::jsonb NOT NULL,
        certificates jsonb DEFAULT '[]'::jsonb NOT NULL,
        xp integer DEFAULT 0 NOT NULL,
        game_time_seconds integer DEFAULT 0 NOT NULL,
        updated_at text DEFAULT to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') NOT NULL
      );
      CREATE TABLE IF NOT EXISTS sandboxes (
        id text PRIMARY KEY NOT NULL,
        user_id text NOT NULL,
        sandbox_type text NOT NULL,
        state_data jsonb NOT NULL,
        saved_at text NOT NULL,
        notes text
      );
      CREATE TABLE IF NOT EXISTS donations (
        id text PRIMARY KEY NOT NULL,
        user_id text NOT NULL,
        amount numeric NOT NULL,
        tier_label text,
        timestamp text NOT NULL
      );
      CREATE TABLE IF NOT EXISTS audit_logs (
        id text PRIMARY KEY NOT NULL,
        timestamp text NOT NULL,
        ip text NOT NULL,
        method text NOT NULL,
        path text NOT NULL,
        user_id text,
        action text NOT NULL
      );
      CREATE TABLE IF NOT EXISTS waitlist_emails (
        email text PRIMARY KEY NOT NULL,
        source text,
        created_at text NOT NULL
      );
    `);
  } finally {
    client.release();
  }
}

/** Closes the pool (used in tests / graceful shutdown). */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
