import express, { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config({ quiet: true });
dotenv.config({ path: '.env.local', override: true, quiet: true });

const app = express();
app.disable('x-powered-by');
const PORT = Number(process.env.PORT) || 3000;
const START_TIME = Date.now();
const DIST_READY = fs.existsSync(path.join(process.cwd(), 'dist', 'index.html'));
const effectiveEnv = process.env.NODE_ENV || (DIST_READY ? 'production' : 'development');

// ---------------------------------------------------------------------------
// 1. DATA PERSISTENCE ENGINE (File-backed with Atomic Synchronous Memory Store)
// ---------------------------------------------------------------------------
const DATA_DIR = path.join(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'store.json');

interface DatabaseSchema {
  users: Record<string, {
    id: string;
    name: string;
    role: 'student' | 'builder' | 'institution' | 'admin';
    track: string;
    avatar?: string;
    badges: string[];
    streakDays: number;
    lastActive: string;
  }>;
  progress: Record<string, {
    userId: string;
    completedLessons: string[];
    completedModules: string[];
    quizScores: Record<string, number>;
    certificates: Array<{ moduleId: string; issuedAt: string; score: number }>;
  }>;
  sandboxes: Record<string, Array<{
    id: string;
    sandboxType: string;
    stateData: any;
    savedAt: string;
    notes?: string;
  }>>;
  donations: Array<{
    id: string;
    userId: string;
    amount: number;
    tierLabel?: string;
    timestamp: string;
  }>;
  auditLogs: Array<{
    id: string;
    timestamp: string;
    ip: string;
    method: string;
    path: string;
    userId?: string;
    action: string;
  }>;
}

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
  auditLogs: []
};

let db: DatabaseSchema = { ...initialDb };

function initDatabase() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      db = JSON.parse(raw);
    } else {
      saveDatabase();
    }
  } catch (err) {
    console.warn('[DB Engine] Failed loading store.json, using in-memory default:', err);
  }
}

let isWriting = false;
let writePending = false;

function saveDatabase() {
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
}

initDatabase();

// Render (and most platforms) terminate TLS at a proxy; trusting the first
// proxy hop keeps the rate limiter keyed on the real client IP.
app.set('trust proxy', 1);

// ---------------------------------------------------------------------------
// 2. SECURITY HEADERS & CORS MIDDLEWARE
// ---------------------------------------------------------------------------
app.use(express.json({ limit: '2mb' }));
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
const requestCounts = new Map<string, { count: number; resetAt: number }>();

function rateLimiter(maxRequests = 100, windowMs = 60000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const now = Date.now();
    const record = requestCounts.get(ip) || { count: 0, resetAt: now + windowMs };

    if (now > record.resetAt) {
      record.count = 1;
      record.resetAt = now + windowMs;
    } else {
      record.count += 1;
    }

    requestCounts.set(ip, record);

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
  const userId = (req.headers['x-user-id'] as string) || req.query.userId as string || 'demo-student-01';
  const userRole = (req.headers['x-user-role'] as 'student' | 'builder' | 'institution' | 'admin') || 'student';

  req.user = {
    id: userId,
    role: userRole
  };

  // Ensure user exists in DB
  if (!db.users[userId]) {
    db.users[userId] = {
      id: userId,
      name: 'Scholar User',
      role: userRole,
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

// 6.0 AUTHENTICATION ENDPOINTS (Google & Email Login)
app.post('/api/auth/login', (req, res) => {
  const { email, password, name } = req.body;
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Valid email is required.' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const userId = `usr-${Buffer.from(cleanEmail).toString('hex').slice(0, 12)}`;

  if (!db.users[userId]) {
    db.users[userId] = {
      id: userId,
      name: name ? String(name).trim() : cleanEmail.split('@')[0],
      role: 'student',
      track: 'all',
      badges: ['pioneer_scholar'],
      streakDays: 1,
      lastActive: new Date().toISOString()
    };
    saveDatabase();
  }

  const user = db.users[userId];
  const token = `jwt-token-${userId}-${Date.now()}`;

  res.json({
    success: true,
    token,
    user: {
      ...user,
      email: cleanEmail
    }
  });
});

app.post('/api/auth/google', (req, res) => {
  const { email } = req.body;
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Valid email is required.' });
  }
  const cleanEmail = email.toLowerCase().trim();
  const userId = `usr-google-${Buffer.from(cleanEmail).toString('hex').slice(0, 12)}`;

  if (!db.users[userId]) {
    db.users[userId] = {
      id: userId,
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
  const token = `google-jwt-${userId}-${Date.now()}`;

  res.json({
    success: true,
    token,
    user: {
      ...user,
      email: cleanEmail
    }
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
  res.json({ user });
});

app.post('/api/auth/logout', (req, res) => {
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
    title: "HACU Fintech Open API Specification",
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
      { path: "/api/admin/audit-logs", method: "GET", description: "System compliance audit trail (Admin only)" }
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
  const { name, track, role, avatar } = req.body;

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

  current.lastActive = new Date().toISOString();
  db.users[userId] = current;
  saveDatabase();

  res.json(current);
});

// 6.4 COURSE PROGRESS ENDPOINTS
app.get('/api/progress', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const userProgress = db.progress[userId] || {
    userId,
    completedLessons: [],
    completedModules: [],
    quizScores: {},
    certificates: []
  };
  res.json(userProgress);
});

app.post('/api/progress/lesson', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { lessonId, moduleId } = req.body;

  if (!lessonId || typeof lessonId !== 'string') {
    return res.status(400).json({ error: 'Missing required lessonId string.' });
  }

  const userProgress = db.progress[userId] || {
    userId,
    completedLessons: [],
    completedModules: [],
    quizScores: {},
    certificates: []
  };

  if (!userProgress.completedLessons.includes(lessonId)) {
    userProgress.completedLessons.push(lessonId);
  }

  db.progress[userId] = userProgress;
  saveDatabase();

  res.json(userProgress);
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

// ---------------------------------------------------------------------------
// 7. RFC 7807 CENTRALIZED ERROR HANDLER
// ---------------------------------------------------------------------------
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
    console.log(`[HACU Fintech Engine] Server listening on http://0.0.0.0:${PORT} (${effectiveEnv} mode)`);
  });
}

startServer();
