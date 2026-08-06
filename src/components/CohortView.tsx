import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Users, Plus, Loader2, Trophy, LogIn, LogOut, Trash2, Copy, BookOpen, Save } from 'lucide-react';
import { apiClient, type CohortView, type CohortMember } from '../lib/apiClient';
import { courseModules } from '../data/courseData';
import { cn } from '../lib/utils';

const COHORT_TYPES = [
  { id: 'general', label: 'General Circle' },
  { id: 'church', label: 'Church / Faith Group' },
  { id: 'hbcu', label: 'HBCU / Campus Chapter' },
  { id: 'family', label: 'Family & Friends' },
  { id: 'club', label: 'Investment Club' },
];

export function CohortView({ currentUserId }: { currentUserId?: string }) {
  const [cohorts, setCohorts] = useState<CohortView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('general');
  const [description, setDescription] = useState('');
  const [code, setCode] = useState('');
  const [selected, setSelected] = useState<{ cohort: CohortView; members: CohortMember[] } | null>(null);
  const [curriculum, setCurriculum] = useState<string[]>([]);
  const [roster, setRoster] = useState<Array<{ id: string; name: string; completedModules: string[]; xp: number }>>([]);
  const [savingCurriculum, setSavingCurriculum] = useState(false);

  const refresh = useCallback(() => {
    setLoading(true);
    apiClient.listMyCohorts()
      .then((res) => setCohorts(res.cohorts))
      .catch(() => setError('Could not load your cohorts.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const openCohort = async (id: string) => {
    try {
      const res = await apiClient.getCohort(id);
      setSelected(res);
      setCurriculum(res.cohort.moduleIds ?? []);
      setError(null);
      if (res.cohort.ownerId === currentUserId) {
        apiClient.getCohortRoster(id).then((r) => setRoster(r.roster)).catch(() => {});
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not open cohort.');
    }
  };

  const saveCurriculum = async () => {
    if (!selected) return;
    setSavingCurriculum(true);
    try {
      const res = await apiClient.setCohortCurriculum(selected.cohort.id, curriculum);
      setSelected((prev) => (prev ? { ...prev, cohort: res.cohort } : prev));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save curriculum.');
    } finally {
      setSavingCurriculum(false);
    }
  };

  const create = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.createCohort({ name, type, description });
      setName(''); setType('general'); setDescription(''); setShowCreate(false);
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create cohort.');
    }
  };

  const join = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.joinCohortByCode(code);
      setCode('');
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not join cohort.');
    }
  };

  const leave = async (id: string) => {
    try {
      await apiClient.leaveCohort(id);
      setSelected(null);
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not leave cohort.');
    }
  };

  const remove = async (id: string) => {
    try {
      await apiClient.deleteCohort(id);
      setSelected(null);
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete cohort.');
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard?.writeText(code).catch(() => {});
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-emerald-500" />
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Learning Cohorts</h2>
            <p className="text-xs text-slate-500">Grow together — church groups, HBCU chapters, family circles, and clubs.</p>
          </div>
        </div>
        <button onClick={() => setShowCreate(v => !v)} className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer transition-colors">
          {showCreate ? 'Cancel' : '+ New Cohort'}
        </button>
      </div>

      {error && (
        <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-400">{error}</div>
      )}

      {showCreate && (
        <form onSubmit={create} className="space-y-3 p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Cohort name (e.g. Sunday Finance Circle)" maxLength={80}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden" />
          <div className="flex flex-wrap gap-2">
            {COHORT_TYPES.map((t) => (
              <button key={t.id} type="button" onClick={() => setType(t.id)}
                className={cn('px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors cursor-pointer border',
                  type === t.id ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/40' : 'text-slate-500 border-slate-200 dark:border-slate-800 hover:border-slate-300')}>
                {t.label}
              </button>
            ))}
          </div>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What will this cohort focus on?" maxLength={500} rows={2}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm resize-none focus:ring-2 focus:ring-emerald-500 focus:outline-hidden" />
          <div className="flex justify-end">
            <button type="submit" disabled={!name.trim()} className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer transition-colors disabled:opacity-50">Create Cohort</button>
          </div>
        </form>
      )}

      <form onSubmit={join} className="flex gap-2">
        <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Have an invite code? Enter it to join…" maxLength={8}
          className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm uppercase tracking-widest focus:ring-2 focus:ring-emerald-500 focus:outline-hidden" />
        <button type="submit" disabled={!code.trim()} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 dark:bg-white text-white dark:text-slate-950 text-xs font-bold cursor-pointer transition-colors disabled:opacity-40">
          <LogIn className="w-3.5 h-3.5" /> Join
        </button>
      </form>

      {loading ? (
        <div className="text-xs text-slate-400 animate-pulse py-6">Loading your cohorts…</div>
      ) : cohorts.length === 0 ? (
        <div className="text-xs text-slate-400 italic py-6">You're not in any cohorts yet. Create one or join with an invite code.</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {cohorts.map((c) => (
            <div key={c.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4">
              <button onClick={() => openCohort(c.id)} className="text-left w-full">
                <span className="text-sm font-bold text-slate-900 dark:text-white">{c.name}</span>
                <span className="block text-[11px] text-slate-400 mt-0.5 capitalize">{c.type.replace('_', ' ')} · {c.memberCount} members</span>
              </button>
              {c.description && <p className="text-xs text-slate-500 mt-2 leading-relaxed">{c.description}</p>}
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button onClick={() => copyCode(c.inviteCode)} className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-emerald-500 cursor-pointer">
                  <Copy className="w-3 h-3" /> {c.inviteCode}
                </button>
                {c.ownerId === currentUserId ? (
                  <button onClick={() => remove(c.id)} className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-500 cursor-pointer">
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                ) : (
                  <button onClick={() => leave(c.id)} className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-500 cursor-pointer">
                    <LogOut className="w-3 h-3" /> Leave
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">{selected.cohort.name}</h3>
            <button onClick={() => setSelected(null)} className="text-xs font-bold text-slate-400 hover:text-slate-700 cursor-pointer">Close</button>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-3">
            <Trophy className="w-3.5 h-3.5" /> Leaderboard
          </div>
          <div className="space-y-2">
            {selected.members.map((m, i) => (
              <div key={m.id} className="flex items-center justify-between rounded-lg bg-slate-50 dark:bg-slate-900 px-3 py-2">
                <div className="flex items-center gap-2.5">
                  <span className={cn('w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black',
                    i === 0 ? 'bg-amber-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500')}>{i + 1}</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{m.name}</span>
                </div>
                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">{m.xp.toLocaleString()} XP</span>
              </div>
            ))}
          </div>

          {selected.cohort.ownerId === currentUserId && (
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                <BookOpen className="w-3.5 h-3.5" /> Teacher · Curriculum
              </div>
              <div className="flex flex-wrap gap-1.5">
                {courseModules.map((mod) => (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => setCurriculum((prev) => (prev.includes(mod.id) ? prev.filter((x) => x !== mod.id) : [...prev, mod.id]))}
                    className={cn('px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors border',
                      curriculum.includes(mod.id)
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/40'
                        : 'text-slate-500 border-slate-200 dark:border-slate-800 hover:border-slate-300')}
                  >
                    {mod.title}
                  </button>
                ))}
              </div>
              <div className="flex justify-end">
                <button onClick={saveCurriculum} disabled={savingCurriculum} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold cursor-pointer transition-colors disabled:opacity-50">
                  <Save className="w-3 h-3" /> {savingCurriculum ? 'Saving…' : 'Save curriculum'}
                </button>
              </div>

              {roster.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Roster · assigned module completion</span>
                  {roster.map((r) => {
                    const done = curriculum.filter((mid) => r.completedModules.includes(mid));
                    return (
                      <div key={r.id} className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-600 dark:text-slate-300">{r.name}</span>
                        <span className="text-slate-400">{done.length} / {curriculum.length} assigned</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
