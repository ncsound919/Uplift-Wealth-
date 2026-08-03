import { useState } from 'react';
import { Briefcase } from 'lucide-react';

export function BusinessViabilityCalculator() {
  const [startup, setStartup] = useState(10000);
  const [revenue, setRevenue] = useState(5000);
  const [expenses, setExpenses] = useState(3500);
  const [cac, setCac] = useState(50);
  const monthlyProfit = revenue - expenses;
  const breakEven = monthlyProfit > 0 ? Math.ceil(startup / monthlyProfit) : Infinity;
  const y1Profit = monthlyProfit * 12;
  const y2RunRate = revenue * 24;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Briefcase className="w-5 h-5 text-purple-500" />
        <h3 className="font-black text-sm text-slate-900 dark:text-white">Business Viability Calculator</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div><label className="text-xs font-bold uppercase text-slate-500 block mb-1">Startup Cost</label>
          <input type="number" value={startup} onChange={e => setStartup(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold" min={0} step={1000} /></div>
        <div><label className="text-xs font-bold uppercase text-slate-500 block mb-1">Monthly Revenue</label>
          <input type="number" value={revenue} onChange={e => setRevenue(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold" min={0} step={500} /></div>
        <div><label className="text-xs font-bold uppercase text-slate-500 block mb-1">Monthly Expenses</label>
          <input type="number" value={expenses} onChange={e => setExpenses(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold" min={0} step={500} /></div>
        <div><label className="text-xs font-bold uppercase text-slate-500 block mb-1">CAC ($)</label>
          <input type="number" value={cac} onChange={e => setCac(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold" min={0} step={5} /></div>
      </div>
      <div className="bg-purple-50 dark:bg-purple-950/30 rounded-2xl p-5 border border-purple-100 dark:border-purple-900/50 space-y-2">
        <div className="flex justify-between"><span className="text-xs font-bold text-slate-500">Break-even</span>
          <span className="text-lg font-black text-slate-900 dark:text-white">{breakEven === Infinity ? 'Not reached' : `${breakEven} months`}</span></div>
        <div className="flex justify-between"><span className="text-xs font-bold text-slate-500">Year 1 Profit</span>
          <span className={`text-lg font-black ${y1Profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>${y1Profit.toLocaleString()}</span></div>
        <div className="flex justify-between"><span className="text-xs font-bold text-slate-500">24-Month Run Rate</span>
          <span className="text-lg font-black text-slate-900 dark:text-white">${y2RunRate.toLocaleString()}</span></div>
      </div>
    </div>
  );
}
