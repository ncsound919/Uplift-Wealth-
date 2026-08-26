import {
  ArrowLeft, Compass, Layers, GraduationCap, Gamepad2, Briefcase, Sparkles,
  User, Users, Heart, Check, BookOpen, LineChart, ShieldCheck, Home
} from 'lucide-react';

interface SiteGuideProps {
  onBack: () => void;
}

const TOOLS = [
  { icon: Layers, title: 'Learning Pathways', where: 'Sidebar → Learning Pathways', body: 'The main dashboard. Pick a course level (Beginner, Intermediate, Expert), then open any module. Your progress, XP, and streak live here.' },
  { icon: GraduationCap, title: 'Modules & Lessons', where: 'Click any module card', body: 'Each module is a set of lessons with quizzes, videos, and sandbox games. Finish a module to earn badges and a printable certificate.' },
  { icon: Gamepad2, title: 'Games & Simulations', where: 'Sidebar → Games', body: 'Practice without risk: stock-market trading terminal, alternative lending, parametric insurance, fraud screening, and pop quizzes. Sim results earn XP.' },
  { icon: Briefcase, title: 'Business Builder', where: 'Sidebar → Business Builder', body: 'Design a fintech venture, work through the unit economics, and complete the capstone to become a certified founder.' },
  { icon: Sparkles, title: 'Finance Dictionary', where: 'Sidebar → Finance Dictionary', body: 'A plain-language glossary. Look up any term while you study — it stays open alongside your lessons.' },
  { icon: User, title: 'Student Profile', where: 'Sidebar → My Student Profile', body: 'Your progress dashboard: completed lessons, modules, XP, streak, badges, and a public profile you can share.' },
  { icon: Users, title: 'Groups & Cohorts', where: 'Sidebar → Groups', body: 'Join a cohort or start a study group to learn together and keep each other accountable.' },
  { icon: Heart, title: 'Support', where: 'Sidebar → Support', body: 'Overlay Wealth is free for learners. Support donations help keep the platform open and the lights on.' },
];

const TIPS = [
  { icon: Home, title: 'Start with the dashboard', body: 'Everything branches off the Learning Pathways dashboard. Use the sidebar on the left to switch tools; the mobile menu does the same on phones.' },
  { icon: BookOpen, title: 'Learn by doing', body: 'Real knowledge sticks in the simulators. Trade with play money, underwrite a loan, or stress-test a business before you ever touch real money.' },
  { icon: LineChart, title: 'Pick a level that fits', body: 'Not sure where to start? Begin on Beginner. You can change level anytime and it will not erase progress you have already earned.' },
  { icon: ShieldCheck, title: 'Progress is saved', body: 'Your XP, streak, badges, and completed lessons save automatically to your profile and sync when you sign in. Nothing to configure.' },
  { icon: Compass, title: 'Dark mode & language', body: 'Open Settings in the sidebar footer to switch between light/dark mode and change your interface language.' },
];

const FAQ = [
  { q: 'Is Overlay Wealth really free?', a: 'Yes. Every course, game, and tool is free for learners. A Support page accepts optional donations but nothing is gated behind payment.' },
  { q: 'Do I need an account to learn?', a: 'You can explore without an account, but signing in syncs your progress across devices and unlocks your public profile and certificates.' },
  { q: 'Is this financial advice?', a: 'No. Overlay Wealth is an educational platform. The simulations are for practice. Consult a qualified professional for personal financial decisions.' },
  { q: 'What is the difference between a module and a lesson?', a: 'A module is a full topic (for example, credit mastery). Each module contains lessons — short units with text, video, or quizzes. Complete all lessons to finish the module.' },
  { q: 'Can schools or organizations use it?', a: 'Yes. The For Institutions page and institutional dashboard let educators run the curriculum for classrooms, cohorts, and workforce programs.' },
];

export function SiteGuide({ onBack }: SiteGuideProps) {
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
            <button
              onClick={onBack}
              className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-blue-600 cursor-pointer"
            >
              <ArrowLeft size={14} /> Back to App
            </button>
            <button
              onClick={onBack}
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-black uppercase tracking-wider text-white shadow-sm transition-all hover:bg-blue-500 cursor-pointer"
            >
              Enter the App
            </button>
          </nav>
        </div>
      </header>

      <main id="main-content">
        <section className="mx-auto max-w-6xl px-4 pb-12 pt-14 text-center md:px-8 md:pt-20">
          <p className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-700">
            <Compass size={13} /> Site Guide
          </p>
          <h1 className="mx-auto max-w-3xl font-display text-4xl font-black leading-tight tracking-tight md:text-6xl">
            How to Use <span className="text-gradient-emerald-gold">Overlay Wealth</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-slate-600 md:text-lg">
            Everything in the app lives in the sidebar. Here is what each tool does, where to find
            it, and how to get the most out of the platform.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-sm font-black uppercase tracking-wider text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-500 cursor-pointer"
            >
              Enter the App
            </button>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-16 md:px-8">
          <h2 className="mb-2 font-display text-2xl font-black text-slate-900">The Tools</h2>
          <p className="mb-6 max-w-2xl text-sm text-slate-600">
            Every tool is a button in the sidebar. Pick any of them to switch views.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {TOOLS.map((t) => (
              <div key={t.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/15 to-indigo-500/15 text-blue-600 ring-1 ring-slate-200">
                    <t.icon size={22} />
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {t.where}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">{t.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{t.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-16 md:px-8">
          <h2 className="mb-2 font-display text-2xl font-black text-slate-900">Navigation Tips</h2>
          <p className="mb-6 max-w-2xl text-sm text-slate-600">
            A few things that make moving around easier.
          </p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {TIPS.map((tip) => (
              <div key={tip.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 ring-1 ring-blue-600/20">
                  <tip.icon size={20} />
                </div>
                <h3 className="text-sm font-bold text-slate-900">{tip.title}</h3>
                <p className="mt-1 text-[13px] leading-relaxed text-slate-600">{tip.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 pb-16 md:px-8">
          <h2 className="mb-6 font-display text-2xl font-black text-slate-900">Common Questions</h2>
          <div className="space-y-3">
            {FAQ.map((item) => (
              <div key={item.q} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="flex items-center gap-2 font-bold text-slate-900">
                  <Check size={16} className="text-emerald-600" /> {item.q}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.a}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h3 className="font-display text-xl font-black text-slate-900">Ready to start learning?</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
              Enter the app and the dashboard will walk you to your first lesson in under a minute.
            </p>
            <button
              onClick={onBack}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-sm font-black uppercase tracking-wider text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-500 cursor-pointer"
            >
              Enter the App
            </button>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-[11px] font-bold uppercase tracking-widest text-slate-400">
        <div className="mb-2 flex items-center justify-center gap-4">
          <button onClick={onBack} className="hover:text-blue-600 cursor-pointer">Back to App</button>
          <span>&middot;</span>
          <span>Overlay Wealth &middot; Site Guide</span>
        </div>
      </footer>
    </div>
  );
}