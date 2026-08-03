import { useState } from 'react';
import { ShieldPlus } from 'lucide-react';

export function EmergencyFundCalculator() {
  const [monthlyExpenses, setMonthlyExpenses] = useState(3000);
  const [currentSavings, setCurrentSavings] = useState(5000);
  const [monthlySavingsRate, setMonthlySavingsRate] = useState(500);
  const [targetMonths, setTargetMonths] = useState(6);
  const targetAmount = monthlyExpenses * targetMonths;
  const monthsOfCoverage = monthlyExpenses > 0 ? currentSavings / monthlyExpenses : 0;
  const monthsToReach = monthlySavingsRate > 0 ? Math.max(0, Math.ceil((targetAmount - currentSavings) / monthlySavingsRate)) : 0;
  const progressPercent = targetAmount > 0 ? Math.min(100, Math.round((currentSavings / targetAmount) * 100)) : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <ShieldPlus className="w-5 h-5 text-sky-500" />
        <h3 className="font-black text-sm text-slate-900 dark:text-white">Emergency Fund Calculator</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div><label className="text-xs font-bold uppercase text-slate-500 block mb-1">Monthly Expenses</label>
          <input type="number" value={monthlyExpenses} onChange={e => setMonthlyExpenses(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold" min={0} step={100} /></div>
        <div><label className="text-xs font-bold uppercase text-slate-500 block mb-1">Current Savings</label>
          <input type="number" value={currentSavings} onChange={e => setCurrentSavings(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold" min={0} step={500} /></div>
        <div><label className="text-xs font-bold uppercase text-slate-500 block mb-1">Monthly Savings Rate</label>
          <input type="number" value={monthlySavingsRate} onChange={e => setMonthlySavingsRate(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold" min={0} step={50} /></div>
        <div><label className="text-xs font-bold uppercase text-slate-500 block mb-1">Target Months</label>
          <input type="number" value={targetMonths} onChange={e => setTargetMonths(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold" min={1} max={24} step={1} /></div>
      </div>
      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-sky-500 to-blue-600 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
      </div>
      <div className="bg-sky-50 dark:bg-sky-950/30 rounded-2xl p-5 border border-sky-100 dark:border-sky-900/50 space-y-2">
        <div className="flex justify-between"><span className="text-xs font-bold text-slate-500">Months of Coverage</span>
          <span className="text-lg font-black text-slate-900 dark:text-white">{monthsOfCoverage.toFixed(1)} months</span></div>
        <div className="flex justify-between"><span className="text-xs font-bold text-slate-500">Target Amount</span>
          <span className="text-lg font-black text-slate-900 dark:text-white">${targetAmount.toLocaleString()}</span></div>
        <div className="flex justify-between"><span className="text-xs font-bold text-slate-500">Months to Reach Target</span>
          <span className="text-lg font-black text-slate-900 dark:text-white">{monthsToReach > 0 ? `${monthsToReach} months` : '✓ Goal met'}</span></div>
        <div className="flex justify-between"><span className="text-xs font-bold text-slate-500">Progress</span>
          <span className="text-lg font-black text-sky-600 dark:text-sky-400">{progressPercent}%</span></div>
      </div>
    </div>
  );
}
