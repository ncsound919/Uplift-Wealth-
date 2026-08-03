import { useState } from 'react';
import { Users } from 'lucide-react';

export function GroupPoolCalculator() {
  const [members, setMembers] = useState(12);
  const [contribution, setContribution] = useState(200);
  const [months, setMonths] = useState(12);
  const [returnRate, setReturnRate] = useState(8);
  const totalPrincipal = members * contribution * months;
  const mr = returnRate / 100 / 12;
  let fv = 0;
  for (let m = 0; m < months; m++) fv = (fv + contribution * members) * (1 + mr);
  const perMember = fv / members;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Users className="w-5 h-5 text-emerald-500" />
        <h3 className="font-black text-sm text-slate-900 dark:text-white">Group Pool Calculator</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div><label className="text-xs font-bold uppercase text-slate-500 block mb-1">Members</label>
          <input type="number" value={members} onChange={e => setMembers(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold" min={2} max={100} /></div>
        <div><label className="text-xs font-bold uppercase text-slate-500 block mb-1">Monthly Contribution</label>
          <input type="number" value={contribution} onChange={e => setContribution(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold" min={0} step={50} /></div>
        <div><label className="text-xs font-bold uppercase text-slate-500 block mb-1">Months</label>
          <input type="number" value={months} onChange={e => setMonths(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold" min={1} max={120} /></div>
        <div><label className="text-xs font-bold uppercase text-slate-500 block mb-1">Return %</label>
          <input type="number" value={returnRate} onChange={e => setReturnRate(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold" min={0} max={30} step={0.5} /></div>
      </div>
      <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl p-5 border border-emerald-100 dark:border-emerald-900/50 space-y-2">
        <div className="flex justify-between"><span className="text-xs font-bold text-slate-500">Total Pool Value</span>
          <span className="text-lg font-black text-slate-900 dark:text-white">${Math.round(fv).toLocaleString()}</span></div>
        <div className="flex justify-between"><span className="text-xs font-bold text-slate-500">Per Member Payout</span>
          <span className="text-lg font-black text-slate-900 dark:text-white">${Math.round(perMember).toLocaleString()}</span></div>
        <div className="flex justify-between"><span className="text-xs font-bold text-slate-500">Principal Contributed</span>
          <span className="text-lg font-black text-slate-900 dark:text-white">${totalPrincipal.toLocaleString()}</span></div>
        <div className="flex justify-between"><span className="text-xs font-bold text-slate-500">Return</span>
          <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
            {totalPrincipal > 0 ? `+${Math.round(((fv - totalPrincipal) / totalPrincipal) * 100)}%` : '—'}</span></div>
      </div>
    </div>
  );
}
