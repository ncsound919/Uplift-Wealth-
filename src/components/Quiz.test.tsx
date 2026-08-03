import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Quiz } from './Quiz';
import { QuizQuestion } from '../data/courseData';
import { apiClient } from '../lib/apiClient';

vi.mock('../lib/apiClient', () => ({
  apiClient: { submitQuizScore: vi.fn() },
}));

const mockQuestions: QuizQuestion[] = [
  {
    question: 'What is 2+2?',
    options: ['3', '4', '5', '6'],
    correctAnswer: 1,
    explanation: '2+2 equals 4.',
  },
  {
    question: 'What is the capital of France?',
    options: ['London', 'Berlin', 'Paris', 'Madrid'],
    correctAnswer: 2,
    explanation: 'Paris is the capital of France.',
  },
];

describe('Quiz', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiClient.submitQuizScore).mockResolvedValue({ passed: true } as any);
  });

  it('renders the first question', () => {
    render(<Quiz questions={mockQuestions} onComplete={() => {}} />);
    expect(screen.getByText('What is 2+2?')).toBeInTheDocument();
  });

  it('shows question count', () => {
    render(<Quiz questions={mockQuestions} onComplete={() => {}} />);
    expect(screen.getByText(/1 of 2/)).toBeInTheDocument();
  });

  it('shows pass threshold badge when provided', () => {
    render(<Quiz questions={mockQuestions} onComplete={() => {}} moduleId="test" passThreshold={70} />);
    expect(screen.getByText(/Pass: 70%/)).toBeInTheDocument();
  });

  it('shows all options', () => {
    render(<Quiz questions={mockQuestions} onComplete={() => {}} />);
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
  });

  it('shows progress bar', () => {
    const { container } = render(<Quiz questions={mockQuestions} onComplete={() => {}} />);
    expect(container.querySelector('.bg-blue-500')).toBeInTheDocument();
  });

  it('clicking correct answer shows correct feedback', async () => {
    const user = userEvent.setup();
    render(<Quiz questions={mockQuestions} onComplete={() => {}} />);
    await user.click(screen.getByText('4'));
    expect(screen.getByText(/Correct/)).toBeInTheDocument();
    expect(screen.getByText('2+2 equals 4.')).toBeInTheDocument();
  });

  it('clicking wrong answer shows incorrect feedback', async () => {
    const user = userEvent.setup();
    render(<Quiz questions={mockQuestions} onComplete={() => {}} />);
    await user.click(screen.getByText('3'));
    expect(screen.getByText(/Incorrect/)).toBeInTheDocument();
  });

  it('advances to next question', async () => {
    const user = userEvent.setup();
    render(<Quiz questions={mockQuestions} onComplete={() => {}} />);
    await user.click(screen.getByText('4'));
    await user.click(screen.getByText('Next Question'));
    expect(screen.getByText('What is the capital of France?')).toBeInTheDocument();
  });

  it('shows quiz results on completion', async () => {
    const user = userEvent.setup();
    render(<Quiz questions={mockQuestions} onComplete={() => {}} />);

    // Answer first question correctly
    await user.click(screen.getByText('4'));
    await user.click(screen.getByText('Next Question'));

    // Answer second question correctly
    await user.click(screen.getByText('Paris'));
    await user.click(screen.getByText('See Results'));

    expect(screen.getByText(/Quiz Passed/)).toBeInTheDocument();
    expect(screen.getByText(/100%/)).toBeInTheDocument();
  });

  it('shows retry button when below pass threshold', async () => {
    const user = userEvent.setup();
    render(<Quiz questions={mockQuestions} onComplete={() => {}} moduleId="test" passThreshold={90} />);

    // Answer first correctly
    await user.click(screen.getByText('4'));
    await user.click(screen.getByText('Next Question'));

    // Answer second INCORRECTLY
    await user.click(screen.getByText('London'));
    await user.click(screen.getByText('See Results'));

    expect(screen.getByText(/Keep Practicing/)).toBeInTheDocument();
    expect(screen.getByText(/Retry Quiz/)).toBeInTheDocument();
  });

  it('calls onComplete when continuing after pass', async () => {
    const user = userEvent.setup();
    let completed = false;
    render(<Quiz questions={mockQuestions} onComplete={() => { completed = true; }} />);

    await user.click(screen.getByText('4'));
    await user.click(screen.getByText('Next Question'));
    await user.click(screen.getByText('Paris'));
    await user.click(screen.getByText('See Results'));
    await user.click(screen.getByText('Continue'));

    expect(completed).toBe(true);
  });

  it('retries the quiz and resets all state', async () => {
    const user = userEvent.setup();
    render(<Quiz questions={mockQuestions} onComplete={() => {}} moduleId="test" passThreshold={90} />);

    // Fail first attempt (1 correct, 1 incorrect = 50%)
    await user.click(screen.getByText('4'));
    await user.click(screen.getByText('Next Question'));
    await user.click(screen.getByText('London'));
    await user.click(screen.getByText('See Results'));
    expect(screen.getByText(/Keep Practicing/)).toBeInTheDocument();

    // Retry resets to the first question
    await user.click(screen.getByText('Retry Quiz'));
    expect(screen.getByText('1 of 2')).toBeInTheDocument();
    expect(screen.getByText('What is 2+2?')).toBeInTheDocument();

    // Pass the second attempt and confirm attempts counter increments
    await user.click(screen.getByText('4'));
    await user.click(screen.getByText('Next Question'));
    await user.click(screen.getByText('Paris'));
    await user.click(screen.getByText('See Results'));
    expect(screen.getByText(/Quiz Passed/)).toBeInTheDocument();
    expect(screen.getByText(/Attempt 2/)).toBeInTheDocument();
  });

  it('logs a warning when quiz score submission fails', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.mocked(apiClient.submitQuizScore).mockRejectedValueOnce(new Error('network down'));
    const user = userEvent.setup();
    render(<Quiz questions={mockQuestions} onComplete={() => {}} moduleId="test" />);

    await user.click(screen.getByText('4'));
    await user.click(screen.getByText('Next Question'));
    await user.click(screen.getByText('Paris'));
    await user.click(screen.getByText('See Results'));

    await waitFor(() => {
      expect(warnSpy).toHaveBeenCalledWith('[Quiz Score Submit Error]:', expect.any(Error));
    });
    warnSpy.mockRestore();
  });
});
