import { lazy, Suspense } from 'react';
import confetti from 'canvas-confetti';
import { ArrowLeft } from 'lucide-react';
import { LoadingFallback } from './LoadingFallback';

const TradingGame = lazy(() => import('./TradingGame').then(m => ({ default: m.TradingGame })));
const UnderwritingGame = lazy(() => import('./UnderwritingGame').then(m => ({ default: m.UnderwritingGame })));
const ParametricGame = lazy(() => import('./ParametricGame').then(m => ({ default: m.ParametricGame })));
const FraudGame = lazy(() => import('./FraudGame').then(m => ({ default: m.FraudGame })));
const PopQuizGame = lazy(() => import('./PopQuizGame').then(m => ({ default: m.PopQuizGame })));

interface Props {
  activeDirectGame: string | null;
  onAddXp: (amount: number, reason?: string) => void;
  onBackToDashboard: () => void;
}

export function StandaloneGameView({ activeDirectGame, onAddXp, onBackToDashboard }: Props) {
  const handleStandaloneGameComplete = () => {
    onAddXp(150);
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.5 }
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-2">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-900 text-xs font-black uppercase tracking-wider">
            <span>EDUCATIONAL GAME TERMINAL</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Interactive Educational Game Workspace</h2>
        </div>
        
        <button
          onClick={onBackToDashboard}
          className="flex items-center text-slate-700 dark:text-slate-300 font-bold hover:text-slate-900 dark:hover:text-white transition-colors bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl text-xs cursor-pointer shadow-3xs"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span>Return to Syllabus</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
        <Suspense fallback={<LoadingFallback label="Loading game..." />}>
          {activeDirectGame === 'trading' && <TradingGame onComplete={handleStandaloneGameComplete} />}
          {activeDirectGame === 'underwriting' && <UnderwritingGame onComplete={handleStandaloneGameComplete} />}
          {activeDirectGame === 'parametric' && <ParametricGame onComplete={handleStandaloneGameComplete} />}
          {activeDirectGame === 'fraud' && <FraudGame onComplete={handleStandaloneGameComplete} />}
          {activeDirectGame === 'popquiz' && <PopQuizGame onComplete={handleStandaloneGameComplete} onExit={onBackToDashboard} />}
        </Suspense>
      </div>
    </div>
  );
}
