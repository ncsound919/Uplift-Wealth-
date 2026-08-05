import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';

expect.extend(toHaveNoViolations);

vi.mock('motion/react', () => {
  const Div = React.forwardRef(({ children, ...props }: any, ref: any) => <div ref={ref} {...props}>{children}</div>);
  Div.displayName = 'MotionDiv';
  return { motion: new Proxy({}, { get: () => Div }), AnimatePresence: ({ children }: any) => <>{children}</> };
});

vi.mock('../lib/utils', () => ({ cn: (...args: any[]) => args.filter(Boolean).join(' ') }));
vi.mock('../utils/iconResolver', () => ({ resolveIcon: () => 'div' }));
vi.mock('canvas-confetti', () => ({ default: vi.fn() }));

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <>{children}</>,
  ComposedChart: 'div', Bar: 'div', Line: 'div', XAxis: 'div', YAxis: 'div',
  Tooltip: 'div', CartesianGrid: 'div', ReferenceLine: 'div',
}));

const mockTradingStore = vi.fn((sel?: any) => {
  const state = {
    cash: 100000, positions: [], orders: [], watchlist: ['AAPL', 'MSFT'],
    activeSymbol: 'AAPL', badges: [], logMessages: [], closedTrades: [],
    simulatedDaysAdvanced: 0, simulatedEvent: null,
    quotes: { AAPL: { symbol: 'AAPL', regularMarketPrice: 150, regularMarketChange: 2.5, regularMarketChangePercent: 1.68, regularMarketVolume: 50000 } },
    buyStock: vi.fn(), sellStock: vi.fn(), buyOption: vi.fn(), sellOption: vi.fn(),
    closePosition: vi.fn(), addSymbol: vi.fn(), removeSymbol: vi.fn(),
    setActiveSymbol: vi.fn(), recordNavSnapshot: vi.fn(),
    triggerMarketEvent: vi.fn(), fastForwardDays: vi.fn(),
    executeStrategy: vi.fn(), reset: vi.fn(),
  };
  return sel ? sel(state) : state;
});
vi.mock('../stores/tradingStore', () => ({
  useTradingStore: mockTradingStore,
  usePortfolioMetrics: vi.fn(() => ({
    totalNav: 100000, positionsValue: 0, unrealizedPnl: 0,
    risk: { volatility: 0, maxDrawdown: 0, sharpeRatio: 0, sortinoRatio: 0, valueAtRisk95: 0 },
  })),
}));
vi.mock('../hooks/tradingHooks', () => ({
  useQuotePolling: vi.fn(() => ({ loading: false, refresh: vi.fn() })),
  useChart: vi.fn(() => ({ data: [], loading: false })),
  useOptionChain: vi.fn(() => []),
  useTechnicalIndicators: vi.fn(() => ({})),
  useTradeJournal: vi.fn(() => ({})),
  useRiskAlerts: vi.fn(() => []),
}));
vi.mock('../utils/riskAnalytics', () => ({
  RiskAnalytics: { riskGrade: vi.fn(() => ({ grade: 'A', label: 'Low Risk', color: 'text-emerald-400' })) },
}));
vi.mock('../components/WatchlistPanel', () => ({
  WatchlistPanel: () => <div>Watchlist</div>,
  MarketDataBadge: () => <div>Live</div>,
  useMarketDataStatus: () => ({ mode: 'live', provider: 'Alpha Vantage', apiKeyPresent: true, lastUpdated: null }),
}));
vi.mock('../utils/blackScholes', () => ({ calculateBlackScholes: vi.fn(), Greeks: {} as any }));

describe('a11y', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('Dashboard has no accessibility violations', async () => {
    const { Dashboard } = await import('../components/Dashboard');
    const { container } = render(
      <Dashboard
        modules={[]}
        completedModules={[]}
        completedLessons={[]}
        onSelectModule={() => {}}
        activeLevel="beginner"
        onSelectLevel={() => {}}
        xp={0}
        streak={0}
        badges={[]}
        completedLessonsCount={0}
      />
    );
    const results = await axe(container, {
      rules: { 'heading-order': { enabled: false } },
    });
    expect(results).toHaveNoViolations();
  });

  it('KnowledgeBase has no accessibility violations', async () => {
    const { KnowledgeBase } = await import('../components/KnowledgeBase');
    const { container } = render(<MemoryRouter><KnowledgeBase /></MemoryRouter>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('WealthBuilding has no accessibility violations', async () => {
    const { WealthBuilding } = await import('../components/WealthBuilding');
    const { container } = render(<MemoryRouter><WealthBuilding /></MemoryRouter>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('TradingGame has no accessibility violations', async () => {
    const { TradingGame } = await import('../components/TradingGame');
    const { container } = render(<TradingGame onComplete={vi.fn()} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
