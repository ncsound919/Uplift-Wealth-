import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, ShieldCheck, AlertOctagon, ArrowRight, Check, X, RefreshCw, 
  Eye, Brain, Activity, UserCheck, Zap, AlertTriangle, Fingerprint, Lock, 
  Globe, Volume2, VolumeX, Shield, Award, Sparkles, Server
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { apiClient } from '../lib/apiClient';
import { soundManager } from '../utils/sound';

interface FraudGameProps {
  onComplete: () => void;
}

interface Tx {
  id: string;
  senderName: string;
  amount: number;
  location: string;
  device: string;
  velocityNotes?: string;
  pepWatchlistMatch: boolean;
  notes: string;
  isFraud: boolean;
  type: 'structuring' | 'standard' | 'pep' | 'velocity' | 'mule' | 'device_mismatch' | 'jurisdiction';
}

const TRANSACTIONS: Tx[] = [
  {
    id: 'tx-1',
    senderName: 'Arthur Dent',
    amount: 45,
    location: 'London, UK',
    device: 'iPhone 13 - verified',
    pepWatchlistMatch: false,
    notes: 'Coffee shop payment near registered home address. Verified biometric device signature.',
    isFraud: false,
    type: 'standard'
  },
  {
    id: 'tx-2',
    senderName: 'Anonymous Shell LLC',
    amount: 9900,
    location: 'Miami, FL',
    device: 'Virtual Router / TOR browser',
    velocityNotes: 'This is the 3rd transfer of $9,900 in 2 hours from the same originating account.',
    pepWatchlistMatch: false,
    notes: 'Structuring alert: Intentionally splitting transfers under the federal $10,000 Anti-Money Laundering (AML) reporting threshold.',
    isFraud: true,
    type: 'structuring'
  },
  {
    id: 'tx-3',
    senderName: 'Ivan Petrovich',
    amount: 15000,
    location: 'Nicosia, Cyprus',
    device: 'Desktop Chrome',
    pepWatchlistMatch: true,
    notes: 'PEP alert: Direct hit on high-ranking foreign official designated on active OFAC sanctions list.',
    isFraud: true,
    type: 'pep'
  },
  {
    id: 'tx-4',
    senderName: 'Jessica Miller',
    amount: 850,
    location: 'Minsk, Belarus',
    device: 'Android Emulator',
    velocityNotes: 'Last active 2 minutes ago in San Francisco, CA.',
    pepWatchlistMatch: false,
    notes: 'Impossible velocity speed: Physical device distance change exceeds maximum human flight speeds (5,000+ miles in 120 seconds).',
    isFraud: true,
    type: 'velocity'
  },
  {
    id: 'tx-5',
    senderName: 'Carlos Santano',
    amount: 120,
    location: 'Madrid, ES',
    device: 'iPad Air - verified',
    pepWatchlistMatch: false,
    notes: 'Standard utility bill payment with valid Multi-Factor Authentication token.',
    isFraud: false,
    type: 'standard'
  },
  {
    id: 'tx-6',
    senderName: 'Jane Smith',
    amount: 8500,
    location: 'Seattle, WA',
    device: 'New Device (Unrecognized)',
    pepWatchlistMatch: false,
    notes: 'Mule account behavior: Account opened 2 days ago. Received $8,500 from 5 unknown accounts in 24 hours, attempting immediate cash wire.',
    isFraud: true,
    type: 'mule'
  },
  {
    id: 'tx-7',
    senderName: 'Michael Chang',
    amount: 50,
    location: 'Pyongyang, KP',
    device: 'Unknown Browser',
    pepWatchlistMatch: false,
    notes: 'High-risk jurisdiction: Attempting to send/receive funds across comprehensively sanctioned OFAC region.',
    isFraud: true,
    type: 'jurisdiction'
  }
];

