import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Database, 
  Building2, 
  TrendingUp, 
  Activity, 
  Scale, 
  FileCheck, 
  CheckCircle2, 
  Sparkles,
  Play,
  Info,
  X,
  ArrowRight,
  Flame,
  Zap,
  Layers
} from 'lucide-react';
import { cn } from '../lib/utils';

export interface InfographicModuleShortcut {
  id: string;
  name: string;
  desc?: string;
}

export interface InfographicStep {
  id: number;
  phase: string;
  title: string;
  subtitle: string;
  description: string;
  badgeText: string;
  badgeBg: string;
  badgeTextColor: string;
  color: string;
  glowColor: string;
  borderColor: string;
  bgGradient: string;
  icon: any;
  shortcuts: InfographicModuleShortcut[];
  keyTech: string[];
  legacyVsModern?: { legacy: string; modern: string };
  metrics?: string;
}

const STEPS: InfographicStep[] = [
  {
    id: 1,
    phase: 'Phase 1 • Foundations',
    title: 'Foundations of Financial Literacy',
    subtitle: "The 'What Is...' Series",
    description: 'Master core concepts of money, stock markets, trading, crypto, credit, and interest rates before exploring advanced fintech.',
    badgeText: 'Step 1 • Foundations',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-950/60',
    badgeTextColor: 'text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800',
    color: 'from-emerald-500 to-teal-600',
    glowColor: 'hover:shadow-emerald-500/10 hover:border-emerald-400 dark:hover:shadow-emerald-500/20 dark:hover:border-emerald-500/50',
    borderColor: 'border-emerald-200 dark:border-emerald-500/30',
    bgGradient: 'from-emerald-50 via-white to-emerald-50/50 dark:from-emerald-950/30 dark:via-slate-900 dark:to-slate-950',
    icon: Layers,
    shortcuts: [
      { id: 'module-0', name: 'Class 0: Foundations (What Is... Series)' }
    ],
    keyTech: ['Money Functions', 'Stock Markets', 'Trading & Risk', 'Crypto & Blockchain', 'Interest Rates & Credit'],
    legacyVsModern: { legacy: 'Barter & Paper Records', modern: 'Digital Ledger Systems' },
    metrics: '10 Foundational Modules'
  },
  {
    id: 2,
    phase: 'Phase 2 • Infrastructure',
    title: 'Unlocking the Rails',
    subtitle: 'Bank Systems & Payment Rails',
    description: 'Old bank computers vs cloud ledgers and how money moves through card networks.',
    badgeText: 'Step 2 • Rails',
    badgeBg: 'bg-amber-100 dark:bg-amber-950/60',
    badgeTextColor: 'text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800',
    color: 'from-amber-500 to-orange-600',
    glowColor: 'hover:shadow-amber-500/10 hover:border-amber-400 dark:hover:shadow-amber-500/20 dark:hover:border-amber-500/50',
    borderColor: 'border-amber-200 dark:border-amber-500/30',
    bgGradient: 'from-amber-50 via-white to-amber-50/50 dark:from-amber-950/30 dark:via-slate-900 dark:to-slate-950',
    icon: Database,
    shortcuts: [
      { id: 'module-1', name: 'Class 1: How Banks & Money Work' },
      { id: 'module-2', name: 'Class 2: Swiping & Fast Payments' }
    ],
    keyTech: ['Bank Ledger Systems', 'ACH Clearing', 'Card Processing', 'Instant Bank Transfers'],
    legacyVsModern: { legacy: 'Overnight Batch Paper/COBOL', modern: 'Real-Time Cloud Ledgers' },
    metrics: '99.999% Settlement Uptime'
  },
  {
    id: 3,
    phase: 'Phase 3 • Middleware',
    title: 'The New Financial Stack',
    subtitle: 'Financial Apps & Lending Tech',
    description: 'Connecting apps to banks and approving loans using cash-flow data.',
    badgeText: 'Step 3 • Middleware',
    badgeBg: 'bg-blue-100 dark:bg-blue-950/60',
    badgeTextColor: 'text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-800',
    color: 'from-blue-500 to-indigo-600',
    glowColor: 'hover:shadow-blue-500/10 hover:border-blue-400 dark:hover:shadow-blue-500/20 dark:hover:border-blue-500/50',
    borderColor: 'border-blue-200 dark:border-blue-500/30',
    bgGradient: 'from-blue-50 via-white to-blue-50/50 dark:from-blue-950/30 dark:via-slate-900 dark:to-slate-950',
    icon: Building2,
    shortcuts: [
      { id: 'module-3', name: 'Class 3: Financial Apps & Open Banks' },
      { id: 'module-4', name: 'Class 4: Fair Credit & Borrowing' }
    ],
    keyTech: ['Banking-as-a-Service', 'Financial APIs', 'Cashflow Analytics', 'Instant Approvals'],
    legacyVsModern: { legacy: 'Paper Credit Forms & Slow FICO', modern: 'Open-Banking Cashflow Decisions' },
    metrics: '< 200ms Decision Engine'
  },
  {
    id: 4,
    phase: 'Phase 4 • Capital Markets',
    title: 'Software-Driven Verticals',
    subtitle: 'Stocks, Wealth & Algorithmic Trading',
    description: 'Automated investing, smart portfolios, and quantitative market algorithms.',
    badgeText: 'Step 4 • Markets',
    badgeBg: 'bg-teal-100 dark:bg-teal-950/60',
    badgeTextColor: 'text-teal-700 dark:text-teal-400 border-teal-300 dark:border-teal-800',
    color: 'from-teal-500 to-cyan-600',
    glowColor: 'hover:shadow-teal-500/10 hover:border-teal-400 dark:hover:shadow-teal-500/20 dark:hover:border-teal-500/50',
    borderColor: 'border-teal-200 dark:border-teal-500/30',
    bgGradient: 'from-teal-50 via-white to-teal-50/50 dark:from-teal-950/30 dark:via-slate-900 dark:to-slate-950',
    icon: TrendingUp,
    shortcuts: [
      { id: 'module-5', name: 'Class 5: Stocks & Wealth Creation' },
      { id: 'module-9', name: 'Class 9: How Apps Make Money' }
    ],
    keyTech: ['Automated Wealth Apps', 'Smart Portfolios', 'High-Frequency Trading', 'Fractional Shares'],
    legacyVsModern: { legacy: 'Manual Phone Brokers & High Fees', modern: 'Automated Micro-Investing' },
    metrics: 'Automated Rebalancing'
  },
  {
    id: 5,
    phase: 'Phase 5 • InsurTech',
    title: 'Parametric Protection',
    subtitle: 'Smart Insurance & Risk',
    description: 'Parametric insurance claims, automated weather triggers, and instant payouts.',
    badgeText: 'Step 5 • InsurTech',
    badgeBg: 'bg-sky-100 dark:bg-sky-950/60',
    badgeTextColor: 'text-sky-700 dark:text-sky-400 border-sky-300 dark:border-sky-800',
    color: 'from-sky-500 to-blue-600',
    glowColor: 'hover:shadow-sky-500/10 hover:border-sky-400 dark:hover:shadow-sky-500/20 dark:hover:border-sky-500/50',
    borderColor: 'border-sky-200 dark:border-sky-500/30',
    bgGradient: 'from-sky-50 via-white to-sky-50/50 dark:from-sky-950/30 dark:via-slate-900 dark:to-slate-950',
    icon: Activity,
    shortcuts: [
      { id: 'module-6', name: 'Class 6: Modern Smart Insurance' }
    ],
    keyTech: ['Parametric Risk', 'Data Oracles', 'Instant Claim Triggers', 'Live Weather Feeds'],
    legacyVsModern: { legacy: 'Months of Claims Paperwork', modern: 'Instant Oracle Contract Payouts' },
    metrics: 'Sub-Minute Parametric Claims'
  },
  {
    id: 6,
    phase: 'Phase 6 • Web3 & Crypto',
    title: 'Digital Coins & DeFi',
    subtitle: 'Blockchains & Protocol Money',
    description: 'Public ledgers, smart contracts, AMMs, and real-time fraud defense.',
    badgeText: 'Step 6 • Web3',
    badgeBg: 'bg-purple-100 dark:bg-purple-950/60',
    badgeTextColor: 'text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-800',
    color: 'from-purple-500 to-violet-600',
    glowColor: 'hover:shadow-purple-500/10 hover:border-purple-400 dark:hover:shadow-purple-500/20 dark:hover:border-purple-500/50',
    borderColor: 'border-purple-200 dark:border-purple-500/30',
    bgGradient: 'from-purple-50 via-white to-purple-50/50 dark:from-purple-950/30 dark:via-slate-900 dark:to-slate-950',
    icon: Activity,
    shortcuts: [
      { id: 'module-7', name: 'Class 7: Digital Coins & Blockchains' },
      { id: 'module-8', name: 'Class 8: Security & Scam Defense' }
    ],
    keyTech: ['Shared Ledgers', 'Smart Contracts', 'Liquidity Pools', 'AML Verification'],
    legacyVsModern: { legacy: 'Slow Intermediary Audits', modern: 'Instant Verifiable Ledger Records' },
    metrics: 'Real-time Fraud Checks'
  },
  {
    id: 7,
    phase: 'Phase 7 • Ethics & Reform',
    title: 'Systemic Reform & Architecture',
    subtitle: 'Ethics, Redlining & Capstone',
    description: 'Analyzing historical redlining, Freedman\'s Bank, MDI capital, and launching your seed venture.',
    badgeText: 'Step 7 • Reform',
    badgeBg: 'bg-rose-100 dark:bg-rose-950/60',
    badgeTextColor: 'text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-800',
    color: 'from-rose-500 to-pink-600',
    glowColor: 'hover:shadow-rose-500/10 hover:border-rose-400 dark:hover:shadow-rose-500/20 dark:hover:border-rose-500/50',
    borderColor: 'border-rose-200 dark:border-rose-500/30',
    bgGradient: 'from-rose-50 via-white to-rose-50/50 dark:from-rose-950/30 dark:via-slate-900 dark:to-slate-950',
    icon: FileCheck,
    shortcuts: [
      { id: 'module-10', name: 'Class 10: App Rules & Licenses' },
      { id: 'module-11', name: 'Class 11: Double-Entry Bookkeeping' },
      { id: 'module-12', name: 'Class 12: Build Your Own App' }
    ],
    keyTech: ['Systemic Reform', 'MDI Capital', 'Double-Entry Accounting', 'Venture Blueprints'],
    legacyVsModern: { legacy: 'Systemic Exclusion & Hidden Fees', modern: 'Inclusive Software Equity' },
    metrics: 'Certified Seed Venture Blueprint'
  },
  {
    id: 8,
    phase: 'Phase 8 • Master Glossary',
    title: 'Finance & FinTech Dictionary',
    subtitle: 'Interactive Terms & Recall Hub',
    description: 'Quick term lookup, categorized definitions, real-world examples, and flashcard recall mode.',
    badgeText: 'Step 8 • Dictionary',
    badgeBg: 'bg-indigo-100 dark:bg-indigo-950/60',
    badgeTextColor: 'text-indigo-700 dark:text-indigo-400 border-indigo-300 dark:border-indigo-800',
    color: 'from-indigo-600 to-purple-600',
    glowColor: 'hover:shadow-indigo-500/10 hover:border-indigo-400 dark:hover:shadow-indigo-500/20 dark:hover:border-indigo-500/50',
    borderColor: 'border-indigo-200 dark:border-indigo-500/30',
    bgGradient: 'from-indigo-50 via-white to-indigo-50/50 dark:from-indigo-950/30 dark:via-slate-900 dark:to-slate-950',
    icon: Sparkles,
    shortcuts: [
      { id: 'dots_article', name: '3D Article: Connecting The Dots (6 Financial Gears)' },
      { id: 'glossary', name: 'Step 8: Master Dictionary & Flashcards' }
    ],
    keyTech: ['Basic Finance Terms', 'FinTech Terminologies', 'Flashcard Recall', 'Instant Term Lookup'],
    legacyVsModern: { legacy: 'Complex Textbook Definitions', modern: 'Interactive Scannable Dictionary' },
    metrics: 'Complete Finance Glossary'
  }
];

