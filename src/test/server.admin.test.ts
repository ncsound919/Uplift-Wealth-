import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import type { Server } from 'http';
import { signAccessToken } from '../lib/auth';

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
const realFetch = globalThis.fetch;

const ADMIN = signAccessToken({ id: 'admin-sys', role: 'admin' });
const STUDENT = signAccessToken({ id: 'creator-applicant', role: 'student' });

interface Res { status: number; json: any; headers: Headers; }

async function boot() {
  process.env.VERCEL = '1';
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

describe('server (admin, content CMS, creator, market proxy)', () => {
  beforeAll(async () => { await boot(); }, 60000);
  afterAll(async () => {
    vi.unstubAllGlobals();
    if (server) await new Promise<void>((r) => server.close(() => r()));
  });

  beforeEach(() => {
    // Pass local requests through to the real fetch; reject anything else so
    // the AlphaVantage proxy never hits the network and falls back to simulation.
    vi.stubGlobal('fetch', vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : String(input);
      return url.startsWith(baseUrl) ? realFetch(input, init) : Promise.reject(new Error('offline'));
    }));
  });

  it('content CMS: public read, admin write, authz', async () => {
    const empty = await req('GET', '/api/content/test-module-99/lesson-99');
    expect(empty.status).toBe(200);
    expect(empty.json.overridden).toBe(false);

    expect((await req('GET', '/api/content/overrides', { token: STUDENT })).status).toBe(403);

    const revisions = await req('GET', '/api/content/test-module-99/lesson-99/revisions', { token: ADMIN });
    expect(revisions.status).toBe(200);
    expect(revisions.json.revisions).toEqual([]);

    const save = await req('PUT', '/api/content/test-module-99/lesson-99', { token: ADMIN, body: { content: 'Updated lesson body' } });
    expect(save.status).toBe(200);
    expect(save.json.override.version).toBe(1);

    const overridden = await req('GET', '/api/content/test-module-99/lesson-99');
    expect(overridden.json.overridden).toBe(true);
    expect(overridden.json.content).toBe('Updated lesson body');

    const list = await req('GET', '/api/content/overrides', { token: ADMIN });
    expect(list.json.overrides.some((o: any) => o.moduleId === 'test-module-99' && o.lessonId === 'lesson-99' && o.content === 'Updated lesson body')).toBe(true);

    const del = await req('DELETE', '/api/content/test-module-99/lesson-99', { token: ADMIN });
    expect(del.status).toBe(200);
    const gone = await req('GET', '/api/content/test-module-99/lesson-99');
    expect(gone.json.overridden).toBe(false);
  });

  it('creator program: apply, status, review with authz', async () => {
    const applied = await req('POST', '/api/creator/apply', { token: STUDENT, body: { bio: 'I teach fintech at my HBCU', portfolioUrl: 'https://example.com' } });
    expect(applied.status).toBe(201);
    expect(applied.json.application.status).toBe('pending');
    const appId = applied.json.application.id;

    expect((await req('POST', '/api/creator/apply', { token: STUDENT, body: { bio: 'again' } })).status).toBe(409);
    expect((await req('POST', '/api/creator/apply', { token: STUDENT, body: {} })).status).toBe(400);

    const status = await req('GET', '/api/creator/status', { token: STUDENT });
    expect(status.status).toBe(200);
    expect(status.json.application.status).toBe('pending');

    expect((await req('GET', '/api/creator/applications', { token: STUDENT })).status).toBe(403);
    const apps = await req('GET', '/api/creator/applications', { token: ADMIN });
    expect(apps.status).toBe(200);
    expect(apps.json.applications.map((a: any) => a.id)).toContain(appId);

    expect((await req('PUT', `/api/creator/applications/${appId}`, { token: ADMIN, body: { status: 'maybe' } })).status).toBe(400);
    expect((await req('PUT', '/api/creator/applications/nope', { token: ADMIN, body: { status: 'approved' } })).status).toBe(404);

    const review = await req('PUT', `/api/creator/applications/${appId}`, { token: ADMIN, body: { status: 'approved' } });
    expect(review.status).toBe(200);
    expect(review.json.application.status).toBe('approved');

    const verified = await req('GET', '/api/creator/status', { token: STUDENT });
    expect(verified.json.verified).toBe(true);
  });

  it('admin: audit logs and metrics, gated to admins', async () => {
    const logs = await req('GET', '/api/admin/audit-logs', { token: ADMIN });
    expect(logs.status).toBe(200);
    expect(Array.isArray(logs.json.logs)).toBe(true);
    expect(logs.json.totalLogs).toBeGreaterThanOrEqual(0);
    expect((await req('GET', '/api/admin/audit-logs', { token: STUDENT })).status).toBe(403);

    const metrics = await req('GET', '/api/admin/metrics', { token: ADMIN });
    expect(metrics.status).toBe(200);
    expect((await req('GET', '/api/admin/metrics', { token: STUDENT })).status).toBe(403);
  });

  it('alphavantage proxy falls back to simulation with real-API error path', async () => {
    const quote = await req('GET', '/api/alphavantage/query?function=GLOBAL_QUOTE&symbol=AAPL');
    expect(quote.status).toBe(200);
    expect(quote.json['Global Quote']['01. symbol']).toBe('AAPL');

    const daily = await req('GET', '/api/alphavantage/query?function=TIME_SERIES_DAILY&symbol=SPY');
    expect(daily.json['Time Series (Daily)']).toBeTruthy();

    const intraday = await req('GET', '/api/alphavantage/query?function=TIME_SERIES_INTRADAY&interval=5min');
    expect(intraday.json['Time Series (5min)']).toBeTruthy();

    const sma = await req('GET', '/api/alphavantage/query?function=SMA&symbol=AAPL&time_period=20');
    expect(sma.json['Technical Analysis: SMA']).toBeTruthy();

    const rsi = await req('GET', '/api/alphavantage/query?function=RSI&symbol=AAPL');
    expect(rsi.json['Technical Analysis: RSI']).toBeTruthy();

    const other = await req('GET', '/api/alphavantage/query?function=WEIRD');
    expect(other.json.Note).toBe('Simulation active');

    const redirectQuote = await req('GET', '/api/alphavantage/quote/AAPL');
    expect(redirectQuote.json['Global Quote']).toBeTruthy();
    const redirectChart = await req('GET', '/api/alphavantage/chart/AAPL');
    expect(redirectChart.json['Time Series (Daily)']).toBeTruthy();
  });

  it('serves the sitemap XML on both paths', async () => {
    const api = await req('GET', '/api/sitemap.xml');
    expect(api.status).toBe(200);
    expect(api.headers.get('content-type')).toContain('xml');
    const root = await req('GET', '/sitemap.xml');
    expect(root.status).toBe(200);
    expect(root.json).toBeNull();
  });
});
