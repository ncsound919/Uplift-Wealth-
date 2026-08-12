/**
 * Supabase session verification for Overlay Wealth.
 *
 * Migration path (Phase 1.1 of the Overlay365 ecosystem plan): Wealth's legacy
 * JWT auth stays intact as the default (`AUTH_MODE=legacy`). Setting
 * `AUTH_MODE=supabase` makes Wealth verify the same Supabase session tokens
 * Health issues, so one account works across every property. The legacy JWT
 * code is removed only after two weeks of green telemetry in supabase mode.
 *
 * Server-only module — never imported by the client bundle.
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { AuthUser } from './auth';

export type AuthMode = 'supabase' | 'legacy';

const ALLOWED_ROLES: AuthUser['role'][] = ['student', 'builder', 'institution', 'admin'];

/** Active auth mode. Defaults to legacy so nothing breaks without config. */
export function getAuthMode(): AuthMode {
  return process.env.AUTH_MODE === 'supabase' ? 'supabase' : 'legacy';
}

export function isSupabaseAuthEnabled(): boolean {
  return getAuthMode() === 'supabase';
}

/** True when the shared Supabase project env vars are present. */
export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

let _admin: SupabaseClient | null = null;

/** Service-role client for token verification + profile writes (bypasses RLS). */
export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  if (!_admin) {
    _admin = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
  }
  return _admin;
}

/**
 * Verify a Supabase access token (issued by the shared project) and map it to
 * Wealth's AuthUser shape. Role comes from the user's `role` user_metadata,
 * defaulting to `student`. Returns null when the token is absent/invalid.
 */
export async function verifySupabaseToken(bearerToken: string): Promise<AuthUser | null> {
  if (!isSupabaseAuthEnabled()) return null;
  const admin = getSupabaseAdmin();
  if (!admin) return null;
  try {
    const { data, error } = await admin.auth.getUser(bearerToken);
    if (error || !data.user) return null;
    const metaRole = data.user.user_metadata?.role as string | undefined;
    const role: AuthUser['role'] =
      metaRole && ALLOWED_ROLES.includes(metaRole as AuthUser['role']) ? (metaRole as AuthUser['role']) : 'student';
    return { id: data.user.id, role };
  } catch {
    return null;
  }
}

/** Upsert the shared profiles row after sign-in so the hub sees the user. */
export async function syncProfile(userId: string, email: string | undefined, memberName?: string): Promise<void> {
  const admin = getSupabaseAdmin();
  if (!admin) return;
  try {
    await admin
      .from('profiles')
      .upsert(
        { id: userId, email: email ?? null, member_name: memberName ?? email?.split('@')[0] ?? '' },
        { onConflict: 'id' }
      );
  } catch {
    // Best-effort; login must not fail because the profile sync hiccuped.
  }
}

export interface SupabaseSessionResult {
  token: string;
  refreshToken?: string;
  user: {
    id: string;
    email?: string;
    name: string;
    role: AuthUser['role'];
  };
}

export async function signInWithSupabase(
  email: string,
  password: string
): Promise<SupabaseSessionResult | null> {
  const admin = getSupabaseAdmin();
  if (!admin) return null;
  const { data, error } = await admin.auth.signInWithPassword({ email, password });
  if (error || !data.session) return null;
  await syncProfile(data.user.id, data.user.email ?? email, data.user.user_metadata?.member_name as string | undefined);
  return mapSession(data);
}

export async function signUpWithSupabase(
  email: string,
  password: string,
  name?: string
): Promise<SupabaseSessionResult | null> {
  const admin = getSupabaseAdmin();
  if (!admin) return null;
  const { data, error } = await admin.auth.signUp({
    email,
    password,
    options: { data: { member_name: name?.trim() || email.split('@')[0] } },
  });
  if (error || !data.session) return null;
  await syncProfile(data.user.id, data.user.email ?? email, name?.trim());
  return mapSession(data);
}

export async function refreshSupabaseSession(refreshToken: string): Promise<SupabaseSessionResult | null> {
  const admin = getSupabaseAdmin();
  if (!admin) return null;
  const { data, error } = await admin.auth.refreshSession({ refresh_token: refreshToken });
  if (error || !data.session) return null;
  await syncProfile(data.user.id, data.user.email, data.user.user_metadata?.member_name as string | undefined);
  return mapSession(data);
}

function mapSession(data: {
  session: { access_token: string; refresh_token: string };
  user: { id: string; email?: string | null; user_metadata?: Record<string, unknown>; role?: string };
}): SupabaseSessionResult {
  const metaRole = data.user.user_metadata?.role as string | undefined;
  const role: AuthUser['role'] =
    metaRole && ALLOWED_ROLES.includes(metaRole as AuthUser['role']) ? (metaRole as AuthUser['role']) : 'student';
  return {
    token: data.session.access_token,
    refreshToken: data.session.refresh_token,
    user: {
      id: data.user.id,
      email: data.user.email ?? undefined,
      name: (data.user.user_metadata?.member_name as string | undefined) ?? data.user.email?.split('@')[0] ?? 'Scholar User',
      role,
    },
  };
}
