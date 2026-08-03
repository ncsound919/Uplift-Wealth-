import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingFallback } from './LoadingFallback';

describe('LoadingFallback', () => {
  it('renders default label', () => {
    render(<LoadingFallback />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders custom label', () => {
    render(<LoadingFallback label="Fetching data..." />);
    expect(screen.getByText('Fetching data...')).toBeInTheDocument();
  });
});
