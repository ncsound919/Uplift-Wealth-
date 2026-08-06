import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { GraduationCap, Users, Trophy, BookOpen, Plus, Loader2 } from 'lucide-react';
import { apiClient, type CohortView } from '../lib/apiClient';
import { cn } from '../lib/utils';

interface RosterMember {
  id: string;
  name: string;
  completedModules: string[];
  xp: number;
}

interface ClassView {
  cohort: CohortView;
  roster: RosterMember[];
}

export function InstitutionDashboard({ currentUserId, currentTier }: { currentUserId?: string; currentTier?: string }) {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<ClassView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const seats = currentTier === 'institutional' ? 50 : 10;

  const load = useCallback(() => {
    setLoading(true);
    apiClient.listInstitutionClasses()
      .then((res) => { setClasses(res.classes); setError(null); })
      .catch(() => setError('Could not load your institution dashboard.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const totalStudents = classes.reduce((acc, c) => acc + c.roster.length, 0);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/40 p-6 md:p-10 text-white shadow-xl">
        <div className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-indigo-500/10 blur-2xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-[10px] font-black uppercase tracking-wider">
            <GraduationCap className="w-3.5 h-3.5" /> Institution Dashboard
          </div>
          <h1 className="mt-3 text-3xl md:text-4xl font-black tracking-tight">Your classes & students</h1>
          <p className="mt-2 text-sm text-indigo-100/80 max-w-xl leading-relaxed">
            Track every group you teach — create a class, assign the curriculum, and watch each student's progress.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Classes', value: classes.length },
          { label: 'Students', value: totalStudents },
          { label: 'Plan', value: currentTier === 'institutional' ? 'Institutional' : 'Free' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 text-center">
            <div className="text-2xl font-black text-slate-900 dark:text-white">{s.value}</div>
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {currentTier !== 'institutional' && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/20 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="text-sm text-emerald-800 dark:text-emerald-300">
            <strong>Tip:</strong> free classes hold up to 10 students. Institutional upgrades each class to <strong>50 seats</strong> for \$99/mo.
          </div>
          <button onClick={() => navigate('/institutions')} className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider cursor-pointer transition-colors shrink-0">
            View Institutional pricing
          </button>
        </div>
      )}

      {error && <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-400">{error}</div>}

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-slate-400 py-8"><Loader2 className="w-4 h-4 animate-spin" /> Loading your classes…</div>
      ) : classes.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-10 text-center space-y-3">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center"><Users className="w-6 h-6" /></div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white">No classes yet</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">Create your first group (a class, church circle, or HBCU chapter), invite students with the code, and their progress will appear here.</p>
          <button onClick={() => navigate('/cohorts')} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider cursor-pointer transition-colors">
            <Plus className="w-3.5 h-3.5" /> Create a group
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {classes.map((c) => (
            <div key={c.cohort.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center"><BookOpen className="w-5 h-5" /></div>
                  <div>
                    <div className="text-sm font-black text-slate-900 dark:text-white">{c.cohort.name}</div>
                    <div className="text-[11px] text-slate-400 capitalize">{c.cohort.type.replace('_', ' ')} · {c.roster.length} students · {c.roster.length}/{seats} seats · invite code <span className="font-mono font-bold">{c.cohort.inviteCode}</span></div>
                  </div>
                </div>
                <button onClick={() => navigate('/cohorts')} className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer">Open group</button>
              </div>

              {c.roster.length === 0 ? (
                <p className="mt-4 text-xs text-slate-400 italic">No students enrolled yet. Share the invite code above.</p>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                        <th className="py-2 font-black">Student</th>
                        <th className="py-2 font-black text-right">Modules</th>
                        <th className="py-2 font-black text-right">XP</th>
                        <th className="py-2 font-black text-right">Progress</th>
                      </tr>
                    </thead>
                    <tbody>
                      {c.roster.map((m, i) => {
                        const assigned = c.cohort.moduleIds ?? [];
                        const done = assigned.filter((mid) => m.completedModules.includes(mid)).length;
                        const pct = assigned.length > 0 ? Math.round((done / assigned.length) * 100) : 0;
                        return (
                          <tr key={m.id} className="border-b border-slate-50 dark:border-slate-900">
                            <td className="py-2.5">
                              <span className="font-bold text-slate-800 dark:text-slate-200">{m.name}</span>
                              <span className="text-[10px] text-slate-400 ml-1.5">#{i + 1}</span>
                            </td>
                            <td className="py-2.5 text-right font-bold text-slate-700 dark:text-slate-300">{done} / {assigned.length || '—'}</td>
                            <td className="py-2.5 text-right font-black text-indigo-600 dark:text-indigo-400">{m.xp.toLocaleString()}</td>
                            <td className="py-2.5 text-right">
                              <div className="inline-flex items-center gap-2">
                                <div className="w-16 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                  <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500" style={{ width: `${pct}%` }} />
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 w-8 text-left">{pct}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
