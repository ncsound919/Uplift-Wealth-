import { describe, it, expect, beforeEach } from 'vitest';
import { loadSchedule, recordReview, getDueCards, getDueCount, getReviewStats, buildQuizCards } from './spacedRepetition';

describe('spacedRepetition', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('loadSchedule', () => {
    it('returns empty array when no schedule exists', () => {
      expect(loadSchedule()).toEqual([]);
    });

    it('returns parsed schedule from localStorage', () => {
      const data = [{ cardId: 'card-1', dueDate: '2025-12-01', ease: 2.5, interval: 1, repetitions: 0, lastReview: null }];
      localStorage.setItem('spaced_repetition_schedule', JSON.stringify(data));
      expect(loadSchedule()).toEqual(data);
    });

    it('returns empty array on invalid JSON', () => {
      localStorage.setItem('spaced_repetition_schedule', 'invalid{json');
      expect(loadSchedule()).toEqual([]);
    });
  });

  describe('recordReview', () => {
    it('creates a new entry for a new card', () => {
      recordReview('new-card', 4);
      const schedule = loadSchedule();
      expect(schedule).toHaveLength(1);
      expect(schedule[0].cardId).toBe('new-card');
      expect(schedule[0].ease).toBe(2.5);
      expect(schedule[0].repetitions).toBe(0);
      expect(schedule[0].lastReview).toBeTruthy();
    });

    it('updates an existing entry on subsequent reviews with quality >= 3', () => {
      recordReview('card-1', 4);
      recordReview('card-1', 5);
      const schedule = loadSchedule();
      const entry = schedule.find(e => e.cardId === 'card-1')!;
      expect(schedule).toHaveLength(1);
      expect(entry.repetitions).toBe(1);
      expect(entry.interval).toBe(1);
    });

    it('uses 6-day interval on the third successful review', () => {
      recordReview('card-1', 4);
      recordReview('card-1', 5);
      recordReview('card-1', 5);
      const entry = loadSchedule().find(e => e.cardId === 'card-1')!;
      expect(entry.repetitions).toBe(2);
      expect(entry.interval).toBe(6);
    });

    it('resets repetitions on quality < 3', () => {
      recordReview('card-1', 4);
      recordReview('card-1', 5);
      recordReview('card-1', 1);
      const entry = loadSchedule().find(e => e.cardId === 'card-1')!;
      expect(entry.repetitions).toBe(0);
      expect(entry.interval).toBe(1);
    });

    it('reduces ease by 0.2 on each failure', () => {
      recordReview('card-1', 0);
      recordReview('card-1', 0);
      const after1 = loadSchedule().find(e => e.cardId === 'card-1')!.ease;
      expect(after1).toBeCloseTo(2.3, 5);

      recordReview('card-1', 0);
      const after2 = loadSchedule().find(e => e.cardId === 'card-1')!.ease;
      expect(after2).toBeCloseTo(2.1, 5);
    });

    it('keeps ease at minimum 1.3 even after many failures', () => {
      for (let i = 0; i < 20; i++) {
        recordReview('card-1', 0);
      }
      const entry = loadSchedule().find(e => e.cardId === 'card-1')!;
      expect(entry.ease).toBe(1.3);
    });

    it('clamps quality to max 5', () => {
      recordReview('card-1', 10);
      const entry = loadSchedule().find(e => e.cardId === 'card-1')!;
      expect(entry.ease).toBeCloseTo(2.5, 5);
    });

    it('uses the ease factor to scale the interval after multiple successful reviews', () => {
      recordReview('card-1', 5);
      recordReview('card-1', 5);
      recordReview('card-1', 5);
      recordReview('card-1', 5);
      const entry = loadSchedule().find(e => e.cardId === 'card-1')!;
      expect(entry.repetitions).toBe(3);
      expect(entry.interval).toBeGreaterThanOrEqual(6);
    });
  });

  describe('getDueCards', () => {
    it('returns cards whose due date has passed', () => {
      const past = new Date();
      past.setDate(past.getDate() - 1);
      const future = new Date();
      future.setDate(future.getDate() + 5);
      localStorage.setItem('spaced_repetition_schedule', JSON.stringify([
        { cardId: 'past', dueDate: past.toISOString(), ease: 2.5, interval: 1, repetitions: 0, lastReview: null },
        { cardId: 'future', dueDate: future.toISOString(), ease: 2.5, interval: 5, repetitions: 1, lastReview: null },
      ]));
      const due = getDueCards();
      expect(due).toHaveLength(1);
      expect(due[0].cardId).toBe('past');
    });

    it('returns empty when nothing is due', () => {
      expect(getDueCards()).toEqual([]);
    });
  });

  describe('getDueCount', () => {
    it('returns the count of due cards', () => {
      const past = new Date();
      past.setDate(past.getDate() - 1);
      localStorage.setItem('spaced_repetition_schedule', JSON.stringify([
        { cardId: 'past-1', dueDate: past.toISOString(), ease: 2.5, interval: 1, repetitions: 0, lastReview: null },
        { cardId: 'past-2', dueDate: past.toISOString(), ease: 2.5, interval: 1, repetitions: 0, lastReview: null },
      ]));
      expect(getDueCount()).toBe(2);
    });
  });

  describe('getReviewStats', () => {
    it('returns total, due, reviewed counts', () => {
      const past = new Date();
      past.setDate(past.getDate() - 1);
      localStorage.setItem('spaced_repetition_schedule', JSON.stringify([
        { cardId: 'past', dueDate: past.toISOString(), ease: 2.5, interval: 1, repetitions: 0, lastReview: '2025-01-01' },
        { cardId: 'new', dueDate: new Date(Date.now() + 100000).toISOString(), ease: 2.5, interval: 1, repetitions: 0, lastReview: null },
      ]));
      const stats = getReviewStats();
      expect(stats.total).toBe(2);
      expect(stats.reviewed).toBe(1);
    });

    it('returns zeros for empty schedule', () => {
      const stats = getReviewStats();
      expect(stats).toEqual({ total: 0, due: 0, reviewed: 0 });
    });
  });

  describe('buildQuizCards', () => {
    it('returns an array of cards with id, question, answer, explanation', () => {
      const cards = buildQuizCards();
      expect(cards.length).toBeGreaterThan(0);
      for (const card of cards) {
        expect(card.id).toBeTruthy();
        expect(card.question).toBeTruthy();
        expect(card.answer).toBeTruthy();
        expect(card.explanation).toBeTruthy();
      }
    });

    it('produces unique card ids', () => {
      const cards = buildQuizCards();
      const ids = new Set(cards.map(c => c.id));
      expect(ids.size).toBe(cards.length);
    });

    it('covers multiple modules', () => {
      const cards = buildQuizCards();
      const modules = new Set(cards.map(c => c.id.split('-')[1]));
      expect(modules.size).toBeGreaterThan(1);
    });
  });
});
