import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Check, Loader2, Sparkles, BookOpen } from 'lucide-react';
import { apiClient, type BillingPlan } from '../lib/apiClient';
import { cn } from '../lib/utils';

export function PricingPage({ currentTier, onRequireAuth }: { currentTier?: string; onRequireAuth?: () => void }) {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<BillingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkingOut, setCheckingOut] = useState<boolean>(false);
  const upgraded = params.get('upgraded') === 'true';

  const load = useCallback(() => {
    apiClient.getBillingPlans()
      .then((res) => { setPlans(res.plans); setLoading(false); })
      .catch(() => { setPlans([]); setLoading(false); });
  }, []);
  useEffect(() => { load(); }, [load]);

  const checkout = async () => {
    setError(null);
    if (!currentTier || currentTier === 'guest') {
      onRequireAuth?.();
      return;
    }
    setCheckingOut(true);
    try {
      const res = await apiClient.startCheckout('institutional');
      if (res.url) window.location.href = res.url;
      else setError('Checkout is not available yet.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed.');
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-amber-500 text-white text-[10px] font-black uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Overlay Wealth</span>
        </div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white">Simple pricing</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          Financial literacy is free. Advanced modules, certificates, and classroom tools are worth every cent.
        </p>
        {upgraded && (
          <div className="inline-block px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-400">
            🎉 Welcome to Premium — your expert modules are now unlocked.
          </div>
        )}
      </div>

      {error && <div className="mx-auto max-w-md text-center text-xs text-rose-600 dark:text-rose-400">{error}</div>}

      {loading ? (
        <div className="flex items-center justify-center gap-2 text-sm text-slate-400 py-10">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading plans…
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 max-w-3xl mx-auto">
          {plans.map((p) => {
            const isCurrent = currentTier === p.id;
            const isPaid = p.id === 'institutional';
            return (
              <div
                key={p.id}
                className={cn(
                  'rounded-2xl border bg-white dark:bg-slate-950 p-6 flex flex-col',
                  isPaid ? 'border-emerald-500 ring-1 ring-emerald-500/30' : 'border-slate-200 dark:border-slate-800'
                )}
              >
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">{p.name}</span>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">${p.monthly}</span>
                  <span className="text-xs text-slate-400">/mo</span>
                </div>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">{p.description}</p>
                <ul className="mt-4 space-y-2 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" /> {f}
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <div className="mt-5 px-4 py-2.5 rounded-xl text-center text-xs font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                    Current plan
                  </div>
                ) : isPaid ? (
                  <button
                    onClick={checkout}
                    disabled={checkingOut}
                    className="mt-5 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer transition-colors disabled:opacity-50"
                  >
                    {checkingOut ? 'Redirecting…' : 'Get Institutional'}
                  </button>
                ) : (
                  <div className="mt-5 px-4 py-2.5 rounded-xl text-center text-xs font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-900 text-slate-500">
                    Free forever
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="text-center text-[11px] text-slate-400">
        Membership is always free — all modules, games, and certificates, no paywalls. Institutional pricing supports classrooms, HBCU chapters, churches, and community organizations.
      </p>

      <div className="text-center">
        <button
          onClick={() => navigate('/institutional')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
        >
          <BookOpen className="w-3.5 h-3.5" /> View the classroom curriculum guide
        </button>
      </div>
    </div>
  );
}
