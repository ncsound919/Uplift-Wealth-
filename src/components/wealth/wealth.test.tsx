import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { MarkCompleteButton } from './MarkCompleteButton';
import { CreditActionPlan } from './tools/CreditActionPlan';
import { RealEstateAnalyzer } from './tools/RealEstateAnalyzer';
import { BusinessViabilityCalculator } from './tools/BusinessViabilityCalculator';
import { GroupPoolCalculator } from './tools/GroupPoolCalculator';
import { SideHustleCalculator } from './tools/SideHustleCalculator';
import { EmergencyFundCalculator } from './tools/EmergencyFundCalculator';
import { ChapterShell } from './ChapterShell';
import { wealthChapters } from '../../data/wealthChapters';

vi.mock('remark-math', () => ({ default: () => () => {} }));
vi.mock('rehype-katex', () => ({ default: () => () => {} }));

const mockNavigate = vi.fn();
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return { ...actual, useNavigate: () => mockNavigate };
});

describe('MarkCompleteButton', () => {
  it('shows mark complete when not complete', () => {
    render(<MarkCompleteButton chapterId="test" isComplete={false} onToggle={vi.fn()} />);
    expect(screen.getByText(/Mark Complete/i)).toBeInTheDocument();
  });
  it('shows completed when complete', () => {
    render(<MarkCompleteButton chapterId="test" isComplete={true} onToggle={vi.fn()} />);
    expect(screen.getByText(/Completed/i)).toBeInTheDocument();
  });
  it('calls onToggle with chapterId on click', () => {
    const onToggle = vi.fn();
    render(<MarkCompleteButton chapterId="credit" isComplete={false} onToggle={onToggle} />);
    fireEvent.click(screen.getByText(/Mark Complete/i));
    expect(onToggle).toHaveBeenCalledWith('credit');
  });
});

describe('useChapterCompletion', () => {
  beforeEach(() => localStorage.clear());
  it('initializes empty', async () => {
    const { useChapterCompletion } = await import('../../hooks/useChapterCompletion');
    const { result } = renderHook(() => useChapterCompletion());
    expect(result.current.isComplete('credit')).toBe(false);
  });
  it('reads existing completion', async () => {
    localStorage.setItem('wealth_chapters_completed', JSON.stringify(['credit']));
    const { useChapterCompletion } = await import('../../hooks/useChapterCompletion');
    const { result } = renderHook(() => useChapterCompletion());
    expect(result.current.isComplete('credit')).toBe(true);
  });
  it('writes on markComplete', async () => {
    const { useChapterCompletion } = await import('../../hooks/useChapterCompletion');
    const { result } = renderHook(() => useChapterCompletion());
    result.current.markComplete('investing');
    expect(JSON.parse(localStorage.getItem('wealth_chapters_completed')!)).toContain('investing');
  });
  it('resets all', async () => {
    localStorage.setItem('wealth_chapters_completed', JSON.stringify(['credit', 'investing']));
    const { useChapterCompletion } = await import('../../hooks/useChapterCompletion');
    const { result } = renderHook(() => useChapterCompletion());
    result.current.reset();
    expect(localStorage.getItem('wealth_chapters_completed')).toBeNull();
  });
});

describe('tools', () => {
  it('CreditActionPlan renders', () => {
    render(<CreditActionPlan />);
    expect(screen.getByText(/Credit Action Plan/i)).toBeInTheDocument();
  });
  it('RealEstateAnalyzer renders', () => {
    render(<RealEstateAnalyzer />);
    expect(screen.getByText(/Cap Rate/i)).toBeInTheDocument();
  });
  it('BusinessViabilityCalculator renders', () => {
    render(<BusinessViabilityCalculator />);
    expect(screen.getByText(/Break-even/i)).toBeInTheDocument();
  });
  it('GroupPoolCalculator renders', () => {
    render(<GroupPoolCalculator />);
    expect(screen.getByText(/Per Member/i)).toBeInTheDocument();
  });
  it('SideHustleCalculator renders', () => {
    render(<SideHustleCalculator />);
    expect(screen.getByText(/Side Hustle Calculator/i)).toBeInTheDocument();
  });
  it('EmergencyFundCalculator renders', () => {
    render(<EmergencyFundCalculator />);
    expect(screen.getByText(/Emergency Fund Calculator/i)).toBeInTheDocument();
  });
});

