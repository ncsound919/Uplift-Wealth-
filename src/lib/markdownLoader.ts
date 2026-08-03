import { LessonContent } from '../data/courseData';

interface FrontmatterResult {
  data: Record<string, string | string[]>;
  content: string;
}

function parseFrontmatter(raw: string): FrontmatterResult {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    return { data: {}, content: raw };
  }

  const [, frontmatter, body] = match;
  const data: Record<string, string | string[]> = {};

  for (const line of frontmatter.split(/\r?\n/)) {
    const kv = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*):\s*(.*)$/);
    if (kv) {
      const [, key, rawValue] = kv;
      const value = rawValue.trim();
      if (value.startsWith('[') && value.endsWith(']')) {
        data[key] = value
          .slice(1, -1)
          .split(',')
          .map(s => s.trim().replace(/^['"]|['"]$/g, ''));
      } else {
        data[key] = value.replace(/^['"]|['"]$/g, '');
      }
    }
  }

  return { data, content: body.trim() };
}

export function lessonFromMarkdown(raw: string, fallbackId?: string): LessonContent {
  const { data, content } = parseFrontmatter(raw);
  const id = (data.id as string) || fallbackId || 'unknown';
  const title = (data.title as string) || 'Untitled';
  const type = (data.type as 'text' | 'video' | 'quiz' | 'game') || 'text';

  const lesson: LessonContent = {
    id,
    title,
    type,
  };

  if (type === 'text') {
    lesson.content = content;
  } else if (type === 'video') {
    const videoId = data.videoId as string;
    if (videoId) lesson.videoId = videoId;
  } else if (type === 'quiz') {
    const questionsRaw = data.questions as string | undefined;
    if (questionsRaw) {
      try {
        const parsed = JSON.parse(questionsRaw);
        if (Array.isArray(parsed)) {
          lesson.quiz = parsed;
        }
      } catch {
        console.warn(`Failed to parse quiz questions for ${id}`);
      }
    }
  } else if (type === 'game') {
    const gameType = data.gameType as LessonContent['gameType'];
    if (gameType) lesson.gameType = gameType;
  }

  return lesson;
}

export function loadLessonFromString(raw: string, fallbackId?: string): LessonContent {
  return lessonFromMarkdown(raw, fallbackId);
}

export function buildLessonContent(
  rawMarkdown: string,
  fallbackId?: string
): LessonContent {
  return lessonFromMarkdown(rawMarkdown, fallbackId);
}
