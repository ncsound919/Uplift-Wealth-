import { describe, it, expect, vi } from 'vitest';
import { loadLessonFromString, buildLessonContent, lessonFromMarkdown } from './markdownLoader';

function parseFrontmatter(raw: string) {
  const md = `---
title: placeholder
type: text
---

${raw}`;
  return lessonFromMarkdown(md);
}

describe('markdownLoader', () => {
  describe('parseFrontmatter', () => {
    it('parses simple frontmatter', () => {
      const result = parseFrontmatter(`# Body content`);
      expect(result.content).toContain('Body content');
    });

    it('handles content with no frontmatter', () => {
      const result = parseFrontmatter(`# Just a heading\n\nSome content.`);
      expect(result.content).toBeTruthy();
    });
  });

  describe('lessonFromMarkdown', () => {
    it('handles raw content with no frontmatter markers', () => {
      const lesson = lessonFromMarkdown(`# No frontmatter here`);
      expect(lesson.id).toBe('unknown');
      expect(lesson.title).toBe('Untitled');
      expect(lesson.type).toBe('text');
      expect(lesson.content).toContain('No frontmatter here');
    });

    it('parses array values in frontmatter', () => {
      const md = `---
id: arr-test
title: Array Lesson
type: text
tags: [one, two, three]
---
Body`;
      const lesson = lessonFromMarkdown(md);
      expect(lesson.id).toBe('arr-test');
      expect(lesson.content).toBe('Body');
    });

    it('handles fallbackId and default title when no id or title', () => {
      const md = `---
type: text
---
Body`;
      const lesson = lessonFromMarkdown(md, 'fallback-me');
      expect(lesson.id).toBe('fallback-me');
      expect(lesson.title).toBe('Untitled');
    });

    it('skips malformed frontmatter lines without colon separator', () => {
      const md = `---
id: m0-test
title: My Lesson
type: text
malformed-line
---
Body`;
      const lesson = lessonFromMarkdown(md);
      expect(lesson.id).toBe('m0-test');
      expect(lesson.content).toBe('Body');
    });

    it('preserves type value when provided as unrecognized string', () => {
      const md = `---
type: custom
---
Body`;
      const lesson = lessonFromMarkdown(md);
      expect(lesson.type).toBe('custom');
    });
  });

  describe('loadLessonFromString', () => {
    it('builds a text lesson', () => {
      const md = `---
id: m0-test
title: My Lesson
type: text
---
 
This is the lesson body.`;
      const lesson = loadLessonFromString(md, 'fallback');
      expect(lesson.id).toBe('m0-test');
      expect(lesson.title).toBe('My Lesson');
      expect(lesson.type).toBe('text');
      expect(lesson.content).toContain('This is the lesson body');
    });

    it('builds a video lesson with videoId', () => {
      const md = `---
id: m0-vid
title: Video Lesson
type: video
videoId: abc123
---
 
Body`;
      const lesson = loadLessonFromString(md);
      expect(lesson.type).toBe('video');
      expect(lesson.videoId).toBe('abc123');
    });

    it('builds a video lesson without videoId', () => {
      const md = `---
id: m0-vid2
title: Video No Id
type: video
---
Body`;
      const lesson = loadLessonFromString(md);
      expect(lesson.type).toBe('video');
      expect(lesson.videoId).toBeUndefined();
    });

    it('builds a game lesson without gameType', () => {
      const md = `---
id: m0-game2
title: Game No Type
type: game
---
Body`;
      const lesson = loadLessonFromString(md);
      expect(lesson.type).toBe('game');
      expect(lesson.gameType).toBeUndefined();
    });

    it('builds a game lesson with gameType', () => {
      const md = `---
id: m0-game
title: Game Lesson
type: game
gameType: trading
---
 
Body`;
      const lesson = loadLessonFromString(md);
      expect(lesson.type).toBe('game');
      expect(lesson.gameType).toBe('trading');
    });

    it('uses fallbackId when no id in frontmatter', () => {
      const md = `---
title: No ID
type: text
---
 
Body`;
      const lesson = loadLessonFromString(md, 'my-fallback');
      expect(lesson.id).toBe('my-fallback');
    });

    it('preserves markdown formatting in content', () => {
      const md = `---
id: m1
title: Formatting
type: text
---
 
## Heading
 
**bold** *italic* \`code\`
 
- list item 1
- list item 2
 
> blockquote`;
      const lesson = loadLessonFromString(md);
      expect(lesson.content).toContain('## Heading');
      expect(lesson.content).toContain('**bold**');
      expect(lesson.content).toContain('- list item 1');
      expect(lesson.content).toContain('> blockquote');
    });
  });

  describe('quiz type', () => {
    it('parses valid quiz JSON questions', () => {
      const md = `---
id: quiz-test
title: Quiz Lesson
type: quiz
questions: '[{"question":"Q1?","options":["a","b"],"answer":0}]'
---
Body`;
      const lesson = loadLessonFromString(md);
      expect(lesson.type).toBe('quiz');
      expect(lesson.quiz).toBeDefined();
      expect(lesson.quiz).toHaveLength(1);
    });

    it('handles invalid quiz JSON gracefully', () => {
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const md = `---
id: quiz-bad
title: Bad Quiz
type: quiz
questions: {invalid json}
---
Body`;
      const lesson = loadLessonFromString(md);
      expect(lesson.type).toBe('quiz');
      expect(lesson.quiz).toBeUndefined();
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('skips quiz when questions are not an array', () => {
      const md = `---
id: quiz-not-arr
title: Not Array
type: quiz
questions: "not-an-array"
---
Body`;
      const lesson = loadLessonFromString(md);
      expect(lesson.quiz).toBeUndefined();
    });

    it('skips quiz when questions field is missing', () => {
      const md = `---
id: quiz-no-q
title: No Questions
type: quiz
---
Body`;
      const lesson = loadLessonFromString(md);
      expect(lesson.quiz).toBeUndefined();
    });
  });

  describe('buildLessonContent', () => {
    it('delegates to lessonFromMarkdown', () => {
      const md = `---
id: build-test
title: Built
type: text
---
Content`;
      const lesson = buildLessonContent(md, 'fallback');
      expect(lesson.id).toBe('build-test');
      expect(lesson.content).toBe('Content');
    });

    it('uses fallbackId when no id', () => {
      const lesson = buildLessonContent('# raw', 'fb');
      expect(lesson.id).toBe('fb');
    });
  });
});
