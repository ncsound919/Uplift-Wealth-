import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { InstitutionDashboard } from './InstitutionDashboard';

const mocks = vi.hoisted(() => ({ listInstitutionClasses: vi.fn() }));
vi.mock('react-router', () => ({ useNavigate: () => vi.fn() }));
vi.mock('../lib/apiClient', () => ({ apiClient: { listInstitutionClasses: mocks.listInstitutionClasses } }));

const cohort = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id: 'coh-1', name: 'Sunday Finance Class', type: 'church', ownerId: 'u1', inviteCode: 'AB12CD',
  moduleIds: ['module-1', 'module-2'], memberCount: 2, ...overrides,
});

const nia = { id: 's1', name: 'Nia', completedModules: ['module-1'], xp: 500 };
const kofi = { id: 's2', name: 'Kofi', completedModules: [], xp: 120 };

describe('InstitutionDashboard', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows the empty state when the user owns no groups', async () => {
    mocks.listInstitutionClasses.mockResolvedValue({ classes: [] });
    render(<InstitutionDashboard currentUserId="u1" currentTier="institutional" />);
    expect(await screen.findByText(/No classes yet/)).toBeInTheDocument();
  });

  it('lists classes with roster progress and seat counts', async () => {
    mocks.listInstitutionClasses.mockResolvedValue({ classes: [{ cohort: cohort(), roster: [nia, kofi] }] });
    render(<InstitutionDashboard currentUserId="u1" currentTier="free" />);
    expect(await screen.findByText('Sunday Finance Class')).toBeInTheDocument();
    expect(await screen.findByText('Nia')).toBeInTheDocument();
    expect(screen.getByText('Kofi')).toBeInTheDocument();
    expect(screen.getByText('1 / 2')).toBeInTheDocument(); // Nia: 1 of 2 assigned modules
    expect(screen.getByText(/2\/10 seats/)).toBeInTheDocument(); // free tier
  });

  it('shows 50-seat capacity for institutional users', async () => {
    mocks.listInstitutionClasses.mockResolvedValue({ classes: [{ cohort: cohort(), roster: [nia] }] });
    render(<InstitutionDashboard currentUserId="u1" currentTier="institutional" />);
    expect(await screen.findByText('Sunday Finance Class')).toBeInTheDocument();
    expect(screen.getByText(/1\/50 seats/)).toBeInTheDocument();
  });

  it('prompts free users to view institutional pricing', async () => {
    mocks.listInstitutionClasses.mockResolvedValue({ classes: [{ cohort: cohort(), roster: [] }] });
    render(<InstitutionDashboard currentUserId="u1" currentTier="free" />);
    await screen.findByText('Sunday Finance Class');
    fireEvent.click(screen.getByRole('button', { name: /view institutional pricing/i }));
    await waitFor(() => expect(screen.getByText(/View Institutional pricing/)).toBeTruthy());
  });
});
