import Fuse from 'fuse.js';
import { courseModules } from '../data/courseData';
import { LECTURE_CLASSES } from '../data/lectureLibrary';

export interface SearchResult {
  id: string;
  title: string;
  type: 'module' | 'lesson' | 'lecture' | 'concept';
  subtitle: string;
  route: string;
}

interface SearchEntry {
  id: string;
  title: string;
  type: SearchResult['type'];
  subtitle: string;
  route: string;
  content: string;
}

let searchIndex: Fuse<SearchEntry> | null = null;

function buildIndex(): SearchEntry[] {
  const entries: SearchEntry[] = [];

  for (const mod of courseModules) {
    entries.push({
      id: mod.id,
      title: mod.title,
      type: 'module',
      subtitle: `Module — ${mod.level}`,
      route: `/module/${mod.id.replace('module-', '')}`,
      content: mod.description,
    });

    for (const lesson of mod.lessons) {
      entries.push({
        id: lesson.id,
        title: lesson.title,
        type: 'lesson',
        subtitle: `Lesson in ${mod.title}`,
        route: `/module/${mod.id.replace('module-', '')}`,
        content: lesson.content || '',
      });
    }
  }

  for (const cls of LECTURE_CLASSES) {
    entries.push({
      id: cls.id,
      title: cls.title,
      type: 'lecture',
      subtitle: 'Lecture Class',
      route: '/knowledge',
      content: cls.overview + ' ' + cls.learningOutcomes.join(' '),
    });

    for (const concept of cls.keyConcepts) {
      entries.push({
        id: `${cls.id}-${concept.term}`,
        title: concept.term,
        type: 'concept',
        subtitle: `Key Concept — ${cls.title}`,
        route: '/knowledge',
        content: concept.definition + ' ' + concept.practicalUse,
      });
    }
  }

  return entries;
}

export function search(query: string, limit = 10): SearchResult[] {
  if (!searchIndex) {
    searchIndex = new Fuse(buildIndex(), {
      keys: ['title', 'content', 'subtitle'],
      threshold: 0.4,
      distance: 100,
      includeScore: true,
    });
  }

  if (!query.trim()) return [];

  const results = searchIndex.search(query, { limit });
  return results.map(r => ({
    id: r.item.id,
    title: r.item.title,
    type: r.item.type,
    subtitle: r.item.subtitle,
    route: r.item.route,
  }));
}

const typeLabels: Record<SearchResult['type'], string> = {
  module: 'Module',
  lesson: 'Lesson',
  lecture: 'Lecture',
  concept: 'Concept',
};

const typeColors: Record<SearchResult['type'], string> = {
  module: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  lesson: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
  lecture: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400',
  concept: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
};

export function getTypeLabel(type: SearchResult['type']) {
  return typeLabels[type];
}

export function getTypeColor(type: SearchResult['type']) {
  return typeColors[type];
}
