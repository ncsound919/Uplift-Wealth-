/**
 * Centralized API Client with automated server synchronization
 * and silent offline localStorage fallback.
 */

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  role: 'student' | 'builder' | 'institution' | 'admin';
  track: 'beginner' | 'intermediate' | 'advanced' | 'all';
  avatar?: string;
  badges: string[];
  streakDays: number;
  lastActive: string;
  profilePublic?: boolean;
}

export interface ProgressState {
  userId: string;
  completedLessons: string[]; // e.g. ["module-1-lesson-1"]
  completedModules: string[];
  quizScores: Record<string, number>; // e.g. { "module-1": 100 }
  certificates: { moduleId: string; issuedAt: string; score: number }[];
  xp?: number;
  streakDays?: number;
  badges?: string[];
  gameTimeSeconds?: number;
}

export interface ProgressStats {
  xp?: number;
  streakDays?: number;
  badges?: string[];
  gameTimeSeconds?: number;
}

export interface SandboxSavePayload {
  userId?: string;
  sandboxType: 'trading' | 'capstone' | 'underwriting' | 'parametric' | 'fraud';
  stateData: Record<string, any>;
  notes?: string;
}

export interface DonationIntentPayload {
  amount: number;
  tierLabel?: string;
  currency?: string;
}

const DEFAULT_USER_ID = 'demo-student-01';

class ApiClient {
  private userId: string = DEFAULT_USER_ID;
  private token: string = '';

