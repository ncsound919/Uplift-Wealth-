import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Markdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { WealthChapter } from '../../data/wealthChapters';
import { useChapterCompletion } from '../../hooks/useChapterCompletion';
import { MarkCompleteButton } from './MarkCompleteButton';

interface Props {
  chapter: WealthChapter;
  tool: ReactNode;
}

export function ChapterShell({ chapter, tool }: Props) {
  const navigate = useNavigate();
  const { isComplete, markComplete } = useChapterCompletion();

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-2 animate-fade-in">
      <button
        onClick={() => navigate('/wealth-building')}
        className="flex items-center text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Wealth Building
      </button>

      <div className={`bg-gradient-to-r ${chapter.gradient} rounded-3xl p-8 text-white shadow-md`}>
        <h1 className="text-2xl font-black">{chapter.title}</h1>
        <p className="text-white/80 mt-2 text-sm max-w-2xl">{chapter.subtitle}</p>
        <span className="inline-block mt-3 text-xs font-bold uppercase tracking-wider text-white/60">
          ~{chapter.estimatedMinutes} min read
        </span>
      </div>

      <div className="prose prose-slate dark:prose-invert max-w-none">
        <Markdown
          remarkPlugins={[remarkMath]}
          rehypePlugins={[[rehypeKatex, { strict: false }]]}
          components={{
            a: ({ href, children }) => (
              <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline underline-offset-2 hover:text-blue-800 dark:hover:text-blue-300">
                {children} ↗
              </a>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 pl-4 py-2 pr-4 my-4 rounded-r-lg text-sm text-slate-700 dark:text-slate-300">
                <span className="font-black text-xs uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block mb-1">Black Wall Street Wisdom</span>
                {children}
              </blockquote>
            ),
          }}
        >
          {chapter.body}
        </Markdown>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        {tool}
      </div>

      <MarkCompleteButton chapterId={chapter.id} isComplete={isComplete(chapter.id)} onToggle={markComplete} />
    </div>
  );
}
