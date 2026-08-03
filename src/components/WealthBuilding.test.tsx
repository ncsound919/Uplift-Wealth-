import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WealthBuilding } from './WealthBuilding';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('../data/wealthChapters', () => ({
  wealthChapters: [
    { id: 'credit', title: 'Credit Mastery', subtitle: 'Building the foundation', gradient: 'from-blue-600 to-indigo-600', icon: 'span', estimatedMinutes: 12 },
    { id: 'investing', title: 'Investing & IRAs', subtitle: 'Making money work', gradient: 'from-emerald-600 to-teal-600', icon: 'span', estimatedMinutes: 18 },
  ],
}));

const mockIsComplete = vi.fn(() => false);
const mockReset = vi.fn();
vi.mock('../hooks/useChapterCompletion', () => ({
  useChapterCompletion: () => ({
    isComplete: (...args: any[]) => (mockIsComplete as any)(...args),
    completed: ['credit'],
    reset: mockReset,
  }),
}));

vi.mock('./wealth/tools/CompoundGrowthVisualizer', () => ({
  CompoundGrowthVisualizer: () => <div>Compound Growth Visualizer</div>,
}));

describe('WealthBuilding', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the wealth building header', () => {
    render(<WealthBuilding />);
    expect(screen.getByText('Wealth Building')).toBeInTheDocument();
  });

  it('navigates to a chapter when its card is clicked', () => {
    render(<WealthBuilding />);
    fireEvent.click(screen.getByRole('button', { name: 'Credit Mastery' }));
    expect(mockNavigate).toHaveBeenCalledWith('/wealth-building/credit');
  });

  it('marks completed chapters', () => {
    mockIsComplete.mockImplementation(((id: string) => id === 'credit') as any);
    render(<WealthBuilding />);
    expect(screen.getByRole('button', { name: 'Credit Mastery (completed)' })).toBeInTheDocument();
    expect(screen.getByText('✓ Complete')).toBeInTheDocument();
  });

  it('shows completion count and resets progress', () => {
    render(<WealthBuilding />);
    expect(screen.getByText('1 / 2')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /reset all wealth building progress/i }));
    expect(mockReset).toHaveBeenCalled();
  });
});
