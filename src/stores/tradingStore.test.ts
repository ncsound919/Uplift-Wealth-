import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTradingStore, usePortfolioMetrics } from './tradingStore';
import { calculateBlackScholes } from '../utils/blackScholes';

vi.mock('../utils/blackScholes', () => ({
  calculateBlackScholes: vi.fn(() => ({ price: 2.50, delta: 0.5, gamma: 0.05, theta: -0.1, vega: 0.2 })),
}));

describe('tradingStore', () => {
  beforeEach(() => {
    localStorage.removeItem('trading-game-store');
    useTradingStore.getState().reset();
  });

  describe('initial state', () => {
    it('has default cash and starting capital', () => {
      const s = useTradingStore.getState();
      expect(s.cash).toBe(100000);
      expect(s.startingCapital).toBe(100000);
    });

    it('starts with no positions or orders', () => {
      const s = useTradingStore.getState();
      expect(s.positions).toHaveLength(0);
      expect(s.orders).toHaveLength(0);
      expect(s.closedTrades).toHaveLength(0);
    });

    it('has default watchlist and active symbol', () => {
      const s = useTradingStore.getState();
      expect(s.watchlist).toContain('AAPL');
      expect(s.activeSymbol).toBe('AAPL');
    });
  });

  describe('buyStock', () => {
    it('buys shares and reduces cash', () => {
      const ok = useTradingStore.getState().buyStock('AAPL', 10, 150, 'MARKET');
      expect(ok).toBe(true);
      const s = useTradingStore.getState();
      expect(s.cash).toBe(100000 - 1500);
      expect(s.positions).toHaveLength(1);
      expect(s.positions[0].symbol).toBe('AAPL');
      expect(s.positions[0].qty).toBe(10);
      expect(s.positions[0].entryPrice).toBe(150);
      expect(s.positions[0].type).toBe('STOCK');
    });

    it('rejects insufficient funds', () => {
      const ok = useTradingStore.getState().buyStock('AAPL', 1000, 500, 'MARKET');
      expect(ok).toBe(false);
      expect(useTradingStore.getState().positions).toHaveLength(0);
    });

    it('averages into existing position', () => {
      const store = useTradingStore.getState();
      store.buyStock('AAPL', 10, 100, 'MARKET');
      store.buyStock('AAPL', 10, 150, 'MARKET');
      const pos = useTradingStore.getState().positions[0];
      expect(pos.qty).toBe(20);
      expect(pos.entryPrice).toBe(125);
    });

    it('records filled buy order', () => {
      useTradingStore.getState().buyStock('AAPL', 10, 150, 'MARKET');
      const orders = useTradingStore.getState().orders;
      expect(orders).toHaveLength(1);
      expect(orders[0].side).toBe('BUY');
      expect(orders[0].status).toBe('FILLED');
      expect(orders[0].qty).toBe(10);
      expect(orders[0].totalValue).toBe(1500);
    });

    it('adds first_stock_trade badge on first buy', () => {
      useTradingStore.getState().buyStock('AAPL', 1, 100, 'MARKET');
      const badges = useTradingStore.getState().badges;
      expect(badges.some((b) => b.id === 'first_stock_trade')).toBe(true);
    });

    it('adds diversified badge when holding 3+ positions', () => {
      const store = useTradingStore.getState();
      store.buyStock('AAPL', 1, 100, 'MARKET');
      store.buyStock('TSLA', 1, 200, 'MARKET');
      store.buyStock('NVDA', 1, 300, 'MARKET');
      const badges = useTradingStore.getState().badges;
      expect(badges.some((b) => b.id === 'diversified')).toBe(true);
    });
  });

  describe('sellStock', () => {
    it('sells shares, increases cash, reduces position', () => {
      const store = useTradingStore.getState();
      store.buyStock('AAPL', 10, 100, 'MARKET');
      const ok = store.sellStock('AAPL', 5, 150);
      expect(ok).toBe(true);
      const s = useTradingStore.getState();
      expect(s.cash).toBe(100000 - 1000 + 750);
      expect(s.positions[0].qty).toBe(5);
    });

    it('rejects selling more than owned', () => {
      const store = useTradingStore.getState();
      store.buyStock('AAPL', 5, 100, 'MARKET');
      const ok = store.sellStock('AAPL', 10, 150);
      expect(ok).toBe(false);
    });

    it('removes position when selling all shares', () => {
      const store = useTradingStore.getState();
      store.buyStock('AAPL', 5, 100, 'MARKET');
      store.sellStock('AAPL', 5, 150);
      expect(useTradingStore.getState().positions).toHaveLength(0);
    });

    it('records closed trade with positive PnL', () => {
      const store = useTradingStore.getState();
      store.buyStock('AAPL', 10, 100, 'MARKET');
      store.sellStock('AAPL', 10, 150);
      const trades = useTradingStore.getState().closedTrades;
      expect(trades).toHaveLength(1);
      expect(trades[0].symbol).toBe('AAPL');
      expect(trades[0].qty).toBe(10);
      expect(trades[0].entryPrice).toBe(100);
      expect(trades[0].exitPrice).toBe(150);
      expect(trades[0].pnl).toBe(500);
      expect(trades[0].type).toBe('STOCK');
    });

    it('rejects selling unowned stock', () => {
      const ok = useTradingStore.getState().sellStock('AAPL', 1, 150);
      expect(ok).toBe(false);
    });

    it('records closed trade with negative PnL', () => {
      const store = useTradingStore.getState();
      store.buyStock('AAPL', 10, 100, 'MARKET');
      store.sellStock('AAPL', 10, 80);
      expect(useTradingStore.getState().closedTrades[0].pnl).toBe(-200);
    });

    it('records filled sell order', () => {
      const store = useTradingStore.getState();
      store.buyStock('AAPL', 10, 100, 'MARKET');
      store.sellStock('AAPL', 5, 150);
      const orders = useTradingStore.getState().orders;
      expect(orders[0].side).toBe('SELL');
      expect(orders[0].status).toBe('FILLED');
      expect(orders[0].totalValue).toBe(750);
    });
  });

  describe('buyOption', () => {
    it('buys option and reduces cash', () => {
      const ok = useTradingStore.getState().buyOption('AAPL', 'CALL', 155, '30d', 3.50, 1);
      expect(ok).toBe(true);
      const s = useTradingStore.getState();
      expect(s.cash).toBe(100000 - 350);
      expect(s.positions).toHaveLength(1);
      expect(s.positions[0].symbol).toBe('AAPL');
      expect(s.positions[0].type).toBe('CALL');
      expect(s.positions[0].qty).toBe(1);
      expect(s.positions[0].entryPrice).toBe(3.50);
      expect(s.positions[0].strike).toBe(155);
      expect(s.positions[0].expiry).toBe('30d');
    });

    it('rejects insufficient funds', () => {
      const ok = useTradingStore.getState().buyOption('AAPL', 'CALL', 999, '30d', 999999, 1);
      expect(ok).toBe(false);
      expect(useTradingStore.getState().positions).toHaveLength(0);
    });

    it('averages into existing same option', () => {
      const store = useTradingStore.getState();
      store.buyOption('AAPL', 'CALL', 155, '30d', 3.00, 1);
      store.buyOption('AAPL', 'CALL', 155, '30d', 4.00, 1);
      const pos = useTradingStore.getState().positions[0];
      expect(pos.qty).toBe(2);
      expect(pos.entryPrice).toBe(3.50);
    });

    it('creates separate position for different strike', () => {
      const store = useTradingStore.getState();
      store.buyOption('AAPL', 'CALL', 155, '30d', 3.00, 1);
      store.buyOption('AAPL', 'CALL', 160, '30d', 2.00, 1);
      expect(useTradingStore.getState().positions).toHaveLength(2);
    });

    it('adds first_option_trade badge', () => {
      useTradingStore.getState().buyOption('AAPL', 'CALL', 155, '30d', 3.50, 1);
      const badges = useTradingStore.getState().badges;
      expect(badges.some((b) => b.id === 'first_option_trade')).toBe(true);
    });
  });

  describe('sellOption', () => {
    it('sells option, increases cash, reduces position', () => {
      const store = useTradingStore.getState();
      store.buyOption('AAPL', 'CALL', 155, '30d', 3.00, 2);
      const ok = store.sellOption('AAPL', 'CALL', 155, '30d', 4.00, 1);
      expect(ok).toBe(true);
      const s = useTradingStore.getState();
      expect(s.cash).toBe(100000 - 600 + 400);
      expect(s.positions[0].qty).toBe(1);
    });

    it('rejects selling more than owned', () => {
      const store = useTradingStore.getState();
      store.buyOption('AAPL', 'CALL', 155, '30d', 3.00, 1);
      const ok = store.sellOption('AAPL', 'CALL', 155, '30d', 4.00, 5);
      expect(ok).toBe(false);
    });

    it('removes option position when selling all', () => {
      const store = useTradingStore.getState();
      store.buyOption('AAPL', 'CALL', 155, '30d', 3.00, 1);
      store.sellOption('AAPL', 'CALL', 155, '30d', 4.00, 1);
      expect(useTradingStore.getState().positions).toHaveLength(0);
    });

    it('records closed trade with PnL for option', () => {
      const store = useTradingStore.getState();
      store.buyOption('AAPL', 'CALL', 155, '30d', 3.00, 2);
      store.sellOption('AAPL', 'CALL', 155, '30d', 4.00, 2);
      const trades = useTradingStore.getState().closedTrades;
      expect(trades).toHaveLength(1);
      expect(trades[0].pnl).toBe(200);
      expect(trades[0].type).toBe('OPTION');
    });

    it('rejects selling unowned option', () => {
      const ok = useTradingStore.getState().sellOption('AAPL', 'CALL', 155, '30d', 3.50, 1);
      expect(ok).toBe(false);
    });
  });

  describe('closePosition', () => {
    it('does nothing with invalid position id', () => {
      const store = useTradingStore.getState();
      store.buyStock('AAPL', 10, 150, 'MARKET');
      store.closePosition('nonexistent', {});
      expect(useTradingStore.getState().positions).toHaveLength(1);
    });

    it('closes stock position via sellStock', () => {
      const store = useTradingStore.getState();
      store.buyStock('AAPL', 10, 100, 'MARKET');
      const posId = useTradingStore.getState().positions[0].id;
      const quotes = {
        AAPL: { symbol: 'AAPL', regularMarketPrice: 150, regularMarketChange: 50, regularMarketChangePercent: 50 },
      };
      store.closePosition(posId, quotes);
      expect(useTradingStore.getState().positions).toHaveLength(0);
      expect(useTradingStore.getState().cash).toBe(100000 - 1000 + 1500);
    });

    it('closes option position via sellOption', () => {
      const store = useTradingStore.getState();
      store.buyOption('AAPL', 'CALL', 155, '30d', 3.00, 1);
      const posId = useTradingStore.getState().positions[0].id;
      store.closePosition(posId, {});
      expect(useTradingStore.getState().positions).toHaveLength(0);
      expect(useTradingStore.getState().cash).toBe(100000 - 300 + 250);
      expect(calculateBlackScholes).toHaveBeenCalled();
    });

    it('falls back to entryPrice when no quote exists', () => {
      const store = useTradingStore.getState();
      store.buyStock('AAPL', 10, 100, 'MARKET');
      const posId = useTradingStore.getState().positions[0].id;
      store.closePosition(posId, {});
      expect(useTradingStore.getState().positions).toHaveLength(0);
    });
  });

  describe('watchlist management', () => {
    it('addSymbol adds to watchlist and sets active', () => {
      const store = useTradingStore.getState();
      store.addSymbol('GOOGL');
      const s = useTradingStore.getState();
      expect(s.watchlist).toContain('GOOGL');
      expect(s.activeSymbol).toBe('GOOGL');
    });

    it('addSymbol trims and uppercases', () => {
      useTradingStore.getState().addSymbol('  googl  ');
      expect(useTradingStore.getState().watchlist).toContain('GOOGL');
    });

    it('addSymbol does not add duplicates', () => {
      const store = useTradingStore.getState();
      const before = store.watchlist.length;
      store.addSymbol('AAPL');
      expect(useTradingStore.getState().watchlist.length).toBe(before);
    });

    it('addSymbol with empty string does nothing', () => {
      const store = useTradingStore.getState();
      const before = store.watchlist.length;
      store.addSymbol('');
      expect(useTradingStore.getState().watchlist.length).toBe(before);
    });

    it('removeSymbol removes from watchlist', () => {
      const store = useTradingStore.getState();
      store.addSymbol('GOOGL');
      store.removeSymbol('GOOGL');
      expect(useTradingStore.getState().watchlist).not.toContain('GOOGL');
    });

    it('removeSymbol does nothing when watchlist has only one symbol', () => {
      useTradingStore.setState({ watchlist: ['ONLY'], activeSymbol: 'ONLY' });
      useTradingStore.getState().removeSymbol('ONLY');
      expect(useTradingStore.getState().watchlist).toEqual(['ONLY']);
    });

    it('setActiveSymbol updates active symbol', () => {
      useTradingStore.getState().setActiveSymbol('TSLA');
      expect(useTradingStore.getState().activeSymbol).toBe('TSLA');
    });

    it('updateQuotes merges into existing quotes', () => {
      const store = useTradingStore.getState();
      store.updateQuotes({
        AAPL: { symbol: 'AAPL', regularMarketPrice: 150, regularMarketChange: 5, regularMarketChangePercent: 3.45 },
      });
      expect(useTradingStore.getState().quotes.AAPL.regularMarketPrice).toBe(150);
    });
  });

  describe('recordNavSnapshot', () => {
    it('records snapshot with cash only when no positions', () => {
      useTradingStore.getState().recordNavSnapshot();
      const history = useTradingStore.getState().navHistory;
      expect(history).toHaveLength(1);
      expect(history[0].cash).toBe(100000);
      expect(history[0].positionsValue).toBe(0);
      expect(history[0].nav).toBe(100000);
    });

    it('records snapshot with stock position value', () => {
      const store = useTradingStore.getState();
      store.buyStock('AAPL', 10, 100, 'MARKET');
      store.updateQuotes({
        AAPL: { symbol: 'AAPL', regularMarketPrice: 150, regularMarketChange: 50, regularMarketChangePercent: 50 },
      });
      store.recordNavSnapshot();
      const snap = useTradingStore.getState().navHistory[0];
      expect(snap.positionsValue).toBe(1500);
      expect(snap.nav).toBe(100000 - 1000 + 1500);
    });

    it('records snapshot with option position using Black-Scholes', () => {
      const store = useTradingStore.getState();
      store.buyOption('AAPL', 'CALL', 155, '30d', 3.00, 2);
      store.recordNavSnapshot();
      const snap = useTradingStore.getState().navHistory[0];
      expect(snap.positionsValue).toBe(2 * 2.50 * 100);
      expect(snap.nav).toBe(100000 - 600 + 500);
    });

    it('keeps last 500 snapshots', () => {
      const store = useTradingStore.getState();
      for (let i = 0; i < 600; i++) {
        store.recordNavSnapshot();
      }
      expect(useTradingStore.getState().navHistory.length).toBeLessThanOrEqual(500);
    });
  });

  describe('triggerMarketEvent', () => {
    beforeEach(() => {
      useTradingStore.getState().updateQuotes({
        AAPL: { symbol: 'AAPL', regularMarketPrice: 150, regularMarketChange: 0, regularMarketChangePercent: 0 },
        TSLA: { symbol: 'TSLA', regularMarketPrice: 250, regularMarketChange: 0, regularMarketChangePercent: 0 },
      });
    });

    it('earnings: single symbol +8.2%', () => {
      useTradingStore.getState().triggerMarketEvent('earnings', 'AAPL');
      const q = useTradingStore.getState().quotes.AAPL;
      expect(q.regularMarketPrice).toBe(162.30);
      expect(q.regularMarketChangePercent).toBeCloseTo(8.2, 10);
    });

    it('rate_hike: affects all symbols', () => {
      useTradingStore.getState().triggerMarketEvent('rate_hike', 'AAPL');
      const quotes = useTradingStore.getState().quotes;
      expect(quotes.AAPL.regularMarketPrice).toBe(142.80);
      expect(quotes.TSLA.regularMarketPrice).toBe(241.60);
    });

    it('squeeze: single symbol +16.5%', () => {
      useTradingStore.getState().triggerMarketEvent('squeeze', 'AAPL');
      expect(useTradingStore.getState().quotes.AAPL.regularMarketPrice).toBe(174.75);
    });

    it('crash: affects all symbols', () => {
      useTradingStore.getState().triggerMarketEvent('crash', 'AAPL');
      const quotes = useTradingStore.getState().quotes;
      expect(quotes.AAPL.regularMarketPrice).toBe(132.00);
      expect(quotes.TSLA.regularMarketPrice).toBe(229.00);
    });

    it('rebound: single symbol +6.5%', () => {
      useTradingStore.getState().triggerMarketEvent('rebound', 'AAPL');
      expect(useTradingStore.getState().quotes.AAPL.regularMarketPrice).toBe(159.75);
    });

    it('targets activeSymbol when no target given', () => {
      useTradingStore.getState().setActiveSymbol('TSLA');
      useTradingStore.getState().triggerMarketEvent('squeeze');
      expect(useTradingStore.getState().quotes.TSLA.regularMarketPrice).toBe(291.25);
    });

    it('uses fallback price when no quote exists for symbol', () => {
      useTradingStore.getState().triggerMarketEvent('earnings', 'UNKNOWN');
      expect(useTradingStore.getState().quotes.UNKNOWN.regularMarketPrice).toBe(162.30);
    });

    it('logs market event and records nav snapshot', () => {
      const store = useTradingStore.getState();
      const logBefore = store.logMessages.length;
      const navBefore = store.navHistory.length;
      store.triggerMarketEvent('earnings', 'AAPL');
      const s = useTradingStore.getState();
      expect(s.logMessages.length).toBeGreaterThan(logBefore);
      expect(s.navHistory.length).toBeGreaterThan(navBefore);
      expect(s.simulatedEvent).toContain('EARNINGS BEAT');
    });
  });

  describe('fastForwardDays', () => {
    beforeEach(() => {
      useTradingStore.setState({ simulatedDaysAdvanced: 0, simulatedEvent: null });
    });

    it('increments simulatedDaysAdvanced', () => {
      useTradingStore.getState().fastForwardDays(5);
      expect(useTradingStore.getState().simulatedDaysAdvanced).toBe(5);
    });

    it('updates quotes with deterministic random walk', () => {
      const store = useTradingStore.getState();
      store.updateQuotes({
        AAPL: { symbol: 'AAPL', regularMarketPrice: 150, regularMarketChange: 0, regularMarketChangePercent: 0 },
      });
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      store.fastForwardDays(5);
      expect(useTradingStore.getState().quotes.AAPL.regularMarketPrice).not.toBe(150);
      vi.restoreAllMocks();
    });

    it('adds log and records nav snapshot', () => {
      const store = useTradingStore.getState();
      const logBefore = store.logMessages.length;
      const navBefore = store.navHistory.length;
      store.fastForwardDays(1);
      const s = useTradingStore.getState();
      expect(s.logMessages.length).toBeGreaterThan(logBefore);
      expect(s.navHistory.length).toBeGreaterThan(navBefore);
    });

    it('handles zero days without error', () => {
      useTradingStore.getState().fastForwardDays(0);
      expect(useTradingStore.getState().simulatedDaysAdvanced).toBe(0);
    });

    it('accumulates days across calls', () => {
      const store = useTradingStore.getState();
      store.fastForwardDays(3);
      store.fastForwardDays(7);
      expect(useTradingStore.getState().simulatedDaysAdvanced).toBe(10);
    });
  });

  describe('executeStrategy', () => {
    it('executes covered_call: buys stock + sells call', () => {
      const ok = useTradingStore.getState().executeStrategy('covered_call', 'AAPL', 150, 1);
      expect(ok).toBe(true);
      const s = useTradingStore.getState();
      expect(s.positions.some((p) => p.type === 'STOCK')).toBe(true);
      expect(s.positions.some((p) => p.type === 'CALL')).toBe(true);
      const badges = s.badges;
      expect(badges.some((b) => b.id === 'strat_covered_call')).toBe(true);
    });

    it('executes protective_put: buys stock + buys put', () => {
      const ok = useTradingStore.getState().executeStrategy('protective_put', 'AAPL', 150, 1);
      expect(ok).toBe(true);
      const s = useTradingStore.getState();
      expect(s.positions.some((p) => p.type === 'STOCK')).toBe(true);
      expect(s.positions.some((p) => p.type === 'PUT')).toBe(true);
      const badges = s.badges;
      expect(badges.some((b) => b.id === 'strat_protective_put')).toBe(true);
    });

    it('executes bull_call_spread: buys call + sells call', () => {
      const ok = useTradingStore.getState().executeStrategy('bull_call_spread', 'AAPL', 150, 1);
      expect(ok).toBe(true);
      const s = useTradingStore.getState();
      expect(s.positions.some((p) => p.type === 'CALL')).toBe(true);
    });

    it('executes bear_put_spread: buys put + sells put', () => {
      const ok = useTradingStore.getState().executeStrategy('bear_put_spread', 'AAPL', 150, 1);
      expect(ok).toBe(true);
      const s = useTradingStore.getState();
      const putPositions = s.positions.filter((p) => p.type === 'PUT');
      expect(putPositions.length).toBeGreaterThanOrEqual(1);
    });

    it('executes long_straddle: buys call + buys put at ATM', () => {
      const ok = useTradingStore.getState().executeStrategy('long_straddle', 'AAPL', 150, 1);
      expect(ok).toBe(true);
      const s = useTradingStore.getState();
      expect(s.positions.some((p) => p.type === 'CALL')).toBe(true);
      expect(s.positions.some((p) => p.type === 'PUT')).toBe(true);
      const badges = s.badges;
      expect(badges.some((b) => b.id === 'strat_straddle')).toBe(true);
    });

    it('returns false for unknown strategy', () => {
      const ok = (useTradingStore.getState().executeStrategy as any)('unknown_strategy', 'AAPL', 150, 1);
      expect(ok).toBe(false);
    });

    it('fails covered_call when insufficient cash for stock purchase', () => {
      useTradingStore.setState({ cash: 100 });
      const ok = useTradingStore.getState().executeStrategy('covered_call', 'AAPL', 150, 1);
      expect(ok).toBe(false);
    });

    it('fails protective_put when insufficient cash for stock purchase', () => {
      useTradingStore.setState({ cash: 100 });
      const ok = useTradingStore.getState().executeStrategy('protective_put', 'AAPL', 150, 1);
      expect(ok).toBe(false);
    });

    it('fails bull_call_spread when the option buy is rejected', () => {
      useTradingStore.setState({ cash: 100 });
      const ok = useTradingStore.getState().executeStrategy('bull_call_spread', 'AAPL', 150, 1);
      expect(ok).toBe(false);
    });

    it('fails bear_put_spread when the option buy is rejected', () => {
      useTradingStore.setState({ cash: 100 });
      const ok = useTradingStore.getState().executeStrategy('bear_put_spread', 'AAPL', 150, 1);
      expect(ok).toBe(false);
    });

    it('fails long_straddle when the call buy is rejected', () => {
      useTradingStore.setState({ cash: 100 });
      const ok = useTradingStore.getState().executeStrategy('long_straddle', 'AAPL', 150, 1);
      expect(ok).toBe(false);
    });
  });

  describe('addBadge', () => {
    it('adds badge if not duplicate', () => {
      useTradingStore.getState().addBadge({ id: 'test_badge', title: 'Test', desc: 'Testing' });
      const badges = useTradingStore.getState().badges;
      expect(badges).toHaveLength(1);
      expect(badges[0].id).toBe('test_badge');
      expect(badges[0].title).toBe('Test');
      expect(badges[0].earnedAt).toBeTruthy();
    });

    it('does not add duplicate badge', () => {
      const store = useTradingStore.getState();
      store.addBadge({ id: 'test_badge', title: 'Test', desc: 'Testing' });
      store.addBadge({ id: 'test_badge', title: 'Test', desc: 'Testing' });
      expect(useTradingStore.getState().badges).toHaveLength(1);
    });
  });

  describe('addLog', () => {
    it('adds log message', () => {
      useTradingStore.getState().addLog('Test log message');
      const logs = useTradingStore.getState().logMessages;
      expect(logs[0]).toContain('Test log message');
    });

    it('limits to 100 messages', () => {
      const store = useTradingStore.getState();
      for (let i = 0; i < 150; i++) {
        store.addLog(`Message ${i}`);
      }
      expect(useTradingStore.getState().logMessages.length).toBeLessThanOrEqual(100);
    });
  });

  describe('reset', () => {
    it('restores initial state after trades', () => {
      const store = useTradingStore.getState();
      store.buyStock('AAPL', 10, 150, 'MARKET');
      store.buyOption('AAPL', 'CALL', 155, '30d', 3.50, 1);
      store.reset();
      const s = useTradingStore.getState();
      expect(s.cash).toBe(100000);
      expect(s.positions).toHaveLength(0);
      expect(s.orders).toHaveLength(0);
      expect(s.closedTrades).toHaveLength(0);
      expect(s.navHistory).toHaveLength(0);
      expect(s.badges).toHaveLength(0);
    });
  });

  describe('usePortfolioMetrics', () => {
    it('returns initial metrics with no positions', () => {
      const { result } = renderHook(() => usePortfolioMetrics());
      expect(result.current.totalNav).toBe(100000);
      expect(result.current.cash).toBe(100000);
      expect(result.current.positionsValue).toBe(0);
      expect(result.current.totalTrades).toBe(0);
      expect(result.current.winRate).toBe(0);
    });

    it('reflects stock position values', () => {
      const store = useTradingStore.getState();
      store.buyStock('AAPL', 10, 100, 'MARKET');
      store.updateQuotes({
        AAPL: { symbol: 'AAPL', regularMarketPrice: 150, regularMarketChange: 50, regularMarketChangePercent: 50 },
      });
      const { result } = renderHook(() => usePortfolioMetrics());
      expect(result.current.totalNav).toBe(100000 - 1000 + 1500);
      expect(result.current.positionsValue).toBe(1500);
      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].unrealizedPnl).toBe(500);
    });

    it('reflects option position values using Black-Scholes', () => {
      const store = useTradingStore.getState();
      store.buyOption('AAPL', 'CALL', 155, '30d', 3.00, 2);
      const { result } = renderHook(() => usePortfolioMetrics());
      expect(result.current.positionsValue).toBe(2 * 2.50 * 100);
      expect(result.current.totalNav).toBe(100000 - 600 + 500);
    });

    it('tracks closed trades win rate', () => {
      const store = useTradingStore.getState();
      store.buyStock('AAPL', 10, 100, 'MARKET');
      store.sellStock('AAPL', 10, 150);
      store.buyStock('TSLA', 5, 200, 'MARKET');
      store.sellStock('TSLA', 5, 180);
      const { result } = renderHook(() => usePortfolioMetrics());
      expect(result.current.closedTradesCount).toBe(2);
      expect(result.current.winRate).toBe(50);
    });
  });
});
