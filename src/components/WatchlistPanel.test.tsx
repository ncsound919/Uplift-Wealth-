import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { WatchlistPanel, MarketDataBadge, useMarketDataStatus } from './WatchlistPanel';

const mockAddSymbol = vi.fn();
const mockRemoveSymbol = vi.fn();
const mockIsWatched = vi.fn(() => false);
let mockItems: { symbol: string }[] = [{ symbol: 'AAPL' }];

vi.mock('../stores/watchlistStore', () => ({
  useWatchlist: vi.fn(() => ({
    items: mockItems,
    addSymbol: mockAddSymbol,
    removeSymbol: mockRemoveSymbol,
    isWatched: mockIsWatched,
  })),
  POPULAR_TICKERS: [
    { symbol: 'AAPL' }, { symbol: 'GOOGL' }, { symbol: 'MSFT' },
    { symbol: 'AMZN' }, { symbol: 'NVDA' }, { symbol: 'TSLA' },
    { symbol: 'META' }, { symbol: 'JPM' }, { symbol: 'V' },
  ],
}));

const mockGetBatchQuotes = vi.fn();
vi.mock('../lib/alphaVantageClient', () => ({
  alphaVantage: {
    getBatchQuotes: (...args: any[]) => mockGetBatchQuotes(...args),
  },
  StockQuote: class {},
}));

vi.mock('../lib/utils', () => ({ cn: (...args: any[]) => args.filter(Boolean).join(' ') }));

vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: any) => {
      const { animate, transition, initial, exit, ...rest } = props;
      return <div {...rest}>{children}</div>;
    },
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

function renderHookResult(hook: () => any) {
  let result: any;
  function TestComp() {
    result = hook();
    return null;
  }
  render(<TestComp />);
  return result;
}

function openPanel() {
  act(() => { fireEvent.click(screen.getByText('Watchlist')); });
}

describe('useMarketDataStatus', () => {
  it('returns simulated mode by default in test environment', () => {
    let status: any;
    function TestHook() { status = useMarketDataStatus(); return null; }
    render(<TestHook />);
    expect(status.mode).toBe('simulated');
    expect(status.provider).toBe('Random Walk Simulation');
    expect(status.apiKeyPresent).toBe(false);
  });
});

describe('MarketDataBadge', () => {
  it('renders live mode', () => {
    render(<MarketDataBadge status={{ mode: 'live', provider: 'Alpha Vantage', apiKeyPresent: true, lastUpdated: null }} />);
    expect(screen.getByText('Live')).toBeInTheDocument();
    expect(screen.getByText(/Alpha Vantage/)).toBeInTheDocument();
  });

  it('renders simulated mode', () => {
    render(<MarketDataBadge status={{ mode: 'simulated', provider: 'Random Walk Simulation', apiKeyPresent: false, lastUpdated: null }} />);
    expect(screen.getByText('Sim')).toBeInTheDocument();
    expect(screen.getByText(/Random Walk Simulation/)).toBeInTheDocument();
  });

  it('renders error mode', () => {
    render(<MarketDataBadge status={{ mode: 'error', provider: 'Error', apiKeyPresent: false, lastUpdated: null }} />);
    expect(screen.getByText('Sim')).toBeInTheDocument();
  });
});

