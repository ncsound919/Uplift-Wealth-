import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LECTURE_CLASSES, LectureClass, LectureSlide } from '../data/lectureLibrary';
import { 
  BookOpen, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  GraduationCap, 
  Award, 
  CheckSquare, 
  FileText, 
  Code, 
  Play, 
  Layers, 
  ShieldCheck, 
  TrendingUp, 
  Activity, 
  Info,
  Sliders,
  Sparkles
} from 'lucide-react';
import { cn } from '../lib/utils';
import { getJSON, setJSON, storageKeys } from '../lib/storage';
import { resolveIcon } from '../utils/iconResolver';
import { YouTubeVideoPlayer } from './YouTubeVideoPlayer';

const CLASS_VIDEOS: Record<string, { id: string; title: string }> = {
  'class-1': { id: '5-O4jQ_aBWA', title: 'How Banks Actually Work & Ledgers' },
  'class-2': { id: 'b_XmNlG1Z5M', title: 'Payment Rails & Credit Cards' },
  'class-3': { id: 'tF112J4QkQQ', title: 'Banking-as-a-Service & Open APIs' },
  'class-4': { id: 'P_B30b355yQ', title: 'Credit Invisibility & Underwriting' },
  'class-5': { id: 'p7HKvqRI_Bo', title: 'Stock Markets & Portfolio Tech' },
  'class-6': { id: 'W-pQnE4hXpI', title: 'Insurtech & Parametric Triggers' },
  'class-7': { id: 'rYQgy8QDEBI', title: 'Cryptocurrency & Settlement Systems' },
  'class-8': { id: 'd7r_W_j8rVw', title: 'Compliance, Regtech & KYC' },
  'class-9': { id: 's7R6_H5tB_M', title: 'Fintech Business Models & Unit Economics' },
  'class-10': { id: 'fK7J_yWnK4U', title: 'Financial Licenses & Regulatory Sandbox' },
  'class-11': { id: '8q3Z8_N-4Yw', title: 'Double-Entry Ledgers & System Design' },
  'class-12': { id: 's7R6_H5tB_M', title: 'Fintech Capstone & Venture Pitch' }
};

