import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, CheckCircle2, RefreshCw, ArrowRight } from 'lucide-react';
import { buildQuizCards, recordReview, getDueCards, getReviewStats, ReviewCard } from '../lib/spacedRepetition';

export function ReviewCards() {
  const [cards, setCards] = useState<ReviewCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [completed, setCompleted] = useState<string[]>([]);
  const [stats, setStats] = useState(getReviewStats());

  const loadDueCards = useCallback(() => {
    const dueEntries = getDueCards();
    const allCards = buildQuizCards();
    const dueCards = allCards.filter(c => dueEntries.some(e => e.cardId === c.id));
    const newCards = allCards.filter(c => !dueEntries.some(e => e.cardId === c.id));

    if (dueCards.length > 0) {
      setCards(dueCards);
    } else if (newCards.length > 0) {
      setCards(newCards.slice(0, 5));
    } else {
      /* v8 ignore next -- @preserve random fallback only when the due/new pools are both empty */
      setCards(allCards.sort(() => Math.random() - 0.5).slice(0, 5));
    }
    setCurrentIndex(0);
    setFlipped(false);
    setCompleted([]);
  }, []);

  useEffect(() => {
    loadDueCards();
  }, [loadDueCards]);

  const handleRate = (quality: number) => {
    /* v8 ignore next -- @preserve rating buttons only render with a non-empty deck */
    if (cards.length === 0) return;
    const card = cards[currentIndex];
    recordReview(card.id, quality);
    setCompleted(prev => [...prev, card.id]);
    setStats(getReviewStats());

    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setFlipped(false);
    } else {
      setTimeout(() => loadDueCards(), 500);
    }
  };

  if (cards.length === 0 || completed.length === cards.length) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">All Caught Up!</h3>
        <p className="text-sm text-slate-500 mb-4">
          {stats.total > 0
            ? `${stats.reviewed} cards reviewed. ${stats.total} total in rotation.`
            : 'No review cards yet. Complete quizzes to build your review deck.'}
        </p>
        {stats.total > 0 && (
          <button
            onClick={loadDueCards}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Review Again</span>
          </button>
        )}
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <div className="max-w-md mx-auto space-y-4">
      <div className="flex items-center justify-between text-xs font-bold text-slate-400">
        <div className="flex items-center gap-1.5">
          <Brain className="w-3.5 h-3.5" />
          <span>{currentIndex + 1} / {cards.length}</span>
        </div>
        <span>{stats.total} cards in rotation</span>
      </div>

      <div
        onClick={() => setFlipped(!flipped)}
        className="relative cursor-pointer"
        style={{ perspective: '1000px' }}
      >
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.4 }}
          className="relative w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm min-h-[280px] flex flex-col items-center justify-center text-center"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {!flipped ? (
            <div className="space-y-4">
              <p className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Question</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white leading-relaxed">{currentCard.question}</p>
              <p className="text-xs text-slate-400">Tap to reveal answer</p>
            </div>
          ) : (
            <div className="space-y-4" style={{ transform: 'rotateY(180deg)' }}>
              <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Answer</p>
              <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{currentCard.answer}</p>
              <p className="text-xs text-slate-500 leading-relaxed">{currentCard.explanation}</p>
            </div>
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {flipped && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex justify-center gap-2"
          >
            {[
              { quality: 0, label: 'Forgot', color: 'bg-rose-500 hover:bg-rose-400' },
              { quality: 3, label: 'Hard', color: 'bg-amber-500 hover:bg-amber-400' },
              { quality: 4, label: 'Good', color: 'bg-blue-500 hover:bg-blue-400' },
              { quality: 5, label: 'Easy', color: 'bg-emerald-500 hover:bg-emerald-400' },
            ].map(opt => (
              <button
                key={opt.quality}
                onClick={(e) => { e.stopPropagation(); handleRate(opt.quality); }}
                className={`px-4 py-2 rounded-xl text-white font-bold text-xs ${opt.color} transition-all cursor-pointer`}
              >
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
