import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BusinessSummary } from './BusinessSummary';

function renderSummary(overrides: Partial<Parameters<typeof BusinessSummary>[0]> = {}) {
  const props = {
    businessName: 'NiaPay',
    finalLane: 'embedded payments',
    businessType: 'fintech',
    selectedCohort: 'Gig workers',
    monetization: 'Subscription model (recurring)',
    structure: 'LLC',
    filingState: 'Delaware',
    fundingStrategy: 'Seed Venture Capital SAFE',
    onDownload: vi.fn(),
    onStressTest: vi.fn(),
    onStartOver: vi.fn(),
    onAdvancedMode: vi.fn(),
    ...overrides,
  };
  render(<BusinessSummary {...props} />);
  return props;
}

describe('BusinessSummary', () => {
  it('shows the calm completion hero with the business name', () => {
    renderSummary();
    expect(screen.getByText('Your plan is ready')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /NiaPay/i })).toBeInTheDocument();
    expect(screen.getByText(/embedded payments/)).toBeInTheDocument();
  });

  it('renders the key plan facts as cards', () => {
    renderSummary();
    expect(screen.getByText('Business type')).toBeInTheDocument();
    expect(screen.getByText('Who you serve')).toBeInTheDocument();
    expect(screen.getByText('How you make money')).toBeInTheDocument();
    expect(screen.getByText('Legal structure')).toBeInTheDocument();
    expect(screen.getByText('Where you register')).toBeInTheDocument();
    expect(screen.getByText('Funding')).toBeInTheDocument();
  });

  it('shows a fintech label for the business type fact', () => {
    renderSummary();
    expect(screen.getByText('Fintech / Digital Finance')).toBeInTheDocument();
  });

  it('falls back to a generic business name when empty', () => {
    renderSummary({ businessName: '' });
    expect(screen.getByRole('heading', { name: /Your Business/i })).toBeInTheDocument();
  });

  it('maps Sole Prop structure to the sole proprietorship label', () => {
    renderSummary({ structure: 'Sole Prop' });
    expect(screen.getByText('Sole Proprietorship')).toBeInTheDocument();
  });

  it('calls onDownload from the primary CTA', () => {
    const props = renderSummary();
    fireEvent.click(screen.getByText(/Download My Complete Plan/i));
    expect(props.onDownload).toHaveBeenCalledTimes(1);
  });

  it('calls onStressTest from the secondary button', () => {
    const props = renderSummary();
    fireEvent.click(screen.getByText(/Run stress test/i));
    expect(props.onStressTest).toHaveBeenCalledTimes(1);
  });

  it('calls onStartOver from the reset button', () => {
    const props = renderSummary();
    fireEvent.click(screen.getByText(/Start over/i));
    expect(props.onStartOver).toHaveBeenCalledTimes(1);
  });

  it('calls onAdvancedMode from the footer link', () => {
    const props = renderSummary();
    fireEvent.click(screen.getByText(/Edit in Advanced mode/i));
    expect(props.onAdvancedMode).toHaveBeenCalledTimes(1);
  });

  it('promises full details in the download', () => {
    renderSummary();
    expect(screen.getByText(/Your full plan — pitch, legal docs, compliance calendar, and financials — is in the download/i)).toBeInTheDocument();
  });
});
