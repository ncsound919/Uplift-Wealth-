import { useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { GraduationCap, Award, Calendar, ShieldCheck } from 'lucide-react';
import { capture } from '../lib/analytics';

interface CertificateProps {
  userName: string;
  moduleTitle: string;
  completedDate: string;
  certId: string;
  score?: number;
  moduleId?: string;
  onClose: () => void;
}

export function Certificate({ userName, moduleTitle, completedDate, certId, score, moduleId, onClose }: CertificateProps) {
  const certRef = useRef<HTMLDivElement>(null);

  const handleDownload = useCallback(() => {
    capture('certificate_download', { moduleId: moduleId || 'module' });
    const printWindow = window.open('', '_blank');
    if (!printWindow || !certRef.current) return;

    const html = certRef.current.outerHTML;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Certificate — ${moduleTitle}</title>
          <style>
            @page { size: landscape; margin: 0.25in; }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Georgia', 'Times New Roman', serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>${html}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  }, [moduleTitle, certRef]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-4xl">
        <div ref={certRef} className="bg-gradient-to-br from-slate-50 to-amber-50 border-8 border-double border-amber-400 rounded-sm p-10 md:p-14 shadow-2xl text-center" style={{ minHeight: '500px' }}>
          <div className="absolute top-4 left-4 right-4 flex justify-between text-amber-400">
            <GraduationCap className="w-10 h-10" />
            <GraduationCap className="w-10 h-10" />
          </div>

          <div className="pt-8">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-widest mb-6">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Credential</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Certificate of Completion
            </h1>

            <div className="w-24 h-0.5 bg-amber-400 mx-auto my-6" />

            <p className="text-slate-500 text-sm uppercase tracking-widest font-bold">This certifies that</p>

            <h2 className="text-2xl md:text-3xl font-black text-blue-600 mt-2 mb-2 font-display">
              {userName}
            </h2>

            <p className="text-slate-500 text-sm mt-1">has successfully completed the module</p>

            <h3 className="text-xl md:text-2xl font-bold text-slate-800 mt-3 mb-1">
              {moduleTitle}
            </h3>

            {score !== undefined && (
              <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-700 font-bold text-sm">
                <Award className="w-4 h-4" />
                <span>Score: {score}%</span>
              </div>
            )}

            <div className="flex items-center justify-center gap-6 mt-8 text-xs text-slate-500 font-bold">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>{completedDate}</span>
              </div>
              <span className="text-slate-300">|</span>
              <span className="font-mono text-slate-400">ID: {certId}</span>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-amber-200 flex justify-between items-end">
            <div className="text-left">
              <div className="w-32 h-px bg-slate-300 mb-1" />
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Instructor Signature</span>
            </div>
            <div className="w-16 h-16 rounded-full bg-amber-100 border-2 border-amber-400 flex items-center justify-center">
              <Award className="w-8 h-8 text-amber-600" />
            </div>
            <div className="text-right">
              <div className="w-32 h-px bg-slate-300 mb-1 ml-auto" />
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Platform Seal</span>
            </div>
          </div>
        </div>

        <div className="no-print flex justify-center gap-3 mt-4">
          <button
            onClick={handleDownload}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
          >
            Download PDF
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-sm transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </motion.div>
  );
}
