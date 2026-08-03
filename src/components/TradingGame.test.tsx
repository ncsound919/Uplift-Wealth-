import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { TradingGame } from './TradingGame';

const mockBuyStock = vi.fn(() => true);
const mockSellStock = vi.fn(() => true);
const mockBuyOption = vi.fn(() => true);
const mockSellOption = vi.fn(() => true);
const mockClosePosition = vi.fn();
const mockAddSymbol = vi.fn();
const mockRemoveSymbol = vi.fn();
const mockFastForward = vi.fn();
const mockTriggerEvent = vi.fn();
const mockExecuteStrategy = vi.fn(() => true);
const mockReset = vi.fn();
const mockSetActiveSymbol = vi.fn();
const mockRecordNavSnapshot = vi.fn();

const DEFAULT_STORE_STATE = {
  cash: 100000,
  positions: [],
  orders: [],
  watchlist: ['AAPL', 'MSFT'],
  activeSymbol: 'AAPL',
  quotes: {
    AAPL: { symbol: 'AAPL', regularMarketPrice: 150, regularMarketChange: 2.5, regularMarketChangePercent: 1.68, regularMarketVolume: 50000 },
    MSFT: { symbol: 'MSFT', regularMarketPrice: 380, regularMarketChange: -1.2, regularMarketChangePercent: -0.32, regularMarketVolume: 30000 },
  },
  badges: [],
  logMessages: [],
  closedTrades: [],
  simulatedDaysAdvanced: 0,
  simulatedEvent: null,
  buyStock: mockBuyStock,
  sellStock: mockSellStock,
  buyOption: mockBuyOption,
  sellOption: mockSellOption,
  closePosition: mockClosePosition,
  addSymbol: mockAddSymbol,
  removeSymbol: mockRemoveSymbol,
  setActiveSymbol: mockSetActiveSymbol,
  recordNavSnapshot: mockRecordNavSnapshot,
  triggerMarketEvent: mockTriggerEvent,
  fastForwardDays: mockFastForward,
  executeStrategy: mockExecuteStrategy,
  reset: mockReset,
};

vi.mock('motion/react', () => ({ motion: { div: 'div' }, AnimatePresence: ({ children }: any) => <div>{children}</div> }));
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  ComposedChart: 'div', Bar: 'div', Line: 'div', XAxis: 'div', YAxis: 'div',
  Tooltip: 'div', CartesianGrid: 'div', ReferenceLine: 'div',
}));
vi.mock('../stores/tradingStore', () => ({
  useTradingStore: vi.fn((sel: any) => {
    const state = {
      cash: 100000,
      positions: [] as any[],
      orders: [],
      watchlist: ['AAPL', 'MSFT'],
      activeSymbol: 'AAPL',
      quotes: {
        AAPL: { symbol: 'AAPL', regularMarketPrice: 150, regularMarketChange: 2.5, regularMarketChangePercent: 1.68, regularMarketVolume: 50000 },
        MSFT: { symbol: 'MSFT', regularMarketPrice: 380, regularMarketChange: -1.2, regularMarketChangePercent: -0.32, regularMarketVolume: 30000 },
      },
      badges: [],
      logMessages: [] as string[],
      closedTrades: [] as any[],
      simulatedDaysAdvanced: 0,
      simulatedEvent: null as string | null,
      buyStock: mockBuyStock,
      sellStock: mockSellStock,
      buyOption: mockBuyOption,
      sellOption: mockSellOption,
      closePosition: mockClosePosition,
      addSymbol: mockAddSymbol,
      removeSymbol: mockRemoveSymbol,
      setActiveSymbol: mockSetActiveSymbol,
      recordNavSnapshot: mockRecordNavSnapshot,
      triggerMarketEvent: mockTriggerEvent,
      fastForwardDays: mockFastForward,
      executeStrategy: mockExecuteStrategy,
      reset: mockReset,
    };
    return sel ? sel(state) : state;
  }),
  usePortfolioMetrics: vi.fn(() => ({
    totalNav: 100500, positionsValue: 500, unrealizedPnl: 500,
    risk: { volatility: 25.3, maxDrawdown: 5.2, sharpeRatio: 1.8, sortinoRatio: 2.1, valueAtRisk95: 1200 },
  })),
}));
vi.mock('../hooks/tradingHooks', () => ({
  useQuotePolling: vi.fn(() => ({ loading: false, refresh: vi.fn() })),
  useChart: vi.fn(() => ({ data: [{ date: '2024-01', close: 150, volume: 1000 }], loading: false })),
  useOptionChain: vi.fn(() => [{ strike: 150, call: { bid: 5.2, ask: 5.5, delta: 0.55 }, put: { bid: 4.8, ask: 5.1, delta: -0.45 } }]),
  useTechnicalIndicators: vi.fn(() => ({ sma20: 148.5, rsi14: 55.3 })),
  useTradeJournal: vi.fn(() => ({ winRate: 60, profitFactor: 1.5, totalTrades: 0 })),
  useRiskAlerts: vi.fn(() => []),
}));
vi.mock('../utils/riskAnalytics', () => ({ RiskAnalytics: { riskGrade: vi.fn(() => ({ grade: 'A', label: 'Low Risk', color: 'text-emerald-400' })) } }));
vi.mock('./WatchlistPanel', () => ({ WatchlistPanel: () => <div>Watchlist</div>, MarketDataBadge: () => <div>Live</div>, useMarketDataStatus: () => ({ mode: 'live', provider: 'Alpha Vantage', apiKeyPresent: true, lastUpdated: null }) }));
vi.mock('../utils/blackScholes', () => ({ calculateBlackScholes: vi.fn(), Greeks: {} as any }));

