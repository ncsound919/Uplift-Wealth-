import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Certificate } from './Certificate';

const defaultProps = {
  userName: 'Alice Johnson',
  moduleTitle: 'Financial Literacy 101',
  completedDate: '2026-06-15',
  certId: 'CERT-ABC-123',
  onClose: vi.fn(),
};

vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: any) => {
      const { animate, transition, initial, exit, ...rest } = props;
      return <div {...rest}>{children}</div>;
    },
  },
}));

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Certificate', () => {
  it('renders user name, module title, and cert ID', () => {
    render(<Certificate {...defaultProps} />);
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    expect(screen.getByText('Financial Literacy 101')).toBeInTheDocument();
    expect(screen.getByText('ID: CERT-ABC-123')).toBeInTheDocument();
  });

  it('renders completed date', () => {
    render(<Certificate {...defaultProps} />);
    expect(screen.getByText('2026-06-15')).toBeInTheDocument();
  });

  it('shows score badge when score prop is provided', () => {
    render(<Certificate {...defaultProps} score={92} />);
    expect(screen.getByText('Score: 92%')).toBeInTheDocument();
  });

  it('hides score badge when score prop is omitted', () => {
    render(<Certificate {...defaultProps} />);
    expect(screen.queryByText(/Score:/)).not.toBeInTheDocument();
  });

  it('calls onClose when close button clicked', () => {
    render(<Certificate {...defaultProps} />);
    fireEvent.click(screen.getByText('Close'));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when backdrop clicked', () => {
    render(<Certificate {...defaultProps} />);
    const backdrop = screen.getByText('Close').closest('[class*="fixed"]');
    if (backdrop) fireEvent.click(backdrop);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('opens print window on download click', () => {
    const mockDoc = { write: vi.fn(), close: vi.fn() };
    const mockWin = { document: mockDoc, focus: vi.fn(), print: vi.fn() };
    const mockOpen = vi.fn(() => mockWin);
    vi.stubGlobal('open', mockOpen);

    render(<Certificate {...defaultProps} />);
    fireEvent.click(screen.getByText('Download PDF'));
    expect(mockOpen).toHaveBeenCalledWith('', '_blank');
    expect(mockDoc.write).toHaveBeenCalled();
    expect(mockDoc.close).toHaveBeenCalled();
    expect(mockWin.focus).toHaveBeenCalled();
  });

  it('handles download when window.open returns null', () => {
    vi.stubGlobal('open', vi.fn(() => null));
    render(<Certificate {...defaultProps} />);
    expect(() => fireEvent.click(screen.getByText('Download PDF'))).not.toThrow();
  });

  it('calls print in the new window after the delay', () => {
    vi.useFakeTimers();
    try {
      const mockDoc = { write: vi.fn(), close: vi.fn() };
      const mockWin = { document: mockDoc, focus: vi.fn(), print: vi.fn() };
      const mockOpen = vi.fn(() => mockWin);
      vi.stubGlobal('open', mockOpen);

      render(<Certificate {...defaultProps} />);
      fireEvent.click(screen.getByText('Download PDF'));
      expect(mockOpen).toHaveBeenCalledWith('', '_blank');
      expect(mockDoc.write).toHaveBeenCalled();
      expect(mockWin.print).not.toHaveBeenCalled();

      act(() => { vi.advanceTimersByTime(500); });
      expect(mockWin.print).toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });
});
