import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CohortView } from './CohortView';

const mocks = vi.hoisted(() => ({
  listMyCohorts: vi.fn(),
  createCohort: vi.fn(),
  getCohort: vi.fn(),
  joinCohortByCode: vi.fn(),
  leaveCohort: vi.fn(),
  deleteCohort: vi.fn(),
}));

vi.mock('../lib/apiClient', () => ({ apiClient: mocks }));

const cohort = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id: 'coh-1', name: 'Sunday Finance Circle', type: 'church', description: 'Budgeting group',
  ownerId: 'u1', createdAt: '2024-01-01T00:00:00.000Z', memberIds: ['u1', 'u2'], inviteCode: 'AB12CD',
  ownerName: 'Nia', memberCount: 2, ...overrides,
});

describe('CohortView', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows the empty state', async () => {
    mocks.listMyCohorts.mockResolvedValue({ cohorts: [] });
    render(<CohortView currentUserId="u1" />);
    expect(await screen.findByText(/not in any cohorts yet/i)).toBeInTheDocument();
  });

  it('lists my cohorts', async () => {
    mocks.listMyCohorts.mockResolvedValue({ cohorts: [cohort()] });
    render(<CohortView currentUserId="u1" />);
    expect(await screen.findByText('Sunday Finance Circle')).toBeInTheDocument();
    expect(screen.getByText(/2 members/i)).toBeInTheDocument();
  });

  it('creates a cohort', async () => {
    mocks.listMyCohorts.mockResolvedValue({ cohorts: [] });
    mocks.createCohort.mockResolvedValue({ success: true, cohort: cohort() });
    render(<CohortView currentUserId="u1" />);
    await screen.findByText(/not in any cohorts yet/i);
    fireEvent.click(screen.getByRole('button', { name: /\+ New Cohort/i }));
    fireEvent.change(screen.getByPlaceholderText(/Cohort name/i), { target: { value: 'HBCU Chapter' } });
    fireEvent.click(screen.getByRole('button', { name: /HBCU \/ Campus Chapter/i }));
    fireEvent.click(screen.getByRole('button', { name: /create cohort/i }));
    await waitFor(() => expect(mocks.createCohort).toHaveBeenCalledWith(expect.objectContaining({ name: 'HBCU Chapter', type: 'hbcu' })));
  });

  it('joins with an invite code', async () => {
    mocks.listMyCohorts.mockResolvedValue({ cohorts: [] });
    mocks.joinCohortByCode.mockResolvedValue({ success: true, cohort: cohort() });
    render(<CohortView currentUserId="u1" />);
    await screen.findByText(/not in any cohorts yet/i);
    fireEvent.change(screen.getByPlaceholderText(/invite code/i), { target: { value: 'ab12cd' } });
    fireEvent.click(screen.getByRole('button', { name: /join/i }));
    await waitFor(() => expect(mocks.joinCohortByCode).toHaveBeenCalledWith('ab12cd'));
  });

  it('opens a cohort and shows the leaderboard', async () => {
    mocks.listMyCohorts.mockResolvedValue({ cohorts: [cohort()] });
    mocks.getCohort.mockResolvedValue({
      cohort: cohort(),
      members: [{ id: 'u1', name: 'Nia', xp: 500, completedModules: 1, completedLessons: 4 }, { id: 'u2', name: 'Kofi', xp: 200, completedModules: 0, completedLessons: 1 }],
    });
    render(<CohortView currentUserId="u1" />);
    fireEvent.click(await screen.findByText('Sunday Finance Circle'));
    expect(await screen.findByText('Leaderboard')).toBeInTheDocument();
    expect(screen.getByText('500 XP')).toBeInTheDocument();
  });

  it('leaves a cohort the user does not own', async () => {
    mocks.listMyCohorts.mockResolvedValue({ cohorts: [cohort({ ownerId: 'other' })] });
    mocks.leaveCohort.mockResolvedValue({ success: true, cohort: cohort() });
    render(<CohortView currentUserId="u1" />);
    await screen.findByText('Sunday Finance Circle');
    fireEvent.click(screen.getByRole('button', { name: /leave/i }));
    await waitFor(() => expect(mocks.leaveCohort).toHaveBeenCalledWith('coh-1'));
  });
});
