import { describe, it, expect, beforeEach } from 'vitest';
import { useWatchlist } from './watchlistStore';

describe('WatchlistStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useWatchlist.setState({ items: [] });
  });

  it('adds a symbol to the watchlist', () => {
    const { addSymbol, items } = useWatchlist.getState();
    addSymbol('AAPL');
    expect(useWatchlist.getState().items).toHaveLength(1);
    expect(useWatchlist.getState().items[0].symbol).toBe('AAPL');
  });

  it('normalizes symbol to uppercase', () => {
    const { addSymbol } = useWatchlist.getState();
    addSymbol('aapl');
    expect(useWatchlist.getState().items[0].symbol).toBe('AAPL');
  });

  it('does not add duplicate symbols', () => {
    const { addSymbol } = useWatchlist.getState();
    addSymbol('AAPL');
    addSymbol('AAPL');
    expect(useWatchlist.getState().items).toHaveLength(1);
  });

  it('removes a symbol from the watchlist', () => {
    const { addSymbol, removeSymbol } = useWatchlist.getState();
    addSymbol('AAPL');
    addSymbol('MSFT');
    removeSymbol('AAPL');
    expect(useWatchlist.getState().items).toHaveLength(1);
    expect(useWatchlist.getState().items[0].symbol).toBe('MSFT');
  });

  it('checks if a symbol is watched', () => {
    const { addSymbol, isWatched } = useWatchlist.getState();
    addSymbol('AAPL');
    expect(isWatched('AAPL')).toBe(true);
    expect(isWatched('aapl')).toBe(true);
    expect(isWatched('MSFT')).toBe(false);
  });

  it('toggles a symbol', () => {
    const { toggleSymbol } = useWatchlist.getState();
    toggleSymbol('AAPL');
    expect(useWatchlist.getState().items).toHaveLength(1);
    toggleSymbol('AAPL');
    expect(useWatchlist.getState().items).toHaveLength(0);
  });

  it('sets price alerts', () => {
    const { addSymbol, setAlert } = useWatchlist.getState();
    addSymbol('AAPL');
    setAlert('AAPL', 200, 150);
    const item = useWatchlist.getState().items[0];
    expect(item.alertAbove).toBe(200);
    expect(item.alertBelow).toBe(150);
  });

  it('stores addedAt timestamp', () => {
    const { addSymbol } = useWatchlist.getState();
    const before = new Date().toISOString();
    addSymbol('AAPL');
    const after = new Date().toISOString();
    const ts = useWatchlist.getState().items[0].addedAt;
    expect(ts).toBeTruthy();
    expect(ts >= before).toBe(true);
    expect(ts <= after).toBe(true);
  });

  it('handles empty/whitespace input gracefully', () => {
    const { addSymbol } = useWatchlist.getState();
    addSymbol('');
    addSymbol('   ');
    expect(useWatchlist.getState().items).toHaveLength(0);
  });
});
