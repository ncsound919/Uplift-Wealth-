import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff, X, Bell, Plus, TrendingUp, TrendingDown, Wifi, WifiOff, Star, Trash2 } from 'lucide-react';
import { useWatchlist, POPULAR_TICKERS, WatchlistItem } from '../stores/watchlistStore';
import { alphaVantage, StockQuote } from '../lib/alphaVantageClient';
import { cn } from '../lib/utils';

interface MarketDataStatus {
  mode: 'live' | 'simulated' | 'error';
  provider: string;
  apiKeyPresent: boolean;
  lastUpdated: string | null;
}

export function useMarketDataStatus(): MarketDataStatus {
  const [status, setStatus] = useState<MarketDataStatus>({
    mode: 'simulated',
    provider: 'Simulation',
    apiKeyPresent: false,
    lastUpdated: null,
  });

  useEffect(() => {
    const apiKey = (import.meta as any).env?.VITE_ALPHA_VANTAGE_API_KEY;
    const hasRealKey = apiKey && apiKey !== 'demo' && apiKey.length > 0;
    setStatus({
      mode: hasRealKey ? 'live' : 'simulated',
      provider: hasRealKey ? 'Alpha Vantage' : 'Random Walk Simulation',
      apiKeyPresent: !!hasRealKey,
      lastUpdated: null,
    });
  }, []);

  return status;
}

export function MarketDataBadge({ status }: { status: MarketDataStatus }) {
  const Icon = status.mode === 'live' ? Wifi : WifiOff;
  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-widest border",
      status.mode === 'live'
        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/50"
        : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/50"
    )}>
      <Icon className="w-3 h-3" />
      <span>{status.mode === 'live' ? 'Live' : 'Sim'}</span>
      <span className="text-xs opacity-70 hidden sm:inline">· {status.provider}</span>
    </div>
  );
}

export function WatchlistPanel() {
  const { items, addSymbol, removeSymbol, isWatched } = useWatchlist();
  const [isOpen, setIsOpen] = useState(false);
  const [quotes, setQuotes] = useState<Record<string, StockQuote>>({});
  const [newSymbol, setNewSymbol] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (items.length === 0 || !isOpen) return;
    let cancelled = false;
    const fetchAll = async () => {
      try {
        const results = await alphaVantage.getBatchQuotes(items.map(i => i.symbol));
        if (!cancelled) setQuotes(results);
      } catch (e) {
        console.warn('Watchlist fetch failed:', e);
      }
    };
    fetchAll();
    const interval = setInterval(fetchAll, 30000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [items, isOpen]);

  const handleAdd = () => {
    const sym = newSymbol.toUpperCase().trim();
    if (sym) {
      addSymbol(sym);
      setNewSymbol('');
      setShowAddForm(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-400 dark:hover:border-blue-600 text-xs font-bold transition-all cursor-pointer shadow-xs"
      >
        <Eye className="w-3.5 h-3.5" />
        <span>Watchlist</span>
        {items.length > 0 && (
          <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 px-1.5 py-0.5 rounded-full font-black">
            {items.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-end p-4 pt-20 bg-black/50 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}
          >
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-current" />
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">My Watchlist</h3>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-400 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 space-y-2 max-h-[60vh] overflow-y-auto">
                {showAddForm ? (
                  <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                    <input
                      type="text"
                      placeholder="Symbol (e.g. AAPL)"
                      value={newSymbol}
                      onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 dark:text-white uppercase outline-none focus:border-blue-500"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleAdd}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => { setShowAddForm(false); setNewSymbol(''); }}
                        className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Popular</span>
                      <div className="flex flex-wrap gap-1">
                        {POPULAR_TICKERS.slice(0, 8).map(t => (
                          <button
                            key={t.symbol}
                            onClick={() => { addSymbol(t.symbol); setShowAddForm(false); }}
                            disabled={isWatched(t.symbol)}
                            className="px-2 py-0.5 rounded-md bg-slate-200/50 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-900/40 dark:hover:text-blue-300 disabled:opacity-30 cursor-pointer transition-colors"
                          >
                            {t.symbol}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-400 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 text-xs font-bold cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Symbol</span>
                  </button>
                )}

                {items.length === 0 && !showAddForm && (
                  <div className="text-center py-8 text-xs text-slate-400">
                    <Eye className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p>No symbols yet. Add one to track live prices.</p>
                  </div>
                )}

                {items.map((item) => {
                  const quote = quotes[item.symbol];
                  const isPositive = (quote?.regularMarketChange ?? 0) >= 0;
                  return (
                    <div
                      key={item.symbol}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="block text-sm font-black text-slate-900 dark:text-white">{item.symbol}</span>
                        <span className="block text-xs text-slate-400">
                          {quote ? `Vol ${quote.regularMarketVolume?.toLocaleString() || 'N/A'}` : 'Loading...'}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        {quote ? (
                          <>
                            <span className="block text-sm font-black text-slate-900 dark:text-white">
                              ${quote.regularMarketPrice.toFixed(2)}
                            </span>
                            <span className={cn(
                              "block text-xs font-bold",
                              isPositive ? "text-emerald-600" : "text-rose-600"
                            )}>
                              {isPositive ? '+' : ''}{quote.regularMarketChangePercent.toFixed(2)}%
                            </span>
                          </>
                        ) : (
                          <span className="text-xs text-slate-400">--</span>
                        )}
                      </div>
                      <button
                        onClick={() => removeSymbol(item.symbol)}
                        className="p-1.5 hover:bg-rose-100 dark:hover:bg-rose-950/30 rounded-md text-slate-400 hover:text-rose-500 cursor-pointer transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
