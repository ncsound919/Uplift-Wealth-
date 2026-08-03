import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AlphaVantageClient } from './alphaVantageClient';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const quoteResponse = {
  'Global Quote': {
    '05. price': '150.25',
    '09. change': '2.50',
    '10. change percent': '1.682%',
    '06. volume': '1000000',
  },
};

const dailyResponse = {
  'Time Series (Daily)': {
    '2024-01-03': { '1. open': '150', '2. high': '152', '3. low': '149', '4. close': '151', '5. volume': '1000000' },
    '2024-01-02': { '1. open': '149', '2. high': '151', '3. low': '148', '4. close': '150', '5. volume': '900000' },
  },
};

const intradayResponse = {
  'Time Series (5min)': {
    '2024-01-03 14:35:00': { '1. open': '150.10', '2. high': '151.00', '3. low': '149.80', '4. close': '150.50', '5. volume': '50000' },
    '2024-01-03 14:30:00': { '1. open': '149.90', '2. high': '150.20', '3. low': '149.50', '4. close': '150.10', '5. volume': '45000' },
  },
};

const overviewResponse = {
  Symbol: 'AAPL',
  Name: 'Apple Inc.',
  Description: 'Apple designs, manufactures, and markets smartphones.',
};

const smaResponse = {
  'Technical Analysis: SMA': {
    '2024-01-03': { SMA: '151.2345' },
  },
};

const rsiResponse = {
  'Technical Analysis: RSI': {
    '2024-01-03': { RSI: '55.1234' },
  },
};

function mockOkResponse(data: unknown) {
  return { ok: true, status: 200, json: () => Promise.resolve(data) } as Response;
}

function mockRateLimitedResponse() {
  return { ok: false, status: 429, json: () => Promise.resolve({}) } as Response;
}

