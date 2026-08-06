/**
 * CLI entry for applying DB migrations: `npm run db:migrate`.
 */
import 'dotenv/config';
import { runMigrations } from './migrate';

runMigrations()
  .then((applied) => {
    console.log(`[db:migrate] ${applied.length > 0 ? `Applied ${applied.length} migration(s)` : 'Database up to date'}.`);
    process.exit(0);
  })
  .catch((err) => {
    console.error('[db:migrate] Failed:', err);
    process.exit(1);
  });
