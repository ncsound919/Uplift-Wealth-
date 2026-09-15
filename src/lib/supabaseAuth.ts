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
  return Boolean(adminUrl() && adminKey());
}

/** Shared-project URL (ecosystem IdP preferred; legacy SUPABASE_URL fallback). */
function adminUrl(): string | undefined {
  return process.env.ECOSYSTEM_SUPABASE_URL || process.env.SUPABASE_URL;
}

/** Shared-project service-role key (ecosystem-prefixed preferred). */
function adminKey(): string | undefined {
  return process.env.ECOSYSTEM_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
}

let _admin: SupabaseClient | null = null;

/** Service-role client for token verification + profile writes (bypasses RLS). */
export function getSupabaseAdmin(): SupabaseClient | null {
  const url = adminUrl();
  const key = adminKey();
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

// --- ECOSYSTEM SHARED AUTH (Overlay365 identity, auth-only) -----------------
// The ecosystem Supabase project is the single Google/identity IdP; Wealth
// keeps its own database. Tokens are verified with the anon key directly
// against `<ECOSYSTEM_SUPABASE_URL>/auth/v1/user` (8s timeout) — no
// service-role secret needed. Env (never committed):
//   ECOSYSTEM_SUPABASE_URL=https://<ref>.supabase.co
//   ECOSYSTEM_SUPABASE_ANON_KEY=<anon key>
// Unset → every helper below is inert and existing AUTH_MODE behavior is
// unchanged (additive migration path).

/** True when the shared ecosystem project env vars are present. */
export function isEcosystemAuthConfigured(): boolean {
  return Boolean(process.env.ECOSYSTEM_SUPABASE_URL && process.env.ECOSYSTEM_SUPABASE_ANON_KEY);
}

export interface EcosystemUser {
  id: string;
  email: string | null;
  appMetadata: unknown;
  userMetadata: unknown;
}

/**
 * Verify an ecosystem Supabase access token against the shared project.
 * Returns the minimal user claims, or null when unconfigured/absent/invalid.
 */
export async function getEcosystemUser(accessToken: string): Promise<EcosystemUser | null> {
  if (!isEcosystemAuthConfigured() || !accessToken) return null;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const r = await fetch(`${process.env.ECOSYSTEM_SUPABASE_URL}/auth/v1/user`, {
      headers: {
        apikey: process.env.ECOSYSTEM_SUPABASE_ANON_KEY as string,
        Authorization: `Bearer ${accessToken}`,
      },
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!r.ok) return null;
    const user = await r.json();
    if (!user || typeof user.id !== 'string') return null;
    return {
      id: user.id,
      email: user.email ?? null,
      appMetadata: user.app_metadata,
      userMetadata: user.user_metadata,
    };
  } catch {
    return null;
  }
}

/**
 * Map an ecosystem identity to Wealth's AuthUser shape. Role comes from the
 * user's `role` user_metadata, defaulting to `student`. Null when the token
 * is absent/invalid or the ecosystem project is unconfigured.
 */
export async function verifyEcosystemToken(bearerToken: string): Promise<AuthUser | null> {
  const user = await getEcosystemUser(bearerToken);
  if (!user) return null;
  const metaRole = (user.userMetadata as Record<string, unknown> | undefined)?.role as string | undefined;
  const role: AuthUser['role'] =
    metaRole && ALLOWED_ROLES.includes(metaRole as AuthUser['role']) ? (metaRole as AuthUser['role']) : 'student';
  return { id: user.id, role };
}
