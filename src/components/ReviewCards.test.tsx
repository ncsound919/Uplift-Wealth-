import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ReviewCards } from './ReviewCards';

const mockRecordReview = vi.fn();
const mockGetDueCards = vi.fn();
const mockGetReviewStats = vi.fn();
const mockBuildQuizCards = vi.fn();

vi.mock('../lib/spacedRepetition', () => ({
  recordReview: (...args: any[]) => mockRecordReview(...args),
  getDueCards: (...args: any[]) => mockGetDueCards(...args),
  getReviewStats: (...args: any[]) => mockGetReviewStats(...args),
  buildQuizCards: (...args: any[]) => mockBuildQuizCards(...args),
}));

vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: any) => {
      const { animate, transition, initial, exit, ...rest } = props;
      return <div {...rest}>{children}</div>;
    },
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

const dueCard = { cardId: 'c1', dueDate: new Date().toISOString() };
const quizCard = {
  id: 'c1',
  question: 'What is a stock?',
  answer: 'Equity',
  explanation: 'A stock represents ownership',
  category: 'basic',
  difficulty: 'beginner',
  source: 'quiz',
};

describe('ReviewCards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetDueCards.mockReturnValue([]);
    mockBuildQuizCards.mockReturnValue([]);
    mockGetReviewStats.mockReturnValue({ total: 0, reviewed: 0 });
  });

  it('shows All Caught Up when no cards', async () => {
    render(<ReviewCards />);
    expect(await screen.findByText('All Caught Up!')).toBeInTheDocument();
  });

  it('shows card question when due cards exist', async () => {
    mockGetDueCards.mockReturnValue([dueCard]);
    mockBuildQuizCards.mockReturnValue([quizCard]);
    mockGetReviewStats.mockReturnValue({ total: 1, reviewed: 0 });
    render(<ReviewCards />);
    expect(await screen.findByText('What is a stock?')).toBeInTheDocument();
  });

  it('clicking card flips to show answer', async () => {
    mockGetDueCards.mockReturnValue([dueCard]);
    mockBuildQuizCards.mockReturnValue([quizCard]);
    mockGetReviewStats.mockReturnValue({ total: 1, reviewed: 0 });
    render(<ReviewCards />);
    const question = await screen.findByText('What is a stock?');
    fireEvent.click(question);
    expect(screen.getByText('Equity')).toBeInTheDocument();
    expect(screen.getByText('A stock represents ownership')).toBeInTheDocument();
  });

  it('shows rating buttons when flipped', async () => {
    mockGetDueCards.mockReturnValue([dueCard]);
    mockBuildQuizCards.mockReturnValue([quizCard]);
    mockGetReviewStats.mockReturnValue({ total: 1, reviewed: 0 });
    render(<ReviewCards />);
    const question = await screen.findByText('What is a stock?');
    fireEvent.click(question);
    expect(screen.getByText('Forgot')).toBeInTheDocument();
    expect(screen.getByText('Hard')).toBeInTheDocument();
    expect(screen.getByText('Good')).toBeInTheDocument();
    expect(screen.getByText('Easy')).toBeInTheDocument();
  });

  it('clicking a rating button calls recordReview', async () => {
    mockGetDueCards.mockReturnValue([dueCard]);
    mockBuildQuizCards.mockReturnValue([quizCard]);
    mockGetReviewStats.mockReturnValue({ total: 1, reviewed: 0 });
    render(<ReviewCards />);
    const question = await screen.findByText('What is a stock?');
    fireEvent.click(question);
    fireEvent.click(screen.getByText('Good'));
    expect(mockRecordReview).toHaveBeenCalledWith('c1', 4);
  });

  it('calls recordReview with correct quality for each rating button', async () => {
    mockGetDueCards.mockReturnValue([dueCard, { cardId: 'c2', dueDate: new Date().toISOString() }]);
    mockBuildQuizCards.mockReturnValue([quizCard, { id: 'c2', question: 'What is a bond?', answer: 'Debt', explanation: 'A bond is debt', category: 'basic', difficulty: 'beginner', source: 'quiz' }]);
    mockGetReviewStats.mockReturnValue({ total: 2, reviewed: 0 });
    render(<ReviewCards />);
    const question = await screen.findByText('What is a stock?');
    fireEvent.click(question);
    fireEvent.click(screen.getByText('Forgot'));
    expect(mockRecordReview).toHaveBeenCalledWith('c1', 0);

    fireEvent.click(await screen.findByText('What is a bond?'));
    fireEvent.click(screen.getByText('Hard'));
    expect(mockRecordReview).toHaveBeenCalledWith('c2', 3);
  });

  it('shows explanation after flipping', async () => {
    mockGetDueCards.mockReturnValue([dueCard]);
    mockBuildQuizCards.mockReturnValue([quizCard]);
    mockGetReviewStats.mockReturnValue({ total: 1, reviewed: 0 });
    render(<ReviewCards />);
    const question = await screen.findByText('What is a stock?');
    fireEvent.click(question);
    expect(screen.getByText('A stock represents ownership')).toBeInTheDocument();
  });

  it('shows progress counter', async () => {
    mockGetDueCards.mockReturnValue([dueCard, { cardId: 'c2', dueDate: new Date().toISOString() }]);
    mockBuildQuizCards.mockReturnValue([quizCard, { id: 'c2', question: 'What is a bond?', answer: 'Debt', explanation: 'A bond is debt', category: 'basic', difficulty: 'beginner', source: 'quiz' }]);
    mockGetReviewStats.mockReturnValue({ total: 2, reviewed: 0 });
    render(<ReviewCards />);
    expect(await screen.findByText('1 / 2')).toBeInTheDocument();
  });

  it('shows Review Again button when all caught up', async () => {
    mockGetDueCards.mockReturnValue([dueCard]);
    mockBuildQuizCards.mockReturnValue([quizCard]);
    mockGetReviewStats.mockReturnValue({ total: 1, reviewed: 0 });
    render(<ReviewCards />);
    const question = await screen.findByText('What is a stock?');
    fireEvent.click(question);
    fireEvent.click(screen.getByText('Good'));
    expect(await screen.findByText('Review Again')).toBeInTheDocument();
  });

  it('shows stats in all-caught-up view', async () => {
    mockGetReviewStats.mockReturnValue({ total: 5, reviewed: 3 });
    render(<ReviewCards />);
    expect(await screen.findByText(/3 cards reviewed/)).toBeInTheDocument();
    expect(screen.getByText(/5 total in rotation/)).toBeInTheDocument();
  });

  it('shows no-review message when stats total is zero', async () => {
    render(<ReviewCards />);
    expect(await screen.findByText('No review cards yet. Complete quizzes to build your review deck.')).toBeInTheDocument();
  });

  it('reloads cards when Review Again is clicked', async () => {
    mockGetDueCards.mockReturnValue([dueCard]);
    mockBuildQuizCards.mockReturnValue([quizCard]);
    mockGetReviewStats.mockReturnValue({ total: 1, reviewed: 0 });
    render(<ReviewCards />);
    const question = await screen.findByText('What is a stock?');
    fireEvent.click(question);
    fireEvent.click(screen.getByText('Good'));
    expect(await screen.findByText('Review Again')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Review Again'));
    expect(await screen.findByText('What is a stock?')).toBeInTheDocument();
  });

  it('shows new cards when no due cards exist', async () => {
    mockGetDueCards.mockReturnValue([]);
    mockBuildQuizCards.mockReturnValue([quizCard]);
    mockGetReviewStats.mockReturnValue({ total: 1, reviewed: 0 });
    render(<ReviewCards />);
    expect(await screen.findByText('What is a stock?')).toBeInTheDocument();
  });

  it('reloads due cards after finishing the last card', () => {
    vi.useFakeTimers();
    try {
      mockGetDueCards.mockReturnValue([dueCard]);
      mockBuildQuizCards.mockReturnValue([quizCard]);
      mockGetReviewStats.mockReturnValue({ total: 1, reviewed: 0 });
      render(<ReviewCards />);
      expect(screen.getByText('What is a stock?')).toBeInTheDocument();
      fireEvent.click(screen.getByText('What is a stock?'));
      fireEvent.click(screen.getByText('Good'));
      expect(screen.getByText('All Caught Up!')).toBeInTheDocument();
      expect(mockGetDueCards).toHaveBeenCalledTimes(1);
      act(() => { vi.advanceTimersByTime(500); });
      expect(mockGetDueCards).toHaveBeenCalledTimes(2);
      expect(screen.getByText('What is a stock?')).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });
});
