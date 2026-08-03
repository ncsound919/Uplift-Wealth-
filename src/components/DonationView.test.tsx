import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DonationView, DONATION_TIERS } from './DonationView';

vi.mock('motion/react', () => {
  const Div = require('react').forwardRef(({ children, ...props }: any, ref: any) => <div ref={ref} {...props}>{children}</div>);
  Div.displayName = 'MotionDiv';
  return { motion: new Proxy({}, { get: () => Div }) };
});

describe('DonationView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
    global.fetch = vi.fn(() => Promise.resolve({ ok: true })) as any;
  });

  it('renders the donation page heading', () => {
    render(<DonationView />);
    expect(screen.getByText('Fueling Open Financial Tools for the Community')).toBeInTheDocument();
  });

  it('renders donation tier labels', () => {
    render(<DonationView />);
    expect(screen.getByText('Supporter')).toBeInTheDocument();
    expect(screen.getByText('Builder')).toBeInTheDocument();
    expect(screen.getByText('Community Champion')).toBeInTheDocument();
    expect(screen.getByText('Institutional Partner')).toBeInTheDocument();
  });

  it('shows tier amounts with dollar signs', () => {
    render(<DonationView />);
    expect(screen.getAllByText('$10').length).toBeGreaterThan(0);
    expect(screen.getAllByText('$25').length).toBeGreaterThan(0);
    expect(screen.getAllByText('$50').length).toBeGreaterThan(0);
    expect(screen.getAllByText('$100').length).toBeGreaterThan(0);
  });

  it('shows tier impact descriptions', () => {
    render(<DonationView />);
    expect(screen.getByText('Maintains 100 student sandbox sessions')).toBeInTheDocument();
    expect(screen.getByText('Sponsors 1 full HBCU student course license')).toBeInTheDocument();
    expect(screen.getByText('Funds alternative credit lab development')).toBeInTheDocument();
    expect(screen.getByText('Sponsors MDI open-banking sandbox expansion')).toBeInTheDocument();
  });

  it('shows CashApp handle', () => {
    render(<DonationView />);
    const elements = screen.getAllByText(/\$helptools/i);
    expect(elements.length).toBeGreaterThan(0);
  });

  it('shows Venmo handle', () => {
    render(<DonationView />);
    const elements = screen.getAllByText(/@ncsound/i);
    expect(elements.length).toBeGreaterThan(0);
  });

  it('renders YouTube video section heading', () => {
    render(<DonationView />);
    expect(screen.getByText("Owner's Keynote: Mindset & Vision")).toBeInTheDocument();
  });

  it('renders impact cards', () => {
    render(<DonationView />);
    expect(screen.getByText('Black Community Focus')).toBeInTheDocument();
    expect(screen.getByText('100% Free & Open Access')).toBeInTheDocument();
    expect(screen.getByText('Interactive Sandboxes')).toBeInTheDocument();
  });

  it('selects a tier on click', () => {
    render(<DonationView />);
    fireEvent.click(screen.getByText('Builder'));
    expect(screen.getByText(/Ready to send \$25/)).toBeInTheDocument();
  });

  it('shows donate link when tier selected', () => {
    render(<DonationView />);
    expect(screen.getByText(/Donate \$25 via CashApp/)).toBeInTheDocument();
  });

  it('does not render back button when onBackToDashboard not provided', () => {
    render(<DonationView />);
    expect(screen.queryByText('Back to Syllabus')).not.toBeInTheDocument();
  });

  it('renders back button when onBackToDashboard provided', () => {
    render(<DonationView onBackToDashboard={vi.fn()} />);
    expect(screen.getByText('Back to Syllabus')).toBeInTheDocument();
  });

  it('calls onBackToDashboard when back button clicked', () => {
    const onBack = vi.fn();
    render(<DonationView onBackToDashboard={onBack} />);
    fireEvent.click(screen.getByText('Back to Syllabus'));
    expect(onBack).toHaveBeenCalled();
  });

  it('copies cashtag to clipboard on Copy button click', async () => {
    render(<DonationView />);
    fireEvent.click(screen.getByText('Copy $helptools'));
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('$helptools');
    });
  });

  it('shows "Copied $helptools" after copying', async () => {
    render(<DonationView />);
    fireEvent.click(screen.getByText('Copy $helptools'));
    expect(await screen.findByText('Copied $helptools')).toBeInTheDocument();
  });

  it('copies Venmo handle on Venmo Copy button click', () => {
    window.alert = vi.fn();
    render(<DonationView />);
    fireEvent.click(screen.getByText('Copy @ncsound'));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('@ncsound');
    expect(window.alert).toHaveBeenCalledWith('Venmo handle @ncsound copied to clipboard!');
  });

  it('shows all donation tier cards as radio buttons', () => {
    render(<DonationView />);
    const radios = screen.getAllByRole('radio');
    expect(radios.length).toBe(4);
  });

  it('marks the $25 tier as checked by default', () => {
    render(<DonationView />);
    const twentyFiveRadio = screen.getByRole('radio', { name: /Builder/ });
    expect(twentyFiveRadio.getAttribute('aria-checked')).toBe('true');
  });

  it('selects $10 tier when clicked', () => {
    render(<DonationView />);
    fireEvent.click(screen.getByText('$10'));
    expect(screen.getByText(/Ready to send \$10/)).toBeInTheDocument();
  });

  it('selects $100 tier when clicked', () => {
    render(<DonationView />);
    fireEvent.click(screen.getByText('$100'));
    expect(screen.getByText(/Ready to send \$100/)).toBeInTheDocument();
  });

  it('shows selected badge on tier card when selected', () => {
    render(<DonationView />);
    const selectedBadges = screen.getAllByText('Selected');
    expect(selectedBadges.length).toBeGreaterThan(0);
  });

  it('shows impact scale percentage for each tier', () => {
    render(<DonationView />);
    DONATION_TIERS.forEach((tier) => {
      expect(screen.getByText(`${tier.impactLevel}%`)).toBeInTheDocument();
    });
  });

  it('shows Impact Scale label for each tier', () => {
    render(<DonationView />);
    const impactLabels = screen.getAllByText('Impact Scale');
    expect(impactLabels.length).toBe(4);
  });

  it('calls fetch on tier selection', async () => {
    render(<DonationView />);
    fireEvent.click(screen.getByText('Builder'));
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/donation-intent', expect.objectContaining({ method: 'POST' }));
    });
  });

  it('handles fetch failure silently on tier selection', async () => {
    (global.fetch as any).mockRejectedValue(new Error('Network error'));
    render(<DonationView />);
    fireEvent.click(screen.getByText('Builder'));
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it('shows selected tier with correct label', () => {
    render(<DonationView />);
    fireEvent.click(screen.getByText('Community Champion'));
    const checkedRadio = screen.getByRole('radio', { name: /Community Champion/ });
    expect(checkedRadio.getAttribute('aria-checked')).toBe('true');
  });

  it('shows Venmo external link to venmo.com/ncsound', () => {
    render(<DonationView />);
    const venmoLink = screen.getByText('Open Venmo');
    expect(venmoLink.closest('a')).toHaveAttribute('href', 'https://venmo.com/ncsound');
  });

  it('shows CashApp external link to cash.app/$helptools', () => {
    render(<DonationView />);
    const cashAppLink = screen.getByText('Open CashApp');
    expect(cashAppLink.closest('a')).toHaveAttribute('href', 'https://cash.app/$helptools');
  });

  it('shows Instagram link to instagram.com/ncsound', () => {
    render(<DonationView />);
    const instagramLink = screen.getByText('Visit Instagram Page');
    expect(instagramLink.closest('a')).toHaveAttribute('href', 'https://instagram.com/ncsound');
  });

  it('shows CashApp donate link with correct amount', () => {
    render(<DonationView />);
    fireEvent.click(screen.getByText('$100'));
    const donateLink = screen.getByText('Donate $100 via CashApp');
    expect(donateLink.closest('a')).toHaveAttribute('href', 'https://cash.app/$helptools/100');
  });

  it('shows title with DollarSign icon text', () => {
    render(<DonationView />);
    expect(screen.getByText('Select Your Pledge Level')).toBeInTheDocument();
  });

  it('shows open-source community donation badge', () => {
    render(<DonationView />);
    expect(screen.getByText('Open-Source Community Donation')).toBeInTheDocument();
  });

  it('shows founder keynote badge', () => {
    render(<DonationView />);
    expect(screen.getByText('Founder Keynote • 2016')).toBeInTheDocument();
  });

  it('shows description text', () => {
    render(<DonationView />);
    expect(screen.getByText(/free and open-access/)).toBeInTheDocument();
  });

  it('shows founder speech label', () => {
    render(<DonationView />);
    expect(screen.getByText('Founder Speech')).toBeInTheDocument();
  });

  it('selects tier on Enter key press', () => {
    render(<DonationView />);
    const tierRadio = screen.getByRole('radio', { name: /Community Champion/ });
    fireEvent.keyDown(tierRadio, { key: 'Enter' });
    expect(screen.getByText(/Ready to send \$50/)).toBeInTheDocument();
  });

  it('selects tier on Space key press', () => {
    render(<DonationView />);
    const tierRadio = screen.getByRole('radio', { name: /Institutional Partner/ });
    fireEvent.keyDown(tierRadio, { key: ' ' });
    expect(screen.getByText(/Ready to send \$100/)).toBeInTheDocument();
  });

  it('selects Supporter tier on Enter key', () => {
    render(<DonationView />);
    const tierRadio = screen.getByRole('radio', { name: /Supporter/ });
    fireEvent.keyDown(tierRadio, { key: 'Enter' });
    expect(screen.getByText(/Ready to send \$10/)).toBeInTheDocument();
  });

  it('does not select tier on other key press', () => {
    render(<DonationView />);
    const tierRadio = screen.getByRole('radio', { name: /Supporter/ });
    fireEvent.keyDown(tierRadio, { key: 'Tab' });
    expect(screen.queryByText(/Ready to send \$10/)).not.toBeInTheDocument();
  });
});