import { useTradingStore } from '../stores/tradingStore';

function setStoreState(overrides: Record<string, any>) {
  const mockFn = vi.mocked(useTradingStore);
  mockFn.mockImplementation((sel?: any) => {
    const state = { ...DEFAULT_STORE_STATE, ...overrides };
    return sel ? sel(state) : state;
  });
}

describe('TradingGame', () => {
  const mockOnComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    const mockFn = vi.mocked(useTradingStore);
    mockFn.mockImplementation((sel?: any) => {
      const state = { ...DEFAULT_STORE_STATE };
      return sel ? sel(state) : state;
    });
  });

  it('renders the header with cash', () => {
    render(<TradingGame onComplete={mockOnComplete} />);
    expect(screen.getByText(/Paper Capital:/)).toBeInTheDocument();
    expect(screen.getByText('Complete Session')).toBeInTheDocument();
  });

  it('renders active symbol area', () => {
    render(<TradingGame onComplete={mockOnComplete} />);
    const aapls = screen.getAllByText('AAPL');
    expect(aapls.length).toBeGreaterThan(0);
  });

  it('renders watchlist symbols', () => {
    render(<TradingGame onComplete={mockOnComplete} />);
    expect(screen.getByText('MSFT')).toBeInTheDocument();
  });

  it('renders tab navigation', () => {
    render(<TradingGame onComplete={mockOnComplete} />);
    expect(screen.getByText('Chart')).toBeInTheDocument();
    expect(screen.getByText('Trade')).toBeInTheDocument();
    expect(screen.getByText('Analyze')).toBeInTheDocument();
  });

  it('switches to Trade tab', () => {
    render(<TradingGame onComplete={mockOnComplete} />);
    fireEvent.click(screen.getByText('Trade'));
    expect(screen.getByText(/Option Chain/i)).toBeInTheDocument();
  });

  it('switches to Analyze tab', () => {
    render(<TradingGame onComplete={mockOnComplete} />);
    fireEvent.click(screen.getByText('Analyze'));
    expect(screen.getByText(/Portfolio Risk/i)).toBeInTheDocument();
  });

  it('submits stock buy order', () => {
    render(<TradingGame onComplete={mockOnComplete} />);
    fireEvent.click(screen.getByText('Submit Stock Order'));
    expect(mockBuyStock).toHaveBeenCalled();
  });

  it('submits stock sell order', () => {
    render(<TradingGame onComplete={mockOnComplete} />);
    fireEvent.click(screen.getByText('SELL'));
    fireEvent.click(screen.getByText('Submit Stock Order'));
    expect(mockSellStock).toHaveBeenCalled();
  });

  it('submits option buy order', () => {
    render(<TradingGame onComplete={mockOnComplete} />);
    fireEvent.click(screen.getByText('SINGLE OPTION'));
    fireEvent.click(screen.getByText('Submit Option Order'));
    expect(mockBuyOption).toHaveBeenCalled();
  });

  it('advances time with fast-forward buttons', () => {
    render(<TradingGame onComplete={mockOnComplete} />);
    fireEvent.click(screen.getByText('+1D'));
    expect(mockFastForward).toHaveBeenCalledWith(1);
  });

  it('advances time with +7D button', () => {
    render(<TradingGame onComplete={mockOnComplete} />);
    fireEvent.click(screen.getByText('+7D'));
    expect(mockFastForward).toHaveBeenCalledWith(7);
  });

  it('advances time with +30D button', () => {
    render(<TradingGame onComplete={mockOnComplete} />);
    fireEvent.click(screen.getByText('+30D'));
    expect(mockFastForward).toHaveBeenCalledWith(30);
  });

  it('triggers market events', () => {
    render(<TradingGame onComplete={mockOnComplete} />);
    fireEvent.click(screen.getByText(/Fed Shock/i));
    expect(mockTriggerEvent).toHaveBeenCalledWith('rate_hike');
  });

  it('triggers earnings beat catalyst', () => {
    render(<TradingGame onComplete={mockOnComplete} />);
    fireEvent.click(screen.getByText(/Earnings Beat/i));
    expect(mockTriggerEvent).toHaveBeenCalledWith('earnings');
  });

  it('triggers short squeeze catalyst', () => {
    render(<TradingGame onComplete={mockOnComplete} />);
    fireEvent.click(screen.getByText(/Short Squeeze/i));
    expect(mockTriggerEvent).toHaveBeenCalledWith('squeeze');
  });

  it('triggers flash crash catalyst', () => {
    render(<TradingGame onComplete={mockOnComplete} />);
    fireEvent.click(screen.getByText(/Flash Crash/i));
    expect(mockTriggerEvent).toHaveBeenCalledWith('crash');
  });

  it('submits multi-leg strategy order', () => {
    render(<TradingGame onComplete={mockOnComplete} />);
    fireEvent.click(screen.getByText('QUANT STRAT'));
    fireEvent.click(screen.getByText('Submit Multi-Leg Order'));
    expect(mockExecuteStrategy).toHaveBeenCalled();
  });

  it('resets store on reset click', () => {
    render(<TradingGame onComplete={mockOnComplete} />);
    fireEvent.click(screen.getByText('Reset'));
    expect(mockReset).toHaveBeenCalled();
  });

  it('calls onComplete when Complete Session is clicked', () => {
    render(<TradingGame onComplete={mockOnComplete} />);
    fireEvent.click(screen.getByText('Complete Session'));
    expect(mockOnComplete).toHaveBeenCalled();
  });

  it('renders sidebar metrics', () => {
    render(<TradingGame onComplete={mockOnComplete} />);
    expect(screen.getByText('NET ASSET VALUE')).toBeInTheDocument();
    expect(screen.getByText('UNREALIZED P&L')).toBeInTheDocument();
    expect(screen.getByText(/RISK RATING/)).toBeInTheDocument();
  });

  it('renders footer positions value and total nav', () => {
    render(<TradingGame onComplete={mockOnComplete} />);
    expect(screen.getByText('POSITIONS VALUE')).toBeInTheDocument();
    expect(screen.getByText('TOTAL NAV')).toBeInTheDocument();
  });

  it('switches to Scan tab', () => {
    render(<TradingGame onComplete={mockOnComplete} />);
    fireEvent.click(screen.getByText('Scan'));
    expect(screen.getByText(/FinTech Quantitative Scanner/i)).toBeInTheDocument();
  });

  it('switches to Learn tab', () => {
    render(<TradingGame onComplete={mockOnComplete} />);
    fireEvent.click(screen.getByText('Learn'));
    expect(screen.getByText(/Educational Modules/i)).toBeInTheDocument();
  });

  it('clicks chart range buttons to switch ranges', () => {
    render(<TradingGame onComplete={mockOnComplete} />);
    fireEvent.click(screen.getByText('1MO'));
    fireEvent.click(screen.getByText('3MO'));
    fireEvent.click(screen.getByText('1Y'));
    fireEvent.click(screen.getByText('1D'));
  });

  it('toggles option type between CALL and PUT', () => {
    render(<TradingGame onComplete={mockOnComplete} />);
    fireEvent.click(screen.getByText('SINGLE OPTION'));
    fireEvent.click(screen.getByText('PUT'));
    fireEvent.click(screen.getByText('CALL'));
  });

  it('displays strategy descriptions for all strategies', () => {
    render(<TradingGame onComplete={mockOnComplete} />);
    fireEvent.click(screen.getByText('QUANT STRAT'));
    expect(screen.getByText(/COVERED CALL/)).toBeInTheDocument();
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'protective_put' } });
    expect(screen.getByText(/PROTECTIVE PUT/)).toBeInTheDocument();
    fireEvent.change(select, { target: { value: 'bull_call_spread' } });
    expect(screen.getByText(/BULL CALL SPREAD/)).toBeInTheDocument();
    fireEvent.change(select, { target: { value: 'bear_put_spread' } });
    expect(screen.getByText(/BEAR PUT SPREAD/)).toBeInTheDocument();
    fireEvent.change(select, { target: { value: 'long_straddle' } });
    expect(screen.getByText(/LONG STRADDLE/)).toBeInTheDocument();
  });

  it('refresh quotes button is clickable', () => {
    render(<TradingGame onComplete={mockOnComplete} />);
    fireEvent.click(screen.getByTitle('Refresh Market Quotes'));
  });

  it('handles empty search submission', () => {
    render(<TradingGame onComplete={mockOnComplete} />);
    const searchInput = screen.getByPlaceholderText(/Add Symbol/i);
    fireEvent.change(searchInput, { target: { value: '' } });
    fireEvent.submit(searchInput.closest('form')!);
    expect(mockAddSymbol).not.toHaveBeenCalled();
  });

  it('submits search symbol to add to watchlist', () => {
    render(<TradingGame onComplete={mockOnComplete} />);
    const searchInput = screen.getByPlaceholderText(/Add Symbol/i);
    fireEvent.change(searchInput, { target: { value: 'TSLA' } });
    fireEvent.submit(searchInput.closest('form')!);
    expect(mockAddSymbol).toHaveBeenCalledWith('TSLA');
  });

  it('selects a symbol from watchlist', () => {
    render(<TradingGame onComplete={mockOnComplete} />);
    fireEvent.click(screen.getByText('MSFT'));
    expect(mockSetActiveSymbol).toHaveBeenCalledWith('MSFT');
  });

  it('converts search input to uppercase', () => {
    render(<TradingGame onComplete={mockOnComplete} />);
    const searchInput = screen.getByPlaceholderText(/Add Symbol/i);
    fireEvent.change(searchInput, { target: { value: 'nvda' } });
    fireEvent.submit(searchInput.closest('form')!);
    expect(mockAddSymbol).toHaveBeenCalledWith('NVDA');
  });

  it('shows simulated event banner when event is present', () => {
    setStoreState({ simulatedEvent: '🚀 Earnings Beat - AAPL +8.2%' });
    render(<TradingGame onComplete={mockOnComplete} />);
    expect(screen.getByText(/BREAKING CATALYST/i)).toBeInTheDocument();
  });

  it('shows simulated days advanced badge', () => {
    setStoreState({ simulatedDaysAdvanced: 5 });
    render(<TradingGame onComplete={mockOnComplete} />);
    expect(screen.getByText(/\+5 Days Sim Time/i)).toBeInTheDocument();
  });

  it('renders positions footer with close buttons', () => {
    setStoreState({
      positions: [{ id: 'pos1', symbol: 'AAPL', type: 'STOCK', qty: 10, entryPrice: 145 }],
    });
    render(<TradingGame onComplete={mockOnComplete} />);
    expect(screen.getByText(/Close/)).toBeInTheDocument();
    fireEvent.click(screen.getByText('Close'));
    expect(mockClosePosition).toHaveBeenCalled();
  });

  it('renders closed trade history in Analyze tab', () => {
    setStoreState({
      closedTrades: [{ id: 't1', symbol: 'AAPL', type: 'STOCK', qty: 5, pnl: 150, pnlPct: 3.2 }],
    });
    render(<TradingGame onComplete={mockOnComplete} />);
    fireEvent.click(screen.getByText('Analyze'));
    expect(screen.getAllByText(/\$150\.00/).length).toBeGreaterThanOrEqual(1);
  });

  it('shows log messages in execution log', () => {
    setStoreState({
      logMessages: ['Order executed: Bought 10 AAPL @ 150.00'],
    });
    render(<TradingGame onComplete={mockOnComplete} />);
    expect(screen.getByText(/Order executed/i)).toBeInTheDocument();
  });

  it('shows empty trade history message in Analyze', () => {
    render(<TradingGame onComplete={mockOnComplete} />);
    fireEvent.click(screen.getByText('Analyze'));
    expect(screen.getByText(/No closed trades recorded yet/i)).toBeInTheDocument();
  });

  it('displays technical indicators in chart view', () => {
    render(<TradingGame onComplete={mockOnComplete} />);
    expect(screen.getByText(/SMA20/)).toBeInTheDocument();
    expect(screen.getByText(/RSI14/)).toBeInTheDocument();
  });

  it('displays volatility, max drawdown, and sharpe ratio', () => {
    render(<TradingGame onComplete={mockOnComplete} />);
    expect(screen.getByText(/VOLATILITY \(ANNUAL\)/)).toBeInTheDocument();
    expect(screen.getByText(/MAX DRAWDOWN/)).toBeInTheDocument();
    expect(screen.getByText(/SHARPE RATIO/)).toBeInTheDocument();
  });

  it('renders option chain table headers', () => {
    render(<TradingGame onComplete={mockOnComplete} />);
    fireEvent.click(screen.getByText('Trade'));
    expect(screen.getByText('CALL BID/ASK')).toBeInTheDocument();
    expect(screen.getByText('STRIKE')).toBeInTheDocument();
    expect(screen.getByText('PUT BID/ASK')).toBeInTheDocument();
  });

  it('renders Sortino, VaR, Win Rate, Profit Factor in Analyze', () => {
    render(<TradingGame onComplete={mockOnComplete} />);
    fireEvent.click(screen.getByText('Analyze'));
    expect(screen.getByText(/Sortino Ratio/i)).toBeInTheDocument();
    expect(screen.getByText(/Value at Risk/i)).toBeInTheDocument();
    expect(screen.getByText(/Win Rate/i)).toBeInTheDocument();
    expect(screen.getByText(/Profit Factor/i)).toBeInTheDocument();
  });

  it('displays risk grade label', () => {
    render(<TradingGame onComplete={mockOnComplete} />);
    expect(screen.getByText(/Low Risk/)).toBeInTheDocument();
  });

  it('renders watchlist panel placeholder', () => {
    render(<TradingGame onComplete={mockOnComplete} />);
    expect(screen.getAllByText('Watchlist').length).toBeGreaterThan(0);
  });

  it('renders market data badge', () => {
    render(<TradingGame onComplete={mockOnComplete} />);
    expect(screen.getAllByText('Live').length).toBeGreaterThan(0);
  });

  it('switches to QUANT STRAT asset type', () => {
    render(<TradingGame onComplete={mockOnComplete} />);
    fireEvent.click(screen.getByText('QUANT STRAT'));
    expect(screen.getByText(/Submit Multi-Leg Order/i)).toBeInTheDocument();
  });

  it('switches to SINGLE OPTION asset type', () => {
    render(<TradingGame onComplete={mockOnComplete} />);
    fireEvent.click(screen.getByText('SINGLE OPTION'));
    expect(screen.getByText(/Submit Option Order/i)).toBeInTheDocument();
  });

  it('shows Cash label in positions footer', () => {
    render(<TradingGame onComplete={mockOnComplete} />);
    const cashLabels = screen.getAllByText('CASH');
    expect(cashLabels.length).toBeGreaterThan(0);
  });

  it('does not execute strategy order with zero quantity', () => {
    render(<TradingGame onComplete={mockOnComplete} />);
    fireEvent.click(screen.getByText('QUANT STRAT'));
    fireEvent.change(screen.getByLabelText('Quantity (Sets)'), { target: { value: '0' } });
    fireEvent.click(screen.getByText('Submit Multi-Leg Order'));
    expect(mockExecuteStrategy).not.toHaveBeenCalled();
  });

  it('does not execute stock order with zero quantity', () => {
    render(<TradingGame onComplete={mockOnComplete} />);
    fireEvent.change(screen.getByLabelText('Shares Quantity'), { target: { value: '0' } });
    fireEvent.click(screen.getByText('Submit Stock Order'));
    expect(mockBuyStock).not.toHaveBeenCalled();
  });

  it('does not execute option order with zero quantity', () => {
    render(<TradingGame onComplete={mockOnComplete} />);
    fireEvent.click(screen.getByText('SINGLE OPTION'));
    fireEvent.change(screen.getByLabelText('Contracts (x100 Shares)'), { target: { value: '0' } });
    fireEvent.click(screen.getByText('Submit Option Order'));
    expect(mockBuyOption).not.toHaveBeenCalled();
  });

  it('records NAV snapshot on the periodic interval', () => {
    vi.useFakeTimers();
    render(<TradingGame onComplete={mockOnComplete} />);
    act(() => { vi.advanceTimersByTime(15000); });
    expect(mockRecordNavSnapshot).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });

  it('removes a symbol from the watchlist via trash button', () => {
    render(<TradingGame onComplete={mockOnComplete} />);
    fireEvent.click(screen.getByLabelText('Remove AAPL from watchlist'));
    expect(mockRemoveSymbol).toHaveBeenCalledWith('AAPL');
  });

  it('selects a strike by clicking an option chain row', () => {
    render(<TradingGame onComplete={mockOnComplete} />);
    fireEvent.click(screen.getByText('Trade'));
    fireEvent.click(screen.getByText('$150'));
    expect(screen.getByText('Submit Option Order')).toBeInTheDocument();
  });

  it('switches back to equity asset type', () => {
    render(<TradingGame onComplete={mockOnComplete} />);
    fireEvent.click(screen.getByText('SINGLE OPTION'));
    fireEvent.click(screen.getByText('EQUITY'));
    expect(screen.getByText('Submit Stock Order')).toBeInTheDocument();
  });

  it('sets stock order side to BUY', () => {
    render(<TradingGame onComplete={mockOnComplete} />);
    fireEvent.click(screen.getByText('BUY'));
    fireEvent.click(screen.getByText('Submit Stock Order'));
    expect(mockBuyStock).toHaveBeenCalled();
  });

  it('updates selected strike via the strike input', () => {
    render(<TradingGame onComplete={mockOnComplete} />);
    fireEvent.click(screen.getByText('SINGLE OPTION'));
    const strikeInput = screen.getByDisplayValue('150');
    fireEvent.change(strikeInput, { target: { value: '155' } });
    fireEvent.click(screen.getByText('Submit Option Order'));
    expect(mockBuyOption).toHaveBeenCalledWith('AAPL', 'CALL', 155, '30d', expect.anything(), 1);
  });
});
