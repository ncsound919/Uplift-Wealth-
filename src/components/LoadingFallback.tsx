import { Loader2 } from 'lucide-react';

export function LoadingFallback({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-slate-200 dark:border-slate-800" />
        <Loader2 className="absolute inset-0 w-12 h-12 text-blue-500 animate-spin" />
      </div>
      <p className="text-sm text-slate-400 font-medium">{label}</p>
    </div>
  );
}
