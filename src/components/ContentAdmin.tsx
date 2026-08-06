import { useEffect, useMemo, useState } from 'react';
import Markdown from 'react-markdown';
import { Save, Trash2, Clock, FileText } from 'lucide-react';
import { courseModules } from '../data/courseData';
import { apiClient, type ContentRevisionView } from '../lib/apiClient';
import { cn } from '../lib/utils';

export function ContentAdmin() {
  const modules = useMemo(() => courseModules, []);
  const [moduleId, setModuleId] = useState(modules[0]?.id || '');
  const [lessonId, setLessonId] = useState(modules[0]?.lessons[0]?.id || '');
  const [content, setContent] = useState('');
  const [loadedBase, setLoadedBase] = useState('');
  const [overridden, setOverridden] = useState(false);
  const [revisions, setRevisions] = useState<ContentRevisionView[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const lesson = modules.find((m) => m.id === moduleId)?.lessons.find((l) => l.id === lessonId);

  const load = async (mid: string, lid: string) => {
    setStatus(null); setError(null);
    const base = modules.find((m) => m.id === mid)?.lessons.find((l) => l.id === lid)?.content || '';
    setLoadedBase(base);
    try {
      const eff = await apiClient.getEffectiveContent(mid, lid);
      setOverridden(eff.overridden);
      setContent(eff.overridden && eff.content !== null ? eff.content : base);
      const revs = await apiClient.getContentRevisions(mid, lid);
      setRevisions(revs.revisions);
    } catch {
      setOverridden(false);
      setContent(base);
      setRevisions([]);
    }
  };

  useEffect(() => {
    if (moduleId && lessonId) void load(moduleId, lessonId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleId, lessonId]);

  const save = async () => {
    setError(null); setStatus(null);
    try {
      await apiClient.saveLessonOverride(moduleId, lessonId, content);
      setOverridden(true);
      setStatus('Saved. This lesson now shows your version.');
      void load(moduleId, lessonId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed.');
    }
  };

  const revert = async () => {
    try {
      await apiClient.deleteLessonOverride(moduleId, lessonId);
      setStatus('Reverted to the original lesson.');
      void load(moduleId, lessonId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Revert failed.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4">
      <div className="flex items-center gap-2">
        <FileText className="w-5 h-5 text-indigo-500" />
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Content Editor</h2>
          <p className="text-xs text-slate-500">Edit lesson markdown for educators. Changes apply immediately and are versioned.</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Module</label>
          <select value={moduleId} onChange={(e) => { setModuleId(e.target.value); setLessonId(modules.find((m) => m.id === e.target.value)?.lessons[0]?.id || ''); }}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm">
            {modules.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Lesson</label>
          <select value={lessonId} onChange={(e) => setLessonId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm">
            {modules.find((m) => m.id === moduleId)?.lessons.map((l) => <option key={l.id} value={l.id}>{l.title}</option>)}
          </select>
        </div>
      </div>

      {overridden && (
        <div className="px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-400">
          This lesson has a custom version.
        </div>
      )}
      {status && <div className="px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-400">{status}</div>}
      {error && <div className="px-3 py-2 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-400">{error}</div>}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Markdown</span>
            <button onClick={save} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold cursor-pointer transition-colors">
              <Save className="w-3 h-3" /> Save
            </button>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={18}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm font-mono leading-relaxed focus:ring-2 focus:ring-indigo-500 focus:outline-hidden resize-y"
          />
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400">{lesson?.title}</span>
            {overridden && (
              <button onClick={revert} className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-rose-500 cursor-pointer">
                <Trash2 className="w-3 h-3" /> Revert to original
              </button>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Preview</span>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 min-h-[300px] prose prose-slate dark:prose-invert max-w-none text-sm">
            <Markdown>{content}</Markdown>
          </div>
        </div>
      </div>

      {revisions.length > 0 && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4">
          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
            <Clock className="w-3.5 h-3.5" /> Revision history
          </div>
          <div className="space-y-1.5">
            {revisions.map((r) => (
              <div key={r.id} className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-600 dark:text-slate-300">v{r.version} · {new Date(r.updatedAt).toLocaleString()}</span>
                <button
                  onClick={() => { setContent(r.content); setStatus(`Loaded v${r.version}. Save to apply it.`); }}
                  className={cn('text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer')}
                >
                  Load
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
