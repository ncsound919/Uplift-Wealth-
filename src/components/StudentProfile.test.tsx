import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StudentProfile } from './StudentProfile';
import { Module } from '../data/courseData';

vi.mock('motion/react', () => ({
  motion: { div: ({ children, ...props }: any) => <div {...props}>{children}</div> },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

const mockGetJSON = vi.fn();

vi.mock('../lib/storage', () => ({
  getJSON: (...args: any[]) => mockGetJSON(...args),
  storageKeys: { stockSimMetrics: 'stock_sim_metrics' },
}));

function makeModule(id: string, lessons: Array<{ id: string; type: 'video' | 'text' | 'quiz' | 'game' }>): Module {
  return {
    id,
    level: 'beginner',
    title: `Module ${id}`,
    description: '',
    icon: () => <span />,
    color: 'bg-blue-600',
    lessons: lessons.map(l => ({ id: l.id, title: l.id, type: l.type })),
  };
}

function defaultProps(overrides: Partial<Parameters<typeof StudentProfile>[0]> = {}) {
  const modules = [
    makeModule('m1', [
      { id: 'l-quiz-1', type: 'quiz' },
      { id: 'l-game-1', type: 'game' },
      { id: 'l-text-1', type: 'text' },
    ]),
    makeModule('m2', [{ id: 'l-quiz-2', type: 'quiz' }]),
  ];
  return {
    xp: 2500,
    streak: 7,
    gameTimeSeconds: 3661,
    badges: ['wise_wizard', 'card_commander'],
    completedLessons: ['l-quiz-1', 'l-game-1', 'l-quiz-2'],
    allModules: modules,
    completedModules: ['m1'],
    onOpenGame: vi.fn(),
    onNavigateToDashboard: vi.fn(),
    ...overrides,
  };
}

describe('StudentProfile', () => {
  beforeEach(() => {
    mockGetJSON.mockReturnValue(null);
  });

  it('renders the student core portfolio header', () => {
    render(<StudentProfile {...defaultProps()} />);
    expect(screen.getByText('Student Core Portfolio')).toBeInTheDocument();
    expect(screen.getByText('Fintech Engineering Candidate')).toBeInTheDocument();
  });

  it('computes the current level from xp', () => {
    render(<StudentProfile {...defaultProps({ xp: 2500 })} />);
    expect(screen.getByText('Lvl 6')).toBeInTheDocument();
  });

  it('renders the xp value', () => {
    render(<StudentProfile {...defaultProps({ xp: 2500 })} />);
    expect(screen.getByText('2500')).toBeInTheDocument();
  });

  it('formats game time as hours, minutes, seconds', () => {
    render(<StudentProfile {...defaultProps({ gameTimeSeconds: 3661 })} />);
    expect(screen.getByText('1h 1m 1s')).toBeInTheDocument();
  });

  it('formats game time under an hour', () => {
    render(<StudentProfile {...defaultProps({ gameTimeSeconds: 65 })} />);
    expect(screen.getByText('1m 5s')).toBeInTheDocument();
  });

  it('counts only quiz lessons as quizzes passed', () => {
    render(<StudentProfile {...defaultProps()} />);
    expect(screen.getAllByText('2')[0]).toBeInTheDocument();
  });

  it('counts only game lessons as simulators mastered', () => {
    render(<StudentProfile {...defaultProps()} />);
    expect(screen.getAllByText('1')[0]).toBeInTheDocument();
  });

  it('renders the streak', () => {
    render(<StudentProfile {...defaultProps({ streak: 7 })} />);
    expect(screen.getByText('7 Days')).toBeInTheDocument();
  });

  it('renders unlocked badges as credentials earned', () => {
    render(<StudentProfile {...defaultProps()} />);
    expect(screen.getByText('Wise Wizard')).toBeInTheDocument();
    expect(screen.getAllByText(/CREDENTIAL EARNED/i).length).toBeGreaterThan(0);
  });

  it('renders locked badges with their requirement', () => {
    render(<StudentProfile {...defaultProps()} />);
    expect(screen.getByText('Compliance Officer')).toBeInTheDocument();
    expect(screen.getByText(/REQ: Complete Module 8/i)).toBeInTheDocument();
  });

  it('shows starting NAV when no stock sim metrics stored', () => {
    mockGetJSON.mockReturnValue(null);
    render(<StudentProfile {...defaultProps()} />);
    expect(screen.getByText('$100,000.00')).toBeInTheDocument();
  });

  it('shows stored stock sim metrics', () => {
    mockGetJSON.mockReturnValue({
      totalNAV: 123456.78,
      totalPL: -5000,
      totalPLPct: -4.5,
      openPositionsCount: 3,
      filledOrdersCount: 42,
    });
    render(<StudentProfile {...defaultProps()} />);
    expect(screen.getByText('$123,456.78')).toBeInTheDocument();
    expect(screen.getByText('$-5,000.00')).toBeInTheDocument();
    expect(screen.getByText('-4.50% ROI')).toBeInTheDocument();
  });

  it('opens the stock sim when the trading button is clicked', () => {
    const onOpenGame = vi.fn();
    render(<StudentProfile {...defaultProps({ onOpenGame })} />);
    fireEvent.click(screen.getByText(/Open Stock Sim/i));
    expect(onOpenGame).toHaveBeenCalledWith('trading');
  });
});
