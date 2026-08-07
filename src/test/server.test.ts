import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import type { Server } from 'http';

vi.mock('../db/client', () => ({ isDbConfigured: () => false, ensureTables: vi.fn(), query: vi.fn() }));
vi.mock('../db/migrate', () => ({ runMigrations: vi.fn() }));
vi.mock('../db/sync', () => ({ syncFullDb: vi.fn(), loadFullDb: vi.fn().mockResolvedValue({ users: {}, progress: {} }) }));
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

interface Res {
  status: number;
  json: any;
  headers: Headers;
}

async function boot() {
  process.env.VERCEL = '1';
  const mod = await import('../../server');
  server = mod.default.listen(0);
  await new Promise<void>((r) => server.once('listening', r));
  const addr = server.address() as { port: number };
  baseUrl = `http://127.0.0.1:${addr.port}`;
}

async function req(
  method: string,
  path: string,
  opts: { body?: unknown; token?: string; headers?: Record<string, string> } = {}
): Promise<Res> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(opts.headers ?? {}) };
  if (opts.token) headers['Authorization'] = `Bearer ${opts.token}`;
  const res = await fetch(baseUrl + path, {
    method,
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });
  let json: any = null;
  try { json = await res.json(); } catch { /* non-JSON body */ }
  return { status: res.status, json, headers: res.headers };
}

