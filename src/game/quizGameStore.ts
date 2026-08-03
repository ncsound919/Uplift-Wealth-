import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ExtendedQuizQuestion, GameMode, LifelinesState, SessionAnswer, CategoryStat } from './quizTypes';
import { buildMillionaireQueue, buildSpeedQueue, create5050, createAudiencePoll, createExpertAdvice, MONEY_LADDER, scoreSpeedQuestion, safePrizeForTier } from './quizEngine';
import { QuizAnalyticsEngine } from './quizAnalytics';

interface QuizStoreState {
  masterBank: ExtendedQuizQuestion[];
  quizBank: ExtendedQuizQuestion[];
  gameMode: GameMode;
  currentQuestionIndex: number;
  currentTierIndex: number;
  score: number;
  streak: number;
  maxStreak: number;
  correctCount: number;
  timeLeft: number;
  timerActive: boolean;
  soundEnabled: boolean;
  gameOver: boolean;
  isAnswered: boolean;
  isLockingIn: boolean;
  selectedOption: number | null;
  pendingOption: number | null;
  disabledOptions: number[];
  safeHavenPrize: string;
  accumulatedPrize: string;
  isWalkedAway: boolean;
  tierPlayedForOnLoss: string | null;
  lifelines: LifelinesState;
  doubleDipActive: boolean;
  doubleDipUsedGuess: number | null;
  audiencePoll: number[];
  expertAdvice: { name: string; title: string; quote: string; confidence: number } | null;
  sessionAnswers: SessionAnswer[];
  categoryStats: Record<string, CategoryStat>;
  sessionBestMillionaire: number;
  sessionBestSpeed: number;
  log: string[];

  setMasterBank: (bank: ExtendedQuizQuestion[]) => void;
  setGameMode: (mode: GameMode) => void;
  startSession: (mode?: GameMode) => void;
  tick: () => void;
  setPendingOption: (index: number | null) => void;
  lockAnswer: () => { correct: boolean; gameOver: boolean } | null;
  nextQuestion: () => void;
  walkAway: () => void;
  use5050: () => void;
  useAskAudience: () => void;
  usePhoneExpert: () => void;
  useDoubleDip: () => void;
  setSoundEnabled: (enabled: boolean) => void;
  analytics: () => ReturnType<typeof QuizAnalyticsEngine.fromAnswers>;
}

const defaultLifelines: LifelinesState = { fiftyFifty: true, askAudience: true, phoneExpert: true, doubleDip: true };