interface FintechMasteryInfographicProps {
  completedModules?: string[];
  onSelectModule?: (moduleId: string) => void;
}

export function FintechMasteryInfographic({
  completedModules = [],
  onSelectModule
}: FintechMasteryInfographicProps) {
  const [selectedStep, setSelectedStep] = useState<InfographicStep | null>(null);

  // Calculate overall completed phases
  const completedCount = STEPS.filter((step) =>
    step.shortcuts.every((s) => completedModules.includes(s.id))
  ).length;

  return (
    <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-sm space-y-6 relative overflow-hidden backdrop-blur-xl">
      {/* Background Decorative Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/5 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-500/5 dark:bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Compact Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-4xl font-black font-display mb-2 text-slate-900 dark:text-white tracking-tight">
                Curriculum Blueprint Roadmap
              </h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30">
                12 Classes
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Click any class below to begin learning immediately!
            </p>
          </div>
        </div>

        {/* Progress Badge */}
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950/80 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800/80 shrink-0 self-start sm:self-auto shadow-sm">
          <Layers className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
            Progress: <span className="text-emerald-600 dark:text-emerald-400 font-mono font-black">{completedCount}/6 Phases</span>
          </span>
          <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden ml-1 shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-500" 
              style={{ width: `${(completedCount / 6) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Compact 6-Card Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
        {STEPS.map((step) => {
          const IconComp = step.icon;
          const finishedShortcutCount = step.shortcuts.filter((s) => completedModules.includes(s.id)).length;
          const isPhaseFullyDone = finishedShortcutCount === step.shortcuts.length;
          const isPhaseInProgress = finishedShortcutCount > 0 && !isPhaseFullyDone;

          return (
            <motion.div
              key={step.id}
              whileHover={{ y: -4, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={cn(
                "rounded-2xl border p-4 flex flex-col justify-between space-y-3.5 transition-all relative overflow-hidden group shadow-md",
                `bg-gradient-to-br ${step.bgGradient}`,
                isPhaseInProgress 
                  ? "ring-2 ring-amber-400/80 dark:ring-amber-400/90 shadow-lg shadow-amber-500/20 border-amber-400" 
                  : isPhaseFullyDone
                    ? "ring-1 ring-emerald-500/60 dark:ring-emerald-400/70 shadow-md shadow-emerald-500/10 border-emerald-400"
                    : step.borderColor,
                step.glowColor
              )}
            >
              {/* Active / In-Progress Glow Trail */}
              {isPhaseInProgress && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 animate-pulse" />
              )}
              {isPhaseFullyDone && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500" />
              )}

              {/* Header Info */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className={cn(
                      "text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded border shadow-2xs",
                      step.badgeBg,
                      step.badgeTextColor
                    )}>
                      {step.phase.split('•')[0].trim()}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-400 flex items-center gap-1">
                      {isPhaseInProgress && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />}
                      STEP 0{step.id}
                    </span>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center gap-1">
                    {isPhaseFullyDone ? (
                      <span className="flex items-center gap-1 text-xs font-black text-emerald-400 bg-emerald-950/90 px-2 py-0.5 rounded border border-emerald-700/80 shadow-xs">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Done
                      </span>
                    ) : isPhaseInProgress ? (
                      <span className="flex items-center gap-1 text-xs font-black text-amber-300 bg-amber-950/90 px-2 py-0.5 rounded border border-amber-600/80 shadow-xs animate-pulse">
                        <Zap className="w-3 h-3 text-amber-400" /> {finishedShortcutCount}/2 Active
                      </span>
                    ) : (
                      <button
                        onClick={() => setSelectedStep(step)}
                        title="View Phase Details"
                        className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800/80 transition-colors cursor-pointer"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 shadow-md bg-gradient-to-br",
                    step.color
                  )}>
                    <IconComp className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-black font-display text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors truncate">
                      {step.title}
                    </h4>
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-300 truncate">
                      {step.subtitle}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug line-clamp-2">
                  {step.description}
                </p>
              </div>

              {/* Direct Class Shortcuts (Primary Action) */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 space-y-1.5">
                {/* Mastery progress */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                    <span className="text-slate-400 dark:text-slate-500">Mastery</span>
                    <span className={cn(
                      "font-mono",
                      isPhaseFullyDone ? "text-emerald-500" : isPhaseInProgress ? "text-amber-400" : "text-slate-400"
                    )}>
                      {finishedShortcutCount}/{step.shortcuts.length} modules
                    </span>
                  </div>
                  <div className="h-1 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        isPhaseFullyDone
                          ? "bg-gradient-to-r from-emerald-400 to-teal-400"
                          : isPhaseInProgress
                            ? "bg-gradient-to-r from-amber-400 to-orange-400"
                            : "bg-slate-300 dark:bg-slate-600"
                      )}
                      style={{ width: `${step.shortcuts.length > 0 ? (finishedShortcutCount / step.shortcuts.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <span>Start Class Directly:</span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedStep(step);
                    }}
                    className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
                  >
                    <span>Details</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-1.5">
                  {step.shortcuts.map((sc) => {
                    const isDone = completedModules.includes(sc.id);
                    return (
                      <button
                        key={sc.id}
                        onClick={() => {
                          if (onSelectModule) {
                            onSelectModule(sc.id);
                          }
                        }}
                        className={cn(
                          "w-full px-2.5 py-1.5 rounded-lg text-left text-xs font-bold transition-all flex items-center justify-between group/btn cursor-pointer border",
                          isDone
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50"
                            : "bg-white dark:bg-slate-950/80 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:bg-blue-600 hover:text-white hover:border-blue-500 shadow-sm"
                        )}
                      >
                        <div className="flex items-center gap-2 truncate pr-1">
                          {isDone ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
                          ) : (
                            <Play className="w-3 h-3 text-blue-500 dark:text-blue-400 group-hover/btn:text-white shrink-0 fill-current" />
                          )}
                          <span className="truncate">{sc.name}</span>
                        </div>
                        <span className={cn(
                          "text-xs font-mono px-1.5 py-0.2 rounded shrink-0",
                          isDone 
                            ? "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300" 
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover/btn:bg-blue-700 group-hover/btn:text-white"
                        )}>
                          {isDone ? 'Done' : 'Start'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Modal detail for clicked step info */}
      <AnimatePresence>
        {selectedStep && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 md:p-8 max-w-3xl w-full text-slate-900 dark:text-white shadow-2xl relative overflow-hidden space-y-6"
            >
              <button
                onClick={() => setSelectedStep(null)}
                className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-2">
                <span className={cn(
                  "text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded border inline-block",
                  selectedStep.badgeBg,
                  selectedStep.badgeTextColor
                )}>
                  {selectedStep.phase}
                </span>
                <h3 className="text-4xl font-black font-display mb-2 text-slate-900 dark:text-white">{selectedStep.title}: {selectedStep.subtitle}</h3>
                <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">{selectedStep.description}</p>
              </div>

              {/* Direct Launch Buttons in Modal */}
              <div className="space-y-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Launch Classes for this Phase</span>
                <div className="grid grid-cols-1 gap-2.5">
                  {selectedStep.shortcuts.map((sc) => {
                    const isDone = completedModules.includes(sc.id);
                    return (
                      <button
                        key={sc.id}
                        onClick={() => {
                          setSelectedStep(null);
                          if (onSelectModule) {
                            onSelectModule(sc.id);
                          }
                        }}
                        className={cn(
                          "w-full px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-between cursor-pointer border shadow-sm hover:shadow-md",
                          isDone
                            ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900"
                            : "bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          {isDone ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                          ) : (
                            <Play className="w-5 h-5 fill-current text-white" />
                          )}
                          <span>{sc.name}</span>
                        </div>
                        <span className="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded bg-black/10 dark:bg-black/30">
                          {isDone ? 'Completed' : 'Begin Now ➔'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Key Building Blocks</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedStep.keyTech.map((tech, idx) => (
                      <span key={idx} className="text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Performance Goal</span>
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 block">{selectedStep.metrics}</span>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Industry standard for reliable financial tech systems.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedStep(null)}
                className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm rounded-xl transition-all cursor-pointer text-center"
              >
                Close Window
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