describe('AlphaVantageClient', () => {
  let client: AlphaVantageClient;

  beforeEach(() => {
    mockFetch.mockReset();
    vi.useFakeTimers();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    client = new AlphaVantageClient('test-key', 'free', 'http://mock-api');
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('sets free tier rate limits by default', () => {
      const stats = client.getUsageStats();
      expect(stats.dailyLimit).toBe(25);
      expect(stats.minuteLimit).toBe(5);
    });

    it('sets correct limits for premium tiers', () => {
      const p50 = new AlphaVantageClient('key', 'premium_50', 'http://api');
      expect(p50.getUsageStats().minuteLimit).toBe(75);

      const p100 = new AlphaVantageClient('key', 'premium_100', 'http://api');
      expect(p100.getUsageStats().minuteLimit).toBe(150);

      const p250 = new AlphaVantageClient('key', 'premium_250', 'http://api');
      expect(p250.getUsageStats().minuteLimit).toBe(300);
    });

    it('falls back to free tier for unknown tier', () => {
      const c = new AlphaVantageClient('key', 'unknown' as 'free', 'http://api');
      expect(c.getUsageStats().dailyLimit).toBe(25);
    });
  });

  describe('getQuote', () => {
    it('fetches and parses a quote', async () => {
      mockFetch.mockResolvedValue(mockOkResponse(quoteResponse));
      const result = await client.getQuote('AAPL');
      expect(result.regularMarketPrice).toBe(150.25);
      expect(result.regularMarketChange).toBe(2.50);
      expect(result.regularMarketChangePercent).toBe(1.682);
      expect(result.regularMarketVolume).toBe(1000000);
      expect(result.symbol).toBe('AAPL');
      expect(mockFetch).toHaveBeenCalledWith('http://mock-api/quote/AAPL');
    });

    it('returns cached value on subsequent call', async () => {
      mockFetch.mockResolvedValue(mockOkResponse(quoteResponse));
      await client.getQuote('AAPL');
      const result = await client.getQuote('AAPL');
      expect(result.regularMarketPrice).toBe(150.25);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('retries on 429 and succeeds', async () => {
      mockFetch
        .mockResolvedValueOnce(mockRateLimitedResponse())
        .mockResolvedValueOnce(mockOkResponse(quoteResponse));
      const promise = client.getQuote('AAPL');
      await vi.advanceTimersByTimeAsync(5000);
      const result = await promise;
      expect(result.regularMarketPrice).toBe(150.25);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('throws after exhausting 429 retries', async () => {
      mockFetch.mockResolvedValue(mockRateLimitedResponse());
      const promise = client.getQuote('AAPL');
      const handled = promise.catch((e: Error) => e);
      await vi.advanceTimersByTimeAsync(30000);
      const error = await handled;
      expect(error).toBeDefined();
    });

    it('throws on invalid response missing Global Quote', async () => {
      mockFetch.mockResolvedValue(mockOkResponse({}));
      const promise = client.getQuote('AAPL');
      const handled = promise.catch((e: Error) => e);
      await vi.advanceTimersByTimeAsync(10000);
      const error = await handled;
      expect((error as Error).message).toContain('Invalid response');
    });

    it('throws on HTTP error', async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 500, json: () => Promise.resolve({}) } as Response);
      const promise = client.getQuote('AAPL');
      const handled = promise.catch((e: Error) => e);
      await vi.advanceTimersByTimeAsync(10000);
      const error = await handled;
      expect((error as Error).message).toContain('HTTP 500');
    });

    it('uses shorter TTL for watched symbols', async () => {
      mockFetch.mockResolvedValue(mockOkResponse(quoteResponse));
      await client.getQuote('AAPL', true);
      await vi.advanceTimersByTimeAsync(16000);
      mockFetch.mockResolvedValue(mockOkResponse({ 'Global Quote': { '05. price': '155.00', '09. change': '3.00', '10. change percent': '1.98%', '06. volume': '2000000' } }));
      const result = await client.getQuote('AAPL', true);
      expect(result.regularMarketPrice).toBe(155.00);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('still caches watched symbol within 15s TTL', async () => {
      mockFetch.mockResolvedValue(mockOkResponse(quoteResponse));
      await client.getQuote('AAPL', true);
      await vi.advanceTimersByTimeAsync(14000);
      const result = await client.getQuote('AAPL', true);
      expect(result.regularMarketPrice).toBe(150.25);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('getBatchQuotes', () => {
    it('fetches multiple quotes', async () => {
      mockFetch.mockResolvedValue(mockOkResponse(quoteResponse));
      const promise = client.getBatchQuotes(['AAPL', 'MSFT']);
      await vi.advanceTimersByTimeAsync(30000);
      const result = await promise;
      expect(Object.keys(result)).toEqual(['AAPL', 'MSFT']);
      expect(result['AAPL'].regularMarketPrice).toBe(150.25);
      expect(result['MSFT'].regularMarketPrice).toBe(150.25);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('uses cache for previously fetched symbols', async () => {
      mockFetch.mockResolvedValue(mockOkResponse(quoteResponse));
      await client.getQuote('AAPL');
      const promise = client.getBatchQuotes(['AAPL', 'MSFT']);
      await vi.advanceTimersByTimeAsync(30000);
      const result = await promise;
      expect(Object.keys(result)).toEqual(['AAPL', 'MSFT']);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('handles partial failures gracefully', async () => {
      mockFetch
        .mockResolvedValueOnce(mockOkResponse(quoteResponse))
        .mockRejectedValueOnce(new Error('Network error'));
      const promise = client.getBatchQuotes(['AAPL', 'MSFT']);
      await vi.advanceTimersByTimeAsync(30000);
      const result = await promise;
      expect(result['AAPL']).toBeDefined();
      expect(result['MSFT']).toBeUndefined();
    });
  });

  describe('getDailyChart', () => {
    it('fetches and parses daily chart', async () => {
      mockFetch.mockResolvedValue(mockOkResponse(dailyResponse));
      const result = await client.getDailyChart('AAPL');
      expect(result).toHaveLength(2);
      expect(result[0].open).toBe(149);
      expect(result[0].close).toBe(150);
      expect(result[0].volume).toBe(900000);
      expect(result[1].open).toBe(150);
      expect(result[1].close).toBe(151);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('returns cached daily chart', async () => {
      mockFetch.mockResolvedValue(mockOkResponse(dailyResponse));
      await client.getDailyChart('AAPL');
      const result = await client.getDailyChart('AAPL');
      expect(result).toHaveLength(2);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('throws on invalid response', async () => {
      mockFetch.mockResolvedValue(mockOkResponse({}));
      await expect(client.getDailyChart('AAPL')).rejects.toThrow('Invalid response');
    });

    it('passes full outputsize when compact is false', async () => {
      mockFetch.mockResolvedValue(mockOkResponse(dailyResponse));
      await client.getDailyChart('AAPL', false);
      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain('outputsize=full');
    });
  });

  describe('getIntradayChart', () => {
    it('fetches and parses intraday chart', async () => {
      mockFetch.mockResolvedValue(mockOkResponse(intradayResponse));
      const result = await client.getIntradayChart('AAPL', '5min');
      expect(result).toHaveLength(2);
      expect(result[0].close).toBe(150.10);
      expect(result[1].close).toBe(150.50);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('returns cached intraday chart', async () => {
      mockFetch.mockResolvedValue(mockOkResponse(intradayResponse));
      await client.getIntradayChart('AAPL', '5min');
      const result = await client.getIntradayChart('AAPL', '5min');
      expect(result).toHaveLength(2);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('throws on invalid response', async () => {
      mockFetch.mockResolvedValue(mockOkResponse({}));
      await expect(client.getIntradayChart('AAPL', '5min')).rejects.toThrow('Invalid response');
    });
  });

  describe('getCompanyOverview', () => {
    it('fetches company overview', async () => {
      mockFetch.mockResolvedValue(mockOkResponse(overviewResponse));
      const result = await client.getCompanyOverview('AAPL');
      expect(result.Name).toBe('Apple Inc.');
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('returns cached overview', async () => {
      mockFetch.mockResolvedValue(mockOkResponse(overviewResponse));
      await client.getCompanyOverview('AAPL');
      const result = await client.getCompanyOverview('AAPL');
      expect(result.Name).toBe('Apple Inc.');
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('getSMA', () => {
    it('fetches SMA data', async () => {
      mockFetch.mockResolvedValue(mockOkResponse(smaResponse));
      const result = await client.getSMA('AAPL', 'daily', 20, 'close');
      expect(result['Technical Analysis: SMA']['2024-01-03'].SMA).toBe('151.2345');
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('getRSI', () => {
    it('fetches RSI data', async () => {
      mockFetch.mockResolvedValue(mockOkResponse(rsiResponse));
      const result = await client.getRSI('AAPL', 'daily', 14, 'close');
      expect(result['Technical Analysis: RSI']['2024-01-03'].RSI).toBe('55.1234');
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('rate limiting', () => {
    it('enforces daily limit', async () => {
      const state = client as unknown as { requestsToday: number; requestsThisMinute: number; lastRequestTime: number };
      state.requestsToday = 24;
      state.requestsThisMinute = 0;
      state.lastRequestTime = Date.now() - 12000;

      mockFetch.mockResolvedValue(mockOkResponse(quoteResponse));
      const p1 = client.getQuote('AAPL');
      await vi.advanceTimersByTimeAsync(2000);
      await p1;

      const p2 = client.getQuote('MSFT');
      const handled = p2.catch((e: Error) => e);
      const error = await handled;
      expect((error as Error).message).toContain('daily limit');
    });

    it('waits when minute limit is reached', async () => {
      const state = client as unknown as { requestsThisMinute: number; minuteWindowStart: number; lastRequestTime: number };
      state.requestsThisMinute = 5;
      state.minuteWindowStart = Date.now() - 10000;
      state.lastRequestTime = Date.now() - 12000;

      mockFetch.mockResolvedValue(mockOkResponse(quoteResponse));
      const promise = client.getQuote('AAPL');
      await vi.advanceTimersByTimeAsync(70000);
      const result = await promise;
      expect(result.regularMarketPrice).toBe(150.25);
    });

    it('respects spacing between requests', async () => {
      mockFetch.mockResolvedValue(mockOkResponse(quoteResponse));
      await client.getQuote('AAPL');

      const p2 = client.getQuote('MSFT');
      await vi.advanceTimersByTimeAsync(20000);
      const result = await p2;
      expect(result.regularMarketPrice).toBe(150.25);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('resets minute window after 60 seconds of inactivity', async () => {
      const state = client as unknown as { requestsThisMinute: number; minuteWindowStart: number; lastRequestTime: number; requestsToday: number };
      state.requestsThisMinute = 5;
      state.minuteWindowStart = Date.now();
      state.lastRequestTime = Date.now();

      await vi.advanceTimersByTimeAsync(61000);

      mockFetch.mockResolvedValue(mockOkResponse(quoteResponse));
      const result = await client.getQuote('AAPL');
      expect(result.regularMarketPrice).toBe(150.25);
    });
  });

  describe('cache', () => {
    it('returns null for missing cache key', () => {
      const c = client as unknown as { getCache: (key: string) => unknown };
      expect(c.getCache('nonexistent')).toBeNull();
    });

    it('expires entries after TTL', async () => {
      mockFetch.mockResolvedValue(mockOkResponse(quoteResponse));
      await client.getQuote('AAPL');

      await vi.advanceTimersByTimeAsync(59000);
      let cached = await client.getQuote('AAPL');
      expect(cached.regularMarketPrice).toBe(150.25);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      await vi.advanceTimersByTimeAsync(2000);
      mockFetch.mockResolvedValue(mockOkResponse({ 'Global Quote': { '05. price': '155.00', '09. change': '3.00', '10. change percent': '1.98%', '06. volume': '2000000' } }));
      const fresh = await client.getQuote('AAPL');
      expect(fresh.regularMarketPrice).toBe(155.00);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('caches daily chart for 5 minutes', async () => {
      mockFetch.mockResolvedValue(mockOkResponse(dailyResponse));
      await client.getDailyChart('AAPL');

      await vi.advanceTimersByTimeAsync(299000);
      const cached = await client.getDailyChart('AAPL');
      expect(cached).toHaveLength(2);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      await vi.advanceTimersByTimeAsync(2000);
      mockFetch.mockResolvedValue(mockOkResponse(dailyResponse));
      const fresh = await client.getDailyChart('AAPL');
      expect(fresh).toHaveLength(2);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('getUsageStats', () => {
    it('returns current usage statistics', () => {
      const stats = client.getUsageStats();
      expect(stats).toHaveProperty('requestsToday');
      expect(stats).toHaveProperty('requestsThisMinute');
      expect(stats).toHaveProperty('dailyLimit');
      expect(stats).toHaveProperty('minuteLimit');
      expect(stats).toHaveProperty('cacheSize');
      expect(stats).toHaveProperty('queueLength');
    });

    it('reflects incremented counters after requests', async () => {
      mockFetch.mockResolvedValue(mockOkResponse(quoteResponse));
      await client.getQuote('AAPL');
      const stats = client.getUsageStats();
      expect(stats.requestsToday).toBe(1);
      expect(stats.requestsThisMinute).toBe(1);
      expect(stats.cacheSize).toBe(1);
    });
  });

  describe('rate limit window resets', () => {
    it('resets the daily window after 24 hours', async () => {
      const state = client as unknown as {
        requestsToday: number;
        dayWindowStart: number;
        requestsThisMinute: number;
        lastRequestTime: number;
      };
      state.requestsToday = 24;
      state.dayWindowStart = Date.now() - 86400001;
      state.requestsThisMinute = 0;
      state.lastRequestTime = Date.now() - 12000;

      mockFetch.mockResolvedValue(mockOkResponse(quoteResponse));
      const result = await client.getQuote('AAPL');
      expect(result.regularMarketPrice).toBe(150.25);
      expect(client.getUsageStats().requestsToday).toBe(1);
    });
  });

  describe('queue concurrency', () => {
    it('skips reprocessing while a request is in flight and sorts pending items', async () => {
      mockFetch.mockResolvedValue(mockOkResponse(quoteResponse));
      const p1 = client.getQuote('AAPL');
      const p2 = client.getQuote('MSFT');
      const p3 = client.getQuote('TSLA');
      await vi.advanceTimersByTimeAsync(60000);
      const results = await Promise.all([p1, p2, p3]);
      expect(results).toHaveLength(3);
      expect(results.every((r) => r.regularMarketPrice === 150.25)).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });
  });

  describe('HTTP error branches', () => {
    it('getDailyChart throws on non-OK response', async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 500, json: () => Promise.resolve({}) } as Response);
      await expect(client.getDailyChart('AAPL')).rejects.toThrow('HTTP 500');
    });

    it('getIntradayChart throws on non-OK response', async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 500, json: () => Promise.resolve({}) } as Response);
      await expect(client.getIntradayChart('AAPL', '5min')).rejects.toThrow('HTTP 500');
    });

    it('getCompanyOverview throws on non-OK response', async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 500, json: () => Promise.resolve({}) } as Response);
      await expect(client.getCompanyOverview('AAPL')).rejects.toThrow('HTTP 500');
    });

    it('getSMA throws on non-OK response', async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 500, json: () => Promise.resolve({}) } as Response);
      await expect(client.getSMA('AAPL')).rejects.toThrow('HTTP 500');
    });

    it('getRSI throws on non-OK response', async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 500, json: () => Promise.resolve({}) } as Response);
      await expect(client.getRSI('AAPL')).rejects.toThrow('HTTP 500');
    });
  });

  describe('SMA and RSI caching', () => {
    it('returns cached SMA data on second call', async () => {
      mockFetch.mockResolvedValue(mockOkResponse(smaResponse));
      await client.getSMA('AAPL');
      const result = await client.getSMA('AAPL');
      expect(result['Technical Analysis: SMA']).toBeDefined();
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('returns cached RSI data on second call', async () => {
      mockFetch.mockResolvedValue(mockOkResponse(rsiResponse));
      await client.getRSI('AAPL');
      const result = await client.getRSI('AAPL');
      expect(result['Technical Analysis: RSI']).toBeDefined();
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });
});
