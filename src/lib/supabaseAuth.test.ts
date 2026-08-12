import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const ORIGINAL_ENV = { ...process.env };

// Mutable fake Supabase client swapped per test. The module caches the admin
// client, so each test resets modules and re-imports fresh.
const fakeClient: any = {};
const clientStore: any = {
  auth: {},
  from: vi.fn().mockReturnValue({ upsert: vi.fn().mockResolvedValue({ error: null }) }),
};
clientStore.auth.getUser = vi.fn().mockResolvedValue({ data: { user: null }, error: null });
clientStore.auth.signInWithPassword = vi.fn();
clientStore.auth.signUp = vi.fn();
clientStore.auth.refreshSession = vi.fn();

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => fakeClient,
}));

let supabaseAuth: typeof import('./supabaseAuth');

beforeEach(async () => {
  vi.resetModules();
  // Rebuild the fake client so spies accumulate within a single test only.
  Object.assign(fakeClient, {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      refreshSession: vi.fn(),
    },
    from: vi.fn().mockReturnValue({ upsert: vi.fn().mockResolvedValue({ error: null }) }),
  });
  supabaseAuth = await import('./supabaseAuth');
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.restoreAllMocks();
});

describe('supabaseAuth: mode flag', () => {
  it('defaults to legacy when AUTH_MODE is unset', () => {
    delete process.env.AUTH_MODE;
    expect(supabaseAuth.getAuthMode()).toBe('legacy');
    expect(supabaseAuth.isSupabaseAuthEnabled()).toBe(false);
  });

  it('returns legacy for an unknown value', () => {
    process.env.AUTH_MODE = 'foo';
    expect(supabaseAuth.getAuthMode()).toBe('legacy');
  });

  it('enables supabase mode when AUTH_MODE=supabase', () => {
    process.env.AUTH_MODE = 'supabase';
    expect(supabaseAuth.getAuthMode()).toBe('supabase');
    expect(supabaseAuth.isSupabaseAuthEnabled()).toBe(true);
  });
});

describe('supabaseAuth: configuration', () => {
  it('is configured only when URL + service role key are both present', () => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    expect(supabaseAuth.isSupabaseConfigured()).toBe(false);

    process.env.SUPABASE_URL = 'https://x.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'sb-key';
    expect(supabaseAuth.isSupabaseConfigured()).toBe(true);
  });
});

describe('supabaseAuth: verifySupabaseToken', () => {
  it('returns null when supabase mode is off', async () => {
    delete process.env.AUTH_MODE;
    expect(await supabaseAuth.verifySupabaseToken('any-token')).toBeNull();
  });

  it('returns null when the project is not configured', async () => {
    process.env.AUTH_MODE = 'supabase';
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    expect(await supabaseAuth.verifySupabaseToken('any-token')).toBeNull();
  });

  it('resolves a valid token to a student AuthUser by default', async () => {
    process.env.AUTH_MODE = 'supabase';
    process.env.SUPABASE_URL = 'https://x.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'sb-key';
    fakeClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'uuid-1', user_metadata: {} } },
      error: null,
    });

    const user = await supabaseAuth.verifySupabaseToken('valid-token');
    expect(user).toEqual({ id: 'uuid-1', role: 'student' });
    expect(fakeClient.auth.getUser).toHaveBeenCalledWith('valid-token');
  });

  it('honors an admin role in user_metadata', async () => {
    process.env.AUTH_MODE = 'supabase';
    process.env.SUPABASE_URL = 'https://x.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'sb-key';
    fakeClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'uuid-2', user_metadata: { role: 'institution' } } },
      error: null,
    });

    expect(await supabaseAuth.verifySupabaseToken('valid-token')).toEqual({ id: 'uuid-2', role: 'institution' });
  });

  it('ignores an unknown metadata role and falls back to student', async () => {
    process.env.AUTH_MODE = 'supabase';
    process.env.SUPABASE_URL = 'https://x.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'sb-key';
    fakeClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'uuid-3', user_metadata: { role: 'superadmin' } } },
      error: null,
    });

    expect(await supabaseAuth.verifySupabaseToken('valid-token')).toEqual({ id: 'uuid-3', role: 'student' });
  });

  it('returns null when getUser reports an error', async () => {
    process.env.AUTH_MODE = 'supabase';
    process.env.SUPABASE_URL = 'https://x.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'sb-key';
    fakeClient.auth.getUser.mockResolvedValue({ data: { user: null }, error: new Error('bad token') });

    expect(await supabaseAuth.verifySupabaseToken('expired-token')).toBeNull();
  });
});

