import React, { useEffect, useRef, useState, useCallback } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'neutral',
  fontFamily: 'inherit',
  themeVariables: {
    primaryColor: '#3b82f6',
    primaryBorderColor: '#2563eb',
    primaryTextColor: '#1e293b',
    lineColor: '#94a3b8',
    secondaryColor: '#e2e8f0',
    tertiaryColor: '#f8fafc',
  },
});

interface DiagramMermaidProps {
  chart: string;
  title?: string;
  className?: string;
}

function sanitizeSvg(svg: string): string {
  // Strip script tags and event handlers from SVG to prevent XSS
  return svg
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\bon\w+="[^"]*"/gi, '')
    .replace(/\bon\w+='[^']*'/gi, '')
    .replace(/\bon\w+=\S+/gi, '');
}

export function DiagramMermaid({ chart, title, className = '' }: DiagramMermaidProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const idRef = useRef(`mermaid-${Math.random().toString(36).slice(2, 8)}`);

  useEffect(() => {
    if (!ref.current || !chart) return;
    let cancelled = false;
    setError(null);

    mermaid.render(idRef.current, chart).then(({ svg }) => {
      if (cancelled || !ref.current) return;
      const cleaned = sanitizeSvg(svg);
      const parsed = new DOMParser().parseFromString(cleaned, 'image/svg+xml');
      if (parsed.querySelector('parsererror')) {
        setError('SVG parse failed');
        return;
      }
      const svgEl = parsed.documentElement;
      ref.current.innerHTML = '';
      ref.current.appendChild(svgEl);
    }).catch((err: Error) => {
      if (cancelled) return;
      setError(err.message || 'Diagram render failed');
    });

    return () => { cancelled = true; };
  }, [chart]);

  if (!chart) return null;

  return (
    <div className={`my-6 ${className}`}>
      {title && <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">{title}</p>}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 overflow-x-auto">
        <div ref={ref} className="mermaid-wrapper" />
        {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
      </div>
    </div>
  );
}
