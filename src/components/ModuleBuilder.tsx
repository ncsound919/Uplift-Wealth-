import React, { useState, ComponentType } from 'react';
import { 
  Wallet, 
  Building2, 
  Code2, 
  ShieldCheck, 
  CreditCard, 
  Cpu, 
  Network, 
  LineChart, 
  Shield, 
  Landmark, 
  Scale, 
  Coins, 
  Award, 
  BookOpen, 
  Globe,
  Plus,
  Trash2,
  Check,
  ChevronRight,
  ChevronDown,
  Play,
  HelpCircle,
  Code,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { Module, LessonContent, QuizQuestion, CourseLevel } from '../data/courseData';

const AVAILABLE_ICONS = [
  { name: 'Landmark', comp: Landmark },
  { name: 'CreditCard', comp: CreditCard },
  { name: 'Building2', comp: Building2 },
  { name: 'Coins', comp: Coins },
  { name: 'LineChart', comp: LineChart },
  { name: 'Shield', comp: Shield },
  { name: 'Cpu', comp: Cpu },
  { name: 'ShieldCheck', comp: ShieldCheck },
  { name: 'Wallet', comp: Wallet },
  { name: 'Scale', comp: Scale },
  { name: 'Code2', comp: Code2 },
  { name: 'Award', comp: Award },
  { name: 'Network', comp: Network },
  { name: 'BookOpen', comp: BookOpen },
  { name: 'Globe', comp: Globe }
];

const AVAILABLE_COLORS = [
  { class: 'bg-indigo-600', name: 'Indigo' },
  { class: 'bg-sky-500', name: 'Sky Blue' },
  { class: 'bg-emerald-600', name: 'Emerald' },
  { class: 'bg-amber-600', name: 'Amber' },
  { class: 'bg-blue-700', name: 'Ocean Blue' },
  { class: 'bg-purple-600', name: 'Purple' },
  { class: 'bg-slate-700', name: 'Slate Gray' },
  { class: 'bg-rose-600', name: 'Rose Red' },
  { class: 'bg-[#121212]', name: 'Lux Onyx' },
  { class: 'bg-indigo-900', name: 'Deep Royal' }
];

interface ModuleBuilderProps {
  onSave: (module: Module) => void;
  onCancel: () => void;
  initialModule?: Module | null;
}

export function ModuleBuilder({ onSave, onCancel, initialModule }: ModuleBuilderProps) {
  const [level, setLevel] = useState<CourseLevel>(initialModule?.level || 'beginner');
  const [title, setTitle] = useState(initialModule?.title || '');
  const [description, setDescription] = useState(initialModule?.description || '');
  const [iconName, setIconName] = useState(
    typeof initialModule?.icon === 'string' ? initialModule.icon : 'Landmark'
  );
  const [colorClass, setColorClass] = useState(initialModule?.color || 'bg-indigo-600');
  
  // Lessons
  const [lessons, setLessons] = useState<LessonContent[]>(initialModule?.lessons || [
    {
      id: 'custom-lesson-1',
      title: 'Introduction to Custom Curriculum',
      type: 'text',
      content: '### Welcome to your custom lesson!\nEdit this content with Markdown syntax.'
    }
  ]);

  const [activeLessonIndex, setActiveLessonIndex] = useState(0);

  const handleAddLesson = () => {
    const newId = `custom-lesson-${Date.now()}`;
    const newLesson: LessonContent = {
      id: newId,
      title: `Lesson ${lessons.length + 1}`,
      type: 'text',
      content: '### New Lesson Content\nAdd your lesson curriculum details here.'
    };
    setLessons([...lessons, newLesson]);
    setActiveLessonIndex(lessons.length);
  };

  const handleRemoveLesson = (index: number) => {
    /* v8 ignore next -- @preserve the trash icon only renders when lessons.length > 1 */
    if (lessons.length <= 1) return;
    const nextLessons = lessons.filter((_, i) => i !== index);
    setLessons(nextLessons);
    setActiveLessonIndex(Math.max(0, index - 1));
  };

  const handleUpdateLessonField = (key: keyof LessonContent, value: any) => {
    const updated = [...lessons];
    updated[activeLessonIndex] = {
      ...updated[activeLessonIndex],
      [key]: value
    };
    setLessons(updated);
  };

  const handleUpdateQuizQuestion = (qIndex: number, updatedQuestion: QuizQuestion) => {
    const updated = [...lessons];
    const currentQuiz = updated[activeLessonIndex].quiz ? [...updated[activeLessonIndex].quiz!] : [];
    currentQuiz[qIndex] = updatedQuestion;
    updated[activeLessonIndex] = {
      ...updated[activeLessonIndex],
      quiz: currentQuiz
    };
    setLessons(updated);
  };

  const handleAddQuizQuestion = () => {
    const updated = [...lessons];
    const currentQuiz = updated[activeLessonIndex].quiz ? [...updated[activeLessonIndex].quiz!] : [];
    currentQuiz.push({
      question: 'New Question?',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 0,
      explanation: 'Explanation for correct option.'
    });
    updated[activeLessonIndex] = {
      ...updated[activeLessonIndex],
      quiz: currentQuiz
    };
    setLessons(updated);
  };

  const handleRemoveQuizQuestion = (qIndex: number) => {
    const updated = [...lessons];
    const currentQuiz = updated[activeLessonIndex].quiz ? [...updated[activeLessonIndex].quiz!] : [];
    const nextQuiz = currentQuiz.filter((_, i) => i !== qIndex);
    updated[activeLessonIndex] = {
      ...updated[activeLessonIndex],
      quiz: nextQuiz
    };
    setLessons(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const moduleData: Module = {
      id: initialModule?.id || `custom-module-${Date.now()}`,
      level,
      title,
      description,
      icon: iconName as unknown as ComponentType<{ size?: number; strokeWidth?: number }>,
      color: colorClass,
      lessons
    };

    onSave(moduleData);
  };

  const currentActiveLesson = lessons[activeLessonIndex];

  return (
    <div id="module-builder-canvas" className="max-w-[1600px] mx-auto p-4 md:p-6 space-y-6">
      
      {/* Header back row */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <button 
          onClick={onCancel}
          className="flex items-center text-slate-700 font-bold hover:text-slate-900 transition-colors bg-white border border-slate-200 hover:border-slate-300 px-4 py-2 rounded-xl text-xs shadow-xs"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span>Exit Module Builder</span>
        </button>
        <span className="text-xs text-slate-500 font-extrabold uppercase tracking-widest font-mono">
          Interactive Course Studio
        </span>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: General Module Details & Interactive Card Preview */}
        <div className="space-y-6 lg:col-span-1">
          
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-5">
            <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>1. Module Settings</span>
            </h3>

            {/* Title Input */}
            <div className="space-y-1.5">
              <label className="block text-xs uppercase font-black text-slate-500 tracking-wider">Module Title</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Modern Payments Engineering" 
                required
                className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 bg-slate-50/50"
              />
            </div>

            {/* Description Textarea */}
            <div className="space-y-1.5">
              <label className="block text-xs uppercase font-black text-slate-500 tracking-wider">Short Summary</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe what students will learn in this core module..." 
                rows={3}
                required
                className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 bg-slate-50/50 leading-relaxed"
              />
            </div>

            {/* Level Select */}
            <div className="space-y-1.5">
              <label className="block text-xs uppercase font-black text-slate-500 tracking-wider">Track Difficulty</label>
              <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
                {(['beginner', 'intermediate', 'expert'] as CourseLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setLevel(lvl)}
                    className={`py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                      level === lvl
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Palette Picker */}
            <div className="space-y-1.5">
              <label className="block text-xs uppercase font-black text-slate-500 tracking-wider">Accent Palette</label>
              <div className="grid grid-cols-5 gap-2">
                {AVAILABLE_COLORS.map((col) => (
                  <button
                    key={col.class}
                    type="button"
                    title={col.name}
                    onClick={() => setColorClass(col.class)}
                    className={`h-7 rounded-lg border-2 transition-transform duration-100 flex items-center justify-center shrink-0 ${col.class} ${
                      colorClass === col.class 
                        ? 'border-slate-800 scale-110 shadow-sm' 
                        : 'border-white hover:scale-105'
                    }`}
                  >
                    {colorClass === col.class && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Icon Picker */}
            <div className="space-y-1.5">
              <label className="block text-xs uppercase font-black text-slate-500 tracking-wider">Icon Symbol</label>
              <div className="grid grid-cols-5 gap-2 max-h-[140px] overflow-y-auto pr-1">
                {AVAILABLE_ICONS.map((ico) => {
                  const IconComp = ico.comp;
                  return (
                    <button
                      key={ico.name}
                      type="button"
                      title={ico.name}
                      onClick={() => setIconName(ico.name)}
                      className={`h-8 rounded-lg border flex items-center justify-center transition-all ${
                        iconName === ico.name
                          ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-3xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <IconComp className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Interactive live card preview */}
          <div className="bg-slate-100/50 border border-slate-200 p-5 rounded-2xl space-y-3">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest block">Live Dashboard Preview</span>
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs min-h-[220px] flex flex-col justify-between">
              <div>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white mb-3 shadow-xs ${colorClass}`}>
                  {React.createElement(
                    AVAILABLE_ICONS.find(i => i.name === iconName)?.comp || Landmark,
                    { size: 22 }
                  )}
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-1 leading-tight">{title || 'Untitled Curriculum'}</h4>
                <p className="text-slate-500 text-xs leading-normal line-clamp-2">{description || 'No summary added yet. Build setting details above.'}</p>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-3">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">{level} track</span>
                <span className="text-xs text-blue-600 font-extrabold uppercase tracking-widest">{lessons.length} stages</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Lessons Builder Workspace */}
        <div className="space-y-6 lg:col-span-2">
          
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span>2. Core Syllabus Designer</span>
              </h3>
              <button
                type="button"
                onClick={handleAddLesson}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Stage</span>
              </button>
            </div>

            {/* Stages Grid Navigation */}
            <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-100">
              {lessons.map((lesson, idx) => (
                <button
                  key={lesson.id}
                  type="button"
                  onClick={() => setActiveLessonIndex(idx)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                    idx === activeLessonIndex
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  <span className="font-mono text-xs">#{idx + 1}</span>
                  <span>{lesson.title || 'Untitled Stage'}</span>
                  {lessons.length > 1 && (
                    <span 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveLesson(idx);
                      }}
                      className="ml-1 text-slate-400 hover:text-rose-500 rounded-sm hover:bg-black/10 p-0.5"
                    >
                      <Trash2 className="w-3 h-3" />
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Selected Lesson Workspace */}
            {currentActiveLesson && (
              <div className="space-y-5 bg-slate-50/50 p-5 rounded-xl border border-slate-200/80">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    Editing Curriculum Stage #{activeLessonIndex + 1}
                  </span>
                  
                  {/* Lesson Type selector */}
                  <div className="flex gap-1.5 bg-white p-1 rounded-xl border border-slate-200">
                    {[
                      { type: 'text', label: '📖 Text Content' },
                      { type: 'quiz', label: '📝 Assessment Quiz' },
                      { type: 'game', label: '🎮 Live Game' }
                    ].map((btn) => (
                      <button
                        key={btn.type}
                        type="button"
                        onClick={() => handleUpdateLessonField('type', btn.type)}
                        className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                          currentActiveLesson.type === btn.type
                            ? 'bg-blue-50 text-blue-700 shadow-2xs font-extrabold'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stage Title */}
                <div className="space-y-1.5">
                  <label className="block text-xs uppercase font-black text-slate-500 tracking-wider">Stage Title</label>
                  <input 
                    type="text"
                    value={currentActiveLesson.title}
                    onChange={(e) => handleUpdateLessonField('title', e.target.value)}
                    placeholder="e.g. Cleared Settlement and Timelines"
                    required
                    className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 bg-white"
                  />
                </div>

                {/* Text Content Editor */}
                {currentActiveLesson.type === 'text' && (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs uppercase font-black text-slate-500 tracking-wider">Markdown Lesson Body</label>
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider font-mono">MD Supported</span>
                      </div>
                      <textarea
                        value={currentActiveLesson.content || ''}
                        onChange={(e) => handleUpdateLessonField('content', e.target.value)}
                        placeholder="### Lesson core headings...&#10;Write comprehensive, thorough curriculum materials here using markdown format."
                        rows={10}
                        required
                        className="w-full text-xs font-mono p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 bg-white leading-relaxed"
                      />
                    </div>
                  </div>
                )}

                {/* Quiz Builder */}
                {currentActiveLesson.type === 'quiz' && (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Interactive Quiz Editor</span>
                      <button
                        type="button"
                        onClick={handleAddQuizQuestion}
                        className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg text-xs font-bold transition-all shadow-3xs"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Question</span>
                      </button>
                    </div>

                    {(!currentActiveLesson.quiz || currentActiveLesson.quiz.length === 0) ? (
                      <div className="text-center py-8 bg-white border border-dashed border-slate-200 rounded-xl">
                        <HelpCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <span className="text-xs font-bold text-slate-500 block mb-3">No Quiz Questions Added Yet</span>
                        <button
                          type="button"
                          onClick={handleAddQuizQuestion}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs border border-slate-200"
                        >
                          Create First Question
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {currentActiveLesson.quiz.map((q, qIdx) => (
                          <div key={qIdx} className="bg-white border border-slate-200 rounded-xl p-4 space-y-4 relative shadow-3xs">
                            
                            <button
                              type="button"
                              onClick={() => handleRemoveQuizQuestion(qIdx)}
                              className="absolute top-4 right-4 text-slate-400 hover:text-rose-500 rounded-lg p-1 hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>

                            <div className="space-y-1.5 pr-8">
                              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold font-mono">Q #{qIdx + 1}</span>
                              <input 
                                type="text"
                                value={q.question}
                                onChange={(e) => handleUpdateQuizQuestion(qIdx, { ...q, question: e.target.value })}
                                placeholder="Write the question prompt..."
                                required
                                className="w-full text-xs font-bold p-2.5 rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500 bg-slate-50/50"
                              />
                            </div>

                            {/* Options */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                              {q.options.map((opt, optIdx) => (
                                <div key={optIdx} className="space-y-1">
                                  <label className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Option {optIdx + 1}</label>
                                  <input 
                                    type="text"
                                    value={opt}
                                    onChange={(e) => {
                                      const nextOpts = [...q.options];
                                      nextOpts[optIdx] = e.target.value;
                                      handleUpdateQuizQuestion(qIdx, { ...q, options: nextOpts });
                                    }}
                                    required
                                    className="w-full text-xs font-medium p-2 rounded-lg border border-slate-200 bg-slate-50/50"
                                  />
                                </div>
                              ))}
                            </div>

                            {/* Correct Option Selector */}
                            <div className="space-y-1.5">
                              <label className="block text-xs uppercase font-black text-slate-500 tracking-wider">Correct Option</label>
                              <div className="flex gap-2">
                                {q.options.map((_, optIdx) => (
                                  <button
                                    key={optIdx}
                                    type="button"
                                    onClick={() => handleUpdateQuizQuestion(qIdx, { ...q, correctAnswer: optIdx })}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                      q.correctAnswer === optIdx
                                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-3xs'
                                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                                    }`}
                                  >
                                    Option {optIdx + 1}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Explanation field */}
                            <div className="space-y-1">
                              <label className="block text-xs uppercase font-black text-slate-500 tracking-wider">Correct Answer Explanation</label>
                              <textarea
                                value={q.explanation}
                                onChange={(e) => handleUpdateQuizQuestion(qIdx, { ...q, explanation: e.target.value })}
                                placeholder="Why is this option correct? Give a solid, academic reason."
                                rows={2}
                                required
                                className="w-full text-xs font-medium p-2.5 rounded-lg border border-slate-200 bg-slate-50/50"
                              />
                            </div>

                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Sandbox Game type selector */}
                {currentActiveLesson.type === 'game' && (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs uppercase font-black text-slate-500 tracking-wider">Pick Sandbox Simulator Mode</label>
                      <div className="grid grid-cols-2 gap-2 bg-white p-2 rounded-xl border border-slate-200">
                        {[
                          { type: 'trading', label: '📈 Stock Sim Terminal Game' },
                          { type: 'capstone', label: '🎓 Interactive Capstone Pitch Canvas' },
                          { type: 'underwriting', label: '📊 Risk Score Underwriting Game' },
                          { type: 'parametric', label: '⛈️ Parametric Insurance Oracle Payouts' },
                          { type: 'fraud', label: '🚨 AML compliance Sanction Scanner' }
                        ].map((g) => (
                          <button
                            key={g.type}
                            type="button"
                            onClick={() => handleUpdateLessonField('gameType', g.type)}
                            className={`p-3 rounded-lg text-xs font-bold text-left border transition-all ${
                              currentActiveLesson.gameType === g.type
                                ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-3xs'
                                : 'border-slate-100 hover:bg-slate-50 text-slate-600 bg-white'
                            }`}
                          >
                            {g.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* Bottom Actions Row */}
            <div className="flex justify-end gap-3 pt-5 border-t border-slate-100">
              <button
                type="button"
                onClick={onCancel}
                className="px-5 py-2.5 rounded-xl text-xs font-bold border border-slate-300 hover:bg-slate-50 bg-white text-slate-700 shadow-3xs transition-colors"
              >
                Discard Changes
              </button>
              <button
                type="submit"
                className="bg-slate-900 hover:bg-black active:scale-95 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition-all"
              >
                Save Course Module
              </button>
            </div>

          </div>

        </div>

      </form>

    </div>
  );
}
