import { useState } from 'react';
import { Sparkles } from 'lucide-react';

interface Props { compact?: boolean }

function calcGrowth(starting: number, monthly: number, rate: number, years: number) {
  const mr = rate / 100 / 12;
  let t = starting;
  for (let m = 0; m < years * 12; m++) t = t * (1 + mr) + monthly;
  return Math.round(t);
}

const MILESTONES = [
  { value: 100, label: '$100' }, { value: 1000, label: '$1,000' },
  { value: 10000, label: '$10,000' }, { value: 100000, label: '$100,000' },
  { value: 1000000, label: '$1,000,000' },
];

export function CompoundGrowthVisualizer({ compact }: Props) {
  const [starting, setStarting] = useState(100);
  const [monthly, setMonthly] = useState(200);
  const [rate, setRate] = useState(8);
  const [years, setYears] = useState(30);
  const result = calcGrowth(starting, monthly, rate, years);
  const ms = [...MILESTONES].reverse().find(m => result >= m.value);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-amber-500" />
        <h3 className="font-black text-sm text-slate-900 dark:text-white">Compound Growth Visualizer</h3>
      </div>
      <div className={`grid ${compact ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'} gap-4`}>
        <div><label htmlFor="cg-starting" className="text-xs font-bold uppercase text-slate-500 block mb-1">Starting Amount</label>
          <input id="cg-starting" type="number" value={starting} onChange={e => setStarting(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold" min={0} /></div>
        <div><label htmlFor="cg-monthly" className="text-xs font-bold uppercase text-slate-500 block mb-1">Monthly</label>
          <input id="cg-monthly" type="number" value={monthly} onChange={e => setMonthly(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold" min={0} /></div>
        <div><label htmlFor="cg-rate" className="text-xs font-bold uppercase text-slate-500 block mb-1">Return %</label>
          <input id="cg-rate" type="number" value={rate} onChange={e => setRate(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold" min={0} max={100} step={0.5} /></div>
        <div><label htmlFor="cg-years" className="text-xs font-bold uppercase text-slate-500 block mb-1">Years</label>
          <input id="cg-years" type="number" value={years} onChange={e => setYears(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold" min={1} max={80} /></div>
      </div>
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-2xl p-6 text-center border border-blue-100 dark:border-blue-900/50">
        <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">Final Value</span>
        <div className="text-4xl font-black text-slate-900 dark:text-white mt-1">${result.toLocaleString()}</div>
        {ms && <div className="inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-xs font-bold uppercase">
          <Sparkles className="w-3 h-3" /> You reached {ms.label}
        </div>}
      </div>
      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-500 via-emerald-500 to-amber-500 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (result / 1000000) * 100)}%` }} />
      </div>
      <p className="text-xs text-slate-400 text-center">Progress bar shows how close you are to $1,000,000</p>
    </div>
  );
}
