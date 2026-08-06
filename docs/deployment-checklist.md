# Overlay Wealth — Phase 0.5 Deployment & Ops Checklist

> Code-side Phase 0.5 work is complete (CI, Sentry, DB migrations, backups
> script). The provisioning steps below require cloud accounts and must be done
> by the owner. Vercel keeps the `uplift` URL; Render has been rebranded to
> `overlay-wealth` (Phase 0.4).

## 1. Provision PostgreSQL (do this first — everything else depends on it)

Pick one managed provider:

- **Render Managed Postgres** (simplest, same platform as the web service): create
  a Postgres instance in Render, copy its internal connection string.
- **Neon / Supabase**: create a project, copy the pooled `DATABASE_URL`.

Then:
1. Set `DATABASE_URL` on the web service (Render secret) to the internal URL.
2. Set `DATABASE_POOL_SIZE=10` (or match plan).
3. On first deploy, the server automatically runs `src/db/migrations/*.sql`
   (see `src/db/migrate.ts`) and hydrates from Postgres. You can also run
   `npm run db:seed` against a test DB to load the demo user.

## 2. Set production secrets

Set these env vars on the host (Render dashboard — never commit):

| Var | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string (managed Postgres) |
| `JWT_ACCESS_SECRET` | Long random string (e.g. `openssl rand -hex 64`) |
| `JWT_REFRESH_SECRET` | Different long random string |
| `SENTRY_DSN` | Server error tracking |
| `VITE_SENTRY_DSN` | Client error tracking (same project) |
| `GEMINI_API_KEY` | Module Builder (optional) |
| `ALPHA_VANTAGE_API_KEY` | Live stock quotes (optional) |
| `VITE_POSTHOG_KEY` | Analytics (optional) |
| `APP_URL` | `https://overlay-wealth.onrender.com` |
| `ALLOWED_ORIGINS` | `https://overlay-wealth.onrender.com` |

> ⚠️ The old `uplift-wealth` Render service name is deprecated. If it is still
> live, either rename it to `overlay-wealth` or delete it and redeploy the
> blueprint so the deploy workflow's smoke tests (`overlay-wealth.onrender.com`)
> resolve. The Vercel URL may keep `uplift`.

## 3. Deploy

- Render blueprint (`render.yaml`) provisions the `overlay-wealth` web service
  with Docker + the health check at `/api/health`.
- CI runs on every PR (`npm run lint`, `npm run test`, `npm run build`) and the
  deploy workflow (`deploy.yml`) triggers the Render deploy hook after tests
  pass. Set the `RENDER_DEPLOY_HOOK` repo secret.
- After deploy, run the smoke test manually:
  - `curl https://overlay-wealth.onrender.com/api/health` → `{"status":"ok",...}`
  - Register a test account and confirm it appears in Postgres.

### Deploy to Vercel (CLI, `vercel` 51+ installed)

The app supports Vercel serverless hosting (built client served statically,
`/api/*` routed to the Express function, SPA rewrites for everything else):

```bash
npx vercel link                      # one-time: link to your project
npx vercel env add DATABASE_URL production
npx vercel env add JWT_ACCESS_SECRET production
npx vercel env add JWT_REFRESH_SECRET production
npx vercel env add STRIPE_SECRET_KEY production
npx vercel env add STRIPE_WEBHOOK_SECRET production
npx vercel env add STRIPE_PRICE_PREMIUM production
npx vercel env add STRIPE_PRICE_INSTITUTIONAL production
npx vercel env add EMAIL_API_KEY production
npx vercel env add SENTRY_DSN production
npx vercel env add VITE_POSTHOG_KEY production
npx vercel deploy --prod             # build + deploy
```

> Vercel runs `npm run build` (builds the client + bundles the server). The
> serverless function only serves `/api/*`; static assets and SPA routing come
> from `vercel.json`. The migrations run on first boot because `DATABASE_URL`
> is set (the runtime migration runner handles it).

### Stripe provisioning (CLI)

Create the Premium ($10/mo) + Institutional ($99/mo) prices and the webhook
endpoint without touching the dashboard:

```bash
set STRIPE_SECRET_KEY=sk_test_xxx   # PowerShell; or export STRIPE_SECRET_KEY=...
npm run stripe:provision            # prints STRIPE_PRICE_PREMIUM, STRIPE_PRICE_INSTITUTIONAL, STRIPE_WEBHOOK_SECRET
```

Run it again with `--webhook https://your-host/api/billing/webhook` to create
the webhook endpoint (it prints the signing secret). Paste the printed values
into `vercel env add` / Render secrets.

## 4. Durable storage check

- Postgres (step 1) is the durable store — progress/accounts no longer live only
  in `.data/store.json`. Verify by: complete a lesson as a signed-in user →
  restart the service → lesson is still complete.
- `.data/store.json` remains as a migration safety net and will be removed in a
  later phase once Postgres-only is proven.

## 5. Backups

- Run `scripts/db-backup.sh` on a schedule (e.g. Render cron job or external
  cron) targeting a durable destination (S3/R2/Google Cloud Storage).
- Recommended: daily `pg_dump` at 03:00 UTC, retained 14 days.
- Test a restore at least once before relying on it.

## 6. Uptime & alerting

- Add the public URL to an uptime monitor (UptimeRobot / Cronitor / Pingdom)
  hitting `/api/health` every 1–5 min; alert on failure.
- Sentry (steps 2) alerts on new errors; enable email alerts for `error` level.

## 7. Post-deploy verification (from RELEASE.md)

- [ ] E2E smoke through all 15 modules as a guest
- [ ] Register → login → refresh (reload page) → still signed in
- [ ] Complete a lesson as signed-in user → verify in Postgres
- [ ] Quiz pass/fail + certificate flow
- [ ] Offline: go offline, complete a lesson, reconnect → stats flush to server
- [ ] `curl /api/health`, `curl /sitemap.xml`, home page 200
- [ ] Dark/light toggle persists
