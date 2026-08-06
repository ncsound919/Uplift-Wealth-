import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { BarChart3, Flag, FlaskConical, RefreshCw, ShieldCheck, Users, Eye, EyeOff, Trophy, Clock, FileText, Award } from 'lucide-react';
import { PageMeta } from './PageMeta';
import { ContentAdmin } from './ContentAdmin';
import { getAllFlags, overrideFlag, clearOverride, clearAllOverrides, isFlagEnabled } from '../lib/featureFlags';
import { ACTIVE_EXPERIMENTS, getVariant } from '../lib/experiments';
import { apiClient } from '../lib/apiClient';
import { cn } from '../lib/utils';
import type { PlatformMetrics } from '../db/metrics';

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined;

export function AdminDashboard() {
  const [flags, setFlags] = useState(getAllFlags);
  const [refreshKey, setRefreshKey] = useState(0);
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
  const [metricsError, setMetricsError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const token = localStorage.getItem('hacu_auth_token') || '';
    fetch('/api/admin/metrics', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data) => {
        if (!cancelled) {
          setMetrics(data as PlatformMetrics);
          setMetricsError(false);
        }
      })
      .catch(() => {
        if (!cancelled) setMetricsError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleToggle = (flag: (typeof flags)[0]) => {
    if (flag.overridden) {
      clearOverride(flag.flag);
    } else {
      overrideFlag(flag.flag, !flag.enabled);
    }
    setFlags(getAllFlags());
    setRefreshKey(k => k + 1);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-2 animate-fade-in" key={refreshKey}>
      <PageMeta title="Admin Dashboard" description="Analytics, feature flags, and experiments." />

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-200 border border-slate-700 text-xs font-black uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Panel</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Dashboard</h2>
        </div>

        {!POSTHOG_KEY && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-xs font-bold">
            <EyeOff className="w-4 h-4" />
            <span>Analytics Disabled</span>
          </div>
        )}
        {POSTHOG_KEY && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
            <Eye className="w-4 h-4" />
            <span>PostHog Connected</span>
          </div>
        )}
      </div>

      {/* Platform Metrics */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-500" />
            Platform Metrics
          </h3>
          {metricsError && !metrics && (
            <span className="text-[11px] text-slate-400">Unavailable (sign in as admin to see live data)</span>
          )}
        </div>
        {metrics ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Users', value: metrics.totalUsers, icon: Users },
              { label: 'Lessons Completed', value: metrics.totalLessonsCompleted, icon: Trophy },
              { label: 'Active Today', value: metrics.activeToday, icon: Clock },
              { label: 'Active This Week', value: metrics.activeThisWeek, icon: Clock },
              { label: 'Modules Completed', value: metrics.totalModulesCompleted, icon: Trophy },
              { label: 'Quiz Attempts', value: metrics.totalQuizAttempts, icon: BarChart3 },
              { label: 'Avg Quiz Score', value: `${metrics.avgQuizScore}%`, icon: BarChart3 },
              { label: 'Donations', value: `$${metrics.totalDonationAmount.toLocaleString()}`, icon: Users },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-3">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <Icon className="w-3 h-3" />
                    {s.label}
                  </div>
                  <div className="text-xl font-black text-slate-900 dark:text-white mt-1">{s.value.toLocaleString?.() ?? s.value}</div>
                </div>
              );
            })}
            {metrics.topBadges.length > 0 && (
              <div className="col-span-2 md:col-span-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Top Badges</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {metrics.topBadges.map((b) => (
                    <span key={b.badge} className="px-2 py-0.5 bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-[11px] font-bold rounded-md">
                      {b.badge} × {b.count}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          !metricsError && (
            <div className="text-xs text-slate-400 py-4 animate-pulse">Loading metrics…</div>
          )
        )}
      </div>

      {!POSTHOG_KEY && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 space-y-3">
          <h3 className="font-black text-sm text-amber-800 dark:text-amber-300 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics Not Configured
          </h3>
          <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
            Set <code className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/50 font-mono text-xs">VITE_POSTHOG_KEY</code> in your .env file to enable event tracking, feature flags, and A/B experiments. 
            Get a free key at <a href="https://posthog.com" target="_blank" rel="noopener noreferrer" className="underline font-bold">posthog.com</a>.
          </p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Flag className="w-4 h-4 text-blue-500" />
              Feature Flags
            </h3>
            <button
              type="button"
              onClick={() => { clearAllOverrides(); setFlags(getAllFlags()); setRefreshKey(k => k + 1); }}
              className="text-xs font-bold text-slate-400 hover:text-rose-500 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Reset
            </button>
          </div>

          <div className="space-y-2">
            {flags.map(f => (
              <div key={f.flag} className="flex items-center justify-between py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{f.label}</span>
                  <span className="block text-xs text-slate-400 font-mono">{f.flag}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle(f)}
                  className={cn(
                    "relative w-10 h-5 rounded-full transition-colors cursor-pointer",
                    f.enabled ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
                  )}
                >
                  <span className={cn(
                    "absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-xs transition-transform",
                    f.enabled ? "translate-x-5" : "translate-x-0.5"
                  )} />
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4"
        >
          <div className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-purple-500" />
            <h3 className="font-black text-sm text-slate-900 dark:text-white">A/B Experiments</h3>
          </div>

          {ACTIVE_EXPERIMENTS.length === 0 ? (
            <p className="text-xs text-slate-400">No active experiments.</p>
          ) : (
            <div className="space-y-3">
              {ACTIVE_EXPERIMENTS.map(exp => {
                const variant = getVariant(exp.key);
                return (
                  <div key={exp.key} className="space-y-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{exp.name}</span>
                      <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded">
                        {variant}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{exp.description}</p>
                    <div className="flex gap-2 text-xs text-slate-400">
                      <span className="font-mono">{exp.variants.join(' / ')}</span>
                      <span>·</span>
                      <span>Metric: {exp.metric}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {POSTHOG_KEY && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4"
        >
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-500" />
            <h3 className="font-black text-sm text-slate-900 dark:text-white">PostHog Insights</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            View detailed analytics, funnels, and user sessions in the{' '}
            <a
              href="https://us.posthog.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 underline font-bold"
            >
              PostHog dashboard
            </a>
            . Tracked events: page views, lesson starts/completions, quiz attempts, game sessions, module completions, and certificate downloads.
          </p>
        </motion.div>
      )}

      <CreatorReviewPanel />

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-4 h-4 text-indigo-500" />
          <h3 className="font-black text-sm text-slate-900 dark:text-white">Content Editor</h3>
        </div>
        <ContentAdmin />
      </div>
    </div>
  );
}

function CreatorReviewPanel() {
  const [apps, setApps] = useState<Array<{ id: string; userId: string; bio: string; portfolioUrl?: string; status: string; createdAt: string }>>([]);
  const [loaded, setLoaded] = useState(false);
  const load = useCallback(() => {
    apiClient.listCreatorApplications()
      .then((res) => { setApps(res.applications); setLoaded(true); })
      .catch(() => { setLoaded(true); });
  }, []);
  useEffect(() => { load(); }, [load]);

  const review = async (id: string, status: 'approved' | 'rejected') => {
    await apiClient.reviewCreatorApplication(id, status).catch(() => {});
    load();
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
      <div className="flex items-center gap-2 mb-4">
        <Award className="w-4 h-4 text-amber-500" />
        <h3 className="font-black text-sm text-slate-900 dark:text-white">Educator Applications</h3>
      </div>
      {!loaded && <div className="text-xs text-slate-400 animate-pulse">Loading…</div>}
      {loaded && apps.length === 0 && <div className="text-xs text-slate-400 italic">No educator applications yet.</div>}
      <div className="space-y-2">
        {apps.map((a) => (
          <div key={a.id} className="rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 capitalize">{a.status}</span>
              <span className="text-[10px] text-slate-400">{new Date(a.createdAt).toLocaleDateString()}</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">{a.bio}</p>
            {a.portfolioUrl && <p className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-1">{a.portfolioUrl}</p>}
            {a.status === 'pending' && (
              <div className="flex gap-2 mt-2">
                <button onClick={() => review(a.id, 'approved')} className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold cursor-pointer transition-colors">
                  Approve
                </button>
                <button onClick={() => review(a.id, 'rejected')} className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-bold cursor-pointer transition-colors">
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
