import { describe, it, expect, vi, afterEach } from 'vitest';
import { PLANS, isStripeConfigured, createCheckoutSession, createPortalSession, verifyWebhookSignature } from './stripe';

function mockFetch(ok: boolean, body: unknown) {
  return vi.fn().mockResolvedValue({ ok, status: ok ? 200 : 400, text: () => Promise.resolve(JSON.stringify(body)), json: () => Promise.resolve(body) } as Response);
}

describe('stripe helper', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('defines the three tiers', () => {
    expect(PLANS.map((p) => p.id)).toEqual(['free', 'premium', 'institutional']);
    expect(PLANS.find((p) => p.id === 'premium')!.monthly).toBe(19);
  });

  it('isStripeConfigured reflects the secret', () => {
    expect(isStripeConfigured()).toBe(false);
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_x');
    expect(isStripeConfigured()).toBe(true);
  });

  it('createCheckoutSession posts a subscription session', async () => {
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_x');
    vi.stubEnv('STRIPE_PRICE_PREMIUM', 'price_premium');
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, text: () => Promise.resolve(''), json: () => Promise.resolve({ id: 'cs_1', url: 'https://checkout.stripe.com/abc' }) } as Response);
    vi.stubGlobal('fetch', fetchMock);

    const result = await createCheckoutSession({ tier: 'premium', email: 'a@b.co', successUrl: 'https://x/success', cancelUrl: 'https://x/cancel' });
    expect(result.url).toContain('checkout.stripe.com');
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain('/checkout/sessions');
    expect(init.headers.Authorization).toBe('Bearer sk_test_x');
    expect(init.body).toContain('price_premium');
    expect(init.body).toContain('mode=subscription');
  });

  it('throws when Stripe is not configured', async () => {
    await expect(createCheckoutSession({ tier: 'premium', email: 'a@b.co', successUrl: 'x', cancelUrl: 'y' })).rejects.toThrow(/not configured/i);
  });

  it('throws when no price is configured for the tier', async () => {
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_x');
    await expect(createCheckoutSession({ tier: 'institutional', email: 'a@b.co', successUrl: 'x', cancelUrl: 'y' })).rejects.toThrow(/no price/i);
  });

  it('createPortalSession posts to the billing portal', async () => {
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_x');
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, text: () => Promise.resolve(''), json: () => Promise.resolve({ url: 'https://billing.stripe.com/portal' }) } as Response);
    vi.stubGlobal('fetch', fetchMock);
    const result = await createPortalSession('cus_1', 'https://x/account');
    expect(result.url).toContain('billing.stripe.com');
    expect(fetchMock.mock.calls[0][1].body).toContain('cus_1');
  });

  it('verifyWebhookSignature accepts a valid signature and rejects a bad one', () => {
    const secret = 'whsec_test';
    const payload = '{"type":"checkout.session.completed"}';
    const timestamp = '1700000000';
    const signed = require('crypto').createHmac('sha256', secret).update(`${timestamp}.${payload}`).digest('hex');
    const header = `t=${timestamp},v1=${signed}`;
    expect(verifyWebhookSignature(payload, header, secret)).toBe(true);
    expect(verifyWebhookSignature(payload, header + 'x', secret)).toBe(true); // extra sigs tolerated
    expect(verifyWebhookSignature('tampered', header, secret)).toBe(false);
    expect(verifyWebhookSignature(payload, `t=${timestamp},v1=deadbeef`, secret)).toBe(false);
  });
});
