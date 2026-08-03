import React, { useState, useEffect, lazy, Suspense } from 'react';
import { 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ArrowRight, 
  BrainCircuit, 
  Star, 
  Coins, 
  Flame, 
  Target, 
  BarChart2, 
  RotateCcw,
  Volume2,
  VolumeX,
  Zap,
  Users,
  PhoneCall,
  ShieldCheck,
  DollarSign,
  Clock,
  Tv,
  Sparkles,
  HelpCircle,
  Lock,
  ChevronRight,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import confetti from 'canvas-confetti';
import { courseModules } from '../data/courseData';
import { EXTENDED_QUIZ_BANK, ExtendedQuizQuestion } from '../data/extendedQuizBank';
const DiagramRenderer = lazy(() => import('./DiagramRenderer').then(m => ({ default: m.DiagramRenderer })));
import { useQuizGameStore } from '../game/quizGameStore';
import { useQuizTimer, useQuizDerived, useResultsDashboard } from '../game/quizHooks';
import { MONEY_LADDER } from '../game/quizEngine';

// Master Question Pool (> 150 questions!)
const MASTER_QUIZ_BANK: ExtendedQuizQuestion[] = [
  ...EXTENDED_QUIZ_BANK,
  ...courseModules.flatMap(mod => 
    mod.lessons.flatMap(lesson => 
      lesson.quiz ? lesson.quiz.map((q, idx) => ({
        id: `cm-${lesson.id}-q${idx}`,
        category: mod.title.split('.')[1]?.trim() || mod.title,
        points: mod.level === 'expert' ? 500 : mod.level === 'intermediate' ? 300 : 100,
        question: q.question,
        options: q.options,
        correctIndex: q.correctAnswer,
        explanation: q.explanation
      })) : []
    )
  )
];

// Web Audio API Synthesizer for TV Game Show Sound Effects
class QuizAudioEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      /* v8 ignore next -- @preserve resume rejection is a deliberate no-op */
      this.ctx.resume().catch(() => {});
    }
  }

  public playTick() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch {
      // Audio fallback
    }
  }

  public playLockIn() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, this.ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.2);
    } catch {
      // Audio fallback
    }
  }

  public playCorrect() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.2, this.ctx!.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + i * 0.08 + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(this.ctx!.currentTime + i * 0.08);
        osc.stop(this.ctx!.currentTime + i * 0.08 + 0.3);
      });
    } catch {
      // Audio fallback
    }
  }

  public playWrong() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(90, this.ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.45);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.45);
    } catch {
      // Audio fallback
    }
  }

  public playLifeline() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.35);
    } catch {
      // Audio fallback
    }
  }
}

const quizAudio = new QuizAudioEngine();

export interface PopQuizGameProps {
  onComplete: (score: number) => void;
  onExit: () => void;
}

