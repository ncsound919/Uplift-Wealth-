import { visit } from 'unist-util-visit';
import { useState } from 'react';
import { BookOpen, ExternalLink } from 'lucide-react';
import { FINANCE_GLOSSARY_TERMS, type GlossaryTerm } from '../FinanceGlossary';

/**
 * Derive match keys for each glossary term. For a term like
 * "APY (Annual Percentage Yield)" we match the short prefix ("APY"),
 * the parenthetical ("Annual Percentage Yield"), and the full string.
 */
function buildMatchMap(): Map<string, GlossaryTerm> {
  const map = new Map<string, GlossaryTerm>();
  const add = (key: string, term: GlossaryTerm) => {
    const k = key.toLowerCase().trim();
    if (k.length >= 3 && !map.has(k)) map.set(k, term);
  };
  for (const term of FINANCE_GLOSSARY_TERMS) {
    const paren = term.term.match(/\(([^)]+)\)/);
    add(term.term, term);
    if (paren) {
      add(term.term.slice(0, term.term.indexOf('(')).trim(), term);
      add(paren[1], term);
    }
  }
  return map;
}

const MATCH_MAP = buildMatchMap();

/** Terms too common to be worth a highlight — they add noise everywhere. */
const NOISE_TERMS = new Set(['money', 'income', 'expense', 'debt', 'loan', 'taxes', 'budget']);

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Longest-first alternation so "Debt-to-Income Ratio" beats "Income".
const MATCH_KEYS = Array.from(MATCH_MAP.keys()).sort((a, b) => b.length - a.length);
const MATCH_REGEX = new RegExp('\\b(' + MATCH_KEYS.map(escapeRegExp).join('|') + ')\\b', 'gi');

/**
 * rehype plugin: walks markdown text nodes and wraps dictionary terms in
 * <span data-glossary="term-id"> so a component override can render them as
 * highlighted, tooltip-bearing spans.
 */
export function rehypeGlossaryHighlight() {
  return (tree: any) => {
    visit(tree, 'text', (node, index, parent) => {
      if (!parent || parent.type !== 'element') return;
      // Never rewrite inside links or inline code, or inside spans we just
      // inserted (avoids double-wrapping during traversal).
      if (parent.tagName === 'a' || parent.tagName === 'code') return;
      if (parent.properties && parent.properties.dataGlossary) return;

      const value = node.value as string;
      if (!value || value.trim().length < 2) return;

      const parts: any[] = [];
      const regex = new RegExp(MATCH_REGEX.source, 'gi');
      let lastIndex = 0;
      let m: RegExpExecArray | null;
      let matched = false;

      while ((m = regex.exec(value)) !== null) {
        const token = m[0];
        const term = MATCH_MAP.get(token.toLowerCase());
        if (term && !NOISE_TERMS.has(token.toLowerCase())) {
          matched = true;
          if (m.index > lastIndex) {
            parts.push({ type: 'text', value: value.slice(lastIndex, m.index) });
          }
          parts.push({
            type: 'element',
            tagName: 'span',
            properties: { dataGlossary: term.id },
            children: [{ type: 'text', value: m[0] }],
          });
          lastIndex = m.index + m[0].length;
        }
      }

      if (!matched) return;
      if (lastIndex < value.length) {
        parts.push({ type: 'text', value: value.slice(lastIndex) });
      }

      // Replace the single text node with the split children.
      parent.children.splice(index, 1, ...parts);
    });
  };
}

/** Renders a highlighted glossary term with a hover tooltip + dictionary link. */
export function GlossaryTermSpan({ termId, children }: { termId: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const term: GlossaryTerm | undefined = FINANCE_GLOSSARY_TERMS.find(t => t.id === termId);

  if (!term) return <>{children}</>;

  return (
    <span
      className="group relative inline-block cursor-help rounded-sm border-b border-dotted border-emerald-600/60 bg-emerald-50/60 px-0.5 font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      tabIndex={0}
      role="button"
      aria-label={`${term.term}: dictionary definition available`}
    >
      {children}
      {open && (
        <span className="absolute bottom-full left-1/2 z-30 mb-2 w-64 -translate-x-1/2 rounded-xl border border-slate-200 bg-white p-3 text-left shadow-xl dark:border-slate-700 dark:bg-slate-900">
          <span className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            <BookOpen className="w-3 h-3" /> {term.term}
          </span>
          <span className="mt-1 block text-[11px] leading-snug text-slate-700 dark:text-slate-300">{term.definition}</span>
          {term.example && (
            <span className="mt-1 block text-[10px] italic leading-snug text-slate-500 dark:text-slate-400">
              e.g. {term.example}
            </span>
          )}
          <a
            href={`/glossary#term-${term.id}`}
            onClick={e => e.stopPropagation()}
            className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 hover:underline dark:text-emerald-400"
          >
            Open dictionary <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </span>
      )}
    </span>
  );
}