describe('WealthBuilding hub', () => {
  beforeEach(() => localStorage.clear());
  it('renders all 7 chapter titles', async () => {
    const { WealthBuilding } = await import('../WealthBuilding');
    render(<MemoryRouter><WealthBuilding /></MemoryRouter>);
    expect(screen.getByText('Credit Mastery')).toBeInTheDocument();
    expect(screen.getByText('Investing & IRAs')).toBeInTheDocument();
    expect(screen.getByText('Real Estate')).toBeInTheDocument();
    expect(screen.getByText('Business Building')).toBeInTheDocument();
    expect(screen.getByText('Group Economics')).toBeInTheDocument();
    expect(screen.getByText('Side Hustles & Gig Income')).toBeInTheDocument();
    expect(screen.getByText('Cash Flow & Emergency Fund')).toBeInTheDocument();
  });
  it('shows correct completion count', async () => {
    localStorage.setItem('wealth_chapters_completed', JSON.stringify(['credit', 'investing']));
    const { WealthBuilding } = await import('../WealthBuilding');
    render(<MemoryRouter><WealthBuilding /></MemoryRouter>);
    expect(screen.getByText('2 / 7')).toBeInTheDocument();
  });
});

describe('chapter components', () => {
  it('CreditMastery renders chapter title', async () => {
    const { CreditMastery } = await import('./CreditMastery');
    render(<MemoryRouter><CreditMastery /></MemoryRouter>);
    expect(screen.getByText('Credit Mastery')).toBeInTheDocument();
  });
  it('InvestingIRAs renders chapter title', async () => {
    const { InvestingIRAs } = await import('./InvestingIRAs');
    render(<MemoryRouter><InvestingIRAs /></MemoryRouter>);
    expect(screen.getByText('Investing & IRAs')).toBeInTheDocument();
  });
  it('RealEstate renders chapter title', async () => {
    const { RealEstate } = await import('./RealEstate');
    render(<MemoryRouter><RealEstate /></MemoryRouter>);
    expect(screen.getByText('Real Estate')).toBeInTheDocument();
  });
  it('BusinessBuilding renders chapter title', async () => {
    const { BusinessBuilding } = await import('./BusinessBuilding');
    render(<MemoryRouter><BusinessBuilding /></MemoryRouter>);
    expect(screen.getByText('Business Building')).toBeInTheDocument();
  });
  it('GroupEconomics renders chapter title', async () => {
    const { GroupEconomics } = await import('./GroupEconomics');
    render(<MemoryRouter><GroupEconomics /></MemoryRouter>);
    expect(screen.getByText('Group Economics')).toBeInTheDocument();
  });
  it('SideHustles renders chapter title', async () => {
    const { SideHustles } = await import('./SideHustles');
    render(<MemoryRouter><SideHustles /></MemoryRouter>);
    expect(screen.getByText('Side Hustles & Gig Income')).toBeInTheDocument();
  });
  it('EmergencyFund renders chapter title', async () => {
    const { EmergencyFund } = await import('./EmergencyFund');
    render(<MemoryRouter><EmergencyFund /></MemoryRouter>);
    expect(screen.getByText('Cash Flow & Emergency Fund')).toBeInTheDocument();
  });
});

