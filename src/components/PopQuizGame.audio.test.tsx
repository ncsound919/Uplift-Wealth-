import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { PopQuizGame } from './PopQuizGame';
import { useQuizGameStore } from '../game/quizGameStore';
import { useQuizDerived, useResultsDashboard } from '../game/quizHooks';

// NOTE: This test file intentionally does NOT mock window.AudioContext so that the
// QuizAudioEngine.initCtx() leaves `ctx` null, exercising the `if (!this.ctx) return;`
// guard paths inside each audio playback method.

const { mockQuestion } = vi.hoisted(() => ({
  mockQuestion: {
    id: 'q1',
    category: 'Risk',
    points: 100,
    explanation: 'Risk is the possibility of losing money.',
    question: 'What is risk?',
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correctIndex: 0,
  },
}));

vi.mock('motion/react', () => {
  const Div = require('react').forwardRef(({ children, ...props }: any, ref: any) => (
    <div ref={ref} {...props}>{children}</div>
  ));
  Div.displayName = 'MotionDiv';
  return {
    motion: new Proxy({}, { get: () => Div }),
    AnimatePresence: ({ children }: any) => <div>{children}</div>,
  };
});
vi.mock('canvas-confetti', () => ({ default: vi.fn() }));
vi.mock('./DiagramRenderer', () => ({ DiagramRenderer: () => <div data-testid="diagram-mock">Diagram</div> }));
vi.mock('../game/quizEngine', () => ({ MONEY_LADDER: [] }));
vi.mock('../game/quizGameStore', () => ({ useQuizGameStore: vi.fn() }));
vi.mock('../game/quizHooks', () => ({
  useQuizTimer: vi.fn(),
  useQuizDerived: vi.fn(),
  useResultsDashboard: vi.fn(),
}));

function createStore(overrides: Record<string, any> = {}) {
  return {
    masterBank: [mockQuestion],
    quizBank: [mockQuestion],
    gameMode: 'millionaire',
    currentQuestionIndex: 0,
    currentTierIndex: 0,
    score: 0,
    streak: 0,
    maxStreak: 0,
    correctCount: 0,
    timeLeft: 30,
    soundEnabled: true,
    gameOver: false,
    isAnswered: false,
    selectedOption: null,
    pendingOption: null,
    disabledOptions: [],
    safeHavenPrize: '$0',
    accumulatedPrize: '$0',
    isWalkedAway: false,
    lifelines: { fiftyFifty: true, askAudience: true, phoneExpert: true },
    audiencePoll: [40, 30, 20, 10],
    expertAdvice: null,
    setMasterBank: vi.fn(),
    startSession: vi.fn(),
    setPendingOption: vi.fn(),
    lockAnswer: vi.fn().mockReturnValue({ correct: true, gameOver: false }),
    nextQuestion: vi.fn(),
    walkAway: vi.fn(),
    use5050: vi.fn(),
    useAskAudience: vi.fn(),
    usePhoneExpert: vi.fn(),
    setSoundEnabled: vi.fn(),
    ...overrides,
  };
}

function mockStore(overrides: Record<string, any> = {}) {
  const state = createStore(overrides);
  vi.mocked(useQuizGameStore).mockImplementation((sel: any) => (sel ? sel(state) : state));
  return state;
}

function mockDerived(overrides: Record<string, any> = {}) {
  vi.mocked(useQuizDerived).mockReturnValue({ question: mockQuestion, ...overrides } as any);
}

function mockDashboard(overrides: Record<string, any> = {}) {
  vi.mocked(useResultsDashboard).mockReturnValue({
    analytics: { accuracyPct: 0 } as any,
    categoryStats: {},
    sessionBestMillionaire: 0 as any,
    sessionBestSpeed: 0,
    ...overrides,
  });
}

function renderGame() {
  return render(<PopQuizGame onComplete={vi.fn()} onExit={vi.fn()} />);
}

function getLockButton() {
  const lockBtns = screen.getAllByText(/Lock In Final Answer/i);
  return lockBtns.find(el => el.tagName === 'BUTTON') || lockBtns[lockBtns.length - 1].closest('button')!;
}

describe('PopQuizGame Audio - no AudioContext (ctx === null)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete (window as any).AudioContext;
    mockDerived();
    mockDashboard();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('early-returns from tick, lock-in, lifeline, and wrong audio when ctx is null', () => {
    const lockAnswer = vi.fn().mockReturnValue({ correct: false, gameOver: false });
    mockStore({ timeLeft: 3, lockAnswer, pendingOption: 0 });
    vi.useFakeTimers();
    renderGame();
    expect(screen.getByText('3s')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Option A'));
    fireEvent.click(screen.getByText('50 : 50'));
    fireEvent.click(getLockButton());
    act(() => { vi.advanceTimersByTime(1300); });
    expect(lockAnswer).toHaveBeenCalled();
  });

  it('early-returns from playCorrect when ctx is null', () => {
    const lockAnswer = vi.fn().mockReturnValue({ correct: true, gameOver: false });
    mockStore({ timeLeft: 30, lockAnswer, pendingOption: 0 });
    vi.useFakeTimers();
    renderGame();
    fireEvent.click(getLockButton());
    act(() => { vi.advanceTimersByTime(1300); });
    expect(lockAnswer).toHaveBeenCalled();
  });
});
