/**
 * Lesson content CMS operations — pure functions over the store.
 * Overrides are keyed by moduleId + lessonId; the client renders the override
 * when present and falls back to the base lesson otherwise. Every save appends
 * an immutable revision for version history.
 */
import type { DatabaseSchema, LessonOverride, ContentRevision } from './types';

export interface EffectiveContent {
  content: string;
  overridden: boolean;
  version: number;
  updatedBy?: string;
  updatedAt?: string;
}

function overrideId(moduleId: string, lessonId: string): string {
  return `${moduleId}:${lessonId}`;
}

export function getEffectiveContent(db: DatabaseSchema, moduleId: string, lessonId: string): EffectiveContent | null {
  const o = db.lessonOverrides.find((x) => x.moduleId === moduleId && x.lessonId === lessonId);
  if (!o) return null;
  return { content: o.content, overridden: true, version: o.version, updatedBy: o.updatedBy, updatedAt: o.updatedAt };
}

export function listOverrides(db: DatabaseSchema): LessonOverride[] {
  return [...db.lessonOverrides].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getRevisions(db: DatabaseSchema, moduleId: string, lessonId: string): ContentRevision[] {
  return db.contentRevisions
    .filter((r) => r.moduleId === moduleId && r.lessonId === lessonId)
    .sort((a, b) => b.version - a.version);
}

export function saveOverride(
  db: DatabaseSchema,
  input: { moduleId: string; lessonId: string; content: string; updatedBy: string }
): { override: LessonOverride; revision: ContentRevision } {
  const moduleId = (input.moduleId || '').slice(0, 100);
  const lessonId = (input.lessonId || '').slice(0, 200);
  if (!moduleId || !lessonId) throw new Error('Missing module or lesson reference.');
  const content = String(input.content || '');
  if (!content.trim()) throw new Error('Lesson content cannot be empty.');

  const existing = db.lessonOverrides.find((o) => o.moduleId === moduleId && o.lessonId === lessonId);
  const version = existing ? existing.version + 1 : 1;
  const now = new Date().toISOString();

  const override: LessonOverride = {
    moduleId,
    lessonId,
    content,
    version,
    updatedBy: input.updatedBy,
    updatedAt: now,
  };
  if (existing) {
    Object.assign(existing, override);
  } else {
    db.lessonOverrides.push(override);
  }

  const revision: ContentRevision = {
    id: `${overrideId(moduleId, lessonId)}-v${version}`,
    moduleId,
    lessonId,
    content,
    version,
    updatedBy: input.updatedBy,
    updatedAt: now,
  };
  db.contentRevisions.push(revision);

  return { override, revision };
}

export function deleteOverride(db: DatabaseSchema, moduleId: string, lessonId: string): { deleted: boolean } {
  const idx = db.lessonOverrides.findIndex((o) => o.moduleId === moduleId && o.lessonId === lessonId);
  if (idx === -1) throw new Error('No override for this lesson.');
  db.lessonOverrides.splice(idx, 1);
  return { deleted: true };
}