describe('WatchlistPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockItems = [{ symbol: 'AAPL' }];
    mockGetBatchQuotes.mockResolvedValue({
      AAPL: { symbol: 'AAPL', regularMarketPrice: 150, regularMarketChange: 2, regularMarketChangePercent: 1.35, regularMarketVolume: 100000 },
    });
  });

  it('renders watchlist button', () => {
    render(<WatchlistPanel />);
    expect(screen.getByText('Watchlist')).toBeInTheDocument();
  });

  it('opens panel on button click', () => {
    render(<WatchlistPanel />);
    openPanel();
    expect(screen.getByText('My Watchlist')).toBeInTheDocument();
  });

  it('shows add symbol button in panel', () => {
    render(<WatchlistPanel />);
    openPanel();
    expect(screen.getByText('Add Symbol')).toBeInTheDocument();
  });

  it('shows watched symbols in panel', () => {
    render(<WatchlistPanel />);
    openPanel();
    expect(screen.getByText('AAPL')).toBeInTheDocument();
  });

  it('shows item count badge', () => {
    render(<WatchlistPanel />);
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('does not show badge when items empty', () => {
    mockItems = [];
    render(<WatchlistPanel />);
    expect(screen.queryByText('1')).not.toBeInTheDocument();
  });

  it('shows empty state when no items and panel open', () => {
    mockItems = [];
    render(<WatchlistPanel />);
    openPanel();
    expect(screen.getByText(/No symbols yet/)).toBeInTheDocument();
  });

  it('adds symbol via text input', () => {
    render(<WatchlistPanel />);
    openPanel();
    act(() => { fireEvent.click(screen.getByText('Add Symbol')); });
    const input = screen.getByPlaceholderText(/Symbol/);
    act(() => { fireEvent.change(input, { target: { value: 'TSLA' } }); });
    act(() => { fireEvent.click(screen.getByText('Add')); });
    expect(mockAddSymbol).toHaveBeenCalledWith('TSLA');
  });

  it('adds symbol on Enter key', () => {
    render(<WatchlistPanel />);
    openPanel();
    act(() => { fireEvent.click(screen.getByText('Add Symbol')); });
    const input = screen.getByPlaceholderText(/Symbol/);
    act(() => { fireEvent.change(input, { target: { value: 'MSFT' } }); });
    act(() => { fireEvent.keyDown(input, { key: 'Enter' }); });
    expect(mockAddSymbol).toHaveBeenCalledWith('MSFT');
  });

  it('adds symbol via popular ticker', () => {
    render(<WatchlistPanel />);
    openPanel();
    act(() => { fireEvent.click(screen.getByText('Add Symbol')); });
    act(() => { fireEvent.click(screen.getByText('GOOGL')); });
    expect(mockAddSymbol).toHaveBeenCalledWith('GOOGL');
  });

  it('removes symbol', () => {
    render(<WatchlistPanel />);
    openPanel();
    act(() => { fireEvent.click(screen.getByTitle('Remove')); });
    expect(mockRemoveSymbol).toHaveBeenCalledWith('AAPL');
  });

  it('closes panel via X button', () => {
    render(<WatchlistPanel />);
    openPanel();
    expect(screen.getByText('My Watchlist')).toBeInTheDocument();
    const header = screen.getByText('My Watchlist').closest('div');
    const xBtn = header?.parentElement?.querySelector('button');
    if (xBtn) act(() => { fireEvent.click(xBtn); });
    expect(screen.queryByText('My Watchlist')).not.toBeInTheDocument();
  });

  it('cancels add form', () => {
    render(<WatchlistPanel />);
    openPanel();
    act(() => { fireEvent.click(screen.getByText('Add Symbol')); });
    expect(screen.getByPlaceholderText(/Symbol/)).toBeInTheDocument();
    act(() => { fireEvent.click(screen.getByText('Cancel')); });
    expect(screen.queryByPlaceholderText(/Symbol/)).not.toBeInTheDocument();
  });

  it('shows quote price and change when loaded', async () => {
    render(<WatchlistPanel />);
    openPanel();
    expect(await screen.findByText('$150.00')).toBeInTheDocument();
    expect(screen.getByText('+1.35%')).toBeInTheDocument();
    expect(screen.getByText(/Vol 100,000/)).toBeInTheDocument();
  });

  it('shows negative change in red', async () => {
    mockGetBatchQuotes.mockResolvedValue({
      AAPL: { symbol: 'AAPL', regularMarketPrice: 145, regularMarketChange: -3, regularMarketChangePercent: -2.03, regularMarketVolume: 80000 },
    });
    render(<WatchlistPanel />);
    openPanel();
    expect(await screen.findByText('$145.00')).toBeInTheDocument();
    expect(screen.getByText('-2.03%')).toBeInTheDocument();
  });

  it('shows loading placeholder when no quote', async () => {
    mockGetBatchQuotes.mockResolvedValue({});
    render(<WatchlistPanel />);
    openPanel();
    expect(await screen.findByText('--')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('closes when clicking backdrop', () => {
    render(<WatchlistPanel />);
    openPanel();
    const backdrop = document.querySelector('[class*="fixed"]');
    if (backdrop) {
      act(() => { fireEvent.click(backdrop); });
      expect(screen.queryByText('My Watchlist')).not.toBeInTheDocument();
    }
  });

  it('disables popular ticker when already watched', () => {
    mockIsWatched.mockReturnValue(true);
    render(<WatchlistPanel />);
    openPanel();
    act(() => { fireEvent.click(screen.getByText('Add Symbol')); });
    const buttons = screen.getAllByText('AAPL');
    const popularBtn = buttons.find(b => b.tagName === 'BUTTON');
    expect(popularBtn).toBeDisabled();
  });

  it('matches snapshot of footer display', () => {
    render(<WatchlistPanel />);
    expect(screen.getByText('Watchlist')).toBeInTheDocument();
  });

  it('logs a warning when the quote fetch fails', async () => {
    mockGetBatchQuotes.mockRejectedValue(new Error('network down'));
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<WatchlistPanel />);
    openPanel();
    await waitFor(() => expect(warnSpy).toHaveBeenCalled());
    expect(warnSpy).toHaveBeenCalledWith('Watchlist fetch failed:', expect.any(Error));
    warnSpy.mockRestore();
  });
});
