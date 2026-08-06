# Implementation Roadmap — Phase 1-4

> **SUPERSEDED:** This is the original engineering roadmap written for the generic "FinTech Foundations" product. The platform is now **Overlay Wealth** — a financial literacy platform for Black communities. Use [docs/superpowers/plans/2026-08-06-leading-black-financial-literacy-platform.md](docs/superpowers/plans/2026-08-06-leading-black-financial-literacy-platform.md) as the current plan. This file is retained for historical reference.

## Quick Wins ✅ COMPLETED
- [x] **SEO meta tags** — OG, description, theme-color, JSON-LD schema
- [x] **robots.txt + sitemap.xml** — all 15 modules + key pages indexed
- [x] **React Router** — deep links for modules, games, all views
- [x] **noscript fallback** — content visible to search engines and no-JS users
- [x] **ARIA attributes** — navigation landmarks, mobile menu, toasts

---

## Phase 1: Foundation (Weeks 1-3)
*Make it a real platform*

### 1.1 Dynamic Page Titles & Meta Tags ⏱ 3 days
**Goal**: Each route shows unique title/description for SEO and sharing.

**Tasks**:
1. Install `react-helmet-async` or use Vite's `transformIndexHtml`
2. Create `<PageMeta>` component accepting title, description, ogImage, canonical
3. Add to each route: Dashboard ("FinTech Foundations — Master Modern Money"), ModuleView ("Module {n}: {title} — FinTech Foundations"), Glossary, Knowledge, etc.
4. Generate OG images (1200x630) for home + each module
5. Test with [Meta Debugger](https://developers.facebook.com/tools/debug/) and Twitter Card Validator

**Files**: `src/components/PageMeta.tsx`, `src/App.tsx`, `src/components/ModuleView.tsx`

---

### 1.2 Real Database Migration ⏱ 5 days
**Goal**: Replace file-backed JSON with PostgreSQL.

**Tasks**:
1. Install `drizzle-orm` + `drizzle-kit` + `pg`
2. Design schema from existing `DatabaseSchema` interface:
   - `users` (id, name, email, passwordHash, role, track, avatar, badges[], streakDays, lastActive)
   - `progress` (id, userId, completedLessons[], completedModules[], quizScores{}, certificates[])
   - `sandboxes` (id, userId, sandboxType, stateData JSONB, savedAt, notes)
   - `donations` (id, userId, amount, tierLabel, timestamp)
   - `auditLogs` (id, timestamp, ip, method, path, userId, action)
3. Create migration files with `drizzle-kit generate`
4. Replace `saveDatabase()`/`loadDatabase()` with Drizzle queries
5. Add connection pooling (use `pg` pool with 10 connections)
6. Add `.env` vars: `DATABASE_URL`, `DATABASE_POOL_SIZE`
7. Write seed script for demo data
8. Add backup cron (daily pg_dump)

**Files**: `server.ts`, `src/db/schema.ts`, `src/db/migrations/`, `src/db/seed.ts`, `.env.example`

**Migration Strategy**: Deploy with both stores (write to both, read from PG). After 1 week, switch reads to PG only.

---

### 1.3 Real Authentication ⏱ 5 days
**Goal**: Replace mock token auth with bcrypt + JWT (or Auth.js/Lucia).

**Option A — DIY (More control)**:
1. Install `bcryptjs` + `jsonwebtoken`
2. Add `passwordHash` field to users table
3. Create `/api/auth/register` (email + password → hash → insert)
4. Create `/api/auth/login` (email + password → compare → JWT)
5. Create `/api/auth/refresh` (refresh token rotation)
6. JWT payload: `{ userId, role, email }`, 15min access token + 7d refresh token
7. HttpOnly cookies for refresh token, localStorage for access token
8. Middleware: validate JWT, attach user to `req.user`
9. Add `/api/auth/password-reset` (email → token → reset link)

**Option B — Auth.js/Lucia (Less code)**:
1. Install `@auth/core` or `lucia`
2. Configure providers: Google OAuth + credentials
3. Session storage in PostgreSQL
4. Built-in CSRF protection, session rotation

**Common Tasks**:
10. Update `AuthModal.tsx` to use real login/register forms
11. Add email verification (send link via SendGrid/Resend)
12. Add "Remember me" checkbox
13. Rate limit login attempts (5 per minute per IP)
14. Add logout endpoint (clear cookies, revoke refresh token)
15. Update `apiClient.ts` to handle token refresh

**Files**: `server.ts`, `src/components/AuthModal.tsx`, `src/lib/apiClient.ts`, `src/lib/auth.ts`

---

### 1.4 Certificate Generation ⏱ 3 days
**Goal**: Render downloadable PDF certificates on module completion.

**Tasks**:
1. Install `@react-pdf/renderer`
2. Create `src/components/Certificate.tsx`:
   - A4 landscape, decorative border, logo, student name, module title, date, signature
   - Unique certificate ID (UUID)
3. Add "Download Certificate" button in `ModuleView.tsx` when module is complete
4. Generate PDF client-side (no server round-trip)
5. Store certificate metadata in DB (userId, moduleId, issuedAt, certId)
6. Add `/certificates/:certId` route for public verification page

**Files**: `src/components/Certificate.tsx`, `src/components/ModuleView.tsx`, `server.ts`

---

### 1.5 Enhanced Sitemap (Dynamic) ⏱ 1 day
**Goal**: Auto-generate sitemap from actual course data.

**Tasks**:
1. Create `/api/sitemap.xml` endpoint in server.ts
2. Query all modules + lessons + glossary terms from courseData
3. Generate XML with `<url>` entries for each
4. Add `<lastmod>` dates based on file timestamps
5. Update `public/sitemap.xml` to redirect to `/api/sitemap.xml`
6. Add `<image:image>` for OG images

**Files**: `server.ts`, `public/sitemap.xml`

---

## Phase 2: Retention & Trust (Weeks 4-6)
*Make users want to come back*

### 2.1 Accessibility Audit & Fixes ⏱ 7 days
**Goal**: WCAG 2.1 AA compliance.

**Tasks**:
1. **Automated audit**: Run axe-core in dev mode, fix all violations
2. **Keyboard navigation**:
   - All interactive elements reachable via Tab
   - Focus indicators visible (outline: 2px solid blue)
   - Escape closes modals
   - Arrow keys navigate within game boards
3. **Screen reader testing**:
   - VoiceOver (Mac) + NVDA (Windows)
   - All icons have `aria-label` or `<title>`
   - Charts/graphs have text alternatives
   - Game state announced to screen readers
4. **Color contrast**:
   - All text meets 4.5:1 ratio (use [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/))
   - Dark mode passes equally
5. **Focus management**:
   - Modal open → focus trapped inside
   - Modal close → focus returns to trigger
   - Page change → focus moves to main heading
6. **Form labels**: All inputs have `<label>` with `htmlFor`
7. **Error messages**: Associated with inputs via `aria-describedby`
8. **Motion**: Respect `prefers-reduced-motion` (disable confetti, reduce transitions)
9. **Skip link**: Add "Skip to main content" link at top of page

**Files**: All components, `src/index.css` (focus styles)

---

### 2.2 Event Analytics ⏱ 5 days
**Goal**: Track user behavior to measure engagement and identify drop-off points.

**Option A — Plausible/PostHog (Managed)**:
1. Install `@plausible/analytics` or `posthog-js`
2. Add to `main.tsx` initialization
3. Track events:
   - `page_view` (route)
   - `lesson_start` (moduleId, lessonId)
   - `lesson_complete` (moduleId, lessonId, timeSpent)
   - `quiz_attempt` (moduleId, score, passed)
   - `game_start` (gameType)
   - `game_complete` (gameType, score, timeSpent)
   - `module_complete` (moduleId)
   - `certificate_download` (moduleId)
4. Create admin dashboard showing:
   - Daily active users
   - Lesson completion funnel
   - Quiz pass rates by module
   - Game engagement metrics
   - Drop-off heatmap (where users stop)

**Option B — Custom (More control)**:
1. Create `analytics` table (userId, event, properties JSONB, timestamp)
2. Create `/api/analytics` endpoint
3. Batch events client-side (flush every 10s or 50 events)
4. Build admin dashboard in `src/components/AdminDashboard.tsx`

**Files**: `src/lib/analytics.ts`, `src/components/AdminDashboard.tsx`, `server.ts`

---

### 2.3 Global Search ⏱ 4 days
**Goal**: Cmd+K search across all lessons, glossary terms, lecture classes.

**Tasks**:
1. Install `fuse.js` (fuzzy search)
2. Create `src/lib/searchIndex.ts`:
   - Build index from: courseData (all lessons), lectureLibrary, glossary terms
   - Each entry: `{ id, title, type, content, moduleId, route }`
3. Create `src/components/SearchModal.tsx`:
   - Cmd+K / Ctrl+K to open
   - Input with debounced search (150ms)
   - Results grouped by type (Lessons, Glossary, Lectures)
   - Click → navigate to route
   - Escape → close
4. Add keyboard shortcut listener in `App.tsx`
5. Add search icon button in sidebar header

**Files**: `src/lib/searchIndex.ts`, `src/components/SearchModal.tsx`, `src/App.tsx`

---

### 2.4 Progress Dashboard ⏱ 5 days
**Goal**: Visual learning path with completion %, streak calendar, quiz score trends.

**Tasks**:
1. Create `src/components/ProgressDashboard.tsx`:
   - **Learning Path**: Horizontal timeline of 15 modules with completion status (locked/in-progress/complete)
   - **Streak Calendar**: GitHub-style contribution graph (last 90 days)
   - **Quiz Score Trends**: Line chart (Recharts) of quiz scores over time
   - **Time Invested**: Total hours + daily average
   - **XP Progress**: Level bar with milestones
2. Fetch data from existing localStorage + API (after Phase 1.2)
3. Add route `/progress`
4. Add navigation link in sidebar

**Files**: `src/components/ProgressDashboard.tsx`, `src/App.tsx`

---

### 2.5 Spaced Repetition ⏱ 4 days
**Goal**: Surface "review due" cards using SM-2 algorithm.

**Tasks**:
1. Install `ts-fsrs` (Free Spaced Repetition Scheduler)
2. Create `src/lib/spacedRepetition.ts`:
   - Track quiz attempts (questionId, ease, interval, dueDate)
   - Calculate next review date based on performance
3. Create `src/components/ReviewCards.tsx`:
   - Show cards due today (max 10)
   - Flip card → show answer → rate (Again/Hard/Good/Easy)
   - Update schedule in DB
4. Add "Review Due" badge in sidebar (count of due cards)
5. Add route `/review`

**Files**: `src/lib/spacedRepetition.ts`, `src/components/ReviewCards.tsx`, `src/App.tsx`

---

### 2.6 PWA (Offline Support) ⏱ 4 days
**Goal**: Installable app, works offline for visited lessons.

**Tasks**:
1. Install `vite-plugin-pwa`
2. Configure `vite.config.ts`:
   - Register service worker
   - Cache strategy: Stale-while-revalidate for assets, Network-first for API
   - Pre-cache: index.html, main.js, critical CSS
3. Create `public/manifest.json`:
   - App name, short name, icons (192x192, 512x512), theme color, background color
   - Display: standalone
   - Start URL: /
4. Add install prompt UI (`src/components/InstallPrompt.tsx`):
   - Detect `beforeinstallprompt` event
   - Show "Install App" button in sidebar
5. Test offline: Visit module → go offline → reload → content still visible
6. Add "Offline Mode" banner when network is down

**Files**: `vite.config.ts`, `public/manifest.json`, `src/components/InstallPrompt.tsx`

---

## Phase 3: Differentiation (Weeks 7-10)
*Build competitive moat*

### 3.1 Content CMS ⏱ 8 days
**Goal**: Educators can update lessons without code changes.

**Tasks**:
1. Move course content to Markdown files:
   - `content/modules/module-0/lesson-1.md` (frontmatter: title, type, quiz[])
   - `content/lectures/class-0.md`
   - `content/glossary.json`
2. Create `src/lib/contentLoader.ts`:
   - Parse Markdown + frontmatter at build time (Vite plugin)
   - Hot reload in dev mode
3. Create `src/components/admin/ContentEditor.tsx`:
   - Markdown editor with preview
   - Quiz builder (add/edit questions)
   - Save → write to content/ directory (dev) or DB (prod)
4. Create admin routes:
   - `/admin/content` — list all lessons
   - `/admin/content/:moduleId/:lessonId` — edit lesson
   - `/admin/content/new` — create lesson
5. Add RBAC: only `admin` role can access `/admin/*`
6. Version control: store edit history (who changed what, when)

**Files**: `content/`, `src/lib/contentLoader.ts`, `src/components/admin/ContentEditor.tsx`

---

### 3.2 Social Features ⏱ 10 days
**Goal**: Discussion threads, peer learning, cohorts.

**Tasks**:
1. **Discussion Threads**:
   - Add DB table: `threads` (id, moduleId, lessonId, userId, title, content, createdAt)
   - Add DB table: `comments` (id, threadId, userId, content, createdAt)
   - Create `src/components/DiscussionThread.tsx`:
     - Show thread list for current lesson
     - Post new thread, reply to threads
     - Upvote helpful comments
   - Add "Discussion" tab in `ModuleView.tsx`
2. **Student Profiles**:
   - Add route `/profile/:userId`
   - Show: name, badges, completed modules, streak, XP
   - Privacy settings (hide/show profile)
3. **Cohorts**:
   - Add DB table: `cohorts` (id, name, startDate, endDate, instructorId)
   - Add DB table: `cohort_members` (cohortId, userId, joinedAt)
   - Create `src/components/CohortView.tsx`:
     - List members, progress leaderboard
     - Cohort-specific discussion threads
4. **Notifications**:
   - In-app notification center (bell icon in header)
   - Email notifications (via SendGrid/Resend):
     - New reply to your thread
     - Cohort member completed module
     - Streak milestone (7 days, 30 days)

**Files**: `src/components/DiscussionThread.tsx`, `src/components/StudentProfile.tsx`, `src/components/CohortView.tsx`

---

### 3.3 Real Market Data ⏱ 5 days
**Goal**: Trading simulator shows real-time prices.

**Tasks**:
1. Sign up for Finnhub (free tier: 60 calls/min) or Polygon.io
2. Create `src/lib/marketData.ts`:
   - Fetch real-time quotes for top 50 stocks
   - Cache for 15s (rate limit protection)
   - Fallback to random walk if API fails
3. Update `TradingGame.tsx`:
   - Load real prices on mount
   - Show "Live" badge next to real prices
   - Add watchlist feature (save favorite tickers)
4. Add historical data fetch (last 30 days) for chart
5. Update `alphaVantageClient.ts` to use real API key from `.env`
6. Add rate limit counter in UI (show remaining API calls)

**Files**: `src/lib/marketData.ts`, `src/components/TradingGame.tsx`

---

### 3.4 Notification System ⏱ 6 days
**Goal**: Email reminders, push notifications, in-app center.

**Tasks**:
1. **Email Notifications** (SendGrid/Resend):
   - Configure transactional email service
   - Create email templates:
     - Welcome email (on registration)
     - Streak reminder (if no activity for 2 days)
     - Weekly progress digest (Sunday evening)
     - New reply notification
   - Add email preferences in user settings
2. **Push Notifications** (Web Push API):
   - Request permission on first visit
   - Service worker handles push events
   - Notifications: streak milestone, new reply, cohort update
3. **In-App Notification Center**:
   - Create `src/components/NotificationCenter.tsx`:
     - Bell icon in header with unread count
     - Dropdown list of notifications
     - Mark as read, clear all
   - DB table: `notifications` (userId, type, title, message, read, createdAt)

**Files**: `src/lib/email.ts`, `src/lib/push.ts`, `src/components/NotificationCenter.tsx`

---

### 3.5 Subscription Model ⏱ 7 days
**Goal**: Free tier + premium content + institutional licenses.

**Tasks**:
1. **Stripe Integration**:
   - Install `@stripe/stripe-js` + `stripe` (server)
   - Create products:
     - Free: Modules 0-5, basic games
     - Premium ($19/mo): All modules, certificates, spaced repetition
     - Institutional ($99/mo): 50 seats, admin dashboard, cohort management
2. **Paywall**:
   - Lock premium content behind subscription check
   - Show "Upgrade to Premium" modal when accessing locked content
   - Add `/pricing` page with feature comparison
3. **Billing Portal**:
   - Use Stripe Customer Portal for plan changes, cancellations
   - Add `/account/billing` route
4. **Institutional Licenses**:
   - Admin can invite users via email
   - Track seat usage (50 max per institution)
   - Institution-level analytics dashboard
5. **Webhooks**:
   - Handle `checkout.session.completed` → activate subscription
   - Handle `customer.subscription.deleted` → downgrade to free
   - Handle `invoice.payment_failed` → send dunning email

**Files**: `src/lib/stripe.ts`, `src/components/PricingPage.tsx`, `src/components/BillingPortal.tsx`, `server.ts`

---

### 3.6 Internationalization (i18n) ⏱ 6 days
**Goal**: Support Spanish + French translations.

**Tasks**:
1. Install `react-i18next` + `i18next`
2. Extract all UI strings to JSON files:
   - `public/locales/en/common.json`
   - `public/locales/es/common.json`
   - `public/locales/fr/common.json`
3. Extract lesson content to Markdown files with language variants:
   - `content/modules/module-0/lesson-1.en.md`
   - `content/modules/module-0/lesson-1.es.md`
   - `content/modules/module-0/lesson-1.fr.md`
4. Create `src/lib/i18n.ts`:
   - Detect browser language
   - Load appropriate locale
   - Fallback to English if translation missing
5. Add language switcher in sidebar header
6. Translate all UI strings (use DeepL or professional translator)
7. Translate 2-3 sample lessons per language (rest can be crowd-sourced later)
8. Add RTL support for future Arabic/Hebrew (CSS logical properties)

**Files**: `src/lib/i18n.ts`, `public/locales/`, all components

---

## Phase 4: Scale (Weeks 11-14)
*Production readiness*

### 4.1 CI/CD Pipeline ⏱ 3 days
**Goal**: Automated testing and deployment on every PR.

**Tasks**:
1. Create `.github/workflows/ci.yml`:
   - Trigger on push to `main`, pull requests
   - Steps:
     - Checkout code
     - Setup Node.js 20
     - Install dependencies (`npm ci`)
     - Run TypeScript check (`npm run lint`)
     - Run tests (`npm run test`)
     - Run build (`npm run build`)
     - Run accessibility audit (axe-core)
     - Upload coverage to Codecov
2. Create `.github/workflows/deploy.yml`:
   - Trigger on push to `main` (after CI passes)
   - Steps:
     - Build production bundle
     - Deploy to Vercel/Netlify/AWS (choose platform)
     - Run smoke tests (curl key routes)
3. Add PR template (`.github/pull_request_template.md`)
4. Add branch protection: require CI passing before merge

**Files**: `.github/workflows/ci.yml`, `.github/workflows/deploy.yml`

---

### 4.2 Performance Optimization ⏱ 5 days
**Goal**: Sub-3s load time, 90+ Lighthouse score.

**Tasks**:
1. **Code splitting**:
   - Lazy load module content: `React.lazy(() => import('./modules/Module0'))`
   - Split vendor chunks: React, Motion, Mermaid, Recharts (already done by Vite)
   - Route-based splitting: each route loads only its components
2. **Image optimization**:
   - Convert all images to WebP/AVIF
   - Add `<img loading="lazy">` for below-fold images
   - Add responsive images (`srcset` for different screen sizes)
   - Compress OG images to <100KB
3. **Font optimization**:
   - Self-host fonts (remove Google Fonts dependency)
   - Use `font-display: swap` (already set)
   - Subset fonts to Latin characters only (remove unused glyphs)
4. **Bundle analysis**:
   - Run `npx vite-bundle-visualizer`
   - Identify large chunks, tree-shake unused exports
   - Replace heavy deps (e.g., Moment.js → date-fns if used)
5. **Caching strategy**:
   - Set `Cache-Control: public, max-age=31536000` for hashed assets
   - Set `Cache-Control: no-cache` for index.html
   - Add service worker precache for critical assets
6. **Preloading**:
   - Add `<link rel="preload">` for critical CSS/JS
   - Add `<link rel="prefetch">` for next-likely routes

**Files**: `vite.config.ts`, `src/App.tsx`, all components

---

### 4.3 Monitoring & Error Tracking ⏱ 3 days
**Goal**: Know when things break before users report it.

**Tasks**:
1. **Sentry** (error tracking):
   - Install `@sentry/react` + `@sentry/node`
   - Configure in `main.tsx` (client) and `server.ts` (server)
   - Capture unhandled errors, promise rejections
   - Add breadcrumbs (user actions leading to error)
   - Set up Slack alert for critical errors
2. **Health checks**:
   - Add `/api/health` endpoint (already exists)
   - Add uptime monitoring (UptimeRobot, Pingdom)
   - Alert if health check fails 3x in row
3. **Structured logging**:
   - Install `pino` (server-side)
   - Log format: JSON with timestamp, level, message, metadata
   - Ship logs to Datadog/LogDNA (or self-host Grafana Loki)
4. **Performance monitoring**:
   - Add Web Vitals tracking (LCP, FID, CLS)
   - Use `web-vitals` library
   - Send to analytics backend or Sentry

**Files**: `src/main.tsx`, `server.ts`, `src/lib/monitoring.ts`

---

### 4.4 A/B Testing Framework ⏱ 4 days
**Goal**: Test UI changes, measure impact on engagement.

**Tasks**:
1. **Feature flags**:
   - Install `unleash-client` or `launchdarkly-js-client-sdk`
   - Create flag service: `src/lib/featureFlags.ts`
   - Check flags in components: `if (flags.showNewDashboard) { ... }`
2. **Experiment framework**:
   - Create `src/lib/experiments.ts`:
     - Assign user to variant (A/B/C) based on userId hash
     - Track variant in analytics
   - Example experiment: "New onboarding flow" (control: current, variant: guided tour)
3. **Admin UI**:
   - Create `/admin/experiments` page
   - List active experiments, variants, traffic split
   - Show results: conversion rate, statistical significance
4. **Documentation**:
   - Write experiment brief template (hypothesis, metric, duration)
   - Create playbook for running experiments

**Files**: `src/lib/featureFlags.ts`, `src/lib/experiments.ts`, `src/components/admin/ExperimentsDashboard.tsx`

---

### 4.5 Video Content (Optional) ⏱ Ongoing
**Goal**: Original explainer videos for each module.

**Tasks**:
1. **Script writing**:
   - Write 5-7 min script per lesson (based on existing text content)
   - Include visual cues (diagrams, animations)
2. **Recording**:
   - Use OBS Studio + green screen (or screen recording)
   - Record narration + slides/animations
3. **Editing**:
   - Use DaVinci Resolve (free) or Adobe Premiere
   - Add intro/outro, lower thirds, captions
4. **Hosting**:
   - Upload to YouTube (unlisted) or Vimeo (paid)
   - Embed in `ModuleView.tsx` with custom player
5. **Transcripts**:
   - Auto-generate captions (YouTube, Otter.ai)
   - Add transcript toggle for accessibility

**Files**: `scripts/`, `videos/`, `src/components/VideoPlayer.tsx`

---

## Success Metrics

### Phase 1 Metrics
- **SEO**: 50+ organic visits/week (from 0)
- **Auth**: 100+ registered users
- **Certificates**: 20+ certificates downloaded

### Phase 2 Metrics
- **Retention**: 40% of users return within 7 days
- **Engagement**: Average session length >10 min
- **Accessibility**: 0 critical WCAG violations
- **Search**: 30+ searches/day

### Phase 3 Metrics
- **Conversion**: 5% free → premium conversion
- **Social**: 100+ discussion threads, 500+ comments
- **Revenue**: $500 MRR (monthly recurring revenue)
- **NPS**: 50+ (Net Promoter Score)

### Phase 4 Metrics
- **Performance**: Lighthouse score >90 (Performance, Accessibility, Best Practices, SEO)
- **Uptime**: 99.9% (no more than 8.76 hours downtime/year)
- **Error rate**: <0.1% of requests result in errors
- **Deploy frequency**: 10+ deploys/week

---

## Dependencies & Risks

### Dependencies
- **Phase 1.2** (Database) blocks **Phase 3.2** (Social) and **Phase 3.4** (Notifications)
- **Phase 1.3** (Auth) blocks **Phase 3.5** (Subscriptions)
- **Phase 2.2** (Analytics) blocks **Phase 4.4** (A/B Testing)

### Risks
- **Scope creep**: Phase 3.2 (Social) could expand indefinitely. Set hard deadline (10 days).
- **Stripe complexity**: Payment integration has edge cases (refunds, chargebacks). Start with simple subscriptions.
- **i18n quality**: Machine translations may be poor. Budget for professional review.
- **Video production**: Time-intensive. Start with 1-2 pilot videos before committing to full curriculum.

---

## Quick Reference

### Commands
```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build
npm run verify       # Type check + build + test
npm run test         # Run 156 tests
npm run test:coverage # Coverage report
```

### Key Files
- `src/App.tsx` — Main app with routing
- `src/data/courseData.ts` — 15 modules, 80+ lessons
- `src/data/lectureLibrary.ts` — 16 lecture classes
- `server.ts` — Express API + Vite dev server
- `vite.config.ts` — Vite + Vitest config

### Environment Variables
```bash
DATABASE_URL=postgresql://...
JWT_SECRET=...
ALPHA_VANTAGE_API_KEY=...
GEMINI_API_KEY=...
ALLOWED_ORIGINS=https://fintechfoundations.edu
STRIPE_SECRET_KEY=...
SENDGRID_API_KEY=...
SENTRY_DSN=...
```
