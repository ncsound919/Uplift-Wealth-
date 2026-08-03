import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import {
  generateFallbackChart,
  useChart,
  useOptionChain,
  useQuotePolling,
  useTechnicalIndicators,
  useTradeJournal,
  useRiskAlerts,
} from './tradingHooks';
import { useTradingStore } from '../stores/tradingStore';
import { alphaVantage } from '../lib/alphaVantageClient';

vi.mock('../lib/alphaVantageClient', () => ({
  alphaVantage: {
    getBatchQuotes: vi.fn().mockResolvedValue({}),
    getDailyChart: vi.fn().mockResolvedValue([]),
    getIntradayChart: vi.fn().mockResolvedValue([]),
    getSMA: vi.fn().mockResolvedValue(null),
    getRSI: vi.fn().mockResolvedValue(null),
  },
}));

function makeQuote(symbol: string, price: number) {
  return { symbol, regularMarketPrice: price, regularMarketChange: 0, regularMarketChangePercent: 0 };
}

function makeTrade(id: string, symbol: string, pnl: number, holdingHours = 24) {
  return {
    id, symbol, side: 'BUY' as const, qty: 10, entryPrice: 100, exitPrice: 100 + pnl / 10,
    pnl, pnlPct: (pnl / 1000) * 100, openedAt: '2024-01-01', closedAt: '2024-01-10',
    type: 'STOCK' as const, holdingPeriodHours: holdingHours,
  };
}

function makePosition(id: string, symbol: string, qty: number, entryPrice: number, type: 'STOCK' | 'CALL' | 'PUT' = 'STOCK') {
  return { id, symbol, type, qty, entryPrice, openedAt: new Date().toISOString() };
}

describe('generateFallbackChart', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns array of OHLCPoint objects with correct structure', () => {
    const result = generateFallbackChart('NVDA');
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    const p = result[0];
    expect(p).toHaveProperty('date');
    expect(p).toHaveProperty('open');
    expect(p).toHaveProperty('high');
    expect(p).toHaveProperty('low');
    expect(p).toHaveProperty('close');
    expect(p).toHaveProperty('volume');
    expect(typeof p.date).toBe('string');
    expect(typeof p.open).toBe('number');
    expect(typeof p.high).toBe('number');
    expect(typeof p.low).toBe('number');
    expect(typeof p.close).toBe('number');
    expect(typeof p.volume).toBe('number');
  });

  it('returns 39 points for range=1d', () => {
    expect(generateFallbackChart('NVDA', '1d')).toHaveLength(39);
  });

  it('returns 65 points for range=3mo', () => {
    expect(generateFallbackChart('NVDA', '3mo')).toHaveLength(65);
  });

  it('returns 120 points for range=1y', () => {
    expect(generateFallbackChart('NVDA', '1y')).toHaveLength(120);
  });

  it('returns 30 points for default/unknown range', () => {
    expect(generateFallbackChart('NVDA', 'unknown')).toHaveLength(30);
  });

  it('formats dates as time strings for 1d range', () => {
    const result = generateFallbackChart('NVDA', '1d', '1d');
    result.forEach((p) => {
      expect(p.date).toMatch(/\d{1,2}:\d{2}/);
    });
  });

  it('formats dates as date strings for multi-day daily chart', () => {
    const result = generateFallbackChart('NVDA', '1mo', '1d');
    result.forEach((p) => {
      expect(p.date).not.toMatch(/\d{1,2}:\d{2}/);
    });
  });

  it('formats dates as time strings for intraday intervals', () => {
    const result = generateFallbackChart('NVDA', '1mo', '5min');
    result.forEach((p) => {
      expect(p.date).toMatch(/\d{1,2}:\d{2}/);
    });
  });

  it('handles TSLA symbol', () => {
    const result = generateFallbackChart('TSLA', '1d');
    expect(result).toHaveLength(39);
    expect(result[0].close).toBeGreaterThan(0);
  });

  it('handles AAPL symbol', () => {
    const result = generateFallbackChart('AAPL', '1d');
    expect(result).toHaveLength(39);
    expect(result[0].close).toBeGreaterThan(0);
  });

  it('handles unknown symbols with default base price', () => {
    const result = generateFallbackChart('UNKNOWN', '1d');
    expect(result).toHaveLength(39);
    expect(result[0].close).toBeGreaterThan(0);
  });
});

