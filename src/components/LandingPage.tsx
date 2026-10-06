import {
  GraduationCap, Gamepad2, Briefcase, Sparkles, Landmark, LineChart,
  BookOpen, ShieldCheck, ArrowRight, Layers, Coins, Trophy, Users
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface LandingPageProps {
  onEnter: () => void;
}

const FEATURES = [
  { icon: Layers, title: 'Learning Pathways', body: 'Structured fintech courses that take you from money basics to advanced credit, investing, real estate, and business — at your own pace.' },
  { icon: Gamepad2, title: 'Simulators & Games', body: 'Practice with a stock-market trading terminal, alternative lending, parametric insurance, and fraud-screening simulations.' },
  { icon: Briefcase, title: 'Business Builder', body: 'Stress-test a real fintech venture: build your blueprint, run the unit economics, and earn a capstone certificate.' },
  { icon: BookOpen, title: 'Finance Dictionary', body: 'A plain-language glossary that explains every term you will meet, so nothing stands between you and the material.' },
  { icon: Users, title: 'Cohorts & Groups', body: 'Learn with your community. Form study groups, track progress together, and stay accountable as a cohort.' },
  { icon: Landmark, title: 'For Institutions', body: 'Educators and community organizations can run the curriculum for classrooms, cohorts, and workforce programs.' },
];

const PATHWAYS = [
  { label: 'Beginner', body: 'Money basics, budgeting, and the foundation of modern money.', icon: Coins },
  { label: 'Intermediate', body: 'Credit mastery, investing & IRAs, and side-hustle income.', icon: LineChart },
  { label: 'Expert', body: 'Real estate, business building, and group economics.', icon: Trophy },
];

export function LandingPage({ onEnter }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-canvas text-ink font-sans">
      <header className="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-8">
          <div className="flex items-center gap-2">
            <img src="/overlay-logo-192.png" alt="Overlay Wealth logo" className="h-9 w-9 rounded-lg object-contain" />
            <span className="text-sm font-black tracking-tight">
              Overlay<span className="text-accent">Wealth</span>
            </span>
          </div>
          <nav className="flex items-center gap-3">
            <a href="/guide" className="hidden text-xs font-bold text-muted hover:text-accent sm:inline">Guide</a>
            <ThemeToggle />
            <button
              onClick={onEnter}
              className="rounded-lg bg-accent px-4 py-2 text-xs font-black uppercase tracking-wider text-on-accent shadow-sm transition-all hover:bg-accent/90 active:scale-[0.98] cursor-pointer"
            >
              Enter the App
            </button>
          </nav>
        </div>
      </header>

      <main id="main-content">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute left-1/4 top-0 h-96 w-96 rounded-full bg-accent/10 blur-[140px]" />
          <div className="pointer-events-none absolute right-1/4 top-16 h-96 w-96 rounded-full bg-amber-500/10 blur-[140px]" />
          <div className="mx-auto max-w-6xl px-4 pb-16 pt-16 text-center md:px-8 md:pt-24">
            <p className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-accent">
              <GraduationCap size={13} /> Financial Literacy for Our Communities
            </p>
            <h1 className="mx-auto max-w-3xl font-display text-4xl font-black leading-tight tracking-tight text-ink md:text-6xl">
              Master Modern <span className="text-gradient-emerald-gold">Money</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base text-muted md:text-lg">
              Overlay Wealth is a free, interactive financial literacy platform — courses,
              simulations, and wealth-building tools designed around how our communities learn,
              earn, save, and build.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                onClick={onEnter}
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-8 py-4 text-sm font-black uppercase tracking-wider text-on-accent shadow-lg shadow-accent/20 transition-all hover:bg-accent/90 active:scale-[0.98] cursor-pointer"
              >
                Enter the App <ArrowRight size={16} />
              </button>
              <a
                href="/guide"
                className="inline-flex items-center gap-2 rounded-xl border border-line-strong bg-surface px-8 py-4 text-sm font-black uppercase tracking-wider text-ink shadow-sm transition-all hover:bg-ink/5 active:scale-[0.98] cursor-pointer"
              >
                Read the Site Guide
              </a>
            </div>
            <p className="mx-auto mt-6 inline-flex items-center gap-2 text-xs font-semibold text-muted">
              <ShieldCheck size={14} className="text-accent" /> Free to use · No card required · Earn certificates as you learn
            </p>
          </div>
        </section>

        {/* What this site is */}
        <section className="mx-auto max-w-6xl px-4 pb-16 md:px-8">
          <h2 className="mb-2 font-display text-3xl font-black text-ink">What is Overlay Wealth?</h2>
          <p className="mb-8 max-w-2xl text-muted">
            It is a learning platform, not a bank. You will not open accounts here — instead you will
            learn how money actually works: the mechanics of credit, markets, insurance, and business,
            then practice them in realistic simulations before making real-world decisions.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-2xl border border-line bg-surface p-6 shadow-sm transition-shadow hover:shadow-md">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent ring-1 ring-line">
                  <f.icon size={22} />
                </div>
                <h3 className="text-base font-bold text-ink">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Learning paths */}
        <section className="mx-auto max-w-6xl px-4 pb-16 md:px-8">
          <h2 className="mb-2 font-display text-3xl font-black text-ink">Three ways to learn</h2>
          <p className="mb-8 max-w-2xl text-muted">
            Start anywhere. The app tracks your XP, streak, badges, and progress across every level.
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            {PATHWAYS.map((p) => (
              <div key={p.label} className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-canvas">
                  <p.icon size={20} />
                </div>
                <h3 className="text-base font-bold text-ink">{p.label}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{p.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-4 pb-16 md:px-8">
          <div className="rounded-3xl bg-ink px-6 py-12 text-center text-canvas md:px-12">
            <h2 className="font-display text-3xl font-black">Your first lesson is two minutes away</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-canvas/70">
              Jump straight into the learning pathways, or open the site guide to see how everything fits together.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                onClick={onEnter}
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-8 py-4 text-sm font-black uppercase tracking-wider text-on-accent shadow-lg shadow-accent/25 transition-all hover:bg-accent/90 active:scale-[0.98] cursor-pointer"
              >
                Enter the App <ArrowRight size={16} />
              </button>
              <a
                href="/guide"
                className="inline-flex items-center gap-2 rounded-xl border border-canvas/20 bg-canvas/5 px-8 py-4 text-sm font-black uppercase tracking-wider text-canvas transition-all hover:bg-canvas/10 active:scale-[0.98] cursor-pointer"
              >
                Open the Site Guide
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line bg-surface py-6 text-center text-[11px] font-bold uppercase tracking-widest text-faint">
        <div className="mb-2 flex items-center justify-center gap-4">
          <a href="/guide" className="hover:text-accent">Site Guide</a>
          <span>&middot;</span>
          <a href="/privacy" className="hover:text-accent">Privacy</a>
          <span>&middot;</span>
          <a href="/terms" className="hover:text-accent">Terms</a>
          <span>&middot;</span>
          <button onClick={onEnter} className="hover:text-accent cursor-pointer">Enter the App</button>
        </div>
        Overlay Wealth &middot; Interactive Financial Literacy
      </footer>
    </div>
  );
}