  constructor() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('hacu_user_id');
      if (stored) this.userId = stored;
      const storedToken = localStorage.getItem('hacu_auth_token');
      if (storedToken) this.token = storedToken;
    }
  }

  /** True when a real account token is present (vs anonymous demo/guest). */
  public get isAuthenticated(): boolean {
    return !!this.token;
  }

  public setUserId(id: string) {
    this.userId = id;
    if (typeof window !== 'undefined') {
      localStorage.setItem('hacu_user_id', id);
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}, retry = true): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-User-Id': this.userId,
      'X-User-Role': 'student',
      ...(options.headers as Record<string, string> || {}),
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      let res = await fetch(endpoint, { ...options, headers });

      // Access token expired — try a silent refresh via the HttpOnly cookie,
      // then replay the request once.
      if (res.status === 401 && retry && this.token) {
        const refreshed = await this.tryRefresh();
        if (refreshed) {
          headers['Authorization'] = `Bearer ${this.token}`;
          res = await fetch(endpoint, { ...options, headers });
        }
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(errorData.message || `API Error: ${res.status}`);
      }
      return await res.json();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn(`[API Client Fallback] ${endpoint}:`, message);
      throw err;
    }
  }

  private async tryRefresh(): Promise<boolean> {
    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) return false;
      const data = await res.json();
      if (data && data.token) {
        this.token = data.token;
        if (typeof window !== 'undefined') {
          localStorage.setItem('hacu_auth_token', data.token);
          if (data.user) localStorage.setItem('hacu_user_data', JSON.stringify(data.user));
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  // Health
  public async getHealth() {
    return this.request<{ status: string; uptime: number; dbReady: boolean }>('/api/health');
  }

  // User Profile
  public async getProfile(): Promise<UserProfile> {
    try {
      return await this.request<UserProfile>(`/api/user/profile?userId=${this.userId}`);
    } catch {
      // Local fallback
      return {
        id: this.userId,
        name: 'HBCU Fintech Scholar',
        role: 'student',
        track: 'all',
        badges: ['pioneer_scholar'],
        streakDays: 3,
        lastActive: new Date().toISOString()
      };
    }
  }

  public async updateProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    try {
      return await this.request<UserProfile>('/api/user/profile', {
        method: 'PUT',
        body: JSON.stringify({ userId: this.userId, ...profile })
      });
    } catch {
      return {
        id: this.userId,
        name: profile.name || 'HBCU Scholar',
        role: profile.role || 'student',
        track: profile.track || 'all',
        badges: profile.badges || ['pioneer_scholar'],
        streakDays: profile.streakDays || 1,
        lastActive: new Date().toISOString(),
        profilePublic: profile.profilePublic ?? false
      };
    }
  }

  /** Public profile for another user. Throws (404) when the profile is private. */
  public async getPublicProfile(userId: string): Promise<PublicProfile> {
    return this.request<PublicProfile>(`/api/profile/${encodeURIComponent(userId)}`);
  }

  // Progress
  public async getProgress(): Promise<ProgressState> {
    try {
      return await this.request<ProgressState>(`/api/progress?userId=${this.userId}`);
    } catch {
      const local = localStorage.getItem('hacu_progress');
      if (local) {
        try { return JSON.parse(local); } catch {}
      }
      return {
        userId: this.userId,
        completedLessons: [],
        completedModules: [],
        quizScores: {},
        certificates: []
      };
    }
  }

  // ---- Offline stats queue --------------------------------------------------
  // Stats writes (XP/streak/badges/game time) are the noisiest. When the server
  // is unreachable they queue locally (latest-wins snapshot) and flush on
  // reconnect via flushPendingStats(). localStorage remains the offline cache.

  private readStatsQueue(): ProgressStats[] {
    try {
      const raw = localStorage.getItem('overlay_pending_stats');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private writeStatsQueue(queue: ProgressStats[]) {
    localStorage.setItem('overlay_pending_stats', JSON.stringify(queue.slice(-50)));
  }

  private queueStats(stats: ProgressStats) {
    const queue = this.readStatsQueue();
    queue.push(stats);
    this.writeStatsQueue(queue);
  }

  /** Pushes the latest queued stats snapshot to the server (idempotent upsert). */
  public async flushPendingStats(): Promise<void> {
    const queue = this.readStatsQueue();
    if (!queue.length) return;
    const latest = queue[queue.length - 1];
    const res = await this.saveStats(latest);
    if (res && !('queued' in res)) {
      this.writeStatsQueue([]);
    }
  }

  public async saveStats(stats: ProgressStats): Promise<ProgressStats | { queued: boolean }> {
    try {
      return await this.request<ProgressStats>('/api/progress/stats', {
        method: 'PUT',
        body: JSON.stringify(stats)
      });
    } catch (err) {
      console.warn('[API Client] Stats offline — queued for retry:', err);
      this.queueStats(stats);
      return { queued: true };
    }
  }

  public async saveLessonProgress(lessonId: string, moduleId: string, stats?: ProgressStats): Promise<ProgressState> {
    try {
      const res = await this.request<ProgressState>('/api/progress/lesson', {
        method: 'POST',
        body: JSON.stringify({ userId: this.userId, lessonId, moduleId, stats })
      });
      localStorage.setItem('hacu_progress', JSON.stringify(res));
      return res;
    } catch {
      const current = await this.getProgress();
      if (!current.completedLessons.includes(lessonId)) {
        current.completedLessons.push(lessonId);
      }
      localStorage.setItem('hacu_progress', JSON.stringify(current));
      return current;
    }
  }

  public async submitQuizScore(moduleId: string, score: number, totalQuestions: number): Promise<{ passed: boolean; certificate?: { moduleId: string; issuedAt: string; score: number } }> {
    try {
      return await this.request<{ passed: boolean; certificate?: { moduleId: string; issuedAt: string; score: number } }>('/api/quiz/submit', {
        method: 'POST',
        body: JSON.stringify({ userId: this.userId, moduleId, score, totalQuestions })
      });
    } catch {
      const passed = (score / totalQuestions) >= 0.7;
      return {
        passed,
        certificate: passed ? { moduleId, issuedAt: new Date().toISOString(), score } : undefined
      };
    }
  }

  // Sandboxes
  public async saveSandboxState(payload: SandboxSavePayload) {
    try {
      return await this.request('/api/sandbox/save', {
        method: 'POST',
        body: JSON.stringify({ ...payload, userId: this.userId })
      });
    } catch {
      localStorage.setItem(`hacu_sandbox_${payload.sandboxType}`, JSON.stringify(payload.stateData));
      return { success: true, savedOffline: true };
    }
  }

  public async loadSandboxState(sandboxType: string) {
    try {
      return await this.request<{ stateData: Record<string, any> }>(`/api/sandbox/load?userId=${this.userId}&type=${sandboxType}`);
    } catch {
      const local = localStorage.getItem(`hacu_sandbox_${sandboxType}`);
      try {
        return { stateData: local ? JSON.parse(local) : null };
      } catch {
        return { stateData: null };
      }
    }
  }

  // Donations
  public async logDonationIntent(payload: DonationIntentPayload) {
    try {
      return await this.request('/api/donation-intent', {
        method: 'POST',
        body: JSON.stringify({ ...payload, userId: this.userId })
      });
    } catch {
      return { logged: true, offline: true };
    }
  }

  // Auth Methods
  public async register(email: string, password: string, name?: string) {
    const res = await this.request<{ success: boolean; token: string; user: UserProfile }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name })
    });
    if (res.token && res.user) {
      this.token = res.token;
      this.setUserId(res.user.id);
      if (typeof window !== 'undefined') {
        localStorage.setItem('hacu_auth_token', res.token);
        localStorage.setItem('hacu_user_data', JSON.stringify(res.user));
      }
    }
    return res;
  }

  public async loginWithEmail(email: string, password?: string) {
    const res = await this.request<{ success: boolean; token: string; user: UserProfile }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (res.token && res.user) {
      this.token = res.token;
      this.setUserId(res.user.id);
      if (typeof window !== 'undefined') {
        localStorage.setItem('hacu_auth_token', res.token);
        localStorage.setItem('hacu_user_data', JSON.stringify(res.user));
      }
    }
    return res;
  }

  public async loginWithGoogle(email: string) {
    const res = await this.request<{ success: boolean; token: string; user: UserProfile }>('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
    if (res.token && res.user) {
      this.token = res.token;
      this.setUserId(res.user.id);
      if (typeof window !== 'undefined') {
        localStorage.setItem('hacu_auth_token', res.token);
        localStorage.setItem('hacu_user_data', JSON.stringify(res.user));
      }
    }
    return res;
  }

  public async logout() {
    try {
      await this.request('/api/auth/logout', { method: 'POST' });
    } catch {}
    this.token = '';
    if (typeof window !== 'undefined') {
      localStorage.removeItem('hacu_auth_token');
      localStorage.removeItem('hacu_user_data');
    }
  }

  public getStoredUser(): UserProfile | null {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('hacu_user_data');
      if (raw) {
        try {
          return JSON.parse(raw) as UserProfile;
        } catch {}
      }
    }
    return null;
  }

  // Market Data Proxy (Alpha Vantage)
  public async getStockQuote(symbol: string) {
    try {
      return await this.request<{ price?: number; change?: number; changePercent?: string; raw?: any }>(`/api/alphavantage/quote/${encodeURIComponent(symbol)}`);
    } catch {
      return { price: undefined, change: undefined, changePercent: undefined };
    }
  }

  // Community Discussions
  public listThreads(filter: { moduleId?: string; lessonId?: string }) {
    const params = new URLSearchParams();
    if (filter.moduleId) params.set('moduleId', filter.moduleId);
    if (filter.lessonId) params.set('lessonId', filter.lessonId);
    const qs = params.toString();
    return this.request<{ threads: ThreadView[] }>(`/api/threads${qs ? `?${qs}` : ''}`);
  }

  public getThread(id: string) {
    return this.request<{ thread: ThreadView; comments: CommentView[] }>(`/api/threads/${encodeURIComponent(id)}`);
  }

  public createThread(payload: { moduleId?: string; lessonId?: string; title: string; body: string }) {
    return this.request<{ success: boolean; thread: ThreadView }>('/api/threads', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public addComment(threadId: string, body: string) {
    return this.request<{ success: boolean; comment: CommentView }>(`/api/threads/${encodeURIComponent(threadId)}/comments`, {
      method: 'POST',
      body: JSON.stringify({ body }),
    });
  }

  public upvoteThread(threadId: string) {
    return this.request<{ success: boolean; upvoted: boolean; upvotes: number }>(`/api/threads/${encodeURIComponent(threadId)}/upvote`, { method: 'POST' });
  }

  public upvoteComment(commentId: string) {
    return this.request<{ success: boolean; upvoted: boolean; upvotes: number }>(`/api/comments/${encodeURIComponent(commentId)}/upvote`, { method: 'POST' });
  }

  public report(targetType: 'thread' | 'comment', targetId: string, reason?: string) {
    return this.request<{ success: boolean; report: unknown }>('/api/reports', {
      method: 'POST',
      body: JSON.stringify({ targetType, targetId, reason }),
    });
  }

  public deleteThread(threadId: string) {
    return this.request<{ success: boolean; deleted: boolean }>(`/api/threads/${encodeURIComponent(threadId)}`, { method: 'DELETE' });
  }

  public deleteComment(commentId: string) {
    return this.request<{ success: boolean; deleted: boolean }>(`/api/comments/${encodeURIComponent(commentId)}`, { method: 'DELETE' });
  }

  // Cohorts
  public listMyCohorts() {
    return this.request<{ cohorts: CohortView[] }>('/api/cohorts');
  }

  public createCohort(payload: { name: string; type?: string; description?: string }) {
    return this.request<{ success: boolean; cohort: CohortView }>('/api/cohorts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public getCohort(id: string) {
    return this.request<{ cohort: CohortView; members: CohortMember[] }>(`/api/cohorts/${encodeURIComponent(id)}`);
  }

  public joinCohortByCode(code: string) {
    return this.request<{ success: boolean; cohort: CohortView }>('/api/cohorts/join', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  public leaveCohort(id: string) {
    return this.request<{ success: boolean; cohort: CohortView }>(`/api/cohorts/${encodeURIComponent(id)}/leave`, { method: 'POST' });
  }

  public deleteCohort(id: string) {
    return this.request<{ success: boolean; deleted: boolean }>(`/api/cohorts/${encodeURIComponent(id)}`, { method: 'DELETE' });
  }

  // Notifications
  public getNotifications() {
    return this.request<{ notifications: NotificationView[]; unreadCount: number }>('/api/notifications');
  }

  public markAllNotificationsRead() {
    return this.request<{ success: boolean; changed: number }>('/api/notifications/read-all', { method: 'POST' });
  }

  public markNotificationRead(id: string) {
    return this.request<{ success: boolean; notification: NotificationView }>(`/api/notifications/${encodeURIComponent(id)}/read`, { method: 'POST' });
  }

  // Content CMS
  public getEffectiveContent(moduleId: string, lessonId: string) {
    return this.request<{ overridden: boolean; content: string | null; version: number }>(`/api/content/${encodeURIComponent(moduleId)}/${encodeURIComponent(lessonId)}`);
  }

  public listOverrides() {
    return this.request<{ overrides: LessonOverrideView[] }>('/api/content/overrides');
  }

  public getContentRevisions(moduleId: string, lessonId: string) {
    return this.request<{ revisions: ContentRevisionView[] }>(`/api/content/${encodeURIComponent(moduleId)}/${encodeURIComponent(lessonId)}/revisions`);
  }

  public saveLessonOverride(moduleId: string, lessonId: string, content: string) {
    return this.request<{ success: boolean; override: LessonOverrideView }>(`/api/content/${encodeURIComponent(moduleId)}/${encodeURIComponent(lessonId)}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
  }

  public deleteLessonOverride(moduleId: string, lessonId: string) {
    return this.request<{ success: boolean; deleted: boolean }>(`/api/content/${encodeURIComponent(moduleId)}/${encodeURIComponent(lessonId)}`, { method: 'DELETE' });
  }

  // Creator program
  public applyAsCreator(bio: string, portfolioUrl?: string) {
    return this.request<{ success: boolean; application: unknown }>('/api/creator/apply', {
      method: 'POST',
      body: JSON.stringify({ bio, portfolioUrl }),
    });
  }

  public getCreatorStatus() {
    return this.request<{ verified: boolean; bio?: string; application: { status: string; createdAt: string } | null }>('/api/creator/status');
  }

  public listCreatorApplications() {
    return this.request<{ applications: Array<{ id: string; userId: string; bio: string; portfolioUrl?: string; status: string; createdAt: string }> }>('/api/creator/applications');
  }

  public reviewCreatorApplication(id: string, status: 'approved' | 'rejected') {
    return this.request<{ success: boolean; application: unknown }>(`/api/creator/applications/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }
}

export interface ThreadView {
  id: string;
  moduleId?: string;
  lessonId?: string;
  userId: string;
  title: string;
  body: string;
  createdAt: string;
  authorName: string;
  commentCount: number;
  upvotes: number;
}

export interface CommentView {
  id: string;
  threadId: string;
  userId: string;
  body: string;
  createdAt: string;
  authorName: string;
  upvotes: number;
}

export interface PublicProfile {
  id: string;
  name: string;
  badges: string[];
  streakDays: number;
  track: string;
  creatorVerified?: boolean;
  creatorBio?: string;
  xp: number;
  completedModules: string[];
  completedLessonsCount: number;
}

export interface CohortView {
  id: string;
  name: string;
  type: string;
  description?: string;
  ownerId: string;
  createdAt: string;
  memberIds: string[];
  inviteCode: string;
  ownerName: string;
  memberCount: number;
}

export interface CohortMember {
  id: string;
  name: string;
  xp: number;
  completedModules: number;
  completedLessons: number;
}

export interface NotificationView {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface LessonOverrideView {
  moduleId: string;
  lessonId: string;
  content: string;
  version: number;
  updatedBy: string;
  updatedAt: string;
}

export interface ContentRevisionView {
  id: string;
  moduleId: string;
  lessonId: string;
  content: string;
  version: number;
  updatedBy: string;
  updatedAt: string;
}

export const apiClient = new ApiClient();
