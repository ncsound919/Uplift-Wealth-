import { ArrowLeft } from 'lucide-react';

interface LegalPageProps {
  kind: 'privacy' | 'terms';
  onBack: () => void;
}

const PRIVACY_SECTIONS = [
  { title: 'Your progress is yours', body: 'Overlay Wealth is free for learners. Your profile, XP, streaks, badges, and completed lessons are stored to sync your progress across devices. Nothing is sold or shared.' },
  { title: 'Local-first learning', body: 'Most learning progress is stored in your browser and synced only when you sign in. You can reset or export your data at any time from the app.' },
  { title: 'Payments', body: 'Optional donations are processed by Stripe, Cash App, or Venmo. We only receive confirmation of the transaction, never your card details.' },
  { title: 'Institutional plans', body: 'The only paid offering is the institutional plan for classrooms and community organizations, billed through Stripe.' },
  { title: 'Contact', body: 'Questions? Email tap4500@gmail.com.' },
];

const TERMS_SECTIONS = [
  { title: 'Educational platform', body: 'Overlay Wealth provides interactive financial education and simulations. Nothing on the platform is individualized financial advice.' },
  { title: 'Free membership', body: 'All learner features are free. The institutional classroom plan is the only paid tier.' },
  { title: 'Simulations are practice', body: 'Trading simulators and games use fictional/sandbox money for education. They are not investment services.' },
  { title: 'Acceptable use', body: 'You agree not to misuse the platform, upload harmful content, or attempt to disrupt the service.' },
  { title: 'Contact', body: 'Questions? Email tap4500@gmail.com.' },
];

export function LegalPage({ kind, onBack }: LegalPageProps) {
  const sections = kind === 'privacy' ? PRIVACY_SECTIONS : TERMS_SECTIONS;
  const title = kind === 'privacy' ? 'Privacy Policy' : 'Terms of Service';
  const blurb = kind === 'privacy'
    ? 'How Overlay Wealth handles your data.'
    : 'The rules that keep Overlay Wealth free, fair, and open.';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-3xl px-4 py-12 md:px-8">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer mb-8"
        >
          <ArrowLeft size={14} /> Back to Overlay Wealth
        </button>

        <h1 className="font-display text-3xl font-black tracking-tight mb-2">{title}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">Last updated: August 27, 2026 · {blurb}</p>

        <div className="space-y-4">
          {sections.map((s) => (
            <div key={s.title} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">{s.title}</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}