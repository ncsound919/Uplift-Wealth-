import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { InstitutionPage } from './InstitutionPage';

const mocks = vi.hoisted(() => ({ startCheckout: vi.fn() }));
vi.mock('react-router', () => ({ useNavigate: () => vi.fn() }));
vi.mock('../lib/apiClient', () => ({ apiClient: { startCheckout: mocks.startCheckout } }));

describe('InstitutionPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders the institution pitch, pricing, and curriculum CTA', () => {
    render(<InstitutionPage currentTier="free" />);
    expect(screen.getByText(/Bring real financial literacy to your/)).toBeInTheDocument();
    expect(screen.getAllByText(/\$99/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Download curriculum PDF/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Up to 50 seats/i).length).toBeGreaterThan(0);
  });

  it('prompts for auth when a guest clicks Get Institutional', () => {
    const onRequireAuth = vi.fn();
    render(<InstitutionPage currentTier="guest" onRequireAuth={onRequireAuth} />);
    fireEvent.click(screen.getAllByRole('button', { name: /get institutional/i })[0]);
    expect(onRequireAuth).toHaveBeenCalled();
  });

  it('redirects to checkout when an authed user upgrades', async () => {
    mocks.startCheckout.mockResolvedValue({ success: true, url: 'https://checkout.stripe.com/x' });
    const loc = { href: '' };
    const orig = window.location;
    Object.defineProperty(window, 'location', { value: loc, writable: true });
    render(<InstitutionPage currentTier="free" />);
    fireEvent.click(screen.getByRole('button', { name: /get institutional — \$99\/mo/i }));
    await waitFor(() => expect(mocks.startCheckout).toHaveBeenCalledWith('institutional'));
    Object.defineProperty(window, 'location', { value: orig, writable: true });
  });
});