describe('ChapterShell', () => {
  beforeEach(() => {
    localStorage.clear();
    mockNavigate.mockClear();
  });

  it('renders chapter title, subtitle, and estimated minutes', () => {
    const chapter = wealthChapters[0];
    render(<MemoryRouter><ChapterShell chapter={chapter} tool={<div>test tool</div>} /></MemoryRouter>);
    expect(screen.getByText('Credit Mastery')).toBeInTheDocument();
    expect(screen.getByText(/Building the foundation/i)).toBeInTheDocument();
    expect(screen.getByText(/12 min read/i)).toBeInTheDocument();
  });

  it('renders the tool component', () => {
    const chapter = wealthChapters[0];
    render(<MemoryRouter><ChapterShell chapter={chapter} tool={<div>Custom Tool Content</div>} /></MemoryRouter>);
    expect(screen.getByText('Custom Tool Content')).toBeInTheDocument();
  });

  it('back button navigates to /wealth-building', () => {
    const chapter = wealthChapters[0];
    render(<MemoryRouter><ChapterShell chapter={chapter} tool={<div>tool</div>} /></MemoryRouter>);
    fireEvent.click(screen.getByText(/Back to Wealth Building/i));
    expect(mockNavigate).toHaveBeenCalledWith('/wealth-building');
  });

  it('mark complete button marks chapter complete in localStorage', () => {
    const chapter = wealthChapters[0];
    render(<MemoryRouter><ChapterShell chapter={chapter} tool={<div>tool</div>} /></MemoryRouter>);
    fireEvent.click(screen.getByText(/Mark Complete/i));
    expect(JSON.parse(localStorage.getItem('wealth_chapters_completed')!)).toContain('credit');
  });

  it('shows completed status when chapter is already complete', () => {
    localStorage.setItem('wealth_chapters_completed', JSON.stringify(['credit']));
    const chapter = wealthChapters[0];
    render(<MemoryRouter><ChapterShell chapter={chapter} tool={<div>tool</div>} /></MemoryRouter>);
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.queryByText('Mark Complete')).not.toBeInTheDocument();
  });

  it('renders with different chapter data', () => {
    const chapter = wealthChapters[2];
    render(<MemoryRouter><ChapterShell chapter={chapter} tool={<div>tool</div>} /></MemoryRouter>);
    expect(screen.getByText('Real Estate')).toBeInTheDocument();
    expect(screen.getByText(/22 min read/i)).toBeInTheDocument();
  });

  it('does not mangle dollar amounts as math and still highlights glossary terms', () => {
    const chapter = wealthChapters[0]; // Credit Mastery contains "$500 of a $5,000"
    render(<MemoryRouter><ChapterShell chapter={chapter} tool={<div>tool</div>} /></MemoryRouter>);
    // Currency should render as plain text, not KaTeX math-italic fragments.
    expect(screen.getByText(/\$500 of a \$5,000 limit = 10%\./)).toBeInTheDocument();
    // Glossary highlighting still works alongside the currency fix.
    expect(screen.getAllByRole('button', { name: /dictionary definition available/i }).length).toBeGreaterThanOrEqual(1);
  });
});

