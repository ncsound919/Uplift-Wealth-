import { Module } from '../data/courseData';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { getJSON, storageKeys } from '../lib/storage';
import {
  Clock, CheckCircle2, Gamepad2, Flame, Award, Trophy, Sparkles, TrendingUp
} from 'lucide-react';

interface StockSimMetrics {
  totalNAV?: number;
  totalPL?: number;
  totalPLPct?: number;
  openPositionsCount?: number;
  filledOrdersCount?: number;
}

interface Props {
  xp: number;
  streak: number;
  gameTimeSeconds: number;
  badges: string[];
  completedLessons: string[];
  allModules: Module[];
  completedModules: string[];
  onOpenGame: (gameId: string) => void;
  onNavigateToDashboard: () => void;
}

export function StudentProfile(props: Props) {
  const { xp, streak, gameTimeSeconds, badges, completedLessons, allModules, completedModules, onOpenGame } = props;

  const currentLevel = Math.floor(Math.sqrt(xp / 100)) + 1;

  const badgeDetails: Record<string, { title: string; desc: string; iconClass: string; req: string }> = {
    'wise_wizard': { title: 'Wise Wizard', desc: 'Sovereign Treasury Master', iconClass: 'bg-blue-500 text-white', req: 'Complete Module 1' },
    'card_commander': { title: 'Card Commander', desc: 'Merchant Payment Architect', iconClass: 'bg-purple-500 text-white', req: 'Complete Module 2' },
    'api_architect': { title: 'API Architect', desc: 'BaaS Ledger Engineer', iconClass: 'bg-emerald-500 text-white', req: 'Complete Module 3' },
    'credit_analyst': { title: 'Credit Analyst', desc: 'Risk Underwriter', iconClass: 'bg-amber-500 text-white', req: 'Complete Module 4' },
    'market_maker': { title: 'Market Maker', desc: 'Liquidity Protocol Founder', iconClass: 'bg-cyan-500 text-white', req: 'Complete Module 5' },
    'weather_oracle': { title: 'Weather Oracle', desc: 'Parametric Smart-Contract Master', iconClass: 'bg-indigo-500 text-white', req: 'Complete Module 6' },
    'crypto_pioneer': { title: 'DeFi Pioneer', desc: 'Smart Contract Developer', iconClass: 'bg-pink-500 text-white', req: 'Complete Module 7' },
    'compliance_officer': { title: 'Compliance Officer', desc: 'AML & KYC Screener Warden', iconClass: 'bg-slate-750 text-white', req: 'Complete Module 8' },
    'capstone_champion': { title: 'Capstone Champion', desc: 'FinTech Founder Graduate', iconClass: 'bg-amber-600 text-white', req: 'Complete Module 12' }
  };

  const formatGameTime = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h > 0 ? `${h}h ` : ''}${m > 0 ? `${m}m ` : ''}${s}s`;
  };

  const totalQuizzesPassed = completedLessons.filter(lessonId => {
    const lesson = allModules.flatMap(m => m.lessons).find(l => l.id === lessonId);
    return lesson?.type === 'quiz';
  }).length;

  const totalGamesPlayed = completedLessons.filter(lessonId => {
    const lesson = allModules.flatMap(m => m.lessons).find(l => l.id === lessonId);
    return lesson?.type === 'game';
  }).length;

  const stockSimMetrics = getJSON<StockSimMetrics | null>(storageKeys.stockSimMetrics, null);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in p-2">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xs flex flex-col md:flex-row items-center gap-6 justify-between">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-md text-white font-black text-2xl relative">
            FE
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 border-2 border-white dark:border-slate-800 w-5 h-5 rounded-full animate-pulse" />
          </div>
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-900 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Fintech Engineering Candidate</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Student Core Portfolio</h2>
            <p className="text-slate-400 dark:text-slate-500 text-xs">Credential ID: F-E4D0-BAC4-6B24</p>
          </div>
        </div>

        <div className="flex gap-4 shrink-0">
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-xl px-5 py-3 text-center min-w-24">
            <span className="block text-xs text-slate-400 font-bold uppercase">Syllabus Rank</span>
            <span className="block text-xl font-black text-blue-600 dark:text-blue-400 mt-0.5">Lvl {currentLevel}</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-xl px-5 py-3 text-center min-w-24">
            <span className="block text-xs text-slate-400 font-bold uppercase">Consensus XP</span>
            <span className="block text-xl font-black text-indigo-600 dark:text-indigo-400 mt-0.5">{xp}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-500">
            <span className="text-xs font-bold uppercase">Simulator Gametime</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <span className="block text-2xl font-black text-slate-900 dark:text-white">{formatGameTime(gameTimeSeconds)}</span>
          <span className="block text-xs text-slate-400 dark:text-slate-500 leading-none">Real-time terminal execution</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-500">
            <span className="text-xs font-bold uppercase">Quizzes Passed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="block text-2xl font-black text-slate-900 dark:text-white">{totalQuizzesPassed}</span>
          <span className="block text-xs text-slate-400 dark:text-slate-500 leading-none">Compliance examinations aced</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-500">
            <span className="text-xs font-bold uppercase">Simulators Mastered</span>
            <Gamepad2 className="w-4 h-4 text-purple-500" />
          </div>
          <span className="block text-2xl font-black text-slate-900 dark:text-white">{totalGamesPlayed}</span>
          <span className="block text-xs text-slate-400 dark:text-slate-500 leading-none">Completeness across audits</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-500">
            <span className="text-xs font-bold uppercase">Active Attendance</span>
            <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
          </div>
          <span className="block text-2xl font-black text-slate-900 dark:text-white">{streak} Days</span>
          <span className="block text-xs text-slate-400 dark:text-slate-500 leading-none">Learning consecutive streak</span>
        </div>
      </div>

      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-blue-900/50 rounded-3xl p-6 md:p-8 text-white shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-blue-400 block">Ongoing Investment Ledger</span>
              <h3 className="text-xl font-black">Stock Sim Live Portfolio & Score</h3>
            </div>
          </div>

          <button
            onClick={() => onOpenGame('trading')}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer self-start sm:self-auto"
          >
            Open Stock Sim &rarr;
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
            <span className="text-xs font-bold text-slate-400 uppercase block">Portfolio NAV</span>
            <span className="text-xl font-black text-white mt-1 block">
              ${(stockSimMetrics?.totalNAV || 100000).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-slate-500 block mt-0.5">Starting: $100,000</span>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
            <span className="text-xs font-bold text-slate-400 uppercase block">Total Return P&L</span>
            <span className={`text-xl font-black mt-1 block ${(stockSimMetrics?.totalPL || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {(stockSimMetrics?.totalPL || 0) >= 0 ? '+' : ''}${(stockSimMetrics?.totalPL || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <span className={`text-xs font-bold block mt-0.5 ${(stockSimMetrics?.totalPLPct || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {(stockSimMetrics?.totalPLPct || 0).toFixed(2)}% ROI
            </span>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
            <span className="text-xs font-bold text-slate-400 uppercase block">Active Positions</span>
            <span className="text-xl font-black text-indigo-400 mt-1 block">
              {stockSimMetrics?.openPositionsCount || 0}
            </span>
            <span className="text-xs text-slate-500 block mt-0.5">Open Market Exposure</span>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
            <span className="text-xs font-bold text-slate-400 uppercase block">Orders Executed</span>
            <span className="text-xl font-black text-amber-400 mt-1 block">
              {stockSimMetrics?.filledOrdersCount || 0}
            </span>
            <span className="text-xs text-slate-500 block mt-0.5">Filled Market/Limit Orders</span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-lg font-black flex items-center gap-2 text-slate-900 dark:text-white">
            <Award className="w-5 h-5 text-amber-500" />
            <span>Earned Achievements & Badges</span>
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Unlock micro-credentials by finishing the respective curriculum tracks and sandbox exercises.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(badgeDetails).map(([key, details]) => {
            const isUnlocked = badges.includes(key);

            return (
              <motion.div 
                key={key} 
                whileHover={isUnlocked ? { scale: 1.02, y: -2 } : {}}
                whileTap={isUnlocked ? { scale: 0.98 } : {}}
                className={cn(
                  "p-4 rounded-2xl border transition-all flex gap-3.5 relative overflow-hidden",
                  isUnlocked 
                    ? "bg-slate-50/50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 shadow-3xs hover:border-indigo-500/30" 
                    : "bg-slate-50/10 dark:bg-slate-950/5 border-dashed border-slate-200 dark:border-slate-800/80 opacity-60"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                  isUnlocked ? details.iconClass : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600"
                )}>
                  <Trophy className="w-6 h-6" />
                </div>

                <div className="space-y-0.5">
                  <span className={cn("text-xs font-black block", isUnlocked ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-500")}>
                    {details.title}
                  </span>
                  <span className="text-xs text-slate-550 dark:text-slate-400 block font-medium leading-tight">
                    {details.desc}
                  </span>
                  <span className="text-xs font-bold uppercase text-slate-400 dark:text-slate-550 block pt-1">
                    {isUnlocked ? '✓ CREDENTIAL EARNED' : `🔒 REQ: ${details.req}`}
                  </span>
                </div>

                {!isUnlocked && (
                  <div className="absolute top-2 right-2 text-xs bg-slate-200 dark:bg-slate-800 text-slate-500 font-bold px-1.5 py-0.5 rounded-sm">
                    LOCKED
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
