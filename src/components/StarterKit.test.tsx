import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StarterKit } from './StarterKit';

const mockDownloadStarterFile = vi.fn();
const mockDownloadAllStarterFiles = vi.fn();

vi.mock('../lib/starterKit', () => ({
  STARTER_FILES: [
    { id: 'pitch-deck', title: 'Pitch Deck Template', description: '11-slide investor pitch deck', category: 'pitch', format: 'md', content: '# Pitch Deck' },
    { id: 'investor-email', title: 'Investor Cold Email', description: 'Personalized cold outreach template', category: 'pitch', format: 'md', content: '# Email' },
    { id: 'cap-table', title: 'Cap Table Worksheet', description: 'Initial capitalization table', category: 'finance', format: 'md', content: '# Cap Table' },
    { id: 'financial-projection', title: '36-Month Financial Model', description: 'CSV projection template', category: 'finance', format: 'csv', content: 'Month,Revenue' },
    { id: 'ein-guide', title: 'EIN Application Guide', description: 'Step-by-step: apply for EIN', category: 'legal', format: 'md', content: '# EIN Guide' },
  ],
  downloadStarterFile: (...args: any[]) => mockDownloadStarterFile(...args),
  downloadAllStarterFiles: (...args: any[]) => mockDownloadAllStarterFiles(...args),
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

const mockCtx = {
  businessName: 'TestFintech',
  founderName: 'Test Founder',
  founderState: 'DE',
  filingState: 'DE',
  structure: 'LLC' as const,
  finalLane: 'Payments',
  selectedCohort: 'Students',
  finalProblem: 'Problem',
  selectedApis: ['Stripe'],
  monetization: 'Subscription',
  equitySplit: '50/50',
  fundingStrategy: 'Bootstrapping',
  hqType: 'Remote',
};

describe('StarterKit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders starter kit header with title', () => {
    render(<StarterKit ctx={mockCtx} />);
    expect(screen.getByText('Starter Kit')).toBeInTheDocument();
  });

  it('shows download count', () => {
    render(<StarterKit ctx={mockCtx} />);
    expect(screen.getByText(/0 of 5 downloaded/)).toBeInTheDocument();
  });

  it('shows Download All button', () => {
    render(<StarterKit ctx={mockCtx} />);
    expect(screen.getByText('Download All')).toBeInTheDocument();
  });

  it('shows Pitch category expanded by default', () => {
    render(<StarterKit ctx={mockCtx} />);
    expect(screen.getByText('Pitch')).toBeInTheDocument();
    expect(screen.getByText('Pitch Deck Template')).toBeInTheDocument();
  });

  it('shows Finance category collapsed by default', () => {
    render(<StarterKit ctx={mockCtx} />);
    expect(screen.getByText('Finance')).toBeInTheDocument();
    expect(screen.queryByText('36-Month Financial Model')).not.toBeInTheDocument();
  });

  it('expands Finance category on click', () => {
    render(<StarterKit ctx={mockCtx} />);
    fireEvent.click(screen.getByText('Finance'));
    expect(screen.getByText('36-Month Financial Model')).toBeInTheDocument();
  });

  it('collapses category when clicked again', () => {
    render(<StarterKit ctx={mockCtx} />);
    fireEvent.click(screen.getByText('Pitch'));
    expect(screen.queryByText('Pitch Deck Template')).not.toBeInTheDocument();
  });

  it('shows file description in expanded category', () => {
    render(<StarterKit ctx={mockCtx} />);
    expect(screen.getByText('11-slide investor pitch deck')).toBeInTheDocument();
  });

  it('calls downloadStarterFile when download button clicked', () => {
    render(<StarterKit ctx={mockCtx} />);
    const downloadButtons = screen.getAllByTitle('Download');
    fireEvent.click(downloadButtons[0]);
    expect(mockDownloadStarterFile).toHaveBeenCalledTimes(1);
  });

  it('changes download icon to checkmark after download', () => {
    render(<StarterKit ctx={mockCtx} />);
    const downloadButtons = screen.getAllByTitle('Download');
    fireEvent.click(downloadButtons[0]);
    expect(screen.getByTitle('Downloaded')).toBeInTheDocument();
  });

  it('shows file format badge', () => {
    render(<StarterKit ctx={mockCtx} />);
    const formatBadges = screen.getAllByText('.md');
    expect(formatBadges.length).toBeGreaterThanOrEqual(2);
  });

  it('updates download count after downloading a file', () => {
    render(<StarterKit ctx={mockCtx} />);
    const downloadButtons = screen.getAllByTitle('Download');
    fireEvent.click(downloadButtons[0]);
    expect(screen.getByText(/1 of 5 downloaded/)).toBeInTheDocument();
  });

  it('calls downloadAllStarterFiles when Download All clicked', () => {
    render(<StarterKit ctx={mockCtx} />);
    fireEvent.click(screen.getByText('Download All'));
    expect(mockDownloadAllStarterFiles).toHaveBeenCalledTimes(1);
  });

  it('marks visible files as downloaded when Download All clicked', () => {
    render(<StarterKit ctx={mockCtx} />);
    fireEvent.click(screen.getByText('Download All'));
    const downloaded = screen.getAllByTitle('Downloaded');
    expect(downloaded.length).toBe(2);
  });

  it('updates count to show all files downloaded', () => {
    render(<StarterKit ctx={mockCtx} />);
    fireEvent.click(screen.getByText('Download All'));
    expect(screen.getByText(/5 of 5 downloaded/)).toBeInTheDocument();
  });

  it('shows success message when all files downloaded', () => {
    render(<StarterKit ctx={mockCtx} />);
    fireEvent.click(screen.getByText('Download All'));
    expect(screen.getByText(/All starter files downloaded/)).toBeInTheDocument();
    expect(screen.getByText("You're ready to launch. Come back when you need to iterate.")).toBeInTheDocument();
  });

  it('renders all category sections', () => {
    render(<StarterKit ctx={mockCtx} />);
    expect(screen.getByText('Pitch')).toBeInTheDocument();
    expect(screen.getByText('Finance')).toBeInTheDocument();
    expect(screen.getByText('Legal')).toBeInTheDocument();
  });

  it('tracks individual file downloads per category', () => {
    render(<StarterKit ctx={mockCtx} />);
    fireEvent.click(screen.getByText('Finance'));
    const pitchDownloadBtns = screen.getAllByTitle('Download');
    fireEvent.click(pitchDownloadBtns[0]);
    expect(screen.getByText('1/2')).toBeInTheDocument();
  });
});
