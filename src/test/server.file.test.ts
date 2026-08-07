import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import type { Server } from 'http';
import fs from 'fs';
import os from 'os';
import path from 'path';

vi.mock('../db/client', () => ({ isDbConfigured: () => true, ensureTables: vi.fn(), query: vi.fn() }));
vi.mock('../db/migrate', () => ({ runMigrations: vi.fn() }));
vi.mock('../db/sync', () => ({
  syncFullDb: vi.fn(),
  loadFullDb: vi.fn().mockResolvedValue({ users: {}, progress: {}, sandboxes: {}, donations: [], auditLogs: [], waitlist: [], threads: [], comments: [], reports: [], cohorts: [], notifications: [], lessonOverrides: [], contentRevisions: [], creatorApplications: [] }),
}));
// Non-VERCEL boots call startServer() → the dev branch dynamically imports Vite
// (whose esbuild binary can't load under jsdom). Provide a lightweight mock.
const viteMocks = vi.hoisted(() => ({
  createServer: vi.fn(),
  middlewares: Object.assign((_req: unknown, _res: unknown, next: () => void) => next(), { handle: vi.fn() }),
}));
vi.mock('vite', () => ({
  createServer: () => Promise.resolve({ middlewares: viteMocks.middlewares }),
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
let dataDir = '';

describe('server (file store, normalizeDb, dual-write debounce, CORS)', () => {
  beforeAll(async () => {
    dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ow-test-'));
    // A legacy store.json missing the newer collections exercises normalizeDb().
    fs.writeFileSync(
      path.join(dataDir, 'store.json'),
      JSON.stringify({ users: { u1: { id: 'u1', name: 'File User', role: 'student', track: 'all', badges: [], streakDays: 1, lastActive: 't' } } })
    );
    process.env.DATA_DIR = dataDir;
    process.env.ALLOWED_ORIGINS = 'https://trusted.example';

    const mod = await import('../../server');
    server = mod.default.listen(0);
    await new Promise<void>((r) => server.once('listening', r));
    baseUrl = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
  }, 60000);
  afterAll(async () => {
    if (server) await new Promise<void>((r) => server.close(() => r()));
    try { fs.rmSync(dataDir, { recursive: true, force: true }); } catch { /* ignore */ }
  });

  it('loads legacy stores through normalizeDb and writes the file store', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.totalUsers).toBe(1); // the legacy file user survives hydration
    // Wait for the async file write to land, then confirm it round-trips.
    await new Promise((r) => setTimeout(r, 100));
    const onDisk = JSON.parse(fs.readFileSync(path.join(dataDir, 'store.json'), 'utf-8'));
    expect(onDisk.users.u1.name).toBe('File User');
    expect(Array.isArray(onDisk.cohorts)).toBe(true); // normalizeDb added the collection
  });

  it('applies CORS allow-lists and reflects only trusted origins', async () => {
    const trusted = await fetch(`${baseUrl}/api/health`, { headers: { Origin: 'https://trusted.example' } });
    expect(trusted.headers.get('access-control-allow-origin')).toBe('https://trusted.example');
    const evil = await fetch(`${baseUrl}/api/health`, { headers: { Origin: 'https://evil.example' } });
    expect(evil.headers.get('access-control-allow-origin')).toBeFalsy();
    const noOrigin = await fetch(`${baseUrl}/api/health`);
    expect(noOrigin.headers.get('access-control-allow-origin')).toBeFalsy();
  });

  it('triggers multiple synchronous writes and the Postgres debounce without crashing', async () => {
    for (let i = 0; i < 5; i++) {
      const res = await fetch(`${baseUrl}/api/health`);
      expect(res.status).toBe(200);
    }
    await new Promise((r) => setTimeout(r, 50));
  });
});
