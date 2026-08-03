import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ConnectingTheDotsArticle } from './ConnectingTheDotsArticle';

describe('ConnectingTheDotsArticle', () => {
  it('renders the article hero header', () => {
    render(<ConnectingTheDotsArticle />);
    expect(screen.getByText('Connecting the Dots: How America\'s Financial Systems Actually Work Together')).toBeInTheDocument();
  });

  it('renders the curriculum feature badge', () => {
    render(<ConnectingTheDotsArticle />);
    expect(screen.getByText('Curriculum Feature Article • 2026 Systems Architecture')).toBeInTheDocument();
  });

  it('renders the intro paragraph', () => {
    render(<ConnectingTheDotsArticle />);
    expect(screen.getByText(/water system for an entire city/)).toBeInTheDocument();
  });

  it('renders all six module headings', () => {
    render(<ConnectingTheDotsArticle />);
    expect(screen.getByText(/1\. The Federal Reserve sets the water pressure/)).toBeInTheDocument();
    expect(screen.getByText(/2\. Banks don't store money/)).toBeInTheDocument();
    expect(screen.getByText(/3\. Your credit score is the meter/)).toBeInTheDocument();
    expect(screen.getByText(/4\. Fintech apps are new faucets/)).toBeInTheDocument();
    expect(screen.getByText(/5\. Regulators are the utility inspector/)).toBeInTheDocument();
    expect(screen.getByText(/6\. Community institutions are a second/)).toBeInTheDocument();
  });

  it('renders the full loop recap section', () => {
    render(<ConnectingTheDotsArticle />);
    expect(screen.getByText('The Full Loop Traced In One Pass')).toBeInTheDocument();
  });

  it('renders the 2026 monetary policy context', () => {
    render(<ConnectingTheDotsArticle />);
    expect(screen.getByText('2026 Monetary Policy Context')).toBeInTheDocument();
  });

  it('renders the Bank of England research callout', () => {
    render(<ConnectingTheDotsArticle />);
    expect(screen.getByText('Bank of England Landmark Research')).toBeInTheDocument();
  });

  it('renders the algorithmic settlement case study', () => {
    render(<ConnectingTheDotsArticle />);
    expect(screen.getByText(/July 2025 Algorithmic Settlement/)).toBeInTheDocument();
  });

  it('renders all six recap list items', () => {
    render(<ConnectingTheDotsArticle />);
    expect(screen.getAllByText(/The Fed/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Banks/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Credit bureaus/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Fintech apps/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Regulators/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Community institutions/).length).toBeGreaterThanOrEqual(1);
  });
});
