interface Props {
  chapterId: string;
  isComplete: boolean;
  onToggle: (id: string) => void;
}

export function MarkCompleteButton({ chapterId, isComplete, onToggle }: Props) {
  return (
    <div className="flex justify-center pt-8 border-t border-slate-200 dark:border-slate-800 mt-8">
      <button
        onClick={() => onToggle(chapterId)}
        className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
          isComplete
            ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 cursor-default'
            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
        }`}
        aria-label={isComplete ? `${chapterId} chapter completed` : `Mark ${chapterId} chapter as complete`}
      >
        {isComplete ? (
          <><span>✓</span><span>Completed</span></>
        ) : (
          <><span>○</span><span>Mark Complete</span></>
        )}
      </button>
    </div>
  );
}
