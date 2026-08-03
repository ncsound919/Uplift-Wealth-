import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProgressDashboard } from './ProgressDashboard';

vi.mock('motion/react', () => ({ motion: { div: 'div' } }));
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  BarChart: 'div', Bar: 'div', XAxis: 'div', YAxis: 'div', Tooltip: 'div',
  LineChart: 'div', Line: 'div',
}));

const mockModules = [
  { id: 'm1', title: 'Module 1', level: 'beginner', color: 'blue' },
  { id: 'm2', title: 'Module 2', level: 'advanced', color: 'red' },
];

describe('ProgressDashboard', () => {
  it('renders stats cards', () => {
    render(<ProgressDashboard
      modules={mockModules}
      completedModules={['m1']}
      completedLessons={['l1', 'l2']}
      xp={250}
      streak={5}
      gameTimeSeconds={7200}
      badges={['early']}
      onSelectModule={vi.fn()}
    />);
    expect(screen.getByText('Learning Progress')).toBeInTheDocument();
    expect(screen.getByText('5 days')).toBeInTheDocument();
    expect(screen.getByText('2h 0m')).toBeInTheDocument();
  });

  it('renders learning path with module buttons', () => {
    const onSelect = vi.fn();
    render(<ProgressDashboard
      modules={mockModules}
      completedModules={[]}
      completedLessons={[]}
      xp={0}
      streak={0}
      gameTimeSeconds={0}
      badges={[]}
      onSelectModule={onSelect}
    />);
    expect(screen.getByText('Module 1')).toBeInTheDocument();
    expect(screen.getByText('Module 2')).toBeInTheDocument();
  });

  it('calls onSelectModule when a module is clicked', () => {
    const onSelect = vi.fn();
    render(<ProgressDashboard
      modules={mockModules}
      completedModules={[]}
      completedLessons={[]}
      xp={0}
      streak={0}
      gameTimeSeconds={0}
      badges={[]}
      onSelectModule={onSelect}
    />);
    fireEvent.click(screen.getByText('Module 1'));
    expect(onSelect).toHaveBeenCalledWith('m1');
    fireEvent.click(screen.getByText('Module 2'));
    expect(onSelect).toHaveBeenCalledWith('m2');
  });
});
