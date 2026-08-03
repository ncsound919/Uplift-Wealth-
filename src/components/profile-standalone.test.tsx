import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StudentProfile } from './StudentProfile';
import { StandaloneGameView } from './StandaloneGameView';
import { courseModules } from '../data/courseData';

vi.mock('motion/react', () => {
  const Div = require('react').forwardRef(({ children, ...props }: any, ref: any) => <div ref={ref} {...props}>{children}</div>);
  return { motion: new Proxy({}, { get: () => Div }), AnimatePresence: ({ children }: any) => <div>{children}</div> };
});
vi.mock('canvas-confetti', () => ({ default: vi.fn() }));

vi.mock('./TradingGame', () => ({ TradingGame: () => <div>Stock Market Simulator</div> }));
vi.mock('./UnderwritingGame', () => ({ UnderwritingGame: () => <div>Alternative Lending Sim</div> }));
vi.mock('./ParametricGame', () => ({ ParametricGame: () => <div>Parametric Insurance Sim</div> }));
vi.mock('./FraudGame', () => ({ FraudGame: () => <div>Compliance Screener</div> }));
vi.mock('./PopQuizGame', () => ({ PopQuizGame: () => <div>FinTech Pop Quiz</div> }));

describe('StudentProfile', () => {
  const baseProps = {
    xp: 250,
    streak: 5,
    gameTimeSeconds: 3600,
    badges: ['wise_wizard'],
    completedLessons: ['m0-l1', 'm0-q1'],
    allModules: courseModules,
    completedModules: ['module-0'],
    onOpenGame: vi.fn(),
    onNavigateToDashboard: vi.fn(),
  };

  it('renders level and xp', () => {
    render(<StudentProfile {...baseProps} />);
    expect(screen.getByText(/Student Core Portfolio/i)).toBeInTheDocument();
    expect(screen.getByText(/Lvl 2/)).toBeInTheDocument();
    expect(screen.getByText('250')).toBeInTheDocument();
  });

  it('formats game time', () => {
    render(<StudentProfile {...baseProps} />);
    expect(screen.getByText('1h 0s')).toBeInTheDocument();
  });

  it('shows streak', () => {
    render(<StudentProfile {...baseProps} />);
    expect(screen.getByText('5 Days')).toBeInTheDocument();
  });

  it('shows unlocked badge', () => {
    render(<StudentProfile {...baseProps} />);
    expect(screen.getByText('Wise Wizard')).toBeInTheDocument();
    expect(screen.getByText('✓ CREDENTIAL EARNED')).toBeInTheDocument();
  });

  it('shows locked badge with requirement', () => {
    render(<StudentProfile {...baseProps} />);
    expect(screen.getByText('Card Commander')).toBeInTheDocument();
    expect(screen.getByText('🔒 REQ: Complete Module 2')).toBeInTheDocument();
  });

  it('opens trading game', () => {
    render(<StudentProfile {...baseProps} />);
    fireEvent.click(screen.getByText(/Open Stock Sim/));
    expect(baseProps.onOpenGame).toHaveBeenCalledWith('trading');
  });

  it('handles zero state', () => {
    render(<StudentProfile {...baseProps} xp={0} streak={3} gameTimeSeconds={0} badges={[]} completedLessons={[]} />);
    expect(screen.getByText('3 Days')).toBeInTheDocument();
    expect(screen.getByText('0s')).toBeInTheDocument();
  });
});

describe('StandaloneGameView', () => {
  const props = {
    activeDirectGame: 'trading' as string | null,
    onAddXp: vi.fn(),
    onBackToDashboard: vi.fn(),
  };

  it('renders game workspace', () => {
    render(<StandaloneGameView {...props} />);
    expect(screen.getByText(/Interactive Educational Game Workspace/i)).toBeInTheDocument();
  });

  it('renders return button', () => {
    render(<StandaloneGameView {...props} />);
    expect(screen.getByText(/Return to Syllabus/i)).toBeInTheDocument();
  });

  it('calls onBackToDashboard', () => {
    render(<StandaloneGameView {...props} />);
    fireEvent.click(screen.getByText(/Return to Syllabus/i));
    expect(props.onBackToDashboard).toHaveBeenCalled();
  });

  it('renders trading game for trading', () => {
    render(<StandaloneGameView {...props} activeDirectGame="trading" />);
    expect(screen.getByText(/Stock Market Simulator/i)).toBeInTheDocument();
  });

  it('renders underwriting for underwriting', async () => {
    render(<StandaloneGameView {...props} activeDirectGame="underwriting" />);
    expect(await screen.findByText(/Alternative Lending Sim/i)).toBeInTheDocument();
  });

  it('renders nothing for unknown game', () => {
    render(<StandaloneGameView {...props} activeDirectGame="unknown" />);
    expect(screen.queryByText(/Stock Market Simulator/i)).not.toBeInTheDocument();
  });
});
