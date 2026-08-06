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

export interface DatabaseSchema {
  users: Record<string, StoredUser>;
  progress: Record<string, StoredProgress>;
  sandboxes: Record<string, Sandbox[]>;
  donations: Donation[];
  auditLogs: AuditLog[];
  waitlist: WaitlistEntry[];
}
