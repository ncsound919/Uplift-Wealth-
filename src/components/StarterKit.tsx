import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, FileText, CheckCircle2, Briefcase, FileCheck, DollarSign, ShieldCheck, Cpu, ChevronRight, Package } from 'lucide-react';
import { STARTER_FILES, downloadStarterFile, downloadAllStarterFiles, BusinessContext } from '../lib/starterKit';
import { cn } from '../lib/utils';

const CATEGORY_META: Record<string, { label: string; icon: typeof FileText; color: string; bgColor: string }> = {
  legal: { label: 'Legal', icon: ShieldCheck, color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-950/30' },
  pitch: { label: 'Pitch', icon: Briefcase, color: 'text-purple-600', bgColor: 'bg-purple-50 dark:bg-purple-950/30' },
  finance: { label: 'Finance', icon: DollarSign, color: 'text-emerald-600', bgColor: 'bg-emerald-50 dark:bg-emerald-950/30' },
  compliance: { label: 'Compliance', icon: ShieldCheck, color: 'text-rose-600', bgColor: 'bg-rose-50 dark:bg-rose-950/30' },
  product: { label: 'Product', icon: Cpu, color: 'text-amber-600', bgColor: 'bg-amber-50 dark:bg-amber-950/30' },
};

const CATEGORY_ORDER: Array<'pitch' | 'finance' | 'legal' | 'compliance' | 'product'> = ['pitch', 'finance', 'legal', 'compliance', 'product'];

interface StarterKitProps {
  ctx: BusinessContext;
}

export function StarterKit({ ctx }: StarterKitProps) {
  const [downloaded, setDownloaded] = useState<Set<string>>(new Set());
  const [expandedCategory, setExpandedCategory] = useState<string | null>('pitch');

  const handleDownload = (id: string) => {
    const file = STARTER_FILES.find(f => f.id === id);
    /* v8 ignore next -- @preserve handleDownload is only wired to real STARTER_FILES ids */
    if (!file) return;
    downloadStarterFile(file, ctx);
    setDownloaded(prev => new Set([...prev, id]));
  };

  const handleDownloadAll = () => {
    downloadAllStarterFiles(ctx);
    setDownloaded(new Set(STARTER_FILES.map(f => f.id)));
  };

  const grouped = STARTER_FILES.reduce<Record<string, typeof STARTER_FILES>>((acc, file) => {
    if (!acc[file.category]) acc[file.category] = [];
    acc[file.category].push(file);
    return acc;
  }, {});

  const completedCount = downloaded.size;
  const totalCount = STARTER_FILES.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 p-3 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 border border-indigo-200 dark:border-indigo-800/50 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white">Starter Kit</h3>
            <p className="text-xs text-slate-500 font-medium">
              {completedCount} of {totalCount} downloaded · Free templates to launch
            </p>
          </div>
        </div>
        <button
          onClick={handleDownloadAll}
          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
        >
          <Download className="w-3 h-3" />
          <span>Download All</span>
        </button>
      </div>

      <div className="space-y-2">
        {CATEGORY_ORDER.map(category => {
          const files = grouped[category] || [];
          if (files.length === 0) return null;
          const meta = CATEGORY_META[category];
          const Icon = meta.icon;
          const isExpanded = expandedCategory === category;
          return (
            <div key={category} className={cn("rounded-xl border overflow-hidden", meta.bgColor, "border-slate-200 dark:border-slate-800")}>
              <button
                onClick={() => setExpandedCategory(isExpanded ? null : category)}
                className="w-full flex items-center justify-between p-2.5 hover:bg-white/50 dark:hover:bg-slate-900/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Icon className={cn("w-4 h-4", meta.color)} />
                  <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    {meta.label}
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    {files.filter(f => downloaded.has(f.id)).length}/{files.length}
                  </span>
                </div>
                <ChevronRight className={cn("w-3.5 h-3.5 text-slate-400 transition-transform", isExpanded && "rotate-90")} />
              </button>
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-2 space-y-1.5 bg-white/60 dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-800">
                      {files.map(file => {
                        const isDownloaded = downloaded.has(file.id);
                        return (
                          <div
                            key={file.id}
                            className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
                          >
                            <FileText className={cn("w-3.5 h-3.5 shrink-0", isDownloaded ? "text-emerald-500" : "text-slate-400")} />
                            <div className="flex-1 min-w-0">
                              <span className="block text-xs font-black text-slate-900 dark:text-white truncate">
                                {file.title}
                              </span>
                              <span className="block text-xs text-slate-500 truncate">
                                {file.description}
                              </span>
                            </div>
                            <span className="text-xs font-mono text-slate-400 uppercase shrink-0">
                              .{file.format}
                            </span>
                            <button
                              onClick={() => handleDownload(file.id)}
                              className={cn(
                                "p-1.5 rounded-md transition-colors shrink-0 cursor-pointer",
                                isDownloaded
                                  ? "bg-emerald-100 text-emerald-600 hover:bg-emerald-200 dark:bg-emerald-950/50"
                                  : "bg-slate-100 text-slate-500 hover:bg-blue-100 hover:text-blue-600 dark:bg-slate-800"
                              )}
                              title={isDownloaded ? "Downloaded" : "Download"}
                            >
                              {isDownloaded ? <CheckCircle2 className="w-3 h-3" /> : <Download className="w-3 h-3" />}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {completedCount === totalCount && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl text-center"
        >
          <p className="text-xs font-black text-emerald-700 dark:text-emerald-400">
            🎉 All starter files downloaded!
          </p>
          <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-1">
            You're ready to launch. Come back when you need to iterate.
          </p>
        </motion.div>
      )}
    </div>
  );
}
