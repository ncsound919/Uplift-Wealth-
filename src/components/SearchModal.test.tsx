import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchModal } from './SearchModal';

const mockNavigate = vi.fn();

vi.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
}));

const mockSearch = vi.fn();
const mockGetTypeLabel = vi.fn();
const mockGetTypeColor = vi.fn();

vi.mock('../lib/searchIndex', () => ({
  search: (...args: any[]) => mockSearch(...args),
  getTypeLabel: (...args: any[]) => mockGetTypeLabel(...args),
  getTypeColor: (...args: any[]) => mockGetTypeColor(...args),
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

describe('SearchModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockSearch.mockReturnValue([]);
    mockGetTypeLabel.mockReturnValue('Module');
    mockGetTypeColor.mockReturnValue('text-blue-600');
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(<SearchModal isOpen={false} onClose={mockOnClose} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders when isOpen is true', () => {
    render(<SearchModal isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByPlaceholderText('Search modules, lessons, concepts...')).toBeInTheDocument();
  });

  it('clears query when opened', () => {
    const { rerender } = render(<SearchModal isOpen={false} onClose={mockOnClose} />);
    rerender(<SearchModal isOpen={true} onClose={mockOnClose} />);
    const input = screen.getByPlaceholderText('Search modules, lessons, concepts...') as HTMLInputElement;
    expect(input.value).toBe('');
  });

  it('input change triggers search', () => {
    render(<SearchModal isOpen={true} onClose={mockOnClose} />);
    const input = screen.getByPlaceholderText('Search modules, lessons, concepts...');
    fireEvent.change(input, { target: { value: 'finance' } });
    expect(mockSearch).toHaveBeenCalledWith('finance', 12);
  });

  it('shows results when found', () => {
    mockSearch.mockReturnValue([
      { id: 'm1', type: 'module', title: 'Finance 101', subtitle: 'Module', route: '/module/finance-101' },
    ]);
    render(<SearchModal isOpen={true} onClose={mockOnClose} />);
    const input = screen.getByPlaceholderText('Search modules, lessons, concepts...');
    fireEvent.change(input, { target: { value: 'finance' } });
    expect(screen.getByText('Finance 101')).toBeInTheDocument();
  });

  it('shows no results message for empty results', () => {
    mockSearch.mockReturnValue([]);
    render(<SearchModal isOpen={true} onClose={mockOnClose} />);
    const input = screen.getByPlaceholderText('Search modules, lessons, concepts...');
    fireEvent.change(input, { target: { value: 'zzzzz' } });
    expect(screen.getByText(/No results found for/)).toBeInTheDocument();
  });

  it('closes on ESC key press', () => {
    render(<SearchModal isOpen={true} onClose={mockOnClose} />);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('closes when backdrop clicked', () => {
    const { container } = render(<SearchModal isOpen={true} onClose={mockOnClose} />);
    const backdrop = container.querySelector('[class*="fixed"]');
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(mockOnClose).toHaveBeenCalled();
    }
  });

  it('click result calls navigate and onClose', () => {
    mockSearch.mockReturnValue([
      { id: 'm1', type: 'module', title: 'Finance 101', subtitle: 'Module', route: '/module/finance-101' },
    ]);
    render(<SearchModal isOpen={true} onClose={mockOnClose} />);
    const input = screen.getByPlaceholderText('Search modules, lessons, concepts...');
    fireEvent.change(input, { target: { value: 'finance' } });
    fireEvent.click(screen.getByText('Finance 101'));
    expect(mockNavigate).toHaveBeenCalledWith('/module/finance-101');
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('keyboard navigation: ArrowDown selects next result', () => {
    mockSearch.mockReturnValue([
      { id: 'm1', type: 'module', title: 'Result 1', subtitle: 'First', route: '/r1' },
      { id: 'm2', type: 'lesson', title: 'Result 2', subtitle: 'Second', route: '/r2' },
    ]);
    render(<SearchModal isOpen={true} onClose={mockOnClose} />);
    const input = screen.getByPlaceholderText('Search modules, lessons, concepts...');
    fireEvent.change(input, { target: { value: 'test' } });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(mockNavigate).toHaveBeenCalledWith('/r2');
  });

  it('keyboard navigation: ArrowUp goes to previous result', () => {
    mockSearch.mockReturnValue([
      { id: 'm1', type: 'module', title: 'Result 1', subtitle: 'First', route: '/r1' },
      { id: 'm2', type: 'lesson', title: 'Result 2', subtitle: 'Second', route: '/r2' },
    ]);
    render(<SearchModal isOpen={true} onClose={mockOnClose} />);
    const input = screen.getByPlaceholderText('Search modules, lessons, concepts...');
    fireEvent.change(input, { target: { value: 'test' } });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(mockNavigate).toHaveBeenCalledWith('/r1');
  });

  it('clears results when query is whitespace only', () => {
    render(<SearchModal isOpen={true} onClose={mockOnClose} />);
    const input = screen.getByPlaceholderText('Search modules, lessons, concepts...');
    fireEvent.change(input, { target: { value: '  ' } });
    expect(mockSearch).not.toHaveBeenCalled();
  });
});
