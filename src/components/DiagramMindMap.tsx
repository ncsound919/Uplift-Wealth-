import React, { useEffect, useRef, useState } from 'react';
import { Transformer } from 'markmap-lib';
import { Markmap } from 'markmap-view';

interface DiagramMindMapProps {
  markdown: string;
  title?: string;
  className?: string;
  height?: number;
}

const transformer = new Transformer();

export function DiagramMindMap({ markdown, title, className = '', height = 420 }: DiagramMindMapProps) {
  const ref = useRef<SVGSVGElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ref.current || !markdown) return;
    try {
      const { root } = transformer.transform(markdown);
      Markmap.create(ref.current, {
        zoom: true,
        pan: true,
        duration: 500,
      }, root);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Mind map render failed');
    }
  }, [markdown]);

  if (!markdown) return null;

  return (
    <div className={`my-6 ${className}`}>
      {title && <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">{title}</p>}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        <svg ref={ref} style={{ width: '100%', height }} />
        {error && <p className="text-xs text-red-500 p-2">{error}</p>}
      </div>
    </div>
  );
}
