import { describe, it, expect } from 'vitest';
import { getEffectiveContent, listOverrides, getRevisions, saveOverride, deleteOverride } from './contentOps';
import type { DatabaseSchema } from './types';

function makeDb(): DatabaseSchema {
  return {
    users: {},
    progress: {},
    sandboxes: {},
    donations: [],
    auditLogs: [],
    waitlist: [],
    threads: [],
    comments: [],
    reports: [],
    cohorts: [],
    notifications: [],
    lessonOverrides: [],
    contentRevisions: [],
    creatorApplications: [],
  };
}

describe('contentOps', () => {
  it('returns null when no override exists', () => {
    expect(getEffectiveContent(makeDb(), 'module-1', 'm1-l1')).toBeNull();
  });

  it('saves an override and returns the effective content', () => {
    const db = makeDb();
    saveOverride(db, { moduleId: 'module-1', lessonId: 'm1-l1', content: '## New content', updatedBy: 'admin' });
    const eff = getEffectiveContent(db, 'module-1', 'm1-l1')!;
    expect(eff.overridden).toBe(true);
    expect(eff.content).toBe('## New content');
    expect(eff.version).toBe(1);
  });

  it('increments version and records an immutable revision per save', () => {
    const db = makeDb();
    saveOverride(db, { moduleId: 'module-1', lessonId: 'm1-l1', content: 'v1', updatedBy: 'u1' });
    saveOverride(db, { moduleId: 'module-1', lessonId: 'm1-l1', content: 'v2', updatedBy: 'u2' });
    const revisions = getRevisions(db, 'module-1', 'm1-l1');
    expect(revisions).toHaveLength(2);
    expect(revisions[0].version).toBe(2); // newest first
    expect(revisions[0].content).toBe('v2');
    expect(getEffectiveContent(db, 'module-1', 'm1-l1')!.version).toBe(2);
  });

  it('lists overrides newest first', () => {
    const db = makeDb();
    saveOverride(db, { moduleId: 'module-1', lessonId: 'm1-l1', content: 'a', updatedBy: 'u1' });
    saveOverride(db, { moduleId: 'module-2', lessonId: 'm2-l1', content: 'b', updatedBy: 'u1' });
    expect(listOverrides(db)).toHaveLength(2);
  });

  it('validates input', () => {
    const db = makeDb();
    expect(() => saveOverride(db, { moduleId: '', lessonId: 'x', content: 'c', updatedBy: 'u' })).toThrow(/module/i);
    expect(() => saveOverride(db, { moduleId: 'm', lessonId: 'l', content: '  ', updatedBy: 'u' })).toThrow(/empty/i);
  });

  it('deletes an override but keeps revisions', () => {
    const db = makeDb();
    saveOverride(db, { moduleId: 'module-1', lessonId: 'm1-l1', content: 'v1', updatedBy: 'u1' });
    expect(deleteOverride(db, 'module-1', 'm1-l1').deleted).toBe(true);
    expect(getEffectiveContent(db, 'module-1', 'm1-l1')).toBeNull();
    expect(getRevisions(db, 'module-1', 'm1-l1')).toHaveLength(1);
  });
});
