import { describe, it, expect } from 'vitest';
import { EXTENDED_QUIZ_BANK, ExtendedQuizQuestion, DiagramData } from './extendedQuizBank';

const VALID_POINTS = new Set([100, 200, 300, 500]);
const VALID_DIAGRAM_TYPES = new Set<DiagramData['type']>(['flow', 'ledger', 'code', 'scorecard', 'comparison', 'formula']);

function questions(): ExtendedQuizQuestion[] {
  return EXTENDED_QUIZ_BANK;
}

describe('EXTENDED_QUIZ_BANK data integrity', () => {
  it('has at least one question', () => {
    expect(questions().length).toBeGreaterThan(0);
  });

  it('has unique question ids', () => {
    const ids = questions().map(q => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has unique question text', () => {
    const texts = questions().map(q => q.question);
    expect(new Set(texts).size).toBe(texts.length);
  });

  it('has either two or four options per question', () => {
    for (const q of questions()) {
      expect([2, 4]).toContain(q.options.length);
    }
  });

  it('has unique options within each question', () => {
    for (const q of questions()) {
      expect(new Set(q.options).size).toBe(q.options.length);
    }
  });

  it('has a correctIndex within the options range', () => {
    for (const q of questions()) {
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex).toBeLessThan(q.options.length);
    }
  });

  it('uses a valid points value from the allowed set', () => {
    for (const q of questions()) {
      expect(VALID_POINTS.has(q.points)).toBe(true);
    }
  });

  it('has non-empty id, category, question, and explanation', () => {
    for (const q of questions()) {
      expect(q.id.trim()).not.toBe('');
      expect(q.category.trim()).not.toBe('');
      expect(q.question.trim()).not.toBe('');
      expect(q.explanation.trim()).not.toBe('');
    }
  });

  it('has at least a minimum of distinct categories', () => {
    const categories = new Set(questions().map(q => q.category));
    expect(categories.size).toBeGreaterThanOrEqual(8);
  });

  it('uses valid diagram types when a diagram is present', () => {
    for (const q of questions()) {
      if (q.diagram) {
        expect(VALID_DIAGRAM_TYPES.has(q.diagram.type)).toBe(true);
      }
    }
  });

  it('keeps flow diagram nodes non-empty when present', () => {
    for (const q of questions()) {
      if (q.diagram?.type === 'flow') {
        expect(q.diagram.nodes?.length).toBeGreaterThan(0);
      }
    }
  });

  it('uses multiple distinct points tiers', () => {
    const pointCounts = new Set(questions().map(q => q.points));
    expect(pointCounts.size).toBeGreaterThanOrEqual(3);
  });
});
