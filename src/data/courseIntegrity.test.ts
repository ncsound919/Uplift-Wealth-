import { describe, it, expect } from 'vitest';
import { courseModules, Module, LessonContent } from './courseData';
import { LECTURE_CLASSES } from './lectureLibrary';

describe('courseModules integrity', () => {
  it('has at least 13 modules', () => {
    expect(courseModules.length).toBeGreaterThanOrEqual(13);
  });

  it('every module has an id, title, level, color, icon', () => {
    for (const mod of courseModules) {
      expect(mod.id).toBeTruthy();
      expect(mod.title).toBeTruthy();
      expect(['beginner', 'intermediate', 'expert']).toContain(mod.level);
      expect(mod.color).toMatch(/^bg-/);
      expect(mod.icon).toBeDefined();
    }
  });

  it('every module has at least 3 lessons', () => {
    for (const mod of courseModules) {
      expect(mod.lessons.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('every lesson has a unique id', () => {
    const allIds = courseModules.flatMap(m => m.lessons.map(l => l.id));
    const uniqueIds = new Set(allIds);
    expect(uniqueIds.size).toBe(allIds.length);
  });

  it('every lesson has a valid type', () => {
    for (const mod of courseModules) {
      for (const lesson of mod.lessons) {
        expect(['text', 'video', 'quiz', 'game', 'lecture', 'article']).toContain(lesson.type);
      }
    }
  });

  it('lecture lessons use the module lecture class', () => {
    for (const mod of courseModules) {
      for (const lesson of mod.lessons) {
        if (lesson.type === 'lecture') {
          const cls = LECTURE_CLASSES.find(c => c.moduleId === mod.id);
          expect(cls).toBeDefined();
        }
      }
    }
  });

  it('quiz lessons have quiz arrays', () => {
    for (const mod of courseModules) {
      for (const lesson of mod.lessons) {
        if (lesson.type === 'quiz') {
          expect(lesson.quiz).toBeDefined();
          expect(lesson.quiz!.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('every quiz has correctAnswer within bounds and explanation', () => {
    for (const mod of courseModules) {
      for (const lesson of mod.lessons) {
        if (lesson.type === 'quiz' && lesson.quiz) {
          for (const q of lesson.quiz) {
            expect(q.correctAnswer).toBeGreaterThanOrEqual(0);
            expect(q.correctAnswer).toBeLessThan(q.options.length);
            expect(q.explanation).toBeTruthy();
            expect(q.options.length).toBeGreaterThanOrEqual(2);
          }
        }
      }
    }
  });

  it('video lessons have videoId', () => {
    for (const mod of courseModules) {
      for (const lesson of mod.lessons) {
        if (lesson.type === 'video') {
          expect(lesson.videoId).toBeTruthy();
        }
      }
    }
  });

  it('game lessons have gameType', () => {
    for (const mod of courseModules) {
      for (const lesson of mod.lessons) {
        if (lesson.type === 'game') {
          expect(lesson.gameType).toBeTruthy();
        }
      }
    }
  });

  it('all lesson IDs match their module pattern', () => {
    for (const mod of courseModules) {
      const prefix = mod.id.replace('module-', 'm') + '-';
      for (const lesson of mod.lessons) {
        expect(lesson.id.startsWith(prefix)).toBe(true);
      }
    }
  });

  it('modules have unique IDs', () => {
    const ids = courseModules.map(m => m.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});

describe('lectureLibrary integrity', () => {
  it('each lecture class corresponds to a module', () => {
    const moduleIds = new Set(courseModules.map(m => m.id));
    for (const cls of LECTURE_CLASSES) {
      expect(moduleIds.has(cls.moduleId)).toBe(true);
    }
  });

  it('each lecture has required fields', () => {
    for (const cls of LECTURE_CLASSES) {
      expect(cls.id).toBeTruthy();
      expect(cls.title).toBeTruthy();
      expect(cls.learningOutcomes.length).toBeGreaterThan(0);
      expect(cls.keyConcepts.length).toBeGreaterThan(0);
      expect(cls.slides.length).toBeGreaterThan(0);
      expect(cls.teachingMoves.length).toBeGreaterThan(0);
    }
  });

  it('every key concept has term, definition, and practicalUse', () => {
    for (const cls of LECTURE_CLASSES) {
      for (const kc of cls.keyConcepts) {
        expect(kc.term).toBeTruthy();
        expect(kc.definition).toBeTruthy();
        expect(kc.practicalUse).toBeTruthy();
      }
    }
  });

  it('every slide has required fields', () => {
    for (const cls of LECTURE_CLASSES) {
      for (const slide of cls.slides) {
        expect(slide.title).toBeTruthy();
        expect(slide.bullets.length).toBeGreaterThan(0);
      }
    }
  });
});

describe('module-lecture class alignment', () => {
  it('each module-{n} has a corresponding CLASS_{n} (except module-0 has CLASS_0)', () => {
    for (const mod of courseModules) {
      const classId = `class-${mod.id.replace('module-', '')}`;
      const match = LECTURE_CLASSES.find(c => c.id === classId);
      expect(match).toBeDefined();
    }
  });

  it('every lecture class has a corresponding module', () => {
    for (const cls of LECTURE_CLASSES) {
      const moduleId = cls.moduleId;
      const match = courseModules.find(m => m.id === moduleId);
      expect(match).toBeDefined();
    }
  });
});
