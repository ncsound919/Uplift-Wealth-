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
    // Serverless safety: a slow/unreachable DB must fail fast, not eat the
    // function's execution budget (Vercel returns 500 when cold start exceeds
    // ~5s). connectionTimeoutMillis bounds the connect attempt; statement_timeout
    // bounds any single query. Both are overridable via env.
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max,
      connectionTimeoutMillis: Number(process.env.PG_CONNECT_TIMEOUT_MS) || 3000,
      statement_timeout: Number(process.env.PG_STATEMENT_TIMEOUT_MS) || 8000,
      idleTimeoutMillis: Number(process.env.PG_IDLE_TIMEOUT_MS) || 10000,
    });
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
    for (const stmt of splitSqlStatements(`
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
        token_version integer DEFAULT 0 NOT NULL,
        profile_public boolean DEFAULT false NOT NULL,
        creator_verified boolean DEFAULT false NOT NULL,
        creator_bio text,
        subscription_tier text DEFAULT 'free' NOT NULL,
        stripe_customer_id text,
        stripe_subscription_id text,
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
      CREATE TABLE IF NOT EXISTS threads (
        id text PRIMARY KEY NOT NULL,
        module_id text,
        lesson_id text,
        user_id text NOT NULL,
        title text NOT NULL,
        body text NOT NULL,
        created_at text NOT NULL,
        upvoted_by jsonb DEFAULT '[]'::jsonb NOT NULL
      );
      CREATE TABLE IF NOT EXISTS comments (
        id text PRIMARY KEY NOT NULL,
        thread_id text NOT NULL,
        user_id text NOT NULL,
        body text NOT NULL,
        created_at text NOT NULL,
        upvoted_by jsonb DEFAULT '[]'::jsonb NOT NULL
      );
      CREATE TABLE IF NOT EXISTS reports (
        id text PRIMARY KEY NOT NULL,
        target_type text NOT NULL,
        target_id text NOT NULL,
        user_id text NOT NULL,
        reason text,
        created_at text NOT NULL
      );
      CREATE TABLE IF NOT EXISTS cohorts (
        id text PRIMARY KEY NOT NULL,
        name text NOT NULL,
        type text DEFAULT 'general' NOT NULL,
        description text,
        owner_id text NOT NULL,
        created_at text NOT NULL,
        member_ids jsonb DEFAULT '[]'::jsonb NOT NULL,
        invite_code text NOT NULL,
        module_ids jsonb DEFAULT '[]'::jsonb NOT NULL
      );
      CREATE TABLE IF NOT EXISTS notifications (
        id text PRIMARY KEY NOT NULL,
        user_id text NOT NULL,
        type text DEFAULT 'system' NOT NULL,
        title text NOT NULL,
        message text NOT NULL,
        read boolean DEFAULT false NOT NULL,
        created_at text NOT NULL
      );
      CREATE TABLE IF NOT EXISTS lesson_overrides (
        id text PRIMARY KEY NOT NULL,
        module_id text NOT NULL,
        lesson_id text NOT NULL,
        content text NOT NULL,
        version integer DEFAULT 1 NOT NULL,
        updated_by text NOT NULL,
        updated_at text NOT NULL
      );
      CREATE TABLE IF NOT EXISTS content_revisions (
        id text PRIMARY KEY NOT NULL,
        module_id text NOT NULL,
        lesson_id text NOT NULL,
        content text NOT NULL,
        version integer NOT NULL,
        updated_by text NOT NULL,
        updated_at text NOT NULL
      );
      CREATE TABLE IF NOT EXISTS creator_applications (
        id text PRIMARY KEY NOT NULL,
        user_id text NOT NULL,
        bio text NOT NULL,
        portfolio_url text,
        status text DEFAULT 'pending' NOT NULL,
        created_at text NOT NULL,
        reviewed_at text
      );
    `)) {
      await client.query(stmt);
    }
  } finally {
    client.release();
  }
}

/**
 * Splits a SQL script into individual statements so each can run as its own
 * query. This is required for Supabase's transaction pooler (port 6543), which
 * rejects multi-statement queries. Handles drizzle's `--> statement-breakpoint`
 * separators — both `;--> statement-breakpoint` (drizzle's format) and the
 * marker on its own line — plus plain `;`-separated DDL.
 */
export function splitSqlStatements(sql: string): string[] {
  const normalized = sql
    .replace(/\s*;\s*-->\s*statement-breakpoint\s*/g, ';\n')
    .replace(/\s*-->\s*statement-breakpoint\s*/g, ';\n');
  const statements: string[] = [];
  for (const part of normalized.split(/;\s*\r?\n/)) {
    const s = part.trim().replace(/;+$/, '');
    if (s) statements.push(`${s};`);
  }
  return statements;
}

/** Closes the pool (used in tests / graceful shutdown). */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
