import { useState } from 'react';
import { CreditCard } from 'lucide-react';

export function CreditActionPlan() {
  const [currentScore, setCurrentScore] = useState(650);
  const [targetScore, setTargetScore] = useState(760);
  const [monthlyBudget, setMonthlyBudget] = useState(200);
  const gap = targetScore - currentScore;
  const months = gap > 0 ? Math.ceil((gap / 10) * 3) : 0;
  const utilTarget = Math.min(100, Math.round((monthlyBudget / 5000) * 100));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <CreditCard className="w-5 h-5 text-blue-500" />
        <h3 className="font-black text-sm text-slate-900 dark:text-white">Credit Action Plan</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div><label className="text-xs font-bold uppercase text-slate-500 block mb-1">Current Score</label>
          <input type="number" value={currentScore} onChange={e => setCurrentScore(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold" min={300} max={850} /></div>
        <div><label className="text-xs font-bold uppercase text-slate-500 block mb-1">Target Score</label>
          <input type="number" value={targetScore} onChange={e => setTargetScore(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold" min={300} max={850} /></div>
        <div><label className="text-xs font-bold uppercase text-slate-500 block mb-1">Monthly Budget</label>
          <input type="number" value={monthlyBudget} onChange={e => setMonthlyBudget(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold" min={0} /></div>
      </div>
      <div className="bg-blue-50 dark:bg-blue-950/30 rounded-2xl p-5 border border-blue-100 dark:border-blue-900/50 space-y-2">
        <div className="flex justify-between"><span className="text-xs font-bold text-slate-500">Time to target</span>
          <span className="text-lg font-black text-slate-900 dark:text-white">{months} months</span></div>
        <div className="flex justify-between"><span className="text-xs font-bold text-slate-500">Target utilization</span>
          <span className="text-lg font-black text-slate-900 dark:text-white">{utilTarget}%</span></div>
        <div className="flex justify-between"><span className="text-xs font-bold text-slate-500">Score gap</span>
          <span className="text-lg font-black text-slate-900 dark:text-white">{gap > 0 ? `+${gap}` : '✓ Target reached'}</span></div>
      </div>
    </div>
  );
}