export function FraudGame({ onComplete }: FraudGameProps) {
  const [index, setIndex] = useState(0);
  const [decisions, setDecisions] = useState<{ [id: string]: 'approve' | 'block' }>({});
  const [resultsMode, setResultsMode] = useState(false);

  // Gamified metrics
  const [securedAssets, setSecuredAssets] = useState(1000000); // Start with $1M in safety treasury
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; correct: boolean } | null>(null);

  // Sync state with Express backend
  useEffect(() => {
    apiClient.loadSandboxState('fraud').then((res) => {
      if (res.stateData) {
        if (res.stateData.decisions) setDecisions(res.stateData.decisions);
        if (res.stateData.index !== undefined) setIndex(res.stateData.index);
        if (res.stateData.resultsMode !== undefined) setResultsMode(res.stateData.resultsMode);
        if (res.stateData.securedAssets !== undefined) setSecuredAssets(res.stateData.securedAssets);
        if (res.stateData.xp !== undefined) setXp(res.stateData.xp);
        if (res.stateData.streak !== undefined) setStreak(res.stateData.streak);
      }
    }).catch((err) => console.log('[Fraud Sandbox] Local state:', err));
  }, []);

  useEffect(() => {
    if (Object.keys(decisions).length > 0) {
      apiClient.saveSandboxState({
        sandboxType: 'fraud',
        stateData: { decisions, index, resultsMode, securedAssets, xp, streak },
        notes: 'AML & Fraud Detection Decisions'
      }).catch((err) => console.warn('[Fraud AutoSave Error]:', err));
    }
  }, [decisions, index, resultsMode, securedAssets, xp, streak]);

  const currentTx = TRANSACTIONS[index];

  const handleDecision = (decision: 'approve' | 'block') => {
    soundManager.playTick();
    const isCorrectBlock = currentTx.isFraud && decision === 'block';
    const isCorrectApprove = !currentTx.isFraud && decision === 'approve';
    const isCorrect = isCorrectBlock || isCorrectApprove;

    let points = 0;
    if (isCorrect) {
      points = 150 + streak * 30;
      setXp(prev => prev + points);
      setStreak(prev => prev + 1);
      setFeedback({ text: `IDENTIFIED SECURITY EVENT! +${points} XP (Streak: ${streak + 1}🔥)`, correct: true });
      soundManager.playSuccess();
    } else {
      setStreak(0);
      setSecuredAssets(prev => Math.max(0, prev - 150000)); // deduct $150k for bad decision (regulatory fine/chargeback)
      setFeedback({
        text: currentTx.isFraud
          ? `FRAUD LEAK! Fines and chargebacks incurred: -$150,000`
          : `FALSE POSITIVE! Blocked legitimate user transaction: -$150,000`,
        correct: false
      });
      soundManager.playFailure();
    }

    setDecisions(prev => ({ ...prev, [currentTx.id]: decision }));

    setTimeout(() => {
      setFeedback(null);
      if (index < TRANSACTIONS.length - 1) {
        setIndex(prev => prev + 1);
      } else {
        setResultsMode(true);
        soundManager.playWin();
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.8 }
        });
      }
    }, 1800);
  };

  const handleToggleMute = () => {
    const nextMuted = soundManager.toggleMute();
    setIsMuted(nextMuted);
  };

  const getAnalytics = () => {
    let score = 100;
    let mistakes: string[] = [];
    let blockedFraud = 0;
    let falseAlarms = 0;

    TRANSACTIONS.forEach(tx => {
      const decision = decisions[tx.id];
      if (tx.isFraud) {
        if (decision === 'block') {
          blockedFraud++;
        } else {
          score -= 25;
          mistakes.push(`Let fraud slip: Approved ${tx.senderName}'s transaction representing ${tx.type}.`);
        }
      } else {
        if (decision === 'block') {
          score -= 15;
          falseAlarms++;
          mistakes.push(`False alarm: Blocked verified transaction of $${tx.amount} from ${tx.senderName}.`);
        }
      }
    });

    return { score: Math.max(0, score), mistakes, blockedFraud, falseAlarms };
  };

  const { score, mistakes, blockedFraud, falseAlarms } = getAnalytics();
  const isWinner = score >= 70;

  return (
    <div className="bg-[#0b0f19] text-white rounded-3xl shadow-2xl border border-slate-800 overflow-hidden">
      {/* Header Deck with audio settings and gamified values */}
      <div className="bg-gradient-to-r from-[#0b0f19] via-[#101726] to-[#0b0f19] p-6 border-b border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-400">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-white tracking-tight">AML Risk Intelligence Deck</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  REAL-TIME RISK UNIT
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Evaluate live payment metadata, detect sanctions & protect financial rails</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-center">
            {/* Secured Capital Indicator */}
            <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400">Treasury:</span>
              <span className={`font-black ${securedAssets > 500000 ? 'text-emerald-400' : 'text-rose-400'}`}>
                ${securedAssets.toLocaleString()}
              </span>
            </div>

            {/* XP Points */}
            <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-indigo-400 font-bold font-mono">
              <Award className="w-3.5 h-3.5 text-indigo-400" />
              <span>{xp} XP</span>
            </div>

            {/* Streak indicator */}
            {streak > 0 && (
              <div className="flex items-center gap-1 bg-amber-500/10 text-amber-300 px-2.5 py-1.5 rounded-xl border border-amber-500/20 text-xs font-bold font-mono animate-pulse">
                <Zap className="w-3.5 h-3.5" />
                <span>{streak}x</span>
              </div>
            )}

            <button
              onClick={handleToggleMute}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-all"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {!resultsMode ? (
        <div className="p-6 space-y-6 relative">
          
          {/* Real-time floating feedback animations */}
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

          {/* Card Module Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Card 1: Interactive Transaction Profile Card */}
            <motion.div 
              key={currentTx.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="lg:col-span-7 bg-slate-900/40 rounded-2xl p-6 border border-slate-800/80 shadow-xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-md">
                    {currentTx.senderName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white tracking-tight">{currentTx.senderName}</h4>
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                      <Globe className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{currentTx.location}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs uppercase tracking-wider text-slate-500 font-bold block font-mono">Transaction Value</span>
                  <span className="text-2xl font-black text-emerald-400 font-mono">${currentTx.amount.toLocaleString()}</span>
                </div>
              </div>

              {/* Security Indicators Grid & SONAR CYBER RADAR (Gamified Visuals) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Holographic Signal Sonar Radar UI component */}
                <div className="bg-slate-950 rounded-xl p-4 border border-slate-850 flex flex-col items-center justify-center relative overflow-hidden h-36">
                  {/* Radar Circles and sweeping scanline */}
                  <div className="absolute w-28 h-28 border border-indigo-500/10 rounded-full flex items-center justify-center">
                    <div className="w-20 h-20 border border-indigo-500/20 rounded-full flex items-center justify-center">
                      <div className="w-12 h-12 border border-indigo-500/35 rounded-full flex items-center justify-center">
                        <Fingerprint className="w-6 h-6 text-indigo-400 animate-pulse" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Sweeping scanline line */}
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-indigo-500/0 w-full h-full animate-pulse pointer-events-none" />
                  
                  {/* Tiny signal dot */}
                  <div className="absolute top-8 right-12 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
                  {currentTx.isFraud && <div className="absolute bottom-10 left-10 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />}

                  <span className="text-xs text-slate-500 uppercase tracking-widest font-mono z-10 mt-auto">IDENTITY SCANNER RADAR</span>
                </div>

                <div className="space-y-3">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-850">
                    <span className="text-xs text-slate-500 font-bold uppercase block mb-1 font-mono">Device Fingerprint</span>
                    <div className="flex items-center gap-2 font-medium text-slate-300 text-xs">
                      <Fingerprint className="w-4 h-4 text-purple-400" />
                      <span>{currentTx.device}</span>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-850">
                    <span className="text-xs text-slate-500 font-bold uppercase block mb-1 font-mono">Sanctions Screening</span>
                    <div className={`flex items-center gap-2 font-black text-xs ${currentTx.pepWatchlistMatch ? 'text-rose-400' : 'text-emerald-400'}`}>
                      <Lock className="w-4 h-4" />
                      <span>{currentTx.pepWatchlistMatch ? 'PEP / OFAC MATCH' : 'CLEARED SECURE'}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Alert Triggers Card */}
              {currentTx.velocityNotes && (
                <div className="bg-rose-950/30 border border-rose-500/20 rounded-xl p-4 text-xs text-rose-300 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold block text-rose-200">VELOCITY / DISTANCE ANOMALY DETECTED</strong>
                    <span>{currentTx.velocityNotes}</span>
                  </div>
                </div>
              )}

              {currentTx.pepWatchlistMatch && (
                <div className="bg-amber-950/30 border border-amber-500/20 rounded-xl p-4 text-xs text-amber-300 flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold block text-amber-200 font-mono">POLITICALLY EXPOSED PERSON (PEP) MATCH</strong>
                    <span>Identity matches active OFAC global sanctions registry for political actors or foreign officials.</span>
                  </div>
                </div>
              )}

              {/* Risk Summary Notes */}
              <div className="bg-slate-950 rounded-xl p-4 border border-slate-850">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1 font-mono">Behavioral Analyst Notes</span>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">{currentTx.notes}</p>
              </div>
            </motion.div>

            {/* Card 2: Regulatory Intelligence & Interactive Decision Module */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
              
              <div className="bg-slate-900/40 rounded-2xl p-5 border border-slate-800 space-y-4">
                <div className="flex items-center gap-2.5 text-indigo-400 font-bold text-xs font-mono">
                  <Brain className="w-4 h-4 text-indigo-400" />
                  <span>Compliance Intelligence Guide</span>
                </div>
                
                <p className="text-xs text-slate-300 leading-relaxed">
                  Under the <strong>Bank Secrecy Act (BSA)</strong> and <strong>USA PATRIOT Act</strong>, fintech companies must block structuring (evading $10,000 CTR filings), money mule wires, comprehensively sanctioned jurisdictions, and political actor matches.
                </p>

                <div className="bg-slate-950 rounded-xl p-3 border border-slate-850 text-xs text-slate-400 space-y-1.5 font-mono">
                  <div className="flex justify-between">
                    <span>Structuring Rule:</span>
                    <span className="text-slate-200">$10,000 Federal Limit</span>
                  </div>
                  <div className="flex justify-between">
                    <span>OFAC Screening:</span>
                    <span className="text-slate-200">Mandatory SDN Screen</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Server Status:</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Server className="w-3 h-3 text-emerald-400" /> SECURE
                    </span>
                  </div>
                </div>
              </div>

              {/* Decision Action Buttons */}
              <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 space-y-3 shadow-md">
                <span className="text-xs font-bold text-slate-300 block text-center font-mono">SELECT COMPLIANCE DISPOSITION:</span>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleDecision('block')}
                    className="flex items-center justify-center gap-2 py-4 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-lg shadow-rose-900/30 transition-all active:scale-95 cursor-pointer uppercase tracking-wider"
                  >
                    <AlertOctagon className="w-4 h-4" /> Block & Report
                  </button>
                  <button
                    onClick={() => handleDecision('approve')}
                    className="flex items-center justify-center gap-2 py-4 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-900/30 transition-all active:scale-95 cursor-pointer uppercase tracking-wider"
                  >
                    <ShieldCheck className="w-4 h-4" /> Approve Wire
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      ) : (
        /* Results Mode Card */
        <div className="p-8 space-y-8">
          <div className="text-center space-y-2">
            <h4 className="text-3xl font-black text-white">Compliance Audit Completed</h4>
            <p className="text-slate-400 text-xs font-mono uppercase tracking-wider">Evaluation score based on Bank Secrecy Act & FinCEN compliance standards</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-center space-y-1">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block font-mono">Audit Score</span>
              <span className={`text-4xl font-black ${score >= 70 ? 'text-emerald-400' : 'text-rose-400'}`}>{score} / 100</span>
            </div>
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-center space-y-1">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block font-mono">Assets Saved</span>
              <span className="text-4xl font-black text-emerald-400 font-mono">${securedAssets.toLocaleString()}</span>
            </div>
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-center space-y-1">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block font-mono">Blocked Crimes</span>
              <span className="text-4xl font-black text-indigo-400">{blockedFraud} / {TRANSACTIONS.filter(tx => tx.isFraud).length}</span>
            </div>
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-center space-y-1">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block font-mono">False Alarms</span>
              <span className="text-4xl font-black text-amber-400">{falseAlarms}</span>
            </div>
          </div>

          <div className="bg-slate-900/60 rounded-2xl p-6 border border-slate-800 space-y-3">
            <h5 className="font-bold text-white text-sm font-mono">Detailed Auditor Findings:</h5>
            {mistakes.length === 0 ? (
              <div className="flex gap-3 text-emerald-300 font-semibold text-sm bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">
                <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Flawless screening! You correctly flagged AML structuring, impossible velocities, shell mules, and political PEP matches without blocking legitimate customer payments.</span>
              </div>
            ) : (
              <div className="space-y-2">
                {mistakes.map((m, i) => (
                  <div key={i} className="flex gap-3 text-rose-300 text-xs bg-rose-500/10 p-3.5 rounded-xl border border-rose-500/20">
                    <X className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>{m}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-800">
            {!isWinner && (
              <button
                onClick={() => {
                  soundManager.playTick();
                  setIndex(0);
                  setDecisions({});
                  setResultsMode(false);
                  setSecuredAssets(1000000);
                  setXp(0);
                  setStreak(0);
                }}
                className="flex-1 bg-slate-850 hover:bg-slate-800 text-slate-200 py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 border border-slate-700 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" /> Try Screening Again
              </button>
            )}
            <button
              onClick={onComplete}
              disabled={!isWinner}
              className={`flex-grow py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 shadow-lg ${isWinner ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 cursor-pointer' : 'bg-slate-850 text-slate-500 cursor-not-allowed'}`}
            >
              {isWinner ? 'Complete AML Module' : 'Achieve Score >= 70 to Unlock'} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