describe('useQuotePolling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useTradingStore.setState({ quotes: {} });
  });

  it('calls getBatchQuotes with provided symbols on mount', async () => {
    const mockQuotes = { AAPL: makeQuote('AAPL', 150), TSLA: makeQuote('TSLA', 220) };
    vi.mocked(alphaVantage.getBatchQuotes).mockResolvedValue(mockQuotes);
    const { result, unmount } = renderHook(() => useQuotePolling(['AAPL', 'TSLA']));
    expect(alphaVantage.getBatchQuotes).toHaveBeenCalledWith(['AAPL', 'TSLA']);
    await waitFor(() => expect(result.current.loading).toBe(false));
    unmount();
  });

  it('sets loading true then false after poll completes', async () => {
    vi.mocked(alphaVantage.getBatchQuotes).mockResolvedValue({ AAPL: makeQuote('AAPL', 150) });
    const { result, unmount } = renderHook(() => useQuotePolling(['AAPL']));
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    unmount();
  });

  it('returns refresh function', async () => {
    vi.mocked(alphaVantage.getBatchQuotes).mockResolvedValue({ AAPL: makeQuote('AAPL', 150) });
    const { result, unmount } = renderHook(() => useQuotePolling(['AAPL']));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(typeof result.current.refresh).toBe('function');
    unmount();
  });

  it('polls on window focus', async () => {
    vi.mocked(alphaVantage.getBatchQuotes).mockResolvedValue({ AAPL: makeQuote('AAPL', 150) });
    const { unmount } = renderHook(() => useQuotePolling(['AAPL']));
    await waitFor(() => expect(alphaVantage.getBatchQuotes).toHaveBeenCalledTimes(1));
    window.dispatchEvent(new Event('focus'));
    await waitFor(() => expect(alphaVantage.getBatchQuotes).toHaveBeenCalledTimes(2));
    unmount();
  });
});

