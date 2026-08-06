import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { PublicProfile } from './PublicProfile';

const mocks = vi.hoisted(() => ({
  getPublicProfile: vi.fn(),
  navigate: vi.fn(),
}));

vi.mock('react-router', () => ({
  useParams: () => ({ userId: 'usr-abc' }),
  useNavigate: () => mocks.navigate,
}));

vi.mock('../lib/apiClient', () => ({
  apiClient: { getPublicProfile: mocks.getPublicProfile },
}));

describe('PublicProfile', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows loading then a public profile', async () => {
    mocks.getPublicProfile.mockResolvedValue({
      id: 'usr-abc', name: 'Nia Carter', badges: ['wise_wizard'], streakDays: 7,
      track: 'all', xp: 1200, completedModules: ['module-1'], completedLessonsCount: 4,
    });
    render(<PublicProfile />);
    expect(await screen.findByText('Nia Carter')).toBeInTheDocument();
    expect(screen.getByText(/7 days/)).toBeInTheDocument();
    expect(screen.getByText(/1,200/)).toBeInTheDocument();
    expect(screen.getByText(/1 completed/)).toBeInTheDocument();
  });

  it('shows profile not found for a private/missing profile', async () => {
    mocks.getPublicProfile.mockRejectedValue(new Error('Profile not found.'));
    render(<PublicProfile />);
    expect(await screen.findByText(/Profile not found/i)).toBeInTheDocument();
  });

  it('shows an error state for other failures', async () => {
    mocks.getPublicProfile.mockRejectedValue(new Error('network'));
    render(<PublicProfile />);
    expect(await screen.findByText(/Could not load this profile/i)).toBeInTheDocument();
  });

  it('navigates back to the dashboard', async () => {
    mocks.getPublicProfile.mockResolvedValue({
      id: 'usr-abc', name: 'Nia', badges: [], streakDays: 0, track: 'all', xp: 0, completedModules: [], completedLessonsCount: 0,
    });
    render(<PublicProfile />);
    await screen.findByText('Nia');
    await waitFor(() => expect(mocks.navigate).not.toHaveBeenCalled());
  });
});
