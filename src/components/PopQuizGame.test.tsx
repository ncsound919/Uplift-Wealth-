import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { PopQuizGame } from './PopQuizGame';
import { useQuizGameStore } from '../game/quizGameStore';
import { useQuizDerived, useResultsDashboard } from '../game/quizHooks';

const { mockQuestion, mockDiagramQuestion, mockMoneyLadder } = vi.hoisted(() => ({
  mockQuestion: {
    id: 'q1',
    category: 'Risk',
    points: 100,
    explanation: 'Risk is the possibility of losing money.',
    question: 'What is risk?',
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correctIndex: 0,
  },
  mockDiagramQuestion: {
    id: 'q-diag',
    category: 'Risk',
    points: 100,
    explanation: 'Risk diagram.',
    question: 'What is risk?',
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correctIndex: 0,
    diagram: { type: 'flow', title: 'Risk Flow', nodes: [{ label: 'Start' }, { label: 'End' }] },
  },
  mockMoneyLadder: [
    { level: 1, prize: '$100', value: 100, safe: false },
    { level: 2, prize: '$200', value: 200, safe: false },
    { level: 3, prize: '$300', value: 300, safe: false },
    { level: 4, prize: '$500', value: 500, safe: false },
    { level: 5, prize: '$1,000', value: 1000, safe: true },
    { level: 6, prize: '$2,000', value: 2000, safe: false },
    { level: 7, prize: '$4,000', value: 4000, safe: false },
    { level: 8, prize: '$8,000', value: 8000, safe: false },
    { level: 9, prize: '$16,000', value: 16000, safe: false },
    { level: 10, prize: '$32,000', value: 32000, safe: true },
    { level: 11, prize: '$64,000', value: 64000, safe: false },
    { level: 12, prize: '$125,000', value: 125000, safe: false },
    { level: 13, prize: '$250,000', value: 250000, safe: false },
    { level: 14, prize: '$500,000', value: 500000, safe: false },
    { level: 15, prize: '$1,000,000', value: 1000000, safe: true },
  ],
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
vi.mock('../game/quizEngine', () => ({ MONEY_LADDER: mockMoneyLadder }));
vi.mock('../game/quizGameStore', () => ({ useQuizGameStore: vi.fn() }));
vi.mock('../game/quizHooks', () => ({
  useQuizTimer: vi.fn(),
  useQuizDerived: vi.fn(),
  useResultsDashboard: vi.fn(),
}));

function mockAudioContext() {
  const makeOsc = () => ({
    type: '',
    frequency: { value: 440, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
    connect: vi.fn().mockReturnThis(),
    start: vi.fn(),
    stop: vi.fn(),
  });
  const makeGain = () => ({
    gain: { value: 0, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
    connect: vi.fn(),
  });
  let instanceCount = 0;
  const mockCtx = {
    currentTime: 0,
    createOscillator: vi.fn(makeOsc),
    createGain: vi.fn(makeGain),
    destination: 'mock-dest',
    state: 'suspended',
    resume: vi.fn().mockResolvedValue(undefined),
  };
  (window as any).AudioContext = vi.fn(function () {
    instanceCount++;
    return mockCtx;
  });
  return mockCtx;
}

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

describe('PopQuizGame', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAudioContext();
    mockDerived();
    mockDashboard();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Loading State', () => {
    it('shows loading spinner when quiz bank is empty', () => {
      mockStore({ quizBank: [] });
      mockDerived({ question: null });
      renderGame();
      expect(screen.getByText(/Preparing TV Studio Game Show questions/i)).toBeInTheDocument();
    });

    it('shows loading spinner when question is null', () => {
      mockStore({ quizBank: [mockQuestion] });
      mockDerived({ question: null });
      renderGame();
      expect(screen.getByText(/Preparing TV Studio Game Show questions/i)).toBeInTheDocument();
    });

    it('calls setMasterBank when master bank is empty', () => {
      const setMasterBank = vi.fn();
      mockStore({ masterBank: [], quizBank: [], setMasterBank });
      mockDerived({ question: null });
      renderGame();
      expect(setMasterBank).toHaveBeenCalled();
    });
  });

  describe('Rendering - Active Game', () => {
    it('renders the game title', () => {
      mockStore();
      renderGame();
      expect(screen.getByText(/Who Wants to Be a FinTech Founder/i)).toBeInTheDocument();
    });

    it('renders the question text', () => {
      mockStore();
      renderGame();
      expect(screen.getByText(mockQuestion.question)).toBeInTheDocument();
    });

    it('renders all answer options', () => {
      mockStore();
      renderGame();
      for (const opt of mockQuestion.options) {
        expect(screen.getByText(opt)).toBeInTheDocument();
      }
    });

    it('renders letter labels A, B, C, D for options', () => {
      mockStore();
      renderGame();
      expect(screen.getByText('A')).toBeInTheDocument();
      expect(screen.getByText('B')).toBeInTheDocument();
      expect(screen.getByText('C')).toBeInTheDocument();
      expect(screen.getByText('D')).toBeInTheDocument();
    });

    it('renders the countdown timer', () => {
      mockStore({ timeLeft: 30 });
      renderGame();
      expect(screen.getByText('30s')).toBeInTheDocument();
    });

    it('renders question number and total', () => {
      mockStore({ currentQuestionIndex: 0, quizBank: [mockQuestion, mockQuestion] });
      renderGame();
      expect(screen.getByText(/Q 1 \/ 2/)).toBeInTheDocument();
    });

    it('renders the category label', () => {
      mockStore();
      renderGame();
      expect(screen.getByText(mockQuestion.category)).toBeInTheDocument();
    });

    it('renders TV Millionaire mode badge', () => {
      mockStore({ gameMode: 'millionaire' });
      renderGame();
      expect(screen.getByText(/TV Millionaire Rules/i)).toBeInTheDocument();
    });

    it('renders Speed Practice mode badge', () => {
      mockStore({ gameMode: 'speed' });
      renderGame();
      expect(screen.getByText(/Speed Practice/i)).toBeInTheDocument();
    });

    it('renders lifelines bar in millionaire mode', () => {
      mockStore();
      renderGame();
      expect(screen.getByText(/Studio Lifelines/i)).toBeInTheDocument();
      expect(screen.getByText('50 : 50')).toBeInTheDocument();
      expect(screen.getByText(/Audience Poll/i)).toBeInTheDocument();
      expect(screen.getByText(/Phone Expert/i)).toBeInTheDocument();
    });

    it('hides lifelines bar in speed mode', () => {
      mockStore({ gameMode: 'speed' });
      renderGame();
      expect(screen.queryByText(/Studio Lifelines/i)).not.toBeInTheDocument();
    });

    it('renders prize ladder', () => {
      mockStore();
      renderGame();
      expect(screen.getByText(/Prize Ladder/i)).toBeInTheDocument();
    });

    it('renders safe haven indicator', () => {
      mockStore({ safeHavenPrize: '$1,000' });
      renderGame();
      expect(screen.getByText(/Safe: \$1,000/)).toBeInTheDocument();
    });
  });

  describe('Rendering - Timer States', () => {
    it('applies critical styling when timer <= 5s', () => {
      mockStore({ timeLeft: 3 });
      renderGame();
      const timerContainer = screen.getByText('3s').parentElement;
      expect(timerContainer?.className).toContain('animate-pulse');
    });

    it('shows normal styling when timer > 5s', () => {
      mockStore({ timeLeft: 15 });
      renderGame();
      const timerContainer = screen.getByText('15s').parentElement;
      expect(timerContainer?.className).not.toContain('animate-pulse');
    });
  });

  describe('Rendering - Diagram', () => {
    it('renders diagram when question has diagram data', async () => {
      mockStore();
      mockDerived({ question: mockDiagramQuestion });
      renderGame();
      expect(await screen.findByTestId('diagram-mock')).toBeInTheDocument();
    });
  });

  describe('Option Selection', () => {
    it('calls setPendingOption when an option is clicked', () => {
      const setPendingOption = vi.fn();
      mockStore({ setPendingOption });
      renderGame();
      fireEvent.click(screen.getByText('Option A'));
      expect(setPendingOption).toHaveBeenCalledWith(0);
    });

    it('does not call setPendingOption when already answered', () => {
      const setPendingOption = vi.fn();
      mockStore({ isAnswered: true, setPendingOption });
      renderGame();
      fireEvent.click(screen.getByText('Option A'));
      expect(setPendingOption).not.toHaveBeenCalled();
    });

    it('does not call setPendingOption for disabled option', () => {
      const setPendingOption = vi.fn();
      mockStore({ disabledOptions: [0], setPendingOption });
      renderGame();
      const optionBtn = screen.getByText('Option A').closest('button');
      expect(optionBtn).toBeDisabled();
    });
  });

  describe('Lock In Flow', () => {
    it('shows lock in button disabled when no option selected', () => {
      mockStore({ pendingOption: null });
      renderGame();
      const lockBtns = screen.getAllByText(/Lock In Final Answer/i);
      const lockBtn = lockBtns.find(el => el.tagName === 'BUTTON') || lockBtns[lockBtns.length - 1].closest('button')!;
      expect(lockBtn).toBeDisabled();
    });

    it('shows lock in button enabled when option selected', () => {
      mockStore({ pendingOption: 0 });
      renderGame();
      const lockBtns = screen.getAllByText(/Lock In Final Answer/i);
      const lockBtn = lockBtns.find(el => el.tagName === 'BUTTON') || lockBtns[lockBtns.length - 1].closest('button')!;
      expect(lockBtn).not.toBeDisabled();
    });

    it('shows instruction to press lock in when pending', () => {
      mockStore({ pendingOption: 0 });
      renderGame();
      expect(screen.getByText(/Press "Lock In Final Answer" to confirm/i)).toBeInTheDocument();
    });

    it('shows select instruction when no option selected', () => {
      mockStore({ pendingOption: null, isAnswered: false });
      renderGame();
      expect(screen.getByText(/Select an option above to test your knowledge/i)).toBeInTheDocument();
    });

    it('calls lockAnswer after lock in and timeout', () => {
      const lockAnswer = vi.fn().mockReturnValue({ correct: true, gameOver: false });
      mockStore({ pendingOption: 0, lockAnswer });
      vi.useFakeTimers();
      renderGame();
      const lockBtns = screen.getAllByText(/Lock In Final Answer/i);
      const lockBtn = lockBtns.find(el => el.tagName === 'BUTTON') || lockBtns[lockBtns.length - 1].closest('button')!;
      fireEvent.click(lockBtn);
      expect(screen.getByText(/Locking in final answer/i)).toBeInTheDocument();
      act(() => { vi.advanceTimersByTime(1300); });
      expect(lockAnswer).toHaveBeenCalled();
    });

    it('does nothing on lock in when pendingOption is null', () => {
      const lockAnswer = vi.fn();
      mockStore({ pendingOption: null, lockAnswer });
      renderGame();
      const lockBtns = screen.getAllByText(/Lock In Final Answer/i);
      const lockBtn = lockBtns.find(el => el.tagName === 'BUTTON') || lockBtns[lockBtns.length - 1].closest('button')!;
      expect(lockBtn).toBeDisabled();
      fireEvent.click(lockBtn);
      expect(lockAnswer).not.toHaveBeenCalled();
    });

    it('calls lockAnswer with incorrect result and plays wrong audio', () => {
      const lockAnswer = vi.fn().mockReturnValue({ correct: false, gameOver: true });
      mockStore({ pendingOption: 2, lockAnswer });
      vi.useFakeTimers();
      renderGame();
      const lockBtns = screen.getAllByText(/Lock In Final Answer/i);
      const lockBtn = lockBtns.find(el => el.tagName === 'BUTTON') || lockBtns[lockBtns.length - 1].closest('button')!;
      fireEvent.click(lockBtn);
      expect(screen.getByText(/Locking in final answer/i)).toBeInTheDocument();
      act(() => { vi.advanceTimersByTime(1300); });
      expect(lockAnswer).toHaveBeenCalled();
    });
  });

  describe('Correct/Incorrect Feedback', () => {
    it('shows correct feedback when answer is correct', () => {
      mockStore({ isAnswered: true, selectedOption: 0, pendingOption: 0 });
      mockDerived({ question: mockQuestion });
      renderGame();
      expect(screen.getByText(/Correct Answer/i)).toBeInTheDocument();
    });

    it('shows incorrect feedback when answer is wrong', () => {
      mockStore({ isAnswered: true, selectedOption: 2, pendingOption: 2 });
      mockDerived({ question: mockQuestion });
      renderGame();
      expect(screen.getByText(/Incorrect Answer/i)).toBeInTheDocument();
    });

    it('shows explanation after answering', () => {
      mockStore({ isAnswered: true, selectedOption: 0 });
      mockDerived({ question: mockQuestion });
      renderGame();
      expect(screen.getByText(mockQuestion.explanation)).toBeInTheDocument();
    });

    it('shows proceed button after answering', () => {
      mockStore({ isAnswered: true, selectedOption: 0 });
      renderGame();
      expect(screen.getByText(/Proceed to Next Question/i)).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('calls nextQuestion on proceed', () => {
      const nextQuestion = vi.fn();
      mockStore({ isAnswered: true, selectedOption: 0, nextQuestion });
      renderGame();
      fireEvent.click(screen.getByText(/Proceed to Next Question/i));
      expect(nextQuestion).toHaveBeenCalled();
    });

    it('calls onExit when exit button is clicked', () => {
      const onExit = vi.fn();
      mockStore();
      render(<PopQuizGame onComplete={vi.fn()} onExit={onExit} />);
      const exitBtns = screen.getAllByTitle(/Exit Game/i);
      fireEvent.click(exitBtns[0]);
      expect(onExit).toHaveBeenCalled();
    });
  });

  describe('Walk Away', () => {
    it('calls walkAway when walk away button clicked', () => {
      const walkAway = vi.fn();
      mockStore({ currentTierIndex: 1, walkAway });
      renderGame();
      fireEvent.click(screen.getByText(/Walk Away/i));
      expect(walkAway).toHaveBeenCalled();
    });

    it('disables walk away at tier 0', () => {
      const walkAway = vi.fn();
      mockStore({ currentTierIndex: 0, walkAway });
      renderGame();
      const walkBtns = screen.getAllByText(/Walk Away/i);
      const walkBtn = walkBtns.find(el => el.tagName === 'BUTTON') || walkBtns[walkBtns.length - 1].closest('button')!;
      expect(walkBtn).toBeDisabled();
    });
  });

  describe('Lifelines', () => {
    it('calls use5050 on 50:50 click', () => {
      const use5050 = vi.fn();
      mockStore({ use5050 });
      renderGame();
      fireEvent.click(screen.getByText('50 : 50'));
      expect(use5050).toHaveBeenCalled();
    });

    it('calls useAskAudience and shows audience modal', () => {
      const useAskAudience = vi.fn();
      mockStore({ useAskAudience, audiencePoll: [45, 30, 15, 10] });
      renderGame();
      fireEvent.click(screen.getByText(/Audience Poll/i));
      expect(useAskAudience).toHaveBeenCalled();
      expect(screen.getByText(/FinTech Audience Poll/i)).toBeInTheDocument();
      expect(screen.getByText(/1,250 Studio Audience Votes/i)).toBeInTheDocument();
    });

    it('closes audience modal on close button', () => {
      const useAskAudience = vi.fn();
      mockStore({ useAskAudience, audiencePoll: [45, 30, 15, 10] });
      renderGame();
      fireEvent.click(screen.getByText(/Audience Poll/i));
      expect(screen.getByText(/FinTech Audience Poll/i)).toBeInTheDocument();
      fireEvent.click(screen.getByText(/Return to Stage/i));
      expect(screen.queryByText(/FinTech Audience Poll/i)).not.toBeInTheDocument();
    });

    it('closes audience modal via ✕ close button', () => {
      const useAskAudience = vi.fn();
      mockStore({ useAskAudience, audiencePoll: [45, 30, 15, 10] });
      renderGame();
      fireEvent.click(screen.getByText(/Audience Poll/i));
      expect(screen.getByText(/1,250 Studio Audience Votes/i)).toBeInTheDocument();
      fireEvent.click(screen.getByText(/✕ Close/i));
      expect(screen.queryByText(/FinTech Audience Poll/i)).not.toBeInTheDocument();
    });

    it('calls usePhoneExpert and shows expert modal', () => {
      const usePhoneExpert = vi.fn();
      const expertAdvice = { name: 'Dr. Expert', title: 'FinTech Guru', quote: 'Choose Option A', confidence: 90 };
      mockStore({ usePhoneExpert, expertAdvice });
      renderGame();
      fireEvent.click(screen.getByText(/Phone Expert/i));
      expect(usePhoneExpert).toHaveBeenCalled();
      expect(screen.getByText('Dr. Expert')).toBeInTheDocument();
      expect(screen.getByText(/Choose Option A/i)).toBeInTheDocument();
    });

    it('closes expert modal on thank you button', () => {
      const usePhoneExpert = vi.fn();
      const expertAdvice = { name: 'Dr. Expert', title: 'FinTech Guru', quote: 'Choose Option A', confidence: 90 };
      mockStore({ usePhoneExpert, expertAdvice });
      renderGame();
      fireEvent.click(screen.getByText(/Phone Expert/i));
      expect(screen.getByText('Dr. Expert')).toBeInTheDocument();
      fireEvent.click(screen.getByText(/Thank You, Expert/i));
      expect(screen.queryByText('Dr. Expert')).not.toBeInTheDocument();
    });

    it('closes expert modal via ✕ close button', () => {
      const usePhoneExpert = vi.fn();
      const expertAdvice = { name: 'Dr. Expert', title: 'FinTech Guru', quote: 'Choose Option A', confidence: 90 };
      mockStore({ usePhoneExpert, expertAdvice });
      renderGame();
      fireEvent.click(screen.getByText(/Phone Expert/i));
      expect(screen.getByText('Dr. Expert')).toBeInTheDocument();
      fireEvent.click(screen.getByText(/✕ Close/i));
      expect(screen.queryByText('Dr. Expert')).not.toBeInTheDocument();
    });

    it('disables used lifeline buttons', () => {
      mockStore({ lifelines: { fiftyFifty: false, askAudience: true, phoneExpert: true } });
      renderGame();
      const ffBtn = screen.getByText('50 : 50').closest('button');
      expect(ffBtn).toBeDisabled();
    });
  });

  describe('Sound & Mode Controls', () => {
    it('calls setSoundEnabled on volume toggle', () => {      const setSoundEnabled = vi.fn();
      mockStore({ soundEnabled: true, setSoundEnabled });
      renderGame();
      fireEvent.click(screen.getByTitle(/Mute Studio Audio/i));
      expect(setSoundEnabled).toHaveBeenCalledWith(false);
    });

    it('calls startSession on mode switch', () => {
      const startSession = vi.fn();
      mockStore({ gameMode: 'millionaire', startSession });
      renderGame();
      fireEvent.click(screen.getByText(/Switch to Speed Mode/i));
      expect(startSession).toHaveBeenCalledWith('speed');
    });

    it('shows mute icon when sound is on', () => {
      mockStore({ soundEnabled: true });
      renderGame();
      expect(screen.getByTitle(/Mute Studio Audio/i)).toBeInTheDocument();
    });

    it('shows unmute icon when sound is off', () => {
      mockStore({ soundEnabled: false });
      renderGame();
      expect(screen.getByTitle(/Enable Studio Audio/i)).toBeInTheDocument();
    });

    it('short-circuits audio playback methods when sound is disabled (wrong path)', () => {
      const lockAnswer = vi.fn().mockReturnValue({ correct: false, gameOver: false });
      mockStore({ soundEnabled: false, timeLeft: 3, lockAnswer, pendingOption: 0 });
      vi.useFakeTimers();
      renderGame();
      expect(screen.getByText('3s')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Option A'));
      fireEvent.click(screen.getByText('50 : 50'));
      const lockBtns = screen.getAllByText(/Lock In Final Answer/i);
      const lockBtn = lockBtns.find(el => el.tagName === 'BUTTON') || lockBtns[lockBtns.length - 1].closest('button')!;
      fireEvent.click(lockBtn);
      act(() => { vi.advanceTimersByTime(1300); });
      expect(lockAnswer).toHaveBeenCalled();
    });

    it('short-circuits playCorrect when sound is disabled (correct path)', () => {
      const lockAnswer = vi.fn().mockReturnValue({ correct: true, gameOver: false });
      mockStore({ soundEnabled: false, timeLeft: 30, lockAnswer, pendingOption: 0 });
      vi.useFakeTimers();
      renderGame();
      const lockBtns = screen.getAllByText(/Lock In Final Answer/i);
      const lockBtn = lockBtns.find(el => el.tagName === 'BUTTON') || lockBtns[lockBtns.length - 1].closest('button')!;
      fireEvent.click(lockBtn);
      act(() => { vi.advanceTimersByTime(1300); });
      expect(lockAnswer).toHaveBeenCalled();
    });
  });

  describe('Game Over - Default', () => {
    beforeEach(() => {
      mockStore({
        gameOver: true,
        isAnswered: true,
        selectedOption: 0,
        correctCount: 3,
        maxStreak: 2,
        score: 5000,
        safeHavenPrize: '$1,000',
        currentTierIndex: 4,
        isWalkedAway: false,
        quizBank: [mockQuestion, mockQuestion, mockQuestion],
      });
      mockDerived({ question: mockQuestion });
      mockDashboard({
        analytics: { accuracyPct: 75 },
        categoryStats: { Risk: { total: 2, correct: 1 } },
      });
    });

    it('shows game over screen', () => {
      renderGame();
      expect(screen.getByText(/SHOW COMPLETE/i)).toBeInTheDocument();
    });

    it('shows You Won with safe haven prize', () => {
      renderGame();
      expect(screen.getByText(/You Won \$1,000/i)).toBeInTheDocument();
    });

    it('shows correct count', () => {
      renderGame();
      expect(screen.getByText(/3 \/ 3/)).toBeInTheDocument();
    });

    it('shows max streak', () => {
      renderGame();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('shows accuracy percentage', () => {
      renderGame();
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('shows total winnings', () => {
      renderGame();
      expect(screen.getByText('1,000')).toBeInTheDocument();
    });

    it('shows category breakdown', () => {
      renderGame();
      expect(screen.getByText(/Category Mastery Breakdown/i)).toBeInTheDocument();
      expect(screen.getByText(/Risk/)).toBeInTheDocument();
      expect(screen.getByText(/1\/2 \(50%\)/)).toBeInTheDocument();
    });

    it('has Play TV Show Mode Again button that calls startSession', () => {
      const startSession = vi.fn();
      mockStore({
        gameOver: true, isAnswered: true, selectedOption: 0,
        correctCount: 3, maxStreak: 2, score: 5000,
        safeHavenPrize: '$1,000', currentTierIndex: 4,
        isWalkedAway: false, startSession,
      });
      renderGame();
      fireEvent.click(screen.getByText(/Play TV Show Mode Again/i));
      expect(startSession).toHaveBeenCalledWith('millionaire');
    });

    it('has Play Speed Practice Mode button that calls startSession', () => {
      const startSession = vi.fn();
      mockStore({
        gameOver: true, isAnswered: true, selectedOption: 0,
        correctCount: 3, maxStreak: 2, score: 5000,
        safeHavenPrize: '$1,000', currentTierIndex: 4,
        isWalkedAway: false, startSession,
      });
      renderGame();
      fireEvent.click(screen.getByText(/Play Speed Practice Mode/i));
      expect(startSession).toHaveBeenCalledWith('speed');
    });

    it('calls onComplete and onExit on Return to Curriculum', () => {
      const onComplete = vi.fn();
      const onExit = vi.fn();
      mockStore({
        gameOver: true, isAnswered: true, selectedOption: 0,
        correctCount: 3, maxStreak: 2, score: 5000,
        safeHavenPrize: '$1,000', currentTierIndex: 4,
        isWalkedAway: false,
        quizBank: [mockQuestion, mockQuestion, mockQuestion],
      });
      render(<PopQuizGame onComplete={onComplete} onExit={onExit} />);
      fireEvent.click(screen.getByText(/Return to Curriculum/i));
      expect(onComplete).toHaveBeenCalledWith(5000);
      expect(onExit).toHaveBeenCalled();
    });
  });

  describe('Game Over - Grand Winner', () => {
    it('shows grand winner screen when all 15 tiers won', () => {
      mockStore({
        gameOver: true,
        isAnswered: true,
        selectedOption: 0,
        currentTierIndex: 14,
        isWalkedAway: false,
        safeHavenPrize: '$1,000,000',
        accumulatedPrize: '$1,000,000',
        score: 1000000,
        correctCount: 15,
        maxStreak: 15,
        quizBank: Array(15).fill(mockQuestion),
      });
      mockDerived({ question: mockQuestion });
      mockDashboard({ analytics: { accuracyPct: 100 }, categoryStats: {} });
      renderGame();
      expect(screen.getByText(/FINTECH GRAND CHAMPION/i)).toBeInTheDocument();
      expect(screen.getByText(/\$1,000,000 WINNER/i)).toBeInTheDocument();
    });
  });

  describe('Game Over - Walked Away', () => {
    it('shows walked away screen', () => {
      mockStore({
        gameOver: true,
        isAnswered: true,
        selectedOption: 0,
        currentTierIndex: 5,
        isWalkedAway: true,
        accumulatedPrize: '$2,000',
        safeHavenPrize: '$1,000',
        score: 2000,
        correctCount: 6,
        maxStreak: 6,
        quizBank: Array(6).fill(mockQuestion),
      });
      mockDerived({ question: mockQuestion });
      mockDashboard({ analytics: { accuracyPct: 100 } });
      renderGame();
      expect(screen.getByText(/WALKED AWAY WITH PRIZE/i)).toBeInTheDocument();
      expect(screen.getByText(/You Won \$2,000/i)).toBeInTheDocument();
    });
  });

  describe('Game Over - Speed Mode', () => {
    it('shows speed mode completion text', () => {
      mockStore({
        gameOver: true,
        isAnswered: true,
        selectedOption: 0,
        currentTierIndex: 5,
        isWalkedAway: false,
        gameMode: 'speed',
        safeHavenPrize: '$0',
        accumulatedPrize: '$0',
        score: 500,
        correctCount: 8,
        maxStreak: 5,
        quizBank: Array(20).fill(mockQuestion),
      });
      mockDerived({ question: mockQuestion });
      mockDashboard({ analytics: { accuracyPct: 40 } });
      renderGame();
      expect(screen.getByText(/20 randomized speed-round assessment questions/i)).toBeInTheDocument();
    });
  });

  describe('Game Over - No Category Stats', () => {
    it('hides category breakdown when no stats', () => {
      mockStore({
        gameOver: true, isAnswered: true, selectedOption: 0,
        currentTierIndex: 4, isWalkedAway: false,
        safeHavenPrize: '$1,000', accumulatedPrize: '$1,000',
        score: 1000, correctCount: 5, maxStreak: 5,
      });
      mockDashboard({ analytics: { accuracyPct: 100 }, categoryStats: {} });
      renderGame();
      expect(screen.queryByText(/Category Mastery Breakdown/i)).not.toBeInTheDocument();
    });
  });
});