describe('tool interactions', () => {
  beforeEach(() => localStorage.clear());

  describe('CreditActionPlan', () => {
    it('updates current score input', () => {
      render(<CreditActionPlan />);
      fireEvent.change(screen.getByDisplayValue('650'), { target: { value: '700' } });
      expect(screen.getByDisplayValue('700')).toBeInTheDocument();
    });
    it('updates target score input', () => {
      render(<CreditActionPlan />);
      fireEvent.change(screen.getByDisplayValue('760'), { target: { value: '800' } });
      expect(screen.getByDisplayValue('800')).toBeInTheDocument();
    });
    it('updates monthly budget input', () => {
      render(<CreditActionPlan />);
      fireEvent.change(screen.getByDisplayValue('200'), { target: { value: '500' } });
      expect(screen.getByDisplayValue('500')).toBeInTheDocument();
    });
    it('shows 0 months when current score equals target', () => {
      render(<CreditActionPlan />);
      fireEvent.change(screen.getByDisplayValue('650'), { target: { value: '760' } });
      expect(screen.getByText('0 months')).toBeInTheDocument();
      expect(screen.getByText(/Target reached/)).toBeInTheDocument();
    });
    it('shows target reached when current exceeds target', () => {
      render(<CreditActionPlan />);
      fireEvent.change(screen.getByDisplayValue('650'), { target: { value: '800' } });
      expect(screen.getByText(/Target reached/)).toBeInTheDocument();
    });
    it('shows 0% utilization for zero budget', () => {
      render(<CreditActionPlan />);
      fireEvent.change(screen.getByDisplayValue('200'), { target: { value: '0' } });
      expect(screen.getByText('0%')).toBeInTheDocument();
    });
  });

  describe('BusinessViabilityCalculator', () => {
    it('updates startup cost input', () => {
      render(<BusinessViabilityCalculator />);
      fireEvent.change(screen.getByDisplayValue('10000'), { target: { value: '50000' } });
      expect(screen.getByDisplayValue('50000')).toBeInTheDocument();
    });
    it('updates monthly revenue input', () => {
      render(<BusinessViabilityCalculator />);
      fireEvent.change(screen.getByDisplayValue('5000'), { target: { value: '8000' } });
      expect(screen.getByDisplayValue('8000')).toBeInTheDocument();
    });
    it('updates expenses input', () => {
      render(<BusinessViabilityCalculator />);
      fireEvent.change(screen.getByDisplayValue('3500'), { target: { value: '2000' } });
      expect(screen.getByDisplayValue('2000')).toBeInTheDocument();
    });
    it('shows "Not reached" when expenses exceed revenue', () => {
      render(<BusinessViabilityCalculator />);
      fireEvent.change(screen.getByDisplayValue('5000'), { target: { value: '3000' } });
      expect(screen.getByText('Not reached')).toBeInTheDocument();
    });
    it('shows negative year 1 profit when expenses exceed revenue', () => {
      render(<BusinessViabilityCalculator />);
      fireEvent.change(screen.getByDisplayValue('5000'), { target: { value: '2000' } });
      expect(screen.getByText(/-18,000/)).toBeInTheDocument();
    });
    it('shows "Not reached" for zero revenue and zero expenses', () => {
      render(<BusinessViabilityCalculator />);
      fireEvent.change(screen.getByDisplayValue('3500'), { target: { value: '0' } });
      fireEvent.change(screen.getByDisplayValue('5000'), { target: { value: '0' } });
      expect(screen.getByText('Not reached')).toBeInTheDocument();
    });
    it('updates CAC input', () => {
      render(<BusinessViabilityCalculator />);
      fireEvent.change(screen.getByDisplayValue('50'), { target: { value: '100' } });
      expect(screen.getByDisplayValue('100')).toBeInTheDocument();
    });
  });

  describe('RealEstateAnalyzer', () => {
    it('updates purchase price input', () => {
      render(<RealEstateAnalyzer />);
      fireEvent.change(screen.getByDisplayValue('200000'), { target: { value: '300000' } });
      expect(screen.getByDisplayValue('300000')).toBeInTheDocument();
    });
    it('updates rehab cost input', () => {
      render(<RealEstateAnalyzer />);
      fireEvent.change(screen.getByDisplayValue('20000'), { target: { value: '50000' } });
      expect(screen.getByDisplayValue('50000')).toBeInTheDocument();
    });
    it('updates monthly rent input', () => {
      render(<RealEstateAnalyzer />);
      fireEvent.change(screen.getByDisplayValue('2000'), { target: { value: '2500' } });
      expect(screen.getByDisplayValue('2500')).toBeInTheDocument();
    });
    it('updates vacancy percentage input', () => {
      render(<RealEstateAnalyzer />);
      fireEvent.change(screen.getByDisplayValue('5'), { target: { value: '10' } });
      expect(screen.getByDisplayValue('10')).toBeInTheDocument();
    });
    it('shows 0.0% cap rate for 100% vacancy', () => {
      render(<RealEstateAnalyzer />);
      fireEvent.change(screen.getByDisplayValue('5'), { target: { value: '100' } });
      expect(screen.getByText('0.0%')).toBeInTheDocument();
    });
    it('handles zero total investment', () => {
      render(<RealEstateAnalyzer />);
      fireEvent.change(screen.getByDisplayValue('200000'), { target: { value: '0' } });
      fireEvent.change(screen.getByDisplayValue('20000'), { target: { value: '0' } });
      expect(screen.getByText('$0')).toBeInTheDocument();
    });
  });

  describe('GroupPoolCalculator', () => {
    it('updates members input', () => {
      render(<GroupPoolCalculator />);
      fireEvent.change(screen.getAllByDisplayValue('12')[0], { target: { value: '24' } });
      expect(screen.getByDisplayValue('24')).toBeInTheDocument();
    });
    it('updates monthly contribution input', () => {
      render(<GroupPoolCalculator />);
      fireEvent.change(screen.getByDisplayValue('200'), { target: { value: '500' } });
      expect(screen.getByDisplayValue('500')).toBeInTheDocument();
    });
    it('updates months input', () => {
      render(<GroupPoolCalculator />);
      const inputs = screen.getAllByDisplayValue('12');
      fireEvent.change(inputs[1], { target: { value: '24' } });
      expect(screen.getByDisplayValue('24')).toBeInTheDocument();
    });
    it('updates return rate input', () => {
      render(<GroupPoolCalculator />);
      fireEvent.change(screen.getByDisplayValue('8'), { target: { value: '10' } });
      expect(screen.getByDisplayValue('10')).toBeInTheDocument();
    });
    it('shows correct total principal for default values', () => {
      render(<GroupPoolCalculator />);
      expect(screen.getByText(/\$28,800/)).toBeInTheDocument();
    });
    it('shows dash for return when total principal is zero', () => {
      render(<GroupPoolCalculator />);
      fireEvent.change(screen.getByDisplayValue('200'), { target: { value: '0' } });
      expect(screen.getByText('—')).toBeInTheDocument();
    });
    it('shows per member payout', () => {
      render(<GroupPoolCalculator />);
      expect(screen.getByText(/Per Member/)).toBeInTheDocument();
    });
  });

  describe('SideHustleCalculator', () => {
    it('updates hours per week input', () => {
      render(<SideHustleCalculator />);
      fireEvent.change(screen.getByDisplayValue('10'), { target: { value: '20' } });
      expect(screen.getByDisplayValue('20')).toBeInTheDocument();
    });
    it('updates hourly rate input', () => {
      render(<SideHustleCalculator />);
      fireEvent.change(screen.getByDisplayValue('25'), { target: { value: '40' } });
      expect(screen.getByDisplayValue('40')).toBeInTheDocument();
    });
    it('updates overhead percent input', () => {
      render(<SideHustleCalculator />);
      fireEvent.change(screen.getByDisplayValue('15'), { target: { value: '20' } });
      expect(screen.getByDisplayValue('20')).toBeInTheDocument();
    });
    it('updates months per year input', () => {
      render(<SideHustleCalculator />);
      fireEvent.change(screen.getByDisplayValue('12'), { target: { value: '6' } });
      expect(screen.getByDisplayValue('6')).toBeInTheDocument();
    });
    it('shows effective hourly rate after overhead', () => {
      render(<SideHustleCalculator />);
      expect(screen.getByText('$21.25/hr')).toBeInTheDocument();
    });
    it('shows $0 annual income for zero hours', () => {
      render(<SideHustleCalculator />);
      fireEvent.change(screen.getByDisplayValue('10'), { target: { value: '0' } });
      expect(screen.getAllByText('$0/yr')).toHaveLength(2);
    });
  });

  describe('EmergencyFundCalculator', () => {
    it('updates monthly expenses input', () => {
      render(<EmergencyFundCalculator />);
      fireEvent.change(screen.getByDisplayValue('3000'), { target: { value: '4000' } });
      expect(screen.getByDisplayValue('4000')).toBeInTheDocument();
    });
    it('updates current savings input', () => {
      render(<EmergencyFundCalculator />);
      fireEvent.change(screen.getByDisplayValue('5000'), { target: { value: '10000' } });
      expect(screen.getByDisplayValue('10000')).toBeInTheDocument();
    });
    it('updates monthly savings rate input', () => {
      render(<EmergencyFundCalculator />);
      fireEvent.change(screen.getByDisplayValue('500'), { target: { value: '1000' } });
      expect(screen.getByDisplayValue('1000')).toBeInTheDocument();
    });
    it('updates target months input', () => {
      render(<EmergencyFundCalculator />);
      fireEvent.change(screen.getByDisplayValue('6'), { target: { value: '12' } });
      expect(screen.getByDisplayValue('12')).toBeInTheDocument();
    });
    it('shows correct target amount for default values', () => {
      render(<EmergencyFundCalculator />);
      expect(screen.getByText('$18,000')).toBeInTheDocument();
    });
    it('shows goal met when target reached', () => {
      render(<EmergencyFundCalculator />);
      fireEvent.change(screen.getByDisplayValue('5000'), { target: { value: '20000' } });
      expect(screen.getByText('✓ Goal met')).toBeInTheDocument();
    });
  });
});
