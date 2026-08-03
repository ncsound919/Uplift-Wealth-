import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FinanceGlossary, FINANCE_GLOSSARY_TERMS } from './FinanceGlossary';

vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: any) => {
      const { animate, transition, initial, exit, layout, ...rest } = props;
      return <div {...rest}>{children}</div>;
    },
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('FinanceGlossary', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the header', () => {
    render(<FinanceGlossary />);
    expect(screen.getByText(/The Finance.*FinTech Dictionary/i)).toBeInTheDocument();
  });

  it('shows all terms in dictionary mode', () => {
    render(<FinanceGlossary />);
    expect(screen.getByText(FINANCE_GLOSSARY_TERMS[0].term)).toBeInTheDocument();
  });

  it('filters terms by search query', () => {
    render(<FinanceGlossary />);
    const input = screen.getByPlaceholderText(/Search terms/i);
    fireEvent.change(input, { target: { value: 'FedNow' } });
    expect(screen.getByText('FedNow Rail')).toBeInTheDocument();
  });

  it('switches to flashcards mode', () => {
    render(<FinanceGlossary />);
    fireEvent.click(screen.getByText('Flashcard Recall'));
    expect(screen.getByText(/Click Card to Flip/i)).toBeInTheDocument();
  });

  it('shows bookmarks filter count', () => {
    render(<FinanceGlossary />);
    const bookmarkButtons = screen.getAllByTitle(/Save to Bookmarks/i);
    fireEvent.click(bookmarkButtons[0]);
    expect(screen.getByText(/Bookmarks \(1\)/i)).toBeInTheDocument();
  });

  it('clears search query with clear button', () => {
    render(<FinanceGlossary />);
    const input = screen.getByPlaceholderText(/Search terms/i);
    fireEvent.change(input, { target: { value: 'FedNow' } });
    expect(screen.getByText('FedNow Rail')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Clear'));
    expect(screen.getByText(FINANCE_GLOSSARY_TERMS[0].term)).toBeInTheDocument();
  });

  it('filters by category', () => {
    render(<FinanceGlossary />);
    const cryptoFilters = screen.getAllByText('Crypto & Web3');
    fireEvent.click(cryptoFilters[0]);
    const terms = screen.getAllByText(/Blockchain|Smart Contract|AMM|Stablecoin|Cold Wallet|Gas Fee/);
    expect(terms.length).toBeGreaterThan(0);
  });

  it('filters by bookmarks category', () => {
    render(<FinanceGlossary />);
    const bookmarkButtons = screen.getAllByTitle(/Save to Bookmarks/i);
    fireEvent.click(bookmarkButtons[0]);
    const bookmarkFilters = screen.getAllByText(/Bookmarks/);
    fireEvent.click(bookmarkFilters[0]);
    expect(screen.getByText(FINANCE_GLOSSARY_TERMS[0].term)).toBeInTheDocument();
  });

  it('shows no terms found for unmatched search', () => {
    render(<FinanceGlossary />);
    const input = screen.getByPlaceholderText(/Search terms/i);
    fireEvent.change(input, { target: { value: 'XYZZYX' } });
    expect(screen.getByText('No Terms Found')).toBeInTheDocument();
  });

  it('resets filters from empty state', () => {
    render(<FinanceGlossary />);
    const input = screen.getByPlaceholderText(/Search terms/i);
    fireEvent.change(input, { target: { value: 'XYZZYX' } });
    expect(screen.getByText('No Terms Found')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Reset Filters'));
    expect(screen.getAllByText(FINANCE_GLOSSARY_TERMS[0].term).length).toBeGreaterThan(0);
  });

  it('toggles bookmark off', () => {
    render(<FinanceGlossary />);
    const saveButtons = screen.getAllByTitle(/Save to Bookmarks/i);
    fireEvent.click(saveButtons[0]);
    expect(screen.getByText(/Bookmarks \(1\)/i)).toBeInTheDocument();
    const removeButtons = screen.getAllByTitle(/Remove Bookmark/i);
    fireEvent.click(removeButtons[0]);
    expect(screen.getByText(/Bookmarks \(0\)/i)).toBeInTheDocument();
  });

  it('shows saved count when bookmarked', () => {
    render(<FinanceGlossary />);
    expect(screen.queryByText(/Saved/)).not.toBeInTheDocument();
    fireEvent.click(screen.getAllByTitle(/Save to Bookmarks/i)[0]);
    expect(screen.getByText(/1 Saved/)).toBeInTheDocument();
  });

  it('renders flashcard view with first term', () => {
    render(<FinanceGlossary />);
    fireEvent.click(screen.getByText('Flashcard Recall'));
    expect(screen.getByText(/Flashcard 1 of/)).toBeInTheDocument();
  });

  it('navigates to next flashcard', async () => {
    render(<FinanceGlossary />);
    fireEvent.click(screen.getByText('Flashcard Recall'));
    fireEvent.click(screen.getByText(/Next Term/));
    await waitFor(() => expect(screen.getByText(/Flashcard 2 of/)).toBeInTheDocument());
  });

  it('navigates to previous flashcard', async () => {
    render(<FinanceGlossary />);
    fireEvent.click(screen.getByText('Flashcard Recall'));
    fireEvent.click(screen.getByText(/Next Term/));
    await waitFor(() => expect(screen.getByText(/Flashcard 2 of/)).toBeInTheDocument());
    fireEvent.click(screen.getByText(/Previous Term/));
    await waitFor(() => expect(screen.getByText(/Flashcard 1 of/)).toBeInTheDocument());
  });

  it('flips flashcard via Flip Card button', () => {
    render(<FinanceGlossary />);
    fireEvent.click(screen.getByText('Flashcard Recall'));
    expect(screen.getByText(/Tap to Reveal Answer/)).toBeInTheDocument();
    fireEvent.click(screen.getByText('Flip Card'));
    expect(screen.getByText(/Memory Recall Checked/)).toBeInTheDocument();
  });

  it('flips flashcard by clicking the card itself', () => {
    render(<FinanceGlossary />);
    fireEvent.click(screen.getByText('Flashcard Recall'));
    expect(screen.getByText(/Tap to Reveal Answer/)).toBeInTheDocument();
    const card = screen.getByText('Click Card to Flip').closest('[class*="cursor-pointer"]');
    if (card) fireEvent.click(card);
    expect(screen.getByText(/Memory Recall Checked/)).toBeInTheDocument();
  });

  it('switches back to dictionary mode from flashcards', () => {
    render(<FinanceGlossary />);
    fireEvent.click(screen.getByText('Flashcard Recall'));
    expect(screen.getByText(/Click Card to Flip/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText('Dictionary'));
    expect(screen.getByText(/Showing .* Terms/)).toBeInTheDocument();
  });

  it('shows category label on each term card', () => {
    render(<FinanceGlossary />);
    const basicsLabels = screen.getAllByText('Basics');
    expect(basicsLabels.length).toBeGreaterThan(0);
  });

  it('renders all category filter buttons', () => {
    render(<FinanceGlossary />);
    const insurTechElements = screen.getAllByText('InsurTech');
    expect(insurTechElements.length).toBeGreaterThan(0);
    const ethicsElements = screen.getAllByText('Ethics & Compliance');
    expect(ethicsElements.length).toBeGreaterThan(0);
  });

  it('handles malformed localStorage gracefully', () => {
    localStorage.setItem('glossary_bookmarks', '{bad json');
    render(<FinanceGlossary />);
    expect(screen.getByText(FINANCE_GLOSSARY_TERMS[0].term)).toBeInTheDocument();
  });

  it('filters by search in definition', () => {
    render(<FinanceGlossary />);
    const input = screen.getByPlaceholderText(/Search terms/i);
    fireEvent.change(input, { target: { value: 'medium of exchange' } });
    expect(screen.getByText('Money')).toBeInTheDocument();
  });

  it('filters by search in example', () => {
    render(<FinanceGlossary />);
    const input = screen.getByPlaceholderText(/Search terms/i);
    fireEvent.change(input, { target: { value: 'Chase' } });
    expect(screen.getByText('Phishing')).toBeInTheDocument();
  });
});
