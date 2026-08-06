# Overlay Wealth — Road to the Leading Black Financial Literacy Platform

> **STATUS (2026-08-06): Phases 0–5 implemented on the `phase0-trust` branch.**
> Phase 0 (trust/durability), 1 (measure), 2 (community), 3 (creators/CMS),
> 4 (institutional & revenue), and 5 (reach) are code-complete with tests.
> Remaining work is operational: provision Postgres + Stripe + PostHog +
> Resend + Sentry, set secrets, and deploy (see `docs/deployment-checklist.md`).

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**North star:** Become the go-to financial literacy platform for Black communities â€” a trusted institution, not just an app. Trust â†’ community â†’ institutional revenue â†’ reach, in that order.

**Strategy in one sentence:** Fix the trust layer first (real accounts, durable data, one brand), then build the moat competitors can't copy (community + Black financial educators), then monetize institutionally (classrooms, HBCUs, churches, grants), then scale reach (mobile, video, growth).

---

## Current-State Audit (why this plan exists)

Evidence gathered from the codebase:

| Blocker | Evidence | Fix |
|---|---|---|
| Mock auth, no real accounts | `apiClient.ts` hardcodes `demo-jwt-token-hacu-fintech`; `server.ts` issues `jwt-token-${userId}-${Date.now()}` | Phase 0.1 |
| Data can vanish | Progress in `localStorage` (`hacu_progress`); server DB is file-backed `.data/store.json`, **ephemeral on Render** (README warning) | Phase 0.2, 0.3 |
| No community layer | No threads/cohorts/mentors anywhere in `src/components` | Phase 2 |
| No analytics wired | `posthog-js` and `@sentry/react` installed but **not initialized** in `src/main.tsx` | Phase 1 |
| No revenue engine | Donations only; server exposes a single `STRIPE_DONATION_LINK` env; no subscription SDK | Phase 4 |
| No creator channel | All 15 modules hardcoded in `src/data/courseData.ts`; no CMS (ROADMAP 3.1 undone) | Phase 3 |
| Brand confusion | `public/` contains both `uplift-logo-*` and `overlay-logo-*`; README/metadata = "Overlay Wealth", RELEASE = "FinTech Foundations", index.html = generic fintech meta | Phase 0.4 |
| Mobile-first audience, desktop web product | PWA plugin exists (`vite-plugin-pwa` in `vite.config.ts`) but offline data sync + mobile polish missing | Phase 5 |
| Document-first in a video-first category | `YouTubeVideoPlayer` exists; no real video curriculum pipeline | Phase 5.2 |

