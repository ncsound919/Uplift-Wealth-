import { Download, Sparkles, Play, RotateCcw, ArrowRight, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface BusinessSummaryProps {
  businessName: string;
  finalLane: string;
  businessType: string;
  selectedCohort: string;
  monetization: string;
  structure: string;
  filingState: string;
  fundingStrategy: string;
  onDownload: () => void;
  onStressTest: () => void;
  onStartOver: () => void;
  onAdvancedMode: () => void;
}

interface Fact {
  label: string;
  value: string;
}

export function BusinessSummary({
  businessName,
  finalLane,
  businessType,
  selectedCohort,
  monetization,
  structure,
  filingState,
  fundingStrategy,
  onDownload,
  onStressTest,
  onStartOver,
  onAdvancedMode,
}: BusinessSummaryProps) {
  const facts: Fact[] = [
    { label: 'Business type', value: businessType === 'fintech' ? 'Fintech / Digital Finance' : businessType === 'retail' ? 'Retail & E-Commerce' : businessType === 'food' ? 'Food & Restaurants' : businessType === 'services' ? 'Services & Trades' : businessType === 'consulting' ? 'Consulting & Coaching' : businessType === 'real_estate' ? 'Real Estate' : 'General Business' },
    { label: 'Who you serve', value: selectedCohort },
    { label: 'How you make money', value: monetization.split(' ').slice(0, 3).join(' ') },
    { label: 'Legal structure', value: structure === 'LLC' ? 'LLC' : structure === 'C-Corp' ? 'C-Corp' : 'Sole Proprietorship' },
    { label: 'Where you register', value: filingState },
    { label: 'Funding', value: fundingStrategy.split(' ').slice(0, 2).join(' ') },
  ];

  return (
    <div className="relative z-10 bg-white dark:bg-slate-950/60 p-6 md:p-10 rounded-2xl border border-slate-200 dark:border-slate-800">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <p className="text-xs font-mono font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-2">
          Your plan is ready
        </p>
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
          {businessName || 'Your Business'}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
          A {finalLane} business for {selectedCohort}. We turned your answers into a complete
          launch plan — download it to get all the details, legal documents, and next steps.
        </p>
      </div>

      <div className="max-w-2xl mx-auto mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {facts.map(f => (
          <div
            key={f.label}
            className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-left"
          >
            <span className="block text-[11px] font-mono font-black text-slate-400 uppercase tracking-wider">
              {f.label}
            </span>
            <span className="block text-sm font-bold text-slate-900 dark:text-white mt-1">
              {f.value}
            </span>
          </div>
        ))}
      </div>

      <div className="max-w-2xl mx-auto mt-8 space-y-3">
        <button
          onClick={onDownload}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-sm font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Download My Complete Plan
        </button>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
          <button
            onClick={onStressTest}
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" />
            Run stress test
          </button>
          <button
            onClick={onStartOver}
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Start over
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-center">
        <button
          onClick={onAdvancedMode}
          className={cn(
            "inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
          )}
        >
          Edit in Advanced mode <ArrowRight className="w-3.5 h-3.5" />
        </button>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">
          <Sparkles className="w-3 h-3 inline-block mr-0.5" />
          Your full plan — pitch, legal docs, compliance calendar, and financials — is in the download.
        </p>
      </div>
    </div>
  );
}
