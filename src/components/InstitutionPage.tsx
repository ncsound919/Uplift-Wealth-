import { useState } from 'react';
import { useNavigate } from 'react-router';
import { GraduationCap, Users, Trophy, Award, BookOpen, FileText, Check, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { apiClient } from '../lib/apiClient';
import { cn } from '../lib/utils';

export function InstitutionPage({ currentTier, onRequireAuth }: { currentTier?: string; onRequireAuth?: () => void }) {
  const navigate = useNavigate();
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const features = [
    { icon: Users, title: 'Up to 50 seats', desc: 'Enroll your whole classroom, chapter, or congregation under one account.' },
    { icon: Trophy, title: 'Group & roster analytics', desc: 'Create classes, assign the curriculum, and watch each student\u2019s progress on a live roster.' },
    { icon: BookOpen, title: 'Classroom curriculum guide (PDF)', desc: 'A ready-to-adopt guide with instructor direction, student worksheets, and references for all 16 modules.' },
    { icon: Award, title: 'Certificates & recognition', desc: 'Every learner earns verifiable completion certificates to celebrate progress.' },
    { icon: GraduationCap, title: 'Full curriculum access', desc: 'All 16 modules, simulators, games, and Wealth Building chapters — no paywalls.' },
    { icon: ShieldCheck, title: 'Trust & security', desc: 'Real accounts, durable storage, private-by-default profiles, and priority support.' },
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-12">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/40 p-8 md:p-14 text-white shadow-xl">
        <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-12 h-80 w-80 rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="relative max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-[10px] font-black uppercase tracking-wider">
            <GraduationCap className="w-3.5 h-3.5" /> Overlay Wealth · Institutions
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight">
            Bring real financial literacy to your <span className="text-gradient-cool">classroom</span>
          </h1>
          <p className="text-sm md:text-base text-indigo-100/80 leading-relaxed max-w-xl">
            Overlay Wealth for Institutions turns any class, HBCU chapter, church, or community organization into a place where money knowledge gets built together — with a full curriculum, groups, and progress tracking.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <button onClick={checkout} disabled={checkingOut} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-md cursor-pointer transition-colors disabled:opacity-50">
              Get Institutional — $99/mo {checkingOut && '· redirecting…'}
            </button>
            <button onClick={() => navigate('/institutional')} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/25 text-white text-xs font-black uppercase tracking-wider cursor-pointer transition-colors">
              <FileText className="w-4 h-4" /> Download curriculum PDF
            </button>
          </div>
        </div>
      </div>

      {/* What's included */}
      <div className="space-y-6">
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-amber-500 text-white text-[10px] font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> What's included
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">Everything a class needs</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="card-hover rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="mt-3 text-sm font-black text-slate-900 dark:text-white">{f.title}</h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pricing + adoption */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className={cn('rounded-3xl border border-emerald-500 ring-1 ring-emerald-500/30 bg-white dark:bg-slate-950 p-6 md:p-8')}>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-black text-slate-900 dark:text-white">$99</span>
            <span className="text-sm text-slate-400">/month</span>
          </div>
          <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase">Institutional</span>
          <ul className="mt-5 space-y-2">
            {[
              'Up to 50 seats',
              'Unlimited groups & classes',
              'Teacher roster analytics',
              'Classroom curriculum guide (PDF)',
              'Certificates for every learner',
              'Priority support',
            ].map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> {f}
              </li>
            ))}
          </ul>
          <button onClick={checkout} disabled={checkingOut} className="mt-6 w-full px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider cursor-pointer transition-colors disabled:opacity-50">
            {checkingOut ? 'Redirecting…' : 'Get Institutional'}
          </button>
          {error && <p className="mt-2 text-xs text-rose-600 dark:text-rose-400">{error}</p>}
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 md:p-8 space-y-4">
          <h3 className="text-lg font-black text-slate-900 dark:text-white">Adopt in three steps</h3>
          <ol className="space-y-3">
            {[
              ['Create a Group', 'An instructor spins up a class or circle — church group, HBCU chapter, club — in minutes.'],
              ['Assign the curriculum', 'Pick from all 16 modules; each member sees their own progress on the roster.'],
              ['Run it together', 'Leaderboards, discussions, and certificates keep learners accountable and celebrating.'],
            ].map(([t, d], i) => (
              <li key={t} className="flex gap-3">
                <span className="w-7 h-7 shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center text-xs font-black">{i + 1}</span>
                <div>
                  <div className="text-sm font-black text-slate-900 dark:text-white">{t}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{d}</div>
                </div>
              </li>
            ))}
          </ol>
          <button onClick={() => navigate('/institutional')} className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer">
            <ArrowRight className="w-3.5 h-3.5" /> View the full classroom curriculum guide (PDF)
          </button>
        </div>
      </div>

      <p className="text-center text-[11px] text-slate-400">
        Membership is always free for learners. Institutional pricing supports classrooms, HBCU chapters, churches, and community organizations. Part of Overlay365.
      </p>
    </div>
  );
}
