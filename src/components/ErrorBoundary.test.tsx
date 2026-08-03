import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

const ProblemChild = ({ shouldThrow, errorMessage = 'Test error' }: { shouldThrow: boolean; errorMessage?: string }) => {
  if (shouldThrow) throw new Error(errorMessage);
  return <div>All good</div>;
};

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <div>Safe content</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('Safe content')).toBeInTheDocument();
  });

  it('renders fallback UI when child throws', () => {
    // Suppress console.error from React for this expected error
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();
    expect(screen.getByText('Reload Page')).toBeInTheDocument();

    spy.mockRestore();
  });

  it('renders custom fallback when provided', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary fallback={<div>Custom error UI</div>}>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error UI')).toBeInTheDocument();

    spy.mockRestore();
  });

  it('shows default error message when error has no message', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const ChildWithEmptyError = () => { throw new Error(''); };
    render(
      <ErrorBoundary>
        <ChildWithEmptyError />
      </ErrorBoundary>
    );

    expect(screen.getByText('An unexpected error occurred.')).toBeInTheDocument();

    spy.mockRestore();
  });

  it('reloads page when Reload Page button is clicked', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const reloadSpy = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: reloadSpy },
      writable: true,
    });

    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>
    );

    fireEvent.click(screen.getByText('Reload Page'));
    expect(reloadSpy).toHaveBeenCalled();

    spy.mockRestore();
  });
});
