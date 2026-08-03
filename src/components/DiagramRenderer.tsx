import React from 'react';
import { DiagramData } from '../data/extendedQuizBank';
import { ArrowRight, Code, Database, Scale, FileText, CheckCircle, AlertTriangle } from 'lucide-react';

interface DiagramRendererProps {
  diagram: DiagramData;
}

export function DiagramRenderer({ diagram }: DiagramRendererProps) {
  if (!diagram) return null;

  return (
    <div className="my-6 p-4 md:p-6 bg-slate-900 dark:bg-slate-950 text-slate-100 rounded-2xl border border-slate-700 shadow-inner">
      {diagram.title && (
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-800 text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">
          <Database className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>{diagram.title}</span>
        </div>
      )}

      {/* 1. FLOWCHART / SEQUENCE DIAGRAM */}
      {diagram.type === 'flow' && diagram.nodes && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-2 overflow-x-auto">
          {diagram.nodes.map((node, idx) => (
            <React.Fragment key={idx}>
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 text-center min-w-[120px] flex-1 shadow-sm">
                <div className="text-xs font-bold text-white mb-0.5">{node.label}</div>
                {node.sub && <div className="text-xs text-indigo-300 font-mono">{node.sub}</div>}
              </div>
              {idx < diagram.nodes!.length - 1 && (
                <div className="text-slate-500 shrink-0 rotate-90 sm:rotate-0">
                  <ArrowRight className="w-5 h-5 text-indigo-400" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* 2. DOUBLE-ENTRY LEDGER T-ACCOUNT TABLE */}
      {diagram.type === 'ledger' && (
        <div className="grid grid-cols-2 gap-4 font-mono text-xs">
          <div className="bg-slate-800/80 p-3 rounded-xl border border-emerald-900/50">
            <div className="text-emerald-400 font-bold border-b border-emerald-800/50 pb-2 mb-2 uppercase tracking-widest text-xs flex justify-between">
              <span>DEBITS (Dr)</span>
              <span>+ ASSETS</span>
            </div>
            {diagram.debits?.map((item, i) => (
              <div key={i} className="flex justify-between py-1 text-slate-200 border-b border-slate-800/40 last:border-0">
                <span className="truncate pr-2">{item.account}</span>
                <span className="font-bold text-emerald-300 shrink-0">{item.amount}</span>
              </div>
            ))}
          </div>
          <div className="bg-slate-800/80 p-3 rounded-xl border border-blue-900/50">
            <div className="text-blue-400 font-bold border-b border-blue-800/50 pb-2 mb-2 uppercase tracking-widest text-xs flex justify-between">
              <span>CREDITS (Cr)</span>
              <span>+ LIABILITIES</span>
            </div>
            {diagram.credits?.map((item, i) => (
              <div key={i} className="flex justify-between py-1 text-slate-200 border-b border-slate-800/40 last:border-0">
                <span className="truncate pr-2">{item.account}</span>
                <span className="font-bold text-blue-300 shrink-0">{item.amount}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. UNDERWRITING SCORECARD / COMPARISON TABLE */}
      {(diagram.type === 'scorecard' || diagram.type === 'comparison') && diagram.rows && (
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono text-xs uppercase tracking-wider">
                <th className="py-2 px-3">Metric / Signal</th>
                <th className="py-2 px-3">Value / Condition A</th>
                <th className="py-2 px-3">Value / Condition B</th>
                {diagram.rows[0]?.status && <th className="py-2 px-3">Assessment</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {diagram.rows.map((row, i) => (
                <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-slate-200">{row.metric}</td>
                  <td className="py-2.5 px-3 text-indigo-300 font-mono">{row.valA}</td>
                  <td className="py-2.5 px-3 text-emerald-300 font-mono">{row.valB}</td>
                  {row.status && (
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                        {row.status}
                      </span>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 4. FORMULA BOX */}
      {diagram.type === 'formula' && diagram.formula && (
        <div className="text-center py-4 bg-slate-950/80 rounded-xl border border-indigo-900/40">
          <div className="font-mono text-xl md:text-2xl font-black text-indigo-300 tracking-wider">
            {diagram.formula}
          </div>
        </div>
      )}

      {/* 5. CODE BLOCK */}
      {diagram.type === 'code' && diagram.code && (
        <div className="font-mono text-xs bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto text-emerald-400 leading-relaxed">
          <pre>{diagram.code}</pre>
        </div>
      )}

      {diagram.explanationNote && (
        <p className="mt-3 text-xs text-slate-400 italic">
          * {diagram.explanationNote}
        </p>
      )}
    </div>
  );
}