describe('supabaseAuth: profile sync', () => {
  it('upserts a profile row with the service-role client', async () => {
    process.env.AUTH_MODE = 'supabase';
    process.env.SUPABASE_URL = 'https://x.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'sb-key';
    const upsert = vi.fn().mockResolvedValue({ error: null });
    fakeClient.from.mockReturnValue({ upsert });

    await supabaseAuth.syncProfile('uuid-1', 'a@b.co', 'Ada');
    expect(upsert).toHaveBeenCalledWith(
      { id: 'uuid-1', email: 'a@b.co', member_name: 'Ada' },
      { onConflict: 'id' }
    );
  });

  it('never throws when the upsert fails', async () => {
    process.env.AUTH_MODE = 'supabase';
    process.env.SUPABASE_URL = 'https://x.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'sb-key';
    fakeClient.from.mockReturnValue({ upsert: vi.fn().mockRejectedValue(new Error('db down')) });

    await expect(supabaseAuth.syncProfile('uuid-1', 'a@b.co')).resolves.toBeUndefined();
  });
});

describe('supabaseAuth: sign in helpers', () => {
  const sessionFixture = () => ({
    data: {
      session: { access_token: 'access-1', refresh_token: 'refresh-1' },
      user: { id: 'uuid-1', email: 'a@b.co', user_metadata: {} },
    },
    error: null,
  });

  it('signs in and returns access + refresh tokens', async () => {
    process.env.AUTH_MODE = 'supabase';
    process.env.SUPABASE_URL = 'https://x.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'sb-key';
    fakeClient.auth.signInWithPassword.mockResolvedValue(sessionFixture());
    fakeClient.from.mockReturnValue({ upsert: vi.fn().mockResolvedValue({ error: null }) });

    const result = await supabaseAuth.signInWithSupabase('a@b.co', 'password123');
    expect(result).toEqual({
      token: 'access-1',
      refreshToken: 'refresh-1',
      user: { id: 'uuid-1', email: 'a@b.co', name: 'a', role: 'student' },
    });
  });

  it('returns null on a failed sign-in', async () => {
    process.env.AUTH_MODE = 'supabase';
    process.env.SUPABASE_URL = 'https://x.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'sb-key';
    fakeClient.auth.signInWithPassword.mockResolvedValue({ data: { session: null }, error: new Error('bad creds') });

    expect(await supabaseAuth.signInWithSupabase('a@b.co', 'wrong')).toBeNull();
  });

  it('returns null when supabase is not configured', async () => {
    process.env.AUTH_MODE = 'supabase';
    delete process.env.SUPABASE_URL;
    expect(await supabaseAuth.signInWithSupabase('a@b.co', 'pw')).toBeNull();
  });

  it('signs up with member_name in user_metadata', async () => {
    process.env.AUTH_MODE = 'supabase';
    process.env.SUPABASE_URL = 'https://x.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'sb-key';
    fakeClient.auth.signUp.mockResolvedValue(sessionFixture());
    fakeClient.from.mockReturnValue({ upsert: vi.fn().mockResolvedValue({ error: null }) });

    const result = await supabaseAuth.signUpWithSupabase('a@b.co', 'password123', 'Ada Lovelace');
    expect(fakeClient.auth.signUp).toHaveBeenCalledWith({
      email: 'a@b.co',
      password: 'password123',
      options: { data: { member_name: 'Ada Lovelace' } },
    });
    expect(result?.user.name).toBe('a');
  });

  it('refreshes a session with the refresh token', async () => {
    process.env.AUTH_MODE = 'supabase';
    process.env.SUPABASE_URL = 'https://x.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'sb-key';
    fakeClient.auth.refreshSession.mockResolvedValue(sessionFixture());
    fakeClient.from.mockReturnValue({ upsert: vi.fn().mockResolvedValue({ error: null }) });

    const result = await supabaseAuth.refreshSupabaseSession('refresh-1');
    expect(fakeClient.auth.refreshSession).toHaveBeenCalledWith({ refresh_token: 'refresh-1' });
    expect(result?.token).toBe('access-1');
  });
});
