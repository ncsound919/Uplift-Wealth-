/**
 * Drizzle ORM schema for the Overlay Wealth PostgreSQL store.
 *
 * Mirrors the in-memory `DatabaseSchema` (src/db/types.ts) 1:1 so the
 * dual-write migration can round-trip data without loss.
 */
import { pgTable, text, integer, jsonb, numeric, boolean } from 'drizzle-orm/pg-core';

export interface CertificateRow {
  moduleId: string;
  issuedAt: string;
  score: number;
}

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  role: text('role').notNull().default('student'),
  track: text('track').notNull().default('all'),
  avatar: text('avatar'),
  badges: jsonb('badges').$type<string[]>().notNull().default([]),
  streakDays: integer('streak_days').notNull().default(0),
  lastActive: text('last_active').notNull(),
  email: text('email'),
  passwordHash: text('password_hash'),
  tokenVersion: integer('token_version').notNull().default(0),
  profilePublic: boolean('profile_public').notNull().default(false),
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
});

export const progress = pgTable('progress', {
  userId: text('user_id').primaryKey(),
  completedLessons: jsonb('completed_lessons').$type<string[]>().notNull().default([]),
  completedModules: jsonb('completed_modules').$type<string[]>().notNull().default([]),
  quizScores: jsonb('quiz_scores').$type<Record<string, number>>().notNull().default({}),
  certificates: jsonb('certificates').$type<CertificateRow[]>().notNull().default([]),
  xp: integer('xp').notNull().default(0),
  gameTimeSeconds: integer('game_time_seconds').notNull().default(0),
  updatedAt: text('updated_at').notNull().default(new Date().toISOString()),
});

export const sandboxes = pgTable('sandboxes', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  sandboxType: text('sandbox_type').notNull(),
  stateData: jsonb('state_data').$type<Record<string, unknown>>().notNull(),
  savedAt: text('saved_at').notNull(),
  notes: text('notes'),
});

export const donations = pgTable('donations', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  amount: numeric('amount').notNull(),
  tierLabel: text('tier_label'),
  timestamp: text('timestamp').notNull(),
});

export const auditLogs = pgTable('audit_logs', {
  id: text('id').primaryKey(),
  timestamp: text('timestamp').notNull(),
  ip: text('ip').notNull(),
  method: text('method').notNull(),
  path: text('path').notNull(),
  userId: text('user_id'),
  action: text('action').notNull(),
});

export const waitlistEmails = pgTable('waitlist_emails', {
  email: text('email').primaryKey(),
  source: text('source'),
  createdAt: text('created_at').notNull(),
});

export const threads = pgTable('threads', {
  id: text('id').primaryKey(),
  moduleId: text('module_id'),
  lessonId: text('lesson_id'),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  createdAt: text('created_at').notNull(),
  upvotedBy: jsonb('upvoted_by').$type<string[]>().notNull().default([]),
});

export const comments = pgTable('comments', {
  id: text('id').primaryKey(),
  threadId: text('thread_id').notNull(),
  userId: text('user_id').notNull(),
  body: text('body').notNull(),
  createdAt: text('created_at').notNull(),
  upvotedBy: jsonb('upvoted_by').$type<string[]>().notNull().default([]),
});

export const reports = pgTable('reports', {
  id: text('id').primaryKey(),
  targetType: text('target_type').notNull(),
  targetId: text('target_id').notNull(),
  userId: text('user_id').notNull(),
  reason: text('reason'),
  createdAt: text('created_at').notNull(),
});
