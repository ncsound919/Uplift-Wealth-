import { TrendingUp, DollarSign, ShieldCheck, Gamepad2 } from 'lucide-react';

interface Props {
  onSelectGame: (gameId: string) => void;
}

const GAMES_MENU = [
  { id: 'trading', label: 'Stock Market Simulator', icon: TrendingUp, desc: 'Trade stocks, build a portfolio, and learn market mechanics in a risk-free simulated environment.', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/40', border: 'border-blue-200 dark:border-blue-800' },
  { id: 'underwriting', label: 'Alternative Lending Sim', icon: DollarSign, desc: 'Evaluate loan applications, assess credit risk, and manage a lending portfolio.', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/40', border: 'border-emerald-200 dark:border-emerald-800' },
  { id: 'parametric', label: 'Parametric Insurance Sim', icon: ShieldCheck, desc: 'Design weather-indexed insurance products and manage parametric risk pools.', color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950/40', border: 'border-indigo-200 dark:border-indigo-800' },
  { id: 'fraud', label: 'Compliance Screener', icon: ShieldCheck, desc: 'Detect suspicious transactions, flag AML violations, and enforce KYC regulations.', color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950/40', border: 'border-rose-200 dark:border-rose-800' },
  { id: 'popquiz', label: 'FinTech Pop Quiz', icon: Gamepad2, desc: 'Test your fintech knowledge with rapid-fire questions across all modules.', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/40', border: 'border-amber-200 dark:border-amber-800' }
];

export function GamesHub({ onSelectGame }: Props) {
  return (
    <div className="max-w-7xl mx-auto space-y-8 p-2 animate-fade-in">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border border-purple-100 dark:border-purple-900 text-xs font-black uppercase tracking-wider">
          <Gamepad2 className="w-3.5 h-3.5" />
          <span>Interactive Learning</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Educational Games</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-2xl">
          Choose a simulation to apply your fintech knowledge in real-world scenarios.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {GAMES_MENU.map((gm) => {
          const Icon = gm.icon;
          return (
            <button
              key={gm.id}
              onClick={() => onSelectGame(gm.id)}
              className={`text-left bg-white dark:bg-slate-900 border ${gm.border} rounded-2xl p-5 shadow-xs hover:shadow-sm transition-all cursor-pointer group`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 ${gm.bg} ${gm.color} rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="space-y-1 min-w-0">
                  <h3 className="font-black text-sm text-slate-900 dark:text-white">{gm.label}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{gm.desc}</p>
                  <span className={`inline-block mt-2 text-xs font-bold uppercase tracking-wider ${gm.color}`}>
                    Play Now →
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