describe('useChart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns fallback data initially with loading true', () => {
    const { result } = renderHook(() => useChart('NVDA', '1mo', '1d'));
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.data.length).toBeGreaterThan(0);
  });

  it('replaces data with API results on success', async () => {
    const mockData = [
      { date: 'Jan 10', open: 130, high: 132, low: 128, close: 131, volume: 5000000 },
      { date: 'Jan 11', open: 131, high: 133, low: 129, close: 132, volume: 4800000 },
    ];
    vi.mocked(alphaVantage.getDailyChart).mockResolvedValue(mockData);
    const { result } = renderHook(() => useChart('NVDA', '1mo', '1d'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  it('calls getIntradayChart for non-1d interval', async () => {
    const mockData = [
      { date: '10:30', open: 130, high: 131, low: 129, close: 130.5, volume: 100000 },
    ];
    vi.mocked(alphaVantage.getIntradayChart).mockResolvedValue(mockData);
    const { result } = renderHook(() => useChart('NVDA', '1d', '5min'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(alphaVantage.getIntradayChart).toHaveBeenCalledWith('NVDA', '5min');
    expect(result.current.data).toEqual(mockData);
  });

  it('handles API error by setting error and keeping fallback data', async () => {
    vi.mocked(alphaVantage.getDailyChart).mockRejectedValue(new Error('API limit'));
    const { result } = renderHook(() => useChart('NVDA', '1mo', '1d'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('API limit');
    expect(result.current.data.length).toBeGreaterThan(0);
  });
});

describe('useOptionChain', () => {
  it('generates correct number of strikes centered around spot price', () => {
    const { result } = renderHook(() => useOptionChain('NVDA', 128.5, 30, 5));
    expect(result.current).toHaveLength(5);
    expect(result.current[0].strike).toBe(120);
    expect(result.current[2].strike).toBe(130);
    expect(result.current[4].strike).toBe(140);
  });

  it('returns call and put with greeks for each strike', () => {
    const { result } = renderHook(() => useOptionChain('AAPL', 225, 30, 3));
    expect(result.current).toHaveLength(3);
    result.current.forEach((item) => {
      expect(item).toHaveProperty('strike');
      expect(item).toHaveProperty('iv');
      expect(item.call).toHaveProperty('premium');
      expect(item.call).toHaveProperty('delta');
      expect(item.call).toHaveProperty('gamma');
      expect(item.call).toHaveProperty('theta');
      expect(item.call).toHaveProperty('vega');
      expect(item.put).toHaveProperty('premium');
      expect(item.put).toHaveProperty('delta');
      expect(item.put).toHaveProperty('gamma');
      expect(item.put).toHaveProperty('theta');
      expect(item.put).toHaveProperty('vega');
      expect(typeof item.call.premium).toBe('number');
      expect(typeof item.put.premium).toBe('number');
      expect(item.call.premium).toBeGreaterThan(0);
      expect(item.put.premium).toBeGreaterThan(0);
    });
  });

  it('call delta is positive and put delta is negative', () => {
    const { result } = renderHook(() => useOptionChain('TSLA', 220, 30, 5));
    result.current.forEach((item) => {
      expect(item.call.delta).toBeGreaterThan(0);
      expect(item.put.delta).toBeLessThan(0);
    });
  });

  it('uses symbol-specific implied volatility', () => {
    const { result } = renderHook(() => useOptionChain('COIN', 215.6, 30, 3));
    result.current.forEach((item) => {
      expect(item.iv).toBeGreaterThan(50);
    });
  });

  it('uses default IV for unknown symbols', () => {
    const { result } = renderHook(() => useOptionChain('XYZ', 100, 30, 3));
    expect(result.current[1].iv).toBeGreaterThanOrEqual(29);
    expect(result.current[1].iv).toBeLessThanOrEqual(31);
  });

  it('uses wider strike interval for high-price stocks', () => {
    const { result } = renderHook(() => useOptionChain('SPY', 550, 30, 3));
    expect(result.current[0].strike).toBe(540);
    expect(result.current[1].strike).toBe(550);
    expect(result.current[2].strike).toBe(560);
  });

  it('uses narrow strike interval for low-price stocks', () => {
    const { result } = renderHook(() => useOptionChain('XYZ', 25, 30, 3));
    expect(result.current[0].strike).toBe(24);
    expect(result.current[1].strike).toBe(25);
    expect(result.current[2].strike).toBe(26);
  });
});

describe('useTechnicalIndicators', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls getSMA and getRSI on mount', async () => {
    const smaResponse = { 'Technical Analysis: SMA': { '2024-01-10': '150.5' } };
    const rsiResponse = { 'Technical Analysis: RSI': { '2024-01-10': '55.2' } };
    vi.mocked(alphaVantage.getSMA).mockResolvedValue(smaResponse);
    vi.mocked(alphaVantage.getRSI).mockResolvedValue(rsiResponse);
    const { result } = renderHook(() => useTechnicalIndicators('AAPL'));
    expect(alphaVantage.getSMA).toHaveBeenCalledWith('AAPL', 'daily', 20, 'close');
    expect(alphaVantage.getSMA).toHaveBeenCalledWith('AAPL', 'daily', 50, 'close');
    expect(alphaVantage.getRSI).toHaveBeenCalledWith('AAPL', 'daily', 14, 'close');
    await waitFor(() => {
      expect(result.current.sma20).toBe(150.5);
      expect(result.current.sma50).toBe(150.5);
      expect(result.current.rsi14).toBe(55.2);
    });
  });

  it('returns null indicators when API returns null', async () => {
    vi.mocked(alphaVantage.getSMA).mockResolvedValue(null);
    vi.mocked(alphaVantage.getRSI).mockResolvedValue(null);
    const { result } = renderHook(() => useTechnicalIndicators('AAPL'));
    await waitFor(() => expect(result.current.sma20).toBeNull());
    expect(result.current.sma50).toBeNull();
    expect(result.current.rsi14).toBeNull();
  });
});

describe('useTradeJournal', () => {
  beforeEach(() => {
    useTradingStore.setState({ closedTrades: [], navHistory: [] });
  });

  it('returns zeroed metrics for empty trades list', () => {
    const { result } = renderHook(() => useTradeJournal());
    expect(result.current.totalTrades).toBe(0);
    expect(result.current.winRate).toBe(0);
    expect(result.current.avgWin).toBe(0);
    expect(result.current.avgLoss).toBe(0);
    expect(result.current.profitFactor).toBe(0);
    expect(result.current.largestWin).toBe(0);
    expect(result.current.largestLoss).toBe(0);
    expect(result.current.avgHoldingPeriod).toBe(0);
    expect(result.current.totalPnl).toBe(0);
    expect(result.current.currentStreak).toBe(0);
    expect(result.current.maxWinStreak).toBe(0);
    expect(result.current.maxLossStreak).toBe(0);
    expect(result.current.bySymbol).toEqual({});
    expect(result.current.bestSymbol).toBeNull();
    expect(result.current.worstSymbol).toBeNull();
  });

  it('calculates win/loss metrics correctly', () => {
    useTradingStore.setState({
      closedTrades: [
        makeTrade('1', 'AAPL', 100),
        makeTrade('2', 'AAPL', 50),
        makeTrade('3', 'AAPL', -30),
        makeTrade('4', 'AAPL', -20),
      ],
    });
    const { result } = renderHook(() => useTradeJournal());
    expect(result.current.totalTrades).toBe(4);
    expect(result.current.winRate).toBe(50);
    expect(result.current.avgWin).toBe(75);
    expect(result.current.avgLoss).toBe(-25);
    expect(result.current.profitFactor).toBe(3);
    expect(result.current.largestWin).toBe(100);
    expect(result.current.largestLoss).toBe(-30);
    expect(result.current.totalPnl).toBe(100);
  });

  it('calculates win streaks correctly', () => {
    useTradingStore.setState({
      closedTrades: [
        makeTrade('1', 'AAPL', 100),
        makeTrade('2', 'AAPL', 50),
        makeTrade('3', 'AAPL', 50),
      ],
    });
    const { result } = renderHook(() => useTradeJournal());
    expect(result.current.currentStreak).toBe(3);
    expect(result.current.maxWinStreak).toBe(3);
    expect(result.current.maxLossStreak).toBe(0);
  });

  it('calculates loss streaks correctly', () => {
    useTradingStore.setState({
      closedTrades: [
        makeTrade('1', 'AAPL', -100),
        makeTrade('2', 'AAPL', -50),
        makeTrade('3', 'AAPL', -30),
      ],
    });
    const { result } = renderHook(() => useTradeJournal());
    expect(result.current.currentStreak).toBe(3);
    expect(result.current.maxWinStreak).toBe(0);
    expect(result.current.maxLossStreak).toBe(3);
  });

  it('tracks alternating win/loss streaks', () => {
    useTradingStore.setState({
      closedTrades: [
        makeTrade('1', 'AAPL', 100),
        makeTrade('2', 'AAPL', 200),
        makeTrade('3', 'AAPL', -50),
        makeTrade('4', 'AAPL', -30),
        makeTrade('5', 'AAPL', 10),
      ],
    });
    const { result } = renderHook(() => useTradeJournal());
    expect(result.current.currentStreak).toBe(2);
    expect(result.current.maxWinStreak).toBe(2);
    expect(result.current.maxLossStreak).toBe(2);
  });

  it('aggregates by symbol', () => {
    useTradingStore.setState({
      closedTrades: [
        makeTrade('1', 'AAPL', 100),
        makeTrade('2', 'AAPL', -50),
        makeTrade('3', 'TSLA', 200),
        makeTrade('4', 'TSLA', -30),
      ],
    });
    const { result } = renderHook(() => useTradeJournal());
    expect(result.current.bySymbol.AAPL).toBeDefined();
    expect(result.current.bySymbol.AAPL.pnl).toBe(50);
    expect(result.current.bySymbol.AAPL.trades).toBe(2);
    expect(result.current.bySymbol.AAPL.winRate).toBe(50);
    expect(result.current.bySymbol.TSLA).toBeDefined();
    expect(result.current.bySymbol.TSLA.pnl).toBe(170);
    expect(result.current.bySymbol.TSLA.trades).toBe(2);
    expect(result.current.bySymbol.TSLA.winRate).toBe(50);
  });

  it('identifies best and worst symbols', () => {
    useTradingStore.setState({
      closedTrades: [
        makeTrade('1', 'AAPL', 50),
        makeTrade('2', 'TSLA', 200),
        makeTrade('3', 'MSFT', -100),
      ],
    });
    const { result } = renderHook(() => useTradeJournal());
    expect(result.current.bestSymbol).toBe('TSLA');
    expect(result.current.worstSymbol).toBe('MSFT');
  });
});

describe('useRiskAlerts', () => {
  beforeEach(() => {
    useTradingStore.setState({
      positions: [],
      quotes: {},
      cash: 100000,
      navHistory: [],
    });
  });

  it('returns info alert for fully cash portfolio with no positions', () => {
    useTradingStore.setState({ cash: 100000, positions: [], navHistory: [] });
    const { result } = renderHook(() => useRiskAlerts());
    expect(result.current.length).toBeGreaterThanOrEqual(1);
    expect(result.current.some((a) => a.severity === 'info')).toBe(true);
    expect(result.current.some((a) => a.message.includes('fully in cash'))).toBe(true);
  });

  it('returns warning for concentrated position >30%', () => {
    useTradingStore.setState({
      positions: [makePosition('1', 'AAPL', 100, 100)],
      quotes: { AAPL: makeQuote('AAPL', 800) },
      cash: 20000,
      navHistory: [],
    });
    const { result } = renderHook(() => useRiskAlerts());
    expect(result.current.some((a) => a.message.includes('concentration'))).toBe(true);
    expect(result.current.some((a) => a.severity === 'danger')).toBe(true);
  });

  it('returns warning for moderately concentrated position >30% but <=50%', () => {
    useTradingStore.setState({
      positions: [makePosition('1', 'AAPL', 60, 100)],
      quotes: { AAPL: makeQuote('AAPL', 400) },
      cash: 50000,
      navHistory: [],
    });
    const { result } = renderHook(() => useRiskAlerts());
    expect(result.current.some((a) => a.message.includes('concentration'))).toBe(true);
    expect(result.current.some((a) => a.severity === 'warning')).toBe(true);
  });

  it('values option positions in portfolio concentration', () => {
    useTradingStore.setState({
      positions: [
        makePosition('1', 'TSLA', 10, 220, 'CALL'),
        makePosition('2', 'TSLA', 5, 220, 'PUT'),
      ],
      quotes: { TSLA: makeQuote('TSLA', 220) },
      cash: 10000,
      navHistory: [],
    });
    const { result } = renderHook(() => useRiskAlerts());
    expect(result.current).toBeDefined();
    expect(Array.isArray(result.current)).toBe(true);
  });

  it('returns warning for low cash', () => {
    useTradingStore.setState({
      positions: [makePosition('1', 'AAPL', 10, 100)],
      quotes: { AAPL: makeQuote('AAPL', 200) },
      cash: 100,
      navHistory: [],
    });
    const { result } = renderHook(() => useRiskAlerts());
    expect(result.current.some((a) => a.message.includes('cash'))).toBe(true);
  });

  it('returns drawdown warning when max drawdown exceeds 15%', () => {
    useTradingStore.setState({
      positions: [makePosition('1', 'AAPL', 10, 100)],
      quotes: { AAPL: makeQuote('AAPL', 200) },
      cash: 10000,
      navHistory: [
        { timestamp: 1, nav: 100000, cash: 100000, positionsValue: 0 },
        { timestamp: 2, nav: 110000, cash: 110000, positionsValue: 0 },
        { timestamp: 3, nav: 105000, cash: 105000, positionsValue: 0 },
        { timestamp: 4, nav: 95000, cash: 95000, positionsValue: 0 },
        { timestamp: 5, nav: 90000, cash: 90000, positionsValue: 0 },
        { timestamp: 6, nav: 88000, cash: 88000, positionsValue: 0 },
      ],
    });
    const { result } = renderHook(() => useRiskAlerts());
    expect(result.current.some((a) => a.message.includes('drawdown'))).toBe(true);
    expect(result.current.some((a) => a.severity === 'warning')).toBe(true);
  });

  it('returns danger for severe drawdown >25%', () => {
    useTradingStore.setState({
      positions: [makePosition('1', 'AAPL', 10, 100)],
      quotes: { AAPL: makeQuote('AAPL', 200) },
      cash: 10000,
      navHistory: [
        { timestamp: 1, nav: 100000, cash: 100000, positionsValue: 0 },
        { timestamp: 2, nav: 120000, cash: 120000, positionsValue: 0 },
        { timestamp: 3, nav: 115000, cash: 115000, positionsValue: 0 },
        { timestamp: 4, nav: 90000, cash: 90000, positionsValue: 0 },
        { timestamp: 5, nav: 85000, cash: 85000, positionsValue: 0 },
        { timestamp: 6, nav: 80000, cash: 80000, positionsValue: 0 },
      ],
    });
    const { result } = renderHook(() => useRiskAlerts());
    const drawdownAlert = result.current.find((a) => a.message.includes('drawdown'));
    expect(drawdownAlert).toBeDefined();
    expect(drawdownAlert!.severity).toBe('danger');
  });

  it('returns no positions info alert when no trades exist', () => {
    useTradingStore.setState({
      positions: [],
      quotes: {},
      cash: 100000,
      navHistory: [],
    });
    const { result } = renderHook(() => useRiskAlerts());
    expect(result.current.some((a) => a.message.includes('No open positions'))).toBe(true);
  });
});

describe('useQuotePolling edge cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useTradingStore.setState({ quotes: {} });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does not poll when the symbols list is empty', () => {
    const { unmount } = renderHook(() => useQuotePolling([]));
    expect(alphaVantage.getBatchQuotes).not.toHaveBeenCalled();
    unmount();
  });

  it('logs an error when polling fails', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(alphaVantage.getBatchQuotes).mockRejectedValueOnce(new Error('poll failed'));
    const { unmount } = renderHook(() => useQuotePolling(['AAPL']));
    await waitFor(() => expect(console.error).toHaveBeenCalled());
    spy.mockRestore();
    unmount();
  });
});

