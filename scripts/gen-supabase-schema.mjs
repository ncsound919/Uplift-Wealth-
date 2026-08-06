// Generates supabase-schema.sql from src/db/migrations/*.sql for import into
// the Supabase SQL Editor (creates tables + marks migrations as applied).
import { splitSqlStatements } from '../src/db/client.ts';
import fs from 'fs';
import path from 'path';

const dir = path.join(process.cwd(), 'src', 'db', 'migrations');
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();

let out = `-- Overlay Wealth - Supabase schema import
-- Generated from src/db/migrations/*.sql
-- Run this in: Supabase Dashboard -> SQL Editor -> New query -> Run
-- It creates all tables AND marks the app's migrations as applied so the
-- app won't try to re-run them on first boot.

CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at text NOT NULL);

`;

for (const f of files) {
  out += `-- ===== ${f} =====\n`;
  for (const s of splitSqlStatements(fs.readFileSync(path.join(dir, f), 'utf-8'))) {
    out += `${s}\n`;
  }
  out += '\n';
}

out += '-- Mark all migrations as applied (the app skips these on boot)\nINSERT INTO schema_migrations (name, applied_at) VALUES\n';
out += files.map((f) => `  ('${f}', now())`).join(',\n') + ';\n';

fs.writeFileSync(path.join(process.cwd(), 'supabase-schema.sql'), out);
console.log(`wrote supabase-schema.sql (${out.split('\n').length} lines)`);