export const useQuizGameStore = create<QuizStoreState>()(
  persist(
    (set, get) => ({
      masterBank: [],
      quizBank: [],
      gameMode: 'millionaire',
      currentQuestionIndex: 0,
      currentTierIndex: 0,
      score: 0,
      streak: 0,
      maxStreak: 0,
      correctCount: 0,
      timeLeft: 30,
      timerActive: true,
      soundEnabled: true,
      gameOver: false,
      isAnswered: false,
      isLockingIn: false,
      selectedOption: null,
      pendingOption: null,
      disabledOptions: [],
      safeHavenPrize: '$0',
      accumulatedPrize: '$0',
      isWalkedAway: false,
      tierPlayedForOnLoss: null,
      lifelines: defaultLifelines,
      doubleDipActive: false,
      doubleDipUsedGuess: null,
      audiencePoll: [],
      expertAdvice: null,
      sessionAnswers: [],
      categoryStats: {},
      sessionBestMillionaire: 0,
      sessionBestSpeed: 0,
      log: [],

      setMasterBank: (bank) => set({ masterBank: bank }),
      setGameMode: (mode) => set({ gameMode: mode }),

      startSession: (mode) => {
        const nextMode = mode ?? get().gameMode;
        const bank = get().masterBank;
        const quizBank = nextMode === 'millionaire' ? buildMillionaireQueue(bank) : buildSpeedQueue(bank, 20);
        set({
          gameMode: nextMode,
          quizBank,
          currentQuestionIndex: 0,
          currentTierIndex: 0,
          score: 0,
          streak: 0,
          maxStreak: 0,
          correctCount: 0,
          timeLeft: 30,
          timerActive: true,
          gameOver: false,
          isAnswered: false,
          isLockingIn: false,
          selectedOption: null,
          pendingOption: null,
          disabledOptions: [],
          safeHavenPrize: '$0',
          accumulatedPrize: '$0',
          isWalkedAway: false,
          tierPlayedForOnLoss: null,
          lifelines: defaultLifelines,
          doubleDipActive: false,
          doubleDipUsedGuess: null,
          audiencePoll: [],
          expertAdvice: null,
          sessionAnswers: [],
          categoryStats: {},
          log: [`Session started in ${nextMode} mode.`],
        });
      },

      tick: () => {
        const s = get();
        if (s.gameOver || s.isAnswered || s.isLockingIn || !s.timerActive) return;
        if (s.timeLeft <= 1) {
          const question = s.quizBank[s.currentQuestionIndex];
          const category = question?.category || 'General';
          const answeredAt = new Date().toISOString();
          set({
            timeLeft: 0,
            isAnswered: true,
            selectedOption: -1,
            streak: 0,
            timerActive: false,
            categoryStats: QuizAnalyticsEngine.mergeCategoryStats(s.categoryStats, category, false),
            sessionAnswers: question ? [...s.sessionAnswers, {
              questionId: question.id,
              category,
              selectedIndex: -1,
              correctIndex: question.correctIndex,
              correct: false,
              timeSpentSec: 30,
              mode: s.gameMode,
              tierIndex: s.currentTierIndex,
              pointsEarned: 0,
              answeredAt,
            }] : s.sessionAnswers,
            tierPlayedForOnLoss: s.gameMode === 'millionaire' ? MONEY_LADDER[s.currentTierIndex]?.prize ?? null : s.tierPlayedForOnLoss,
            gameOver: s.gameMode === 'millionaire',
            log: [`Time expired on question ${s.currentQuestionIndex + 1}.`, ...s.log].slice(0, 100),
          });
          return;
        }
        set({ timeLeft: s.timeLeft - 1 });
      },

      setPendingOption: (index) => set({ pendingOption: index }),

      lockAnswer: () => {
        const s = get();
        const question = s.quizBank[s.currentQuestionIndex];
        if (!question || s.pendingOption === null || s.isAnswered || s.isLockingIn) return null;

        if (s.doubleDipActive && s.doubleDipUsedGuess === null && s.pendingOption !== question.correctIndex) {
          set({
            doubleDipUsedGuess: s.pendingOption,
            disabledOptions: Array.from(new Set([...s.disabledOptions, s.pendingOption])),
            pendingOption: null,
            log: [`First Double Dip guess failed. One guess remains.`, ...s.log].slice(0, 100),
          });
          return { correct: false, gameOver: false };
        }

        const correct = s.pendingOption === question.correctIndex;
        const category = question.category || 'General';
        const timeSpentSec = 30 - s.timeLeft;
        let addedScore = 0;
        let nextSafe = s.safeHavenPrize;
        let nextAccumulated = s.accumulatedPrize;
        let nextTierPlayedForOnLoss = s.tierPlayedForOnLoss;
        let nextGameOver = false;
        let nextStreak = correct ? s.streak + 1 : 0;
        let nextMaxStreak = Math.max(s.maxStreak, nextStreak);
        let nextCorrectCount = s.correctCount + (correct ? 1 : 0);

        if (correct) {
          if (s.gameMode === 'millionaire') {
            const tier = MONEY_LADDER[s.currentTierIndex];
            addedScore = tier?.value ?? 0;
            nextAccumulated = tier?.prize ?? s.accumulatedPrize;
            nextSafe = tier?.safe ? tier.prize : s.safeHavenPrize;
          } else {
            addedScore = scoreSpeedQuestion(question.points, nextStreak);
          }
        } else if (s.gameMode === 'millionaire') {
          nextTierPlayedForOnLoss = MONEY_LADDER[s.currentTierIndex]?.prize ?? null;
          nextGameOver = true;
          nextSafe = safePrizeForTier(s.currentTierIndex);
        }

        const answer: SessionAnswer = {
          questionId: question.id,
          category,
          selectedIndex: s.pendingOption,
          correctIndex: question.correctIndex,
          correct,
          timeSpentSec,
          mode: s.gameMode,
          tierIndex: s.currentTierIndex,
          pointsEarned: addedScore,
          answeredAt: new Date().toISOString(),
        };

        set({
          score: s.score + addedScore,
          streak: nextStreak,
          maxStreak: nextMaxStreak,
          correctCount: nextCorrectCount,
          isAnswered: true,
          isLockingIn: false,
          selectedOption: s.pendingOption,
          timerActive: false,
          safeHavenPrize: nextSafe,
          accumulatedPrize: nextAccumulated,
          tierPlayedForOnLoss: nextTierPlayedForOnLoss,
          gameOver: nextGameOver,
          categoryStats: QuizAnalyticsEngine.mergeCategoryStats(s.categoryStats, category, correct),
          sessionAnswers: [...s.sessionAnswers, answer],
          log: [`${correct ? 'Correct' : 'Incorrect'} answer submitted for ${category}.`, ...s.log].slice(0, 100),
        });

        return { correct, gameOver: nextGameOver };
      },

      nextQuestion: () => {
        const s = get();
        const last = s.currentQuestionIndex >= s.quizBank.length - 1;
        if (last) {
          const millionaireBest = s.gameMode === 'millionaire' ? Math.max(s.sessionBestMillionaire, MONEY_LADDER[Math.min(s.currentTierIndex, MONEY_LADDER.length - 1)]?.value ?? 0) : s.sessionBestMillionaire;
          const speedBest = s.gameMode === 'speed' ? Math.max(s.sessionBestSpeed, s.score) : s.sessionBestSpeed;
          set({ gameOver: true, sessionBestMillionaire: millionaireBest, sessionBestSpeed: speedBest });
          return;
        }
        set({
          currentQuestionIndex: s.currentQuestionIndex + 1,
          currentTierIndex: s.gameMode === 'millionaire' ? s.currentTierIndex + 1 : s.currentTierIndex,
          timeLeft: 30,
          timerActive: true,
          isAnswered: false,
          selectedOption: null,
          pendingOption: null,
          disabledOptions: [],
          audiencePoll: [],
          expertAdvice: null,
          doubleDipActive: false,
          doubleDipUsedGuess: null,
        });
      },

      walkAway: () => {
        const s = get();
        const currentValue = MONEY_LADDER[Math.max(0, s.currentTierIndex - 1)]?.value ?? 0;
        set({
          isWalkedAway: true,
          gameOver: true,
          sessionBestMillionaire: Math.max(s.sessionBestMillionaire, currentValue),
          log: [`Player walked away with ${s.accumulatedPrize}.`, ...s.log].slice(0, 100),
        });
      },

      use5050: () => {
        const s = get();
        const question = s.quizBank[s.currentQuestionIndex];
        if (!question || !s.lifelines.fiftyFifty || s.isAnswered) return;
        const remove = create5050(question, s.disabledOptions);
        set({
          disabledOptions: Array.from(new Set([...s.disabledOptions, ...remove])),
          lifelines: { ...s.lifelines, fiftyFifty: false },
        });
      },

      useAskAudience: () => {
        const s = get();
        const question = s.quizBank[s.currentQuestionIndex];
        if (!question || !s.lifelines.askAudience || s.isAnswered) return;
        const poll = createAudiencePoll(question, s.disabledOptions);
        set({ audiencePoll: poll.values, lifelines: { ...s.lifelines, askAudience: false } });
      },

      usePhoneExpert: () => {
        const s = get();
        const question = s.quizBank[s.currentQuestionIndex];
        if (!question || !s.lifelines.phoneExpert || s.isAnswered) return;
        set({ expertAdvice: createExpertAdvice(question), lifelines: { ...s.lifelines, phoneExpert: false } });
      },

      useDoubleDip: () => {
        const s = get();
        if (!s.lifelines.doubleDip || s.isAnswered || s.currentTierIndex < 10) return;
        set({
          doubleDipActive: true,
          doubleDipUsedGuess: null,
          lifelines: { ...s.lifelines, doubleDip: false },
        });
      },

      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      analytics: () => QuizAnalyticsEngine.fromAnswers(get().sessionAnswers, get().maxStreak),
    }),
    {
      name: 'pop-quiz-game-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        soundEnabled: s.soundEnabled,
        sessionBestMillionaire: s.sessionBestMillionaire,
        sessionBestSpeed: s.sessionBestSpeed,
      }),
    }
  )
);
