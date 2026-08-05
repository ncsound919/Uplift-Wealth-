import { useNavigate } from 'react-router';
import { wealthChapters } from '../data/wealthChapters';
import { useChapterCompletion } from '../hooks/useChapterCompletion';
import { CompoundGrowthVisualizer } from './wealth/tools/CompoundGrowthVisualizer';
import { TrendingUp, RotateCcw, CheckCircle2 } from 'lucide-react';

export function WealthBuilding() {
  const navigate = useNavigate();
  const { isComplete, completed, reset } = useChapterCompletion();

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-2 animate-fade-in">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-amber-500 text-white text-xs font-black uppercase tracking-wider">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Personal Wealth</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Wealth Building</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-2xl">
          {wealthChapters.length} paths to wealth — building credit, investing, real estate, business, hustles, and group economics on your terms.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-500">Chapters Completed</span>
          <span className="text-sm font-black text-slate-900 dark:text-white">{completed.length} / {wealthChapters.length}</span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-500 to-amber-500 rounded-full transition-all duration-500"
            style={{ width: `${(completed.length / wealthChapters.length) * 100}%` }} />
        </div>
        <button onClick={reset}
          className="mt-3 flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
          aria-label="Reset all wealth building progress">
          <RotateCcw className="w-3 h-3" /> Reset Progress
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {wealthChapters.map(chapter => {
          const done = isComplete(chapter.id);
          const Icon = chapter.icon;
          return (
            <button key={chapter.id} onClick={() => navigate(`/wealth-building/${chapter.id}`)}
              className={`relative text-left bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-xs hover:shadow-sm transition-all cursor-pointer group overflow-hidden ${done ? 'border-emerald-300 dark:border-emerald-800' : 'border-slate-200 dark:border-slate-800'}`}
              aria-label={`${chapter.title}${done ? ' (completed)' : ''}`}>
              {done && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${chapter.gradient} rounded-xl flex items-center justify-center shrink-0 text-white shadow-sm group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <h3 className="font-black text-sm text-slate-900 dark:text-white">{chapter.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{chapter.subtitle}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-400 font-bold">{chapter.estimatedMinutes} min</span>
                    {done && <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">✓ Complete</span>}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <CompoundGrowthVisualizer compact />
      </div>
    </div>
  );
}
