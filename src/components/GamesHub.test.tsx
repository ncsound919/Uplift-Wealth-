import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GamesHub } from './GamesHub';

describe('GamesHub', () => {
  const onSelectGame = vi.fn();

  beforeEach(() => {
    onSelectGame.mockClear();
  });

  it('renders the header and description', () => {
    render(<GamesHub onSelectGame={onSelectGame} />);
    expect(screen.getByText('Interactive Learning')).toBeInTheDocument();
    expect(screen.getByText('Educational Games')).toBeInTheDocument();
    expect(screen.getByText(/Choose a simulation to apply your fintech knowledge/i)).toBeInTheDocument();
  });

  it('renders all five game cards', () => {
    render(<GamesHub onSelectGame={onSelectGame} />);
    expect(screen.getByText('Stock Market Simulator')).toBeInTheDocument();
    expect(screen.getByText('Alternative Lending Sim')).toBeInTheDocument();
    expect(screen.getByText('Parametric Insurance Sim')).toBeInTheDocument();
    expect(screen.getByText('Compliance Screener')).toBeInTheDocument();
    expect(screen.getByText('FinTech Pop Quiz')).toBeInTheDocument();
  });

  it('renders a Play Now call-to-action for every game', () => {
    render(<GamesHub onSelectGame={onSelectGame} />);
    expect(screen.getAllByText(/Play Now/i)).toHaveLength(5);
  });

  it('calls onSelectGame with the game id on card click', () => {
    render(<GamesHub onSelectGame={onSelectGame} />);
    fireEvent.click(screen.getByText('Stock Market Simulator'));
    expect(onSelectGame).toHaveBeenCalledWith('trading');
  });

  it('calls onSelectGame for each game id', () => {
    render(<GamesHub onSelectGame={onSelectGame} />);
    const cases: Array<[string, string]> = [
      ['Alternative Lending Sim', 'underwriting'],
      ['Parametric Insurance Sim', 'parametric'],
      ['Compliance Screener', 'fraud'],
      ['FinTech Pop Quiz', 'popquiz'],
    ];
    for (const [label, id] of cases) {
      fireEvent.click(screen.getByText(label));
      expect(onSelectGame).toHaveBeenCalledWith(id);
    }
  });
});
