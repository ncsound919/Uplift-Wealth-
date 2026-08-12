import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import type { Server } from 'http';
import { signAccessToken } from '../lib/auth';

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

const OWNER = signAccessToken({ id: 'cohort-owner', role: 'student' });
const MEMBER_A = signAccessToken({ id: 'cohort-member-a', role: 'student' });
const MEMBER_B = signAccessToken({ id: 'cohort-member-b', role: 'student' });

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

describe('server (community, cohorts, billing)', () => {
  beforeAll(async () => { await boot(); }, 60000);
  afterAll(() => { if (server) return new Promise<void>((r) => server.close(() => r())); return undefined; });

  it('threads: list, create, read, comment, upvote, report, delete', async () => {
    const list = await req('GET', '/api/threads', { token: OWNER });
    expect(list.status).toBe(200);
    expect(Array.isArray(list.json.threads)).toBe(true);
    const filtered = await req('GET', '/api/threads?moduleId=module-1&lessonId=l1', { token: OWNER });
    expect(filtered.status).toBe(200);

    const created = await req('POST', '/api/threads', { token: OWNER, body: { moduleId: 'module-1', title: 'Compound interest?', body: 'How does it work?' } });
    expect(created.status).toBe(201);
    const threadId = created.json.thread.id;

    const got = await req('GET', `/api/threads/${threadId}`, { token: OWNER });
    expect(got.status).toBe(200);
    expect(got.json.thread.id).toBe(threadId);

    const missing = await req('GET', '/api/threads/nope', { token: OWNER });
    expect(missing.status).toBe(404);

    const comment = await req('POST', `/api/threads/${threadId}/comments`, { token: MEMBER_A, body: { body: 'Great question!' } });
    expect(comment.status).toBe(201);
    const commentId = comment.json.comment.id;

    const up = await req('POST', `/api/threads/${threadId}/upvote`, { token: MEMBER_A });
    expect(up.status).toBe(200);
    expect(up.json.upvoted).toBe(true);

    const cup = await req('POST', `/api/comments/${commentId}/upvote`, { token: MEMBER_A });
    expect(cup.status).toBe(200);
    expect(cup.json.upvoted).toBe(true);

    const report = await req('POST', '/api/reports', { token: OWNER, body: { targetType: 'comment', targetId: commentId, reason: 'spam' } });
    expect(report.status).toBe(201);
    const badReport = await req('POST', '/api/reports', { token: OWNER, body: { targetType: 'video', targetId: commentId } });
    expect(badReport.status).toBe(400);

    const delComment = await req('DELETE', `/api/comments/${commentId}`, { token: MEMBER_A });
    expect(delComment.status).toBe(200);
    const delThread = await req('DELETE', `/api/threads/${threadId}`, { token: OWNER });
    expect(delThread.status).toBe(200);
  });

  it('cohorts: full institution lifecycle with authz', async () => {
    const created = await req('POST', '/api/cohorts', { token: OWNER, body: { name: 'Sunday Class', type: 'church', description: 'Finance circle' } });
    expect(created.status).toBe(201);
    const cohort = created.json.cohort;
    expect(cohort.ownerId).toBe('cohort-owner');

    const mine = await req('GET', '/api/cohorts', { token: OWNER });
    expect(mine.json.cohorts.map((c: any) => c.id)).toContain(cohort.id);

    const detail = await req('GET', `/api/cohorts/${cohort.id}`, { token: OWNER });
    expect(detail.status).toBe(200);
    expect(detail.json.cohort.id).toBe(cohort.id);
    expect((await req('GET', '/api/cohorts/nope', { token: OWNER })).status).toBe(404);

    const joinA = await req('POST', `/api/cohorts/${cohort.id}/join`, { token: MEMBER_A });
    expect(joinA.status).toBe(200);
    const joinB = await req('POST', '/api/cohorts/join', { token: MEMBER_B, body: { code: cohort.inviteCode } });
    expect(joinB.status).toBe(200);
    expect((await req('POST', '/api/cohorts/join', { token: MEMBER_B, body: { code: 'ZZZZZZ' } })).status).toBe(400);

    const curriculum = await req('PUT', `/api/cohorts/${cohort.id}/curriculum`, { token: OWNER, body: { moduleIds: ['module-1', 'module-2'] } });
    expect(curriculum.status).toBe(200);
    expect(curriculum.json.cohort.moduleIds).toEqual(['module-1', 'module-2']);

    const roster = await req('GET', `/api/cohorts/${cohort.id}/roster`, { token: OWNER });
    expect(roster.status).toBe(200);
    expect(roster.json.roster.map((m: any) => m.id).sort()).toEqual(['cohort-member-a', 'cohort-member-b']);
    expect((await req('GET', `/api/cohorts/${cohort.id}/roster`, { token: MEMBER_A })).status).toBe(400);

    const classes = await req('GET', '/api/institution/classes', { token: OWNER });
    expect(classes.status).toBe(200);
    expect(classes.json.classes[0].cohort.id).toBe(cohort.id);
    expect(classes.json.classes[0].roster.length).toBe(2);

    const leave = await req('POST', `/api/cohorts/${cohort.id}/leave`, { token: MEMBER_A });
    expect(leave.status).toBe(200);
    const denyDelete = await req('DELETE', `/api/cohorts/${cohort.id}`, { token: MEMBER_A });
    expect(denyDelete.status).toBe(400);
    const deleted = await req('DELETE', `/api/cohorts/${cohort.id}`, { token: OWNER });
    expect(deleted.status).toBe(200);
  });

  it('notifications: list, read, read-all', async () => {
    const t = await req('POST', '/api/threads', { token: OWNER, body: { title: 'Notify me', body: 'x' } });
    const threadId = t.json.thread.id;
    await req('POST', `/api/threads/${threadId}/comments`, { token: MEMBER_A, body: { body: 'reply' } });

    const list = await req('GET', '/api/notifications', { token: OWNER });
    expect(list.status).toBe(200);
    expect(list.json.notifications.length).toBeGreaterThan(0);
    const notif = list.json.notifications[0];

    const read = await req('POST', `/api/notifications/${notif.id}/read`, { token: OWNER });
    expect(read.status).toBe(200);
    expect(read.json.notification.read).toBe(true);
    expect((await req('POST', '/api/notifications/nope/read', { token: OWNER })).status).toBe(404);

    const all = await req('POST', '/api/notifications/read-all', { token: OWNER });
    expect(all.status).toBe(200);
    expect(typeof all.json.changed).toBe('number');

    const after = await req('GET', '/api/notifications', { token: OWNER });
    expect(after.json.unreadCount).toBe(0);
  });

  it('billing: plans, status, checkout, portal, webhook', async () => {
    const plans = await req('GET', '/api/billing/plans');
    expect(plans.status).toBe(200);
    expect(plans.json.plans.map((p: any) => p.id)).toEqual(['free', 'institutional']);
    expect(plans.json.plans.find((p: any) => p.id === 'institutional').monthly).toBe(99);

    const reg = await req('POST', '/api/auth/register', { body: { email: 'school@test.dev', password: 'password123', name: 'School' } });
    expect(reg.status).toBe(201);
    const token = reg.json.token;

    const status = await req('GET', '/api/billing/status', { token });
    expect(status.status).toBe(200);
    expect(status.json.tier).toBe('free');
    expect(status.json.email).toBe('school@test.dev');

    expect((await req('POST', '/api/billing/checkout', { token, body: { tier: 'premium' } })).status).toBe(400);
    expect((await req('POST', '/api/billing/checkout', { token, body: { tier: 'institutional' } })).status).toBe(503);
    expect((await req('POST', '/api/billing/checkout', { token: OWNER, body: { tier: 'institutional' } })).status).toBe(400);

    stripeMocks.configured = true;
    stripeMocks.createCheckoutSession.mockResolvedValue({ url: 'https://checkout.example/x' });
    const checkout = await req('POST', '/api/billing/checkout', { token, body: { tier: 'institutional' } });
    expect(checkout.status).toBe(200);
    expect(checkout.json.url).toBe('https://checkout.example/x');

    expect((await req('POST', '/api/billing/portal', { token })).status).toBe(400);

    const noSig = await req('POST', '/api/billing/webhook', { headers: { 'stripe-signature': 'sig' }, body: {} });
    expect(noSig.status).toBe(400);

    stripeMocks.verifyWebhookSignature.mockReturnValue(true);

    const completed = await req('POST', '/api/billing/webhook', {
      headers: { 'stripe-signature': 'sig' },
      body: { type: 'checkout.session.completed', data: { object: { id: 'cs_1', customer: 'cus_1', subscription: 'sub_1', customer_email: 'school@test.dev' } } },
    });
    expect(completed.status).toBe(200);
    expect(completed.json.received).toBe(true);
    const upgraded = await req('GET', '/api/billing/status', { token });
    expect(upgraded.json.tier).toBe('institutional');
    expect(upgraded.json.hasStripeCustomer).toBe(true);

    stripeMocks.createPortalSession.mockResolvedValue({ url: 'https://portal.example/x' });
    const portal = await req('POST', '/api/billing/portal', { token });
    expect(portal.status).toBe(200);
    expect(portal.json.url).toBe('https://portal.example/x');

    const deleted = await req('POST', '/api/billing/webhook', {
      headers: { 'stripe-signature': 'sig' },
      body: { type: 'customer.subscription.deleted', data: { object: { id: 'sub_1' } } },
    });
    expect(deleted.status).toBe(200);
    const reset = await req('GET', '/api/billing/status', { token });
    expect(reset.json.tier).toBe('free');
  });
});
