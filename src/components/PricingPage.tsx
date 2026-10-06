import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Check, Sparkles, BookOpen } from 'lucide-react';
import { apiClient, type BillingPlan } from '../lib/apiClient';
import { cn } from '../lib/utils';
import { Skeleton } from './ui/skeleton';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

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
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-[10px] font-black uppercase tracking-wider">
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
        <div className="grid gap-4 md:grid-cols-2 max-w-3xl mx-auto" aria-label="Loading plans" role="status">
          {[0, 1].map((i) => (
            <Card key={i} className="p-6 space-y-4">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-9 w-28" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
              <div className="space-y-2 pt-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
                <Skeleton className="h-3 w-3/4" />
              </div>
              <Skeleton className="h-10 w-full rounded-xl" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 max-w-3xl mx-auto">
          {plans.map((p) => {
            const isCurrent = currentTier === p.id;
            const isPaid = p.id === 'institutional';
            return (
              <Card
                key={p.id}
                className={cn(
                  'p-6 flex flex-col',
                  isPaid ? 'border-emerald-500 ring-1 ring-emerald-500/30' : 'border-slate-200 dark:border-slate-800'
                )}
              >
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">{p.name}</span>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="tnum text-3xl font-black text-slate-900 dark:text-white">${p.monthly}</span>
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
                  <Badge tone="success" className="mt-5 w-full justify-center rounded-xl px-4 py-2.5 text-xs">
                    Current plan
                  </Badge>
                ) : isPaid ? (
                  <Button onClick={checkout} disabled={checkingOut} className="mt-5 w-full">
                    {checkingOut ? 'Redirecting…' : 'Get Institutional'}
                  </Button>
                ) : (
                  <Badge tone="neutral" className="mt-5 w-full justify-center rounded-xl px-4 py-2.5 text-xs">
                    Free forever
                  </Badge>
                )}
              </Card>
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
          className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:underline cursor-pointer"
        >
          <BookOpen className="w-3.5 h-3.5" /> View the classroom curriculum guide
        </button>
      </div>
    </div>
  );
}
