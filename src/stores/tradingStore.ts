import { useMemo } from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { alphaVantage, StockQuote } from '../lib/alphaVantageClient';
import { calculateBlackScholes } from '../utils/blackScholes';
import { RiskAnalytics } from '../utils/riskAnalytics';

export interface Position {
  id: string;
  symbol: string;
  type: 'STOCK' | 'CALL' | 'PUT';
  qty: number;
  entryPrice: number;
  strike?: number;
  expiry?: string;
  openedAt: string;
}

export interface Order {
  id: string;
  symbol: string;
  type: 'STOCK' | 'OPTION';
  side: 'BUY' | 'SELL';
  optionType?: 'CALL' | 'PUT';
  strike?: number;
  expiry?: string;
  qty: number;
  price: number;
  timestamp: string;
  status: 'FILLED' | 'REJECTED';
  totalValue: number;
}

export interface Trade {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  qty: number;
  entryPrice: number;
  exitPrice: number;
  pnl: number;
  pnlPct: number;
  openedAt: string;
  closedAt: string;
  type: 'STOCK' | 'OPTION';
  holdingPeriodHours: number;
}

export interface Badge {
  id: string;
  title: string;
  desc: string;
  earnedAt: string;
}

interface NavSnapshot {
  timestamp: number;
  nav: number;
  cash: number;
  positionsValue: number;
}

interface TradingState {
  cash: number;
  startingCapital: number;
  positions: Position[];
  orders: Order[];
  closedTrades: Trade[];
  navHistory: NavSnapshot[];

  quotes: Record<string, StockQuote>;
  watchlist: string[];
  activeSymbol: string;

  simulatedDaysAdvanced: number;
  simulatedEvent: string | null;

  badges: Badge[];
  logMessages: string[];

  buyStock: (symbol: string, qty: number, price: number, orderType: 'MARKET' | 'LIMIT') => boolean;
  sellStock: (symbol: string, qty: number, price: number) => boolean;
  buyOption: (symbol: string, type: 'CALL' | 'PUT', strike: number, expiry: string, premium: number, qty: number) => boolean;
  sellOption: (symbol: string, type: 'CALL' | 'PUT', strike: number, expiry: string, premium: number, qty: number) => boolean;
  closePosition: (positionId: string, quotes: Record<string, StockQuote>) => void;
  addSymbol: (symbol: string) => void;
  removeSymbol: (symbol: string) => void;
  setActiveSymbol: (symbol: string) => void;
  updateQuotes: (quotes: Record<string, StockQuote>) => void;
  recordNavSnapshot: () => void;
  triggerMarketEvent: (eventType: 'earnings' | 'rate_hike' | 'squeeze' | 'crash' | 'rebound', targetSymbol?: string) => void;
  fastForwardDays: (days: number) => void;
  executeStrategy: (strategyType: 'covered_call' | 'protective_put' | 'bull_call_spread' | 'bear_put_spread' | 'long_straddle', symbol: string, spotPrice: number, qty: number) => boolean;
  addBadge: (badge: Omit<Badge, 'earnedAt'>) => void;
  addLog: (message: string) => void;
  reset: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 11) + Date.now().toString(36);

