/**
 * Seed script for the Overlay Wealth PostgreSQL store.
 *
 * Usage: `npm run db:seed` (requires DATABASE_URL).
 * Idempotent: upserts a demo user + progress, and inserts one demo donation.
 */
import 'dotenv/config';
import { isDbConfigured, ensureTables, query } from './client';
import { syncUser, syncProgress, syncDonation } from './sync';

async function main() {
  if (!isDbConfigured()) {
    console.error('[db:seed] DATABASE_URL is not set. Nothing to seed.');
    process.exit(1);
  }

  console.log('[db:seed] Ensuring tables...');
  await ensureTables();

  const now = new Date().toISOString();
  await syncUser(query, {
    id: 'demo-student-01',
    name: 'HBCU Fintech Scholar',
    role: 'student',
    track: 'all',
    badges: ['pioneer_scholar', 'underwriting_ace'],
    streakDays: 5,
    lastActive: now,
  });

  await syncProgress(query, {
    userId: 'demo-student-01',
    completedLessons: ['module-1-lesson-1', 'module-1-lesson-2'],
    completedModules: [],
    quizScores: { 'module-1': 100 },
    certificates: [],
  });

  await syncDonation(query, {
    id: 'don-001',
    userId: 'demo-student-01',
    amount: 50,
    tierLabel: 'Community Champion',
    timestamp: now,
  });

  console.log('[db:seed] Done. Demo user + progress + donation seeded.');
}

main().catch((err) => {
  console.error('[db:seed] Failed:', err);
  process.exit(1);
});
