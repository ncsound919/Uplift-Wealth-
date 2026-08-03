import { CategoryStat, SessionAnswer } from './quizTypes';

export interface QuizAnalytics {
  totalAnswered: number;
  correctCount: number;
  accuracyPct: number;
  avgTimePerQuestionSec: number;
  bestCategory: string | null;
  weakestCategory: string | null;
  longestStreak: number;
  totalPoints: number;
  missedQuestionIds: string[];
  categoryBreakdown: Record<string, { total: number; correct: number; accuracyPct: number }>;
}

export class QuizAnalyticsEngine {
  static fromAnswers(answers: SessionAnswer[], maxStreak: number): QuizAnalytics {
    const totalAnswered = answers.length;
    const correctCount = answers.filter(a => a.correct).length;
    const accuracyPct = totalAnswered ? (correctCount / totalAnswered) * 100 : 0;
    const avgTimePerQuestionSec = totalAnswered ? answers.reduce((s, a) => s + a.timeSpentSec, 0) / totalAnswered : 0;
    const totalPoints = answers.reduce((s, a) => s + a.pointsEarned, 0);
    const missedQuestionIds = answers.filter(a => !a.correct).map(a => a.questionId);

    const categoryBreakdown: Record<string, { total: number; correct: number; accuracyPct: number }> = {};
    answers.forEach(a => {
      if (!categoryBreakdown[a.category]) categoryBreakdown[a.category] = { total: 0, correct: 0, accuracyPct: 0 };
      categoryBreakdown[a.category].total += 1;
      categoryBreakdown[a.category].correct += a.correct ? 1 : 0;
    });

    Object.values(categoryBreakdown).forEach(v => {
      v.accuracyPct = v.total ? (v.correct / v.total) * 100 : 0;
    });

    const ranked = Object.entries(categoryBreakdown).sort((a, b) => b[1].accuracyPct - a[1].accuracyPct);
    const bestCategory = ranked[0]?.[0] ?? null;
    const weakestCategory = ranked.at(-1)?.[0] ?? null;

    return {
      totalAnswered,
      correctCount,
      accuracyPct,
      avgTimePerQuestionSec,
      bestCategory,
      weakestCategory,
      longestStreak: maxStreak,
      totalPoints,
      missedQuestionIds,
      categoryBreakdown,
    };
  }

  static mergeCategoryStats(prev: Record<string, CategoryStat>, category: string, correct: boolean) {
    const current = prev[category] || { total: 0, correct: 0 };
    return {
      ...prev,
      [category]: {
        total: current.total + 1,
        correct: current.correct + (correct ? 1 : 0),
      },
    };
  }
}