export const useTradingStore = create<TradingState>()(
  persist(
    (set, get) => ({
      cash: 100000,
      startingCapital: 100000,
      positions: [],
      orders: [],
      closedTrades: [],
      navHistory: [],
      quotes: {},
      watchlist: ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'SPY', 'QQQ', 'AMD', 'COIN', 'NFLX', 'AMZN'],
      activeSymbol: 'AAPL',
      simulatedDaysAdvanced: 0,
      simulatedEvent: null,
      badges: [],
      logMessages: ['Stock Sim Terminal loaded. Starting paper capital: $100,000 cash.'],

      buyStock: (symbol, qty, price, _orderType) => {
        const totalCost = qty * price;
        const cash = get().cash;
        if (totalCost > cash) {
          get().addLog(`REJECTED: Insufficient funds for buying ${qty} shares of ${symbol}. Required: $${totalCost.toLocaleString()}, Available: $${cash.toLocaleString()}`);
          return false;
        }

        const now = new Date().toISOString();
        set((state) => {
          const existingIdx = state.positions.findIndex(
            (p) => p.symbol === symbol && p.type === 'STOCK'
          );
          let newPositions;
          if (existingIdx >= 0) {
            newPositions = [...state.positions];
            const curr = newPositions[existingIdx];
            const combinedQty = curr.qty + qty;
            const avgEntry = (curr.entryPrice * curr.qty + price * qty) / combinedQty;
            newPositions[existingIdx] = {
              ...curr,
              qty: combinedQty,
              entryPrice: Number(avgEntry.toFixed(2)),
            };
          } else {
            newPositions = [
              ...state.positions,
              {
                id: generateId(),
                symbol,
                type: 'STOCK' as const,
                qty,
                entryPrice: Number(price.toFixed(2)),
                openedAt: now,
              },
            ];
          }

          const newOrder: Order = {
            id: generateId(),
            symbol,
            type: 'STOCK',
            side: 'BUY',
            qty,
            price,
            timestamp: new Date().toLocaleTimeString(),
            status: 'FILLED',
            totalValue: totalCost,
          };

          return {
            cash: state.cash - totalCost,
            positions: newPositions,
            orders: [newOrder, ...state.orders],
          };
        });

        get().addLog(`FILLED: Bought ${qty} shares of ${symbol} at $${price.toFixed(2)} ($${totalCost.toLocaleString()})`);
        get().addBadge({ id: 'first_stock_trade', title: 'Equity Shareholder', desc: 'Acquired stock shares in a paper-trading simulation.' });

        if (get().positions.length >= 3) {
          get().addBadge({ id: 'diversified', title: 'Portfolio Manager', desc: 'Hold 3 or more open positions simultaneously.' });
        }
        return true;
      },

      sellStock: (symbol, qty, price) => {
        const positions = get().positions;
        const existingIdx = positions.findIndex(
          (p) => p.symbol === symbol && p.type === 'STOCK'
        );
        if (existingIdx < 0 || positions[existingIdx].qty < qty) {
          get().addLog(`REJECTED: Insufficient shares to sell ${qty} of ${symbol}.`);
          return false;
        }

        const totalCredit = qty * price;
        const now = new Date().toISOString();
        set((state) => {
          const newPositions = [...state.positions];
          const curr = newPositions[existingIdx];
          const pnl = (price - curr.entryPrice) * qty;
          const pnlPct = ((price - curr.entryPrice) / curr.entryPrice) * 100;
          const holdingHours = (new Date().getTime() - new Date(curr.openedAt).getTime()) / 3600000;

          const closedTrade: Trade = {
            id: generateId(),
            symbol,
            side: 'BUY',
            qty,
            entryPrice: curr.entryPrice,
            exitPrice: price,
            pnl,
            pnlPct,
            openedAt: curr.openedAt,
            closedAt: now,
            type: 'STOCK',
            holdingPeriodHours: Number(holdingHours.toFixed(1)),
          };

          if (curr.qty === qty) {
            newPositions.splice(existingIdx, 1);
          } else {
            newPositions[existingIdx] = { ...curr, qty: curr.qty - qty };
          }

          const newOrder: Order = {
            id: generateId(),
            symbol,
            type: 'STOCK',
            side: 'SELL',
            qty,
            price,
            timestamp: new Date().toLocaleTimeString(),
            status: 'FILLED',
            totalValue: totalCredit,
          };

          return {
            cash: state.cash + totalCredit,
            positions: newPositions,
            orders: [newOrder, ...state.orders],
            closedTrades: [closedTrade, ...state.closedTrades],
          };
        });

        get().addLog(`FILLED: Sold ${qty} shares of ${symbol} at $${price.toFixed(2)} ($${totalCredit.toLocaleString()})`);
        return true;
      },

      buyOption: (symbol, type, strike, expiry, premium, qty) => {
        const totalCost = qty * premium * 100;
        if (totalCost > get().cash) {
          get().addLog(`REJECTED: Insufficient funds for buying ${qty} option contracts. Required: $${totalCost.toLocaleString()}, Available: $${get().cash.toLocaleString()}`);
          return false;
        }

        const now = new Date().toISOString();
        set((state) => {
          const existingIdx = state.positions.findIndex(
            (p) => p.symbol === symbol && p.type === type && p.strike === strike && p.expiry === expiry
          );
          let newPositions;
          if (existingIdx >= 0) {
            newPositions = [...state.positions];
            const curr = newPositions[existingIdx];
            const combinedQty = curr.qty + qty;
            const avgEntry = (curr.entryPrice * curr.qty + premium * qty) / combinedQty;
            newPositions[existingIdx] = {
              ...curr,
              qty: combinedQty,
              entryPrice: Number(avgEntry.toFixed(2)),
            };
          } else {
            newPositions = [
              ...state.positions,
              {
                id: generateId(),
                symbol,
                type,
                qty,
                entryPrice: premium,
                strike,
                expiry,
                openedAt: now,
              },
            ];
          }

          const newOrder: Order = {
            id: generateId(),
            symbol,
            type: 'OPTION',
            side: 'BUY',
            optionType: type,
            strike,
            expiry,
            qty,
            price: premium,
            timestamp: new Date().toLocaleTimeString(),
            status: 'FILLED',
            totalValue: totalCost,
          };

          return {
            cash: state.cash - totalCost,
            positions: newPositions,
            orders: [newOrder, ...state.orders],
          };
        });

        get().addLog(`FILLED: Bought ${qty} ${symbol} ${expiry} $${strike} ${type} contracts at $${premium.toFixed(2)} ($${totalCost.toLocaleString()})`);
        get().addBadge({ id: 'first_option_trade', title: 'Option Speculator', desc: 'Completed a complex derivatives purchase.' });
        return true;
      },

      sellOption: (symbol, type, strike, expiry, premium, qty) => {
        const positions = get().positions;
        const existingIdx = positions.findIndex(
          (p) => p.symbol === symbol && p.type === type && p.strike === strike && p.expiry === expiry
        );
        if (existingIdx < 0 || positions[existingIdx].qty < qty) {
          get().addLog(`REJECTED: Insufficient options position to sell ${qty} contracts.`);
          return false;
        }

        const totalCredit = qty * premium * 100;
        const now = new Date().toISOString();
        set((state) => {
          const newPositions = [...state.positions];
          const curr = newPositions[existingIdx];
          const pnl = (premium - curr.entryPrice) * qty * 100;
          const pnlPct = ((premium - curr.entryPrice) / curr.entryPrice) * 100;
          const holdingHours = (new Date().getTime() - new Date(curr.openedAt).getTime()) / 3600000;

          const closedTrade: Trade = {
            id: generateId(),
            symbol,
            side: 'BUY',
            qty,
            entryPrice: curr.entryPrice,
            exitPrice: premium,
            pnl,
            pnlPct,
            openedAt: curr.openedAt,
            closedAt: now,
            type: 'OPTION',
            holdingPeriodHours: Number(holdingHours.toFixed(1)),
          };

          if (curr.qty === qty) {
            newPositions.splice(existingIdx, 1);
          } else {
            newPositions[existingIdx] = { ...curr, qty: curr.qty - qty };
          }

          const newOrder: Order = {
            id: generateId(),
            symbol,
            type: 'OPTION',
            side: 'SELL',
            optionType: type,
            strike,
            expiry,
            qty,
            price: premium,
            timestamp: new Date().toLocaleTimeString(),
            status: 'FILLED',
            totalValue: totalCredit,
          };

          return {
            cash: state.cash + totalCredit,
            positions: newPositions,
            orders: [newOrder, ...state.orders],
            closedTrades: [closedTrade, ...state.closedTrades],
          };
        });

        get().addLog(`FILLED: Sold ${qty} ${symbol} ${expiry} $${strike} ${type} contracts at $${premium.toFixed(2)} ($${totalCredit.toLocaleString()})`);
        return true;
      },

      closePosition: (positionId, quotes) => {
        const positions = get().positions;
        const pos = positions.find((p) => p.id === positionId);
        if (!pos) return;

        const currentPrice = quotes[pos.symbol]?.regularMarketPrice || pos.entryPrice;
        if (pos.type === 'STOCK') {
          get().sellStock(pos.symbol, pos.qty, currentPrice);
        } else {
          const r = 0.05;
          const baseVol = 0.30;
          const distFromATM = ((pos.strike || currentPrice) - currentPrice) / currentPrice;
          const iv = baseVol + Math.pow(distFromATM, 2) * 0.45;
          const currentPremium = calculateBlackScholes(
            currentPrice,
            pos.strike || currentPrice,
            30,
            iv,
            r,
            pos.type === 'CALL'
          ).price;
          get().sellOption(pos.symbol, pos.type as 'CALL' | 'PUT', pos.strike!, pos.expiry!, currentPremium, pos.qty);
        }
      },

      addSymbol: (symbol) => {
        const cleanSym = symbol.trim().toUpperCase();
        if (!cleanSym || get().watchlist.includes(cleanSym)) {
          if (cleanSym) get().setActiveSymbol(cleanSym);
          return;
        }
        set((state) => ({ watchlist: [...state.watchlist, cleanSym], activeSymbol: cleanSym }));
        get().addLog(`Symbol ${cleanSym} added to Watchlist.`);
      },

      removeSymbol: (symbol) => {
        const wl = get().watchlist;
        if (wl.length <= 1) return;
        set((state) => ({
          watchlist: state.watchlist.filter((s) => s !== symbol),
          activeSymbol: state.activeSymbol === symbol ? wl.filter((s) => s !== symbol)[0] : state.activeSymbol,
        }));
        get().addLog(`Symbol ${symbol} removed from Watchlist.`);
      },

      setActiveSymbol: (symbol) => set({ activeSymbol: symbol }),
      updateQuotes: (newQuotes) => set((state) => ({ quotes: { ...state.quotes, ...newQuotes } })),

      recordNavSnapshot: () => {
        const state = get();
        let positionsValue = 0;
        for (const pos of state.positions) {
          const price = state.quotes[pos.symbol]?.regularMarketPrice || pos.entryPrice;
          if (pos.type === 'STOCK') {
            positionsValue += pos.qty * price;
          } else {
            const r = 0.05;
            const baseVol = 0.30;
            const distFromATM = ((pos.strike || price) - price) / price;
            const iv = baseVol + Math.pow(distFromATM, 2) * 0.45;
            const premium = calculateBlackScholes(price, pos.strike || price, 30, iv, r, pos.type === 'CALL').price;
            positionsValue += pos.qty * premium * 100;
          }
        }
        const nav = state.cash + positionsValue;
        const snapshot: NavSnapshot = {
          timestamp: Date.now(),
          nav,
          cash: state.cash,
          positionsValue,
        };
        set((s) => ({
          navHistory: [...s.navHistory.slice(-499), snapshot],
        }));
      },

      triggerMarketEvent: (eventType, targetSymbol) => {
        const symbol = targetSymbol || get().activeSymbol;
        const currentQuote = get().quotes[symbol] || { symbol, regularMarketPrice: 150 };
        const price = currentQuote.regularMarketPrice;

        let pctChange = 0;
        let eventName = '';
        if (eventType === 'earnings') {
          pctChange = 0.082;
          eventName = `EARNINGS BEAT: ${symbol} surging +8.2% on record revenue & guidance!`;
        } else if (eventType === 'rate_hike') {
          pctChange = -0.048;
          eventName = `MACRO SHOCK: Federal Reserve signals 50bps rate hike. Broader market pulls back -4.8%.`;
        } else if (eventType === 'squeeze') {
          pctChange = 0.165;
          eventName = `SHORT SQUEEZE: Unusual options activity triggers +16.5% rapid momentum surge in ${symbol}!`;
        } else if (eventType === 'crash') {
          pctChange = -0.12;
          eventName = `BLACK SWAN: Unexpected liquidity crunch triggers -12.0% market flash selloff.`;
        } else if (eventType === 'rebound') {
          pctChange = 0.065;
          eventName = `BULLISH REBOUND: Institutional buy-the-dip inflows drive +6.5% recovery.`;
        }

        const newPrice = Math.max(1, Number((price * (1 + pctChange)).toFixed(2)));
        const newQuotes = { ...get().quotes };

        if (eventType === 'rate_hike' || eventType === 'crash') {
          Object.keys(newQuotes).forEach((s) => {
            const curP = newQuotes[s]?.regularMarketPrice || 150;
            const newP = Math.max(1, Number((curP * (1 + pctChange * (s === symbol ? 1 : 0.7))).toFixed(2)));
            newQuotes[s] = {
              ...newQuotes[s],
              symbol: s,
              regularMarketPrice: newP,
              regularMarketChange: newP - curP,
              regularMarketChangePercent: pctChange * 100,
            };
          });
        } else {
          newQuotes[symbol] = {
            ...newQuotes[symbol],
            symbol,
            regularMarketPrice: newPrice,
            regularMarketChange: newPrice - price,
            regularMarketChangePercent: pctChange * 100,
          };
        }

        set({ quotes: newQuotes, simulatedEvent: eventName });
        get().addLog(`MARKET CATALYST TRIGGERED: ${eventName}`);
        get().recordNavSnapshot();
      },

      fastForwardDays: (days) => {
        set((state) => ({ simulatedDaysAdvanced: state.simulatedDaysAdvanced + days }));
        const quotes = get().quotes;

        // Apply realistic random walk drift across all quotes for N days
        const updatedQuotes = { ...quotes };
        Object.keys(updatedQuotes).forEach((s) => {
          const p = updatedQuotes[s]?.regularMarketPrice || 150;
          let newP = p;
          for (let d = 0; d < days; d++) {
            const dailyDrift = (Math.random() - 0.48) * 0.022;
            newP = newP * (1 + dailyDrift);
          }
          newP = Number(Math.max(1, newP).toFixed(2));
          updatedQuotes[s] = {
            ...updatedQuotes[s],
            symbol: s,
            regularMarketPrice: newP,
            regularMarketChange: newP - p,
            regularMarketChangePercent: ((newP - p) / p) * 100,
          };
        });

        set({ quotes: updatedQuotes });

        get().addLog(`FAST FORWARD: Advanced simulation by +${days} day(s). Market prices and theta decay updated.`);
        get().recordNavSnapshot();
      },

      executeStrategy: (strategyType, symbol, spotPrice, qty) => {
        const roundStrike = (val: number) => Math.round(val / 5) * 5;
        const atmStrike = roundStrike(spotPrice);

        if (strategyType === 'covered_call') {
          // Buy 100 * qty shares + Sell 1 * qty Call contract OTM
          const otmStrike = atmStrike + 10;
          const boughtStock = get().buyStock(symbol, 100 * qty, spotPrice, 'MARKET');
          if (!boughtStock) return false;
          get().buyOption(symbol, 'CALL', otmStrike, '30d', 3.50, qty);
          get().addLog(`STRATEGY EXECUTED: Covered Call on ${symbol} (100x ${qty} shares + ${qty} $${otmStrike} Call)`);
          get().addBadge({ id: 'strat_covered_call', title: 'Income Strategist', desc: 'Executed a classic Covered Call option strategy.' });
          return true;
        }

        if (strategyType === 'protective_put') {
          // Buy 100 * qty shares + Buy 1 * qty Put contract OTM
          const otmPutStrike = atmStrike - 10;
          const boughtStock = get().buyStock(symbol, 100 * qty, spotPrice, 'MARKET');
          if (!boughtStock) return false;
          get().buyOption(symbol, 'PUT', otmPutStrike, '30d', 2.80, qty);
          get().addLog(`STRATEGY EXECUTED: Protective Put on ${symbol} (100x ${qty} shares + ${qty} $${otmPutStrike} Put Hedge)`);
          get().addBadge({ id: 'strat_protective_put', title: 'Hedge Fund Risk Mgr', desc: 'Protected equity portfolio with protective puts.' });
          return true;
        }

        if (strategyType === 'bull_call_spread') {
          // Buy lower strike Call, Sell higher strike Call
          const lowerStrike = atmStrike;
          const upperStrike = atmStrike + 15;
          const successBuy = get().buyOption(symbol, 'CALL', lowerStrike, '30d', 6.20, qty);
          if (!successBuy) return false;
          get().sellOption(symbol, 'CALL', upperStrike, '30d', 2.10, qty);
          get().addLog(`STRATEGY EXECUTED: Bull Call Spread on ${symbol} ($${lowerStrike}/$${upperStrike})`);
          get().addBadge({ id: 'strat_bull_spread', title: 'Spread Specialist', desc: 'Executed a multi-leg directional vertical spread.' });
          return true;
        }

        if (strategyType === 'bear_put_spread') {
          const upperStrike = atmStrike;
          const lowerStrike = atmStrike - 15;
          const successBuy = get().buyOption(symbol, 'PUT', upperStrike, '30d', 5.80, qty);
          if (!successBuy) return false;
          get().sellOption(symbol, 'PUT', lowerStrike, '30d', 1.90, qty);
          get().addLog(`STRATEGY EXECUTED: Bear Put Spread on ${symbol} ($${lowerStrike}/$${upperStrike})`);
          return true;
        }

        if (strategyType === 'long_straddle') {
          // Buy 1 Call + Buy 1 Put at ATM strike for volatility play
          const successCall = get().buyOption(symbol, 'CALL', atmStrike, '30d', 5.50, qty);
          if (!successCall) return false;
          get().buyOption(symbol, 'PUT', atmStrike, '30d', 5.20, qty);
          get().addLog(`STRATEGY EXECUTED: Long Straddle on ${symbol} ($${atmStrike} Call & Put Volatility Play)`);
          get().addBadge({ id: 'strat_straddle', title: 'Volatility Trader', desc: 'Traded pure volatility using a Long Straddle strategy.' });
          return true;
        }

        return false;
      },

      addBadge: (badge) => {
        if (get().badges.some((b) => b.id === badge.id)) return;
        set((state) => ({
          badges: [...state.badges, { ...badge, earnedAt: new Date().toISOString() }],
        }));
        get().addLog(`ACHIEVEMENT UNLOCKED: "${badge.title}" - ${badge.desc}`);
      },

      addLog: (message) =>
        set((state) => ({
          logMessages: [`${new Date().toLocaleTimeString()} | ${message}`, ...state.logMessages].slice(0, 100),
        })),

      reset: () =>
        set({
          cash: 100000,
          startingCapital: 100000,
          positions: [],
          orders: [],
          closedTrades: [],
          navHistory: [],
          badges: [],
          logMessages: ['Stock Sim Terminal reset. Starting paper capital: $100,000 cash.'],
        }),
    }),
    {
      name: 'trading-game-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        cash: state.cash,
        startingCapital: state.startingCapital,
        positions: state.positions,
        orders: state.orders,
        closedTrades: state.closedTrades,
        navHistory: state.navHistory,
        watchlist: state.watchlist,
        activeSymbol: state.activeSymbol,
        badges: state.badges,
      }),
    }
  )
);

