/**
 * Self-contained SQL migration runner.
 *
 * Applies `src/db/migrations/*.sql` in filename order, tracking applied
 * migrations in a `schema_migrations` table. Works in dev (repo cwd) and in
 * the Docker runtime (the Dockerfile copies the migrations dir into the image).
 * Falls back silently when the migrations directory is absent so a bare
 * `ensureTables()` runtime still functions.
 */
import fs from 'fs';
import path from 'path';
import { getPool, isDbConfigured } from './client';

const MIGRATIONS_DIR = path.resolve(process.cwd(), 'src', 'db', 'migrations');

export async function runMigrations(): Promise<string[]> {
  const appliedNames: string[] = [];
  if (!isDbConfigured()) {
    return appliedNames;
  }

  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query(
      'CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at text NOT NULL)'
    );

    if (!fs.existsSync(MIGRATIONS_DIR)) {
      console.warn('[DB] Migrations dir not found; skipping migration run.');
      return appliedNames;
    }

    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const existing = await client.query('SELECT 1 FROM schema_migrations WHERE name = $1', [file]);
      if ((existing.rowCount ?? 0) > 0) continue;

      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf-8');
      await client.query(sql);
      await client.query(
        'INSERT INTO schema_migrations (name, applied_at) VALUES ($1, $2)',
        [file, new Date().toISOString()]
      );
      appliedNames.push(file);
    }
  } finally {
    client.release();
  }

  if (appliedNames.length > 0) {
    console.log(`[DB] Applied migrations: ${appliedNames.join(', ')}`);
  }
  return appliedNames;
}
