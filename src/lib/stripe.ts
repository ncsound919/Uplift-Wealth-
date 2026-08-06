/**
 * Server-side Stripe billing helpers (raw HTTP, no SDK dependency).
 * All functions are no-ops/guarded when STRIPE_SECRET_KEY is unset so local dev
 * and tests never touch Stripe. Price IDs come from env:
 *   STRIPE_PRICE_PREMIUM / STRIPE_PRICE_INSTITUTIONAL
 */
import crypto from 'crypto';

export const STRIPE_API = 'https://api.stripe.com/v1';

export interface Plan {
  id: 'free' | 'institutional';
  name: string;
  monthly: number;
  description: string;
  features: string[];
}

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free Member',
    monthly: 0,
    description: 'Complete access to the full curriculum — no paywalls.',
    features: ['All 16 modules', 'Games & simulators', 'Community discussions & groups', 'Wealth Building chapters', 'Certificates of completion'],
  },
  {
    id: 'institutional',
    name: 'Institutional',
    monthly: 99,
    description: 'For classrooms, HBCU chapters, churches, and community orgs.',
    features: ['Up to 50 seats', 'Group & classroom management', 'Teacher roster analytics', 'Classroom curriculum guide (PDF)', 'Priority support'],
  },
];

/** Stripe price IDs are read from env at call time (not import time). */
export function priceIdFor(tier: 'institutional'): string | undefined {
  return process.env.STRIPE_PRICE_INSTITUTIONAL;
}

export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}

function authHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
    'Content-Type': 'application/x-www-form-urlencoded',
  };
}

async function stripePost<T>(path: string, params: Record<string, string | undefined>): Promise<T> {
  const body = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') body.set(k, v);
  }
  const res = await fetch(`${STRIPE_API}${path}`, {
    method: 'POST',
    headers: authHeaders(),
    body: body.toString(),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Stripe ${res.status}: ${detail.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

export interface CheckoutResult {
  url: string | null;
  sessionId: string;
}

/** Create a subscription Checkout session for the institutional tier. */
export async function createCheckoutSession(input: {
  tier: 'institutional';
  email: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<CheckoutResult> {
  if (!isStripeConfigured()) throw new Error('Stripe is not configured. Set STRIPE_SECRET_KEY.');
  const plan = PLANS.find((p) => p.id === input.tier);
  const priceId = priceIdFor(input.tier);
  if (!plan || !priceId) throw new Error(`No price configured for the ${input.tier} tier (STRIPE_PRICE_${input.tier.toUpperCase()}).`);

  const data = await stripePost<{ id: string; url: string | null }>('/checkout/sessions', {
    mode: 'subscription',
    'line_items[0][price]': priceId,
    'line_items[0][quantity]': '1',
    'customer_email': input.email,
    'success_url': input.successUrl,
    'cancel_url': input.cancelUrl,
    'metadata[tier]': input.tier,
  });
  return { url: data.url, sessionId: data.id };
}

/** Create a billing portal session for an existing customer. */
export async function createPortalSession(customerId: string, returnUrl: string): Promise<{ url: string }> {
  if (!isStripeConfigured()) throw new Error('Stripe is not configured. Set STRIPE_SECRET_KEY.');
  const data = await stripePost<{ url: string }>('/billing_portal/sessions', {
    customer: customerId,
    return_url: returnUrl,
  });
  return { url: data.url };
}

/** Verify a Stripe webhook signature (HMAC-SHA256 over the raw body). */
export function verifyWebhookSignature(payload: string, signatureHeader: string, secret: string): boolean {
  const parts = signatureHeader.split(',');
  const timestamp = parts.find((p) => p.startsWith('t='))?.slice(2);
  const signatures = parts.filter((p) => p.startsWith('v1=')).map((p) => p.slice(3));
  if (!timestamp || signatures.length === 0) return false;
  const signedPayload = `${timestamp}.${payload}`;
  const expected = crypto.createHmac('sha256', secret).update(signedPayload).digest('hex');
  return signatures.some((sig) => {
    const a = Buffer.from(expected, 'hex');
    const b = Buffer.from(sig, 'hex');
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  });
}
