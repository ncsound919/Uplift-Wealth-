import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import type { Server } from 'http';

vi.mock('../db/client', () => ({ isDbConfigured: () => false, ensureTables: vi.fn(), query: vi.fn() }));
vi.mock('../db/migrate', () => ({ runMigrations: vi.fn() }));
vi.mock('../db/sync', () => ({ syncFullDb: vi.fn(), loadFullDb: vi.fn().mockResolvedValue({ users: {}, progress: {} }) }));
vi.mock('../lib/email', () => ({
  sendEmail: vi.fn().mockResolvedValue(undefined),
  sendWelcomeEmail: vi.fn().mockResolvedValue(undefined),
  sendWaitlistConfirmEmail: vi.fn().mockResolvedValue(undefined),
  escapeHtml: (s: string) => s,
}));
vi.mock('../lib/stripe', async (importOriginal) => {
  const orig = await importOriginal<typeof import('../lib/stripe')>();
  return {
    ...orig,
    isStripeConfigured: () => false,
    createCheckoutSession: vi.fn(),
    createPortalSession: vi.fn(),
    verifyWebhookSignature: () => true,
  };
});
vi.mock('../lib/ledger', () => ({ postLedgerEvent: vi.fn().mockResolvedValue(true) }));

import { postLedgerEvent } from '../lib/ledger';

let server: Server;
let baseUrl = '';

async function boot() {
  process.env.VERCEL = '1';
  process.env.AUTH_MODE = 'legacy';
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
  const mod = await import('../../server');
  server = mod.default.listen(0);
  await new Promise<void>((r) => server.once('listening', r));
  baseUrl = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
}

async function send(body: unknown, withSignature = true) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (withSignature) headers['stripe-signature'] = 't=1,v1=abc';
  return fetch(`${baseUrl}/api/billing/webhook`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
}

describe('billing webhook → ledger spine', () => {
  beforeAll(async () => {
    await boot();
  }, 60000);

  afterAll(() => {
    if (server) return new Promise<void>((r) => server.close(() => r()));
    return undefined;
  });

  beforeEach(() => {
    vi.mocked(postLedgerEvent).mockClear();
  });

  it('posts the first subscription payment as charge.settled', async () => {
    const res = await send({
      type: 'checkout.session.completed',
      data: { object: { id: 'cs_1', amount_total: 9900, customer: 'cus_1', subscription: 'sub_1' } },
    });
    expect(res.status).toBe(200);
    expect(postLedgerEvent).toHaveBeenCalledWith(
      expect.objectContaining({ kind: 'charge.settled', id: 'cs_1', amountCents: 9900 }),
    );
  });

  it('posts renewals from invoice.paid but skips the initial subscription_create', async () => {
    await send({
      type: 'invoice.paid',
      data: { object: { id: 'in_2', amount_paid: 9900, billing_reason: 'subscription_cycle' } },
    });
    expect(postLedgerEvent).toHaveBeenCalledWith(
      expect.objectContaining({ kind: 'charge.settled', id: 'in_2', amountCents: 9900 }),
    );

    vi.mocked(postLedgerEvent).mockClear();
    await send({
      type: 'invoice.paid',
      data: { object: { id: 'in_1', amount_paid: 9900, billing_reason: 'subscription_create' } },
    });
    expect(postLedgerEvent).not.toHaveBeenCalled();
  });

  it('does not post and rejects when the signature header is missing', async () => {
    const res = await send(
      { type: 'checkout.session.completed', data: { object: { id: 'cs_9', amount_total: 100 } } },
      false,
    );
    expect(res.status).toBe(400);
    expect(postLedgerEvent).not.toHaveBeenCalled();
  });
});
