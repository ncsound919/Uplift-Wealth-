import { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { apiClient } from '../lib/apiClient';

interface AuthCallbackProps {
  onSuccess: (user: any) => void;
}

export function AuthCallback({ onSuccess }: AuthCallbackProps) {
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const error = params.get('error');
    if (error || !code) {
      window.location.href = '/home';
      return;
    }
    (async () => {
      try {
        const r = await fetch('/api/auth/google/callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });
        const data = await r.json();
        if (data.token && data.user) {
          apiClient.setStoredSession(data.token, data.user);
          onSuccess(data.user);
        }
      } catch {
        // ignore — fall through to home
      }
      window.location.href = '/home';
    })();
  }, [onSuccess]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
      <div className="text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Completing sign-in…</p>
      </div>
    </div>
  );
}