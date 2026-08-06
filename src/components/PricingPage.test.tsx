import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PricingPage } from './PricingPage';

const mocks = vi.hoisted(() => ({
  getBillingPlans: vi.fn(),
  startCheckout: vi.fn(),
}));

vi.mock('react-router', () => ({ useSearchParams: () => [new URLSearchParams()] }));
vi.mock('../lib/apiClient', () => ({ apiClient: mocks }));

const plans = [
  { id: 'free', name: 'Free', monthly: 0, description: 'Start', features: ['Modules 0-5'] },
  { id: 'premium', name: 'Premium', monthly: 19, description: 'Everything', features: ['All modules'] },
  { id: 'institutional', name: 'Institutional', monthly: 99, description: 'Classrooms', features: ['50 seats'] },
];

describe('PricingPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders all three plans', async () => {
    mocks.getBillingPlans.mockResolvedValue({ plans, stripeConfigured: true });
    render(<PricingPage currentTier="free" />);
    expect(await screen.findByText('Premium')).toBeInTheDocument();
    expect(screen.getByText('Institutional')).toBeInTheDocument();
    expect(screen.getByText('Free')).toBeInTheDocument();
    expect(screen.getByText('$19')).toBeInTheDocument();
  });

  it('marks the current plan', async () => {
    mocks.getBillingPlans.mockResolvedValue({ plans, stripeConfigured: true });
    render(<PricingPage currentTier="free" />);
    expect(await screen.findByText('Current plan')).toBeInTheDocument();
  });

  it('prompts for auth when a guest clicks Go Premium', async () => {
    mocks.getBillingPlans.mockResolvedValue({ plans, stripeConfigured: true });
    const onRequireAuth = vi.fn();
    render(<PricingPage currentTier="guest" onRequireAuth={onRequireAuth} />);
    await screen.findByText('Premium');
    fireEvent.click(screen.getByRole('button', { name: /go premium/i }));
    expect(onRequireAuth).toHaveBeenCalled();
  });

  it('redirects to checkout when an authed user upgrades', async () => {
    mocks.getBillingPlans.mockResolvedValue({ plans, stripeConfigured: true });
    mocks.startCheckout.mockResolvedValue({ success: true, url: 'https://checkout.stripe.com/x' });
    const loc = { href: '' };
    const orig = window.location;
    Object.defineProperty(window, 'location', { value: loc, writable: true });
    render(<PricingPage currentTier="free" />);
    await screen.findByText('Premium');
    fireEvent.click(screen.getByRole('button', { name: /go premium/i }));
    await waitFor(() => expect(mocks.startCheckout).toHaveBeenCalledWith('premium'));
    Object.defineProperty(window, 'location', { value: orig, writable: true });
  });
});
