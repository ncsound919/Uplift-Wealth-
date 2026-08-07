import express, { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import * as Sentry from "@sentry/node";
import {
  hashPassword,
  verifyPassword,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  resolveRequestUser,
  userIdFromEmail,
  isValidEmail,
  REFRESH_COOKIE_NAME,
  REFRESH_COOKIE_MAX_AGE,
} from "./src/lib/auth";
import { isDbConfigured, ensureTables, query } from "./src/db/client";
import { syncFullDb, loadFullDb } from "./src/db/sync";
import { runMigrations } from "./src/db/migrate";
import { computeMetrics } from "./src/db/metrics";
import {
  listThreads,
  getThread,
  createThread,
  addComment,
  toggleThreadUpvote,
  toggleCommentUpvote,
  reportTarget,
  deleteThread,
  deleteComment,
} from "./src/db/threadOps";
import {
  listMyCohorts,
  getCohort,
  createCohort,
  joinCohort,
  joinCohortByCode,
  leaveCohort,
  deleteCohort,
  cohortLeaderboard,
  setCohortCurriculum,
  cohortRoster,
} from "./src/db/cohortOps";
import {
  getEffectiveContent,
  listOverrides,
  getRevisions,
  saveOverride,
  deleteOverride,
} from "./src/db/contentOps";
import { sendWelcomeEmail, sendWaitlistConfirmEmail, sendEmail, escapeHtml } from "./src/lib/email";
import { PLANS, isStripeConfigured, createCheckoutSession, createPortalSession, verifyWebhookSignature } from "./src/lib/stripe";
import type { DatabaseSchema } from "./src/db/types";

dotenv.config({ quiet: true });
dotenv.config({ path: '.env.local', override: true, quiet: true });

const app = express();
app.disable('x-powered-by');
const PORT = Number(process.env.PORT) || 3000;
const START_TIME = Date.now();
const DIST_READY = fs.existsSync(path.join(process.cwd(), 'dist', 'index.html'));
const effectiveEnv = process.env.NODE_ENV || (DIST_READY ? 'production' : 'development');

// Fail fast: in production, forging tokens must be impossible. Refuse to boot
// without explicit JWT secrets rather than silently using dev-only defaults.
if (effectiveEnv === 'production' && (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET)) {
  console.error('[Security] JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must both be set in production. Refusing to start.');
  process.exit(1);
}

// Error tracking (optional — no-op without SENTRY_DSN).
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: effectiveEnv,
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE) || 0.1,
    integrations: [Sentry.expressIntegration()],
  });
  console.log('[Monitoring] Sentry initialized (server)');
}

// ---------------------------------------------------------------------------
// 1. DATA PERSISTENCE ENGINE (File-backed with Atomic Synchronous Memory Store)
// ---------------------------------------------------------------------------
const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'store.json');

const initialDb: DatabaseSchema = {
  users: {
    'demo-student-01': {
      id: 'demo-student-01',
      name: 'HBCU Fintech Scholar',
      role: 'student',
      track: 'all',
      badges: ['pioneer_scholar', 'underwriting_ace'],
      streakDays: 5,
      lastActive: new Date().toISOString()
    }
  },
  progress: {
    'demo-student-01': {
      userId: 'demo-student-01',
      completedLessons: ['module-1-lesson-1', 'module-1-lesson-2'],
      completedModules: [],
      quizScores: { 'module-1': 100 },
      certificates: []
    }
  },
  sandboxes: {},
  donations: [
    {
      id: 'don-001',
      userId: 'demo-student-01',
      amount: 50,
      tierLabel: 'Community Champion',
      timestamp: new Date().toISOString()
    }
  ],
  auditLogs: [],
  waitlist: [],
  threads: [],
  comments: [],
  reports: [],
  cohorts: [],
  notifications: [],
  lessonOverrides: [],
  contentRevisions: [],
  creatorApplications: []
};

let db: DatabaseSchema = { ...initialDb };

/** Fire-and-forget PostgreSQL dual-write. Debounced (trailing) so bursts of
 *  file writes — e.g. the per-request audit log — coalesce into at most one
 *  full sync every few seconds. The file store stays authoritative until the
 *  migration is proven (Phase 0.2/0.3), so a PG failure is non-fatal. */
let pgSyncQueued = false;
let lastPgSyncAt = 0;
const PG_SYNC_INTERVAL_MS = 5000;

async function runPgSync() {
  const snapshot = db;
  try {
    await ensureTables();
    await syncFullDb(query, snapshot);
  } catch (err) {
    console.warn('[DB] Postgres sync failed (file store remains authoritative):', err);
  }
}

function syncToPostgres() {
  if (!isDbConfigured()) return;
  // Serverless (Vercel): function instances are short-lived, so a debounce
  // timer can freeze before firing and drop the write. Sync immediately — the
  // in-flight pg I/O keeps the event loop alive until it completes.
  if (process.env.VERCEL === '1') {
    void runPgSync();
    return;
  }
  if (pgSyncQueued) return;
  const now = Date.now();
  if (now - lastPgSyncAt >= PG_SYNC_INTERVAL_MS) {
    lastPgSyncAt = now;
    void runPgSync();
    return;
  }
  // Trailing debounce: ensure a final sync runs after the last burst.
  pgSyncQueued = true;
  setTimeout(() => {
    pgSyncQueued = false;
    lastPgSyncAt = Date.now();
    void runPgSync();
  }, PG_SYNC_INTERVAL_MS);
}

/** Fills in any collections missing from an older store.json so new fields
 *  (e.g. `waitlist`, `threads`) never break handlers on a pre-existing file. */
function normalizeDb(raw: DatabaseSchema): DatabaseSchema {
  return {
    users: raw.users ?? {},
    progress: raw.progress ?? {},
    sandboxes: raw.sandboxes ?? {},
    donations: raw.donations ?? [],
    auditLogs: raw.auditLogs ?? [],
    waitlist: raw.waitlist ?? [],
    threads: raw.threads ?? [],
    comments: raw.comments ?? [],
    reports: raw.reports ?? [],
    cohorts: raw.cohorts ?? [],
    notifications: raw.notifications ?? [],
    lessonOverrides: raw.lessonOverrides ?? [],
    contentRevisions: raw.contentRevisions ?? [],
    creatorApplications: raw.creatorApplications ?? [],
  };
}

function initDatabase() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      db = normalizeDb(JSON.parse(raw));
    } else {
      saveDatabase();
    }
  } catch (err) {
    console.warn('[DB Engine] Failed loading store.json, using in-memory default:', err);
  }

  // Postgres is the durable source of truth when configured: run migrations,
  // hydrate from it (overlaying on top of the local file so nothing local is
  // lost), then push the merged state back to both stores.
  if (isDbConfigured()) {
    void (async () => {
      try {
        await runMigrations();
        await ensureTables();
        const pg = await loadFullDb(query);

        db = {
          users: { ...db.users, ...pg.users },
          progress: { ...db.progress, ...pg.progress },
          sandboxes: { ...db.sandboxes, ...pg.sandboxes },
          donations: [
            ...db.donations.filter(d => !pg.donations.some(p => p.id === d.id)),
            ...pg.donations,
          ],
          auditLogs: [
            ...db.auditLogs.filter(l => !pg.auditLogs.some(p => p.id === l.id)),
            ...pg.auditLogs,
          ],
          waitlist: [
            ...(db.waitlist ?? []).filter(w => !(pg.waitlist ?? []).some(p => p.email === w.email)),
            ...(pg.waitlist ?? []),
          ],
          threads: [
            ...(db.threads ?? []).filter(t => !(pg.threads ?? []).some(p => p.id === t.id)),
            ...(pg.threads ?? []),
          ],
          comments: [
            ...(db.comments ?? []).filter(c => !(pg.comments ?? []).some(p => p.id === c.id)),
            ...(pg.comments ?? []),
          ],
          reports: [
            ...(db.reports ?? []).filter(r => !(pg.reports ?? []).some(p => p.id === r.id)),
            ...(pg.reports ?? []),
          ],
          cohorts: [
            ...(db.cohorts ?? []).filter(c => !(pg.cohorts ?? []).some(p => p.id === c.id)),
            ...(pg.cohorts ?? []),
          ],
          notifications: [
            ...(db.notifications ?? []).filter(n => !(pg.notifications ?? []).some(p => p.id === n.id)),
            ...(pg.notifications ?? []),
          ],
          lessonOverrides: [
            ...(db.lessonOverrides ?? []).filter(o => !(pg.lessonOverrides ?? []).some(p => p.moduleId === o.moduleId && p.lessonId === o.lessonId)),
            ...(pg.lessonOverrides ?? []),
          ],
          contentRevisions: [
            ...(db.contentRevisions ?? []).filter(r => !(pg.contentRevisions ?? []).some(p => p.id === r.id)),
            ...(pg.contentRevisions ?? []),
          ],
          creatorApplications: [
            ...(db.creatorApplications ?? []).filter(a => !(pg.creatorApplications ?? []).some(p => p.id === a.id)),
            ...(pg.creatorApplications ?? []),
          ],
        };
        saveDatabase();
        syncToPostgres();
        console.log(`[DB] Hydrated from PostgreSQL (${Object.keys(pg.users).length} users).`);
      } catch (err) {
        console.warn('[DB Engine] Postgres unavailable; continuing with file store:', err);
      }
    })();
  }
}

