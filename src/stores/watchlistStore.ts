import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface WatchlistItem {
  symbol: string;
  addedAt: string;
  alertAbove?: number;
  alertBelow?: number;
}

interface WatchlistState {
  items: WatchlistItem[];
  addSymbol: (symbol: string, alertAbove?: number, alertBelow?: number) => void;
  removeSymbol: (symbol: string) => void;
  setAlert: (symbol: string, alertAbove?: number, alertBelow?: number) => void;
  isWatched: (symbol: string) => boolean;
  toggleSymbol: (symbol: string) => void;
}

export const useWatchlist = create<WatchlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addSymbol: (symbol, alertAbove, alertBelow) => {
        const sym = symbol.toUpperCase().trim();
        if (!sym) return;
        const items = get().items;
        if (items.some(i => i.symbol === sym)) return;
        set({
          items: [...items, { symbol: sym, addedAt: new Date().toISOString(), alertAbove, alertBelow }],
        });
      },
      removeSymbol: (symbol) => {
        set({ items: get().items.filter(i => i.symbol !== symbol.toUpperCase()) });
      },
      setAlert: (symbol, alertAbove, alertBelow) => {
        set({
          items: get().items.map(i =>
            i.symbol === symbol.toUpperCase() ? { ...i, alertAbove, alertBelow } : i
          ),
        });
      },
      isWatched: (symbol) => {
        return get().items.some(i => i.symbol === symbol.toUpperCase());
      },
      toggleSymbol: (symbol) => {
        const sym = symbol.toUpperCase();
        if (get().isWatched(sym)) {
          get().removeSymbol(sym);
        } else {
          get().addSymbol(sym);
        }
      },
    }),
    { name: 'stock_watchlist', storage: createJSONStorage(() => localStorage) }
  )
);

export const POPULAR_TICKERS = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft' },
  { symbol: 'GOOGL', name: 'Alphabet' },
  { symbol: 'AMZN', name: 'Amazon' },
  { symbol: 'NVDA', name: 'NVIDIA' },
  { symbol: 'TSLA', name: 'Tesla' },
  { symbol: 'META', name: 'Meta Platforms' },
  { symbol: 'JPM', name: 'JPMorgan Chase' },
  { symbol: 'V', name: 'Visa' },
  { symbol: 'BAC', name: 'Bank of America' },
  { symbol: 'WFC', name: 'Wells Fargo' },
  { symbol: 'GS', name: 'Goldman Sachs' },
  { symbol: 'BLK', name: 'BlackRock' },
  { symbol: 'SQ', name: 'Block (Square)' },
  { symbol: 'PYPL', name: 'PayPal' },
  { symbol: 'COIN', name: 'Coinbase' },
  { symbol: 'HOOD', name: 'Robinhood' },
  { symbol: 'SOFI', name: 'SoFi Technologies' },
  { symbol: 'AFRM', name: 'Affirm' },
  { symbol: 'PLTR', name: 'Palantir' },
];