**Already strong (keep, don't rebuild):** 15 modules / 80+ lessons, culturally-grounded wealth chapters (Black Wall Street, redlining, group economics), 5+ games, quant tools, 1,824 green tests, `lectureLibrary.ts` (16 class plans), `ProgressDashboard`, `SearchModal`, `ReviewCards`, `Certificate`, `DonationView`, PWA plugin configured.

---

## Dependency Graph

```
Phase 0 (Trust & Durability)
   â”œâ”€â”€ 0.1 Auth  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
   â”œâ”€â”€ 0.2 Postgres â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
   â””â”€â”€ 0.4 Brand              â”‚
                              â–¼
   Phase 1 (Measure)  â”€â”€ parallel â”€â”€â–º  Phase 2 (Community)
   (analytics, email)                (needs auth 0.1 + DB 0.2)
                                             â”‚
                                             â–¼
                                      Phase 3 (Creators/CMS)
                                             â”‚
                                             â–¼
                                      Phase 4 (Institutional & Revenue)
                                             â”‚
                                             â–¼
                                      Phase 5 (Reach)
```

**Parallel tracks after Phase 0:** Track A = Community (2) â†’ Creators (3). Track B = Institutional (4). Track C = Reach (5). Track D = Measure (1). A/B/C all unlock with Phase 0; D runs alongside.

**Hard dependencies:** Phase 2, 4 need 0.1 + 0.2. Phase 4.2 needs 0.1 (accounts) + a payment provider. Phase 3 needs 0.2 (content versioning) + 2.x (profiles). Phase 5.1 needs 0.2 (offlineâ†’server sync).

---

## Guiding Principles (anti-pattern catalog)

1. **Trust before features.** No new games/modules/content until real accounts + durable data ship. The community historically gets burned by financial products â€” the product must be bulletproof first.
2. **One source of truth.** Progress lives on the server; `localStorage` is only an offline cache. Never two writable stores.
3. **Community is the moat; content is the commodity.** Every leader in this space won on community + educators. Prioritize anything that gets 2+ humans talking over anything that adds another lesson.
4. **Don't follow the old ROADMAP ordering.** i18n, A/B testing, and video production are explicitly deferred. They don't build trust, community, or revenue.
5. **Pick one tool per concern.** PostHog OR custom analytics, not both. Stripe OR donations-first, not a half-built mess. Avoid the ROADMAP's "Option A / Option B" pattern of doing both.
6. **Institutional > consumer for funding.** HBCUs, churches, fraternities/sororities, and workforce programs are the highest-trust, most-fundable channel. Prioritize the classroom product over consumer upsells.
7. **Every shipped task runs `npm run verify`** (`tsc --noEmit && vite build && vitest run`) and leaves the suite green.
8. **Cold-start rule.** Each task below is self-contained: a fresh agent can execute it without reading earlier tasks.

---

## Phase 0 â€” Trust & Durability

**Goal:** A user's account, progress, and certificates are real and permanent. One brand, one story. Ship before anything else.

### Task 0.1 â€” Real authentication (bcrypt + JWT)
**Files:** `server.ts`, `src/lib/apiClient.ts`, `src/components/AuthModal.tsx`, `src/lib/auth.ts` (new), `server.test.ts` (new/extend)

- [ ] Add `bcryptjs` + `jsonwebtoken` deps
- [ ] Replace mock token generation (`jwt-token-...`, `google-jwt-...`) in `server.ts` with real password hashing + signed access token (15 min) + refresh token (7 d) in an HttpOnly cookie
- [ ] `/api/auth/register`, `/api/auth/login`, `/api/auth/refresh`, `/api/auth/logout` with rate limiting (5 attempts/min/IP)
- [ ] Update `AuthModal.tsx` to real email/password forms (keep Google OAuth stub if present)
- [ ] Update `apiClient.ts`: drop the hardcoded `demo-jwt-token-...`; read access token, auto-refresh on 401
- [ ] Migration path: preserve `localStorage` demo identity as a guest session so existing test data isn't orphaned
- **Verify:** `npm run verify`; add integration tests covering registerâ†’loginâ†’refreshâ†’logout and wrong-password rejection
- **Exit:** No `jwt-token-` mock literals remain in `src` or `server.ts`; auth endpoints tested

### Task 0.2 â€” Postgres migration (durable source of truth)
**Files:** `src/db/schema.ts` (new), `src/db/migrations/` (new), `src/db/seed.ts` (new), `server.ts`, `.env.example`, `render.yaml`

- [ ] Add `drizzle-orm` + `drizzle-kit` + `pg`
- [ ] Schema: `users`, `progress`, `sandboxes`, `donations`, `audit_logs`, `certificates` (extend in Phase 2/3 with `threads`, `comments`, `cohorts`, `cohort_members`, `notifications`)
- [ ] Replace `loadDatabase()`/`saveDatabase()` in `server.ts` with Drizzle queries (keep `.data/store.json` as a write-through fallback during transition)
- [ ] **Dual-write migration strategy:** write to both stores, read from PG after 1 week, then drop the file store
- [ ] `DATABASE_URL` + `DATABASE_POOL_SIZE` env vars; seed script for demo data
- [ ] Daily `pg_dump` backup task (Render scheduled job or cron)
- **Verify:** `npm run verify`; integration tests hit PG via the existing API; `npm run test` green
- **Exit:** `.data/store.json` no longer read in production path; a restart preserves a user's progress/certificates/donations

### Task 0.3 â€” Progress durability & sync
**Files:** `src/lib/apiClient.ts`, `src/stores/*.ts`, `src/hooks/useChapterCompletion.ts`, `src/App.tsx`

- [ ] Make server the source of truth for progress/XP/badges/streaks (currently localStorage-first)
- [ ] Add a read-through cache: load from server, fall back to `localStorage` snapshot when offline
- [ ] Add an offline write queue that flushes pending progress on reconnect
- [ ] Update `useChapterCompletion`, `tradingStore`, quiz stores to use the synced store
- **Verify:** `npm run verify`; test that a progress write survives reload and appears via API
- **Exit:** Two users' progress is independent and server-persisted; clearing browser storage does not lose server-synced progress

### Task 0.4 â€” Brand identity & docs consistency
**Files:** `index.html`, `public/` (asset cleanup), `metadata.json`, `README.md`, `RELEASE.md`, `src/App.tsx` (title/footer), `.env.example`

- [ ] **DECISION (default: keep "Overlay Wealth"):** settle one name â€” `Overlay Wealth` (README/metadata/public assets) vs `Uplift Wealth` (folder, `uplift-logo-*`) vs `FinTech Foundations` (RELEASE). Update everything to the single chosen name
- [ ] Delete or relocate conflicting assets (`uplift-logo-*` vs `overlay-logo-*`, `overlay365.png`)
- [ ] Rewrite `index.html` meta for the real positioning: **Black financial literacy**, community, wealth-building (currently generic fintech keywords)
- [ ] Refresh `metadata.json` + OG image (`public/og-image.png`) with the chosen name/logo
- [ ] Update `README.md` (test counts: now 1,824 not 156) and `RELEASE.md` title
- **Verify:** `npm run verify`; grep repo for the discarded name and the stale "156 tests" figure
- **Exit:** One consistent name/brand across README, index.html, metadata, logos, and RELEASE

### Task 0.5 â€” Production deployment & backups
**Files:** `render.yaml`, `Dockerfile`, `.github/workflows/` (new), `.env.example`

- [ ] Provision managed Postgres (Render Postgres or Neon/Supabase) wired to 0.2's `DATABASE_URL`
- [ ] Verify Render persistent volume OR managed DB so `.data` isn't ephemeral
- [ ] Add CI workflow: typecheck + build + vitest on every PR (`.github/workflows/ci.yml`)
- [ ] Add deploy workflow + smoke test (`/api/health`, home, one module route)
- [ ] Wire Sentry (already a dep, not initialized): `@sentry/react` in `src/main.tsx`, `@sentry/node` in `server.ts`
- [ ] Uptime monitor + alert (health check already exists)
- **Verify:** Fresh clone â†’ `npm ci && npm run verify`; deploy to staging; kill server mid-use â†’ restart â†’ user data intact
- **Exit:** Live URL serving real users with durable data and a CI gate on every merge

---

## Phase 1 â€” Measure

**Goal:** Know what works before building more. Can run parallel with Phase 2.

### Task 1.1 â€” Wire analytics
**Files:** `src/lib/analytics.ts` (new), `src/main.tsx`, `src/App.tsx`, server events endpoint (optional)

- [ ] Initialize PostHog (dep present) in `src/main.tsx` with `VITE_POSTHOG_KEY`
- [ ] Track: `page_view`, `lesson_start`/`lesson_complete`, `quiz_attempt`, `game_start`/`game_complete`, `module_complete`, `certificate_download`, `signup`
- [ ] If managed PostHog is rejected, fall back to a custom `analytics` table + batched `/api/events` â€” **pick one, not both**
- **Verify:** `npm run verify`; a scripted run emits events visible in PostHog live view
- **Exit:** Every core action emits an event; no double-tracking from two systems

### Task 1.2 â€” Admin insights
**Files:** `src/components/AdminDashboard.tsx`, `server.ts` (aggregate endpoints)

- [ ] Metrics: DAU, 7-day retention, lesson-completion funnel, quiz pass rates by module, game engagement, drop-off points
- [ ] Feed from PostHog API or aggregate SQL â€” reuse existing `AdminDashboard` shell
- **Verify:** `npm run verify`; dashboard renders with seeded data
- **Exit:** Retention funnel is visible; drop-off points are identifiable per module

### Task 1.3 â€” Acquisition & engagement loop
**Files:** `src/components/` (waitlist form), `server.ts` (email), `.env.example`

- [ ] Email provider (Resend/SendGrid) + `EMAIL_API_KEY` env; **waitlist/email capture** on home + wealth hub (highest-leverage growth lever for a trust-first platform)
- [ ] Welcome email on signup (ties into 0.1)
- [ ] Streak/welcome-back email hooks (needs 1.1 event data)
- **Verify:** `npm run verify`; a test signup triggers an email in the provider's sandbox
- **Exit:** Email capture live; welcome email sending; email preferences stored per user

---

## Phase 2 â€” Community (the moat)

**Goal:** Users talk to each other. This is what no generic fintech course can copy. **Requires 0.1 + 0.2.**

### Task 2.1 â€” Discussion threads
**Files:** `src/db/schema.ts` (+`threads`, `comments`), `src/components/DiscussionThread.tsx` (new), `src/components/ModuleView.tsx`, `server.ts`

- [ ] Tables: `threads`, `comments` (userId, moduleId/lessonId, body, createdAt)
- [ ] `DiscussionThread.tsx`: list, post, reply, upvote; "Discussion" tab in `ModuleView`
- [ ] Moderation basics: report + admin delete (admin role exists in schema)
- **Verify:** `npm run verify`; component tests + API tests for create/reply/upvote
- **Exit:** A user can ask a question on any lesson and get a reply

### Task 2.2 â€” Public profiles & privacy
**Files:** `src/components/StudentProfile.tsx`, `src/App.tsx` (+`/profile/:userId`), `src/db/schema.ts` (+`privacy`)

- [ ] Public profile: name, badges, completed modules, streak, XP (exists as self-view; add public route)
- [ ] Privacy toggle (hide profile, hide progress)
- **Verify:** `npm run verify`
- **Exit:** Clicking a commenter's avatar opens their public profile

### Task 2.3 â€” Cohorts, groups & mentors
**Files:** `src/db/schema.ts` (+`cohorts`, `cohort_members`), `src/components/CohortView.tsx` (new), `server.ts`, `src/App.tsx`

- [ ] Tables: `cohorts`, `cohort_members`
- [ ] `CohortView`: members, progress leaderboard, cohort discussion (reuses 2.1)
- [ ] Mentor role (existing RBAC) + "ask a mentor" in cohorts
- [ ] Themed cohort templates: "Church Financial Peace Class", "HBCU Chapter", "Family Group Economics Circle" â€” directly aligned with the wealth-building content
- **Verify:** `npm run verify`
- **Exit:** A church or family can spin up a cohort and see each other's progress

### Task 2.4 â€” Notifications
**Files:** `src/db/schema.ts` (+`notifications`), `src/components/NotificationCenter.tsx` (new), `server.ts`

- [ ] In-app notification center (reply, cohort member milestone, streak milestone)
- [ ] Email variant for the same triggers (reuse 1.3 provider)
- **Verify:** `npm run verify`
- **Exit:** Reply and milestone events surface in-app and (optionally) by email

---

## Phase 3 â€” Creators & CMS

**Goal:** Trusted Black financial educators can publish on the platform. Turns the app into a movement.

### Task 3.1 â€” Content CMS
**Files:** `content/modules/*` (move from `src/data/courseData.ts`), `src/lib/contentLoader.ts` (new), `src/components/admin/ContentEditor.tsx` (new), `server.ts`

- [ ] Move lesson content to Markdown with frontmatter (title, quiz[]) â€” **cold start:** keep `courseData.ts` as fallback so nothing breaks mid-migration
- [ ] Admin editor: markdown preview + quiz builder (RBAC `admin` only)
- [ ] Version history (who changed what) in DB
- **Verify:** `npm run verify`; `npm run test` still green with the loader active
- **Exit:** A non-engineer can publish a lesson from the admin UI

### Task 3.2 â€” Educator / ambassador program
**Files:** `src/db/schema.ts` (+`creator`, `creator_content`), `src/components/` (creator profile/badging), marketing assets

- [ ] Creator role + verified-educator badge on profiles (2.2)
- [ ] Creator landing page template + application flow
- [ ] Revenue-share hook: link creator content to Phase 4 subscriptions
- **Verify:** `npm run verify`
- **Exit:** An invited educator has a public profile and can publish a course

---

## Phase 4 â€” Institutional & Revenue

**Goal:** Fundable, sustainable, and trusted by institutions. **Requires 0.1 + 0.2.**

### Task 4.1 â€” Classroom / teacher mode
**Files:** `src/components/admin/ClassroomDashboard.tsx` (new), `lectureLibrary` integration, `server.ts`, `src/App.tsx`

- [ ] Teacher dashboard: create class from the 16 existing `lectureLibrary.ts` plans
- [ ] Enrollment (email invite) + per-class progress view (reuses 2.3 cohort plumbing)
- [ ] Class certificate option (reuse `Certificate`)
- **Verify:** `npm run verify`
- **Exit:** A teacher enrolls students, assigns the lecture plan, and sees completion per student

### Task 4.2 â€” Monetization
**Files:** `src/lib/stripe.ts` (new), `src/components/PricingPage.tsx` (new), `src/components/BillingPortal.tsx` (new), `server.ts`, `src/db/schema.ts`

- [ ] Stripe SDK: free tier (modules 0â€“5) / premium `$10/mo` (all modules, certificates, review cards) / institutional `$99/mo` (50 seats, admin, cohorts)
- [ ] Paywall + "Upgrade to Premium" modal; `/pricing` comparison page
- [ ] Migrate the donations link to a real Stripe Checkout session (`STRIPE_DONATION_LINK` already exists â€” formalize it)
- [ ] Webhooks: `checkout.session.completed`, `subscription.deleted`, `invoice.payment_failed`
- **Verify:** `npm run verify`; Stripe test-mode end-to-end via webhook payloads
- **Exit:** A user can pay in test mode and unlock premium content; donations flow through Checkout

### Task 4.3 â€” Partnership & grant pipeline
**Files:** `docs/` (institutional one-pager), `src/components/` (demo mode / sales assets), `RELEASE.md`

- [ ] Institutional one-pager: mission, curriculum, security posture (post-0.5), pricing, cohort model
- [ ] Target list: HBCUs, Black fraternities/sororities, churches, workforce-development orgs, fintech-inclusion grants
- [ ] Demo/guest pass for evaluators
- **Verify:** n/a (business artifact)
- **Exit:** 2+ institutional pilots running; 1+ grant application submitted

---

## Phase 5 â€” Reach

**Goal:** The right audience can actually find and use it.

### Task 5.1 â€” PWA completion & mobile polish
**Files:** `vite.config.ts` (existing `VitePWA`), `public/manifest.json`, `src/lib/` (offline sync), mobile pass on `src/App.tsx` + key views

- [ ] Confirm service worker registration + offline caching for visited lessons (plugin configured; verify `registerSW`/devOptions)
- [ ] Offline queue from 0.3 flushed when back online
- [ ] Mobile-first pass on dashboard, module viewer, games (target audience is phone-first)
- **Verify:** `npm run verify`; Lighthouse PWA + Performance audit > 90
- **Exit:** Installable on iOS/Android; a visited lesson renders offline

### Task 5.2 â€” Video curriculum
**Files:** `src/components/YouTubeVideoPlayer.tsx` (exists â€” wire it), `scripts/` (content), `src/data/courseData.ts`

- [ ] Scripts from existing top lessons (5â€“7 min each) â€” start with the wealth chapters, they're the differentiator
- [ ] Embed player in `ModuleView` per lesson; transcripts for accessibility
- **Verify:** `npm run verify`
- **Exit:** 2â€“3 flagship wealth chapters have embedded video + transcript

### Task 5.3 â€” Growth & SEO
**Files:** `index.html`, `public/sitemap.xml`, `server.ts` (dynamic sitemap), OG assets, marketing copy

- [ ] Dynamic `/api/sitemap.xml` from course data (all modules/lessons)
- [ ] OG images per module (1200Ã—630) + Black-financial-literacy positioning in meta (0.4)
- [ ] Content marketing: publish the wealth chapters as SEO articles; cross-post with educators (3.2)
- **Verify:** `npm run verify`; sitemap returns all module URLs
- **Exit:** 50+ organic visits/week; key wealth pages indexed

---

## Success Metrics (mirrors ROADMAP, recalibrated to this strategy)

| Phase | Metric | Target |
|---|---|---|
| 0 | Real registered users | 100+ |
| 0 | Data-loss incidents | 0 |
| 0 | Brand | 1 name everywhere |
| 1 | 7-day retention | 40% |
| 1 | Avg session | >10 min |
| 2 | Threads / comments | 100+ / 500+ |
| 2 | Active cohorts | 5+ |
| 3 | External educators publishing | 5+ |
| 4 | Free â†’ premium conversion | 5% |
| 4 | MRR | $500+ (Phase 4 done) |
| 4 | Institutional pilots | 2+ |
| 5 | Lighthouse (PWA/Perf/Acc/A11y/SEO) | >90 |
| 5 | Organic visits/week | 50+ |

---

## Decisions Needed (defaults marked âœ“)

| Decision | Default | Why |
|---|---|---|
| Name | âœ“ **Overlay Wealth** | Matches README/metadata/current assets; newer identity |
| Analytics | âœ“ **PostHog (managed)** | Already a dependency; fastest to value; revisit only if data-residency needs arise |
| Email | âœ“ **Resend** | Simple API; sandbox testing; cheap at volume |
| Payments | âœ“ **Stripe** | Already partially wired (`STRIPE_DONATION_LINK`); test-mode first |
| DB host | âœ“ **Render Managed Postgres** | Same platform, persistent volume, no extra vendor |
| i18n / A/B / video-production | **Defer** | Not trust/community/revenue work; revisit post-Phase 4 |

---

## Rollback & Risk Register

- **Each task is independently revertible** (one PR per task; see CI in 0.5).
- **DB dual-write (0.2)** is the rollback strategy for the storage migration: file store stays writable until PG is proven.
- **Auth (0.1):** keep guest/localStorage session as fallback during rollout so no existing learner is locked out.
- **Risks:** community moderation burden (start with report/delete in 2.1); Stripe edge cases (test-mode + webhook replay in 4.2); content-CMS scope creep (3.1 must preserve `courseData.ts` fallback and ship in the stated order).
- **Anti-pattern to resist:** starting Phase 4 monetization before Phase 0 trust is in place. Sell credibility, not a paywall.
