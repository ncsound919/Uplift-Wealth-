import { describe, it, expect, beforeEach } from 'vitest';
import { useQuizGameStore } from './quizGameStore';
import { ExtendedQuizQuestion } from './quizTypes';

const makeQ = (id: string, category = 'test', correctIndex = 0): ExtendedQuizQuestion => ({
  id, category,
  question: `Q: ${id}?`,
  options: ['Answer A', 'Answer B', 'Answer C', 'Answer D'],
  correctIndex,
  explanation: `${id} explanation`,
  points: 100,
  difficulty: 'beginner',
});

const sampleBank: ExtendedQuizQuestion[] = Array.from({ length: 20 }, (_, i) =>
  makeQ(`q${i}`, i < 5 ? 'basic' : i < 12 ? 'intermediate' : 'advanced', 0)
);

describe('quizGameStore', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('quiz-game-store');
    }
    useQuizGameStore.getState().setMasterBank([]);
  });

  describe('initial state', () => {
    it('has default values', () => {
      const s = useQuizGameStore.getState();
      expect(s.gameMode).toBe('millionaire');
      expect(s.score).toBe(0);
      expect(s.streak).toBe(0);
      expect(s.currentQuestionIndex).toBe(0);
      expect(s.gameOver).toBe(false);
    });

    it('has all lifelines available', () => {
      const s = useQuizGameStore.getState();
      expect(s.lifelines.fiftyFifty).toBe(true);
      expect(s.lifelines.askAudience).toBe(true);
      expect(s.lifelines.phoneExpert).toBe(true);
      expect(s.lifelines.doubleDip).toBe(true);
    });
  });

  describe('setMasterBank', () => {
    it('stores the question bank', () => {
      useQuizGameStore.getState().setMasterBank(sampleBank);
      expect(useQuizGameStore.getState().masterBank.length).toBe(20);
    });
  });

  describe('setGameMode', () => {
    it('switches between millionaire and speed', () => {
      useQuizGameStore.getState().setGameMode('speed');
      expect(useQuizGameStore.getState().gameMode).toBe('speed');
      useQuizGameStore.getState().setGameMode('millionaire');
      expect(useQuizGameStore.getState().gameMode).toBe('millionaire');
    });
  });

  describe('startSession', () => {
    it('builds a quiz bank and resets state', () => {
      const store = useQuizGameStore.getState();
      store.setMasterBank(sampleBank);
      store.startSession('millionaire');

      const s = useQuizGameStore.getState();
      expect(s.quizBank.length).toBeGreaterThan(0);
      expect(s.score).toBe(0);
      expect(s.currentQuestionIndex).toBe(0);
      expect(s.gameOver).toBe(false);
      expect(s.log.length).toBeGreaterThan(0);
    });

    it('starts speed mode with 20 questions', () => {
      useQuizGameStore.getState().setMasterBank(sampleBank);
      useQuizGameStore.getState().startSession('speed');
      expect(useQuizGameStore.getState().quizBank.length).toBe(20);
    });
  });

  describe('setPendingOption', () => {
    it('sets the pending option index', () => {
      const store = useQuizGameStore.getState();
      store.setMasterBank(sampleBank);
      store.startSession('millionaire');
      store.setPendingOption(2);
      expect(useQuizGameStore.getState().pendingOption).toBe(2);
    });
  });

  describe('lockAnswer', () => {
    it('returns null when pendingOption is null', () => {
      const store = useQuizGameStore.getState();
      store.setMasterBank(sampleBank);
      store.startSession('millionaire');
      const result = store.lockAnswer();
      expect(result).toBeNull();
    });

    it('locks in selected correct answer', () => {
      const store = useQuizGameStore.getState();
      store.setMasterBank(sampleBank);
      store.startSession('millionaire');
      store.setPendingOption(0);

      const result = store.lockAnswer();
      expect(result).not.toBeNull();
      expect(result!.correct).toBe(true);
      expect(result!.gameOver).toBe(false);
    });

    it('correct answer advances score and streak', () => {
      const store = useQuizGameStore.getState();
      store.setMasterBank(sampleBank);
      store.startSession('millionaire');
      store.setPendingOption(0);
      store.lockAnswer();

      const s = useQuizGameStore.getState();
      expect(s.correctCount).toBe(1);
      expect(s.streak).toBe(1);
      expect(s.score).toBe(100);
    });

    it('wrong answer in millionaire mode ends game', () => {
      const store = useQuizGameStore.getState();
      store.setMasterBank(sampleBank);
      store.startSession('millionaire');
      store.setPendingOption(1);

      const result = store.lockAnswer();
      expect(result).toEqual({ correct: false, gameOver: true });

      const s = useQuizGameStore.getState();
      expect(s.gameOver).toBe(true);
      expect(s.tierPlayedForOnLoss).toBe('$100');
    });

    it('correct answer then nextQuestion advances tierIndex in millionaire', () => {
      const store = useQuizGameStore.getState();
      store.setMasterBank(sampleBank);
      store.startSession('millionaire');
      expect(useQuizGameStore.getState().currentTierIndex).toBe(0);

      store.setPendingOption(0);
      store.lockAnswer();
      store.nextQuestion();

      expect(useQuizGameStore.getState().currentTierIndex).toBe(1);
    });

    it('correct answer in speed mode scores points based on streak', () => {
      const store = useQuizGameStore.getState();
      store.setMasterBank(sampleBank);
      store.startSession('speed');

      store.setPendingOption(0);
      store.lockAnswer();

      const s = useQuizGameStore.getState();
      expect(s.score).toBeGreaterThan(0);
      expect(s.streak).toBe(1);
    });
  });

  describe('nextQuestion', () => {
    it('advances question index', () => {
      const store = useQuizGameStore.getState();
      store.setMasterBank(sampleBank);
      store.startSession('millionaire');
      expect(useQuizGameStore.getState().currentQuestionIndex).toBe(0);

      store.setPendingOption(0);
      store.lockAnswer();
      store.nextQuestion();

      expect(useQuizGameStore.getState().currentQuestionIndex).toBe(1);
    });

    it('at last question triggers gameOver with best score tracking', () => {
      const smallBank: ExtendedQuizQuestion[] = [makeQ('q1'), makeQ('q2')];
      const store = useQuizGameStore.getState();
      store.setMasterBank(smallBank);
      store.startSession('millionaire');

      store.setPendingOption(0);
      store.lockAnswer();
      store.nextQuestion();

      expect(useQuizGameStore.getState().gameOver).toBe(false);

      store.setPendingOption(0);
      store.lockAnswer();
      store.nextQuestion();

      const s = useQuizGameStore.getState();
      expect(s.gameOver).toBe(true);
      expect(s.sessionBestMillionaire).toBeGreaterThan(0);
    });
  });

  describe('tick', () => {
    it('decrements timeLeft', () => {
      const store = useQuizGameStore.getState();
      store.setMasterBank(sampleBank);
      store.startSession('millionaire');
      const timeBefore = useQuizGameStore.getState().timeLeft;
      store.tick();
      expect(useQuizGameStore.getState().timeLeft).toBeLessThan(timeBefore);
    });

    it('handles timeLeft=0 correctly with game over in millionaire mode', () => {
      const store = useQuizGameStore.getState();
      store.setMasterBank(sampleBank);
      store.startSession('millionaire');
      useQuizGameStore.setState({ timeLeft: 1 });
      store.tick();

      const s = useQuizGameStore.getState();
      expect(s.timeLeft).toBe(0);
      expect(s.isAnswered).toBe(true);
      expect(s.selectedOption).toBe(-1);
      expect(s.streak).toBe(0);
      expect(s.timerActive).toBe(false);
      expect(s.gameOver).toBe(true);
      expect(s.tierPlayedForOnLoss).toBe('$100');
    });

    it('is a no-op when the game is already over', () => {
      const store = useQuizGameStore.getState();
      store.setMasterBank(sampleBank);
      store.startSession('millionaire');
      useQuizGameStore.setState({ gameOver: true, timeLeft: 12 });
      store.tick();
      expect(useQuizGameStore.getState().timeLeft).toBe(12);
    });
  });

  describe('lifelines', () => {
    it('use5050 disables two wrong options', () => {
      const store = useQuizGameStore.getState();
      store.setMasterBank(sampleBank);
      store.startSession('millionaire');
      store.setPendingOption(0);

      const before = useQuizGameStore.getState().disabledOptions.length;
      store.use5050();

      const after = useQuizGameStore.getState().disabledOptions.length;
      expect(after).toBeGreaterThan(before);
      expect(useQuizGameStore.getState().lifelines.fiftyFifty).toBe(false);
    });

    it('use5050 is no-op when no lifelines left', () => {
      const store = useQuizGameStore.getState();
      store.setMasterBank(sampleBank);
      store.startSession('millionaire');
      useQuizGameStore.setState({ lifelines: { ...useQuizGameStore.getState().lifelines, fiftyFifty: false } });
      store.setPendingOption(0);

      const disabledBefore = useQuizGameStore.getState().disabledOptions.length;
      store.use5050();

      expect(useQuizGameStore.getState().disabledOptions.length).toBe(disabledBefore);
      expect(useQuizGameStore.getState().lifelines.fiftyFifty).toBe(false);
    });

    it('useAskAudience generates poll results', () => {
      const store = useQuizGameStore.getState();
      store.setMasterBank(sampleBank);
      store.startSession('millionaire');
      store.setPendingOption(0);
      store.useAskAudience();

      const poll = useQuizGameStore.getState().audiencePoll;
      expect(poll.length).toBeGreaterThan(0);
      expect(useQuizGameStore.getState().lifelines.askAudience).toBe(false);
    });

    it('useAskAudience is no-op when no lifelines left', () => {
      const store = useQuizGameStore.getState();
      store.setMasterBank(sampleBank);
      store.startSession('millionaire');
      useQuizGameStore.setState({ lifelines: { ...useQuizGameStore.getState().lifelines, askAudience: false } });
      store.setPendingOption(0);

      store.useAskAudience();

      expect(useQuizGameStore.getState().audiencePoll).toEqual([]);
      expect(useQuizGameStore.getState().lifelines.askAudience).toBe(false);
    });

    it('usePhoneExpert returns advice', () => {
      const store = useQuizGameStore.getState();
      store.setMasterBank(sampleBank);
      store.startSession('millionaire');
      store.setPendingOption(0);
      store.usePhoneExpert();

      const advice = useQuizGameStore.getState().expertAdvice;
      expect(advice).not.toBeNull();
      expect(advice?.name).toBeTruthy();
      expect(useQuizGameStore.getState().lifelines.phoneExpert).toBe(false);
    });

    it('usePhoneExpert is no-op when no lifelines left', () => {
      const store = useQuizGameStore.getState();
      store.setMasterBank(sampleBank);
      store.startSession('millionaire');
      useQuizGameStore.setState({ lifelines: { ...useQuizGameStore.getState().lifelines, phoneExpert: false } });
      store.setPendingOption(0);

      store.usePhoneExpert();

      expect(useQuizGameStore.getState().expertAdvice).toBeNull();
      expect(useQuizGameStore.getState().lifelines.phoneExpert).toBe(false);
    });

    it('useDoubleDip is gated on tier index >= 10', () => {
      const store = useQuizGameStore.getState();
      store.setMasterBank(sampleBank);
      store.startSession('millionaire');
      store.setPendingOption(0);
      store.useDoubleDip();

      expect(useQuizGameStore.getState().lifelines.doubleDip).toBe(true);
      expect(useQuizGameStore.getState().doubleDipActive).toBe(false);
    });

    it('useDoubleDip works when tier >= 10', () => {
      const store = useQuizGameStore.getState();
      store.setMasterBank(sampleBank);
      store.startSession('millionaire');
      useQuizGameStore.setState({ currentTierIndex: 10 });
      store.setPendingOption(0);
      store.useDoubleDip();

      expect(useQuizGameStore.getState().lifelines.doubleDip).toBe(false);
      expect(useQuizGameStore.getState().doubleDipActive).toBe(true);
    });

    it('doubleDip: first wrong guess does not end game, second does', () => {
      const store = useQuizGameStore.getState();
      store.setMasterBank(sampleBank);
      store.startSession('millionaire');
      useQuizGameStore.setState({ currentTierIndex: 10 });
      store.setPendingOption(0);
      store.useDoubleDip();
      expect(useQuizGameStore.getState().doubleDipActive).toBe(true);

      store.setPendingOption(1);
      const firstResult = store.lockAnswer();
      expect(firstResult).toEqual({ correct: false, gameOver: false });
      expect(useQuizGameStore.getState().doubleDipUsedGuess).toBe(1);
      expect(useQuizGameStore.getState().gameOver).toBe(false);

      store.setPendingOption(2);
      const secondResult = store.lockAnswer();
      expect(secondResult).toEqual({ correct: false, gameOver: true });
      expect(useQuizGameStore.getState().gameOver).toBe(true);
    });
  });

  describe('walkAway', () => {
    it('ends game and records accumulated prize', () => {
      const store = useQuizGameStore.getState();
      store.setMasterBank(sampleBank);
      store.setGameMode('millionaire');
      useQuizGameStore.setState({ sessionBestMillionaire: 0 });
      store.startSession('millionaire');
      store.walkAway();

      const s = useQuizGameStore.getState();
      expect(s.isWalkedAway).toBe(true);
      expect(s.gameOver).toBe(true);
      expect(s.sessionBestMillionaire).toBeGreaterThan(0);
    });
  });

  describe('setSoundEnabled', () => {
    it('toggles sound', () => {
      useQuizGameStore.getState().setSoundEnabled(false);
      expect(useQuizGameStore.getState().soundEnabled).toBe(false);
      useQuizGameStore.getState().setSoundEnabled(true);
      expect(useQuizGameStore.getState().soundEnabled).toBe(true);
    });
  });

  describe('analytics', () => {
    it('returns QuizAnalytics from session answers', () => {
      const store = useQuizGameStore.getState();
      store.setMasterBank(sampleBank);
      store.startSession('millionaire');
      store.setPendingOption(0);
      store.lockAnswer();

      const result = useQuizGameStore.getState().analytics();
      expect(result.totalAnswered).toBe(1);
      expect(result.correctCount).toBe(1);
      expect(result.accuracyPct).toBe(100);
      expect(result.totalPoints).toBe(100);
      expect(result.missedQuestionIds).toEqual([]);
    });
  });
});
