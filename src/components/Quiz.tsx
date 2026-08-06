import React, { useState } from 'react';
import { motion } from 'motion/react';
import { QuizQuestion } from '../data/courseData';
import { CheckCircle2, XCircle, Trophy, ArrowRight, RefreshCw, BarChart3 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { apiClient } from '../lib/apiClient';
import { capture } from '../lib/analytics';
import { cn } from '../lib/utils';

interface QuizProps {
  questions: QuizQuestion[];
  onComplete: () => void;
  moduleId?: string;
  passThreshold?: number;
}

export function Quiz({ questions, onComplete, moduleId = 'unknown', passThreshold = 0 }: QuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [hasPassed, setHasPassed] = useState(false);
  const [attempts, setAttempts] = useState(1);

  const question = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;

  const handleSelect = (index: number) => {
    /* v8 ignore next -- @preserve answer buttons are disabled once an answer is selected */
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    const correct = index === question.correctAnswer;
    setIsCorrect(correct);
    setShowExplanation(true);
    if (correct) {
      setCorrectCount(prev => prev + 1);
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 }, colors: ['#2563eb', '#10b981', '#3b82f6'], disableForReducedMotion: true });
    }
  };

  const handleNext = () => {
    if (!isLastQuestion) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setShowExplanation(false);
    } else {
      const finalScore = correctCount;
      const pct = Math.round((finalScore / questions.length) * 100);
      const passed = pct >= passThreshold;
      setHasPassed(passed);
      setQuizCompleted(true);

      apiClient.submitQuizScore(moduleId, finalScore, questions.length).catch((err) => {
        console.warn('[Quiz Score Submit Error]:', err);
      });

      capture('quiz_attempt', { moduleId, score: finalScore, passed });

      if (passed) {
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.4 }, colors: ['#2563eb', '#10b981', '#f59e0b'] });
      }
    }
  };

  const handleRetry = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setShowExplanation(false);
    setCorrectCount(0);
    setQuizCompleted(false);
    setHasPassed(false);
    setAttempts(prev => prev + 1);
  };

  if (quizCompleted) {
    const pct = Math.round((correctCount / questions.length) * 100);
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm p-8 border border-slate-200 dark:border-slate-800 text-center">
        <div className={cn(
          "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6",
          hasPassed ? "bg-emerald-100 dark:bg-emerald-950/40" : "bg-amber-100 dark:bg-amber-950/40"
        )}>
          {hasPassed ? <Trophy className="w-10 h-10 text-emerald-600 dark:text-emerald-400" /> : <BarChart3 className="w-10 h-10 text-amber-600 dark:text-amber-400" />}
        </div>

        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
          {hasPassed ? 'Quiz Passed!' : 'Keep Practicing'}
        </h3>

        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="text-5xl font-black text-slate-900 dark:text-white">{pct}%</span>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            ({correctCount}/{questions.length} correct)
          </span>
        </div>

        <div className="w-full max-w-xs mx-auto h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mb-6">
          <div className={cn("h-full rounded-full transition-all", hasPassed ? "bg-emerald-500" : "bg-amber-500")} style={{ width: `${pct}%` }} />
        </div>

        {passThreshold > 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            {hasPassed
              ? `You exceeded the ${passThreshold}% pass threshold.`
              : `You need ${passThreshold}% to pass. Try again to improve your score.`}
          </p>
        )}

        <div className="flex items-center justify-center gap-3">
          {!hasPassed && (
            <button onClick={handleRetry}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold transition-all cursor-pointer shadow-sm"
            >
              <RefreshCw className="w-4 h-4" /> Retry Quiz
            </button>
          )}
          <button onClick={onComplete}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all cursor-pointer shadow-sm"
          >
            {hasPassed ? 'Continue' : 'Review Later'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {attempts > 1 && (
          <p className="text-xs text-slate-400 mt-4">Attempt {attempts}</p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm p-8 border border-slate-200 dark:border-slate-800">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-black font-display text-slate-900 dark:text-white">Knowledge Check</h3>
          {passThreshold > 0 && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400">
              Pass: {passThreshold}%
            </span>
          )}
        </div>
        <span className="text-slate-500 dark:text-slate-400 font-bold text-sm">
          {currentQuestion + 1} of {questions.length}
        </span>
      </div>

      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mb-8">
        <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${((currentQuestion) / questions.length) * 100}%` }} />
      </div>

      <div className="mb-8">
        <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-6 leading-relaxed">
          {question.question}
        </h4>
        <div className="space-y-3">
          {question.options.map((option, index) => {
            const isSel = selectedAnswer === index;
            const isActuallyCorrect = index === question.correctAnswer;
            let btnClass = "w-full text-left p-4 rounded-xl border transition-all text-base font-medium cursor-pointer ";
            if (selectedAnswer === null) {
              btnClass += "border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300";
            } else if (isActuallyCorrect) {
              btnClass += "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold shadow-sm";
            } else if (isSel && !isActuallyCorrect) {
              btnClass += "border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300";
            } else {
              btnClass += "border-slate-100 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-900/50 opacity-50 text-slate-500 dark:text-slate-500 cursor-not-allowed";
            }
            return (
              <button key={index} className={btnClass} onClick={() => handleSelect(index)} disabled={selectedAnswer !== null}>
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  {selectedAnswer !== null && isActuallyCorrect && <CheckCircle2 className="text-emerald-500 dark:text-emerald-400 w-5 h-5 shrink-0" />}
                  {isSel && !isActuallyCorrect && <XCircle className="text-red-500 dark:text-red-400 w-5 h-5 shrink-0" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {showExplanation && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className={`p-5 rounded-xl mb-8 border ${isCorrect ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60' : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/60'}`}
        >
          <p className="font-bold mb-2 flex items-center text-sm">
            {isCorrect ? <><CheckCircle2 className="w-5 h-5 mr-2 text-emerald-600 dark:text-emerald-400" /> Correct</> : <><XCircle className="w-5 h-5 mr-2 text-red-600 dark:text-red-400" /> Incorrect</>}
          </p>
          <p className="text-[13px] leading-relaxed opacity-90 font-medium">{question.explanation}</p>
        </motion.div>
      )}

      {selectedAnswer !== null && (
        <div className="flex justify-end">
          <button onClick={handleNext}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-colors cursor-pointer shadow-sm"
          >
            {isLastQuestion ? 'See Results' : 'Next Question'}
            <ArrowRight className="ml-2 w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
