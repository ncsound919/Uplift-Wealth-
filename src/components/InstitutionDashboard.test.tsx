import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { InstitutionDashboard } from './InstitutionDashboard';

const mocks = vi.hoisted(() => ({
  listMyCohorts: vi.fn(),
  getCohortRoster: vi.fn(),
}));
vi.mock('react-router', () => ({ useNavigate: () => vi.fn() }));
vi.mock('../lib/apiClient', () => ({ apiClient: { listMyCohorts: mocks.listMyCohorts, getCohortRoster: mocks.getCohortRoster } }));

const cohort = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id: 'coh-1', name: 'Sunday Finance Class', type: 'church', ownerId: 'u1', inviteCode: 'AB12CD',
  moduleIds: ['module-1', 'module-2'], memberCount: 2, ...overrides,
});

describe('InstitutionDashboard', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows the empty state when the user owns no groups', async () => {
    mocks.listMyCohorts.mockResolvedValue({ cohorts: [] });
    render(<InstitutionDashboard currentUserId="u1" currentTier="institutional" />);
    expect(await screen.findByText(/No classes yet/)).toBeInTheDocument();
  });

  it('lists owned classes with roster progress', async () => {
    mocks.listMyCohorts.mockResolvedValue({ cohorts: [cohort()] });
    mocks.getCohortRoster.mockResolvedValue({
      roster: [
        { id: 's1', name: 'Nia', completedModules: ['module-1'], xp: 500 },
        { id: 's2', name: 'Kofi', completedModules: [], xp: 120 },
      ],
    });
    render(<InstitutionDashboard currentUserId="u1" currentTier="institutional" />);
    expect(await screen.findByText('Sunday Finance Class')).toBeInTheDocument();
    expect(await screen.findByText('Nia')).toBeInTheDocument();
    expect(screen.getByText('Kofi')).toBeInTheDocument();
    expect(screen.getByText('1 / 2')).toBeInTheDocument(); // Nia: 1 of 2 assigned modules
  });

  it('prompts free users to view institutional pricing', async () => {
    mocks.listMyCohorts.mockResolvedValue({ cohorts: [cohort()] });
    mocks.getCohortRoster.mockResolvedValue({ roster: [] });
    render(<InstitutionDashboard currentUserId="u1" currentTier="free" />);
    await screen.findByText('Sunday Finance Class');
    fireEvent.click(screen.getByRole('button', { name: /view institutional pricing/i }));
    await waitFor(() => expect(screen.getByText(/View Institutional pricing/)).toBeTruthy());
  });
});
