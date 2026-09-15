// Ecosystem-wide auth client (shared Supabase project, auth-only).
// Wealth keeps its own database; this project is the single Google/identity IdP.
// Env (never committed):
//   VITE_ECOSYSTEM_SUPABASE_URL=https://<ref>.supabase.co
//   VITE_ECOSYSTEM_SUPABASE_ANON_KEY=<anon key>
// When unset, the app runs without ecosystem login and <EcosystemLogin />
// renders nothing. Existing email + server-initiated Google flows are untouched.
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_ECOSYSTEM_SUPABASE_URL || '';
const anonKey = import.meta.env.VITE_ECOSYSTEM_SUPABASE_ANON_KEY || '';

export const isEcosystemAuthConfigured = Boolean(url && anonKey);

export const ecosystemSupabase = isEcosystemAuthConfigured ? createClient(url, anonKey) : null;

export async function signInWithGoogle() {
  if (!ecosystemSupabase) return { error: 'Ecosystem auth not configured' };
  const { data, error } = await ecosystemSupabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  });
  if (error) return { error: error.message };
  if (data?.url) window.location.href = data.url;
  return { success: true };
}

export async function signOutEcosystem() {
  if (!ecosystemSupabase) return;
  await ecosystemSupabase.auth.signOut();
}
