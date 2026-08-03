import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NotFound } from './NotFound';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('NotFound', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders the 404 heading', () => {
    render(<NotFound />);
    expect(screen.getByText('404')).toBeInTheDocument();
  });

  it('renders the not-found message', () => {
    render(<NotFound />);
    expect(screen.getByText(/This page doesn't exist/i)).toBeInTheDocument();
  });

  it('renders a back to dashboard button', () => {
    render(<NotFound />);
    expect(screen.getByText('Back to Dashboard')).toBeInTheDocument();
  });

  it('navigates to dashboard on button click', () => {
    render(<NotFound />);
    fireEvent.click(screen.getByText('Back to Dashboard'));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
