import { describe, it, expect } from 'vitest';
import { QuizAnalyticsEngine } from './quizAnalytics';
import { SessionAnswer } from './quizTypes';

const makeAnswer = (overrides: Partial<SessionAnswer> = {}): SessionAnswer => ({
  questionId: 'q1',
  category: 'test',
  selectedIndex: 0,
  correctIndex: 0,
  correct: true,
  timeSpentSec: 10,
  mode: 'millionaire',
  tierIndex: 0,
  pointsEarned: 100,
  answeredAt: new Date().toISOString(),
  ...overrides,
});

describe('QuizAnalyticsEngine.fromAnswers', () => {
  it('returns zeros for empty answers array', () => {
    const result = QuizAnalyticsEngine.fromAnswers([], 0);
    expect(result.totalAnswered).toBe(0);
    expect(result.correctCount).toBe(0);
    expect(result.accuracyPct).toBe(0);
    expect(result.avgTimePerQuestionSec).toBe(0);
    expect(result.totalPoints).toBe(0);
    expect(result.missedQuestionIds).toEqual([]);
    expect(result.bestCategory).toBeNull();
    expect(result.weakestCategory).toBeNull();
    expect(result.longestStreak).toBe(0);
    expect(result.categoryBreakdown).toEqual({});
  });

  it('returns 100% accuracy when all answers are correct', () => {
    const answers = [
      makeAnswer({ questionId: 'q1', category: 'math', correct: true, timeSpentSec: 5, pointsEarned: 100 }),
      makeAnswer({ questionId: 'q2', category: 'math', correct: true, timeSpentSec: 10, pointsEarned: 200 }),
    ];
    const result = QuizAnalyticsEngine.fromAnswers(answers, 3);
    expect(result.totalAnswered).toBe(2);
    expect(result.correctCount).toBe(2);
    expect(result.accuracyPct).toBe(100);
    expect(result.totalPoints).toBe(300);
    expect(result.longestStreak).toBe(3);
    expect(result.missedQuestionIds).toEqual([]);
  });

  it('returns 0% accuracy when all answers are incorrect', () => {
    const answers = [
      makeAnswer({ questionId: 'q1', correct: false, selectedIndex: 1 }),
      makeAnswer({ questionId: 'q2', correct: false, selectedIndex: 2 }),
    ];
    const result = QuizAnalyticsEngine.fromAnswers(answers, 0);
    expect(result.accuracyPct).toBe(0);
    expect(result.correctCount).toBe(0);
    expect(result.missedQuestionIds).toEqual(['q1', 'q2']);
  });

  it('computes avgTimePerQuestionSec from mixed timing', () => {
    const answers = [
      makeAnswer({ timeSpentSec: 5 }),
      makeAnswer({ timeSpentSec: 15 }),
    ];
    const result = QuizAnalyticsEngine.fromAnswers(answers, 0);
    expect(result.avgTimePerQuestionSec).toBe(10);
  });

  it('aggregates category breakdown correctly', () => {
    const answers = [
      makeAnswer({ category: 'math', correct: true }),
      makeAnswer({ category: 'math', correct: false }),
      makeAnswer({ category: 'science', correct: true }),
    ];
    const result = QuizAnalyticsEngine.fromAnswers(answers, 0);
    expect(result.categoryBreakdown.math).toEqual({ total: 2, correct: 1, accuracyPct: 50 });
    expect(result.categoryBreakdown.science).toEqual({ total: 1, correct: 1, accuracyPct: 100 });
  });

  it('determines best and weakest categories by accuracy', () => {
    const answers = [
      makeAnswer({ category: 'math', correct: true }),
      makeAnswer({ category: 'math', correct: true }),
      makeAnswer({ category: 'science', correct: false }),
      makeAnswer({ category: 'science', correct: false }),
      makeAnswer({ category: 'history', correct: false }),
    ];
    const result = QuizAnalyticsEngine.fromAnswers(answers, 0);
    expect(result.bestCategory).toBe('math');
    expect(result.weakestCategory).toBe('history');
  });

  it('returns same category for best and weakest with single category', () => {
    const answers = [makeAnswer({ category: 'math', correct: true })];
    const result = QuizAnalyticsEngine.fromAnswers(answers, 0);
    expect(result.bestCategory).toBe('math');
    expect(result.weakestCategory).toBe('math');
  });

  it('passes longest streak through from param', () => {
    const result = QuizAnalyticsEngine.fromAnswers([makeAnswer()], 7);
    expect(result.longestStreak).toBe(7);
  });

  it('calculates total points correctly', () => {
    const answers = [
      makeAnswer({ pointsEarned: 100 }),
      makeAnswer({ pointsEarned: 200 }),
      makeAnswer({ pointsEarned: 300 }),
    ];
    const result = QuizAnalyticsEngine.fromAnswers(answers, 0);
    expect(result.totalPoints).toBe(600);
  });
});

describe('QuizAnalyticsEngine.mergeCategoryStats', () => {
  it('creates a new category entry when category does not exist', () => {
    const result = QuizAnalyticsEngine.mergeCategoryStats({}, 'math', true);
    expect(result.math).toEqual({ total: 1, correct: 1 });
  });

  it('updates totals for an existing category', () => {
    const prev = { math: { total: 3, correct: 2 } };
    const result = QuizAnalyticsEngine.mergeCategoryStats(prev, 'math', false);
    expect(result.math).toEqual({ total: 4, correct: 2 });
  });

  it('preserves other categories when merging', () => {
    const prev = { math: { total: 1, correct: 1 }, science: { total: 2, correct: 1 } };
    const result = QuizAnalyticsEngine.mergeCategoryStats(prev, 'math', true);
    expect(result.math).toEqual({ total: 2, correct: 2 });
    expect(result.science).toEqual({ total: 2, correct: 1 });
  });

  it('accuracyPct is computed in fromAnswers categoryBreakdown after merge', () => {
    const merged = QuizAnalyticsEngine.mergeCategoryStats({}, 'math', true);
    const answers = [
      makeAnswer({ category: 'math', correct: true }),
      makeAnswer({ category: 'math', correct: false }),
    ];
    const result = QuizAnalyticsEngine.fromAnswers(answers, 0);
    expect(result.categoryBreakdown.math.accuracyPct).toBe(50);
  });
});
