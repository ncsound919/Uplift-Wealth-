import { useEffect, useMemo, useRef } from 'react';
import { useQuizGameStore } from './quizGameStore';
import { QuizAnalyticsEngine } from './quizAnalytics';

export function useQuizTimer() {
  const tick = useQuizGameStore(s => s.tick);
  const timerActive = useQuizGameStore(s => s.timerActive);
  const gameOver = useQuizGameStore(s => s.gameOver);
  const isAnswered = useQuizGameStore(s => s.isAnswered);
  const isLockingIn = useQuizGameStore(s => s.isLockingIn);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (gameOver || isAnswered || isLockingIn || !timerActive) {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = window.setInterval(() => tick(), 1000);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [tick, timerActive, gameOver, isAnswered, isLockingIn]);
}

export function useQuizDerived() {
  const currentQuestionIndex = useQuizGameStore(s => s.currentQuestionIndex);
  const quizBank = useQuizGameStore(s => s.quizBank);
  const lifelines = useQuizGameStore(s => s.lifelines);
  const sessionAnswers = useQuizGameStore(s => s.sessionAnswers);
  const correctCount = useQuizGameStore(s => s.correctCount);
  const timeLeft = useQuizGameStore(s => s.timeLeft);
  const gameMode = useQuizGameStore(s => s.gameMode);
  const currentTierIndex = useQuizGameStore(s => s.currentTierIndex);

  return useMemo(() => {
    const question = quizBank[currentQuestionIndex] ?? null;
    const progressPct = quizBank.length ? ((currentQuestionIndex + 1) / quizBank.length) * 100 : 0;
    const remainingLifelines = Object.values(lifelines).filter(Boolean).length;
    const accuracyPct = sessionAnswers.length ? (correctCount / sessionAnswers.length) * 100 : 0;
    const timePressure = timeLeft <= 5 ? 'critical' : timeLeft <= 10 ? 'warning' : 'normal';
    return {
      question,
      progressPct,
      remainingLifelines,
      accuracyPct,
      timePressure,
      isGrandPrizeQuestion: gameMode === 'millionaire' && currentTierIndex === 14,
    };
  }, [currentQuestionIndex, quizBank, lifelines, sessionAnswers, correctCount, timeLeft, gameMode, currentTierIndex]);
}

export function useQuizAudio(soundEnabled: boolean) {
  useEffect(() => {
    // Audio engine adapter hook
  }, [soundEnabled]);
}

export function useResultsDashboard() {
  const sessionAnswers = useQuizGameStore(s => s.sessionAnswers);
  const maxStreak = useQuizGameStore(s => s.maxStreak);
  const categoryStats = useQuizGameStore(s => s.categoryStats);
  const sessionBestMillionaire = useQuizGameStore(s => s.sessionBestMillionaire);
  const sessionBestSpeed = useQuizGameStore(s => s.sessionBestSpeed);

  const analytics = useMemo(() => {
    return QuizAnalyticsEngine.fromAnswers(sessionAnswers, maxStreak);
  }, [sessionAnswers, maxStreak]);

  return useMemo(() => ({
    analytics,
    categoryStats,
    sessionBestMillionaire,
    sessionBestSpeed,
  }), [analytics, categoryStats, sessionBestMillionaire, sessionBestSpeed]);
}
