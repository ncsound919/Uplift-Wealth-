import {
  GraduationCap, Gamepad2, Briefcase, Sparkles, Landmark, LineChart,
  BookOpen, ShieldCheck, ArrowRight, Layers, Coins, Trophy, Users
} from 'lucide-react';

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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-8">
          <div className="flex items-center gap-2">
            <img src="/overlay-logo-192.png" alt="Overlay Wealth logo" className="h-9 w-9 rounded-lg object-contain" />
            <span className="text-sm font-black tracking-tight">
              Overlay<span className="text-blue-600">Wealth</span>
            </span>
          </div>
          <nav className="flex items-center gap-3">
            <a href="/guide" className="text-xs font-bold text-slate-500 hover:text-blue-600">Guide</a>
            <button
              onClick={onEnter}
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-black uppercase tracking-wider text-white shadow-sm transition-all hover:bg-blue-500 cursor-pointer"
            >
              Enter the App
            </button>
          </nav>
        </div>
      </header>

      <main id="main-content">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute left-1/4 top-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-[140px]" />
          <div className="pointer-events-none absolute right-1/4 top-16 h-96 w-96 rounded-full bg-indigo-500/10 blur-[140px]" />
          <div className="mx-auto max-w-6xl px-4 pb-16 pt-16 text-center md:px-8 md:pt-24">
            <p className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              <GraduationCap size={13} /> Financial Literacy for Our Communities
            </p>
            <h1 className="mx-auto max-w-3xl font-display text-4xl font-black leading-tight tracking-tight md:text-6xl">
              Master Modern <span className="text-gradient-emerald-gold">Money</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base text-slate-600 md:text-lg">
              Overlay Wealth is a free, interactive financial literacy platform — courses,
              simulations, and wealth-building tools designed around how our communities learn,
              earn, save, and build.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                onClick={onEnter}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-sm font-black uppercase tracking-wider text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-500 cursor-pointer"
              >
                Enter the App <ArrowRight size={16} />
              </button>
              <a
                href="/guide"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-8 py-4 text-sm font-black uppercase tracking-wider text-slate-700 shadow-sm transition-all hover:bg-slate-100 cursor-pointer"
              >
                Read the Site Guide
              </a>
            </div>
            <p className="mx-auto mt-6 inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
              <ShieldCheck size={14} className="text-emerald-600" /> Free to use · No card required · Earn certificates as you learn
            </p>
          </div>
        </section>

        {/* What this site is */}
        <section className="mx-auto max-w-6xl px-4 pb-16 md:px-8">
          <h2 className="mb-2 font-display text-3xl font-black text-slate-900">What is Overlay Wealth?</h2>
          <p className="mb-8 max-w-2xl text-slate-600">
            It is a learning platform, not a bank. You will not open accounts here — instead you will
            learn how money actually works: the mechanics of credit, markets, insurance, and business,
            then practice them in realistic simulations before making real-world decisions.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/15 to-indigo-500/15 text-blue-600 ring-1 ring-slate-200">
                  <f.icon size={22} />
                </div>
                <h3 className="text-base font-bold text-slate-900">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Learning paths */}
        <section className="mx-auto max-w-6xl px-4 pb-16 md:px-8">
          <h2 className="mb-2 font-display text-3xl font-black text-slate-900">Three ways to learn</h2>
          <p className="mb-8 max-w-2xl text-slate-600">
            Start anywhere. The app tracks your XP, streak, badges, and progress across every level.
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            {PATHWAYS.map((p) => (
              <div key={p.label} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                  <p.icon size={20} />
                </div>
                <h3 className="text-base font-bold text-slate-900">{p.label}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{p.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-4 pb-16 md:px-8">
          <div className="rounded-3xl bg-slate-900 px-6 py-12 text-center md:px-12">
            <h2 className="font-display text-3xl font-black text-white">Your first lesson is two minutes away</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-slate-300">
              Jump straight into the learning pathways, or open the site guide to see how everything fits together.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                onClick={onEnter}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-8 py-4 text-sm font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-400 cursor-pointer"
              >
                Enter the App <ArrowRight size={16} />
              </button>
              <a
                href="/guide"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-8 py-4 text-sm font-black uppercase tracking-wider text-white transition-all hover:bg-white/10 cursor-pointer"
              >
                Open the Site Guide
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-[11px] font-bold uppercase tracking-widest text-slate-400">
        <div className="mb-2 flex items-center justify-center gap-4">
          <a href="/guide" className="hover:text-blue-600">Site Guide</a>
          <span>&middot;</span>
          <button onClick={onEnter} className="hover:text-blue-600 cursor-pointer">Enter the App</button>
        </div>
        Overlay Wealth &middot; Interactive Financial Literacy
      </footer>
    </div>
  );
}