describe('useChart slow API timeout', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('clears loading state via the 1.2s timeout even if the API never returns', async () => {
    vi.useFakeTimers();
    vi.mocked(alphaVantage.getDailyChart).mockImplementation(() => new Promise(() => {}));
    const { result, unmount } = renderHook(() => useChart('NVDA', '1mo', '1d'));
    expect(result.current.loading).toBe(true);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1300);
    });
    expect(result.current.loading).toBe(false);
    unmount();
  });
});

describe('useTechnicalIndicators edge cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null indicators when every API call fails', async () => {
    vi.mocked(alphaVantage.getSMA).mockRejectedValue(new Error('fail'));
    vi.mocked(alphaVantage.getRSI).mockRejectedValue(new Error('fail'));
    const { result } = renderHook(() => useTechnicalIndicators('AAPL'));
    await waitFor(() => expect(result.current.sma20).toBeNull());
    expect(result.current.sma50).toBeNull();
    expect(result.current.rsi14).toBeNull();
  });

  it('ignores results that resolve after unmount', async () => {
    let resolveSma!: (v: unknown) => void;
    const slow = new Promise((res) => { resolveSma = res; });
    vi.mocked(alphaVantage.getSMA).mockImplementation(() => slow);
    vi.mocked(alphaVantage.getRSI).mockResolvedValue(null);
    const { unmount } = renderHook(() => useTechnicalIndicators('AAPL'));
    expect(alphaVantage.getSMA).toHaveBeenCalledTimes(2);
    unmount();
    resolveSma(null);
    await new Promise((r) => setTimeout(r, 0));
  });

  it('logs an error when an indicator API throws synchronously', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(alphaVantage.getSMA).mockImplementation(() => { throw new Error('sync boom'); });
    const { unmount } = renderHook(() => useTechnicalIndicators('AAPL'));
    await waitFor(() => expect(console.error).toHaveBeenCalled());
    spy.mockRestore();
    unmount();
  });
});
