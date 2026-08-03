import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { calculateBlackScholes, Greeks } from '../utils/blackScholes';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Briefcase,
  BookOpen,
  Trophy,
  Search,
  DollarSign,
  Plus,
  Trash2,
  ChevronDown,
  Info,
  Clock,
  Play,
  ArrowRight,
  Calculator,
  RefreshCw,
  Eye,
  Check,
  CheckCircle,
  AlertTriangle,
  Award,
  BookMarked,
  ShieldAlert,
  BarChart2,
  PieChart,
  Zap,
  Sliders
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
  ComposedChart,
  Bar
} from 'recharts';
import confetti from 'canvas-confetti';
import { useTradingStore, usePortfolioMetrics } from '../stores/tradingStore';
import {
  useQuotePolling,
  useChart,
  useOptionChain,
  useTechnicalIndicators,
  useTradeJournal,
  useRiskAlerts
} from '../hooks/tradingHooks';
import { RiskAnalytics } from '../utils/riskAnalytics';
import { WatchlistPanel, MarketDataBadge, useMarketDataStatus } from './WatchlistPanel';

interface TradingGameProps {
  onComplete: () => void;
}

export function TradingGame({ onComplete }: TradingGameProps) {
  // Store state & actions
  const cash = useTradingStore((s) => s.cash);
  const positions = useTradingStore((s) => s.positions);
  const orders = useTradingStore((s) => s.orders);
  const watchlist = useTradingStore((s) => s.watchlist);
  const activeSymbol = useTradingStore((s) => s.activeSymbol);
  const quotes = useTradingStore((s) => s.quotes);
  const badges = useTradingStore((s) => s.badges);
  const logMessages = useTradingStore((s) => s.logMessages);
  const closedTrades = useTradingStore((s) => s.closedTrades);
  const simulatedDaysAdvanced = useTradingStore((s) => s.simulatedDaysAdvanced);
  const simulatedEvent = useTradingStore((s) => s.simulatedEvent);

  const buyStock = useTradingStore((s) => s.buyStock);
  const sellStock = useTradingStore((s) => s.sellStock);
  const buyOption = useTradingStore((s) => s.buyOption);
  const sellOption = useTradingStore((s) => s.sellOption);
  const closePosition = useTradingStore((s) => s.closePosition);
  const addSymbol = useTradingStore((s) => s.addSymbol);
  const removeSymbol = useTradingStore((s) => s.removeSymbol);
  const setActiveSymbol = useTradingStore((s) => s.setActiveSymbol);
  const recordNavSnapshot = useTradingStore((s) => s.recordNavSnapshot);
  const triggerMarketEvent = useTradingStore((s) => s.triggerMarketEvent);
  const fastForwardDays = useTradingStore((s) => s.fastForwardDays);
  const executeStrategy = useTradingStore((s) => s.executeStrategy);
  const resetStore = useTradingStore((s) => s.reset);

  // Computed metrics & hook data
  const metrics = usePortfolioMetrics();
  const marketDataStatus = useMarketDataStatus();
  const journal = useTradeJournal();
  const riskAlerts = useRiskAlerts();

  // Quote Polling
  const { loading: loadingQuotes, refresh: refreshQuotes } = useQuotePolling(watchlist, positions.length > 0);

  // Local UI State
  const [searchSymbol, setSearchSymbol] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'Chart' | 'Trade' | 'Analyze' | 'Scan' | 'Learn'>('Chart');
  const [chartRange, setChartRange] = useState<string>('1mo');
  const [chartInterval, setChartInterval] = useState<string>('1d');
  const [chartType, setChartType] = useState<'candle' | 'line'>('candle');

  // Chart Data Hook
  const { data: chartData, loading: loadingChart } = useChart(activeSymbol, chartRange, chartInterval);

  // Tech Indicators
  const techIndicators = useTechnicalIndicators(activeSymbol);

  // Current active quote
  const activeQuote = quotes[activeSymbol] || {
    symbol: activeSymbol,
    regularMarketPrice: 150,
    regularMarketChange: 0,
    regularMarketChangePercent: 0,
  };
  const currentSpotPrice = activeQuote.regularMarketPrice;

  // Options Chains States
  const [selectedExpiry, setSelectedExpiry] = useState<string>('30d');
  const [strikeRangeCount, setStrikeRangeCount] = useState<number>(8);
  const optionChain = useOptionChain(activeSymbol, currentSpotPrice, 30, strikeRangeCount);

  // Order Ticket State
  const [orderAssetType, setOrderAssetType] = useState<'STOCK' | 'OPTION' | 'STRATEGY'>('STOCK');
  const [stockOrderSide, setStockOrderSide] = useState<'BUY' | 'SELL'>('BUY');
  const [stockQty, setStockQty] = useState<string>('10');
  const [stockOrderType, setStockOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [stockLimitPrice, setStockLimitPrice] = useState<string>('');

  const [optionOrderSide, setOptionOrderSide] = useState<'BUY' | 'SELL'>('BUY');
  const [optionQty, setOptionQty] = useState<string>('1');
  const [optionType, setOptionType] = useState<'CALL' | 'PUT'>('CALL');
  const [selectedStrike, setSelectedStrike] = useState<number>(Math.round(currentSpotPrice / 5) * 5);
  const [optionPremiumOverride, setOptionPremiumOverride] = useState<string>('');

  const [selectedStrategy, setSelectedStrategy] = useState<'covered_call' | 'protective_put' | 'bull_call_spread' | 'bear_put_spread' | 'long_straddle'>('covered_call');
  const [strategyQty, setStrategyQty] = useState<string>('1');

  const handleExecuteStrategy = () => {
    const qtyNum = parseInt(strategyQty) || 0;
    if (qtyNum <= 0) return;
    const success = executeStrategy(selectedStrategy, activeSymbol, currentSpotPrice, qtyNum);
    if (success) {
      confetti({ particleCount: 40, spread: 70 });
    }
  };

  // Record NAV snapshot periodically
  useEffect(() => {
    recordNavSnapshot();
    const interval = setInterval(() => {
      recordNavSnapshot();
    }, 15000);
    return () => clearInterval(interval);
  }, [recordNavSnapshot]);

  // Handle Search symbol submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchSymbol) return;
    addSymbol(searchSymbol);
    setSearchSymbol('');
  };

  // Stock Order Execution
  const handleExecuteStockOrder = () => {
    const qtyNum = parseInt(stockQty) || 0;
    if (qtyNum <= 0) return;
    const priceToUse = stockOrderType === 'LIMIT' && stockLimitPrice ? parseFloat(stockLimitPrice) : currentSpotPrice;

    if (stockOrderSide === 'BUY') {
      const success = buyStock(activeSymbol, qtyNum, priceToUse, stockOrderType);
      if (success) {
        confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
      }
    } else {
      sellStock(activeSymbol, qtyNum, priceToUse);
    }
  };

  // Option Order Execution
  const handleExecuteOptionOrder = () => {
    const qtyNum = parseInt(optionQty) || 0;
    if (qtyNum <= 0) return;

    const matchedStrike = optionChain.find((s) => s.strike === selectedStrike);
    const calculatedPremium = optionType === 'CALL' ? matchedStrike?.call.premium : matchedStrike?.put.premium;
    const premiumToUse = optionPremiumOverride ? parseFloat(optionPremiumOverride) : calculatedPremium || 5.0;

    if (optionOrderSide === 'BUY') {
      const success = buyOption(activeSymbol, optionType, selectedStrike, selectedExpiry, premiumToUse, qtyNum);
      if (success) {
        confetti({ particleCount: 40, spread: 70, origin: { y: 0.8 } });
      }
    } else {
      /* v8 ignore next -- @preserve order side is initialized to BUY and never changed */
      sellOption(activeSymbol, optionType, selectedStrike, selectedExpiry, premiumToUse, qtyNum);
    }
  };

  const riskGrade = RiskAnalytics.riskGrade(metrics.risk);

  return (
    <div className="flex flex-col h-full bg-[#080b10] text-slate-100 font-sans selection:bg-blue-500 selection:text-white overflow-hidden rounded-2xl border border-slate-850 shadow-2xl">
      
      {/* TERMINAL TOP HEADER */}
      <div className="bg-[#0d1117] border-b border-slate-850 px-4 py-2 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-mono font-black">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-sm tracking-tight text-white">QUANTITATIVE STOCK & OPTIONS SIM</span>
              <MarketDataBadge status={marketDataStatus} />
              {simulatedDaysAdvanced > 0 && (
                <span className="text-xs bg-purple-500/10 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded font-mono font-bold">
                  +{simulatedDaysAdvanced} Days Sim Time
                </span>
              )}
            </div>
            <span className="text-xs text-slate-400 font-mono">Paper Capital: ${cash.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        {/* Real-World Simulation Driver Toolbar */}
        <div className="flex items-center gap-2 font-mono text-xs">
          {/* Fast Forward Buttons */}
          <div className="flex items-center gap-1 bg-[#141922] p-1 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 px-1 font-bold">FAST-FORWARD:</span>
            <button
              onClick={() => fastForwardDays(1)}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-blue-300 font-bold text-xs cursor-pointer"
              title="Advance 1 Trading Day & update Theta decay"
            >
              +1D
            </button>
            <button
              onClick={() => fastForwardDays(7)}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-blue-300 font-bold text-xs cursor-pointer"
              title="Advance 1 Week & update Theta decay"
            >
              +7D
            </button>
            <button
              onClick={() => fastForwardDays(30)}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-purple-300 font-bold text-xs cursor-pointer"
              title="Advance 30 Days (Options Expiry)"
            >
              +30D
            </button>
          </div>

          {/* Market Catalyst Generator */}
          <div className="hidden xl:flex items-center gap-1 bg-[#141922] p-1 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 px-1 font-bold">CATALYSTS:</span>
            <button
              onClick={() => triggerMarketEvent('earnings')}
              className="px-2 py-0.5 rounded bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 text-xs font-bold cursor-pointer"
              title="Surge stock +8.2% on record earnings beat"
            >
              🚀 Earnings Beat
            </button>
            <button
              onClick={() => triggerMarketEvent('rate_hike')}
              className="px-2 py-0.5 rounded bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 text-xs font-bold cursor-pointer"
              title="Broader market shock -4.8% on Fed rate hike"
            >
              📉 Fed Shock
            </button>
            <button
              onClick={() => triggerMarketEvent('squeeze')}
              className="px-2 py-0.5 rounded bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 text-xs font-bold cursor-pointer"
              title="Unusual option activity triggers +16.5% short squeeze"
            >
              ⚡ Short Squeeze
            </button>
            <button
              onClick={() => triggerMarketEvent('crash')}
              className="px-2 py-0.5 rounded bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 text-xs font-bold cursor-pointer"
              title="Flash crash -12.0% liquidity crunch"
            >
              🐻 Flash Crash
            </button>
          </div>

          <button
            onClick={refreshQuotes}
            className="p-1.5 rounded-lg bg-[#161b22] hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
            title="Refresh Market Quotes"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingQuotes ? 'animate-spin text-blue-400' : ''}`} />
          </button>
          <button
            onClick={resetStore}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 text-xs font-mono font-bold border border-slate-800 transition-colors cursor-pointer"
          >
            Reset
          </button>
          <WatchlistPanel />
          <button
            onClick={onComplete}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm"
          >
            Complete Session
          </button>
        </div>
      </div>

      {/* Breaking Event News Banner */}
      {simulatedEvent && (
        <div className="bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-slate-900 px-4 py-1.5 border-b border-blue-500/30 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-blue-300 font-bold truncate">
            <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
            <span className="text-white">BREAKING CATALYST:</span>
            <span className="text-blue-200">{simulatedEvent}</span>
          </div>
          <span className="text-xs text-slate-400 shrink-0 ml-2">Market volatility updated</span>
        </div>
      )}

      {/* MAIN VIEW AREA */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">

        {/* LEFT SIDEBAR: WATCHLIST & QUOTES (3 Cols) */}
        <div className="lg:col-span-3 bg-[#0a0d14] border-r border-slate-850 flex flex-col h-full overflow-hidden">
          
          {/* Symbol Search Form */}
          <form onSubmit={handleSearchSubmit} className="p-3 border-b border-slate-850">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchSymbol}
                onChange={(e) => setSearchSymbol(e.target.value.toUpperCase())}
                placeholder="Add Symbol (e.g. NVDA)..."
                className="w-full bg-[#11151f] border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </form>

          {/* Watchlist Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-850/60 font-mono">
            {watchlist.map((sym) => {
              const q = quotes[sym] || {
                symbol: sym,
                regularMarketPrice: 150,
                regularMarketChangePercent: 0,
                regularMarketChange: 0,
              };
              const isPositive = q.regularMarketChangePercent >= 0;
              const isActive = activeSymbol === sym;

              return (
                <div
                  key={sym}
                  onClick={() => setActiveSymbol(sym)}
                  className={`p-3 flex items-center justify-between cursor-pointer transition-colors group ${
                    isActive ? 'bg-[#141923] border-l-2 border-blue-500' : 'hover:bg-[#11151e]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSymbol(sym);
                      }}
                      className="text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label={`Remove ${sym} from watchlist`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <div>
                      <span className="font-bold text-white text-xs block">{sym}</span>
                      <span className="text-xs text-slate-500">Equity</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-200 block">
                      ${q.regularMarketPrice.toFixed(2)}
                    </span>
                    <span className={`text-xs font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isPositive ? '+' : ''}{q.regularMarketChangePercent.toFixed(2)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Portfolio Summary Box in Sidebar */}
          <div className="p-3 bg-[#0d1117] border-t border-slate-850 space-y-2 font-mono text-xs">
            <div className="flex justify-between text-slate-400">
              <span>NET ASSET VALUE</span>
              <span className="font-bold text-white">${metrics.totalNav.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>UNREALIZED P&L</span>
              <span className={`font-bold ${metrics.unrealizedPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {metrics.unrealizedPnl >= 0 ? '+' : ''}${metrics.unrealizedPnl.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>RISK RATING</span>
              <span className={`font-black ${riskGrade.color}`}>{riskGrade.grade} ({riskGrade.label})</span>
            </div>
          </div>
        </div>

        {/* CENTER CONTENT: CHARTS, TRADING, RISK ANALYTICS (6 Cols) */}
        <div className="lg:col-span-6 flex flex-col h-full bg-[#080b10] border-r border-slate-850 overflow-hidden">
          
          {/* Active Symbol Banner & Navigation Tabs */}
          <div className="p-4 bg-[#0c1017] border-b border-slate-850 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4 font-mono">
              <div>
                <span className="text-xl font-black text-white">{activeSymbol}</span>
                <span className="text-xs text-slate-400 ml-2">${currentSpotPrice.toFixed(2)}</span>
              </div>
              <div className={`text-xs font-bold ${activeQuote.regularMarketChangePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {activeQuote.regularMarketChangePercent >= 0 ? '+' : ''}{activeQuote.regularMarketChangePercent.toFixed(2)}%
              </div>
            </div>

            {/* Tab Selectors */}
            <div className="flex items-center gap-1 bg-[#141922] p-1 rounded-xl border border-slate-800">
              {(['Chart', 'Trade', 'Analyze', 'Scan', 'Learn'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    activeTab === tab
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* TAB 1: CHART VIEW */}
          {activeTab === 'Chart' && (
            <div className="flex-1 flex flex-col p-4 overflow-y-auto space-y-4">
              
              {/* Chart Controls */}
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  {['1d', '1mo', '3mo', '1y'].map((r) => (
                    <button
                      key={r}
                      onClick={() => setChartRange(r)}
                      className={`px-2.5 py-1 rounded-md border text-xs ${
                        chartRange === r ? 'bg-slate-800 text-blue-400 border-blue-500' : 'bg-[#11151f] text-slate-400 border-slate-800'
                      }`}
                    >
                      {r.toUpperCase()}
                    </button>
                  ))}
                </div>

                {/* Indicators Pill */}
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  {techIndicators.sma20 && <span>SMA20: <strong className="text-amber-400">${techIndicators.sma20.toFixed(2)}</strong></span>}
                  {techIndicators.rsi14 && <span>RSI14: <strong className="text-purple-400">{techIndicators.rsi14.toFixed(1)}</strong></span>}
                </div>
              </div>

              {/* Main Recharts Container */}
              <div className="h-[280px] w-full bg-[#0c1017] rounded-xl p-3 border border-slate-850 relative">
                {loadingChart ? (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-500 font-mono text-xs">
                    Loading OHLC data...
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1a2130" />
                      <XAxis dataKey="date" stroke="#475569" tick={{ fontSize: 10 }} />
                      <YAxis domain={['auto', 'auto']} stroke="#475569" tick={{ fontSize: 10 }} orientation="right" />
                      <Tooltip contentStyle={{ backgroundColor: '#0d1117', borderColor: '#1e293b', fontSize: '11px', color: '#f8fafc' }} />
                      <Line type="monotone" dataKey="close" stroke="#3b82f6" strokeWidth={2} dot={false} />
                      <Bar dataKey="volume" yAxisId="right" fill="#1e293b" opacity={0.5} />
                    </ComposedChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Technical Summary Bar */}
              <div className="grid grid-cols-3 gap-3 font-mono text-xs">
                <div className="bg-[#0c1017] p-3 rounded-xl border border-slate-850">
                  <span className="text-xs text-slate-500 block">VOLATILITY (ANNUAL)</span>
                  <span className="font-bold text-slate-200">
                    {metrics.risk.volatility ? `${metrics.risk.volatility.toFixed(1)}%` : 'N/A'}
                  </span>
                </div>
                <div className="bg-[#0c1017] p-3 rounded-xl border border-slate-850">
                  <span className="text-xs text-slate-500 block">MAX DRAWDOWN</span>
                  <span className="font-bold text-rose-400">
                    {metrics.risk.maxDrawdown ? `${metrics.risk.maxDrawdown.toFixed(1)}%` : '0.0%'}
                  </span>
                </div>
                <div className="bg-[#0c1017] p-3 rounded-xl border border-slate-850">
                  <span className="text-xs text-slate-500 block">SHARPE RATIO</span>
                  <span className="font-bold text-emerald-400">
                    {metrics.risk.sharpeRatio ? metrics.risk.sharpeRatio.toFixed(2) : 'N/A'}
                  </span>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: OPTIONS CHAIN / TRADING VIEW */}
          {activeTab === 'Trade' && (
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between border-b border-slate-850 pb-3 font-mono text-xs">
                <span className="font-bold text-slate-300">Option Chain - {activeSymbol} ($30 Days DTE)</span>
                <span className="text-slate-500">Spot: ${currentSpotPrice.toFixed(2)}</span>
              </div>

              {/* Option Chain Table */}
              <div className="overflow-x-auto border border-slate-850 rounded-xl bg-[#0c1017]">
                <table className="w-full text-left font-mono text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#141922] text-slate-500 border-b border-slate-850">
                      <th className="p-2 text-center text-emerald-400">CALL BID/ASK</th>
                      <th className="p-2 text-center text-emerald-400">DELTA</th>
                      <th className="p-2 text-center text-slate-300 font-bold">STRIKE</th>
                      <th className="p-2 text-center text-rose-400">DELTA</th>
                      <th className="p-2 text-center text-rose-400">PUT BID/ASK</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850/60 text-slate-300">
                    {optionChain.map((row) => {
                      const isATM = Math.abs(row.strike - currentSpotPrice) < 5;
                      return (
                        <tr
                          key={row.strike}
                          className={`hover:bg-slate-900/60 cursor-pointer ${isATM ? 'bg-blue-950/20 font-bold' : ''}`}
                          onClick={() => {
                            setSelectedStrike(row.strike);
                            setOrderAssetType('OPTION');
                          }}
                        >
                          <td className="p-2 text-center text-emerald-400">
                            ${row.call.bid.toFixed(2)} / ${row.call.ask.toFixed(2)}
                          </td>
                          <td className="p-2 text-center text-slate-400">{row.call.delta.toFixed(2)}</td>
                          <td className="p-2 text-center font-bold text-white bg-slate-900/40">${row.strike}</td>
                          <td className="p-2 text-center text-slate-400">{row.put.delta.toFixed(2)}</td>
                          <td className="p-2 text-center text-rose-400">
                            ${row.put.bid.toFixed(2)} / ${row.put.ask.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: RISK ANALYTICS */}
          {activeTab === 'Analyze' && (
            <div className="flex-1 p-4 overflow-y-auto space-y-4 font-mono text-xs">
              <h3 className="font-bold text-sm text-white">Portfolio Risk & Performance Dashboard</h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#0c1017] p-4 rounded-xl border border-slate-850 space-y-1">
                  <span className="text-xs text-slate-500 uppercase">Sortino Ratio</span>
                  <p className="text-lg font-bold text-emerald-400">
                    {metrics.risk.sortinoRatio ? metrics.risk.sortinoRatio.toFixed(2) : 'N/A'}
                  </p>
                </div>

                <div className="bg-[#0c1017] p-4 rounded-xl border border-slate-850 space-y-1">
                  <span className="text-xs text-slate-500 uppercase">Value at Risk (95% VaR)</span>
                  <p className="text-lg font-bold text-rose-400">
                    {metrics.risk.valueAtRisk95 ? `$${metrics.risk.valueAtRisk95.toFixed(2)}` : 'N/A'}
                  </p>
                </div>

                <div className="bg-[#0c1017] p-4 rounded-xl border border-slate-850 space-y-1">
                  <span className="text-xs text-slate-500 uppercase">Win Rate</span>
                  <p className="text-lg font-bold text-blue-400">{journal.winRate.toFixed(1)}%</p>
                </div>

                <div className="bg-[#0c1017] p-4 rounded-xl border border-slate-850 space-y-1">
                  <span className="text-xs text-slate-500 uppercase">Profit Factor</span>
                  <p className="text-lg font-bold text-amber-400">{journal.profitFactor.toFixed(2)}</p>
                </div>
              </div>

              {/* Trade History Ledger */}
              <div className="border border-slate-850 rounded-xl bg-[#0c1017] p-3 space-y-2">
                <span className="font-bold text-slate-300 block">Closed Trade History ({journal.totalTrades})</span>
                <div className="max-h-[160px] overflow-y-auto space-y-1">
                  {closedTrades.map((t) => (
                    <div key={t.id} className="flex justify-between items-center text-xs p-2 rounded bg-[#11151f]">
                      <span>{t.symbol} ({t.type}) x{t.qty}</span>
                      <span className={t.pnl >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {t.pnl >= 0 ? '+' : ''}${t.pnl.toFixed(2)} ({t.pnlPct.toFixed(1)}%)
                      </span>
                    </div>
                  ))}
                  {journal.totalTrades === 0 && (
                    <span className="text-slate-600 text-xs italic">No closed trades recorded yet.</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SCANNER & TAB 5: LEARN */}
          {(activeTab === 'Scan' || activeTab === 'Learn') && (
            <div className="flex-1 p-6 text-center text-slate-400 font-mono text-xs flex flex-col items-center justify-center space-y-3">
              <Sliders className="w-8 h-8 text-blue-400 animate-pulse" />
              <p className="font-bold text-white text-sm">FinTech Quantitative Scanner & Educational Modules</p>
              <p className="max-w-md text-slate-500">
                Use the Chart and Trade tabs to practice paper options trading and equity portfolio management.
              </p>
            </div>
          )}

        </div>

        {/* RIGHT SIDEBAR: ORDER TICKET (3 Cols) */}
        <div className="lg:col-span-3 bg-[#0a0d14] p-4 flex flex-col justify-between font-mono text-xs">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-850 pb-2">
              <span className="font-bold text-white uppercase tracking-wider text-xs">Order Ticket</span>
              <span className="text-xs text-slate-500">{activeSymbol}</span>
            </div>

            {/* Asset Switcher */}
            <div className="grid grid-cols-3 gap-1 bg-[#11151f] p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setOrderAssetType('STOCK')}
                className={`py-1 rounded-lg font-bold text-xs ${
                  orderAssetType === 'STOCK' ? 'bg-blue-600 text-white' : 'text-slate-400'
                }`}
              >
                EQUITY
              </button>
              <button
                onClick={() => setOrderAssetType('OPTION')}
                className={`py-1 rounded-lg font-bold text-xs ${
                  orderAssetType === 'OPTION' ? 'bg-purple-600 text-white' : 'text-slate-400'
                }`}
              >
                SINGLE OPTION
              </button>
              <button
                onClick={() => setOrderAssetType('STRATEGY')}
                className={`py-1 rounded-lg font-bold text-xs ${
                  orderAssetType === 'STRATEGY' ? 'bg-amber-600 text-white' : 'text-slate-400'
                }`}
              >
                QUANT STRAT
              </button>
            </div>

            {/* STOCK ORDER TICKET */}
            {orderAssetType === 'STOCK' ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setStockOrderSide('BUY')}
                    className={`py-2 rounded-xl font-bold ${
                      stockOrderSide === 'BUY' ? 'bg-emerald-600 text-white' : 'bg-[#11151f] text-slate-400'
                    }`}
                  >
                    BUY
                  </button>
                  <button
                    onClick={() => setStockOrderSide('SELL')}
                    className={`py-2 rounded-xl font-bold ${
                      stockOrderSide === 'SELL' ? 'bg-rose-600 text-white' : 'bg-[#11151f] text-slate-400'
                    }`}
                  >
                    SELL
                  </button>
                </div>

                <div className="space-y-1">
                  <label htmlFor="stock-qty" className="text-xs text-slate-500 uppercase">Shares Quantity</label>
                  <input
                    id="stock-qty"
                    type="number"
                    value={stockQty}
                    onChange={(e) => setStockQty(e.target.value)}
                    className="w-full bg-[#11151f] border border-slate-800 rounded-lg p-2 text-white font-bold"
                  />
                </div>

                <div className="p-3 bg-[#0d1117] rounded-xl border border-slate-850 space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>Est. Total</span>
                    <span className="font-bold text-white">
                      ${((parseInt(stockQty) || 0) * currentSpotPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleExecuteStockOrder}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-white uppercase tracking-wider transition-all cursor-pointer shadow-lg"
                >
                  Submit Stock Order
                </button>
              </div>
            ) : orderAssetType === 'OPTION' ? (
              /* OPTION ORDER TICKET */
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setOptionType('CALL')}
                    className={`py-1.5 rounded-xl font-bold ${
                      optionType === 'CALL' ? 'bg-emerald-600 text-white' : 'bg-[#11151f] text-slate-400'
                    }`}
                  >
                    CALL
                  </button>
                  <button
                    onClick={() => setOptionType('PUT')}
                    className={`py-1.5 rounded-xl font-bold ${
                      optionType === 'PUT' ? 'bg-rose-600 text-white' : 'bg-[#11151f] text-slate-400'
                    }`}
                  >
                    PUT
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-500 uppercase">Selected Strike</label>
                  <input
                    type="number"
                    value={selectedStrike}
                    onChange={(e) => setSelectedStrike(parseFloat(e.target.value))}
                    className="w-full bg-[#11151f] border border-slate-800 rounded-lg p-2 text-white font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="option-qty" className="text-xs text-slate-500 uppercase">Contracts (x100 Shares)</label>
                  <input
                    id="option-qty"
                    type="number"
                    value={optionQty}
                    onChange={(e) => setOptionQty(e.target.value)}
                    className="w-full bg-[#11151f] border border-slate-800 rounded-lg p-2 text-white font-bold"
                  />
                </div>

                <button
                  onClick={handleExecuteOptionOrder}
                  className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-white uppercase tracking-wider transition-all cursor-pointer shadow-lg"
                >
                  Submit Option Order
                </button>
              </div>
            ) : (
              /* STRATEGY TICKET */
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 uppercase">Strategy Formula</label>
                  <select
                    value={selectedStrategy}
                    onChange={(e: any) => setSelectedStrategy(e.target.value)}
                    className="w-full bg-[#11151f] border border-slate-800 rounded-lg p-2 text-white font-bold"
                  >
                    <option value="covered_call">Covered Call (Yield)</option>
                    <option value="protective_put">Protective Put (Hedge)</option>
                    <option value="bull_call_spread">Bull Call Spread (Leveraged)</option>
                    <option value="bear_put_spread">Bear Put Spread (Bearish)</option>
                    <option value="long_straddle">Long Straddle (Volatility)</option>
                  </select>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800 text-xs text-slate-400 leading-normal space-y-1">
                  {selectedStrategy === 'covered_call' && (
                    <>
                      <span className="text-white font-bold block">COVERED CALL:</span>
                      Buy 100 shares of {activeSymbol} and Sell 1 Call option. Perfect for generating passive premium yield in neutral or slowly rising markets.
                    </>
                  )}
                  {selectedStrategy === 'protective_put' && (
                    <>
                      <span className="text-white font-bold block">PROTECTIVE PUT:</span>
                      Buy 100 shares of {activeSymbol} and Buy 1 Put option. acts as insurance limiting your maximum downside to the chosen strike price.
                    </>
                  )}
                  {selectedStrategy === 'bull_call_spread' && (
                    <>
                      <span className="text-white font-bold block">BULL CALL SPREAD:</span>
                      Buy 1 ATM Call + Sell 1 OTM Call. Offers leveraged bullish exposure on {activeSymbol} with strict limits on maximum risk and lower cost basis.
                    </>
                  )}
                  {selectedStrategy === 'bear_put_spread' && (
                    <>
                      <span className="text-white font-bold block">BEAR PUT SPREAD:</span>
                      Buy 1 ATM Put + Sell 1 OTM Put. Position for downward trends with capped maximum risk and minimized net-premium costs.
                    </>
                  )}
                  {selectedStrategy === 'long_straddle' && (
                    <>
                      <span className="text-white font-bold block">LONG STRADDLE:</span>
                      Buy 1 ATM Call + Buy 1 ATM Put. Ideal for capitalizing on sharp volatility or heavy upcoming event catalyst moves in either direction.
                    </>
                  )}
                </div>

                <div className="space-y-1">
                  <label htmlFor="strategy-qty" className="text-xs text-slate-500 uppercase">Quantity (Sets)</label>
                  <input
                    id="strategy-qty"
                    type="number"
                    value={strategyQty}
                    onChange={(e) => setStrategyQty(e.target.value)}
                    className="w-full bg-[#11151f] border border-slate-800 rounded-lg p-2 text-white font-bold"
                  />
                </div>

                <button
                  onClick={handleExecuteStrategy}
                  className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 font-bold text-white uppercase tracking-wider transition-all cursor-pointer shadow-lg"
                >
                  Submit Multi-Leg Order
                </button>
              </div>
            )}
          </div>

          {/* Terminal Log Output */}
          <div className="bg-[#06080c] p-2.5 rounded-xl border border-slate-850 text-xs space-y-1 h-32 overflow-y-auto font-mono text-slate-400">
            <span className="text-xs text-slate-500 uppercase block font-bold">Execution Log</span>
            {logMessages.map((msg, i) => (
              <div key={i} className="leading-tight truncate">{msg}</div>
            ))}
          </div>
        </div>

      </div>

      {/* POSITIONS FOOTER LEDGER */}
      <div className="bg-[#0a0d14] p-3 border-t border-slate-850 flex flex-wrap items-center justify-between gap-4 shrink-0 text-xs font-mono">
        <div className="flex items-center gap-6">
          <div>
            <span className="text-xs text-slate-500 block">CASH</span>
            <span className="font-bold text-white">${cash.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div>
            <span className="text-xs text-slate-500 block">POSITIONS VALUE</span>
            <span className="font-bold text-slate-200">${metrics.positionsValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div>
            <span className="text-xs text-slate-500 block">TOTAL NAV</span>
            <span className="font-bold text-emerald-400">${metrics.totalNav.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        {/* Position Close Action Row */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-lg">
          {positions.map((p) => (
            <div key={p.id} className="bg-[#11151f] px-2.5 py-1 rounded-lg border border-slate-800 flex items-center gap-2 text-xs">
              <span className="font-bold text-white">{p.symbol} {p.type !== 'STOCK' ? `$${p.strike} ${p.type}` : ''} x{p.qty}</span>
              <button
                onClick={() => closePosition(p.id, quotes)}
                className="text-rose-400 hover:text-rose-300 font-bold underline cursor-pointer"
              >
                Close
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
