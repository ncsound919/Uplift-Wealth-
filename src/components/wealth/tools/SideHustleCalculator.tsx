import { useState } from 'react';
import { Zap } from 'lucide-react';

export function SideHustleCalculator() {
  const [hoursPerWeek, setHoursPerWeek] = useState(10);
  const [hourlyRate, setHourlyRate] = useState(25);
  const [overheadPercent, setOverheadPercent] = useState(15);
  const [monthsPerYear, setMonthsPerYear] = useState(12);
  const weeksPerYear = monthsPerYear * 4.33;
  const grossAnnual = hoursPerWeek * hourlyRate * weeksPerYear;
  const annualIncome = grossAnnual * (1 - overheadPercent / 100);
  const monthlyIncome = annualIncome / 12;
  const overheadCost = grossAnnual * (overheadPercent / 100);
  const effectiveHourlyRate = hourlyRate * (1 - overheadPercent / 100);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Zap className="w-5 h-5 text-orange-500" />
        <h3 className="font-black text-sm text-slate-900 dark:text-white">Side Hustle Calculator</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div><label className="text-xs font-bold uppercase text-slate-500 block mb-1">Hours / Week</label>
          <input type="number" value={hoursPerWeek} onChange={e => setHoursPerWeek(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold" min={0} max={168} step={1} /></div>
        <div><label className="text-xs font-bold uppercase text-slate-500 block mb-1">Hourly Rate ($)</label>
          <input type="number" value={hourlyRate} onChange={e => setHourlyRate(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold" min={0} step={5} /></div>
        <div><label className="text-xs font-bold uppercase text-slate-500 block mb-1">Overhead %</label>
          <input type="number" value={overheadPercent} onChange={e => setOverheadPercent(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold" min={0} max={100} step={1} /></div>
        <div><label className="text-xs font-bold uppercase text-slate-500 block mb-1">Months / Year</label>
          <input type="number" value={monthsPerYear} onChange={e => setMonthsPerYear(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold" min={1} max={12} step={1} /></div>
      </div>
      <div className="bg-orange-50 dark:bg-orange-950/30 rounded-2xl p-5 border border-orange-100 dark:border-orange-900/50 space-y-2">
        <div className="flex justify-between"><span className="text-xs font-bold text-slate-500">Annual Income</span>
          <span className="text-lg font-black text-slate-900 dark:text-white">${Math.round(annualIncome).toLocaleString()}/yr</span></div>
        <div className="flex justify-between"><span className="text-xs font-bold text-slate-500">Monthly Income</span>
          <span className="text-lg font-black text-slate-900 dark:text-white">${Math.round(monthlyIncome).toLocaleString()}/mo</span></div>
        <div className="flex justify-between"><span className="text-xs font-bold text-slate-500">Overhead Cost</span>
          <span className="text-lg font-black text-rose-600 dark:text-rose-400">${Math.round(overheadCost).toLocaleString()}/yr</span></div>
        <div className="flex justify-between"><span className="text-xs font-bold text-slate-500">Effective Hourly Rate</span>
          <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">${effectiveHourlyRate.toFixed(2)}/hr</span></div>
      </div>
    </div>
  );
}
