import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useQuizGameStore } from './quizGameStore';
import { useQuizTimer, useQuizDerived, useQuizAudio, useResultsDashboard } from './quizHooks';
import { ExtendedQuizQuestion } from './quizTypes';

const makeQ = (id: string, category = 'test'): ExtendedQuizQuestion => ({
  id,
  category,
  question: `Q: ${id}?`,
  options: ['A', 'B', 'C', 'D'],
  correctIndex: 0,
  explanation: '',
  points: 100,
});

const qBank: ExtendedQuizQuestion[] = [makeQ('q1', 'math'), makeQ('q2', 'science'), makeQ('q3', 'history')];

describe('useQuizTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useQuizGameStore.setState({
      timerActive: true,
      gameOver: false,
      isAnswered: false,
      isLockingIn: false,
      timeLeft: 30,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calls tick via setInterval every second', () => {
    renderHook(() => useQuizTimer());
    const timeBefore = useQuizGameStore.getState().timeLeft;
    vi.advanceTimersByTime(1000);
    expect(useQuizGameStore.getState().timeLeft).toBe(timeBefore - 1);
    vi.advanceTimersByTime(2000);
    expect(useQuizGameStore.getState().timeLeft).toBe(timeBefore - 3);
  });

  it('clears interval when gameOver becomes true', () => {
    const { rerender } = renderHook(() => useQuizTimer());
    vi.advanceTimersByTime(1000);
    const timeBefore = useQuizGameStore.getState().timeLeft;
    act(() => { useQuizGameStore.setState({ gameOver: true }); });
    rerender();
    vi.advanceTimersByTime(3000);
    expect(useQuizGameStore.getState().timeLeft).toBe(timeBefore);
  });
});

describe('useQuizDerived', () => {
  beforeEach(() => {
    useQuizGameStore.setState({
      quizBank: qBank,
      currentQuestionIndex: 0,
      lifelines: { fiftyFifty: true, askAudience: true, phoneExpert: true, doubleDip: true },
      sessionAnswers: [],
      correctCount: 0,
      timeLeft: 30,
      gameMode: 'millionaire',
      currentTierIndex: 0,
    });
  });

  it('returns current question', () => {
    const { result } = renderHook(() => useQuizDerived());
    expect(result.current.question?.id).toBe('q1');
    expect(result.current.question?.category).toBe('math');
  });

  it('returns null question when quizBank is empty', () => {
    useQuizGameStore.setState({ quizBank: [] });
    const { result } = renderHook(() => useQuizDerived());
    expect(result.current.question).toBeNull();
  });

  it('returns progressPct based on question index', () => {
    const { result, rerender } = renderHook(() => useQuizDerived());
    expect(result.current.progressPct).toBeCloseTo(33.33, 0);
    act(() => { useQuizGameStore.setState({ currentQuestionIndex: 1 }); });
    rerender();
    expect(result.current.progressPct).toBeCloseTo(66.66, 0);
  });

  it('returns 0 progressPct for empty quizBank', () => {
    useQuizGameStore.setState({ quizBank: [] });
    const { result } = renderHook(() => useQuizDerived());
    expect(result.current.progressPct).toBe(0);
  });

  it('returns accuracyPct from session answers', () => {
    useQuizGameStore.setState({
      sessionAnswers: [{ correct: true } as any, { correct: false } as any],
      correctCount: 1,
    });
    const { result } = renderHook(() => useQuizDerived());
    expect(result.current.accuracyPct).toBe(50);
  });

  it('returns remaining lifelines count', () => {
    const { result } = renderHook(() => useQuizDerived());
    expect(result.current.remainingLifelines).toBe(4);
  });

  it('updates remainingLifelines when lifelines change', () => {
    useQuizGameStore.setState({
      lifelines: { fiftyFifty: false, askAudience: true, phoneExpert: false, doubleDip: true },
    });
    const { result } = renderHook(() => useQuizDerived());
    expect(result.current.remainingLifelines).toBe(2);
  });

  it('returns timePressure normal above 10s', () => {
    useQuizGameStore.setState({ timeLeft: 30 });
    const { result } = renderHook(() => useQuizDerived());
    expect(result.current.timePressure).toBe('normal');
  });

  it('returns timePressure warning at 10s or below', () => {
    useQuizGameStore.setState({ timeLeft: 10 });
    const { result } = renderHook(() => useQuizDerived());
    expect(result.current.timePressure).toBe('warning');
  });

  it('returns timePressure critical at 5s or below', () => {
    useQuizGameStore.setState({ timeLeft: 5 });
    const { result } = renderHook(() => useQuizDerived());
    expect(result.current.timePressure).toBe('critical');
  });

  it('returns isGrandPrizeQuestion true for tier 14 in millionaire mode', () => {
    useQuizGameStore.setState({ currentTierIndex: 14 });
    const { result } = renderHook(() => useQuizDerived());
    expect(result.current.isGrandPrizeQuestion).toBe(true);
  });

  it('returns isGrandPrizeQuestion false for speed mode regardless of tier', () => {
    useQuizGameStore.setState({ gameMode: 'speed', currentTierIndex: 14 });
    const { result } = renderHook(() => useQuizDerived());
    expect(result.current.isGrandPrizeQuestion).toBe(false);
  });
});

describe('useQuizAudio', () => {
  it('is a stub effect that does not throw', () => {
    expect(() => renderHook(() => useQuizAudio(true))).not.toThrow();
    expect(() => renderHook(() => useQuizAudio(false))).not.toThrow();
  });
});

describe('useResultsDashboard', () => {
  beforeEach(() => {
    useQuizGameStore.setState({
      sessionAnswers: [],
      maxStreak: 0,
      categoryStats: {},
      sessionBestMillionaire: 0,
      sessionBestSpeed: 0,
    });
  });

  it('returns analytics from sessionAnswers', () => {
    useQuizGameStore.setState({
      sessionAnswers: [
        { questionId: 'q1', category: 'math', correct: true, timeSpentSec: 10, mode: 'millionaire', pointsEarned: 100, answeredAt: new Date().toISOString() } as any,
      ],
      maxStreak: 1,
    });
    const { result } = renderHook(() => useResultsDashboard());
    expect(result.current.analytics.totalAnswered).toBe(1);
    expect(result.current.analytics.correctCount).toBe(1);
    expect(result.current.analytics.longestStreak).toBe(1);
  });

  it('returns categoryStats from store', () => {
    useQuizGameStore.setState({ categoryStats: { math: { total: 2, correct: 2 } } });
    const { result } = renderHook(() => useResultsDashboard());
    expect(result.current.categoryStats).toEqual({ math: { total: 2, correct: 2 } });
  });

  it('returns best scores from store', () => {
    useQuizGameStore.setState({ sessionBestMillionaire: 1000, sessionBestSpeed: 500 });
    const { result } = renderHook(() => useResultsDashboard());
    expect(result.current.sessionBestMillionaire).toBe(1000);
    expect(result.current.sessionBestSpeed).toBe(500);
  });
});