let isWriting = false;
let writePending = false;

function saveDatabase() {
  // On serverless (Vercel) the filesystem is ephemeral/read-only — Postgres is
  // the only durable store, so skip the file write entirely (immediate sync).
  if (process.env.VERCEL === '1') {
    syncToPostgres();
    return;
  }
  if (isWriting) {
    writePending = true;
    return;
  }
  isWriting = true;

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.error('[DB Engine] Failed to create data directory:', err);
    isWriting = false;
    return;
  }

  const data = JSON.stringify(db, null, 2);
  fs.writeFile(DB_FILE, data, 'utf-8', (err) => {
    isWriting = false;
    if (err) {
      console.error('[DB Engine] Async write error:', err);
      // Retry pending write if there was an error (don't lose data)
      if (writePending) {
        writePending = false;
        saveDatabase();
      }
      return;
    }
    if (writePending) {
      writePending = false;
      saveDatabase();
    }
  });

  // Dual-write to PostgreSQL (debounced). Non-fatal on failure.
  syncToPostgres();
}

initDatabase();

// Render (and most platforms) terminate TLS at a proxy; trusting the first
// proxy hop keeps the rate limiter keyed on the real client IP.
app.set('trust proxy', 1);

// ---------------------------------------------------------------------------
// 2. SECURITY HEADERS & CORS MIDDLEWARE
// ---------------------------------------------------------------------------
app.use(express.json({ limit: '2mb', verify: (req, _res, buf) => { (req as Request & { rawBody?: Buffer }).rawBody = buf; } }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Minimal, safe security headers (no CSP — index.html already ships one).
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

// Request timeout — drop slow clients after 30s
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setTimeout(30000, () => {
    res.status(408).json({ error: 'Request timeout' });
  });
  next();
});

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : (process.env.NODE_ENV === 'production' ? [] : ['*']);

app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin || '';
  const allowOrigin = ALLOWED_ORIGINS.includes('*') ? '*' : (ALLOWED_ORIGINS.includes(origin) ? origin : '');
  if (allowOrigin) {
    res.setHeader('Access-Control-Allow-Origin', allowOrigin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-Id, X-User-Role');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

// ---------------------------------------------------------------------------
// 3. STRUCTURED REQUEST LOGGER & RATE LIMITER
// ---------------------------------------------------------------------------
function rateLimiter(maxRequests = 100, windowMs = 60000) {
  // Per-instance counter map so a route-level limiter (e.g. login) never
  // competes with the global /api limiter for the same budget.
  const counts = new Map<string, { count: number; resetAt: number }>();
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const now = Date.now();
    const record = counts.get(ip) || { count: 0, resetAt: now + windowMs };

    if (now > record.resetAt) {
      record.count = 1;
      record.resetAt = now + windowMs;
    } else {
      record.count += 1;
    }

    counts.set(ip, record);

    if (record.count > maxRequests) {
      return res.status(429).json({
        type: 'https://httpstatuses.com/429',
        title: 'Too Many Requests',
        status: 429,
        detail: `Rate limit exceeded. Maximum ${maxRequests} requests allowed per minute. Retry in ${Math.ceil((record.resetAt - now) / 1000)} seconds.`
      });
    }

    next();
  };
}

app.use('/api', rateLimiter(120, 60000));

app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path.startsWith('/api')) {
      const logEntry = {
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: new Date().toISOString(),
        ip: req.ip || '127.0.0.1',
        method: req.method,
        path: req.path,
        userId: (req.headers['x-user-id'] as string) || 'guest',
        action: `${req.method} ${req.path} -> ${res.statusCode} (${duration}ms)`
      };
      
      db.auditLogs.unshift(logEntry);
      if (db.auditLogs.length > 500) db.auditLogs.pop(); // keep last 500 logs
      saveDatabase();
    }
  });
  next();
});

// ---------------------------------------------------------------------------
// 4. AUTH & ROLE-BASED ACCESS CONTROL (RBAC) MIDDLEWARE
// ---------------------------------------------------------------------------
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: 'student' | 'builder' | 'institution' | 'admin';
  };
}

function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = (req.headers.authorization as string) || '';
  const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  req.user = resolveRequestUser(bearer);

  // Ensure user exists in DB
  if (!db.users[req.user.id]) {
    db.users[req.user.id] = {
      id: req.user.id,
      name: 'Scholar User',
      role: req.user.role,
      track: 'all',
      badges: ['pioneer_scholar'],
      streakDays: 1,
      lastActive: new Date().toISOString()
    };
    saveDatabase();
  }

  next();
}

function requireRole(allowedRoles: Array<'student' | 'builder' | 'institution' | 'admin'>) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        type: 'https://httpstatuses.com/403',
        title: 'Forbidden',
        status: 403,
        detail: `Access restricted. Required role: ${allowedRoles.join(' or ')}.`
      });
    }
    next();
  };
}

// ---------------------------------------------------------------------------
// 5. IN-MEMORY CACHE FOR THIRD-PARTY MARKET APIS (5 min TTL)
// ---------------------------------------------------------------------------
const cache = new Map<string, { data: any; expiry: number }>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && entry.expiry > Date.now()) {
    return entry.data as T;
  }
  return null;
}

function setCache(key: string, data: any, ttlMs = 300000) {
  cache.set(key, { data, expiry: Date.now() + ttlMs });
}

// ---------------------------------------------------------------------------
// 6. RESTFUL API ENDPOINTS
// ---------------------------------------------------------------------------

// 6.0 AUTHENTICATION ENDPOINTS (Email register/login, refresh, Google stub)
function findUserByEmail(email: string) {
  const clean = email.toLowerCase().trim();
  return Object.values(db.users).find(u => u.email === clean);
}

function getCookie(req: Request, name: string): string | undefined {
  const header = req.headers.cookie || '';
  const match = new RegExp(`(?:^|;\\s*)${name}=([^;]*)`).exec(header);
  return match ? decodeURIComponent(match[1]) : undefined;
}

function setRefreshCookie(res: Response, token: string) {
  const secure = process.env.NODE_ENV === 'production';
  res.setHeader('Set-Cookie', `${REFRESH_COOKIE_NAME}=${encodeURIComponent(token)}; HttpOnly; Path=/; Max-Age=${REFRESH_COOKIE_MAX_AGE}; SameSite=Lax${secure ? '; Secure' : ''}`);
}