describe('server (core flows)', () => {
  beforeAll(async () => { await boot(); }, 60000);
  afterAll(() => { if (server) return new Promise<void>((r) => server.close(() => r())); return undefined; });

  it('GET /api/health reports ok', async () => {
    const r = await req('GET', '/api/health');
    expect(r.status).toBe(200);
    expect(r.json.status).toBe('ok');
    expect(r.json.totalUsers).toBeGreaterThanOrEqual(1);
  });

  it('GET /api/docs lists the API surface', async () => {
    const r = await req('GET', '/api/docs');
    expect(r.status).toBe(200);
    expect(r.json.title).toContain('Open API');
    expect(r.json.endpoints.length).toBeGreaterThan(10);
  });

  it('register requires a valid email and an 8+ char password', async () => {
    expect((await req('POST', '/api/auth/register', { body: { email: 'nope', password: '12345678' } })).status).toBe(400);
    expect((await req('POST', '/api/auth/register', { body: { email: 'valid@test.dev', password: 'short' } })).status).toBe(400);
  });

  it('register creates an account and rejects duplicates', async () => {
    const r = await req('POST', '/api/auth/register', { body: { email: 'core.user@test.dev', password: 'password123', name: 'Core User' } });
    expect(r.status).toBe(201);
    expect(r.json.success).toBe(true);
    expect(r.json.token).toBeTruthy();
    expect(r.json.user.email).toBe('core.user@test.dev');
    expect(r.headers.get('set-cookie')).toContain('ow_refresh=');

    const dup = await req('POST', '/api/auth/register', { body: { email: 'core.user@test.dev', password: 'password123' } });
    expect(dup.status).toBe(409);
  });

  it('login succeeds with the right password and rejects the wrong one', async () => {
    const ok = await req('POST', '/api/auth/login', { body: { email: 'core.user@test.dev', password: 'password123' } });
    expect(ok.status).toBe(200);
    expect(ok.json.success).toBe(true);
    const bad = await req('POST', '/api/auth/login', { body: { email: 'core.user@test.dev', password: 'wrong-pass' } });
    expect(bad.status).toBe(401);
    const unknown = await req('POST', '/api/auth/login', { body: { email: 'ghost@test.dev', password: 'password123' } });
    expect(unknown.status).toBe(401);
  });

  it('google SSO creates a user and returns a token', async () => {
    const r = await req('POST', '/api/auth/google', { body: { email: 'sso.user@test.dev' } });
    expect(r.status).toBe(200);
    expect(r.json.success).toBe(true);
    expect(r.headers.get('set-cookie')).toContain('ow_refresh=');
    const bad = await req('POST', '/api/auth/google', { body: { email: 'not-an-email' } });
    expect(bad.status).toBe(400);
  });

  it('refresh exchanges a valid refresh cookie for a new token', async () => {
    const login = await req('POST', '/api/auth/login', { body: { email: 'core.user@test.dev', password: 'password123' } });
    const cookie = login.headers.get('set-cookie')!.split(';')[0];
    const ok = await req('POST', '/api/auth/refresh', { headers: { Cookie: cookie } });
    expect(ok.status).toBe(200);
    expect(ok.json.token).toBeTruthy();
    const noCookie = await req('POST', '/api/auth/refresh');
    expect(noCookie.status).toBe(401);
  });

  it('logout bumps the refresh token version, invalidating old cookies', async () => {
    const login = await req('POST', '/api/auth/login', { body: { email: 'core.user@test.dev', password: 'password123' } });
    const cookie = login.headers.get('set-cookie')!.split(';')[0];
    const out = await req('POST', '/api/auth/logout', { headers: { Cookie: cookie } });
    expect(out.status).toBe(200);
    const stale = await req('POST', '/api/auth/refresh', { headers: { Cookie: cookie } });
    expect(stale.status).toBe(401);
  });

  it('GET /api/auth/me returns the current user', async () => {
    const r = await req('GET', '/api/auth/me');
    expect(r.status).toBe(200);
    expect(r.json.user.id).toBe('demo-student-01');
  });

  it('profile get/update round-trips name and privacy', async () => {
    const get = await req('GET', '/api/user/profile');
    expect(get.status).toBe(200);
    const put = await req('PUT', '/api/user/profile', { body: { name: 'Renamed Scholar', profilePublic: true, track: 'advanced' } });
    expect(put.status).toBe(200);
    expect(put.json.name).toBe('Renamed Scholar');
    expect(put.json.track).toBe('advanced');
  });

  it('public profiles 404 for private users and expose public data when opted-in', async () => {
    const missing = await req('GET', '/api/profile/does-not-exist');
    expect(missing.status).toBe(404);
    const found = await req('GET', '/api/profile/demo-student-01');
    expect(found.status).toBe(200);
    expect(found.json.completedLessonsCount).toBeGreaterThan(0);
  });

  it('progress returns a snapshot and stats round-trip', async () => {
    const get = await req('GET', '/api/progress');
    expect(get.status).toBe(200);
    expect(Array.isArray(get.json.completedLessons)).toBe(true);
    const stats = await req('PUT', '/api/progress/stats', { body: { xp: 900, streakDays: 4, badges: ['wise_wizard'], gameTimeSeconds: 120 } });
    expect(stats.status).toBe(200);
    expect(stats.json.xp).toBe(900);
    expect(stats.json.streakDays).toBe(4);
  });

  it('lesson progress records a lesson and rejects missing ids', async () => {
    const ok = await req('POST', '/api/progress/lesson', { body: { lessonId: 'module-9-lesson-3', moduleId: 'module-9', stats: { xp: 120 } } });
    expect(ok.status).toBe(200);
    expect(ok.json.completedLessons).toContain('module-9-lesson-3');
    const bad = await req('POST', '/api/progress/lesson', { body: { moduleId: 'module-9' } });
    expect(bad.status).toBe(400);
  });

  it('quiz submit passes/fails and validates inputs', async () => {
    const pass = await req('POST', '/api/quiz/submit', { body: { moduleId: 'module-9', score: 9, totalQuestions: 10 } });
    expect(pass.status).toBe(200);
    expect(pass.json.passed).toBe(true);
    expect(pass.json.certificate.moduleId).toBe('module-9');
    const fail = await req('POST', '/api/quiz/submit', { body: { moduleId: 'module-10', score: 5, totalQuestions: 10 } });
    expect(fail.status).toBe(200);
    expect(fail.json.passed).toBe(false);
    expect(fail.json.certificate).toBeUndefined();
    expect((await req('POST', '/api/quiz/submit', { body: { moduleId: 'module-10' } })).status).toBe(400);
    expect((await req('POST', '/api/quiz/submit', { body: { moduleId: 'module-10', score: 11, totalQuestions: 10 } })).status).toBe(400);
  });

  it('sandbox save/load round-trips state and validates types', async () => {
    const save = await req('POST', '/api/sandbox/save', { body: { sandboxType: 'trading', stateData: { balance: 2500 } } });
    expect(save.status).toBe(200);
    expect(save.json.snapshot.sandboxType).toBe('trading');
    const replace = await req('POST', '/api/sandbox/save', { body: { sandboxType: 'trading', stateData: { balance: 9000 } } });
    expect(replace.json.snapshot.stateData).toEqual({ balance: 9000 });
    const load = await req('GET', '/api/sandbox/load?type=trading');
    expect(load.json.stateData).toEqual({ balance: 9000 });
    const all = await req('GET', '/api/sandbox/load');
    expect(all.json.sandboxes.length).toBe(1);
    expect((await req('POST', '/api/sandbox/save', { body: { sandboxType: 'weird', stateData: {} } })).status).toBe(400);
    expect((await req('POST', '/api/sandbox/save', { body: { sandboxType: 'trading' } })).status).toBe(400);
  });

  it('donation link, stats, and intents work with validation', async () => {
    const link = await req('GET', '/api/donation-link');
    expect(link.status).toBe(200);
    expect(link.json.url).toContain('stripe');
    const stats = await req('GET', '/api/donations/stats');
    expect(stats.status).toBe(200);
    expect(stats.json.totalPledged).toBeGreaterThanOrEqual(0);
    const intent = await req('POST', '/api/donation-intent', { body: { amount: 75, tierLabel: 'Builder' } });
    expect(intent.status).toBe(200);
    expect(intent.json.donation.amount).toBe(75);
    expect((await req('POST', '/api/donation-intent', { body: { amount: -5 } })).status).toBe(400);
  });

  it('waitlist captures an email and reports duplicates', async () => {
    const ok = await req('POST', '/api/waitlist', { body: { email: 'wait@test.dev', source: 'blog' } });
    expect(ok.status).toBe(200);
    expect(ok.json.success).toBe(true);
    const dup = await req('POST', '/api/waitlist', { body: { email: 'wait@test.dev' } });
    expect(dup.json.duplicate).toBe(true);
    expect((await req('POST', '/api/waitlist', { body: { email: 'nope' } })).status).toBe(400);
  });
});