export const usePortfolioMetrics = () => {
  const cash = useTradingStore((s) => s.cash);
  const startingCapital = useTradingStore((s) => s.startingCapital);
  const positions = useTradingStore((s) => s.positions);
  const quotes = useTradingStore((s) => s.quotes);
  const navHistory = useTradingStore((s) => s.navHistory);
  const closedTrades = useTradingStore((s) => s.closedTrades);
  const orders = useTradingStore((s) => s.orders);

  return useMemo(() => {
    let positionsValue = 0;
    let totalCostBasis = 0;
    let totalPnl = 0;

    const items = positions.map((pos) => {
      const currentPrice = quotes[pos.symbol]?.regularMarketPrice || pos.entryPrice;
      let marketVal = 0;
      let costBasis = 0;
      let currentUnitPrice = currentPrice;

      if (pos.type === 'STOCK') {
        marketVal = pos.qty * currentPrice;
        costBasis = pos.qty * pos.entryPrice;
      } else {
        const r = 0.05;
        const baseVol = 0.30;
        const distFromATM = ((pos.strike || currentPrice) - currentPrice) / currentPrice;
        const iv = baseVol + Math.pow(distFromATM, 2) * 0.45;
        const premium = calculateBlackScholes(currentPrice, pos.strike || currentPrice, 30, iv, r, pos.type === 'CALL').price;
        currentUnitPrice = premium;
        marketVal = pos.qty * premium * 100;
        costBasis = pos.qty * pos.entryPrice * 100;
      }

      const unrealizedPnl = marketVal - costBasis;
      const unrealizedPnlPct = costBasis > 0 ? (unrealizedPnl / costBasis) * 100 : 0;
      positionsValue += marketVal;
      totalCostBasis += costBasis;
      totalPnl += unrealizedPnl;

      return {
        ...pos,
        currentPrice: currentUnitPrice,
        marketVal,
        costBasis,
        unrealizedPnl,
        unrealizedPnlPct,
        pctOfPortfolio: 0,
      };
    });

    const totalNav = cash + positionsValue;
    const totalReturnPct = ((totalNav - startingCapital) / startingCapital) * 100;
    const totalPnlAmount = totalNav - startingCapital;

    items.forEach((item) => {
      item.pctOfPortfolio = totalNav > 0 ? (item.marketVal / totalNav) * 100 : 0;
    });

    const risk = RiskAnalytics.computeAll(items, navHistory, closedTrades, startingCapital, totalNav);

    const wins = closedTrades.filter((t) => t.pnl > 0);
    const losses = closedTrades.filter((t) => t.pnl < 0);
    const winRate = closedTrades.length > 0 ? (wins.length / closedTrades.length) * 100 : 0;
    const avgWin = wins.length > 0 ? wins.reduce((s, t) => s + t.pnl, 0) / wins.length : 0;
    const avgLoss = losses.length > 0 ? losses.reduce((s, t) => s + t.pnl, 0) / losses.length : 0;
    const profitFactor = avgLoss !== 0 ? Math.abs(avgWin / avgLoss) * (wins.length / Math.max(losses.length, 1)) : 0;

    return {
      totalNav,
      totalPnl: totalPnlAmount,
      totalReturnPct,
      cash,
      cashPct: totalNav > 0 ? (cash / totalNav) * 100 : 0,
      positionsValue,
      positionsValuePct: totalNav > 0 ? (positionsValue / totalNav) * 100 : 0,
      totalCostBasis,
      unrealizedPnl: totalPnl,
      items,
      risk,
      closedTradesCount: closedTrades.length,
      winRate,
      avgWin,
      avgLoss,
      profitFactor,
      totalTrades: closedTrades.length,
      ordersCount: orders.length,
    };
  }, [cash, startingCapital, positions, quotes, navHistory, closedTrades, orders]);
};
