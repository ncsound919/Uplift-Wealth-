import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import type { Server } from 'http';
import { signAccessToken, signRefreshToken, REFRESH_COOKIE_NAME } from '../lib/auth';

const ADMIN = signAccessToken({ id: 'edge-admin', role: 'admin' });

const stripeMocks = vi.hoisted(() => ({
  configured: false,
  createCheckoutSession: vi.fn(),
  createPortalSession: vi.fn(),
  verifyWebhookSignature: vi.fn(),
}));

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
    isStripeConfigured: () => stripeMocks.configured,
    createCheckoutSession: stripeMocks.createCheckoutSession,
    createPortalSession: stripeMocks.createPortalSession,
    verifyWebhookSignature: stripeMocks.verifyWebhookSignature,
  };
});

let server: Server;
let baseUrl = '';
const realFetch = globalThis.fetch;

interface Res { status: number; json: any; headers: Headers; }

async function boot() {
  process.env.VERCEL = '1';
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
  const mod = await import('../../server');
  // Legacy JWT auth path (supabase mode is covered in supabaseAuth.test.ts).
  process.env.AUTH_MODE = 'legacy';
  server = mod.default.listen(0);
  await new Promise<void>((r) => server.once('listening', r));
  baseUrl = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
}

async function req(method: string, path: string, opts: { body?: unknown; token?: string; headers?: Record<string, string> } = {}): Promise<Res> {
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

describe('server (edge cases, validation, errors)', () => {
  beforeAll(async () => { await boot(); }, 60000);
  afterAll(async () => {
    vi.unstubAllGlobals();
    if (server) await new Promise<void>((r) => server.close(() => r()));
  });

  beforeEach(() => {
    // Local requests pass through; anything external is blocked (simulation path).
    vi.stubGlobal('fetch', vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : String(input);
      return url.startsWith(baseUrl) ? realFetch(input, init) : Promise.reject(new Error('offline'));
    }));
  });
  afterEach(() => { delete process.env.ALPHA_VANTAGE_API_KEY; });

  it('handles OPTIONS preflight and malformed JSON bodies', async () => {
    const preflight = await fetch(`${baseUrl}/api/health`, { method: 'OPTIONS' });
    expect(preflight.status).toBe(204);
    const malformed = await fetch(`${baseUrl}/api/health`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{not json',
    });
    expect(malformed.status).toBe(400);
  });

  it('register works without an explicit name', async () => {
    const r = await req('POST', '/api/auth/register', { body: { email: 'noname@test.dev', password: 'password123' } });
    expect(r.status).toBe(201);
    expect(r.json.user.name).toBe('noname');
  });

  it('profile update ignores invalid role/avatar and keeps others', async () => {
    const put = await req('PUT', '/api/user/profile', {
      body: { role: 'superuser', avatar: 'x'.repeat(3000), track: 'beginner', profilePublic: 'yes' },
    });
    expect(put.status).toBe(200);
    expect(put.json.role).toBe('student'); // role unchanged (invalid value rejected)
    expect(put.json.track).toBe('beginner');
    expect(put.json.profilePublic).not.toBe('yes'); // non-boolean rejected
  });

  it('stats endpoint ignores malformed numeric fields', async () => {
    const r = await req('PUT', '/api/progress/stats', { body: { xp: 'lots', gameTimeSeconds: -5, streakDays: 'x', badges: 'not-an-array' } });
    expect(r.status).toBe(200);
    expect(typeof r.json.xp).toBe('number');
    expect(typeof r.json.gameTimeSeconds).toBe('number');
    expect(typeof r.json.streakDays).toBe('number');
    expect(Array.isArray(r.json.badges)).toBe(true);
  });

  it('lesson stats ignore non-numeric xp but still record the lesson', async () => {
    const r = await req('POST', '/api/progress/lesson', { body: { lessonId: 'module-2-lesson-1', moduleId: 'module-2', stats: { xp: 'nope', badges: 5 } } });
    expect(r.status).toBe(200);
    expect(r.json.completedLessons).toContain('module-2-lesson-1');
  });

  it('quiz resubmit reuses the existing certificate', async () => {
    const first = await req('POST', '/api/quiz/submit', { body: { moduleId: 'module-3', score: 10, totalQuestions: 10 } });
    expect(first.json.passed).toBe(true);
    const certId = first.json.certificate.issuedAt;
    const second = await req('POST', '/api/quiz/submit', { body: { moduleId: 'module-3', score: 9, totalQuestions: 10 } });
    expect(second.json.certificate.issuedAt).toBe(certId);
    expect(second.json.userProgress.certificates.length).toBe(1);
  });

  it('sandbox save accepts notes', async () => {
    const r = await req('POST', '/api/sandbox/save', { body: { sandboxType: 'capstone', stateData: { v: 1 }, notes: 'prototype' } });
    expect(r.json.snapshot.notes).toBe('prototype');
  });

  it('donation and waitlist fall back to defaults for missing fields', async () => {
    const don = await req('POST', '/api/donation-intent', { body: { amount: 10 } });
    expect(don.json.donation.tierLabel).toBe('Supporter');
    const wl = await req('POST', '/api/waitlist', { body: { email: 'nomsg@test.dev' } });
    expect(wl.json.success).toBe(true);
  });

  it('cohort creation validates name and accepts club type without description', async () => {
    expect((await req('POST', '/api/cohorts', { body: { name: '   ' } })).status).toBe(400);
    const r = await req('POST', '/api/cohorts', { body: { name: 'Investing Club', type: 'club' } });
    expect(r.status).toBe(201);
    expect(r.json.cohort.type).toBe('club');
    expect(r.json.cohort.description).toBeUndefined();
  });

  it('curriculum assignment tolerates a non-array payload', async () => {
    const c = await req('POST', '/api/cohorts', { body: { name: 'Sparse' } });
    const id = c.json.cohort.id;
    const r = await req('PUT', `/api/cohorts/${id}/curriculum`, { body: { moduleIds: 'module-1' } });
    expect(r.status).toBe(200);
    expect(r.json.cohort.moduleIds).toEqual([]);
  });

  it('content override requires content', async () => {
    const r = await req('PUT', '/api/content/module-9/lesson-1', { token: ADMIN, body: {} });
    expect(r.status).toBe(400);
  });

  it('creator apply ignores an empty portfolio URL', async () => {
    const r = await req('POST', '/api/creator/apply', { body: { bio: 'I teach', portfolioUrl: '   ' } });
    expect(r.status).toBe(201);
    expect(r.json.application.portfolioUrl).toBeUndefined();
  });

  it('billing surfaces upstream Stripe failures as 502', async () => {
    const reg = await req('POST', '/api/auth/register', { body: { email: 'edge.school@test.dev', password: 'password123' } });
    const token = reg.json.token;

    stripeMocks.configured = true;
    stripeMocks.createCheckoutSession.mockRejectedValue(new Error('stripe boom'));
    const checkout = await req('POST', '/api/billing/checkout', { token, body: { tier: 'institutional' } });
    expect(checkout.status).toBe(502);
    expect(checkout.json.error).toContain('stripe boom');

    stripeMocks.verifyWebhookSignature.mockReturnValue(true);
    await req('POST', '/api/billing/webhook', {
      headers: { 'stripe-signature': 'sig' },
      body: { type: 'checkout.session.completed', data: { object: { id: 'cs_2', customer: 'cus_2', subscription: 'sub_2', customer_email: 'edge.school@test.dev' } } },
    });
    stripeMocks.createPortalSession.mockRejectedValue(new Error('portal boom'));
    const portal = await req('POST', '/api/billing/portal', { token });
    expect(portal.status).toBe(502);
    expect(portal.json.error).toContain('portal boom');
  });

  it('alphavantage caches and can hit the live API branch', async () => {
    const first = await req('GET', '/api/alphavantage/query?function=TIME_SERIES_DAILY&symbol=SPY');
    expect(first.json['Time Series (Daily)']).toBeTruthy();
    const second = await req('GET', '/api/alphavantage/query?function=TIME_SERIES_DAILY&symbol=SPY');
    expect(second.json['Time Series (Daily)']).toBeTruthy(); // served from cache

    const unknown = await req('GET', '/api/alphavantage/query?function=GLOBAL_QUOTE&symbol=UNKNOWN');
    expect(unknown.json['Global Quote']['01. symbol']).toBe('UNKNOWN');

    process.env.ALPHA_VANTAGE_API_KEY = 'test-key';
    vi.stubGlobal('fetch', vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : String(input);
      if (url.startsWith('https://www.alphavantage.co/')) return Promise.resolve({ ok: true, json: () => Promise.resolve({ live: 'yes' }) } as Response);
      return url.startsWith(baseUrl) ? realFetch(input, init) : Promise.reject(new Error('offline'));
    }));
    const live = await req('GET', '/api/alphavantage/query?function=GLOBAL_QUOTE&symbol=AAPL');
    expect(live.json).toEqual({ live: 'yes' });
  });

  it('handles google-created accounts: re-login, missing passwordHash, empty progress', async () => {
    const first = await req('POST', '/api/auth/google', { body: { email: 'repeat.sso@test.dev' } });
    const googleToken = first.json.token;
    const second = await req('POST', '/api/auth/google', { body: { email: 'repeat.sso@test.dev' } });
    expect(second.status).toBe(200);
    expect(second.json.token).toBeTruthy();

    // Google accounts have no passwordHash → email login is rejected.
    const login = await req('POST', '/api/auth/login', { body: { email: 'repeat.sso@test.dev', password: 'whatever123' } });
    expect(login.status).toBe(401);

    // Fresh accounts exercise the default progress snapshot + stats/lesson fallbacks.
    const progress = await req('GET', '/api/progress', { token: googleToken });
    expect(progress.json.completedLessons).toEqual([]);
    const stats = await req('PUT', '/api/progress/stats', { token: googleToken, body: { xp: 5 } });
    expect(stats.json.xp).toBe(5);
    const lesson = await req('POST', '/api/progress/lesson', { token: googleToken, body: { lessonId: 'module-4-lesson-1', moduleId: 'module-4' } });
    expect(lesson.json.completedLessons).toContain('module-4-lesson-1');
    const quiz = await req('POST', '/api/quiz/submit', { token: googleToken, body: { moduleId: 'module-4', score: 8, totalQuestions: 10 } });
    expect(quiz.json.passed).toBe(true);
  });

  it('logout without a cookie still succeeds', async () => {
    const r = await req('POST', '/api/auth/logout');
    expect(r.status).toBe(200);
  });

  it('refresh honors a valid token for an unknown user', async () => {
    const ghostRefresh = signRefreshToken({ id: 'ghost-user', role: 'student' });
    const cookie = `${REFRESH_COOKIE_NAME}=${encodeURIComponent(ghostRefresh)}`;
    const r = await req('POST', '/api/auth/refresh', { headers: { Cookie: cookie } });
    expect(r.status).toBe(200);
    expect(r.json.user.id).toBe('ghost-user');
    expect(r.json.user.role).toBe('student');
  });

  it('profile update accepts a valid role and avatar', async () => {
    const r = await req('PUT', '/api/user/profile', { body: { role: 'builder', avatar: 'https://example.com/a.png' } });
    expect(r.status).toBe(200);
    expect(r.json.role).toBe('builder');
    expect(r.json.avatar).toBe('https://example.com/a.png');
  });

  it('cohort creation falls back to general type for unknown types', async () => {
    const r = await req('POST', '/api/cohorts', { body: { name: 'Mystery Circle', type: 'nonsense' } });
    expect(r.status).toBe(201);
    expect(r.json.cohort.type).toBe('general');
  });

  it('rate limits abusive clients with 429', async () => {
    let got429 = 0;
    let last = 0;
    for (let i = 0; i < 130; i++) {
      const res = await fetch(`${baseUrl}/api/health`);
      last = res.status;
      if (res.status === 429) got429++;
    }
    expect(got429).toBeGreaterThan(0);
    expect(last).toBe(429);
  });
});
