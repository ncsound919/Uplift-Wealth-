import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileQuestion } from 'lucide-react';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="max-w-lg mx-auto text-center py-20 px-4 animate-fade-in">
      <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
        <FileQuestion className="w-10 h-10 text-slate-400" />
      </div>
      <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">404</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-8">
        This page doesn't exist. It may have moved or the link might be incorrect.
      </p>
      <button
        onClick={() => navigate('/')}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>
    </div>
  );
}
