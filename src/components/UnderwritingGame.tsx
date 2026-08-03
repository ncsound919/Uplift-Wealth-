import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, AlertTriangle, ArrowRight, Check, X, RefreshCw, Landmark,
  Volume2, VolumeX, Flame, Award, Coins, TrendingUp, History, ListCollapse
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { apiClient } from '../lib/apiClient';
import { soundManager } from '../utils/sound';

interface UnderwritingGameProps {
  onComplete: () => void;
}

interface MiniTx {
  date: string;
  desc: string;
  amt: number;
  type: 'credit' | 'debit';
}

interface Applicant {
  id: string;
  name: string;
  avatarColor: string;
  fico: number;
  monthlySurplus: number;
  rentHistoryOnTime: number; // in months out of 24
  requestedAmount: number;
  purpose: string;
  zipCode: string; // triggers bias discussion
  isGoodRisk: boolean; // hidden ground truth
  biasRisk: boolean; // if true, FICO is low but cashflow is excellent, or vice versa
  isThinFile?: boolean; // explicit flag to avoid magic number check
  txs: MiniTx[];
}

// Named constants for thresholds and rates
const INTEREST_GAIN_RATE = 0.15;
const FICO_RISK_THRESHOLD = 620;

const APPLICANTS: Applicant[] = [
  {
    id: 'app-1',
    name: 'Marcus Vance',
    avatarColor: 'bg-indigo-500',
    fico: 580,
    monthlySurplus: 1200,
    rentHistoryOnTime: 24,
    requestedAmount: 1500,
    purpose: 'Plumbing equipment upgrade',
    zipCode: '94601 (Oakland)',
    isGoodRisk: true,
    biasRisk: true,
    txs: [
      { date: 'July 25', desc: 'Direct Deposit: Plumber Contractor', amt: 3500, type: 'credit' },
      { date: 'July 01', desc: 'Rent Payment: On-Time Ledger', amt: -1500, type: 'debit' },
      { date: 'June 28', desc: 'Hardware Wholesale Supply', amt: -800, type: 'debit' }
    ]
  },
  {
    id: 'app-2',
    name: 'Sarah Chen',
    avatarColor: 'bg-sky-500',
    fico: 780,
    monthlySurplus: 150,
    rentHistoryOnTime: 18,
    requestedAmount: 8000,
    purpose: 'Luxury vacation refinancing',
    zipCode: '94025 (Menlo Park)',
    isGoodRisk: false,
    biasRisk: true,
    txs: [
      { date: 'July 25', desc: 'Biweekly Corporate Salary', amt: 6200, type: 'credit' },
      { date: 'July 15', desc: 'Intercontinental Cruise Booking', amt: -4200, type: 'debit' },
      { date: 'July 01', desc: 'Luxury Vehicle Monthly Lease', amt: -1850, type: 'debit' }
    ]
  },
  {
    id: 'app-3',
    name: 'Dominique Green',
    avatarColor: 'bg-rose-500',
    fico: 610,
    monthlySurplus: 850,
    rentHistoryOnTime: 23,
    requestedAmount: 2000,
    purpose: 'Coding bootcamp tuition',
    zipCode: '10027 (Harlem)',
    isGoodRisk: true,
    biasRisk: false,
    txs: [
      { date: 'July 25', desc: 'Payroll: Junior Web Developer', amt: 2800, type: 'credit' },
      { date: 'July 01', desc: 'Apartment Rental Payment', amt: -1100, type: 'debit' },
      { date: 'June 25', desc: 'Local Organic Supermarket', amt: -450, type: 'debit' }
    ]
  },
  {
    id: 'app-4',
    name: 'James Cooper',
    avatarColor: 'bg-emerald-500',
    fico: 740,
    monthlySurplus: 900,
    rentHistoryOnTime: 24,
    requestedAmount: 5000,
    purpose: 'Home solar panel downpayment',
    zipCode: '90210 (Beverly Hills)',
    isGoodRisk: true,
    biasRisk: false,
    txs: [
      { date: 'July 25', desc: 'Corporate Tech Salary Deposit', amt: 8500, type: 'credit' },
      { date: 'July 01', desc: 'Residential Mortgage Draft', amt: -3200, type: 'debit' },
      { date: 'June 29', desc: 'Automated Brokerage Deposit', amt: -2500, type: 'debit' }
    ]
  },
  {
    id: 'app-5',
    name: 'Lina Al-Masri',
    avatarColor: 'bg-amber-500',
    fico: 510,
    monthlySurplus: 1100,
    rentHistoryOnTime: 24,
    requestedAmount: 1200,
    purpose: 'Delivery vehicle repairs',
    zipCode: '60621 (Englewood)',
    isGoodRisk: true,
    biasRisk: true,
    isThinFile: true,
    txs: [
      { date: 'July 24', desc: 'Delivery Gig-Platform Settlement', amt: 4100, type: 'credit' },
      { date: 'July 01', desc: 'Home Landlord Rent ACH', amt: -1300, type: 'debit' },
      { date: 'June 30', desc: 'Fleet Fuel & Gas Station', amt: -400, type: 'debit' }
    ]
  },
  {
    id: 'app-6',
    name: 'Wei Zhang',
    avatarColor: 'bg-fuchsia-500',
    fico: 650,
    monthlySurplus: -200,
    rentHistoryOnTime: 12,
    requestedAmount: 15000,
    purpose: 'Crypto margin call',
    zipCode: '10001 (New York)',
    isGoodRisk: false,
    biasRisk: false,
    txs: [
      { date: 'July 22', desc: 'Unsecured Personal Loan Inflow', amt: 1200, type: 'credit' },
      { date: 'July 18', desc: 'Leveraged Crypto Futures Call', amt: -4500, type: 'debit' },
      { date: 'July 01', desc: 'High-rise Studio Rent Charge', amt: -2200, type: 'debit' }
    ]
  },
  {
    id: 'app-7',
    name: 'Elena Rostova',
    avatarColor: 'bg-cyan-500',
    fico: 0,
    monthlySurplus: 4500,
    rentHistoryOnTime: 24,
    requestedAmount: 25000,
    purpose: 'Small business expansion',
    zipCode: '33101 (Miami)',
    isGoodRisk: true,
    biasRisk: true,
    isThinFile: true,
    txs: [
      { date: 'July 25', desc: 'Merchant Store Sales Payout', amt: 14000, type: 'credit' },
      { date: 'July 01', desc: 'Commercial Rent Transfer', amt: -3500, type: 'debit' },
      { date: 'June 28', desc: 'Wholesale Supplier Invoice', amt: -4000, type: 'debit' }
    ]
  }
];

