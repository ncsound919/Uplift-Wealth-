#!/usr/bin/env node
/**
 * Provision Stripe products + prices + webhook endpoint via the Stripe API.
 *
 * Usage:
 *   set STRIPE_SECRET_KEY=sk_test_xxx        (PowerShell) / export (bash)
 *   npm run stripe:provision                 # creates prices, prints IDs
 *   npm run stripe:provision -- --webhook https://your-host/api/billing/webhook
 *
 * Idempotent: existing products/prices are reused by name. Prints the price
 * IDs to paste into STRIPE_PRICE_PREMIUM / STRIPE_PRICE_INSTITUTIONAL.
 */
const STRIPE_API = 'https://api.stripe.com/v1';

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error('[stripe:provision] STRIPE_SECRET_KEY is not set. Get a test key from https://dashboard.stripe.com/test/apikeys');
  process.exit(1);
}

const webhookUrl = process.argv.find((a, i) => a === '--webhook' && process.argv[i + 1]) ? process.argv[process.argv.indexOf('--webhook') + 1] : process.env.STRIPE_WEBHOOK_URL;

const PLANS = [
  { name: 'Overlay Wealth Institutional', priceName: 'Institutional', amount: 9900, interval: 'month' }, // $99/mo
];

async function api(path, params = {}) {
  const body = new URLSearchParams();
  const entries = Array.isArray(params) ? params : Object.entries(params);
  for (const [k, v] of entries) {
    if (v !== undefined && v !== '') body.set(k, String(v));
  }
  const res = await fetch(`${STRIPE_API}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Stripe ${res.status} ${path}: ${text.slice(0, 300)}`);
  }
  return res.json();
}

async function apiGet(path) {
  const res = await fetch(`${STRIPE_API}${path}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${key}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Stripe ${res.status} ${path}: ${text.slice(0, 300)}`);
  }
  return res.json();
}

async function findPrice(productName, amount, interval) {
  const products = await apiGet(`/products/search?query=${encodeURIComponent(`name:"${productName}"`)}`);
  const product = products.data?.[0];
  if (!product) return null;
  // List prices for the product (avoids the price-search quoting pitfalls).
  const prices = await apiGet(`/prices?product=${product.id}&limit=100`);
  return (prices.data || []).find((p) => p.unit_amount === amount && p.recurring?.interval === interval) || null;
}

async function main() {
  const out = {};
  for (const plan of PLANS) {
    let price = await findPrice(plan.name, plan.amount, plan.interval);
    if (price) {
      console.log(`[stripe:provision] Reusing ${plan.priceName}: ${price.id} (${(price.unit_amount / 100).toFixed(2)}/${price.recurring.interval})`);
    } else {
      const product = await api('/products', { name: plan.name });
      const created = await api('/prices', {
        currency: 'usd',
        unit_amount: String(plan.amount),
        'recurring[interval]': plan.interval,
        product: product.id,
      });
      price = created;
      console.log(`[stripe:provision] Created ${plan.priceName}: ${price.id} ($${(price.unit_amount / 100).toFixed(2)}/mo)`);
    }
    out[plan.priceName.toLowerCase()] = price.id;
  }

  if (webhookUrl) {
    try {
      const hook = await api('/webhook_endpoints', [
        ['url', webhookUrl],
        ['enabled_events[]', 'checkout.session.completed'],
        ['enabled_events[]', 'customer.subscription.deleted'],
        ['enabled_events[]', 'invoice.payment_failed'],
      ]);
      console.log(`[stripe:provision] Webhook endpoint created: ${hook.url}`);
      console.log(`[stripe:provision] Set STRIPE_WEBHOOK_SECRET to: ${hook.secret}`);
    } catch (err) {
      console.warn(`[stripe:provision] Could not create webhook (may already exist): ${err.message}`);
    }
  }

  console.log('\n[stripe:provision] Add these to your environment:');
  console.log(`  STRIPE_PRICE_PREMIUM=${out.premium}`);
  console.log(`  STRIPE_PRICE_INSTITUTIONAL=${out.institutional}`);
  if (webhookUrl) console.log('  STRIPE_WEBHOOK_SECRET=<printed above>');
}

main().catch((err) => {
  console.error('[stripe:provision] Failed:', err.message);
  process.exit(1);
});
