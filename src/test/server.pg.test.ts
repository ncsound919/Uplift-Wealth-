import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import type { Server } from 'http';
import { signAccessToken } from '../lib/auth';

const PG_TOKEN = signAccessToken({ id: 'pg1', role: 'student' });

const pgMocks = vi.hoisted(() => ({
  users: {
    pg1: { id: 'pg1', name: 'Postgres User', role: 'student', track: 'all', badges: ['pioneer_scholar'], streakDays: 2, lastActive: 't' },
  },
  donations: [{ id: 'don-pg', userId: 'pg1', amount: 25, tierLabel: 'Supporter', timestamp: 't' }],
  threads: [{ id: 'th-pg', userId: 'pg1', title: 'PG Thread', body: 'x', createdAt: 't', upvotedBy: [] }],
  cohorts: [{ id: 'coh-pg', name: 'PG Class', type: 'general', ownerId: 'pg1', createdAt: 't', memberIds: ['pg1'], inviteCode: 'PG1234' }],
  notifications: [{ id: 'not-pg', userId: 'pg1', type: 'system', title: 'Hi', message: 'Welcome', read: false, createdAt: 't' }],
  lessonOverrides: [{ id: 'ov-pg', moduleId: 'm1', lessonId: 'l1', content: 'c', version: 1, updatedBy: 'pg1', updatedAt: 't' }],
  contentRevisions: [{ id: 'rev-pg', moduleId: 'm1', lessonId: 'l1', content: 'c', version: 1, updatedBy: 'pg1', updatedAt: 't' }],
  creatorApplications: [{ id: 'cre-pg', userId: 'pg1', bio: 'bio', status: 'pending', createdAt: 't' }],
}));

vi.mock('../db/client', () => ({
  isDbConfigured: () => true,
  ensureTables: vi.fn(),
  query: vi.fn(),
}));
vi.mock('../db/migrate', () => ({ runMigrations: vi.fn() }));
vi.mock('../db/sync', () => ({
  syncFullDb: vi.fn(),
  loadFullDb: vi.fn().mockResolvedValue({
    users: pgMocks.users,
    progress: {},
    sandboxes: {},
    donations: pgMocks.donations,
    auditLogs: [],
    waitlist: [],
    threads: pgMocks.threads,
    comments: [],
    reports: [],
    cohorts: pgMocks.cohorts,
    notifications: pgMocks.notifications,
    lessonOverrides: pgMocks.lessonOverrides,
    contentRevisions: pgMocks.contentRevisions,
    creatorApplications: pgMocks.creatorApplications,
  }),
}));
vi.mock('../lib/email', async (importOriginal) => {
  const orig = await importOriginal<typeof import('../lib/email')>();
  return {
    ...orig,
    sendEmail: vi.fn().mockResolvedValue(undefined),
    sendWelcomeEmail: vi.fn().mockResolvedValue(undefined),
    sendWaitlistConfirmEmail: vi.fn().mockResolvedValue(undefined),
  };
});
vi.mock('../lib/stripe', async (importOriginal) => {
  const orig = await importOriginal<typeof import('../lib/stripe')>();
  return {
    ...orig,
    isStripeConfigured: () => false,
    createCheckoutSession: vi.fn(),
    createPortalSession: vi.fn(),
    verifyWebhookSignature: vi.fn(),
  };
});

let server: Server;
let baseUrl = '';

describe('server (Postgres hydration & dual-write)', () => {
  beforeAll(async () => {
    process.env.VERCEL = '1';
    const mod = await import('../../server');
    // Allow the async hydration block inside initDatabase() to settle.
    await new Promise((r) => setTimeout(r, 50));
    server = mod.default.listen(0);
    await new Promise<void>((r) => server.once('listening', r));
    baseUrl = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
  }, 60000);
  afterAll(() => { if (server) return new Promise<void>((r) => server.close(() => r())); return undefined; });

  it('hydrates the in-memory store from Postgres with merge dedupe', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    const body = await res.json();
    expect(res.status).toBe(200);
    // Local file users survive the merge and Postgres users are added on top.
    expect(body.totalUsers).toBeGreaterThanOrEqual(2);
  });

  it('merged collections are reachable through the API', async () => {
    const threads = await fetch(`${baseUrl}/api/threads`, { headers: { 'X-User-Id': 'demo-student-01' } });
    const t = await threads.json();
    expect(t.threads.map((x: any) => x.id)).toContain('th-pg');
    const cohorts = await fetch(`${baseUrl}/api/cohorts`, { headers: { Authorization: `Bearer ${PG_TOKEN}` } });
    const c = await cohorts.json();
    expect(c.cohorts.map((x: any) => x.id)).toContain('coh-pg');
  });
});
