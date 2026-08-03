import { motion } from 'motion/react';
import { Flame, Clock, Target, BookOpen, TrendingUp, CheckCircle2, Lock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface ProgressDashboardProps {
  modules: { id: string; title: string; level: string; color: string }[];
  completedModules: string[];
  completedLessons: string[];
  xp: number;
  streak: number;
  gameTimeSeconds: number;
  badges: string[];
  onSelectModule: (id: string) => void;
}

export function ProgressDashboard({
  modules,
  completedModules,
  completedLessons,
  xp,
  streak,
  gameTimeSeconds,
  badges,
  onSelectModule,
}: ProgressDashboardProps) {
  const totalModules = modules.length;
  const totalLessons = modules.reduce((sum, m) => sum + (m.level === 'beginner' ? 12 : 8), 0);
  const moduleProgress = Math.round((completedModules.length / totalModules) * 100);
  const lessonProgress = Math.round((completedLessons.length / Math.max(1, totalLessons)) * 100);
  const level = Math.floor(Math.sqrt(xp / 100)) + 1;

  const formatTime = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const moduleChartData = modules.slice(0, 15).map((m, i) => ({
    name: `M${i}`,
    completed: completedModules.includes(m.id) ? 1 : 0.2,
  }));

  const xpChartData = Array.from({ length: 6 }, (_, i) => ({
    milestone: `Lvl ${i + 1}`,
    xp: (i + 1) * 100,
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-2 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Learning Progress</h2>
          <p className="text-sm text-slate-500">Track your journey through the curriculum</p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Modules Completed', value: `${completedModules.length}/${totalModules}`, sub: `${moduleProgress}%`, icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30' },
          { label: 'Lessons Done', value: `${completedLessons.length}`, sub: `${lessonProgress}%`, icon: BookOpen, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30' },
          { label: 'Current Streak', value: `${streak} days`, sub: 'Keep going!', icon: Flame, color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/30' },
          { label: 'Time Invested', value: formatTime(gameTimeSeconds), sub: `Level ${level}`, icon: Clock, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/30' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase">{stat.label}</span>
              <div className={`w-8 h-8 rounded-lg ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-4 h-4" />
              </div>
            </div>
            <span className="block text-xl font-black text-slate-900 dark:text-white">{stat.value}</span>
            <span className="block text-xs text-slate-400 mt-0.5">{stat.sub}</span>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Module Completion Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
          <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-500" />
            Module Completion
          </h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={moduleChartData}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis hide domain={[0, 1]} />
              <Tooltip />
              <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* XP Progress Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
          <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            XP Trajectory
          </h3>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={xpChartData}>
              <XAxis dataKey="milestone" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis hide />
              <Tooltip />
              <Line type="monotone" dataKey="xp" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Learning Path Timeline */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <h3 className="text-sm font-black text-slate-900 dark:text-white mb-6">Learning Path</h3>
        <div className="space-y-2">
          {modules.slice(0, 15).map((mod, i) => {
            const isCompleted = completedModules.includes(mod.id);
            return (
              <button
                key={mod.id}
                onClick={() => onSelectModule(mod.id)}
                className={`w-full flex items-center gap-4 p-3 rounded-xl text-left transition-all cursor-pointer ${
                  isCompleted
                    ? 'bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50'
                    : 'bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-800'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  isCompleted ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                }`}>
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block text-xs font-bold text-slate-900 dark:text-white truncate">{mod.title}</span>
                  <span className="text-xs text-slate-400 uppercase font-bold">{mod.level}</span>
                </div>
                <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: isCompleted ? '100%' : '0%' }}
                    className="h-full bg-emerald-500 rounded-full"
                  />
                </div>
                <span className="text-xs font-bold text-slate-400 shrink-0">
                  {isCompleted ? 'Done' : `${i + 1}`}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
