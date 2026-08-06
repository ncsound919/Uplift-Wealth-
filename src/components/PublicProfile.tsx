import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Flame, GraduationCap, Award, Trophy, Loader2 } from 'lucide-react';
import { apiClient, type PublicProfile as PublicProfileData } from '../lib/apiClient';

export function PublicProfile() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<PublicProfileData | null>(null);
  const [status, setStatus] = useState<'loading' | 'found' | 'missing' | 'error'>('loading');

  useEffect(() => {
    if (!userId) return;
    setStatus('loading');
    apiClient.getPublicProfile(userId)
      .then((p) => { setProfile(p); setStatus('found'); })
      .catch((err) => {
        setStatus((err instanceof Error && /not found/i.test(err.message)) ? 'missing' : 'error');
      });
  }, [userId]);

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-6">
      <button
        onClick={() => navigate('/')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to dashboard
      </button>

      {status === 'loading' && (
        <div className="flex items-center gap-2 text-sm text-slate-400 py-10">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading profile…
        </div>
      )}

      {status === 'missing' && (
        <div className="text-center py-14">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Profile not found</h2>
          <p className="text-sm text-slate-500 mt-2">This profile is private or doesn't exist.</p>
        </div>
      )}

      {status === 'error' && (
        <div className="text-center py-14 text-sm text-rose-600 dark:text-rose-400">Could not load this profile.</div>
      )}

      {status === 'found' && profile && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center text-2xl font-black">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-3">{profile.name}</h1>
            <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Overlay Wealth Scholar</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Flame, label: 'Streak', value: `${profile.streakDays} days` },
              { icon: Trophy, label: 'XP', value: profile.xp.toLocaleString() },
              { icon: GraduationCap, label: 'Modules', value: `${profile.completedModules.length} completed` },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 text-center">
                  <Icon className="w-4 h-4 mx-auto text-indigo-500" />
                  <div className="text-sm font-black text-slate-900 dark:text-white mt-1.5">{s.value}</div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">{s.label}</div>
                </div>
              );
            })}
          </div>

          {profile.badges.length > 0 && (
            <div className="rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4">
              <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                <Award className="w-3.5 h-3.5 text-amber-500" /> Credentials
              </div>
              <div className="flex flex-wrap gap-1.5">
                {profile.badges.map((b) => (
                  <span key={b} className="px-2 py-0.5 bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-[11px] font-bold rounded-md">
                    {b.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