function clearRefreshCookie(res: Response) {
  res.setHeader('Set-Cookie', `${REFRESH_COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`);
}

app.post('/api/auth/register', rateLimiter(5, 60000), async (req: Request, res: Response) => {
  const { email, password, name } = req.body || {};
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'A valid email is required.' });
  }
  if (!password || typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
  }
  const cleanEmail = email.toLowerCase().trim();
  if (findUserByEmail(cleanEmail)) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }

  const passwordHash = await hashPassword(password);
  const id = userIdFromEmail(cleanEmail);
  const cleanName = typeof name === 'string' ? name.trim().slice(0, 100) : '';
  db.users[id] = {
    id,
    email: cleanEmail,
    passwordHash,
    name: cleanName || cleanEmail.split('@')[0],
    role: 'student',
    track: 'all',
    badges: ['pioneer_scholar'],
    streakDays: 1,
    lastActive: new Date().toISOString(),
    tokenVersion: 0
  };
  saveDatabase();

  // Fire-and-forget welcome email (no-op without EMAIL_API_KEY).
  const registeredName = name ? String(name).trim() : cleanEmail.split('@')[0];
  void sendWelcomeEmail(cleanEmail, registeredName).catch(() => {});

  const token = signAccessToken({ id, role: 'student' });
  setRefreshCookie(res, signRefreshToken({ id, role: 'student' }, db.users[id].tokenVersion ?? 0));
  res.status(201).json({ success: true, token, user: { ...db.users[id], email: cleanEmail } });
});

app.post('/api/auth/login', rateLimiter(5, 60000), async (req: Request, res: Response) => {
  const { email, password } = req.body || {};
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'A valid email is required.' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const user = findUserByEmail(cleanEmail);
  if (!user || !user.passwordHash) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }
  const ok = await verifyPassword(String(password || ''), user.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = signAccessToken({ id: user.id, role: user.role });
  setRefreshCookie(res, signRefreshToken({ id: user.id, role: user.role }, user.tokenVersion ?? 0));
  res.json({ success: true, token, user: { ...user, email: cleanEmail } });
});

app.post('/api/auth/google', rateLimiter(5, 60000), (req: Request, res: Response) => {
  const { email } = req.body || {};
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'A valid email is required.' });
  }
  const cleanEmail = email.toLowerCase().trim();
  const userId = userIdFromEmail(cleanEmail, 'usr-google');
  if (!db.users[userId]) {
    db.users[userId] = {
      id: userId,
      email: cleanEmail,
      name: cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' '),
      role: 'student',
      track: 'all',
      badges: ['pioneer_scholar', 'google_sso_verified'],
      streakDays: 3,
      lastActive: new Date().toISOString()
    };
    saveDatabase();
  }

  const user = db.users[userId];
  const token = signAccessToken({ id: userId, role: user.role });
  setRefreshCookie(res, signRefreshToken({ id: userId, role: user.role }, user.tokenVersion ?? 0));
  res.json({ success: true, token, user: { ...user, email: cleanEmail } });
});

app.post('/api/auth/refresh', rateLimiter(10, 60000), (req: Request, res: Response) => {
  const refreshToken = getCookie(req, REFRESH_COOKIE_NAME);
  const verified = refreshToken ? verifyRefreshToken(refreshToken) : null;
  if (!verified) {
    return res.status(401).json({ error: 'Session expired. Please sign in again.' });
  }
  const stored = db.users[verified.id];
  // Reject refresh tokens issued before the user's last logout (revocation).
  if (stored && (stored.tokenVersion ?? 0) !== verified.tokenVersion) {
    return res.status(401).json({ error: 'Session expired. Please sign in again.' });
  }
  const role = stored ? stored.role : verified.role;
  const token = signAccessToken({ id: verified.id, role });
  setRefreshCookie(res, signRefreshToken({ id: verified.id, role }, stored?.tokenVersion ?? verified.tokenVersion));
  res.json({
    success: true,
    token,
    user: stored
      ? { ...stored, email: stored.email || '' }
      : { id: verified.id, name: 'Scholar User', role, track: 'all', badges: ['pioneer_scholar'], streakDays: 1, lastActive: new Date().toISOString() }
  });
});

app.get('/api/auth/me', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const user = db.users[userId] || {
    id: userId,
    name: 'Scholar User',
    role: 'student',
    track: 'all',
    badges: ['pioneer_scholar'],
    streakDays: 1,
    lastActive: new Date().toISOString()
  };
  res.json({ user: { ...user, email: user.email || '' } });
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  // Revoke all outstanding refresh tokens for this user by bumping the token
  // version embedded in the refresh token (best-effort).
  const refreshToken = getCookie(req, REFRESH_COOKIE_NAME);
  const verified = refreshToken ? verifyRefreshToken(refreshToken) : null;
  if (verified) {
    const stored = db.users[verified.id];
    if (stored) {
      stored.tokenVersion = (stored.tokenVersion ?? 0) + 1;
      saveDatabase();
    }
  }
  clearRefreshCookie(res);
  res.json({ success: true, message: 'Successfully logged out.' });
});

// 6.1 SYSTEM HEALTH & AUDIT METRICS
app.get('/api/health', (req, res) => {
  const memory = process.memoryUsage();
  res.json({
    status: "ok",
    version: "1.0.0",
    uptimeSeconds: Math.floor((Date.now() - START_TIME) / 1000),
    timestamp: new Date().toISOString(),
    dbReady: true,
    totalUsers: Object.keys(db.users).length,
    totalAuditLogs: db.auditLogs.length,
    memoryUsageMB: {
      rss: Math.round(memory.rss / 1024 / 1024),
      heapTotal: Math.round(memory.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memory.heapUsed / 1024 / 1024)
    },
    env: {
      nodeEnv: effectiveEnv
    }
  });
});

// 6.2 SYSTEM API DOCUMENTATION SCHEMA
app.get('/api/docs', (req, res) => {
  res.json({
    title: "Overlay Wealth Open API Specification",
    version: "1.0.0",
    description: "Production Express backend engine powering credit underwriting, parametric smart contracts, trading sandboxes, and course progress synchronization.",
    endpoints: [
      { path: "/api/health", method: "GET", description: "Deep system health & diagnostic telemetry" },
      { path: "/api/user/profile", method: "GET|PUT", description: "Fetch and update user scholar profiles" },
      { path: "/api/progress", method: "GET", description: "Retrieve user curriculum completion matrix" },
      { path: "/api/progress/lesson", method: "POST", description: "Atomically register lesson completion" },
      { path: "/api/quiz/submit", method: "POST", description: "Evaluate module assessment and issue certificate" },
      { path: "/api/sandbox/save", method: "POST", description: "Persist terminal state snapshot across modules" },
      { path: "/api/sandbox/load", method: "GET", description: "Retrieve active sandbox state" },
      { path: "/api/donations/stats", method: "GET", description: "Community impact pledges & grant metrics" },
      { path: "/api/donation-intent", method: "POST", description: "Register funding pledge intent" },
      { path: "/api/alphavantage/quote/:symbol", method: "GET", description: "Real-time stock market quote proxy" },
      { path: "/api/admin/audit-logs", method: "GET", description: "System compliance audit trail (Admin only)" },
      { path: "/api/admin/metrics", method: "GET", description: "Aggregate platform metrics (Admin/Institution only)" },
      { path: "/api/waitlist", method: "POST", description: "Join the email waitlist" },
      { path: "/api/threads", method: "GET|POST", description: "List / create discussion threads" },
      { path: "/api/threads/:id", method: "GET|DELETE", description: "Fetch or moderate a thread" },
      { path: "/api/threads/:id/comments", method: "POST", description: "Reply to a thread" },
      { path: "/api/threads/:id/upvote", method: "POST", description: "Upvote / un-upvote a thread" },
      { path: "/api/comments/:id/upvote", method: "POST", description: "Upvote / un-upvote a comment" },
      { path: "/api/reports", method: "POST", description: "Report a thread or comment for moderation" },
      { path: "/api/cohorts", method: "GET|POST", description: "List / create learning cohorts" },
      { path: "/api/notifications", method: "GET", description: "List current user notifications" },
      { path: "/api/notifications/read-all", method: "POST", description: "Mark all notifications read" }
    ]
  });
});

