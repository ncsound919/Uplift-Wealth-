import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PricingPage } from './PricingPage';

const mocks = vi.hoisted(() => ({
  getBillingPlans: vi.fn(),
  startCheckout: vi.fn(),
}));

vi.mock('react-router', () => ({ useSearchParams: () => [new URLSearchParams()], useNavigate: () => vi.fn() }));
vi.mock('../lib/apiClient', () => ({ apiClient: mocks }));

const plans = [
  { id: 'free', name: 'Free Member', monthly: 0, description: 'Complete access', features: ['All modules'] },
  { id: 'institutional', name: 'Institutional', monthly: 99, description: 'Classrooms', features: ['50 seats'] },
];

describe('PricingPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders the free and institutional plans', async () => {
    mocks.getBillingPlans.mockResolvedValue({ plans, stripeConfigured: true });
    render(<PricingPage currentTier="free" />);
    expect(await screen.findByText('Institutional')).toBeInTheDocument();
    expect(screen.getByText('Free Member')).toBeInTheDocument();
    expect(screen.getByText('$99')).toBeInTheDocument();
    expect(screen.queryByText('$10')).not.toBeInTheDocument();
    expect(screen.queryByText(/premium/i)).not.toBeInTheDocument();
  });

  it('marks the current plan', async () => {
    mocks.getBillingPlans.mockResolvedValue({ plans, stripeConfigured: true });
    render(<PricingPage currentTier="free" />);
    expect(await screen.findByText('Current plan')).toBeInTheDocument();
  });

  it('prompts for auth when a guest clicks Get Institutional', async () => {
    mocks.getBillingPlans.mockResolvedValue({ plans, stripeConfigured: true });
    const onRequireAuth = vi.fn();
    render(<PricingPage currentTier="guest" onRequireAuth={onRequireAuth} />);
    await screen.findByText('Institutional');
    fireEvent.click(screen.getByRole('button', { name: /get institutional/i }));
    expect(onRequireAuth).toHaveBeenCalled();
  });

  it('redirects to checkout when an authed user upgrades', async () => {
    mocks.getBillingPlans.mockResolvedValue({ plans, stripeConfigured: true });
    mocks.startCheckout.mockResolvedValue({ success: true, url: 'https://checkout.stripe.com/x' });
    const loc = { href: '' };
    const orig = window.location;
    Object.defineProperty(window, 'location', { value: loc, writable: true });
    render(<PricingPage currentTier="free" />);
    await screen.findByText('Institutional');
    fireEvent.click(screen.getByRole('button', { name: /get institutional/i }));
    await waitFor(() => expect(mocks.startCheckout).toHaveBeenCalledWith('institutional'));
    Object.defineProperty(window, 'location', { value: orig, writable: true });
  });
});