export function PopQuizGame({ onComplete, onExit }: PopQuizGameProps) {
  // Store integration
  const masterBank = useQuizGameStore(s => s.masterBank);
  const quizBank = useQuizGameStore(s => s.quizBank);
  const gameMode = useQuizGameStore(s => s.gameMode);
  const currentQuestionIndex = useQuizGameStore(s => s.currentQuestionIndex);
  const currentTierIndex = useQuizGameStore(s => s.currentTierIndex);
  const score = useQuizGameStore(s => s.score);
  const streak = useQuizGameStore(s => s.streak);
  const maxStreak = useQuizGameStore(s => s.maxStreak);
  const correctCount = useQuizGameStore(s => s.correctCount);
  const timeLeft = useQuizGameStore(s => s.timeLeft);
  const soundEnabled = useQuizGameStore(s => s.soundEnabled);
  const gameOver = useQuizGameStore(s => s.gameOver);
  const isAnswered = useQuizGameStore(s => s.isAnswered);
  const selectedOption = useQuizGameStore(s => s.selectedOption);
  const pendingOption = useQuizGameStore(s => s.pendingOption);
  const disabledOptions = useQuizGameStore(s => s.disabledOptions);
  const safeHavenPrize = useQuizGameStore(s => s.safeHavenPrize);
  const accumulatedPrize = useQuizGameStore(s => s.accumulatedPrize);
  const isWalkedAway = useQuizGameStore(s => s.isWalkedAway);
  const lifelines = useQuizGameStore(s => s.lifelines);
  const audiencePoll = useQuizGameStore(s => s.audiencePoll);
  const expertAdvice = useQuizGameStore(s => s.expertAdvice);

  const setMasterBank = useQuizGameStore(s => s.setMasterBank);
  const startSession = useQuizGameStore(s => s.startSession);
  const setPendingOption = useQuizGameStore(s => s.setPendingOption);
  const lockAnswer = useQuizGameStore(s => s.lockAnswer);
  const nextQuestion = useQuizGameStore(s => s.nextQuestion);
  const walkAway = useQuizGameStore(s => s.walkAway);
  const use5050 = useQuizGameStore(s => s.use5050);
  const useAskAudience = useQuizGameStore(s => s.useAskAudience);
  const usePhoneExpert = useQuizGameStore(s => s.usePhoneExpert);
  const setSoundEnabled = useQuizGameStore(s => s.setSoundEnabled);

  const [showAudienceModal, setShowAudienceModal] = useState(false);
  const [showExpertModal, setShowExpertModal] = useState(false);
  const [isLockingIn, setIsLockingIn] = useState(false);

  // Hook for timer countdown
  useQuizTimer();
  const { question } = useQuizDerived();
  const { analytics, categoryStats, sessionBestMillionaire, sessionBestSpeed } = useResultsDashboard();

  // Initialize master bank & session on mount
  useEffect(() => {
    if (masterBank.length === 0) {
      setMasterBank(MASTER_QUIZ_BANK);
    }
  }, [masterBank.length, setMasterBank]);

  useEffect(() => {
    if (masterBank.length > 0 && quizBank.length === 0) {
      startSession(gameMode);
    }
  }, [masterBank, quizBank.length, startSession, gameMode]);

  useEffect(() => {
    quizAudio.enabled = soundEnabled;
  }, [soundEnabled]);

  // Audio tick sound when timer <= 5s
  useEffect(() => {
    if (timeLeft > 0 && timeLeft <= 5 && !isAnswered && !gameOver) {
      quizAudio.playTick();
    }
  }, [timeLeft, isAnswered, gameOver]);

  // Select Option
  const handleSelectOption = (idx: number) => {
    /* v8 ignore next -- @preserve UI already disables options once answered/locked in */
    if (isAnswered || isLockingIn || disabledOptions.includes(idx) || !question) return;
    setPendingOption(idx);
    quizAudio.playLockIn();
  };

  // Lock In Final Answer
  const handleLockIn = () => {
    /* v8 ignore next -- @preserve lock-in button is disabled until an answer is selected */
    if (pendingOption === null || isAnswered || isLockingIn || !question) return;
    setIsLockingIn(true);
    setTimeout(() => {
      setIsLockingIn(false);
      const res = lockAnswer();
      if (res?.correct) {
        quizAudio.playCorrect();
        confetti({
          particleCount: 50 + currentTierIndex * 10,
          spread: 70,
          origin: { y: 0.7 },
          colors: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899']
        });
      } else {
        quizAudio.playWrong();
      }
    }, 1200);
  };

  // Proceed
  const handleProceed = () => {
    nextQuestion();
  };

  // Walk Away
  const handleWalkAway = () => {
    walkAway();
    quizAudio.playLifeline();
  };

  // Lifelines
  const handle5050 = () => {
    /* v8 ignore next -- @preserve 50:50 button is disabled once used or answered */
    if (!lifelines.fiftyFifty || isAnswered) return;
    use5050();
    quizAudio.playLifeline();
  };

  const handleAskAudience = () => {
    /* v8 ignore next -- @preserve ask-audience button is disabled once used or answered */
    if (!lifelines.askAudience || isAnswered) return;
    useAskAudience();
    setShowAudienceModal(true);
    quizAudio.playLifeline();
  };

  const handlePhoneExpert = () => {
    /* v8 ignore next -- @preserve phone-a-friend button is disabled once used or answered */
    if (!lifelines.phoneExpert || isAnswered) return;
    usePhoneExpert();
    setShowExpertModal(true);
    quizAudio.playLifeline();
  };

  if (quizBank.length === 0 || !question) {
    return (
      <div className="p-12 text-center text-slate-400 font-medium">
        <BrainCircuit className="w-8 h-8 animate-spin mx-auto mb-3 text-amber-500" />
        Preparing TV Studio Game Show questions...
      </div>
    );
  }

  // GAME OVER / SUMMARY SCREEN
  if (gameOver) {
    const isGrandWinner = currentTierIndex === 14 && isAnswered && selectedOption === question.correctIndex;
    const finalPrizeEarned = isWalkedAway ? accumulatedPrize : isGrandWinner ? '$1,000,000' : safeHavenPrize;

    return (
      <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-12 pt-4 px-2">
        <div className="bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 border border-amber-500/40 rounded-3xl p-8 md:p-12 shadow-2xl text-center text-white relative overflow-hidden">
          
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="w-24 h-24 bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl border-4 border-amber-300">
            {isGrandWinner ? <Trophy className="w-12 h-12" /> : <Award className="w-12 h-12" />}
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{isGrandWinner ? 'FINTECH GRAND CHAMPION' : isWalkedAway ? 'WALKED AWAY WITH PRIZE' : 'SHOW COMPLETE'}</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-black font-display text-white mb-2 tracking-tight">
            {isGrandWinner ? '🎉 $1,000,000 WINNER! 🎉' : `You Won ${finalPrizeEarned}!`}
          </h2>

          <p className="text-slate-300 max-w-lg mx-auto text-sm md:text-base mb-8">
            {gameMode === 'millionaire' 
              ? `You navigated ${currentQuestionIndex + 1} high-stakes FinTech questions under live studio lighting.`
              : `You completed 20 randomized speed-round assessment questions.`
            }
          </p>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 text-slate-900 dark:text-white">
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-1">Total Winnings</span>
              <div className="text-2xl md:text-3xl font-black text-amber-400 flex items-center justify-center gap-1">
                <DollarSign className="w-5 h-5" />
                {gameMode === 'millionaire' ? finalPrizeEarned.replace('$', '') : score}
              </div>
            </div>

            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-1">Correct Answers</span>
              <div className="text-2xl md:text-3xl font-black text-emerald-400">
                {correctCount} / {quizBank.length}
              </div>
            </div>

            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-1">Max Streak</span>
              <div className="text-2xl md:text-3xl font-black text-blue-400 flex items-center justify-center gap-1">
                <Flame className="w-5 h-5 fill-current text-amber-500" />
                {maxStreak}
              </div>
            </div>

            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-1">Accuracy</span>
              <div className="text-2xl md:text-3xl font-black text-purple-400">
                {analytics.accuracyPct.toFixed(0)}%
              </div>
            </div>
          </div>

          {/* Analytics Breakdown */}
          {Object.keys(categoryStats).length > 0 && (
            <div className="bg-slate-950/60 p-6 rounded-2xl border border-slate-800/80 text-left mb-8 space-y-3">
              <span className="text-xs font-black uppercase text-amber-400 tracking-wider block">Category Mastery Breakdown</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(categoryStats).map(([cat, stat]) => {
                  const pct = Math.round((stat.correct / stat.total) * 100);
                  return (
                    <div key={cat} className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                      <span className="font-bold text-slate-200 truncate pr-2">{cat}</span>
                      <span className="font-mono text-emerald-400 font-bold">{stat.correct}/{stat.total} ({pct}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => startSession('millionaire')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg hover:scale-105 active:scale-95"
            >
              <Tv className="w-4 h-4" />
              <span>Play TV Show Mode Again</span>
            </button>

            <button
              onClick={() => startSession('speed')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer border border-slate-700"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Play Speed Practice Mode</span>
            </button>

            <button
              onClick={() => {
                onComplete(score);
                onExit();
              }}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs uppercase tracking-wider transition-colors border border-slate-800 cursor-pointer"
            >
              Return to Curriculum
            </button>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-12 pt-2 px-2">
      
      {/* TV GAME SHOW HEADER BAR */}
      <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-4 md:p-6 text-white shadow-2xl flex flex-wrap items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

        {/* Title & Mode Switch */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center font-black shadow-lg">
            <Tv className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-widest text-amber-400">FinTech Game Show</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 uppercase font-bold">
                {gameMode === 'millionaire' ? 'TV Millionaire Rules' : 'Speed Practice'}
              </span>
            </div>
            <h1 className="text-lg md:text-xl font-black font-display tracking-tight text-white">Who Wants to Be a FinTech Founder?</h1>
          </div>
        </div>

        {/* Control Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => startSession(gameMode === 'millionaire' ? 'speed' : 'millionaire')}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
            title="Toggle Game Mode"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Switch to {gameMode === 'millionaire' ? 'Speed Mode' : 'TV Show Mode'}</span>
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
            title={soundEnabled ? 'Mute Studio Audio' : 'Enable Studio Audio'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          <button
            onClick={onExit}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
            title="Exit Game"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* MAIN GAME STAGE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* LEFT & CENTER STAGE (3 Columns) */}
        <div className="lg:col-span-3 space-y-6">

          {/* LIFELINES BAR */}
          {gameMode === 'millionaire' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex items-center justify-between gap-2 shadow-lg">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest px-2 hidden sm:inline">Studio Lifelines:</span>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-around">
                {/* Lifeline 1: 50:50 */}
                <button
                  onClick={handle5050}
                  disabled={!lifelines.fiftyFifty || isAnswered}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer border shadow-sm",
                    lifelines.fiftyFifty && !isAnswered
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500 hover:text-slate-950 hover:scale-105 active:scale-95"
                      : "bg-slate-950 text-slate-600 border-slate-800 cursor-not-allowed opacity-50 line-through"
                  )}
                >
                  <Coins className="w-4 h-4" />
                  <span>50 : 50</span>
                </button>

                {/* Lifeline 2: Ask Audience */}
                <button
                  onClick={handleAskAudience}
                  disabled={!lifelines.askAudience || isAnswered}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer border shadow-sm",
                    lifelines.askAudience && !isAnswered
                      ? "bg-purple-500/20 text-purple-300 border-purple-500/40 hover:bg-purple-500 hover:text-white hover:scale-105 active:scale-95"
                      : "bg-slate-950 text-slate-600 border-slate-800 cursor-not-allowed opacity-50 line-through"
                  )}
                >
                  <Users className="w-4 h-4" />
                  <span>Audience Poll</span>
                </button>

                {/* Lifeline 3: Phone Expert */}
                <button
                  onClick={handlePhoneExpert}
                  disabled={!lifelines.phoneExpert || isAnswered}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer border shadow-sm",
                    lifelines.phoneExpert && !isAnswered
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500 hover:text-slate-950 hover:scale-105 active:scale-95"
                      : "bg-slate-950 text-slate-600 border-slate-800 cursor-not-allowed opacity-50 line-through"
                  )}
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Phone Expert</span>
                </button>
              </div>

              {/* Walk Away Option */}
              <button
                onClick={handleWalkAway}
                disabled={isAnswered || currentTierIndex === 0}
                className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-red-950/50 text-red-400 font-bold text-xs flex items-center gap-1 border border-slate-800 hover:border-red-500/40 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                title="Walk Away with accumulated winnings"
              >
                <span>Walk Away</span>
              </button>
            </div>
          )}

          {/* MAIN QUESTION DISPLAY CARD */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 text-white shadow-2xl relative overflow-hidden space-y-6">
            
            {/* Top Bar: Question #, Category, Countdown */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
                  Q {currentQuestionIndex + 1} / {quizBank.length}
                </span>
                <span className="text-xs font-bold text-slate-400 truncate max-w-[200px] sm:max-w-xs">
                  {question.category}
                </span>
              </div>

              {/* Countdown Timer */}
              <div className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono font-black border transition-all",
                timeLeft <= 5 
                  ? "bg-red-500/20 text-red-400 border-red-500/50 animate-pulse scale-105" 
                  : "bg-slate-950 text-slate-300 border-slate-800"
              )}>
                <Clock className="w-3.5 h-3.5" />
                <span>{timeLeft}s</span>
              </div>
            </div>

            {/* Question Text */}
            <div className="space-y-4">
              <h2 className="text-lg md:text-2xl font-black font-display text-white leading-snug">
                {question.question}
              </h2>

              {/* Optional Architecture / Network Diagram */}
              {question.diagram && (
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <Suspense fallback={<div className="h-48 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />}><DiagramRenderer diagram={question.diagram} /></Suspense>
                </div>
              )}
            </div>

            {/* 4 MULTIPLE CHOICE OPTION CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {question.options.map((optText, idx) => {
                const letter = String.fromCharCode(65 + idx);
                const isDisabled = disabledOptions.includes(idx);
                const isPending = pendingOption === idx;
                const isSelected = selectedOption === idx;
                const isCorrect = question.correctIndex === idx;

                let cardStyle = "bg-slate-950/80 border-slate-800 text-slate-200 hover:border-amber-500/60 hover:bg-slate-800/80";

                if (isDisabled) {
                  cardStyle = "bg-slate-950/30 border-slate-900 text-slate-700 cursor-not-allowed opacity-30";
                } else if (isLockingIn && isPending) {
                  cardStyle = "bg-amber-500 text-slate-950 font-black border-amber-400 animate-pulse shadow-lg scale-102";
                } else if (isAnswered) {
                  if (isCorrect) {
                    cardStyle = "bg-emerald-500 text-slate-950 font-black border-emerald-400 shadow-lg shadow-emerald-500/20";
                  } else if (isSelected) {
                    cardStyle = "bg-red-500 text-white font-black border-red-400 shadow-lg shadow-red-500/20";
                  } else {
                    cardStyle = "bg-slate-950/40 border-slate-900 text-slate-600 opacity-40";
                  }
                } else if (isPending) {
                  cardStyle = "bg-amber-500/20 text-amber-300 border-amber-400 ring-2 ring-amber-400/40 shadow-md";
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    disabled={isAnswered || isLockingIn || isDisabled}
                    className={cn(
                      "p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 relative overflow-hidden group min-h-[64px]",
                      cardStyle
                    )}
                  >
                    <span className={cn(
                      "w-7 h-7 rounded-xl flex items-center justify-center font-mono text-xs font-black shrink-0 border transition-all",
                      isLockingIn && isPending ? "bg-slate-950 text-amber-400 border-slate-950" :
                      isAnswered && isCorrect ? "bg-slate-950 text-emerald-400 border-slate-950" :
                      isAnswered && isSelected ? "bg-slate-950 text-red-400 border-slate-950" :
                      isPending ? "bg-amber-400 text-slate-950 border-amber-400" :
                      "bg-slate-900 text-slate-400 border-slate-800 group-hover:text-amber-400 group-hover:border-amber-500/40"
                    )}>
                      {letter}
                    </span>

                    <span className="text-xs md:text-sm font-bold pt-1 leading-relaxed">
                      {optText}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* ACTION CONFIRMATION BAR */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-4">
              <div className="text-xs text-slate-400 font-medium">
                {isLockingIn ? (
                  <span className="text-amber-400 font-bold flex items-center gap-1.5 animate-pulse">
                    <Sparkles className="w-4 h-4" /> Locking in final answer...
                  </span>
                ) : isAnswered ? (
                  <span className={selectedOption === question.correctIndex ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>
                    {selectedOption === question.correctIndex ? '✓ Correct Answer!' : '✕ Incorrect Answer'}
                  </span>
                ) : pendingOption !== null ? (
                  <span className="text-amber-300 font-bold">Press "Lock In Final Answer" to confirm.</span>
                ) : (
                  <span>Select an option above to test your knowledge.</span>
                )}
              </div>

              {!isAnswered ? (
                <button
                  onClick={handleLockIn}
                  disabled={pendingOption === null || isLockingIn}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Lock In Final Answer</span>
                </button>
              ) : (
                <button
                  onClick={handleProceed}
                  className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg hover:scale-105 active:scale-95"
                >
                  <span>Proceed to Next Question</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* EXPLANATION BOX (WHEN ANSWERED) */}
            <AnimatePresence>
              {isAnswered && question.explanation && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-950 p-4 rounded-2xl border border-blue-500/30 text-xs text-slate-300 space-y-1"
                >
                  <span className="text-xs font-black uppercase text-blue-400 tracking-wider block">🎓 FinTech Industry Context:</span>
                  <p className="leading-relaxed text-slate-200">{question.explanation}</p>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>

        {/* RIGHT COLUMN: TV MONEY LADDER TIERS */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-white shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                <Trophy className="w-4 h-4" />
                Prize Ladder
              </span>
              <span className="text-xs font-mono font-bold text-slate-400">
                Safe: {safeHavenPrize}
              </span>
            </div>

            {/* 15 Tiers Ladder */}
            <div className="space-y-1.5 flex flex-col-reverse font-mono">
              {MONEY_LADDER.map((tier, idx) => {
                const isCurrent = currentTierIndex === idx;
                const isPassed = currentTierIndex > idx;

                let tierStyle = "bg-slate-950/60 text-slate-500 border border-transparent";
                if (isCurrent) {
                  tierStyle = "bg-amber-500 text-slate-950 font-black border-amber-300 shadow-md scale-102 ring-2 ring-amber-400/50";
                } else if (isPassed) {
                  tierStyle = "bg-emerald-950/40 text-emerald-400 border border-emerald-900/50 font-bold";
                } else if (tier.safe) {
                  tierStyle = "text-amber-300 font-bold border border-amber-500/20 rounded-lg bg-amber-950/10";
                }

                return (
                  <div
                    key={tier.level}
                    className={cn(
                      "px-3 py-1.5 rounded-xl flex items-center justify-between transition-all text-xs",
                      tierStyle
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-4 text-right text-slate-500 font-mono text-xs">{tier.level}</span>
                      {tier.safe && <ShieldCheck className="w-3 h-3 text-amber-400 shrink-0" />}
                    </div>
                    <span className="font-black tracking-tight">{tier.prize}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* AUDIENCE POLL MODAL DIALOG */}
      <AnimatePresence>
        {showAudienceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-purple-500/50 rounded-3xl p-6 md:p-8 max-w-lg w-full text-white shadow-2xl space-y-6"
            >
              <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg">FinTech Audience Poll</h3>
                    <span className="text-xs text-slate-400">1,250 Studio Audience Votes</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowAudienceModal(false)}
                  className="text-slate-400 hover:text-white font-mono text-xs px-2 py-1 bg-slate-800 rounded-lg cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>

              {/* Bar Chart Breakdown */}
              <div className="space-y-4">
                {[0, 1, 2, 3].map((idx) => {
                  const letter = String.fromCharCode(65 + idx);
                  const pct = audiencePoll[idx] || 0;
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold font-mono">
                        <span className="text-purple-300">Option {letter}</span>
                        <span className="text-white">{pct}%</span>
                      </div>
                      <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setShowAudienceModal(false)}
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                Return to Stage
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PHONE AN EXPERT MODAL DIALOG */}
      <AnimatePresence>
        {showExpertModal && expertAdvice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-emerald-500/50 rounded-3xl p-6 md:p-8 max-w-lg w-full text-white shadow-2xl space-y-6"
            >
              <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
                    <PhoneCall className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg">{expertAdvice.name}</h3>
                    <span className="text-xs text-slate-400">{expertAdvice.title}</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowExpertModal(false)}
                  className="text-slate-400 hover:text-white font-mono text-xs px-2 py-1 bg-slate-800 rounded-lg cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-sm">
                <span className="text-xs font-black uppercase text-emerald-400 tracking-wider block">📞 Live Phone Call Advice:</span>
                <p className="text-slate-200 italic leading-relaxed">"{expertAdvice.quote}"</p>
              </div>

              <button
                onClick={() => setShowExpertModal(false)}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                Thank You, Expert!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