// 6.3 USER PROFILE ENDPOINTS
app.get('/api/user/profile', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const profile = db.users[userId] || {
    id: userId,
    name: 'Scholar User',
    role: req.user!.role,
    track: 'all',
    badges: ['pioneer_scholar'],
    streakDays: 1,
    lastActive: new Date().toISOString()
  };
  res.json(profile);
});

app.put('/api/user/profile', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { name, track, role, avatar, profilePublic } = req.body;

  const current = db.users[userId] || {
    id: userId,
    name: 'Scholar User',
    role: 'student',
    track: 'all',
    badges: ['pioneer_scholar'],
    streakDays: 1,
    lastActive: new Date().toISOString()
  };

  if (name && typeof name === 'string') current.name = name.trim().slice(0, 100);
  if (track && typeof track === 'string' && ['beginner', 'intermediate', 'advanced', 'all'].includes(track)) current.track = track;
  if (role && ['student', 'builder', 'institution', 'admin'].includes(role)) current.role = role;
  if (avatar && typeof avatar === 'string' && avatar.length < 2048) current.avatar = avatar;
  if (typeof profilePublic === 'boolean') current.profilePublic = profilePublic;

  current.lastActive = new Date().toISOString();
  db.users[userId] = current;
  saveDatabase();

  res.json(current);
});

// 6.3.1 PUBLIC PROFILE (opt-in). Returns only non-sensitive public data;
// private profiles are indistinguishable from missing ones (404).
app.get('/api/profile/:userId', (req: Request, res: Response) => {
  const user = db.users[req.params.userId];
  if (!user || !user.profilePublic) {
    return res.status(404).json({ error: 'Profile not found.' });
  }
  const progress = db.progress[user.id];
  res.json({
    id: user.id,
    name: user.name,
    badges: user.badges ?? [],
    streakDays: user.streakDays ?? 0,
    track: user.track,
    creatorVerified: user.creatorVerified ?? false,
    creatorBio: user.creatorBio ?? undefined,
    xp: progress?.xp ?? 0,
    completedModules: progress?.completedModules ?? [],
    completedLessonsCount: progress?.completedLessons?.length ?? 0,
  });
});

// 6.4 COURSE PROGRESS ENDPOINTS
app.get('/api/progress', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const userProgress = db.progress[userId] || {
    userId,
    completedLessons: [],
    completedModules: [],
    quizScores: {},
    certificates: [],
    xp: 0,
    gameTimeSeconds: 0
  };
  const user = db.users[userId];
  res.json({
    ...userProgress,
    xp: userProgress.xp ?? 0,
    gameTimeSeconds: userProgress.gameTimeSeconds ?? 0,
    streakDays: user?.streakDays ?? 0,
    badges: user?.badges ?? []
  });
});

// Full stats snapshot sync (XP, streak, badges, game time) — server is the
// source of truth once a user is signed in; the client's localStorage is only
// the offline cache.
app.put('/api/progress/stats', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { xp, streakDays, badges, gameTimeSeconds } = req.body || {};

  const userProgress = db.progress[userId] || {
    userId,
    completedLessons: [],
    completedModules: [],
    quizScores: {},
    certificates: [],
    xp: 0,
    gameTimeSeconds: 0
  };
  if (typeof xp === 'number' && Number.isFinite(xp)) userProgress.xp = Math.max(0, Math.round(xp));
  if (typeof gameTimeSeconds === 'number' && Number.isFinite(gameTimeSeconds)) userProgress.gameTimeSeconds = Math.max(0, Math.round(gameTimeSeconds));
  db.progress[userId] = userProgress;

  const user = db.users[userId] || {
    id: userId,
    name: 'Scholar User',
    role: 'student',
    track: 'all',
    badges: [],
    streakDays: 0,
    lastActive: new Date().toISOString()
  };
  if (typeof streakDays === 'number' && Number.isFinite(streakDays)) user.streakDays = Math.max(0, Math.round(streakDays));
  if (Array.isArray(badges)) user.badges = badges.map(String).slice(0, 50).map(b => b.slice(0, 100));
  user.lastActive = new Date().toISOString();
  db.users[userId] = user;

  saveDatabase();
  res.json({ xp: userProgress.xp, gameTimeSeconds: userProgress.gameTimeSeconds, streakDays: user.streakDays, badges: user.badges });
});

app.post('/api/progress/lesson', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { lessonId, moduleId, stats } = req.body;

  if (!lessonId || typeof lessonId !== 'string' || lessonId.length > 200) {
    return res.status(400).json({ error: 'Missing or invalid lessonId.' });
  }

  const userProgress = db.progress[userId] || {
    userId,
    completedLessons: [],
    completedModules: [],
    quizScores: {},
    certificates: [],
    xp: 0,
    gameTimeSeconds: 0
  };

  if (!userProgress.completedLessons.includes(lessonId)) {
    userProgress.completedLessons.push(lessonId);
  }

  // Optional stats snapshot piggybacked on lesson completion.
  if (stats && typeof stats === 'object') {
    if (typeof stats.xp === 'number' && Number.isFinite(stats.xp)) userProgress.xp = Math.max(0, Math.round(stats.xp));
    if (typeof stats.gameTimeSeconds === 'number' && Number.isFinite(stats.gameTimeSeconds)) userProgress.gameTimeSeconds = Math.max(0, Math.round(stats.gameTimeSeconds));
    const user = db.users[userId];
    if (user) {
      if (typeof stats.streakDays === 'number' && Number.isFinite(stats.streakDays)) user.streakDays = Math.max(0, Math.round(stats.streakDays));
      if (Array.isArray(stats.badges)) user.badges = stats.badges.map(String).slice(0, 50).map(b => b.slice(0, 100));
    }
  }

  db.progress[userId] = userProgress;
  saveDatabase();

  const user = db.users[userId];
  res.json({
    ...userProgress,
    xp: userProgress.xp ?? 0,
    gameTimeSeconds: userProgress.gameTimeSeconds ?? 0,
    streakDays: user?.streakDays ?? 0,
    badges: user?.badges ?? []
  });
});

// 6.5 QUIZ EVALUATION & CERTIFICATE GENERATION
app.post('/api/quiz/submit', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { moduleId, score, totalQuestions } = req.body;

  if (!moduleId || score === undefined || !totalQuestions) {
    return res.status(400).json({ error: 'Missing required fields: moduleId, score, totalQuestions' });
  }

  if (typeof score !== 'number' || typeof totalQuestions !== 'number' || 
      !Number.isFinite(score) || !Number.isFinite(totalQuestions) ||
      score < 0 || totalQuestions <= 0 || score > totalQuestions) {
    return res.status(400).json({ error: 'Invalid score or totalQuestions: must be finite numbers with 0 <= score <= totalQuestions' });
  }

  const pct = score / totalQuestions;
  const passed = pct >= 0.7;

  const userProgress = db.progress[userId] || {
    userId,
    completedLessons: [],
    completedModules: [],
    quizScores: {},
    certificates: []
  };

  userProgress.quizScores[moduleId] = Math.round(pct * 100);

  let cert = undefined;
  if (passed) {
    if (!userProgress.completedModules.includes(moduleId)) {
      userProgress.completedModules.push(moduleId);
    }

    const existingCert = userProgress.certificates.find(c => c.moduleId === moduleId);
    if (!existingCert) {
      cert = {
        moduleId,
        issuedAt: new Date().toISOString(),
        score: Math.round(pct * 100)
      };
      userProgress.certificates.push(cert);
    } else {
      cert = existingCert;
    }
  }

  db.progress[userId] = userProgress;
  saveDatabase();

  res.json({
    passed,
    scorePercentage: Math.round(pct * 100),
    certificate: cert,
    userProgress
  });
});

