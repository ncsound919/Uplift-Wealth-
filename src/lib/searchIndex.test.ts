import { describe, it, expect } from 'vitest';
import { search, getTypeLabel, getTypeColor } from './searchIndex';

describe('searchIndex', () => {
  describe('search', () => {
    it('returns empty array for empty query', () => {
      expect(search('')).toEqual([]);
    });

    it('returns empty array for whitespace-only query', () => {
      expect(search('   ')).toEqual([]);
    });

    it('finds modules by title', () => {
      const results = search('Banking');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.type === 'module' || r.type === 'lesson')).toBe(true);
    });

    it('finds lessons and concepts', () => {
      const results = search('money');
      expect(results.length).toBeGreaterThan(0);
    });

    it('limits results to specified limit', () => {
      const results = search('the', 3);
      expect(results.length).toBeLessThanOrEqual(3);
    });

    it('returns results with id, title, type, subtitle, route', () => {
      const results = search('banking');
      if (results.length > 0) {
        const r = results[0];
        expect(r.id).toBeTruthy();
        expect(r.title).toBeTruthy();
        expect(['module', 'lesson', 'lecture', 'concept']).toContain(r.type);
        expect(r.subtitle).toBeTruthy();
        expect(r.route).toBeTruthy();
      }
    });
  });

  describe('getTypeLabel', () => {
    it('returns Module for module', () => {
      expect(getTypeLabel('module')).toBe('Module');
    });
    it('returns Lesson for lesson', () => {
      expect(getTypeLabel('lesson')).toBe('Lesson');
    });
    it('returns Lecture for lecture', () => {
      expect(getTypeLabel('lecture')).toBe('Lecture');
    });
    it('returns Concept for concept', () => {
      expect(getTypeLabel('concept')).toBe('Concept');
    });
  });

  describe('getTypeColor', () => {
    it('returns a non-empty CSS class string for each type', () => {
      expect(getTypeColor('module')).toBeTruthy();
      expect(getTypeColor('lesson')).toBeTruthy();
      expect(getTypeColor('lecture')).toBeTruthy();
      expect(getTypeColor('concept')).toBeTruthy();
    });

    it('returns different colors for different types', () => {
      const colors = new Set([
        getTypeColor('module'),
        getTypeColor('lesson'),
        getTypeColor('lecture'),
        getTypeColor('concept'),
      ]);
      expect(colors.size).toBe(4);
    });
  });
});
