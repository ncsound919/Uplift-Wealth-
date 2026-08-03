import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StandaloneGameView } from './StandaloneGameView';
import confetti from 'canvas-confetti';

const { mockTradingComplete, mockUnderwritingComplete, mockParametricComplete, mockFraudComplete, mockPopQuizComplete, mockPopQuizExit } = vi.hoisted(() => ({
  mockTradingComplete: vi.fn(),
  mockUnderwritingComplete: vi.fn(),
  mockParametricComplete: vi.fn(),
  mockFraudComplete: vi.fn(),
  mockPopQuizComplete: vi.fn(),
  mockPopQuizExit: vi.fn(),
}));

vi.mock('./TradingGame', () => ({
  TradingGame: ({ onComplete }: any) => (
    <div>
      <span>TRADING-GAME</span>
      <button onClick={onComplete}>complete-trading</button>
    </div>
  ),
}));

vi.mock('./UnderwritingGame', () => ({
  UnderwritingGame: ({ onComplete }: any) => (
    <div>
      <span>UNDERWRITING-GAME</span>
      <button onClick={onComplete}>complete-underwriting</button>
    </div>
  ),
}));

vi.mock('./ParametricGame', () => ({
  ParametricGame: ({ onComplete }: any) => (
    <div>
      <span>PARAMETRIC-GAME</span>
      <button onClick={onComplete}>complete-parametric</button>
    </div>
  ),
}));

vi.mock('./FraudGame', () => ({
  FraudGame: ({ onComplete }: any) => (
    <div>
      <span>FRAUD-GAME</span>
      <button onClick={onComplete}>complete-fraud</button>
    </div>
  ),
}));

vi.mock('./PopQuizGame', () => ({
  PopQuizGame: ({ onComplete, onExit }: any) => (
    <div>
      <span>POPQUIZ-GAME</span>
      <button onClick={onComplete}>complete-popquiz</button>
      <button onClick={onExit}>exit-popquiz</button>
    </div>
  ),
}));

describe('StandaloneGameView', () => {
  const onAddXp = vi.fn();
  const onBackToDashboard = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockTradingComplete.mockClear();
    mockUnderwritingComplete.mockClear();
    mockParametricComplete.mockClear();
    mockFraudComplete.mockClear();
    mockPopQuizComplete.mockClear();
    mockPopQuizExit.mockClear();
  });

  it('renders the game terminal header', () => {
    render(<StandaloneGameView activeDirectGame={null} onAddXp={onAddXp} onBackToDashboard={onBackToDashboard} />);
    expect(screen.getByText('EDUCATIONAL GAME TERMINAL')).toBeInTheDocument();
    expect(screen.getByText('Interactive Educational Game Workspace')).toBeInTheDocument();
  });

  it('renders the return to syllabus button', () => {
    render(<StandaloneGameView activeDirectGame={null} onAddXp={onAddXp} onBackToDashboard={onBackToDashboard} />);
    expect(screen.getByText('Return to Syllabus')).toBeInTheDocument();
  });

  it('calls onBackToDashboard on return click', () => {
    render(<StandaloneGameView activeDirectGame={null} onAddXp={onAddXp} onBackToDashboard={onBackToDashboard} />);
    fireEvent.click(screen.getByText('Return to Syllabus'));
    expect(onBackToDashboard).toHaveBeenCalled();
  });

  it('does not render any game when activeDirectGame is null', async () => {
    render(<StandaloneGameView activeDirectGame={null} onAddXp={onAddXp} onBackToDashboard={onBackToDashboard} />);
    expect(screen.queryByText('TRADING-GAME')).not.toBeInTheDocument();
    expect(screen.queryByText('POPQUIZ-GAME')).not.toBeInTheDocument();
  });

  it('renders the trading game when active', async () => {
    render(<StandaloneGameView activeDirectGame="trading" onAddXp={onAddXp} onBackToDashboard={onBackToDashboard} />);
    expect(await screen.findByText('TRADING-GAME')).toBeInTheDocument();
  });

  it('renders the underwriting game when active', async () => {
    render(<StandaloneGameView activeDirectGame="underwriting" onAddXp={onAddXp} onBackToDashboard={onBackToDashboard} />);
    expect(await screen.findByText('UNDERWRITING-GAME')).toBeInTheDocument();
  });

  it('renders the parametric game when active', async () => {
    render(<StandaloneGameView activeDirectGame="parametric" onAddXp={onAddXp} onBackToDashboard={onBackToDashboard} />);
    expect(await screen.findByText('PARAMETRIC-GAME')).toBeInTheDocument();
  });

  it('renders the fraud game when active', async () => {
    render(<StandaloneGameView activeDirectGame="fraud" onAddXp={onAddXp} onBackToDashboard={onBackToDashboard} />);
    expect(await screen.findByText('FRAUD-GAME')).toBeInTheDocument();
  });

  it('renders the pop quiz game when active', async () => {
    render(<StandaloneGameView activeDirectGame="popquiz" onAddXp={onAddXp} onBackToDashboard={onBackToDashboard} />);
    expect(await screen.findByText('POPQUIZ-GAME')).toBeInTheDocument();
  });

  it('adds xp and fires confetti on game completion', async () => {
    render(<StandaloneGameView activeDirectGame="trading" onAddXp={onAddXp} onBackToDashboard={onBackToDashboard} />);
    fireEvent.click(await screen.findByText('complete-trading'));
    expect(onAddXp).toHaveBeenCalledWith(150);
    expect(confetti).toHaveBeenCalled();
  });

  it('adds xp for underwriting completion', async () => {
    render(<StandaloneGameView activeDirectGame="underwriting" onAddXp={onAddXp} onBackToDashboard={onBackToDashboard} />);
    fireEvent.click(await screen.findByText('complete-underwriting'));
    expect(onAddXp).toHaveBeenCalledWith(150);
  });

  it('adds xp for parametric completion', async () => {
    render(<StandaloneGameView activeDirectGame="parametric" onAddXp={onAddXp} onBackToDashboard={onBackToDashboard} />);
    fireEvent.click(await screen.findByText('complete-parametric'));
    expect(onAddXp).toHaveBeenCalledWith(150);
  });

  it('adds xp for fraud completion', async () => {
    render(<StandaloneGameView activeDirectGame="fraud" onAddXp={onAddXp} onBackToDashboard={onBackToDashboard} />);
    fireEvent.click(await screen.findByText('complete-fraud'));
    expect(onAddXp).toHaveBeenCalledWith(150);
  });

  it('adds xp for pop quiz completion and exits', async () => {
    render(<StandaloneGameView activeDirectGame="popquiz" onAddXp={onAddXp} onBackToDashboard={onBackToDashboard} />);
    fireEvent.click(await screen.findByText('complete-popquiz'));
    expect(onAddXp).toHaveBeenCalledWith(150);
    fireEvent.click(await screen.findByText('exit-popquiz'));
    expect(onBackToDashboard).toHaveBeenCalled();
  });
});