// 6.6 INTERACTIVE SANDBOX STATE SNAPSHOTS
app.post('/api/sandbox/save', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { sandboxType, stateData, notes } = req.body;

  if (!sandboxType || !stateData) {
    return res.status(400).json({ error: 'Missing required fields: sandboxType and stateData object.' });
  }

  const validSandboxTypes = ['trading', 'capstone', 'underwriting', 'parametric', 'fraud'];
  if (typeof sandboxType !== 'string' || !validSandboxTypes.includes(sandboxType)) {
    return res.status(400).json({ error: `Invalid sandboxType. Must be one of: ${validSandboxTypes.join(', ')}` });
  }

  if (!db.sandboxes[userId]) {
    db.sandboxes[userId] = [];
  }

  const snapshot = {
    id: `snap-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    sandboxType,
    stateData,
    notes: notes ? String(notes).slice(0, 500) : undefined,
    savedAt: new Date().toISOString()
  };

  // Replace existing snapshot for this sandboxType or add new
  const index = db.sandboxes[userId].findIndex(s => s.sandboxType === sandboxType);
  if (index >= 0) {
    db.sandboxes[userId][index] = snapshot;
  } else {
    db.sandboxes[userId].push(snapshot);
  }

  saveDatabase();

  res.json({ success: true, snapshot });
});

app.get('/api/sandbox/load', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const sandboxType = req.query.type as string;

  const userSandboxes = db.sandboxes[userId] || [];
  if (sandboxType) {
    const match = userSandboxes.find(s => s.sandboxType === sandboxType);
    return res.json({ stateData: match ? match.stateData : null, snapshot: match || null });
  }

  res.json({ sandboxes: userSandboxes });
});

// 6.7 DONATIONS & COMMUNITY IMPACT METRICS
app.get('/api/donation-link', (req, res) => {
  res.json({ url: process.env.STRIPE_DONATION_LINK || 'https://buy.stripe.com/dRm6oJa7yevp2jF3em3oA06' });
});

app.get('/api/donations/stats', (req, res) => {
  const totalPledged = db.donations.reduce((sum, d) => sum + d.amount, 0);
  const totalContributors = new Set(db.donations.map(d => d.userId)).size;

  res.json({
    totalPledged,
    totalContributors,
    recentPledges: db.donations.slice(-10).reverse()
  });
});

app.post('/api/donation-intent', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { amount, tierLabel } = req.body;

  if (!amount || typeof amount !== 'number' || amount <= 0 || amount > 10000 || !Number.isFinite(amount)) {
    return res.status(400).json({ error: 'Valid donation amount required (0 < amount <= 10000).' });
  }

  const donation = {
    id: `don-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    userId,
    amount,
    tierLabel: tierLabel || 'Supporter',
    timestamp: new Date().toISOString()
  };

  db.donations.push(donation);
  saveDatabase();

  res.json({ success: true, donation, message: "Thank you for supporting open-access HBCU fintech education!" });
});

// 6.7.5 WAITLIST (email capture)
app.post('/api/waitlist', rateLimiter(10, 60000), (req: Request, res: Response) => {
  const { email, source } = req.body || {};
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'A valid email is required.' });
  }
  const cleanEmail = email.toLowerCase().trim();
  const already = (db.waitlist ?? []).find((w) => w.email === cleanEmail);
  if (!already) {
    const cleanSource = typeof source === 'string' && source.trim() ? source.trim().slice(0, 100) : 'website';
    db.waitlist.push({ email: cleanEmail, source: cleanSource, createdAt: new Date().toISOString() });
    saveDatabase();
  }

  // Fire-and-forget confirmation (no-op without EMAIL_API_KEY).
  void sendWaitlistConfirmEmail(cleanEmail).catch(() => {});

  res.json({ success: true, duplicate: !!already });
});

// 6.7.6 COMMUNITY DISCUSSION (threads, comments, reports)
function opError(res: Response, err: unknown) {
  const message = err instanceof Error ? err.message : 'Operation failed.';
  const status = /not found|already reported/i.test(message) ? 404 : 400;
  return res.status(status).json({ error: message });
}

app.get('/api/threads', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const moduleId = typeof req.query.moduleId === 'string' ? req.query.moduleId : undefined;
  const lessonId = typeof req.query.lessonId === 'string' ? req.query.lessonId : undefined;
  res.json({ threads: listThreads(db, { moduleId, lessonId }) });
});

app.post('/api/threads', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const { moduleId, lessonId, title, body } = req.body || {};
  try {
    const thread = createThread(db, {
      userId: req.user!.id,
      moduleId: typeof moduleId === 'string' ? moduleId.slice(0, 100) : undefined,
      lessonId: typeof lessonId === 'string' ? lessonId.slice(0, 200) : undefined,
      title,
      body,
    });
    saveDatabase();
    res.status(201).json({ success: true, thread: { ...thread, authorName: db.users[req.user!.id]?.name || 'Scholar', commentCount: 0, upvotes: 0 } });
  } catch (err) {
    opError(res, err);
  }
});

app.get('/api/threads/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const result = getThread(db, req.params.id);
  if (!result) return res.status(404).json({ error: 'Thread not found.' });
  res.json(result);
});

app.post('/api/threads/:id/comments', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const { body } = req.body || {};
  try {
    const comment = addComment(db, { threadId: req.params.id, userId: req.user!.id, body });
    saveDatabase();
    // Notify the thread author (and mention other commenters) about the reply.
    const thread = db.threads.find((t) => t.id === req.params.id);
    if (thread) {
      const commenterName = db.users[req.user!.id]?.name || 'Someone';
      const targets = new Set([thread.userId, ...db.comments.filter((c) => c.threadId === thread.id).map((c) => c.userId)]);
      for (const target of targets) {
        if (target !== req.user!.id) {
          notify(target, 'reply', `${commenterName} replied to your discussion`, `"${thread.title}"`);
        }
      }
    }
    res.status(201).json({ success: true, comment });
  } catch (err) {
    opError(res, err);
  }
});

app.post('/api/threads/:id/upvote', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = toggleThreadUpvote(db, { threadId: req.params.id, userId: req.user!.id });
    saveDatabase();
    res.json({ success: true, upvoted: result.upvoted, upvotes: result.thread.upvotedBy.length });
  } catch (err) {
    opError(res, err);
  }
});

app.post('/api/comments/:id/upvote', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = toggleCommentUpvote(db, { commentId: req.params.id, userId: req.user!.id });
    saveDatabase();
    res.json({ success: true, upvoted: result.upvoted, upvotes: result.comment.upvotedBy.length });
  } catch (err) {
    opError(res, err);
  }
});

app.post('/api/reports', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const { targetType, targetId, reason } = req.body || {};
  if (targetType !== 'thread' && targetType !== 'comment') {
    return res.status(400).json({ error: 'Invalid target type.' });
  }
  try {
    const report = reportTarget(db, { targetType, targetId, userId: req.user!.id, reason });
    saveDatabase();
    res.status(201).json({ success: true, report });
  } catch (err) {
    opError(res, err);
  }
});

app.delete('/api/threads/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = deleteThread(db, { threadId: req.params.id, callerId: req.user!.id, callerRole: req.user!.role });
    saveDatabase();
    res.json({ success: true, ...result });
  } catch (err) {
    opError(res, err);
  }
});

app.delete('/api/comments/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = deleteComment(db, { commentId: req.params.id, callerId: req.user!.id, callerRole: req.user!.role });
    saveDatabase();
    res.json({ success: true, ...result });
  } catch (err) {
    opError(res, err);
  }
});

