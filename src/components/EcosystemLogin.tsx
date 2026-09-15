import { useEffect, useState } from 'react';
import { ecosystemSupabase, isEcosystemAuthConfigured, signInWithGoogle, signOutEcosystem } from '../lib/ecosystemAuth';
import { apiClient, UserProfile } from '../lib/apiClient';

// Ecosystem Google login for the Wealth sidebar.
// Renders nothing until VITE_ECOSYSTEM_SUPABASE_* is configured.
// Once the shared-IdP session exists it is exchanged for a Wealth app session
// (via /api/auth/supabase-token) so the app actually signs the user in.
export function EcosystemLogin({ onLinked }: { onLinked?: (user: UserProfile) => void }) {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!ecosystemSupabase) return;

    // Exchange a shared-IdP session for a Wealth app session. Best-effort: a
    // failure leaves the user a guest (the shared session is still shown here).
    const link = async (session: { access_token: string; refresh_token?: string } | null) => {
      if (!session?.access_token) return;
      try {
        const res = await apiClient.loginWithSupabaseToken(session.access_token, session.refresh_token);
        if (res.user) onLinked?.(res.user);
      } catch {
        // non-fatal
      }
    };

    ecosystemSupabase.auth.getSession().then(({ data }) => {
      setEmail(data?.session?.user?.email ?? null);
      link(data?.session);
    });
    const { data: sub } = ecosystemSupabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
      link(session);
    });
    return () => sub?.subscription?.unsubscribe();
  }, [onLinked]);

  if (!isEcosystemAuthConfigured) return null;

  if (!email) {
    return (
      <button
        type="button"
        data-testid="ecosystem-login-btn"
        onClick={signInWithGoogle}
        className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shadow-xs"
      >
        <span>Sign in with Google (Ecosystem)</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2" data-testid="ecosystem-login-state">
      <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 max-w-[160px] truncate" title={email}>
        {email}
      </span>
      <button
        type="button"
        onClick={async () => { await signOutEcosystem(); setEmail(null); }}
        className="px-2 py-1 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700 rounded transition-colors cursor-pointer"
      >
        Sign out
      </button>
    </div>
  );
}