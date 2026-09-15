import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { EcosystemLogin } from './EcosystemLogin';

// Hermetic: stub the ecosystem module so this test never depends on whether
// VITE_ECOSYSTEM_SUPABASE_* happens to be set in the developer's .env.local.
vi.mock('../lib/ecosystemAuth', () => ({
  ecosystemSupabase: null,
  isEcosystemAuthConfigured: false,
  signInWithGoogle: vi.fn(),
  signOutEcosystem: vi.fn(),
}));

describe('EcosystemLogin', () => {
  it('renders nothing when VITE_ECOSYSTEM_SUPABASE_* is unconfigured', () => {
    const { container } = render(<EcosystemLogin />);
    expect(container.innerHTML).toBe('');
  });
});