// 6.7.7 COHORTS (group learning circles)
app.get('/api/cohorts', authenticate, (req: AuthenticatedRequest, res: Response) => {
  res.json({ cohorts: listMyCohorts(db, req.user!.id) });
});

app.post('/api/cohorts', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const { name, type, description } = req.body || {};
  try {
    const cohort = createCohort(db, { ownerId: req.user!.id, name, type, description });
    saveDatabase();
    res.status(201).json({ success: true, cohort });
  } catch (err) {
    opError(res, err);
  }
});

app.post('/api/cohorts/join', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const { code } = req.body || {};
  try {
    const cohort = joinCohortByCode(db, typeof code === 'string' ? code : '', req.user!.id);
    saveDatabase();
    res.json({ success: true, cohort });
  } catch (err) {
    opError(res, err);
  }
});

app.get('/api/cohorts/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const result = cohortLeaderboard(db, req.params.id, req.user!.id);
  if (!result.cohort) return res.status(404).json({ error: 'Cohort not found.' });
  res.json(result);
});

app.post('/api/cohorts/:id/join', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const cohort = joinCohort(db, req.params.id, req.user!.id);
    saveDatabase();
    res.json({ success: true, cohort });
  } catch (err) {
    opError(res, err);
  }
});

app.post('/api/cohorts/:id/leave', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const cohort = leaveCohort(db, req.params.id, req.user!.id);
    saveDatabase();
    res.json({ success: true, cohort });
  } catch (err) {
    opError(res, err);
  }
});

app.delete('/api/cohorts/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = deleteCohort(db, req.params.id, req.user!.id, req.user!.role);
    saveDatabase();
    res.json({ success: true, ...result });
  } catch (err) {
    opError(res, err);
  }
});

// Teacher sets the curriculum (module ids) for a cohort they own.
app.put('/api/cohorts/:id/curriculum', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const { moduleIds } = req.body || {};
  try {
    const cohort = setCohortCurriculum(db, req.params.id, Array.isArray(moduleIds) ? moduleIds : [], req.user!.id, req.user!.role);
    saveDatabase();
    res.json({ success: true, cohort });
  } catch (err) {
    opError(res, err);
  }
});

// Teacher roster: per-member completion of the assigned modules.
app.get('/api/cohorts/:id/roster', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = cohortRoster(db, req.params.id, req.user!.id, req.user!.role);
    res.json(result);
  } catch (err) {
    opError(res, err);
  }
});

// Institution dashboard: owned cohorts + rosters in one round-trip.
app.get('/api/institution/classes', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const classes = listMyCohorts(db, req.user!.id)
    .filter((c) => c.ownerId === req.user!.id)
    .map((cohort) => ({
      cohort,
      roster: cohortRoster(db, cohort.id, req.user!.id, req.user!.role).roster,
    }));
  res.json({ classes });
});

// 6.7.8 NOTIFICATIONS (in-app + optional email)
function notify(userId: string, type: 'reply' | 'cohort' | 'streak' | 'system', title: string, message: string) {
  if (!userId || !db.notifications) return;
  db.notifications.push({
    id: `not-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    userId,
    type,
    title,
    message,
    read: false,
    createdAt: new Date().toISOString(),
  });
  saveDatabase();
  const user = db.users[userId];
  if (user?.email) {
    void sendEmail({
      to: user.email,
      subject: title,
      html: `<p>${escapeHtml(message)}</p>`,
    }).catch(() => {});
  }
}

app.get('/api/notifications', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const items = (db.notifications ?? [])
    .filter((n) => n.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 50);
  res.json({ notifications: items, unreadCount: items.filter((n) => !n.read).length });
});

app.post('/api/notifications/read-all', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  let changed = 0;
  for (const n of db.notifications ?? []) {
    if (n.userId === userId && !n.read) {
      n.read = true;
      changed++;
    }
  }
  if (changed > 0) saveDatabase();
  res.json({ success: true, changed });
});

app.post('/api/notifications/:id/read', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const notification = (db.notifications ?? []).find((n) => n.id === req.params.id && n.userId === userId);
  if (!notification) return res.status(404).json({ error: 'Notification not found.' });
  notification.read = true;
  saveDatabase();
  res.json({ success: true, notification });
});

// 6.7.9 CONTENT CMS (admin-only writes; reads are public)
app.get('/api/content/:moduleId/:lessonId', (req: Request, res: Response) => {
  const eff = getEffectiveContent(db, req.params.moduleId, req.params.lessonId);
  res.json({ overridden: !!eff, content: eff?.content ?? null, version: eff?.version ?? 0 });
});

app.get('/api/content/overrides', authenticate, requireRole(['admin', 'institution']), (req: AuthenticatedRequest, res: Response) => {
  res.json({ overrides: listOverrides(db) });
});

app.get('/api/content/:moduleId/:lessonId/revisions', authenticate, requireRole(['admin', 'institution']), (req: AuthenticatedRequest, res: Response) => {
  res.json({ revisions: getRevisions(db, req.params.moduleId, req.params.lessonId) });
});

app.put('/api/content/:moduleId/:lessonId', authenticate, requireRole(['admin', 'institution']), (req: AuthenticatedRequest, res: Response) => {
  const { content } = req.body || {};
  try {
    const result = saveOverride(db, {
      moduleId: req.params.moduleId,
      lessonId: req.params.lessonId,
      content,
      updatedBy: req.user!.id,
    });
    saveDatabase();
    res.json({ success: true, ...result });
  } catch (err) {
    opError(res, err);
  }
});

app.delete('/api/content/:moduleId/:lessonId', authenticate, requireRole(['admin', 'institution']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = deleteOverride(db, req.params.moduleId, req.params.lessonId);
    saveDatabase();
    res.json({ success: true, ...result });
  } catch (err) {
    opError(res, err);
  }
});

// 6.7.10 CREATOR / EDUCATOR PROGRAM
app.post('/api/creator/apply', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const { bio, portfolioUrl } = req.body || {};
  const cleanBio = typeof bio === 'string' ? bio.trim().slice(0, 2000) : '';
  if (!cleanBio) return res.status(400).json({ error: 'Tell us a little about yourself and what you teach.' });
  const existing = (db.creatorApplications ?? []).find((a) => a.userId === req.user!.id && a.status === 'pending');
  if (existing) return res.status(409).json({ error: 'You already have a pending application.' });
  const application = {
    id: `cre-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    userId: req.user!.id,
    bio: cleanBio,
    portfolioUrl: typeof portfolioUrl === 'string' && portfolioUrl.trim() ? portfolioUrl.trim().slice(0, 500) : undefined,
    status: 'pending' as const,
    createdAt: new Date().toISOString(),
  };
  db.creatorApplications.push(application);
  saveDatabase();
  res.status(201).json({ success: true, application });
});

app.get('/api/creator/status', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const user = db.users[req.user!.id];
  const application = (db.creatorApplications ?? []).find((a) => a.userId === req.user!.id);
  res.json({
    verified: user?.creatorVerified ?? false,
    bio: user?.creatorBio ?? undefined,
    application: application ? { status: application.status, createdAt: application.createdAt } : null,
  });
});

app.get('/api/creator/applications', authenticate, requireRole(['admin', 'institution']), (req: AuthenticatedRequest, res: Response) => {
  res.json({ applications: (db.creatorApplications ?? []).sort((a, b) => b.createdAt.localeCompare(a.createdAt)) });
});

app.put('/api/creator/applications/:id', authenticate, requireRole(['admin', 'institution']), (req: AuthenticatedRequest, res: Response) => {
  const { status } = req.body || {};
  if (status !== 'approved' && status !== 'rejected') {
    return res.status(400).json({ error: 'Invalid status.' });
  }
  const application = (db.creatorApplications ?? []).find((a) => a.id === req.params.id);
  if (!application) return res.status(404).json({ error: 'Application not found.' });
  application.status = status;
  application.reviewedAt = new Date().toISOString();
  const user = db.users[application.userId];
  if (user) {
    user.creatorVerified = status === 'approved';
    user.creatorBio = application.bio;
  }
  saveDatabase();
  res.json({ success: true, application });
});

