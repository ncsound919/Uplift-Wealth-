import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { alphaVantage, StockQuote, OHLCPoint } from '../lib/alphaVantageClient';
import { useTradingStore } from '../stores/tradingStore';
import { calculateBlackScholes } from '../utils/blackScholes';
import { RiskAnalytics } from '../utils/riskAnalytics';

export function useQuotePolling(symbols: string[], activePositions: boolean = false) {
  const updateQuotes = useTradingStore((s) => s.updateQuotes);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const symbolsKey = symbols.join(',');

  const poll = useCallback(async () => {
    const symbolList = symbolsKey ? symbolsKey.split(',') : [];
    if (symbolList.length === 0) return;
    setLoading(true);
    try {
      const quotes = await alphaVantage.getBatchQuotes(symbolList);
      updateQuotes(quotes);
    } catch (e) {
      console.error('[QuotePolling] Error:', e);
    } finally {
      setLoading(false);
    }
  }, [symbolsKey, updateQuotes]);

  useEffect(() => {
    poll();
    const interval = activePositions ? 8000 : 15000;
    intervalRef.current = setInterval(poll, interval);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [poll, activePositions]);

  useEffect(() => {
    const handleFocus = () => poll();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [poll]);

  return { loading, refresh: poll };
}

export function useChart(symbol: string, range: string, interval: string) {
  const [data, setData] = useState<OHLCPoint[]>(() => generateFallbackChart(symbol, range, interval));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    // Initial instant fallback so UI renders immediately without getting stuck
    setData(generateFallbackChart(symbol, range, interval));

    const timeoutId = setTimeout(() => {
      if (!cancelled) {
        setLoading(false);
      }
    }, 1200);

    (async () => {
      try {
        let points: OHLCPoint[] = [];
        if (interval === '1d') {
          points = await alphaVantage.getDailyChart(symbol, range === '1mo');
        } else {
          const avInterval = interval.replace('min', 'min') as '1min' | '5min' | '15min' | '30min' | '60min';
          points = await alphaVantage.getIntradayChart(symbol, avInterval);
        }
        if (!cancelled && points && points.length > 0) {
          setData(points);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load chart');
          setData(generateFallbackChart(symbol, range, interval));
        }
      } finally {
        if (!cancelled) {
          clearTimeout(timeoutId);
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [symbol, range, interval]);

  return { data, loading, error };
}

export function useOptionChain(symbol: string, spotPrice: number, expiryDays: number, strikeCount: number) {
  return useMemo(() => {
    const spot = spotPrice || 100;
    const strikeInterval = spot > 300 ? 10 : spot > 100 ? 5 : spot > 30 ? 2.5 : 1;
    const centeredStrike = Math.round(spot / strikeInterval) * strikeInterval;
    const strikes: number[] = [];

    for (let i = -Math.floor(strikeCount / 2); i <= Math.floor(strikeCount / 2); i++) {
      strikes.push(centeredStrike + i * strikeInterval);
    }

    const tDays = expiryDays;
    const r = 0.05;

    const ivMap: Record<string, number> = {
      TSLA: 0.55, NVDA: 0.45, COIN: 0.70, AMD: 0.42,
      BND: 0.15, SPY: 0.15, QQQ: 0.18, AAPL: 0.28,
      MSFT: 0.25, NFLX: 0.40, AMZN: 0.35,
    };
    const baseVol = ivMap[symbol] ?? 0.30;

    return strikes.map((strike) => {
      const distFromATM = (strike - spot) / spot;
      const iv = baseVol + Math.pow(distFromATM, 2) * 0.45;
      const callGreeks = calculateBlackScholes(spot, strike, tDays, iv, r, true);
      const putGreeks = calculateBlackScholes(spot, strike, tDays, iv, r, false);

      return {
        strike,
        iv: Number((iv * 100).toFixed(1)),
        call: {
          premium: callGreeks.price,
          bid: Math.max(0.01, callGreeks.price - 0.05),
          ask: callGreeks.price + 0.05,
          delta: callGreeks.delta,
          gamma: callGreeks.gamma,
          theta: callGreeks.theta,
          vega: callGreeks.vega,
        },
        put: {
          premium: putGreeks.price,
          bid: Math.max(0.01, putGreeks.price - 0.05),
          ask: putGreeks.price + 0.05,
          delta: putGreeks.delta,
          gamma: putGreeks.gamma,
          theta: putGreeks.theta,
          vega: putGreeks.vega,
        },
      };
    });
  }, [symbol, spotPrice, expiryDays, strikeCount]);
}

export function useTechnicalIndicators(symbol: string) {
  const [indicators, setIndicators] = useState<{
    sma20: number | null;
    sma50: number | null;
    rsi14: number | null;
  }>({ sma20: null, sma50: null, rsi14: null });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [sma20Data, sma50Data, rsiData] = await Promise.all([
          alphaVantage.getSMA(symbol, 'daily', 20, 'close').catch(() => null),
          alphaVantage.getSMA(symbol, 'daily', 50, 'close').catch(() => null),
          alphaVantage.getRSI(symbol, 'daily', 14, 'close').catch(() => null),
        ]);

        if (cancelled) return;

        const sma20 = sma20Data?.['Technical Analysis: SMA'];
        const sma50 = sma50Data?.['Technical Analysis: SMA'];
        const rsi = rsiData?.['Technical Analysis: RSI'];

        const latestSma20 = sma20 ? parseFloat(Object.values(sma20)[0] as any) : null;
        const latestSma50 = sma50 ? parseFloat(Object.values(sma50)[0] as any) : null;
        const latestRsi = rsi ? parseFloat(Object.values(rsi)[0] as any) : null;

        if (!cancelled) {
          setIndicators({
            sma20: latestSma20,
            sma50: latestSma50,
            rsi14: latestRsi,
          });
        }
      } catch (e) {
        console.error('[TechIndicators] Error:', e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [symbol]);

  return indicators;
}

export function useTradeJournal() {
  const closedTrades = useTradingStore((s) => s.closedTrades);
  const navHistory = useTradingStore((s) => s.navHistory);

  return useMemo(() => {
    const totalTrades = closedTrades.length;
    const wins = closedTrades.filter((t) => t.pnl > 0);
    const losses = closedTrades.filter((t) => t.pnl < 0);
    const winRate = totalTrades > 0 ? (wins.length / totalTrades) * 100 : 0;
    const avgWin = wins.length > 0 ? wins.reduce((s, t) => s + t.pnl, 0) / wins.length : 0;
    const avgLoss = losses.length > 0 ? losses.reduce((s, t) => s + t.pnl, 0) / losses.length : 0;
    const profitFactor = avgLoss !== 0 ? Math.abs((avgWin * wins.length) / (avgLoss * losses.length)) : 0;
    const largestWin = wins.length > 0 ? Math.max(...wins.map((t) => t.pnl)) : 0;
    const largestLoss = losses.length > 0 ? Math.min(...losses.map((t) => t.pnl)) : 0;
    const avgHoldingPeriod =
      closedTrades.length > 0
        ? closedTrades.reduce((s, t) => s + t.holdingPeriodHours, 0) / closedTrades.length
        : 0;
    const totalPnl = closedTrades.reduce((s, t) => s + t.pnl, 0);

    let currentStreak = 0;
    let maxWinStreak = 0;
    let maxLossStreak = 0;
    let currentType: 'win' | 'loss' | null = null;
    for (let i = closedTrades.length - 1; i >= 0; i--) {
      const isWin = closedTrades[i].pnl > 0;
      if (currentType === null) {
        currentType = isWin ? 'win' : 'loss';
        currentStreak = 1;
      } else if ((isWin && currentType === 'win') || (!isWin && currentType === 'loss')) {
        currentStreak++;
      } else {
        if (currentType === 'win') maxWinStreak = Math.max(maxWinStreak, currentStreak);
        else maxLossStreak = Math.max(maxLossStreak, currentStreak);
        currentType = isWin ? 'win' : 'loss';
        currentStreak = 1;
      }
    }
    if (currentType === 'win') maxWinStreak = Math.max(maxWinStreak, currentStreak);
    if (currentType === 'loss') maxLossStreak = Math.max(maxLossStreak, currentStreak);

    const bySymbol: Record<string, { pnl: number; trades: number; winRate: number }> = {};
    closedTrades.forEach((t) => {
      if (!bySymbol[t.symbol]) bySymbol[t.symbol] = { pnl: 0, trades: 0, winRate: 0 };
      bySymbol[t.symbol].pnl += t.pnl;
      bySymbol[t.symbol].trades++;
    });
    Object.keys(bySymbol).forEach((sym) => {
      const symTrades = closedTrades.filter((t) => t.symbol === sym);
      bySymbol[sym].winRate = symTrades.length > 0 ? (symTrades.filter((t) => t.pnl > 0).length / symTrades.length) * 100 : 0;
    });

    return {
      totalTrades,
      winRate,
      avgWin,
      avgLoss,
      profitFactor,
      largestWin,
      largestLoss,
      avgHoldingPeriod,
      totalPnl,
      currentStreak,
      maxWinStreak,
      maxLossStreak,
      bySymbol,
      bestSymbol: Object.entries(bySymbol).sort(([, a], [, b]) => b.pnl - a.pnl)[0]?.[0] || null,
      worstSymbol: Object.entries(bySymbol).sort(([, a], [, b]) => a.pnl - b.pnl)[0]?.[0] || null,
    };
  }, [closedTrades, navHistory]);
}

export function useRiskAlerts() {
  const positions = useTradingStore((s) => s.positions);
  const quotes = useTradingStore((s) => s.quotes);
  const cash = useTradingStore((s) => s.cash);
  const navHistory = useTradingStore((s) => s.navHistory);

  const metrics = useMemo(() => {
    let positionsValue = 0;
    const items = positions.map((pos) => {
      const price = quotes[pos.symbol]?.regularMarketPrice || pos.entryPrice;
      let marketVal = 0;
      if (pos.type === 'STOCK') {
        marketVal = pos.qty * price;
      } else {
        const r = 0.05;
        const baseVol = 0.30;
        const distFromATM = ((pos.strike || price) - price) / price;
        const iv = baseVol + Math.pow(distFromATM, 2) * 0.45;
        const premium = calculateBlackScholes(price, pos.strike || price, 30, iv, r, pos.type === 'CALL').price;
        marketVal = pos.qty * premium * 100;
      }
      positionsValue += marketVal;
      return { symbol: pos.symbol, marketVal, pctOfPortfolio: 0 };
    });
    const totalNav = cash + positionsValue;
    items.forEach((item) => {
      item.pctOfPortfolio = totalNav > 0 ? (item.marketVal / totalNav) * 100 : 0;
    });
    return { items, totalNav, cash, navHistory };
  }, [positions, quotes, cash, navHistory]);

  return useMemo(() => {
    const alerts: { severity: 'info' | 'warning' | 'danger'; message: string }[] = [];

    const largest = Math.max(...metrics.items.map((i) => i.pctOfPortfolio), 0);
    if (largest > 30) {
      alerts.push({
        severity: largest > 50 ? 'danger' : 'warning',
        message: `Largest position is ${largest.toFixed(1)}% of portfolio. Consider reducing concentration risk.`,
      });
    }

    const cashPct = metrics.totalNav > 0 ? (metrics.cash / metrics.totalNav) * 100 : 100;
    if (cashPct < 5 && metrics.items.length > 0) {
      alerts.push({
        severity: 'warning',
        message: `Only ${cashPct.toFixed(1)}% cash remaining. Limited capacity for new trades or hedging.`,
      });
    } else if (cashPct > 90 && metrics.items.length === 0) {
      alerts.push({
        severity: 'info',
        message: 'Portfolio is fully in cash. Start building positions to put capital to work.',
      });
    }

    if (metrics.navHistory.length > 5) {
      const maxDD = RiskAnalytics.maxDrawdown(metrics.navHistory);
      if (maxDD !== null && maxDD > 15) {
        alerts.push({
          severity: maxDD > 25 ? 'danger' : 'warning',
          message: `Max drawdown is ${maxDD.toFixed(1)}%. Portfolio has experienced significant volatility.`,
        });
      }
    }

    if (metrics.items.length === 0) {
      alerts.push({
        severity: 'info',
        message: 'No open positions. Use the Trade tab to start building your portfolio.',
      });
    }

    return alerts;
  }, [metrics]);
}

export function generateFallbackChart(symbol: string, range: string = '1mo', interval: string = '1d'): OHLCPoint[] {
  const basePrices: Record<string, number> = {
    NVDA: 128.50, TSLA: 220.40, AAPL: 225.10, MSFT: 440.80, AMZN: 186.20,
    SPY: 550.30, QQQ: 480.90, COIN: 215.60, AMD: 155.40, BND: 72.80
  };
  const baseVal = basePrices[symbol] || 150;
  const numPoints = range === '1d' ? 39 : range === '3mo' ? 65 : range === '1y' ? 120 : 30;
  const formatted: OHLCPoint[] = [];
  let currentVal = baseVal * (range === '1y' ? 0.75 : range === '3mo' ? 0.88 : 0.95);

  const now = new Date();
  for (let i = numPoints - 1; i >= 0; i--) {
    let dateStr = '';
    if (interval !== '1d' || range === '1d') {
      const d = new Date(now.getTime() - i * 10 * 60000);
      dateStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else {
      const d = new Date(now.getTime() - i * 86400000);
      dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    const volatility = ['TSLA', 'NVDA', 'COIN', 'AMD'].includes(symbol) ? 0.035 : 0.015;
    const change = (Math.random() - 0.47) * (baseVal * volatility);
    const open = Number(currentVal.toFixed(2));
    const close = Number(Math.max(1, currentVal + change).toFixed(2));
    const high = Number((Math.max(open, close) + Math.random() * (baseVal * (volatility * 0.5))).toFixed(2));
    const low = Number((Math.max(0.5, Math.min(open, close) - Math.random() * (baseVal * (volatility * 0.5)))).toFixed(2));
    const volume = Math.floor(200000 + Math.random() * 8000000);

    formatted.push({ date: dateStr, open, high, low, close, volume });
    currentVal = close;
  }
  return formatted;
}
