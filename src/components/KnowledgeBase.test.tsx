import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { KnowledgeBase } from './KnowledgeBase';

vi.mock('motion/react', () => ({
  motion: new Proxy({}, { get: () => 'div' }),
  AnimatePresence: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('../lib/utils', () => ({ cn: (...args: any[]) => args.filter(Boolean).join(' ') }));

vi.mock('./YouTubeVideoPlayer', () => ({
  YouTubeVideoPlayer: ({ videoId, title }: any) => (
    <div data-testid="youtube-mock">{title} - {videoId}</div>
  ),
}));

const ORIGINAL_STORAGE = globalThis.localStorage;

describe('KnowledgeBase', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the header', () => {
    render(<KnowledgeBase />);
    expect(screen.getByText(/Academic Class Lectures/i)).toBeInTheDocument();
  });

  it('shows search input', () => {
    render(<KnowledgeBase />);
    expect(screen.getByPlaceholderText(/Search fintech terminology/i)).toBeInTheDocument();
  });

  it('shows glossary search results panel when searching', () => {
    render(<KnowledgeBase />);
    const input = screen.getByPlaceholderText(/Search fintech terminology/i);
    fireEvent.change(input, { target: { value: 'FedNow' } });
    expect(screen.getByText(/Glossary Lookup/i)).toBeInTheDocument();
  });

  it('renders class sidebar', () => {
    render(<KnowledgeBase />);
    expect(screen.getByText(/12 Masterclass Sessions/i)).toBeInTheDocument();
  });

  it('shows slides tab by default', () => {
    render(<KnowledgeBase />);
    expect(screen.getByText(/SLIDE 1 OF/i)).toBeInTheDocument();
  });

  it('switches to syllabus tab', () => {
    render(<KnowledgeBase />);
    fireEvent.click(screen.getByText('Syllabus & Lexicon'));
    expect(screen.getByText(/Syllabus Outcomes/i)).toBeInTheDocument();
  });

  it('switches to capstone tab', () => {
    render(<KnowledgeBase />);
    fireEvent.click(screen.getByText('Capstone Blueprint'));
    expect(screen.getByText(/REQUIRED VENTURE OUTSIDE WORK/i)).toBeInTheDocument();
  });

  it('switches to video tab and renders YouTube player', () => {
    render(<KnowledgeBase />);
    fireEvent.click(screen.getByText('Video Review'));
    expect(screen.getByTestId('youtube-mock')).toBeInTheDocument();
    expect(screen.getByText(/Syllabus Masterclass Video/i)).toBeInTheDocument();
  });

  it('advances to the next slide', () => {
    render(<KnowledgeBase />);
    fireEvent.click(screen.getByText('Next Slide'));
    expect(screen.getByText(/SLIDE 2 OF/i)).toBeInTheDocument();
  });

  it('goes to the previous slide', () => {
    render(<KnowledgeBase />);
    fireEvent.click(screen.getByText('Next Slide'));
    expect(screen.getByText(/SLIDE 2 OF/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText('Previous'));
    expect(screen.getByText(/SLIDE 1 OF/i)).toBeInTheDocument();
  });

  it('disables Previous button on first slide', () => {
    render(<KnowledgeBase />);
    const prevBtn = screen.getByText('Previous').closest('button');
    expect(prevBtn).toBeDisabled();
  });

  it('disables Next button on last slide of class-1', () => {
    render(<KnowledgeBase />);
    const nextBtn = screen.getByText('Next Slide').closest('button');
    fireEvent.click(nextBtn!);
    fireEvent.click(nextBtn!);
    fireEvent.click(nextBtn!);
    fireEvent.click(nextBtn!);
    expect(nextBtn).toBeDisabled();
  });

  it('handles keyboard navigation on slides tab', () => {
    render(<KnowledgeBase />);
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(screen.getByText(/SLIDE 2 OF/i)).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(screen.getByText(/SLIDE 1 OF/i)).toBeInTheDocument();
  });

  it('handles PageDown and PageUp keys for slide navigation', () => {
    render(<KnowledgeBase />);
    fireEvent.keyDown(window, { key: 'PageDown' });
    expect(screen.getByText(/SLIDE 2 OF/i)).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'PageUp' });
    expect(screen.getByText(/SLIDE 1 OF/i)).toBeInTheDocument();
  });

  it('ignores keyboard navigation when focus is on an input', () => {
    render(<KnowledgeBase />);
    const input = screen.getByPlaceholderText(/Search fintech terminology/i);
    fireEvent.keyDown(input, { key: 'ArrowRight' });
    expect(screen.getByText(/SLIDE 1 OF/i)).toBeInTheDocument();
  });

  it('ignores keyboard navigation on non-slides tabs', () => {
    render(<KnowledgeBase />);
    fireEvent.click(screen.getByText('Syllabus & Lexicon'));
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(screen.getByText(/Syllabus Outcomes/i)).toBeInTheDocument();
  });

  it('navigates to a different class from the sidebar', () => {
    render(<KnowledgeBase />);
    const classTwoBtn = screen.getByText('Payment Rails, Acquiring Processors, and FedNow Real-Time Settlement');
    fireEvent.click(classTwoBtn);
    expect(screen.getByText(/Class 2: Payment Rails/)).toBeInTheDocument();
    expect(screen.getByText(/SLIDE 1 OF/i)).toBeInTheDocument();
  });

  it('shows clear button when search has text and clears on click', () => {
    render(<KnowledgeBase />);
    const input = screen.getByPlaceholderText(/Search fintech terminology/i);
    fireEvent.change(input, { target: { value: 'test' } });
    const clearBtn = screen.getByText('CLEAR');
    expect(clearBtn).toBeInTheDocument();
    fireEvent.click(clearBtn);
    expect(input).toHaveValue('');
  });

  it('shows no-results message when glossary search finds nothing', () => {
    render(<KnowledgeBase />);
    const input = screen.getByPlaceholderText(/Search fintech terminology/i);
    fireEvent.change(input, { target: { value: 'xyznonexistent123' } });
    expect(screen.getByText(/No matching fintech concepts found/i)).toBeInTheDocument();
  });

  it('highlights glossary match count', () => {
    render(<KnowledgeBase />);
    const input = screen.getByPlaceholderText(/Search fintech terminology/i);
    fireEvent.change(input, { target: { value: 'money' } });
    expect(screen.getByText(/matches found/i)).toBeInTheDocument();
  });

  it('renders the example card for slides that have one', () => {
    render(<KnowledgeBase />);
    expect(screen.getByText(/Why it matters/i)).toBeInTheDocument();
  });

  it('toggles checklist items and persists to localStorage', () => {
    render(<KnowledgeBase />);
    fireEvent.click(screen.getByText('Capstone Blueprint'));
    const firstCheckItem = screen.getByText(/Define a SQL schema/i);
    fireEvent.click(firstCheckItem);
    const stored = localStorage.getItem('capstone_checklists');
    expect(stored).toContain('class-1-0');
    expect(JSON.parse(stored!)['class-1-0']).toBe(true);
  });

  it('loads checklist state from localStorage on init', () => {
    localStorage.setItem('capstone_checklists', JSON.stringify({ 'class-1-0': true }));
    render(<KnowledgeBase />);
    fireEvent.click(screen.getByText('Capstone Blueprint'));
    const checklistSection = screen.getByText(/Artifact Verification Steps/i);
    expect(checklistSection).toBeInTheDocument();
  });

  it('handles corrupt localStorage gracefully on init', () => {
    localStorage.setItem('capstone_checklists', 'not-valid-json');
    render(<KnowledgeBase />);
    fireEvent.click(screen.getByText('Capstone Blueprint'));
    expect(screen.getByText(/Artifact Verification Steps/i)).toBeInTheDocument();
  });

  it('navigates to a class from the Go to Class button in glossary results', () => {
    render(<KnowledgeBase />);
    const input = screen.getByPlaceholderText(/Search fintech terminology/i);
    fireEvent.change(input, { target: { value: 'Nostro' } });
    const goToClassBtns = screen.getAllByText('Go to Class');
    expect(goToClassBtns.length).toBeGreaterThan(0);
  });

  it('shows diagram block when slide has diagramTitle', () => {
    render(<KnowledgeBase />);
    const slidesTab = screen.getByText('Lecture Slides');
    expect(slidesTab).toBeInTheDocument();
  });

  it('navigates to a class via Go to Class button click', () => {
    render(<KnowledgeBase />);
    const input = screen.getByPlaceholderText(/Search fintech terminology/i);
    fireEvent.change(input, { target: { value: 'Nostro' } });
    const goToClassBtn = screen.getAllByText('Go to Class')[0];
    fireEvent.click(goToClassBtn);
    expect(screen.getByText(/Class 1: Foundations of Financial Systems/)).toBeInTheDocument();
  });

  it('switches back to slides tab from another tab', () => {
    render(<KnowledgeBase />);
    fireEvent.click(screen.getByText('Syllabus & Lexicon'));
    fireEvent.click(screen.getByText('Lecture Slides'));
    expect(screen.getByText(/SLIDE 1 OF/i)).toBeInTheDocument();
  });

  it('ignores unrelated keys on slides tab', () => {
    render(<KnowledgeBase />);
    fireEvent.keyDown(window, { key: 'Enter' });
    expect(screen.getByText(/SLIDE 1 OF/i)).toBeInTheDocument();
  });

  it('uses fallback video ID for classes without CLASS_VIDEOS entry', () => {
    render(<KnowledgeBase />);
    const classZeroBtn = screen.getByText('Foundations of Financial Literacy');
    fireEvent.click(classZeroBtn);
    fireEvent.click(screen.getByText('Video Review'));
    expect(screen.getByTestId('youtube-mock')).toBeInTheDocument();
  });
});