export function UnderwritingGame({ onComplete }: UnderwritingGameProps) {
  const [index, setIndex] = useState(0);
  const [decisions, setDecisions] = useState<{ [id: string]: 'approve' | 'decline' }>({});
  const [reviewMode, setReviewMode] = useState(false);
  const [auditMode, setAuditMode] = useState(false);
  
  // Gamification Metrics
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; correct: boolean } | null>(null);

  // Load state from Express backend
  useEffect(() => {
    apiClient.loadSandboxState('underwriting').then((res) => {
      if (res.stateData && res.stateData.decisions) {
        setDecisions(res.stateData.decisions);
        if (res.stateData.index !== undefined) setIndex(res.stateData.index);
        if (res.stateData.reviewMode !== undefined) setReviewMode(res.stateData.reviewMode);
        if (res.stateData.auditMode !== undefined) setAuditMode(res.stateData.auditMode);
        if (res.stateData.xp !== undefined) setXp(res.stateData.xp);
        if (res.stateData.streak !== undefined) setStreak(res.stateData.streak);
      }
    }).catch((err) => console.log('[Underwriting Sandbox] Loading local state:', err));
  }, []);

  // Save state snapshot on change
  useEffect(() => {
    if (Object.keys(decisions).length > 0) {
      apiClient.saveSandboxState({
        sandboxType: 'underwriting',
        stateData: { decisions, index, reviewMode, auditMode, xp, streak },
        notes: 'Underwriting Policy Decisions Snapshot'
      }).catch((err) => console.warn('[Underwriting AutoSave Error]:', err));
    }
  }, [decisions, index, reviewMode, auditMode, xp, streak]);

  const currentApplicant = APPLICANTS[index];

  const handleDecision = (decision: 'approve' | 'decline') => {
    soundManager.playTick();
    const isCorrectApprove = currentApplicant.isGoodRisk && decision === 'approve';
    const isCorrectDecline = !currentApplicant.isGoodRisk && decision === 'decline';
    const isCorrect = isCorrectApprove || isCorrectDecline;

    let reward = 0;
    let nextStreak = 0;
    if (isCorrect) {
      reward = 100 + streak * 20;
      nextStreak = streak + 1;
      setXp(p => p + reward);
      setStreak(nextStreak);
      setFeedback({ text: `CORRECT DECISION! +${reward} XP (Streak: ${nextStreak}🔥)`, correct: true });
      soundManager.playSuccess();
    } else {
      nextStreak = 0;
      setStreak(0);
      setFeedback({ text: `INCORRECT DECISION: Traditional FICO traps can be deceptive!`, correct: false });
      soundManager.playFailure();
    }

    setDecisions(prev => ({ ...prev, [currentApplicant.id]: decision }));

    setTimeout(() => {
      setFeedback(null);
      if (index < APPLICANTS.length - 1) {
        setIndex(prev => prev + 1);
      } else {
        setReviewMode(true);
      }
    }, 1800);
  };

  const handleToggleDecisionInReview = (appId: string) => {
    soundManager.playTick();
    setDecisions(prev => ({
      ...prev,
      [appId]: prev[appId] === 'approve' ? 'decline' : 'approve'
    }));
  };

  const handleToggleMute = () => {
    const nextMuted = soundManager.toggleMute();
    setIsMuted(nextMuted);
  };

  const analytics = useMemo(() => {
    let approvedCount = 0;
    let netReturns = 0;
    let defaultsCount = 0;
    let fairLendingFlags = 0;

    APPLICANTS.forEach(app => {
      const decision = decisions[app.id];
      if (decision === 'approve') {
        approvedCount++;
        if (app.isGoodRisk) {
          netReturns += Math.floor(app.requestedAmount * INTEREST_GAIN_RATE); // interest gain
        } else {
          netReturns -= app.requestedAmount; // default lose full principal
          defaultsCount++;
        }
      } else if (decision === 'decline') {
        if (app.isGoodRisk && app.biasRisk) {
          fairLendingFlags++;
        }
      }
    });

    return { approvedCount, netReturns, defaultsCount, fairLendingFlags };
  }, [decisions]);

  const { approvedCount, netReturns, defaultsCount, fairLendingFlags } = analytics;

  // Stricter success criteria: positive net returns AND zero fair lending flags
  const isSuccess = netReturns > 0 && fairLendingFlags === 0;

  // Fire confetti only when the run is finalized and is a success
  useEffect(() => {
    if (auditMode) {
      if (isSuccess) {
        soundManager.playWin();
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.75 }
        });
      } else {
        soundManager.playFailure();
      }
    }
  }, [auditMode, isSuccess]);

  const handleReset = () => {
    soundManager.playTick();
    setIndex(0);
    setDecisions({});
    setReviewMode(false);
    setAuditMode(false);
    setXp(0);
    setStreak(0);
    setFeedback(null);
  };

  return (
    <div id="underwriting-game-container" className="bg-slate-950 text-slate-100 rounded-3xl shadow-xl border border-slate-800 overflow-hidden">
      {/* Header with audio controls & gamified banner */}
      <div id="underwriting-header" className="bg-gradient-to-r from-slate-950 via-amber-950/40 to-slate-950 p-6 border-b border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400">
              <Landmark className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-white tracking-tight">Open Banking Underwriting Terminal</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  DECISION ENGINE V2
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Evaluate FICO vs. Open Banking Surplus real-time cash flows</p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            {/* XP & Streak gamification badges */}
            <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-amber-400 font-bold font-mono shadow-inner">
              <Award className="w-3.5 h-3.5" />
              <span>{xp} XP</span>
            </div>

            {streak > 0 && (
              <div className="flex items-center gap-1 bg-amber-500/10 text-amber-300 px-2.5 py-1.5 rounded-xl border border-amber-500/20 text-xs font-bold font-mono animate-pulse">
                <Flame className="w-3.5 h-3.5" />
                <span>{streak} Streak</span>
              </div>
            )}

            <button
              onClick={handleToggleMute}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-all"
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {!reviewMode && !auditMode ? (
        <div id="underwriting-eval-board" className="p-6">
          <div className="mb-6 bg-slate-900/60 p-4 rounded-2xl border border-slate-850">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-black text-slate-400 uppercase tracking-wider font-mono">
                Evaluating Profile {index + 1} of {APPLICANTS.length}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-amber-300 bg-amber-950/40 px-3 py-1 rounded-full font-bold border border-amber-500/20">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Fair Credit Act active</span>
              </div>
            </div>

            {/* Segmented Progress Bar with status indicator lights */}
            <div className="flex gap-2.5 h-2 w-full bg-slate-950 rounded-full overflow-hidden p-0.5">
              {APPLICANTS.map((app, idx) => {
                const isSelected = idx === index;
                const isCompleted = decisions[app.id] !== undefined;
                return (
                  <div
                    key={app.id}
                    className={`h-full flex-grow rounded-full transition-all duration-300 ${
                      isSelected
                        ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                        : isCompleted
                        ? 'bg-emerald-500'
                        : 'bg-slate-800'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
            
            {/* Feedback Pop-up animation */}
            <AnimatePresence>
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className={`absolute inset-x-0 top-1/3 mx-auto max-w-md p-4 rounded-2xl border text-center font-bold text-sm z-30 shadow-2xl ${
                    feedback.correct
                      ? 'bg-emerald-950/90 border-emerald-500 text-emerald-300 shadow-emerald-900/25'
                      : 'bg-rose-950/90 border-rose-500 text-rose-300 shadow-rose-900/25'
                  }`}
                >
                  <p>{feedback.text}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Left Applicant Card (7 columns) */}
            <div className="lg:col-span-7">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentApplicant.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="bg-slate-900/60 rounded-2xl p-6 border border-slate-800 shadow-lg space-y-6"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 ${currentApplicant.avatarColor} text-white rounded-2xl flex items-center justify-center font-extrabold text-xl shadow-lg ring-4 ring-slate-800/50`}>
                        {currentApplicant.name[0]}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-lg tracking-tight">{currentApplicant.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-400 font-mono bg-slate-800 px-2 py-0.5 rounded uppercase font-bold">Zip Code: {currentApplicant.zipCode}</span>
                          {currentApplicant.isThinFile && (
                            <span className="text-xs text-indigo-300 font-mono bg-indigo-950/50 px-2 py-0.5 rounded uppercase font-bold border border-indigo-500/20">
                              Thin Credit File
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-500 font-bold uppercase block tracking-wider font-mono">Requested Capital</span>
                      <span className="text-2xl font-black text-amber-400">${currentApplicant.requestedAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Circular & Comparative Gauges Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    {/* Visual Circular FICO Gauge */}
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex flex-col items-center justify-center text-center">
                      <span className="text-xs text-slate-500 block font-bold uppercase tracking-wide mb-2 font-mono">Bureau FICO Score</span>
                      <div className="relative w-20 h-20 flex items-center justify-center">
                        {/* Circular progress track */}
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-slate-800"
                            strokeWidth="3.5"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className={currentApplicant.fico < FICO_RISK_THRESHOLD ? 'text-rose-500' : 'text-emerald-500'}
                            strokeDasharray={`${(currentApplicant.fico / 850) * 100}, 100`}
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-sm font-black text-white">
                            {currentApplicant.isThinFile ? 'N/A' : currentApplicant.fico}
                          </span>
                          <span className="text-xs text-slate-500 uppercase font-mono">Max 850</span>
                        </div>
                      </div>
                      <span className={`text-xs font-bold mt-2 uppercase ${currentApplicant.fico < FICO_RISK_THRESHOLD ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {currentApplicant.fico === 0 ? 'No File' : currentApplicant.fico < FICO_RISK_THRESHOLD ? 'Subprime Risk' : 'Prime Bureau'}
                      </span>
                    </div>

                    {/* Rent On-Time Meter */}
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex flex-col items-center justify-center text-center">
                      <span className="text-xs text-slate-500 block font-bold uppercase tracking-wide mb-2 font-mono">Home Rental Ledger</span>
                      <div className="relative w-20 h-20 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-slate-800"
                            strokeWidth="3.5"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className="text-amber-500"
                            strokeDasharray={`${(currentApplicant.rentHistoryOnTime / 24) * 100}, 100`}
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-sm font-black text-white">{currentApplicant.rentHistoryOnTime}/24</span>
                          <span className="text-xs text-slate-500 uppercase font-mono">Months</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-amber-400 mt-2 uppercase font-mono">On-Time Drafts</span>
                    </div>

                    {/* Open Banking Cashflow Surplus */}
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex flex-col items-center justify-center text-center">
                      <span className="text-xs text-slate-500 block font-bold uppercase tracking-wide mb-2 font-mono">Monthly Cash Surplus</span>
                      <div className="relative w-20 h-20 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-slate-800"
                            strokeWidth="3.5"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className="text-emerald-400"
                            strokeDasharray={`${Math.min(100, Math.max(0, (currentApplicant.monthlySurplus / 2000) * 100))}, 100`}
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-sm font-black text-white">
                            {currentApplicant.monthlySurplus >= 0 ? `+$${currentApplicant.monthlySurplus}` : `-$${Math.abs(currentApplicant.monthlySurplus)}`}
                          </span>
                          <span className="text-xs text-slate-500 uppercase font-mono">Free Cache</span>
                        </div>
                      </div>
                      <span className={`text-xs font-bold mt-2 uppercase ${currentApplicant.monthlySurplus >= 200 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {currentApplicant.monthlySurplus >= 1000 ? 'Excellent Cache' : currentApplicant.monthlySurplus >= 200 ? 'Passable' : 'Deficit Risk'}
                      </span>
                    </div>

                  </div>

                  {/* Open Banking Live Transaction Ledger Simulator (Gamified Enhancement) */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-850">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                      <div className="flex items-center gap-1.5 text-slate-400 font-mono text-xs">
                        <History className="w-3.5 h-3.5 text-indigo-400" />
                        <span>OPEN BANKING LEDGER INTEGRATION</span>
                      </div>
                      <span className="text-xs text-emerald-400 font-mono bg-emerald-950/40 px-2 py-0.5 rounded font-black">ACTIVE TELEMETRY</span>
                    </div>

                    <div className="space-y-2">
                      {currentApplicant.txs.map((tx, tIdx) => (
                        <div key={tIdx} className="flex items-center justify-between text-xs font-mono p-1.5 bg-slate-900/30 rounded border border-slate-850/50">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500 text-xs">{tx.date}</span>
                            <span className="text-slate-300 font-bold">{tx.desc}</span>
                          </div>
                          <span className={tx.type === 'credit' ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                            {tx.type === 'credit' ? `+$${tx.amt.toLocaleString()}` : `-$${Math.abs(tx.amt).toLocaleString()}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Details summary */}
                  <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-slate-950 p-3 rounded-xl border border-slate-850">
                    <div>
                      <span className="text-slate-500 block">BORROWER PURPOSE:</span>
                      <span className="text-slate-300 font-semibold">{currentApplicant.purpose}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">UNDERWRITING METRIC:</span>
                      <span className="text-slate-300 font-semibold">
                        {currentApplicant.isGoodRisk ? 'CASHFLOW SOLVENT' : 'CASHFLOW INSOLVENT'}
                      </span>
                    </div>
                  </div>

                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right Information & Decisions (5 columns) */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="bg-amber-950/20 rounded-2xl p-5 border border-amber-500/15 text-xs leading-relaxed text-amber-200/90 shadow-lg space-y-2">
                  <div className="flex gap-2.5 items-start">
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold text-amber-300 block mb-1">Underwriter Advisory Bulletin</strong>
                      <span>
                        Traditional FICO scores ignore or aggressively penalize "credit invisible" candidates (freelancers, gig workers, younger demographics, or immigrants) with thin credit histories.
                      </span>
                    </div>
                  </div>
                  <p className="text-slate-400 pl-7">
                    By pulling live bank account transactions through Open Banking APIs, we can analyze actual monthly surplus cache and rental history on-time ledgers, allowing us to capture pristine borrowers that traditional scoring misses entirely.
                  </p>
                </div>

                <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest font-mono block mb-2">Decision-Support Helper:</span>
                  Evaluate <strong className="text-slate-100">{currentApplicant.name}</strong> thoroughly.
                  {currentApplicant.id === 'app-1' && ' Notice the stark contrast: a subprime 580 FICO, but exhibits a superb $1,200 monthly cache surplus and a perfect 24-month rental history.'}
                  {currentApplicant.id === 'app-2' && ' Look beyond the pristine 780 score. Evaluate her tiny $150 surplus. Is a high $8,000 principal viable on such a fragile cushion?'}
                  {currentApplicant.id === 'app-3' && ' This coder applicant has a moderate 610 FICO, but look at his robust 23/24 rent record and steady $850 free surplus.'}
                  {currentApplicant.id === 'app-4' && ' A prime profile across the board: clean 740 score, high surplus savings, and perfect home rent records.'}
                  {currentApplicant.id === 'app-5' && ' This candidate has a subprime 510 file but boasts a strong delivery service trade with perfect home rent sheets.'}
                  {currentApplicant.id === 'app-6' && ' Chinese applicant with decent 650 bureau credit, but running an active negative deficit (-$200/mo) and spotty rent ledger.'}
                  {currentApplicant.id === 'app-7' && ' An entrepreneur with zero bureau file (FICO 0), but displays a massive $4,500 monthly free surplus and perfect home rental ACH transfers.'}
                </div>
              </div>

              <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-4">
                <span className="text-xs font-bold text-slate-300 block text-center font-mono">SUBMIT CREDIT DETERMINATION:</span>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleDecision('decline')}
                    className="flex items-center justify-center gap-2 py-4 rounded-xl border border-rose-500/30 text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 active:scale-95 transition-all font-bold text-xs uppercase tracking-wider cursor-pointer"
                  >
                    <X className="w-4 h-4 text-rose-400" /> Decline Loan
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDecision('approve')}
                    className="flex items-center justify-center gap-2 py-4 rounded-xl border border-emerald-500/30 text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/60 active:scale-95 transition-all font-bold text-xs uppercase tracking-wider cursor-pointer"
                  >
                    <Check className="w-4 h-4 text-emerald-400" /> Approve Loan
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      ) : reviewMode && !auditMode ? (
        /* Pre-Audit Decisions Summary & Correction Board */
        <div id="underwriting-review-board" className="p-6 space-y-6">
          <div className="text-center">
            <h4 className="text-xl font-bold text-white mb-1 tracking-tight">Underwriting Review Board</h4>
            <p className="text-xs text-slate-400 font-mono">Confirm or modify decisions before releasing files to the compliance bank</p>
          </div>

          <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
            {APPLICANTS.map((app) => {
              const dec = decisions[app.id];
              return (
                <div key={app.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-2xl gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl ${app.avatarColor} text-white flex items-center justify-center text-xs font-black shadow shrink-0`}>
                      {app.name[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{app.name}</span>
                        <span className="text-xs text-slate-500 font-mono">({app.zipCode.split(' ')[0]})</span>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-slate-400 mt-0.5 font-mono">
                        <span>FICO: {app.fico === 0 ? 'N/A' : app.fico}</span>
                        <span>•</span>
                        <span>Surplus: +${app.monthlySurplus}/mo</span>
                        <span>•</span>
                        <span>Rent: {app.rentHistoryOnTime}/24 mo</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <span className={`text-xs font-black uppercase px-3 py-1 rounded-full border font-mono ${
                      dec === 'approve'
                        ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
                    }`}>
                      {dec === 'approve' ? 'Approved' : 'Declined'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleDecisionInReview(app.id)}
                      className="text-xs bg-slate-800 border border-slate-700 hover:bg-slate-750 text-slate-200 font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3 text-slate-400 animate-spin-hover" />
                      <span>Toggle</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-800 pt-5">
            <button
              type="button"
              onClick={() => {
                soundManager.playTick();
                setReviewMode(false);
                setIndex(0);
              }}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-xl font-bold text-xs border border-slate-700 transition-colors"
            >
              Back to Profiles
            </button>
            <button
              type="button"
              onClick={() => {
                soundManager.playTick();
                setAuditMode(true);
              }}
              className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg"
            >
              <span>Submit to Compliance Audit</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Audit report mode */
        <div id="underwriting-audit-panel" className="p-6 space-y-8">
          <div className="text-center space-y-2">
            <h4 className="text-2xl font-black text-white">Underwriting Stress-Test Complete</h4>
            <p className="text-slate-400 font-mono text-xs">Portfolio diagnostics & fair lending compliance audit report</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-center">
              <span className="text-xs text-slate-400 font-bold uppercase block mb-1 font-mono">Approved Loans</span>
              <span className="text-xl font-black text-white">{approvedCount} / {APPLICANTS.length}</span>
            </div>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-center">
              <span className="text-xs text-slate-400 font-bold uppercase block mb-1 font-mono">Net Returns</span>
              <span className={`text-xl font-black ${netReturns >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {netReturns >= 0 ? `+$${netReturns.toLocaleString()}` : `-$${Math.abs(netReturns).toLocaleString()}`}
              </span>
            </div>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-center">
              <span className="text-xs text-slate-400 font-bold uppercase block mb-1 font-mono">Default Incidents</span>
              <span className="text-xl font-black text-rose-400">{defaultsCount} Default(s)</span>
            </div>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-center">
              <span className="text-xs text-slate-400 font-bold uppercase block mb-1 font-mono">Fair Lending Flags</span>
              <span className={`text-xl font-black ${fairLendingFlags > 0 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
                {fairLendingFlags} Flag(s)
              </span>
            </div>
          </div>

          {/* Detailed Diagnostic Panel */}
          <div className="space-y-3">
            <h5 className="font-bold text-slate-300 text-sm font-mono">Auditor Diagnostics Ledger:</h5>
            <div className="text-xs leading-relaxed border border-slate-800 rounded-2xl p-4 bg-slate-950/80 space-y-4 max-h-[300px] overflow-y-auto">
              
              {/* app-1: Marcus Vance */}
              {decisions['app-1'] === 'approve' ? (
                <div className="flex gap-2.5 text-emerald-300 pb-3 border-b border-slate-900">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Correct Approval (Marcus Vance):</strong> Great alternative decision! While Vance had a low 580 FICO, his $1,200 surplus and solid rent ledger proved high capacity. Alternative cashflows saved an eligible borrower!</span>
                </div>
              ) : (
                <div className="flex gap-2.5 text-amber-300 pb-3 border-b border-slate-900">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Opportunity Missed (Marcus Vance):</strong> You declined Vance based on his 580 FICO score. You missed a secure loan that would have repaid with solid interest!</span>
                </div>
              )}

              {/* app-2: Sarah Chen */}
              {decisions['app-2'] === 'approve' ? (
                <div className="flex gap-2.5 text-rose-300 pb-3 border-b border-slate-900">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span><strong>FICO Trap Default (Sarah Chen):</strong> You approved Chen because of her high 780 FICO score, but she defaulted! Her actual bank cache showed a tiny $150 surplus, and she was heavily overleveraged. Legacy scores can hide active distress.</span>
                </div>
              ) : (
                <div className="flex gap-2.5 text-emerald-300 pb-3 border-b border-slate-900">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Smart Decline (Sarah Chen):</strong> Excellent risk check. You ignored her high 780 score and rejected her because her cashflow surplus ($150) was too low to support a heavy $8,000 obligation. You saved the neobank from a $8,000 default!</span>
                </div>
              )}

              {/* app-3: Dominique Green */}
              {decisions['app-3'] === 'approve' ? (
                <div className="flex gap-2.5 text-emerald-300 pb-3 border-b border-slate-900">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Correct Approval (Dominique Green):</strong> Spot on. Dominique had a borderline 610 FICO, but strong on-time rent payment history (23/24 months) and steady $850 cash flow surplus proved strong credit capacity.</span>
                </div>
              ) : (
                <div className="flex gap-2.5 text-amber-300 pb-3 border-b border-slate-900">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Opportunity Missed (Dominique Green):</strong> You declined Dominique Green. Although his credit was borderline (610 FICO), his cash surplus and nearly perfect rental history made him a highly secure risk.</span>
                </div>
              )}

              {/* app-4: James Cooper */}
              {decisions['app-4'] === 'approve' ? (
                <div className="flex gap-2.5 text-emerald-300 pb-3 border-b border-slate-900">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Correct Approval (James Cooper):</strong> Excellent baseline prime risk execution. Cooper has a clean 740 FICO, high surplus ($900), and a perfect rental history. Solid repayment was completed.</span>
                </div>
              ) : (
                <div className="flex gap-2.5 text-amber-300 pb-3 border-b border-slate-900">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Opportunity Missed (James Cooper):</strong> You declined a prime borrower with a 740 FICO score, $900 surplus, and perfect history. This represents a major loss of reliable interest income!</span>
                </div>
              )}

              {/* app-5: Lina Al-Masri */}
              {decisions['app-5'] === 'approve' ? (
                <div className="flex gap-2.5 text-emerald-300 pb-3 border-b border-slate-900">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Financial Inclusion Victory (Lina Al-Masri):</strong> Spot on! Approving a &ldquo;credit invisible&rdquo; applicant with strong cash-flow surplus bypasses structural biases that legacy credit bureaus reinforce.</span>
                </div>
              ) : (
                <div className="flex gap-2.5 text-amber-300 pb-3 border-b border-slate-900">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Inclusion Failure (Lina Al-Masri):</strong> Reclaiming thin-file applicants is alternative lending&apos;s core mission. Denying a highly solvent applicant with perfect rent sheets just because she has no bureau profile triggers lending disparity flags.</span>
                </div>
              )}

              {/* app-6: Wei Zhang */}
              {decisions['app-6'] === 'approve' ? (
                <div className="flex gap-2.5 text-rose-300 pb-3 border-b border-slate-900">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span><strong>FICO Trap Default (Wei Zhang):</strong> You approved based on a decent 650 FICO, but they were running a monthly deficit (-$200)! This immediately turned into a bad debt write-off.</span>
                </div>
              ) : (
                <div className="flex gap-2.5 text-emerald-300 pb-3 border-b border-slate-900">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Smart Decline (Wei Zhang):</strong> Great catch. While the FICO was passable, the negative monthly surplus of -$200 signaled imminent trouble. You protected the portfolio.</span>
                </div>
              )}

              {/* app-7: Elena Rostova */}
              {decisions['app-7'] === 'approve' ? (
                <div className="flex gap-2.5 text-emerald-300">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>High-Value Alternative Approval (Elena Rostova):</strong> Phenomenal! A $25,000 loan to a zero-FICO applicant is scary, but her $4,500 surplus and pristine rent history proved it was incredibly safe and lucrative.</span>
                </div>
              ) : (
                <div className="flex gap-2.5 text-amber-300">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Massive Opportunity Missed (Elena Rostova):</strong> You let a $25k loan with a $4,500 monthly surplus slip away because of a thin credit file. A massive loss of high-quality interest income.</span>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row gap-3">
            {!isSuccess && (
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 py-3.5 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" /> Try Again
              </button>
            )}
            <button
              type="button"
              onClick={onComplete}
              disabled={!isSuccess}
              aria-disabled={!isSuccess}
              aria-label={isSuccess ? 'Finish Simulator Challenge' : 'Complete compliance audit with zero flags to proceed'}
              className={`flex-grow py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 shadow-lg ${
                isSuccess
                  ? 'bg-blue-600 hover:bg-blue-500 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <span>{isSuccess ? 'Finish Simulator Challenge' : 'Complete with positive returns & 0 flags to unlock'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
