import { useState } from 'react';
import { Building2 } from 'lucide-react';

export function RealEstateAnalyzer() {
  const [purchasePrice, setPurchasePrice] = useState(200000);
  const [rehab, setRehab] = useState(20000);
  const [rent, setRent] = useState(2000);
  const [vacancy, setVacancy] = useState(5);
  const totalInvestment = purchasePrice + rehab;
  const annualRent = rent * 12 * (1 - vacancy / 100);
  const noi = annualRent - annualRent * 0.35;
  const capRate = totalInvestment > 0 ? (noi / totalInvestment) * 100 : 0;
  const cashFlow = (noi - purchasePrice * 0.07) / 12;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Building2 className="w-5 h-5 text-amber-500" />
        <h3 className="font-black text-sm text-slate-900 dark:text-white">Real Estate Analyzer</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div><label className="text-xs font-bold uppercase text-slate-500 block mb-1">Purchase Price</label>
          <input type="number" value={purchasePrice} onChange={e => setPurchasePrice(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold" min={0} step={5000} /></div>
        <div><label className="text-xs font-bold uppercase text-slate-500 block mb-1">Rehab Cost</label>
          <input type="number" value={rehab} onChange={e => setRehab(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold" min={0} step={5000} /></div>
        <div><label className="text-xs font-bold uppercase text-slate-500 block mb-1">Monthly Rent</label>
          <input type="number" value={rent} onChange={e => setRent(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold" min={0} step={100} /></div>
        <div><label className="text-xs font-bold uppercase text-slate-500 block mb-1">Vacancy %</label>
          <input type="number" value={vacancy} onChange={e => setVacancy(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold" min={0} max={50} step={1} /></div>
      </div>
      <div className="bg-amber-50 dark:bg-amber-950/30 rounded-2xl p-5 border border-amber-100 dark:border-amber-900/50 space-y-2">
        <div className="flex justify-between"><span className="text-xs font-bold text-slate-500">Cap Rate</span><span className="text-lg font-black text-slate-900 dark:text-white">{capRate.toFixed(1)}%</span></div>
        <div className="flex justify-between"><span className="text-xs font-bold text-slate-500">Total Investment</span><span className="text-lg font-black text-slate-900 dark:text-white">${totalInvestment.toLocaleString()}</span></div>
        <div className="flex justify-between"><span className="text-xs font-bold text-slate-500">Net Operating Income</span><span className="text-lg font-black text-slate-900 dark:text-white">${Math.round(noi).toLocaleString()}/yr</span></div>
        <div className="flex justify-between"><span className="text-xs font-bold text-slate-500">Est. Monthly Cash Flow</span><span className="text-lg font-black text-emerald-600 dark:text-emerald-400">${Math.round(cashFlow).toLocaleString()}</span></div>
      </div>
    </div>
  );
}
