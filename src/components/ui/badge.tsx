import * as React from 'react';
import { cn } from '../../lib/utils';

type Tone = 'accent' | 'neutral' | 'success';

const TONES: Record<Tone, string> = {
  accent: 'bg-accent/10 text-accent border border-accent/30',
  neutral: 'bg-slate-100 dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-800',
  success: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30',
};

export function Badge({
  className,
  tone = 'neutral',
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider',
        TONES[tone],
        className,
      )}
      {...props}
    />
  );
}
