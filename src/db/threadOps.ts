/**
 * Community discussion operations — pure functions over the in-memory store.
 * The Express handlers (server.ts) wire these to auth + HTTP. Unit-tested here
 * so the discussion rules are verified without a running server.
 */
import type { DatabaseSchema, Thread, Comment, Report } from './types';

export interface ThreadWithMeta extends Thread {
  authorName: string;
  commentCount: number;
  upvotes: number;
}

export interface CommentWithMeta extends Comment {
  authorName: string;
  upvotes: number;
}

function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function authorName(db: DatabaseSchema, userId: string): string {
  return db.users[userId]?.name || 'Scholar';
}

function upvotes(t: Thread | Comment): number {
  return (t.upvotedBy ?? []).length;
}

export function listThreads(
  db: DatabaseSchema,
  filter: { moduleId?: string; lessonId?: string } = {}
): ThreadWithMeta[] {
  return db.threads
    .filter((t) => {
      if (filter.lessonId && t.lessonId !== filter.lessonId) return false;
      if (!filter.lessonId && filter.moduleId && t.moduleId !== filter.moduleId) return false;
      return true;
    })
    .map((t) => ({
      ...t,
      authorName: authorName(db, t.userId),
      commentCount: db.comments.filter((c) => c.threadId === t.id).length,
      upvotes: upvotes(t),
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getThread(db: DatabaseSchema, threadId: string): {
  thread: ThreadWithMeta;
  comments: CommentWithMeta[];
} | null {
  const thread = db.threads.find((t) => t.id === threadId);
  if (!thread) return null;
  const comments = db.comments
    .filter((c) => c.threadId === threadId)
    .map((c) => ({ ...c, authorName: authorName(db, c.userId), upvotes: upvotes(c) }))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  return {
    thread: {
      ...thread,
      authorName: authorName(db, thread.userId),
      commentCount: comments.length,
      upvotes: upvotes(thread),
    },
    comments,
  };
}

export function createThread(
  db: DatabaseSchema,
  input: { userId: string; moduleId?: string; lessonId?: string; title: string; body: string }
): Thread {
  const title = (input.title || '').trim().slice(0, 120);
  const body = (input.body || '').trim().slice(0, 4000);
  if (!title) throw new Error('A title is required.');
  if (!body) throw new Error('Add some detail to start the discussion.');
  if (input.moduleId && input.moduleId.length > 100) throw new Error('Invalid module reference.');
  if (input.lessonId && input.lessonId.length > 200) throw new Error('Invalid lesson reference.');

  const thread: Thread = {
    id: newId('thr'),
    moduleId: input.moduleId,
    lessonId: input.lessonId,
    userId: input.userId,
    title,
    body,
    createdAt: new Date().toISOString(),
    upvotedBy: [],
  };
  db.threads.push(thread);
  return thread;
}

export function addComment(
  db: DatabaseSchema,
  input: { threadId: string; userId: string; body: string }
): Comment {
  const thread = db.threads.find((t) => t.id === input.threadId);
  if (!thread) throw new Error('Thread not found.');
  const body = (input.body || '').trim().slice(0, 2000);
  if (!body) throw new Error('Comment cannot be empty.');

  const comment: Comment = {
    id: newId('cmt'),
    threadId: input.threadId,
    userId: input.userId,
    body,
    createdAt: new Date().toISOString(),
    upvotedBy: [],
  };
  db.comments.push(comment);
  return comment;
}

/** Toggle an upvote. Returns true when the user is now upvoting, false when removed. */
export function toggleThreadUpvote(
  db: DatabaseSchema,
  input: { threadId: string; userId: string }
): { thread: Thread; upvoted: boolean } {
  const thread = db.threads.find((t) => t.id === input.threadId);
  if (!thread) throw new Error('Thread not found.');
  thread.upvotedBy = thread.upvotedBy ?? [];
  const idx = thread.upvotedBy.indexOf(input.userId);
  if (idx >= 0) {
    thread.upvotedBy.splice(idx, 1);
    return { thread, upvoted: false };
  }
  thread.upvotedBy.push(input.userId);
  return { thread, upvoted: true };
}

export function toggleCommentUpvote(
  db: DatabaseSchema,
  input: { commentId: string; userId: string }
): { comment: Comment; upvoted: boolean } {
  const comment = db.comments.find((c) => c.id === input.commentId);
  if (!comment) throw new Error('Comment not found.');
  comment.upvotedBy = comment.upvotedBy ?? [];
  const idx = comment.upvotedBy.indexOf(input.userId);
  if (idx >= 0) {
    comment.upvotedBy.splice(idx, 1);
    return { comment, upvoted: false };
  }
  comment.upvotedBy.push(input.userId);
  return { comment, upvoted: true };
}

export function reportTarget(
  db: DatabaseSchema,
  input: { targetType: 'thread' | 'comment'; targetId: string; userId: string; reason?: string }
): Report {
  const exists = input.targetType === 'thread'
    ? db.threads.some((t) => t.id === input.targetId)
    : db.comments.some((c) => c.id === input.targetId);
  if (!exists) throw new Error(`${input.targetType} not found.`);
  const already = db.reports.some(
    (r) => r.targetType === input.targetType && r.targetId === input.targetId && r.userId === input.userId
  );
  if (already) throw new Error('You already reported this.');

  const report: Report = {
    id: newId('rep'),
    targetType: input.targetType,
    targetId: input.targetId,
    userId: input.userId,
    reason: (input.reason || '').trim().slice(0, 500) || undefined,
    createdAt: new Date().toISOString(),
  };
  db.reports.push(report);
  return report;
}

/** Moderator delete. Requires the caller to be an admin or the original author. */
export function deleteThread(
  db: DatabaseSchema,
  input: { threadId: string; callerId: string; callerRole: string }
): { deleted: boolean } {
  const idx = db.threads.findIndex((t) => t.id === input.threadId);
  if (idx === -1) throw new Error('Thread not found.');
  const thread = db.threads[idx];
  const isAdmin = input.callerRole === 'admin' || input.callerRole === 'institution';
  if (!isAdmin && thread.userId !== input.callerId) throw new Error('Not authorized to delete this thread.');
  db.threads.splice(idx, 1);
  db.comments = db.comments.filter((c) => c.threadId !== input.threadId);
  return { deleted: true };
}

export function deleteComment(
  db: DatabaseSchema,
  input: { commentId: string; callerId: string; callerRole: string }
): { deleted: boolean } {
  const idx = db.comments.findIndex((c) => c.id === input.commentId);
  if (idx === -1) throw new Error('Comment not found.');
  const comment = db.comments[idx];
  const isAdmin = input.callerRole === 'admin' || input.callerRole === 'institution';
  if (!isAdmin && comment.userId !== input.callerId) throw new Error('Not authorized to delete this comment.');
  db.comments.splice(idx, 1);
  return { deleted: true };
}