// 6.7.11 BILLING & SUBSCRIPTIONS
app.get('/api/billing/plans', (req: Request, res: Response) => {
  res.json({ plans: PLANS, stripeConfigured: isStripeConfigured() });
});

app.get('/api/billing/status', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const user = db.users[req.user!.id];
  res.json({
    tier: user?.subscriptionTier ?? 'free',
    email: user?.email ?? '',
    hasStripeCustomer: !!user?.stripeCustomerId,
    stripeConfigured: isStripeConfigured(),
  });
});

app.post('/api/billing/checkout', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  const { tier } = req.body || {};
  if (tier !== 'institutional') {
    return res.status(400).json({ error: 'Institutional is the only paid plan.' });
  }
  const user = db.users[req.user!.id];
  if (!user?.email) return res.status(400).json({ error: 'Add an email to your account before upgrading.' });
  if (!isStripeConfigured()) {
    return res.status(503).json({ error: 'Billing is not configured yet. Please try again soon.' });
  }
  try {
    const base = `${req.protocol}://${req.get('host')}`;
    const session = await createCheckoutSession({
      tier,
      email: user.email,
      successUrl: `${base}/pricing?upgraded=true`,
      cancelUrl: `${base}/pricing`,
    });
    res.json({ success: true, url: session.url });
  } catch (err) {
    res.status(502).json({ error: err instanceof Error ? err.message : 'Checkout failed.' });
  }
});

app.post('/api/billing/portal', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  const user = db.users[req.user!.id];
  if (!user?.stripeCustomerId || !isStripeConfigured()) {
    return res.status(400).json({ error: 'No active subscription to manage.' });
  }
  try {
    const base = `${req.protocol}://${req.get('host')}`;
    const session = await createPortalSession(user.stripeCustomerId, `${base}/pricing`);
    res.json({ success: true, url: session.url });
  } catch (err) {
    res.status(502).json({ error: err instanceof Error ? err.message : 'Portal failed.' });
  }
});

app.post('/api/billing/webhook', (req: Request, res: Response) => {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const raw = (req as Request & { rawBody?: Buffer }).rawBody?.toString('utf-8') ?? '';
  const signature = req.headers['stripe-signature'] as string | undefined;
  if (!secret || !signature || !verifyWebhookSignature(raw, signature, secret)) {
    return res.status(400).json({ error: 'Invalid signature.' });
  }

  let event: { type: string; data?: { object?: { id?: string; customer?: string; subscription?: string; metadata?: { tier?: string }; status?: string } } };
  try {
    event = JSON.parse(raw);
  } catch {
    return res.status(400).json({ error: 'Invalid payload.' });
  }

  // Institutional is the only paid tier; everything else is free membership.
  const tier = 'institutional';
  if (event.type === 'checkout.session.completed') {
    const object = event.data?.object;
    const email = object?.id ? '' : '';
    const customerEmail = (event.data?.object as { customer_email?: string })?.customer_email;
    if (customerEmail) {
      const user = findUserByEmail(customerEmail);
      if (user) {
        user.subscriptionTier = tier;
        user.stripeCustomerId = object?.customer;
        user.stripeSubscriptionId = object?.subscription;
        saveDatabase();
        notify(user.id, 'system', 'Welcome to Premium!', 'Your Overlay Wealth subscription is active.');
      }
    }
  } else if (event.type === 'customer.subscription.deleted') {
    const subId = event.data?.object?.id;
    const user = Object.values(db.users).find((u) => u.stripeSubscriptionId === subId);
    if (user) {
      user.subscriptionTier = 'free';
      user.stripeSubscriptionId = undefined;
      saveDatabase();
    }
  }
  res.json({ received: true });
});

// 6.8 MARKET DATA PROXY WITH CACHING & SIMULATION (Alpha Vantage)
app.get('/api/alphavantage/query', async (req, res) => {
  const func = (req.query.function as string || '').toUpperCase();
  const symbol = (req.query.symbol as string || 'SPY').toUpperCase();
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;

  const cacheKey = `av:${func}:${symbol}:${req.query.interval || ''}:${req.query.time_period || ''}`;
  const cached = getCached(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  // If real API key is configured and not 'demo', attempt live Alpha Vantage request
  if (apiKey && apiKey !== 'demo') {
    try {
      const queryString = new URLSearchParams(req.query as Record<string, string>).toString();
      const response = await fetch(`https://www.alphavantage.co/query?${queryString}`);
      if (response.ok) {
        const data = await response.json();
        if (!data['Note'] && !data['Error Message'] && !data['Information']) {
          setCache(cacheKey, data, 300000);
          return res.json(data);
        }
      }
    } catch (err) {
      console.warn('[AlphaVantage Proxy] Fetch error, using high-fidelity fallback:', err);
    }
  }

  // High-Fidelity Market Generator for seamless client rendering
  const basePrices: Record<string, number> = {
    NVDA: 128.50, TSLA: 220.40, AAPL: 225.10, MSFT: 440.80, AMZN: 186.20,
    SPY: 550.30, QQQ: 480.90, COIN: 215.60, AMD: 155.40, BND: 72.80
  };
  const base = basePrices[symbol] || 150.00;

  if (func === 'TIME_SERIES_DAILY') {
    const timeSeries: Record<string, any> = {};
    let price = base * 0.90;
    const now = new Date();
    for (let i = 60; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      if (d.getDay() === 0 || d.getDay() === 6) continue;
      const dateStr = d.toISOString().split('T')[0];
      const change = (Math.random() - 0.47) * (base * 0.025);
      const open = price;
      const close = Math.max(1, price + change);
      const high = Math.max(open, close) + Math.random() * (base * 0.01);
      const low = Math.min(open, close) - Math.random() * (base * 0.01);
      const volume = Math.floor(5000000 + Math.random() * 25000000);
      price = close;
      timeSeries[dateStr] = {
        '1. open': open.toFixed(2),
        '2. high': high.toFixed(2),
        '3. low': low.toFixed(2),
        '4. close': close.toFixed(2),
        '5. volume': volume.toString()
      };
    }
    const result = { 'Time Series (Daily)': timeSeries };
    setCache(cacheKey, result, 300000);
    return res.json(result);
  }

  if (func === 'TIME_SERIES_INTRADAY') {
    const interval = (req.query.interval as string) || '5min';
    const key = `Time Series (${interval})`;
    const timeSeries: Record<string, any> = {};
    let price = base;
    const now = new Date();
    for (let i = 78; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 5 * 60000);
      const dateStr = d.toISOString().replace('T', ' ').substring(0, 19);
      const change = (Math.random() - 0.48) * (base * 0.008);
      const open = price;
      const close = Math.max(1, price + change);
      const high = Math.max(open, close) + Math.random() * (base * 0.003);
      const low = Math.min(open, close) - Math.random() * (base * 0.003);
      const volume = Math.floor(100000 + Math.random() * 800000);
      price = close;
      timeSeries[dateStr] = {
        '1. open': open.toFixed(2),
        '2. high': high.toFixed(2),
        '3. low': low.toFixed(2),
        '4. close': close.toFixed(2),
        '5. volume': volume.toString()
      };
    }
    const result = { [key]: timeSeries };
    setCache(cacheKey, result, 120000);
    return res.json(result);
  }

  if (func === 'GLOBAL_QUOTE') {
    const change = (Math.random() - 0.45) * 4.5;
    const price = base + change;
    const result = {
      'Global Quote': {
        '01. symbol': symbol,
        '02. open': base.toFixed(2),
        '03. high': (price + 2.5).toFixed(2),
        '04. low': (price - 2.1).toFixed(2),
        '05. price': price.toFixed(2),
        '06. volume': '12480193',
        '07. latest trading day': new Date().toISOString().split('T')[0],
        '08. previous close': base.toFixed(2),
        '09. change': change.toFixed(2),
        '10. change percent': `${((change / base) * 100).toFixed(2)}%`
      }
    };
    return res.json(result);
  }

  if (func === 'SMA') {
    const period = req.query.time_period || '20';
    const result = {
      'Technical Analysis: SMA': {
        [new Date().toISOString().split('T')[0]]: {
          SMA: (base * (1 + (Math.random() - 0.5) * 0.03)).toFixed(2)
        }
      }
    };
    return res.json(result);
  }

  if (func === 'RSI') {
    const result = {
      'Technical Analysis: RSI': {
        [new Date().toISOString().split('T')[0]]: {
          RSI: (45 + Math.random() * 25).toFixed(2)
        }
      }
    };
    return res.json(result);
  }

  res.json({ Note: "Simulation active" });
});