export function KnowledgeBase() {
  const [selectedClassId, setSelectedClassId] = useState<string>('class-1');
  const [activeSubTab, setActiveSubTab] = useState<'slides' | 'syllabus' | 'handout' | 'video'>('slides');
  const [slideIndex, setSlideIndex] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const activeClass = useMemo(() => {
    return LECTURE_CLASSES.find(c => c.id === selectedClassId) || LECTURE_CLASSES[0];
  }, [selectedClassId]);

  // Handle class selection resets
  const handleSelectClass = (classId: string) => {
    setSelectedClassId(classId);
    setSlideIndex(0);
    // Stay on current sub-tab for a smooth browsing experience
  };

  // Next/prev slide controls with strict bounds protection
  const handleNextSlide = () => {
    setSlideIndex(prev => (prev < activeClass.slides.length - 1 ? prev + 1 : prev));
  };

  const handlePrevSlide = () => {
    setSlideIndex(prev => (prev > 0 ? prev - 1 : prev));
  };

  // Keyboard navigation for slide deck
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid intercepting input fields
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (activeSubTab === 'slides') {
        if (e.key === 'ArrowRight' || e.key === 'PageDown') {
          e.preventDefault();
          handleNextSlide();
        } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
          e.preventDefault();
          handlePrevSlide();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSubTab, slideIndex, activeClass.slides.length]);

  // Global search dictionary: flat list of all terms across all 12 classes
  const allGlossaryTerms = useMemo(() => {
    const terms: { classId: string; classTitle: string; term: string; definition: string; practicalUse: string }[] = [];
    LECTURE_CLASSES.forEach(c => {
      c.keyConcepts.forEach(concept => {
        terms.push({
          classId: c.id,
          classTitle: c.title,
          term: concept.term,
          definition: concept.definition,
          practicalUse: concept.practicalUse
        });
      });
    });
    return terms;
  }, []);

  // Filter glossary based on query
  const filteredGlossary = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return allGlossaryTerms.filter(t => 
      t.term.toLowerCase().includes(query) || 
      t.definition.toLowerCase().includes(query) ||
      t.practicalUse.toLowerCase().includes(query)
    );
  }, [searchQuery, allGlossaryTerms]);

  // Keep track of ticked capstone project checklists (using simple local state keys)
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>(() => {
    return getJSON<Record<string, boolean>>(storageKeys.capstoneChecklists, {});
  });

  const toggleChecklistItem = (classId: string, itemIdx: number) => {
    const key = `${classId}-${itemIdx}`;
    const next = { ...checklistState, [key]: !checklistState[key] };
    setChecklistState(next);
    setJSON(storageKeys.capstoneChecklists, next);
  };

  return (
    <div id="lecture-library-workspace" className="max-w-[1600px] mx-auto p-4 md:p-6 space-y-12">
      
      {/* Intro Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 md:p-5 rounded-2xl shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-black uppercase tracking-widest shadow-inner">
            <GraduationCap className="w-3 h-3" />
            <span>Fintech Academic Lecture Hall</span>
          </div>
          <h2 className="text-lg md:text-xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
            Academic Class Lectures & Knowledge Base
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed font-medium">
            Skip the generic marketing fluff. Immerse yourself in actual computer science, mathematical, and regulatory classes driving real-world financial system architectures.
          </p>
        </div>

        {/* Global Search Bar */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-3.5 h-3.5" />
          <input
            type="text"
            placeholder="Search fintech terminology..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white rounded-lg pl-9 pr-3 py-2 text-xs font-semibold shadow-2xs transition-all outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 font-bold bg-slate-200/50 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-1.5 py-0.5 rounded-md transition-colors"
            >
              CLEAR
            </button>
          )}
        </div>
      </div>

      {/* Glossary Search Results Panel */}
      <AnimatePresence>
        {searchQuery && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-blue-50/80 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-3xl p-6 space-y-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-blue-900 dark:text-blue-400 uppercase tracking-widest flex items-center gap-2">
                <Search className="w-4 h-4" />
                Glossary Lookup: "{searchQuery}"
              </span>
              <span className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                {filteredGlossary.length} matches found
              </span>
            </div>

            {filteredGlossary.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredGlossary.map((g, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-900 border border-blue-100/80 dark:border-blue-900/50 p-5 rounded-2xl shadow-sm space-y-3 transition-all hover:border-blue-300 dark:hover:border-blue-700">
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="font-black text-slate-900 dark:text-white text-sm">{g.term}</h4>
                      <button 
                        onClick={() => handleSelectClass(g.classId)}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline shrink-0 font-black uppercase tracking-widest"
                      >
                        Go to Class
                      </button>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed font-medium">{g.definition}</p>
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 leading-normal">
                      <span className="font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest block mb-1">Practical Engineering:</span>
                      {g.practicalUse}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 dark:text-slate-400 text-sm py-4 italic text-center font-medium">
                No matching fintech concepts found. Try searching for terms like "FedNow", "MDR", "Oracle", "BaaS", "MTL", or "Saga".
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid: Left Selector Sidebar, Right Class Workroom */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Selector Sidebar */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-5 shadow-sm sticky top-6">
          <div className="pb-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-end">
            <div>
              <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-0.5">
                Academic Syllabus Plan
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                12 Masterclass Sessions
              </span>
            </div>
            <Layers className="w-5 h-5 text-slate-300 dark:text-slate-600" />
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {LECTURE_CLASSES.map((c) => {
              const isSelected = c.id === selectedClassId;

              return (
                <button
                  key={c.id}
                  onClick={() => handleSelectClass(c.id)}
                  className={cn(
                    "w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3.5 relative group",
                    isSelected
                      ? "bg-slate-900 dark:bg-blue-600 border-slate-900 dark:border-blue-500 text-white shadow-md"
                      : "bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-900"
                  )}
                >
                  <div className={cn(
                    "mt-0.5 shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shadow-inner",
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400"
                  )}>
                    {LECTURE_CLASSES.indexOf(c) + 1}
                  </div>
                  
                  <div className="flex-1 min-w-0 space-y-1">
                    <span className={cn(
                      "block text-sm font-black leading-snug line-clamp-2",
                      isSelected ? "text-white" : "text-slate-900 dark:text-white"
                    )}>
                      {c.title.replace(/Class \d+:\s+/, '')}
                    </span>
                    <span className={cn(
                      "block text-xs font-semibold truncate uppercase tracking-wide",
                      isSelected ? "text-slate-300 dark:text-blue-100" : "text-slate-500 dark:text-slate-400"
                    )}>
                      {c.subtitle}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Class Workroom */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Active Class Header Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-3xl shadow-sm space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <GraduationCap className="w-32 h-32" />
            </div>
            
            <div className="flex items-center gap-2.5 relative z-10">
              <span className="text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-300 font-black px-3 py-1 rounded-lg uppercase tracking-widest shrink-0 shadow-inner">
                LOCKED SYLLABUS RECORD
              </span>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest">
                {activeClass.id.replace('-', ' ')} SESSION NOTES
              </span>
            </div>

            <div className="space-y-1.5 relative z-10">
              <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
                {activeClass.title}
              </h3>
              <p className="text-blue-600 dark:text-blue-400 text-sm font-bold uppercase tracking-widest">
                {activeClass.subtitle}
              </p>
            </div>

            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-medium pt-4 border-t border-slate-100 dark:border-slate-800 relative z-10">
              {activeClass.overview}
            </p>
          </div>

          {/* Sub-tab Navigation */}
          <div className="flex bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl gap-1 shadow-inner border border-slate-200/80 dark:border-slate-800/80">
            <button
              onClick={() => setActiveSubTab('slides')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                activeSubTab === 'slides'
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900"
              )}
            >
              <Layers className="w-4 h-4" />
              <span>Lecture Slides</span>
            </button>
            <button
              onClick={() => setActiveSubTab('syllabus')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                activeSubTab === 'syllabus'
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900"
              )}
            >
              <BookOpen className="w-4 h-4" />
              <span>Syllabus & Lexicon</span>
            </button>
            <button
              onClick={() => setActiveSubTab('handout')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                activeSubTab === 'handout'
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900"
              )}
            >
              <Award className="w-4 h-4" />
              <span>Capstone Blueprint</span>
            </button>
            <button
              onClick={() => setActiveSubTab('video')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                activeSubTab === 'video'
                  ? "bg-red-600 text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900"
              )}
            >
              <Play className="w-4 h-4 text-red-500 fill-current shrink-0" />
              <span>Video Review</span>
            </button>
          </div>

          {/* Active Sub-tab Content Area */}
          <div className="min-h-[420px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${selectedClassId}-${activeSubTab}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.18 }}
              >
                
                {/* SUBTAB 1: LECTURE SLIDES */}
                {activeSubTab === 'slides' && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden flex flex-col justify-between min-h-[450px]">
                    
                    {/* Slide Workspace Screen */}
                    <div className="p-6 md:p-10 space-y-8 flex-1">
                      
                      {/* Slide Indicator and Progress */}
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                        <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                          SLIDE {slideIndex + 1} OF {activeClass.slides.length}
                        </span>
                        
                        <div className="flex gap-1.5 w-32">
                          {activeClass.slides.map((_, idx) => (
                            <div 
                              key={idx}
                              className={cn(
                                "h-1.5 flex-1 rounded-full transition-colors",
                                idx === slideIndex ? "bg-slate-900 dark:bg-slate-100" : "bg-slate-200 dark:bg-slate-800"
                              )}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Active Slide Body */}
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <h4 className="text-2xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
                            {activeClass.slides[slideIndex]?.title}
                          </h4>
                          <p className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest">
                            {activeClass.slides[slideIndex]?.subtitle}
                          </p>
                        </div>

                        {/* Bullets List */}
                        <ul className="space-y-3.5">
                          {activeClass.slides[slideIndex]?.bullets.map((b, bIdx) => (
                            <li key={bIdx} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                              <span className="w-1.5 h-1.5 bg-slate-900 dark:bg-slate-100 rounded-full mt-2 shrink-0" />
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>

                        {/* High-End Example Card */}
                        {activeClass.slides[slideIndex]?.exampleCard && (
                          <div className="pt-4">
                            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/10 border border-indigo-200 dark:border-indigo-900/40 rounded-[2rem] p-6 shadow-sm">
                              <h4 className="flex items-center gap-2 text-sm font-black font-display text-indigo-900 dark:text-indigo-400 uppercase tracking-widest mb-4 pb-3 border-b border-indigo-200 dark:border-indigo-900/60">
                                <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-500" />
                                {activeClass.slides[slideIndex].exampleCard.title}
                              </h4>
                              <p className="text-slate-700 dark:text-slate-300 font-medium mb-4">
                                {activeClass.slides[slideIndex].exampleCard.description}
                              </p>
                              <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 mb-4 shadow-sm">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Example</span>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">
                                  {activeClass.slides[slideIndex].exampleCard.example}
                                </p>
                              </div>
                              <div className="text-sm text-indigo-800 dark:text-indigo-200 leading-relaxed bg-indigo-100/50 dark:bg-indigo-900/30 p-4 rounded-xl border border-indigo-200/50 dark:border-indigo-800/30">
                                <span className="font-bold block mb-1">Why it matters:</span>
                                {activeClass.slides[slideIndex].exampleCard.explanation}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Optional Diagram Block */}
                        {activeClass.slides[slideIndex]?.diagramTitle && (
                          <div className="pt-4 space-y-3">
                            <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block">
                              {activeClass.slides[slideIndex].diagramTitle}
                            </span>
                            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-2 font-mono text-xs text-slate-700 dark:text-slate-300 shadow-inner">
                              {activeClass.slides[slideIndex].diagramData?.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                  <span className="w-5 h-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg flex items-center justify-center text-xs font-black shrink-0 shadow-sm">
                                    {idx + 1}
                                  </span>
                                  <span>{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Slide Controller Strip */}
                    <div className="bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 px-6 md:px-8 py-5 flex items-center justify-between gap-4">
                      <button
                        type="button"
                        disabled={slideIndex === 0}
                        onClick={handlePrevSlide}
                        className={cn(
                          "flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 px-5 py-2.5 rounded-xl text-xs font-black text-slate-700 dark:text-slate-300 transition-all uppercase tracking-wider",
                          slideIndex === 0 && "opacity-40 cursor-not-allowed hover:bg-white dark:hover:bg-slate-900 hover:border-slate-200 dark:hover:border-slate-700"
                        )}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Previous</span>
                      </button>

                      <div className="text-xs font-black text-slate-400 dark:text-slate-500 font-mono uppercase tracking-widest hidden sm:block">
                        STUDY DECK
                      </div>

                      <button
                        type="button"
                        disabled={slideIndex === activeClass.slides.length - 1}
                        onClick={handleNextSlide}
                        className={cn(
                          "flex items-center gap-1.5 bg-slate-900 dark:bg-blue-600 hover:bg-black dark:hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-wider shadow-sm",
                          slideIndex === activeClass.slides.length - 1 && "opacity-40 cursor-not-allowed hover:bg-slate-900 dark:hover:bg-blue-600"
                        )}
                      >
                        <span>Next Slide</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* SUBTAB 2: SYLLABUS & LEXICON */}
                {activeSubTab === 'syllabus' && (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    
                    {/* Left Outcomes list */}
                    <div className="md:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-3xl shadow-sm space-y-5 h-fit">
                      <div className="flex items-center gap-2.5 text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-4">
                        <GraduationCap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        <h4 className="font-black text-sm uppercase tracking-widest">Syllabus Outcomes</h4>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed font-medium">
                        Graduating this class module requires mastering the following core learning objectives:
                      </p>
                      <ul className="space-y-4 pt-2">
                        {activeClass.learningOutcomes.map((outcome, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-sm text-slate-800 dark:text-slate-200 leading-normal font-medium">
                            <div className="w-5 h-5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50 rounded-md flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                              ✓
                            </div>
                            <span>{outcome}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Right Key concepts vocab loop */}
                    <div className="md:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-3xl shadow-sm space-y-6">
                      <div className="flex items-center gap-2.5 text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-4">
                        <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <h4 className="font-black text-sm uppercase tracking-widest">Academic Glossary</h4>
                      </div>
                      
                      <div className="space-y-4">
                        {activeClass.keyConcepts.map((concept, idx) => (
                          <div key={idx} className="space-y-2.5 group/concept p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition-all shadow-inner">
                            <h5 className="font-black text-slate-900 dark:text-white text-sm flex items-center gap-2.5">
                              <span className="w-1.5 h-1.5 bg-blue-500 dark:bg-blue-400 rounded-full group-hover/concept:scale-150 transition-transform" />
                              {concept.term}
                            </h5>
                            <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed pl-4 font-medium">
                              {concept.definition}
                            </p>
                            <div className="pl-4 pt-2 mt-2 border-t border-slate-200 dark:border-slate-800/50 text-xs text-slate-500 dark:text-slate-500 font-medium leading-normal">
                              <span className="font-black text-slate-700 dark:text-slate-400 uppercase tracking-widest block mb-1">Under the hood implementation:</span>
                              {concept.practicalUse}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* SUBTAB 3: APPLIED PROJECT HANDOUT */}
                {activeSubTab === 'handout' && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-10 rounded-3xl shadow-sm space-y-8">
                    
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-slate-100 dark:border-slate-800 pb-6">
                      <div className="space-y-2.5">
                        <span className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest">
                          <Award className="w-3.5 h-3.5" />
                          <span>REQUIRED VENTURE OUTSIDE WORK</span>
                        </span>
                        <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                          {activeClass.appliedProjectHandout.title}
                        </h4>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                          {activeClass.appliedProjectHandout.description}
                        </p>
                      </div>

                      <div className="text-right shrink-0 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-inner">
                        <span className="text-xs text-slate-500 dark:text-slate-400 block font-black uppercase tracking-widest mb-1.5">
                          REUSABLE ARTIFACT
                        </span>
                        <span className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-1.5 rounded-lg font-bold block shadow-sm">
                          {activeClass.appliedProjectHandout.reusableOutput}
                        </span>
                      </div>
                    </div>

                    {/* Specifications and Interactive Checks */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      
                      {/* Left: Spec list Checklist checkboxes */}
                      <div className="space-y-5">
                        <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
                          <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">
                            Artifact Verification Steps
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                          Build this venture asset in your personal draft deck. Check off these elements as you draft them to confirm compliant coverage:
                        </p>

                        <div className="space-y-3 pt-1">
                          {activeClass.appliedProjectHandout.checklist.map((item, idx) => {
                            const itemKey = `${activeClass.id}-${idx}`;
                            const isTicked = !!checklistState[itemKey];

                            return (
                              <button
                                key={idx}
                                onClick={() => toggleChecklistItem(activeClass.id, idx)}
                                className={cn(
                                  "w-full flex items-start gap-4 p-4 rounded-2xl border text-left transition-all",
                                  isTicked 
                                    ? "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 line-through shadow-inner"
                                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-800 dark:text-slate-200 shadow-sm hover:shadow-md"
                                )}
                              >
                                <div className={cn(
                                  "w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                                  isTicked 
                                    ? "bg-emerald-500 border-emerald-500 text-white" 
                                    : "border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800"
                                )}>
                                  {isTicked && <span className="text-xs font-black">✓</span>}
                                </div>
                                <span className="text-sm leading-normal font-medium">{item}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Right: Technical engineering requirements */}
                      <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-3xl space-y-5 h-fit shadow-inner">
                        <div className="flex items-center gap-2.5 border-b border-slate-200 dark:border-slate-800 pb-3">
                          <FileText className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                          <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">
                            Syllabus Engineering Spec
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                          For submission to our mock venture board, this asset must satisfy the following technical requirements:
                        </p>

                        <div className="bg-white dark:bg-black border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm font-mono text-xs text-slate-700 dark:text-slate-300 leading-relaxed overflow-x-auto">
                          <span className="font-black text-slate-800 dark:text-slate-400 uppercase tracking-widest text-xs block mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">
                            ENGINEERING METADATA SPEC
                          </span>
                          <pre className="whitespace-pre-wrap">{activeClass.appliedProjectHandout.technicalSpec}</pre>
                        </div>

                        <div className="pt-3 flex items-center gap-2.5 text-xs text-emerald-700 dark:text-emerald-400 font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-xl border border-emerald-100 dark:border-emerald-800/50">
                          <ShieldCheck className="w-4 h-4 shrink-0" />
                          <span>Satisfies 100% of National Curriculum Audits</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SUBTAB 4: VIDEO MASTERCLASS REVIEW */}
                {activeSubTab === 'video' && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-3xl shadow-sm space-y-6">
                    <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                      <span className="text-xs font-black text-red-500 uppercase tracking-widest block mb-1">
                        Syllabus Masterclass Video
                      </span>
                      <h4 className="text-xl font-black text-slate-900 dark:text-white">
                        {CLASS_VIDEOS[activeClass.id]?.title || activeClass.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        High-fidelity visual review to reinforce {activeClass.title} core concepts, system flows, and technical architectures.
                      </p>
                    </div>

                    <YouTubeVideoPlayer
                      videoId={CLASS_VIDEOS[activeClass.id]?.id || 's7R6_H5tB_M'}
                      title={CLASS_VIDEOS[activeClass.id]?.title || activeClass.title}
                      description={activeClass.overview}
                    />
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
