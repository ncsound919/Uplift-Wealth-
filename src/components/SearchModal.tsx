import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, BookOpen, GraduationCap, Microscope, Layers } from 'lucide-react';
import { search, SearchResult, getTypeLabel, getTypeColor } from '../lib/searchIndex';
import { useNavigate } from 'react-router';

const typeIcons: Record<SearchResult['type'], typeof BookOpen> = {
  module: Layers,
  lesson: BookOpen,
  lecture: GraduationCap,
  concept: Microscope,
};

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
    setSelectedIndex(0);
    if (value.trim()) {
      setResults(search(value, 12));
    } else {
      setResults([]);
    }
  }, []);

  const handleSelect = useCallback((result: SearchResult) => {
    navigate(result.route);
    onClose();
  }, [navigate, onClose]);

  const handleKeyNav = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/50 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -20 }}
            transition={{ duration: 0.15 }}
            className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-800">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                onKeyDown={handleKeyNav}
                placeholder="Search modules, lessons, concepts..."
                className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400"
              />
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-400 border border-slate-200 dark:border-slate-700">
                ESC
              </kbd>
            </div>

            {results.length > 0 && (
              <div className="max-h-96 overflow-y-auto p-2">
                {results.map((result, i) => {
                  const Icon = typeIcons[result.type];
                  return (
                    <button
                      key={result.id}
                      onClick={() => handleSelect(result)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                        i === selectedIndex
                          ? 'bg-blue-50 dark:bg-blue-950/30'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-slate-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="block text-sm font-bold text-slate-900 dark:text-white truncate">
                          {result.title}
                        </span>
                        <span className="block text-xs text-slate-400 font-medium truncate">
                          {result.subtitle}
                        </span>
                      </div>
                      <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${getTypeColor(result.type)}`}>
                        {getTypeLabel(result.type)}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {query && results.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-sm text-slate-400 font-medium">No results found for "{query}"</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