app.get('/api/alphavantage/quote/:symbol', async (req, res) => {
  res.redirect(`/api/alphavantage/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(req.params.symbol)}`);
});

app.get('/api/alphavantage/chart/:symbol', async (req, res) => {
  res.redirect(`/api/alphavantage/query?function=TIME_SERIES_DAILY&symbol=${encodeURIComponent(req.params.symbol)}`);
});

// 6.9 COMPLIANCE & AUDIT LOG INSPECTOR (ADMIN / INSTITUTION ONLY)
app.get('/api/admin/audit-logs', authenticate, requireRole(['admin', 'institution']), (req: AuthenticatedRequest, res: Response) => {
  const limit = Math.min(Number(req.query.limit) || 100, 500);
  res.json({
    totalLogs: db.auditLogs.length,
    logs: db.auditLogs.slice(0, limit)
  });
});

// 6.9 PLATFORM METRICS (Admin/Institution only)
app.get('/api/admin/metrics', authenticate, requireRole(['admin', 'institution']), (req: AuthenticatedRequest, res: Response) => {
  res.json(computeMetrics(db));
});

// 6.10 DYNAMIC SITEMAP (SEO)
app.get('/api/sitemap.xml', (req: Request, res: Response) => {
  const baseUrl = process.env.APP_URL || 'https://overlay365.org';
  const today = new Date().toISOString().split('T')[0];

  const staticRoutes = [
    { loc: '/', priority: '1.0', changefreq: 'weekly' },
    { loc: '/glossary', priority: '0.7', changefreq: 'weekly' },
    { loc: '/knowledge', priority: '0.7', changefreq: 'weekly' },
    { loc: '/profile', priority: '0.6', changefreq: 'daily' },
    { loc: '/architecture', priority: '0.6', changefreq: 'monthly' },
    { loc: '/business-builder', priority: '0.6', changefreq: 'monthly' },
    { loc: '/map', priority: '0.6', changefreq: 'monthly' },
    { loc: '/article', priority: '0.5', changefreq: 'monthly' },
    { loc: '/donate', priority: '0.5', changefreq: 'monthly' },
    { loc: '/progress', priority: '0.6', changefreq: 'daily' },
    { loc: '/review', priority: '0.6', changefreq: 'daily' },
    { loc: '/game/trading', priority: '0.8', changefreq: 'weekly' },
    { loc: '/game/underwriting', priority: '0.8', changefreq: 'weekly' },
    { loc: '/game/parametric', priority: '0.8', changefreq: 'weekly' },
    { loc: '/game/fraud', priority: '0.8', changefreq: 'weekly' },
    { loc: '/game/popquiz', priority: '0.8', changefreq: 'weekly' },
    { loc: '/wealth-building', priority: '0.9', changefreq: 'weekly' },
    { loc: '/wealth-building/credit', priority: '0.9', changefreq: 'weekly' },
    { loc: '/wealth-building/investing', priority: '0.9', changefreq: 'weekly' },
    { loc: '/wealth-building/real-estate', priority: '0.9', changefreq: 'weekly' },
    { loc: '/wealth-building/business', priority: '0.9', changefreq: 'weekly' },
    { loc: '/wealth-building/group-economics', priority: '0.9', changefreq: 'weekly' },
    { loc: '/wealth-building/side-hustles', priority: '0.8', changefreq: 'weekly' },
    { loc: '/wealth-building/emergency-fund', priority: '0.8', changefreq: 'weekly' },
    { loc: '/cohorts', priority: '0.6', changefreq: 'weekly' },
    { loc: '/pricing', priority: '0.7', changefreq: 'monthly' },
  ];

  const moduleRoutes = Array.from({ length: 16 }, (_, i) => ({
    loc: `/module/${i}`,
    priority: '0.9',
    changefreq: 'monthly',
  }));

  const allRoutes = [...staticRoutes, ...moduleRoutes];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes.map(r => `  <url>
    <loc>${baseUrl}${r.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  res.send(xml);
});

// Serve the dynamic sitemap at /sitemap.xml too (so bots get wealth/cohort routes).
app.get('/sitemap.xml', (req: Request, res: Response) => {
  const baseUrl = process.env.APP_URL || 'https://overlay365.org';
  const today = new Date().toISOString().split('T')[0];

  const staticRoutes = [
    { loc: '/', priority: '1.0', changefreq: 'weekly' },
    { loc: '/glossary', priority: '0.7', changefreq: 'weekly' },
    { loc: '/knowledge', priority: '0.7', changefreq: 'weekly' },
    { loc: '/profile', priority: '0.6', changefreq: 'daily' },
    { loc: '/business-builder', priority: '0.6', changefreq: 'monthly' },
    { loc: '/donate', priority: '0.5', changefreq: 'monthly' },
    { loc: '/wealth-building', priority: '0.9', changefreq: 'weekly' },
    { loc: '/wealth-building/credit', priority: '0.9', changefreq: 'weekly' },
    { loc: '/wealth-building/investing', priority: '0.9', changefreq: 'weekly' },
    { loc: '/wealth-building/real-estate', priority: '0.9', changefreq: 'weekly' },
    { loc: '/wealth-building/business', priority: '0.9', changefreq: 'weekly' },
    { loc: '/wealth-building/group-economics', priority: '0.9', changefreq: 'weekly' },
    { loc: '/pricing', priority: '0.7', changefreq: 'monthly' },
  ];

  const moduleRoutes = Array.from({ length: 16 }, (_, i) => ({
    loc: `/module/${i}`,
    priority: '0.9',
    changefreq: 'monthly',
  }));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticRoutes, ...moduleRoutes].map(r => `  <url>
    <loc>${baseUrl}${r.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  res.send(xml);
});

// ---------------------------------------------------------------------------
// 7. RFC 7807 CENTRALIZED ERROR HANDLER
// ---------------------------------------------------------------------------
// Send errors to Sentry (no-op when SENTRY_DSN is unset) before responding.
if (process.env.SENTRY_DSN) {
  Sentry.setupExpressErrorHandler(app);
}

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Unhandled Express Error]:', err);
  res.status(err.status || 500).json({
    type: 'https://httpstatuses.com/500',
    title: 'Internal Server Error',
    status: err.status || 500,
    detail: process.env.NODE_ENV === 'production' ? 'An unexpected server error occurred.' : err.message,
    instance: req.path
  });
});

// ---------------------------------------------------------------------------
// 8. VITE DEVELOPMENT MIDDLEWARE OR PRODUCTION SERVING
// ---------------------------------------------------------------------------
async function startServer() {
  if (effectiveEnv === 'production') {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Overlay Wealth Engine] Server listening on http://0.0.0.0:${PORT} (${effectiveEnv} mode)`);
  });
}

// Serverless export (Vercel). Vercel sets VERCEL=1 and calls the exported app
// as a serverless handler; long-running hosts (Render/Docker/local) run
// startServer() instead, which serves the built client and listens.
export default app;

if (process.env.VERCEL !== '1') {
  startServer();
}
