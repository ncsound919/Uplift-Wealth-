import { useMemo } from 'react';
import { Printer, GraduationCap, Users, BookOpen, Award, ArrowLeft, Compass, ClipboardList, Link2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { courseModules } from '../data/courseData';
import { LECTURE_CLASSES } from '../data/lectureLibrary';
import { classroomMaterials } from '../data/institutionalCurriculum';

export function InstitutionalCurriculum() {
  const navigate = useNavigate();

  const moduleRows = useMemo(() => courseModules.map((m) => {
    const lecture = LECTURE_CLASSES.find((c) => c.moduleId === m.id);
    const gameTypes = [...new Set(m.lessons.map((l) => l.gameType).filter(Boolean))];
    const materials = classroomMaterials[m.id];
    return {
      id: m.id,
      title: m.title.replace(/^\d+\.\s*/, ''),
      description: m.description,
      lessons: m.lessons.length,
      lecture: lecture?.title,
      game: gameTypes[0] || null,
      instructorDirection: materials?.instructorDirection ?? '',
      worksheet: materials?.worksheet ?? '',
      references: materials?.references ?? [],
    };
  }), []);

  const totalLessons = useMemo(() => courseModules.reduce((acc, m) => acc + m.lessons.length, 0), []);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      {/* Toolbar (hidden when printing) */}
      <div className="flex items-center justify-between print:hidden">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider cursor-pointer transition-colors"
        >
          <Printer className="w-4 h-4" /> Download as PDF
        </button>
      </div>

      {/* Document */}
      <div id="institutional-doc" className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-12 shadow-sm">
        {/* Title block */}
        <div className="text-center border-b border-slate-200 dark:border-slate-800 pb-8">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-amber-500 text-white text-[10px] font-black uppercase tracking-wider">
            <GraduationCap className="w-3.5 h-3.5" /> Overlay Wealth
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mt-3">Institutional Classroom Curriculum</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-2xl mx-auto leading-relaxed">
            A ready-to-adopt financial literacy curriculum for classrooms, HBCU chapters, churches, and community organizations. Built for the way real communities learn — together.
          </p>
        </div>

        {/* How to adopt */}
        <section className="py-6">
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-500" /> How to adopt in 3 steps
          </h2>
          <ol className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <li className="flex gap-3"><span className="font-black text-emerald-600">1.</span> <span><strong className="text-slate-900 dark:text-white">Create a Group</strong> — an instructor spins up a "Learning Group" (church circle, HBCU chapter, club) in minutes.</span></li>
            <li className="flex gap-3"><span className="font-black text-emerald-600">2.</span> <span><strong className="text-slate-900 dark:text-white">Assign the curriculum</strong> — pick the modules below; each member sees their own progress on the roster.</span></li>
            <li className="flex gap-3"><span className="font-black text-emerald-600">3.</span> <span><strong className="text-slate-900 dark:text-white">Run it together</strong> — leaderboards, discussions, and certificates keep learners accountable and celebrating.</span></li>
          </ol>
        </section>

        {/* Curriculum table */}
        <section className="py-4">
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-500" /> Curriculum — {courseModules.length} modules · {totalLessons} lessons
          </h2>
          <div className="mt-4 space-y-3">
            {moduleRows.map((m) => (
              <div key={m.id} className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white flex items-center justify-center font-black">
                      {m.id.replace('module-', '')}
                    </div>
                    <div>
                      <div className="text-sm font-black text-slate-900 dark:text-white">{m.title}</div>
                      {m.lecture && <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">Instructor lecture: {m.lecture}</div>}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    {m.game && <span className="inline-block px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 text-[10px] font-black uppercase">Game</span>}
                    <div className="text-[10px] text-slate-400 mt-1">{m.lessons} lessons</div>
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{m.description}</p>

                {m.instructorDirection && (
                  <div className="mt-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 p-3">
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                      <Compass className="w-3 h-3" /> Instructor direction
                    </div>
                    <p className="text-xs text-emerald-900 dark:text-emerald-100 mt-1 leading-relaxed">{m.instructorDirection}</p>
                  </div>
                )}

                {m.worksheet && (
                  <div className="mt-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3">
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                      <ClipboardList className="w-3 h-3" /> Student worksheet
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">{m.worksheet}</p>
                  </div>
                )}

                {m.references.length > 0 && (
                  <div className="mt-2 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 p-3">
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-700 dark:text-indigo-400">
                      <Link2 className="w-3 h-3" /> References
                    </div>
                    <ul className="mt-1 space-y-0.5">
                      {m.references.map((r) => (
                        <li key={r} className="text-[11px] text-indigo-900 dark:text-indigo-200 leading-relaxed">• {r}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* What's included */}
        <section className="pt-2 pb-6">
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-500" /> What's included
          </h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2 text-sm text-slate-600 dark:text-slate-300">
            {[
              'Full access to all 16 modules for up to 50 seats',
              'Interactive simulators & games (trading, underwriting, fraud)',
              'Wealth Building chapters (credit, investing, real estate, business, group economics)',
              'Group leaderboards & teacher roster analytics',
              'Lesson discussions & notifications',
              'Certificates of completion',
              'Verified-educator support for instructors',
              'Classroom curriculum guide (this document)',
            ].map((f) => (
              <li key={f} className="flex items-start gap-2 text-xs">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" /> {f}
              </li>
            ))}
          </ul>
        </section>

        {/* Footer */}
        <section className="border-t border-slate-200 dark:border-slate-800 pt-6 text-center space-y-1 print:block hidden">
          <p className="text-sm font-black text-slate-900 dark:text-white">Institutional plan — $99/mo · up to 50 seats</p>
          <p className="text-xs text-slate-400">Free membership includes the complete curriculum. Institutional pricing adds groups, classroom management, and roster analytics.</p>
          <p className="text-xs text-slate-400 pt-2">Overlay Wealth · part of Overlay365 · Overlay365.com</p>
        </section>
      </div>
    </div>
  );
}
