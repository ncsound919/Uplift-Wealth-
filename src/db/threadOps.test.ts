import { describe, it, expect } from 'vitest';
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
} from './threadOps';
import type { DatabaseSchema } from './types';

function makeDb(): DatabaseSchema {
  return {
    users: {
      u1: { id: 'u1', name: 'Nia', role: 'student', track: 'all', badges: [], streakDays: 1, lastActive: 't' },
      u2: { id: 'u2', name: 'Kofi', role: 'student', track: 'all', badges: [], streakDays: 1, lastActive: 't' },
      admin: { id: 'admin', name: 'Admin', role: 'admin', track: 'all', badges: [], streakDays: 1, lastActive: 't' },
    },
    progress: {},
    sandboxes: {},
    donations: [],
    auditLogs: [],
    waitlist: [],
    threads: [],
    comments: [],
    reports: [],
  cohorts: [],
  };
}

describe('threadOps', () => {
  it('creates and lists threads with author names and comment counts', () => {
    const db = makeDb();
    const t1 = createThread(db, { userId: 'u1', moduleId: 'module-1', title: '  How do payment rails settle?  ', body: ' Curious about the flow. ' });
    const t2 = createThread(db, { userId: 'u2', moduleId: 'module-2', title: 'Cards question', body: 'Anyone?', });
    addComment(db, { threadId: t1.id, userId: 'u2', body: 'Great question!' });

    const threads = listThreads(db, { moduleId: 'module-1' });
    expect(threads).toHaveLength(1);
    expect(threads[0].id).toBe(t1.id);
    expect(threads[0].title).toBe('How do payment rails settle?');
    expect(threads[0].authorName).toBe('Nia');
    expect(threads[0].commentCount).toBe(1);

    const all = listThreads(db);
    expect(all).toHaveLength(2);
    // Deterministic ordering check: pin timestamps, then assert newest-first.
    db.threads[0].createdAt = '2024-01-02T00:00:00.000Z';
    db.threads[1].createdAt = '2024-01-01T00:00:00.000Z';
    expect(listThreads(db).map(t => t.id)).toEqual([t1.id, t2.id]);
  });

  it('lists threads by lesson when provided', () => {
    const db = makeDb();
    createThread(db, { userId: 'u1', moduleId: 'module-1', lessonId: 'm1-l1', title: 'A', body: 'x' });
    createThread(db, { userId: 'u1', moduleId: 'module-1', lessonId: 'm1-l2', title: 'B', body: 'x' });
    const only = listThreads(db, { moduleId: 'module-1', lessonId: 'm1-l2' });
    expect(only.map(t => t.title)).toEqual(['B']);
  });

  it('gets a thread with its comments ordered oldest first', () => {
    const db = makeDb();
    const t = createThread(db, { userId: 'u1', title: 'Thread', body: 'start' });
    addComment(db, { threadId: t.id, userId: 'u2', body: 'second' });
    addComment(db, { threadId: t.id, userId: 'u1', body: 'first' });

    const found = getThread(db, t.id)!;
    expect(found.comments.map(c => c.body)).toEqual(['second', 'first']);
    expect(found.comments[0].authorName).toBe('Kofi');
  });

  it('toggles thread upvotes per user', () => {
    const db = makeDb();
    const t = createThread(db, { userId: 'u1', title: 'T', body: 'x' });
    expect(toggleThreadUpvote(db, { threadId: t.id, userId: 'u2' }).upvoted).toBe(true);
    expect(toggleThreadUpvote(db, { threadId: t.id, userId: 'u1' }).upvoted).toBe(true);
    expect(listThreads(db)[0].upvotes).toBe(2);
    expect(toggleThreadUpvote(db, { threadId: t.id, userId: 'u2' }).upvoted).toBe(false);
    expect(listThreads(db)[0].upvotes).toBe(1);
  });

  it('toggles comment upvotes', () => {
    const db = makeDb();
    const t = createThread(db, { userId: 'u1', title: 'T', body: 'x' });
    const c = addComment(db, { threadId: t.id, userId: 'u2', body: 'reply' });
    expect(toggleCommentUpvote(db, { commentId: c.id, userId: 'u1' }).upvoted).toBe(true);
    expect(getThread(db, t.id)!.comments[0].upvotes).toBe(1);
  });

  it('reports a thread once per user', () => {
    const db = makeDb();
    const t = createThread(db, { userId: 'u1', title: 'T', body: 'x' });
    reportTarget(db, { targetType: 'thread', targetId: t.id, userId: 'u2', reason: 'spam' });
    expect(db.reports).toHaveLength(1);
    expect(() => reportTarget(db, { targetType: 'thread', targetId: t.id, userId: 'u2' })).toThrow(/already reported/i);
  });

  it('author or admin can delete a thread (and its comments)', () => {
    const db = makeDb();
    const t = createThread(db, { userId: 'u1', title: 'T', body: 'x' });
    addComment(db, { threadId: t.id, userId: 'u2', body: 'reply' });

    expect(() => deleteThread(db, { threadId: t.id, callerId: 'u2', callerRole: 'student' })).toThrow(/not authorized/i);
    expect(deleteThread(db, { threadId: t.id, callerId: 'admin', callerRole: 'admin' }).deleted).toBe(true);
    expect(db.threads).toHaveLength(0);
    expect(db.comments).toHaveLength(0);
  });

  it('validates thread input', () => {
    const db = makeDb();
    expect(() => createThread(db, { userId: 'u1', title: '  ', body: 'x' })).toThrow(/title/i);
    expect(() => createThread(db, { userId: 'u1', title: 'T', body: '  ' })).toThrow(/detail/i);
  });
});
