/**
 * Shared types for the Overlay Wealth data layer. Mirrored in
 * src/db/schema.ts so the in-memory store and PostgreSQL stay 1:1.
 */

export type UserRole = 'student' | 'builder' | 'institution' | 'admin';

export interface StoredUser {
  id: string;
  name: string;
  role: UserRole;
  track: string;
  avatar?: string;
  badges: string[];
  streakDays: number;
  lastActive: string;
  email?: string;
  passwordHash?: string;
  /** Bumped on logout to revoke all outstanding refresh tokens. */
  tokenVersion?: number;
  /** Opt-in: makes the profile viewable at /profile/:userId. Default private. */
  profilePublic?: boolean;
  /** Verified educator (set by an admin after approving a creator application). */
  creatorVerified?: boolean;
  creatorBio?: string;
}

export interface StoredProgress {
  userId: string;
  completedLessons: string[];
  completedModules: string[];
  quizScores: Record<string, number>;
  certificates: Array<{ moduleId: string; issuedAt: string; score: number }>;
  xp?: number;
  gameTimeSeconds?: number;
}

export interface Sandbox {
  id: string;
  sandboxType: string;
  stateData: Record<string, unknown>;
  savedAt: string;
  notes?: string;
}

export interface Donation {
  id: string;
  userId: string;
  amount: number;
  tierLabel?: string;
  timestamp: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  ip: string;
  method: string;
  path: string;
  userId?: string;
  action: string;
}

export interface WaitlistEntry {
  email: string;
  source?: string;
  createdAt: string;
}

export interface Thread {
  id: string;
  moduleId?: string;
  lessonId?: string;
  userId: string;
  title: string;
  body: string;
  createdAt: string;
  upvotedBy: string[];
}

export interface Comment {
  id: string;
  threadId: string;
  userId: string;
  body: string;
  createdAt: string;
  upvotedBy: string[];
}

export interface Report {
  id: string;
  targetType: 'thread' | 'comment';
  targetId: string;
  userId: string;
  reason?: string;
  createdAt: string;
}

export type CohortType = 'general' | 'church' | 'hbcu' | 'family' | 'club';

export interface Cohort {
  id: string;
  name: string;
  type: CohortType;
  description?: string;
  ownerId: string;
  createdAt: string;
  memberIds: string[];
  inviteCode: string;
}

export type NotificationType = 'reply' | 'cohort' | 'streak' | 'system';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface LessonOverride {
  moduleId: string;
  lessonId: string;
  content: string;
  version: number;
  updatedBy: string;
  updatedAt: string;
}

export interface ContentRevision {
  id: string;
  moduleId: string;
  lessonId: string;
  content: string;
  version: number;
  updatedBy: string;
  updatedAt: string;
}

export type CreatorStatus = 'pending' | 'approved' | 'rejected';

export interface CreatorApplication {
  id: string;
  userId: string;
  bio: string;
  portfolioUrl?: string;
  status: CreatorStatus;
  createdAt: string;
  reviewedAt?: string;
}

export interface DatabaseSchema {
  users: Record<string, StoredUser>;
  progress: Record<string, StoredProgress>;
  sandboxes: Record<string, Sandbox[]>;
  donations: Donation[];
  auditLogs: AuditLog[];
  waitlist: WaitlistEntry[];
  threads: Thread[];
  comments: Comment[];
  reports: Report[];
  cohorts: Cohort[];
  notifications: Notification[];
  lessonOverrides: LessonOverride[];
  contentRevisions: ContentRevision[];
  creatorApplications: CreatorApplication[];
}
