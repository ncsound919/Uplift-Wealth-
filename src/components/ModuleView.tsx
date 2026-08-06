import React, { useMemo, useState, useCallback, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Download,
  Gamepad2,
  Lightbulb,
  Sparkles,
  Target,
  GraduationCap,
  PlayCircle,
  FileText,
  Code,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

import { Module } from '../data/courseData';
import { LECTURE_CLASSES, LectureClass } from '../data/lectureLibrary';
import { resolveIcon } from '../utils/iconResolver';
const DiagramMermaid = lazy(() => import('./DiagramMermaid').then(m => ({ default: m.DiagramMermaid })));
import { Quiz } from './Quiz';
import { cn } from '../lib/utils';
import { capture } from '../lib/analytics';
import { TradingGame } from './TradingGame';
import { UnderwritingGame } from './UnderwritingGame';
import { ParametricGame } from './ParametricGame';
import { FraudGame } from './FraudGame';
import { YouTubeVideoPlayer } from './YouTubeVideoPlayer';
import { ArchitectureOfExtraction } from './ArchitectureOfExtraction';
import { ConnectingTheDotsArticle } from './ConnectingTheDotsArticle';

interface ModuleViewProps {
  module: Module;
  onBack: () => void;
  onComplete: (moduleId: string) => void;
  onLessonComplete: (lessonId: string, lessonType: string, moduleId: string) => void;
}

type SandboxGameType = 'trading' | 'underwriting' | 'parametric' | 'fraud';
type UtilityTab = 'terms' | 'insight' | 'outcomes';

interface GlossaryTerm {
  word: string;
  def: string;
}

function getLessonData(moduleId: string) {
  return LECTURE_CLASSES.find(c => c.moduleId === moduleId);
}

// Compact inline lecture deck for folding the Lecture Library into module lessons.
function LectureDeck({ lecture }: { lecture: LectureClass }) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [view, setView] = useState<'slides' | 'outcomes' | 'concepts' | 'project'>('slides');
  const slide = lecture.slides[slideIndex];

  const prev = () => setSlideIndex(i => Math.max(0, i - 1));
  const next = () => setSlideIndex(i => Math.min(lecture.slides.length - 1, i + 1));

  const tabs: { id: typeof view; label: string }[] = [
    { id: 'slides', label: 'Slides' },
    { id: 'outcomes', label: 'Outcomes' },
    { id: 'concepts', label: 'Concepts' },
    { id: 'project', label: 'Project' },
  ];

  return (
    <div className="space-y-5 min-h-[620px]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            <GraduationCap className="h-4 w-4" /> Masterclass Lecture
          </div>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white md:text-3xl">{lecture.title}</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{lecture.subtitle}</p>
        </div>
      </div>

      <div className="flex gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-900">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setView(t.id)}
            className={cn(
              "flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition cursor-pointer",
              view === t.id ? "bg-white text-slate-950 shadow-sm dark:bg-slate-800 dark:text-white" : "text-slate-500 dark:text-slate-400"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {view === 'slides' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Slide {slideIndex + 1} / {lecture.slides.length}</span>
              <div className="flex gap-2">
                <button onClick={prev} disabled={slideIndex === 0} className="rounded-lg border border-slate-300 bg-white p-2 text-slate-600 disabled:opacity-40 hover:bg-slate-50 cursor-pointer dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800" aria-label="Previous slide">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button onClick={next} disabled={slideIndex === lecture.slides.length - 1} className="rounded-lg border border-slate-300 bg-white p-2 text-slate-600 disabled:opacity-40 hover:bg-slate-50 cursor-pointer dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800" aria-label="Next slide">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-950 dark:text-white">{slide.title}</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{slide.subtitle}</p>
            <ul className="mt-4 space-y-2.5">
              {slide.bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                  {b}
                </li>
              ))}
            </ul>
            {slide.codeSnippet && (
              <div className="mt-4 rounded-xl bg-slate-950 p-4 text-slate-100 overflow-x-auto">
                <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400"><Code className="h-3.5 w-3.5" /> Example</div>
                <pre className="text-xs leading-5">{slide.codeSnippet}</pre>
              </div>
            )}
            {slide.exampleCard && (
              <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/40">
                <div className="text-xs font-bold uppercase tracking-widest text-blue-700 dark:text-blue-300">{slide.exampleCard.title}</div>
                <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{slide.exampleCard.description}</p>
                <div className="mt-2 rounded-lg bg-white p-3 text-xs font-medium text-slate-700 dark:bg-slate-900 dark:text-slate-200">{slide.exampleCard.example}</div>
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">{slide.exampleCard.explanation}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {view === 'outcomes' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
          <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400"><Target className="h-4 w-4" /> Learning Outcomes</h3>
          <ul className="mt-4 space-y-3">
            {lecture.learningOutcomes.map((lo, i) => (
              <li key={i} className="flex items-start gap-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />{lo}
              </li>
            ))}
          </ul>
        </div>
      )}

      {view === 'concepts' && (
        <div className="space-y-3">
          {lecture.keyConcepts.map((kc, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
              <h4 className="font-semibold text-slate-950 dark:text-white">{kc.term}</h4>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{kc.definition}</p>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400"><span className="font-bold uppercase tracking-widest">Practical: </span>{kc.practicalUse}</p>
            </div>
          ))}
        </div>
      )}

      {view === 'project' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
          <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400"><FileText className="h-4 w-4" /> Applied Project</h3>
          <h4 className="mt-3 text-lg font-semibold text-slate-950 dark:text-white">{lecture.appliedProjectHandout.title}</h4>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{lecture.appliedProjectHandout.description}</p>
          <div className="mt-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-700 dark:bg-slate-900 dark:text-slate-300">
            <span className="font-bold uppercase tracking-widest text-xs text-slate-500 block mb-1">Reusable Output</span>
            {lecture.appliedProjectHandout.reusableOutput}
          </div>
          <div className="mt-3 space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Checklist</span>
            {lecture.appliedProjectHandout.checklist.map((c, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />{c}
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-xl border border-slate-200 p-4 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
            <span className="font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300">Technical Spec</span>
            <p className="mt-1">{lecture.appliedProjectHandout.technicalSpec}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function LessonCheckpoint({ onConfirm }: { onConfirm: () => void }) {
  const [rating, setRating] = useState<number | null>(null);
  return (
    <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 rounded-2xl p-5 mt-8 space-y-4">
      <div className="flex items-center gap-2 text-sm font-bold text-blue-800 dark:text-blue-300">
        <Target className="w-4 h-4" />
        <span>Did you understand this lesson?</span>
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => setRating(n)}
            className={cn(
              "w-10 h-10 rounded-xl font-bold text-sm transition-all cursor-pointer",
              rating === n
                ? "bg-blue-600 text-white shadow-md scale-110"
                : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-400"
            )}
          >
            {n}
          </button>
        ))}
        <span className="text-xs text-slate-500 dark:text-slate-400 self-center ml-1">
          {rating ? (rating >= 4 ? 'Got it!' : rating >= 3 ? 'Mostly' : 'Needs review') : '1-5'}
        </span>
      </div>
      {rating && (
        <button
          onClick={onConfirm}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Continue
        </button>
      )}
    </div>
  );
}

const handleDownloadDocs = (mod: Module) => {
  let markdown = `# ${mod.title}\n\n`;
  markdown += `**Level:** ${mod.level.toUpperCase()}  \n`;
  markdown += `**Description:** ${mod.description}\n\n`;

  const lectureClass = getLessonData(mod.id);
  if (lectureClass) {
    markdown += `## Learning Outcomes\n`;
    lectureClass.learningOutcomes.forEach((lo) => {
      markdown += `- ${lo}\n`;
    });
    markdown += `\n## Key Concepts\n`;
    lectureClass.keyConcepts.forEach((kc) => {
      markdown += `- **${kc.term}**: ${kc.definition}\n`;
    });
    markdown += '\n---\n\n';
  }

  markdown += `## Lessons (${mod.lessons.length} total)\n\n`;
  mod.lessons.forEach((lesson, index) => {
    markdown += `### Lesson ${index + 1}: ${lesson.title}\n`;
    markdown += `*Type:* ${lesson.type.toUpperCase()}  \n\n`;
    if (lesson.type === 'text' && lesson.content) {
      markdown += `${lesson.content}\n\n`;
    } else if (lesson.type === 'quiz' && lesson.quiz) {
      markdown += `#### Quiz Challenge\n\n`;
      lesson.quiz.forEach((q, qIndex) => {
        markdown += `${qIndex + 1}. **${q.question}**\n`;
        q.options.forEach((opt, optIdx) => {
          markdown += `   - ${optIdx === q.correctAnswer ? '[x]' : '[ ]'} ${opt}\n`;
        });
        markdown += `\n   *Answer explanation:* ${q.explanation}\n\n`;
      });
    } else if (lesson.type === 'game') {
      markdown += `*Interactive Simulation: ${lesson.title}*\n`;
      markdown += `Launch this simulation on the Overlay Wealth platform.\n\n`;
    }
    markdown += `---\n\n`;
  });

  if (mod.takeaways?.length) {
    markdown += `## Key Takeaways\n`;
    mod.takeaways.forEach((t) => { markdown += `- ${t}\n`; });
    markdown += '\n';
  }
  if (mod.didYouKnow) {
    markdown += `> **Did You Know?** ${mod.didYouKnow}\n\n`;
  }

  markdown += `\n---\n*Generated by Overlay Wealth — Study Guide*\n`;

  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${mod.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_study_guide.md`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 100);
};

function getLessonGlossary(lessonId: string, moduleId: string, currentLessonIndex: number, totalLessons: number): GlossaryTerm[] {
  const activeClass = getLessonData(moduleId);
  if (!activeClass || !activeClass.keyConcepts || activeClass.keyConcepts.length === 0) {
    return [
      { word: 'Fintech Core', def: 'The intersection of modern software engineering and financial regulatory architectures.' },
      { word: 'API Pipeline', def: 'Secure web sockets and JSON APIs transferring state and balances globally in milliseconds.' },
    ];
  }

  const terms = activeClass.keyConcepts.map(c => ({ word: c.term, def: c.definition }));
  const totalConcepts = terms.length;
  const conceptsPerLesson = Math.max(2, Math.ceil(totalConcepts / Math.max(1, totalLessons)));
  const startIndex = (currentLessonIndex * conceptsPerLesson) % totalConcepts;
  let selectedTerms = terms.slice(startIndex, startIndex + conceptsPerLesson);
  if (selectedTerms.length < 2 && terms.length >= 2) {
    selectedTerms = terms.slice(0, 2);
  }
  return selectedTerms;
}

function getLessonProInsight(lessonId: string, moduleId: string, currentLessonIndex: number): string {
  const activeClass = getLessonData(moduleId);
  if (!activeClass) {
    return "Financial engineering combines rigorous software design with deep understanding of compliance and clearing rails.";
  }
  const slideIndex = currentLessonIndex % activeClass.slides.length;
  const slide = activeClass.slides[slideIndex];
  if (slide && slide.bullets && slide.bullets.length > 0) {
    return slide.bullets[0];
  }
  return activeClass.overview;
}

export function ModuleView({ module, onBack, onComplete, onLessonComplete }: ModuleViewProps) {
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [utilityTab, setUtilityTab] = useState<UtilityTab>('outcomes');
  const [showCheckpoint, setShowCheckpoint] = useState(false);

  const currentLesson = module.lessons[currentLessonIndex];
  const isLastLesson = currentLessonIndex === module.lessons.length - 1;
  const lectureClass = getLessonData(module.id);

  useEffect(() => {
    if (currentLesson) {
      capture('lesson_start', { moduleId: module.id, lessonId: currentLesson.id });
    }
  }, [currentLesson?.id, module.id]);

  const currentGlossary = useMemo(
    () => getLessonGlossary(currentLesson.id, module.id, currentLessonIndex, module.lessons.length),
    [currentLesson.id, module.id, currentLessonIndex, module.lessons.length]
  );

  const currentProInsight = useMemo(
    () => getLessonProInsight(currentLesson.id, module.id, currentLessonIndex),
    [currentLesson.id, module.id, currentLessonIndex]
  );

  const progressPercent = Math.round(
    (completedLessons.length / module.lessons.length) * 100
  );

  const advanceLesson = useCallback(() => {
    if (!completedLessons.includes(currentLesson.id)) {
      setCompletedLessons(prev => [...prev, currentLesson.id]);
      onLessonComplete(currentLesson.id, currentLesson.type, module.id);
    }
    if (isLastLesson) {
      onComplete(module.id);
      onBack();
    } else {
      setCurrentLessonIndex(prev => prev + 1);
    }
    setShowCheckpoint(false);
  }, [currentLesson.id, currentLesson.type, completedLessons, isLastLesson, module.id, onBack, onComplete, onLessonComplete]);

  const handleNext = () => {
    if (currentLesson.type === 'text') {
      if (!showCheckpoint) {
        setShowCheckpoint(true);
      } else {
        advanceLesson();
      }
    } else {
      advanceLesson();
    }
  };

  const handlePrev = useCallback(() => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(prev => prev - 1);
      setShowCheckpoint(false);
    }
  }, [currentLessonIndex]);

  const handleSelectLesson = useCallback((idx: number) => {
    setCurrentLessonIndex(idx);
    setShowCheckpoint(false);
  }, []);

  const renderLessonIcon = (type: string) => {
    switch (type) {
      case 'text': return <BookOpen className="h-4 w-4" />;
      case 'quiz': return <CheckCircle2 className="h-4 w-4" />;
      case 'game': return <Gamepad2 className="h-4 w-4" />;
      case 'video': return <PlayCircle className="h-4 w-4" />;
      case 'lecture': return <GraduationCap className="h-4 w-4" />;
      case 'article': return <FileText className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const renderLessonBody = () => {
    if (currentLesson.type === 'text') {
      return (
        <div className="flex min-h-[620px] flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                {renderLessonIcon(currentLesson.type)}
                Lesson
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {currentLessonIndex + 1} of {module.lessons.length}
              </span>
            </div>

            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white md:text-3xl">
                {currentLesson.title}
              </h2>
            </div>

            <div className="prose prose-slate max-w-none text-base leading-7 dark:prose-invert">
              <Markdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                  code({ className, children, ...props }: any) {
                    const isMermaid = className === 'language-mermaid' || String(children).startsWith('sequenceDiagram');
                    if (isMermaid) {
                      const chart = String(children);
                      return <Suspense fallback={<div className="h-48 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />}><DiagramMermaid chart={chart} /></Suspense>;
                    }
                    return <code className={className} {...props}>{children}</code>;
                  },
                  pre({ children }: any) {
                    const child = Array.isArray(children) ? children[0] : children;
                    if (child?.type?.name === 'DiagramMermaid') return child;
                    return <pre>{children}</pre>;
                  },
                }}
              >
                {currentLesson.content || ''}
              </Markdown>
            </div>

            {showCheckpoint && (
              <LessonCheckpoint onConfirm={() => setShowCheckpoint(false)} />
            )}
          </div>

          <div className="mt-10 flex items-center justify-between gap-4 border-t border-slate-200 pt-6 dark:border-slate-800">
            <button type="button" onClick={handlePrev} disabled={currentLessonIndex === 0}
              className={`inline-flex items-center rounded-xl border px-5 py-3 text-sm font-medium transition ${currentLessonIndex === 0
                ? 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-600'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Previous
            </button>

            <button type="button" onClick={handleNext}
              className="inline-flex items-center rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
            >
              {showCheckpoint ? 'Continue' : 'Mark Complete'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        </div>
      );
    }

    if (currentLesson.type === 'quiz' && currentLesson.quiz) {
      return (
        <div className="space-y-6 min-h-[620px]">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              {renderLessonIcon(currentLesson.type)}
              Assessment
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {currentLesson.title}
            </span>
          </div>

          <Quiz questions={currentLesson.quiz} onComplete={handleNext} moduleId={module.id} passThreshold={70} />

          <div className="border-t border-slate-200 pt-6 dark:border-slate-800">
            <button type="button" onClick={handlePrev}
              className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Previous
            </button>
          </div>
        </div>
      );
    }

    if (currentLesson.type === 'game') {
      return (
        <div className="space-y-6 min-h-[620px]">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
              <Sparkles className="h-4 w-4" /> Simulation
            </div>
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
              Complete the simulation to apply the lesson in a practical scenario.
            </p>
          </div>

          {(currentLesson.gameType as SandboxGameType) === 'trading' && <TradingGame onComplete={handleNext} />}
          {(currentLesson.gameType as SandboxGameType) === 'underwriting' && <UnderwritingGame onComplete={handleNext} />}
          {(currentLesson.gameType as SandboxGameType) === 'parametric' && <ParametricGame onComplete={handleNext} />}
          {(currentLesson.gameType as SandboxGameType) === 'fraud' && <FraudGame onComplete={handleNext} />}

          <div className="border-t border-slate-200 pt-6 dark:border-slate-800">
            <button type="button" onClick={handlePrev}
              className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Previous
            </button>
          </div>
        </div>
      );
    }

    if (currentLesson.type === 'lecture') {
      const lecture = lectureClass;
      return (
        <div className="space-y-6 min-h-[620px]">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              {renderLessonIcon(currentLesson.type)}
              Masterclass Lecture
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {currentLessonIndex + 1} of {module.lessons.length}
            </span>
          </div>
          {lecture ? (
            <LectureDeck lecture={lecture} />
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">Lecture content is not yet available for this module.</p>
          )}
          <div className="mt-10 flex items-center justify-between gap-4 border-t border-slate-200 pt-6 dark:border-slate-800">
            <button type="button" onClick={handlePrev} disabled={currentLessonIndex === 0}
              className={`inline-flex items-center rounded-xl border px-5 py-3 text-sm font-medium transition ${currentLessonIndex === 0
                ? 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-600'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Previous
            </button>
            <button type="button" onClick={handleNext}
              className="inline-flex items-center rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
            >
              Mark Complete
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        </div>
      );
    }

    if (currentLesson.type === 'article') {
      if (currentLesson.featureId === 'black_finance_history') {
        return (
          <div className="space-y-6 min-h-[620px]">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                {renderLessonIcon(currentLesson.type)}
                History of Black American Finance
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {currentLessonIndex + 1} of {module.lessons.length}
              </span>
            </div>
            <ArchitectureOfExtraction />
            <div className="mt-10 flex items-center justify-between gap-4 border-t border-slate-200 pt-6 dark:border-slate-800">
              <button type="button" onClick={handlePrev} disabled={currentLessonIndex === 0}
                className={`inline-flex items-center rounded-xl border px-5 py-3 text-sm font-medium transition ${currentLessonIndex === 0
                  ? 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-600'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Previous
              </button>
              <button type="button" onClick={handleNext}
                className="inline-flex items-center rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
              >
                Mark Complete
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        );
      }

      if (currentLesson.featureId === 'connecting_the_dots') {
        return (
          <div className="space-y-6 min-h-[620px]">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                {renderLessonIcon(currentLesson.type)}
                Connecting The Dots
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {currentLessonIndex + 1} of {module.lessons.length}
              </span>
            </div>
            <ConnectingTheDotsArticle />
            <div className="mt-10 flex items-center justify-between gap-4 border-t border-slate-200 pt-6 dark:border-slate-800">
              <button type="button" onClick={handlePrev} disabled={currentLessonIndex === 0}
                className={`inline-flex items-center rounded-xl border px-5 py-3 text-sm font-medium transition ${currentLessonIndex === 0
                  ? 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-600'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Previous
              </button>
              <button type="button" onClick={handleNext}
                className="inline-flex items-center rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
              >
                Mark Complete
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        );
      }

      return (
        <div className="space-y-6 min-h-[620px]">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              {renderLessonIcon(currentLesson.type)}
              Feature Article
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {currentLessonIndex + 1} of {module.lessons.length}
            </span>
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white md:text-3xl">
              {currentLesson.title}
            </h2>
          </div>
          <div className="prose prose-slate max-w-none text-base leading-7 dark:prose-invert">
            <Markdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {currentLesson.content || ''}
            </Markdown>
          </div>
          <div className="mt-10 flex items-center justify-between gap-4 border-t border-slate-200 pt-6 dark:border-slate-800">
            <button type="button" onClick={handlePrev} disabled={currentLessonIndex === 0}
              className={`inline-flex items-center rounded-xl border px-5 py-3 text-sm font-medium transition ${currentLessonIndex === 0
                ? 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-600'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Previous
            </button>
            <button type="button" onClick={handleNext}
              className="inline-flex items-center rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
            >
              Mark Complete
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        </div>
      );
    }

    if (currentLesson.type === 'video') {
      return (
        <div className="space-y-6 min-h-[620px]">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              {renderLessonIcon(currentLesson.type)}
              Video
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {currentLessonIndex + 1} of {module.lessons.length}
            </span>
          </div>

          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white md:text-3xl">
              {currentLesson.title}
            </h2>
          </div>

          <YouTubeVideoPlayer
            videoId={currentLesson.videoId || ''}
            title={currentLesson.title}
            description={currentLesson.content || undefined}
          />

          <div className="mt-10 flex items-center justify-between gap-4 border-t border-slate-200 pt-6 dark:border-slate-800">
            <button type="button" onClick={handlePrev} disabled={currentLessonIndex === 0}
              className={`inline-flex items-center rounded-xl border px-5 py-3 text-sm font-medium transition ${currentLessonIndex === 0
                ? 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-600'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Previous
            </button>

            <button type="button" onClick={handleNext}
              className="inline-flex items-center rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
            >
              Mark Complete
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div id="module-view-workspace" className="mx-auto max-w-[1920px] px-4 py-5 md:px-6 xl:px-8">
      <div className="space-y-6">
        <header className="rounded-2xl border border-slate-200 bg-white px-5 py-5 dark:border-slate-800 dark:bg-slate-950 md:px-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0 flex-1">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <button onClick={onBack}
                  className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> All Modules
                </button>

                <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white ${module.color}`}>
                  {module.level} Track
                </span>

                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {completedLessons.length} of {module.lessons.length} lessons completed
                </span>
              </div>

              <div className="flex items-start gap-4">
                <div className={`hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm md:flex ${module.color}`}>
                  {React.createElement(resolveIcon(module.icon as any), { size: 24, strokeWidth: 2.3 } as any)}
                </div>
                <div className="min-w-0">
                  <h1 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white md:text-3xl">
                    {module.title}
                  </h1>
                  <p className="mt-1 max-w-4xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                    {module.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-start gap-2">
              <button onClick={() => handleDownloadDocs(module)}
                className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <Download className="mr-2 h-4 w-4" /> Study Guide
              </button>
            </div>
          </div>

          <div className="mt-5 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Module progress</span>
              <span>{progressPercent}%</span>
            </div>
            <div role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100} aria-label="Module progress" className="flex gap-1">
              {module.lessons.map((lesson, idx) => (
                <div key={lesson.id} className={`h-2 flex-1 rounded-full transition-colors ${idx < currentLessonIndex ? 'bg-slate-900 dark:bg-white' : idx === currentLessonIndex ? 'bg-slate-500 dark:bg-slate-400' : 'bg-slate-200 dark:bg-slate-800'}`} />
              ))}
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <aside className="xl:col-span-3">
            <div className="sticky top-20 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
              <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Lessons</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{module.lessons.length} total</p>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-900 dark:text-slate-300">{progressPercent}%</span>
              </div>

              <div className="space-y-2">
                {module.lessons.map((lesson, idx) => {
                  const isSelected = idx === currentLessonIndex;
                  const isCompleted = completedLessons.includes(lesson.id);
                  return (
                    <button key={lesson.id} onClick={() => handleSelectLesson(idx)} aria-current={isSelected ? 'step' : undefined}
                      className={`w-full rounded-xl border px-3.5 py-3 text-left transition ${isSelected
                        ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-950'
                        : isCompleted
                          ? 'border-slate-200 bg-slate-50 text-slate-900 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-900'
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${isSelected ? 'bg-white/15 dark:bg-slate-200' : isCompleted ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                          {renderLessonIcon(lesson.type)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{lesson.title}</p>
                          <p className={`mt-1 text-xs uppercase tracking-[0.18em] ${isSelected ? 'text-white/70 dark:text-slate-500' : 'text-slate-400 dark:text-slate-500'}`}>
                            {lesson.type}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          <main className="xl:col-span-6">
            <AnimatePresence mode="wait">
              <motion.section
                key={currentLesson.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.22 }}
                className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950 md:p-8"
              >
                {renderLessonBody()}
              </motion.section>
            </AnimatePresence>
          </main>

          <aside className="xl:col-span-3">
            <div className="sticky top-20 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                <div className="mb-4 flex items-center gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-900">
                  <button onClick={() => setUtilityTab('outcomes')}
                    className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${utilityTab === 'outcomes' ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
                  >
                    Outcomes
                  </button>
                  <button onClick={() => setUtilityTab('terms')}
                    className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${utilityTab === 'terms' ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
                  >
                    Terms
                  </button>
                  <button onClick={() => setUtilityTab('insight')}
                    className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${utilityTab === 'insight' ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
                  >
                    Insight
                  </button>
                </div>

                {utilityTab === 'outcomes' && lectureClass && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      <GraduationCap className="w-3.5 h-3.5" />
                      Learning Outcomes
                    </div>
                    <ul className="space-y-2">
                      {lectureClass.learningOutcomes.map((lo, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                          {lo}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {utilityTab === 'outcomes' && !lectureClass && (
                  <p className="text-xs text-slate-500">Learning outcomes available in class materials.</p>
                )}

                {utilityTab === 'terms' && (
                  <div className="space-y-4">
                    {currentGlossary.map((term, i) => (
                      <div key={`${term.word}-${i}`} className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                        <h3 className="text-sm font-semibold text-slate-950 dark:text-white">{term.word}</h3>
                        <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">{term.def}</p>
                      </div>
                    ))}
                  </div>
                )}

                {utilityTab === 'insight' && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-950 dark:text-white">
                      <Sparkles className="h-4 w-4" /> Professional Insight
                    </div>
                    <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">{currentProInsight}</p>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>

        {((module.takeaways?.length ?? 0) > 0 || module.didYouKnow) && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950 md:p-8">
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
              {(module.takeaways?.length ?? 0) > 0 && (
                <div className="xl:col-span-8">
                  <div className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    <CheckCircle2 className="h-4 w-4" /> Key Takeaways
                  </div>
                  <ul className="space-y-3">
                    {(module.takeaways ?? []).map((takeaway, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm leading-6 text-slate-700 dark:text-slate-300">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400 dark:bg-slate-500" />
                        <span>{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {module.didYouKnow && (
                <div className="xl:col-span-4">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                      <Lightbulb className="h-4 w-4" /> Industry Note
                    </div>
                    <p className="text-sm leading-6 text-slate-700 dark:text-slate-300">{module.didYouKnow}</p>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
