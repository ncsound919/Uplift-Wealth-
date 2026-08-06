import { useState, type FormEvent } from 'react';
import { Mail, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface WaitlistFormProps {
  source?: string;
  compact?: boolean;
}

export function WaitlistForm({ source = 'website', compact = false }: WaitlistFormProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source }),
      });
      if (!res.ok) throw new Error('waitlist failed');
      setStatus('done');
      setMessage('You\u2019re on the list! Watch your inbox for a confirmation.');
    } catch {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  if (status === 'done') {
    return (
      <div className={cn('flex items-start gap-2.5', compact ? 'max-w-md' : 'max-w-xl')}>
        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
        <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">{message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className={cn('w-full', compact ? 'max-w-md' : 'max-w-xl')}>
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            aria-label="Email address"
            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />
        </div>
        <button
          type="submit"
          disabled={status === 'loading' || !email.trim()}
          className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'loading' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
          Join the list
        </button>
      </div>
      {status === 'error' && (
        <p className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 mt-2">
          <AlertCircle className="w-3.5 h-3.5" />
          {message}
        </p>
      )}
    </form>
  );
}
