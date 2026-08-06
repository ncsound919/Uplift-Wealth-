import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Award, Send } from 'lucide-react';
import { apiClient } from '../lib/apiClient';

export function CreatorApplicationForm() {
  const [status, setStatus] = useState<'loading' | 'none' | 'pending' | 'verified' | 'rejected'>('loading');
  const [bio, setBio] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    apiClient.getCreatorStatus()
      .then((res) => {
        if (res.verified) setStatus('verified');
        else if (res.application?.status === 'pending') setStatus('pending');
        else if (res.application?.status === 'rejected') setStatus('rejected');
        else setStatus('none');
      })
      .catch(() => setStatus('none'));
  }, []);
  useEffect(() => { load(); }, [load]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(null);
    try {
      await apiClient.applyAsCreator(bio, portfolioUrl || undefined);
      setStatus('pending');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit application.');
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading') return null;
  if (status === 'verified') {
    return (
      <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/20 p-4 flex items-center gap-2.5">
        <Award className="w-5 h-5 text-emerald-500 shrink-0" />
        <div>
          <span className="block text-sm font-black text-emerald-700 dark:text-emerald-400">Verified Educator</span>
          <span className="block text-[11px] text-emerald-600 dark:text-emerald-500">You're approved to publish content on Overlay Wealth.</span>
        </div>
      </div>
    );
  }
  if (status === 'pending') {
    return (
      <div className="rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20 p-4">
        <span className="block text-sm font-black text-amber-700 dark:text-amber-400">Educator application under review</span>
        <span className="block text-[11px] text-amber-600 dark:text-amber-500 mt-0.5">Our team will review your application shortly.</span>
      </div>
    );
  }
  if (status === 'rejected') {
    return (
      <div className="rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 p-4">
        <span className="block text-sm font-black text-rose-700 dark:text-rose-400">Application not approved</span>
        <span className="block text-[11px] text-rose-600 dark:text-rose-500 mt-0.5">You can apply again with more detail.</span>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Award className="w-4 h-4 text-amber-500" />
        <span className="text-sm font-black text-slate-900 dark:text-white">Become a Verified Educator</span>
      </div>
      <p className="text-[11px] text-slate-500 leading-relaxed">
        Teach a topic in financial literacy, credit, investing, or business. Approved educators can publish lessons on the platform.
      </p>
      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        placeholder="What do you teach and what makes your perspective valuable?"
        maxLength={2000}
        rows={3}
        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm resize-none focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
      />
      <input
        value={portfolioUrl}
        onChange={(e) => setPortfolioUrl(e.target.value)}
        placeholder="Portfolio or social link (optional)"
        maxLength={500}
        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
      />
      {error && <div className="text-xs text-rose-600 dark:text-rose-400">{error}</div>}
      <button type="submit" disabled={saving || bio.trim().length < 20} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-white text-xs font-bold cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
        <Send className="w-3.5 h-3.5" /> {saving ? 'Submitting…' : 'Submit Application'}
      </button>
    </form>
  );
}
