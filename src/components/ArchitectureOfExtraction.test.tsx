import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ArchitectureOfExtraction } from './ArchitectureOfExtraction';

vi.mock('motion/react', () => ({
  motion: { div: 'div' },
  AnimatePresence: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('../lib/utils', () => ({ cn: (...args: any[]) => args.filter(Boolean).join(' ') }));

describe('ArchitectureOfExtraction', () => {
  beforeEach(() => {
    render(<ArchitectureOfExtraction />);
  });

  it('renders the header title', () => {
    expect(screen.getByText('History of Black American Finance')).toBeInTheDocument();
  });

  it('renders the header subtitle', () => {
    expect(screen.getByText(/Historical Module.*10 Critical Eras/i)).toBeInTheDocument();
  });

  it('renders the description paragraph', () => {
    expect(screen.getByText(/definitive, data-grounded chronicling/i)).toBeInTheDocument();
  });

  it('renders all 10 fact module cards', () => {
    const factBadges = screen.getAllByText(/FACT \d+ •/);
    expect(factBadges).toHaveLength(10);
  });

  it('renders the first fact card with title', () => {
    expect(screen.getByText(/The Founding Debt: A System Built for Creditors/i)).toBeInTheDocument();
  });

  it('renders the last fact card with title', () => {
    expect(screen.getByText(/The Algorithmic Era: New Tools, Familiar Patterns/i)).toBeInTheDocument();
  });

  it('renders policy mechanism for the first fact', () => {
    expect(screen.getByText(/Alexander Hamilton's First Report on Public Credit/i)).toBeInTheDocument();
  });

  it('renders the who benefited section for all cards', () => {
    const benefitedLabels = screen.getAllByText('Who Benefited');
    expect(benefitedLabels).toHaveLength(10);
  });

  it('renders the who paid section for all cards', () => {
    const paidLabels = screen.getAllByText('Who Paid / Impacted');
    expect(paidLabels).toHaveLength(10);
  });

  it('renders the summary footer conclusion', () => {
    expect(screen.getByText(/Historical Conclusion & Educational Mandate/i)).toBeInTheDocument();
  });

  it('renders the footer description text', () => {
    expect(screen.getByText(/Across two and a half centuries/i)).toBeInTheDocument();
  });

  it('shows impact metric for each card', () => {
    expect(screen.getByText('$22M Debt Securitized')).toBeInTheDocument();
    expect(screen.getByText('Automated Disparate Impact at Scale')).toBeInTheDocument();
  });

  it('shows expand buttons on all fact cards initially', () => {
    const expandButtons = screen.getAllByText('Expand Fact Deep Dive');
    expect(expandButtons).toHaveLength(10);
  });

  it('expands a fact card when clicking expand', () => {
    fireEvent.click(screen.getAllByText('Expand Fact Deep Dive')[0]);
    expect(screen.getByText('Collapse Fact Analysis')).toBeInTheDocument();
    expect(screen.getByText(/The American financial system's first major act/i)).toBeInTheDocument();
  });

  it('shows key legislation when expanded', () => {
    fireEvent.click(screen.getAllByText('Expand Fact Deep Dive')[0]);
    expect(screen.getByText('Funding Act of 1790')).toBeInTheDocument();
    expect(screen.getByText('Report on Public Credit')).toBeInTheDocument();
    expect(screen.getByText('Compromise of 1790')).toBeInTheDocument();
  });

  it('collapses a fact card when clicking collapse', () => {
    fireEvent.click(screen.getAllByText('Expand Fact Deep Dive')[0]);
    expect(screen.getByText('Collapse Fact Analysis')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Collapse Fact Analysis'));
    const expandButtons = screen.getAllByText('Expand Fact Deep Dive');
    expect(expandButtons).toHaveLength(10);
  });

  it('only expands one card at a time (collapses previous)', () => {
    fireEvent.click(screen.getAllByText('Expand Fact Deep Dive')[0]);
    expect(screen.getByText('Collapse Fact Analysis')).toBeInTheDocument();
    const bodies = screen.getAllByText(/The American financial system/i);
    expect(bodies.length).toBeGreaterThanOrEqual(1);

    fireEvent.click(screen.getAllByText('Expand Fact Deep Dive')[1]);
    const collapseButtons = screen.getAllByText('Collapse Fact Analysis');
    expect(collapseButtons).toHaveLength(1);
  });

  it('renders the governance header icon', () => {
    const header = screen.getByText('History of Black American Finance');
    expect(header.closest('.bg-gradient-to-br')).toBeTruthy();
  });

  it('shows legislation header text when expanded', () => {
    fireEvent.click(screen.getAllByText('Expand Fact Deep Dive')[0]);
    expect(screen.getByText('Key Federal / Legal Frameworks:')).toBeInTheDocument();
  });

  it('renders short summary for first fact', () => {
    const summaryElement = screen.getByText(/America's initial financial stack assumed state debts/i);
    expect(summaryElement).toBeInTheDocument();
  });

  it('renders benefited text for first fact', () => {
    expect(screen.getByText('Northern financiers, war bond speculators')).toBeInTheDocument();
  });

  it('renders paid text for first fact', () => {
    expect(screen.getByText('Taxpayers, farmers, enslaved laborers')).toBeInTheDocument();
  });

  it('renders sparkles icon in the footer section', () => {
    const conclusionHeader = screen.getByText('Historical Conclusion & Educational Mandate');
    expect(conclusionHeader).toBeInTheDocument();
  });
});

describe('ArchitectureOfExtraction - Dark Mode', () => {
  it('renders correctly in dark mode wrapper', () => {
    const { container } = render(
      <div className="dark">
        <ArchitectureOfExtraction />
      </div>
    );
    expect(container.querySelector('.dark')).toBeTruthy();
    expect(screen.getByText('History of Black American Finance')).toBeInTheDocument();
    expect(screen.getAllByText('Expand Fact Deep Dive')).toHaveLength(10);
  });
});
