import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Check, SkipForward, ChevronRight, ArrowRight, Wand2 } from 'lucide-react';
import { cn } from '../lib/utils';
import {
  buildBlueprint,
  BUSINESS_TYPE_OPTIONS,
  MONETIZATION_OPTIONS,
  TEAM_OPTIONS,
  FUNDING_OPTIONS,
  US_STATE_OPTIONS,
  type BusinessBlueprint,
  type BusinessType,
  type MonetizationType,
  type TeamSize,
  type FundingChoice,
} from '../lib/businessBlueprint';

interface BusinessQuickStartProps {
  onComplete: (blueprint: BusinessBlueprint) => void;
}

interface Answer {
  businessType: BusinessType | null;
  customers: string | null;
  problem: string | null;
  monetization: MonetizationType | null;
  team: TeamSize | null;
  businessName: string | null;
  funding: FundingChoice | null;
  state: string | null;
}

const REVEAL_STAGES = [
  { label: 'Your business type', field: 'businessType' as const },
  { label: 'Your customers', field: 'customers' as const },
  { label: 'Your pricing & revenue', field: 'monetization' as const },
  { label: 'Your legal setup', field: 'funding' as const },
  { label: 'Your launch plan', field: 'state' as const },
];

export function BusinessQuickStart({ onComplete }: BusinessQuickStartProps) {
  const [step, setStep] = useState<number>(0); // 0..7 questions, then 8 = reveal
  const [answers, setAnswers] = useState<Answer>({
    businessType: null,
    customers: null,
    problem: null,
    monetization: null,
    team: null,
    businessName: null,
    funding: null,
    state: null,
  });
  const [customInput, setCustomInput] = useState<string>('');
  const [nameInput, setNameInput] = useState<string>('');
  const [revealStage, setRevealStage] = useState<number>(0);
  const [revealDone, setRevealDone] = useState<boolean>(false);

  const setAnswer = (patch: Partial<Answer>) => {
    setAnswers(prev => ({ ...prev, ...patch }));
  };

  const finishQuestion = () => {
    const next = step + 1;
    if (next >= questions.length) {
      startReveal();
    }
    setStep(next);
    setCustomInput('');
  };

  const skip = () => finishQuestion();

  const startReveal = () => {
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setRevealStage(i);
      if (i >= REVEAL_STAGES.length) {
        clearInterval(interval);
        setRevealDone(true);
      }
    }, 650);
  };

  const handleComplete = () => {
    startReveal();
    setStep(8);
  };

  const launch = () => {
    const blueprint = buildBlueprint({
      ...answers,
      businessName: answers.businessName || nameInput || null,
      customers: answers.customers || customInput || null,
    });
    onComplete(blueprint);
  };

  // Question definitions
  const questions = [
    {
      title: 'What kind of business are you starting?',
      sub: 'Choose a category — you can change anything later.',
      render: () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {BUSINESS_TYPE_OPTIONS.map(opt => {
            const selected = answers.businessType === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => {
                  setAnswer({ businessType: opt.id });
                  setCustomInput('');
                }}
                className={cn(
                  "p-3.5 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-3",
                  selected
                    ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 ring-1 ring-emerald-500/40"
                    : "bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300"
                )}
              >
                <span className="text-lg leading-none">{opt.icon}</span>
                <span>
                  <span className="block text-xs font-black text-slate-900 dark:text-white">{opt.label}</span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">{opt.desc}</span>
                </span>
              </button>
            );
          })}
        </div>
      ),
      canProceed: () => !!answers.businessType,
    },
    {
      title: 'Who will your customers be?',
      sub: 'Tell us who you plan to serve.',
      render: () => (
        <textarea
          autoFocus
          value={customInput}
          onChange={e => { setCustomInput(e.target.value); setAnswer({ customers: e.target.value }); }}
          placeholder="e.g. Local small businesses, online shoppers, people who need quick meals..."
          className="w-full min-h-[110px] px-3.5 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
        />
      ),
      canProceed: () => (customInput.trim().length >= 2 || !!answers.customers),
    },
    {
      title: 'What problem will you solve for them?',
      sub: 'Pick a starting point — or type your own.',
      render: () => (
        <textarea
          autoFocus
          value={customInput}
          onChange={e => { setCustomInput(e.target.value); setAnswer({ problem: e.target.value }); }}
          placeholder="e.g. They can't find fast, affordable options nearby..."
          className="w-full min-h-[110px] px-3.5 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
        />
      ),
      canProceed: () => (customInput.trim().length >= 2 || !!answers.problem),
    },
    {
      title: 'How will you make money?',
      sub: 'Choose the pricing model that fits best.',
      render: () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {MONETIZATION_OPTIONS.map(opt => {
            const selected = answers.monetization === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setAnswer({ monetization: opt.id })}
                className={cn(
                  "p-3.5 rounded-xl border text-left cursor-pointer transition-all",
                  selected
                    ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 ring-1 ring-emerald-500/40"
                    : "bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300"
                )}
              >
                <span className="block text-xs font-black text-slate-900 dark:text-white">{opt.label}</span>
                <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">{opt.desc}</span>
              </button>
            );
          })}
        </div>
      ),
      canProceed: () => !!answers.monetization,
    },
    {
      title: 'Are you starting solo or with a partner?',
      sub: 'This shapes ownership and team structure.',
      render: () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {TEAM_OPTIONS.map(opt => {
            const selected = answers.team === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setAnswer({ team: opt.id })}
                className={cn(
                  "p-3.5 rounded-xl border text-left cursor-pointer transition-all",
                  selected
                    ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 ring-1 ring-emerald-500/40"
                    : "bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300"
                )}
              >
                <span className="block text-xs font-black text-slate-900 dark:text-white">{opt.label}</span>
                <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">{opt.desc}</span>
              </button>
            );
          })}
        </div>
      ),
      canProceed: () => !!answers.team,
    },
    {
      title: 'What should your business be called?',
      sub: 'Optional — we can suggest a name if you skip.',
      render: () => (
        <input
          autoFocus
          type="text"
          value={nameInput}
          onChange={e => { setNameInput(e.target.value); setAnswer({ businessName: e.target.value }); }}
          placeholder="e.g. Velo, Atlas Goods, Ember Kitchen..."
          className="w-full px-3.5 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
        />
      ),
      canProceed: () => (nameInput.trim().length >= 2 || !!answers.businessName),
    },
    {
      title: 'How will you fund the early days?',
      sub: 'Both are valid — this shapes legal structure.',
      render: () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {FUNDING_OPTIONS.map(opt => {
            const selected = answers.funding === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setAnswer({ funding: opt.id })}
                className={cn(
                  "p-3.5 rounded-xl border text-left cursor-pointer transition-all",
                  selected
                    ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 ring-1 ring-emerald-500/40"
                    : "bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300"
                )}
              >
                <span className="block text-xs font-black text-slate-900 dark:text-white">{opt.label}</span>
                <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">{opt.desc}</span>
              </button>
            );
          })}
        </div>
      ),
      canProceed: () => !!answers.funding,
    },
    {
      title: 'Where will you register your business?',
      sub: 'Your home state is usually fine — Delaware suits startups raising money.',
      render: () => (
        <div className="flex flex-wrap gap-2">
          {US_STATE_OPTIONS.map(st => {
            const selected = answers.state === st;
            return (
              <button
                key={st}
                onClick={() => setAnswer({ state: st })}
                className={cn(
                  "px-3.5 py-2 rounded-xl border text-xs font-black cursor-pointer transition-all",
                  selected
                    ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 ring-1 ring-emerald-500/40 text-slate-900 dark:text-white"
                    : "bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                )}
              >
                {st}
              </button>
            );
          })}
        </div>
      ),
      canProceed: () => !!answers.state,
    },
  ];

  if (step === 8) {
    const blueprint = buildBlueprint({
      ...answers,
      businessName: answers.businessName || nameInput || null,
      customers: answers.customers || customInput || null,
    });
    return (
      <div className="relative z-10 bg-white dark:bg-slate-950/60 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Wand2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">Connecting the dots...</h2>
            <p className="text-xs text-slate-500">We're assembling your launch plan from your answers.</p>
          </div>
        </div>

        <div className="space-y-2.5">
          {REVEAL_STAGES.map((stage, idx) => {
            const active = revealStage >= idx + 1;
            const label = idx === 0 && answers.businessType
              ? BUSINESS_TYPE_OPTIONS.find(o => o.id === answers.businessType)?.label
              : stage.label;
            return (
              <motion.div
                key={stage.field}
                initial={{ opacity: 0, y: 8 }}
                animate={active ? { opacity: 1, y: 0 } : { opacity: 0.35, y: 0 }}
                transition={{ duration: 0.25 }}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border transition-colors",
                  active
                    ? "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50"
                    : "bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800"
                )}
              >
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center shrink-0 border",
                  active ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300 text-slate-400"
                )}>
                  {active ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                </div>
                <div className="flex-1">
                  <span className="block text-xs font-black text-slate-900 dark:text-white">{label}</span>
                  {active && (
                    <span className="block text-[11px] text-slate-500 mt-0.5">
                      {stage.field === 'businessType' ? (answers.businessType || '—') :
                       stage.field === 'customers' ? (answers.customers || '—') :
                       stage.field === 'monetization' ? (answers.monetization || '—') :
                       stage.field === 'funding' ? (answers.funding === 'raise' ? 'Raising investor money' : 'Bootstrapping') :
                       (answers.state || '—')}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {revealDone && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-800"
          >
            <div className="text-xs text-slate-500">
              Your plan is ready — <span className="font-black text-emerald-600 dark:text-emerald-400">{blueprint.businessName}</span> for {blueprint.selectedCohort}.
            </div>
            <button
              onClick={launch}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm cursor-pointer transition-colors"
            >
              View My Plan <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </div>
    );
  }

  const q = questions[step];

  return (
    <div className="relative z-10 bg-white dark:bg-slate-950/60 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-5">
        {questions.map((_, idx) => (
          <div
            key={idx}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              idx < step ? "bg-emerald-500" : idx === step ? "bg-emerald-400/70" : "bg-slate-200 dark:bg-slate-800"
            )}
          />
        ))}
      </div>
      <div className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest mb-3">
        Question {step + 1} of {questions.length}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.15 }}
        >
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">{q.title}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">{q.sub}</p>
          {q.render()}
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={skip}
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer transition-colors"
        >
          <SkipForward className="w-3.5 h-3.5" /> Skip
        </button>
        <button
          onClick={step === 7 ? handleComplete : finishQuestion}
          disabled={!q.canProceed()}
          className={cn(
            "inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer",
            q.canProceed()
              ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
              : "bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed"
          )}
        >
          {step === 7 ? 'Build My Plan' : 'Next'} <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
