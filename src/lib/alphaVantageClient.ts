type CacheEntry<T> = { data: T; timestamp: number; ttl: number };
type QueueItem = { fn: () => Promise<any>; priority: number; resolve: (v: any) => void; reject: (e: any) => void };

const RATE_LIMITS = {
  free: { perDay: 25, perMinute: 5 },
  premium_50: { perDay: Infinity, perMinute: 75 },
  premium_100: { perDay: Infinity, perMinute: 150 },
  premium_250: { perDay: Infinity, perMinute: 300 },
} as const;

export class AlphaVantageClient {
  private cache = new Map<string, CacheEntry<any>>();
  private requestQueue: QueueItem[] = [];
  private isProcessing = false;
  private requestsThisMinute = 0;
  private requestsToday = 0;
  private minuteWindowStart = Date.now();
  private dayWindowStart = Date.now();
  private lastRequestTime = 0;
  private minDelayBetweenRequests: number;

  constructor(
    private apiKey: string,
    private tier: keyof typeof RATE_LIMITS = 'free',
    private baseUrl: string = '/api/alphavantage'
  ) {
    const limits = RATE_LIMITS[tier] || RATE_LIMITS.free;
    this.minDelayBetweenRequests = Math.ceil(60000 / limits.perMinute);
  }

  private getCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  private setCache<T>(key: string, data: T, ttlMs: number) {
    this.cache.set(key, { data, timestamp: Date.now(), ttl: ttlMs });
  }

  private async checkRateLimit(): Promise<void> {
    const now = Date.now();
    const limits = RATE_LIMITS[this.tier] || RATE_LIMITS.free;

    if (now - this.minuteWindowStart >= 60000) {
      this.minuteWindowStart = now;
      this.requestsThisMinute = 0;
    }

    if (now - this.dayWindowStart >= 86400000) {
      this.dayWindowStart = now;
      this.requestsToday = 0;
    }

    if (this.requestsToday >= limits.perDay) {
      throw new Error(
        `Alpha Vantage daily limit reached (${limits.perDay} requests). Upgrade to premium for unlimited daily requests.`
      );
    }

    if (this.requestsThisMinute >= limits.perMinute) {
      const waitMs = 60000 - (now - this.minuteWindowStart);
      await new Promise((r) => setTimeout(r, Math.max(waitMs, 1000)));
      this.minuteWindowStart = Date.now();
      this.requestsThisMinute = 0;
    }

    const elapsed = now - this.lastRequestTime;
    if (elapsed < this.minDelayBetweenRequests) {
      await new Promise((r) => setTimeout(r, this.minDelayBetweenRequests - elapsed));
    }
  }

  private async processQueue() {
    if (this.isProcessing || this.requestQueue.length === 0) return;
    this.isProcessing = true;

    while (this.requestQueue.length > 0) {
      this.requestQueue.sort((a, b) => b.priority - a.priority);
      const item = this.requestQueue.shift()!;
      try {
        await this.checkRateLimit();
        this.requestsThisMinute++;
        this.requestsToday++;
        this.lastRequestTime = Date.now();
        const result = await item.fn();
        item.resolve(result);
      } catch (e) {
        item.reject(e);
      }
    }
    this.isProcessing = false;
  }

  private enqueue<T>(fn: () => Promise<T>, priority = 0): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ fn, priority, resolve, reject });
      this.processQueue();
    });
  }

  async getQuote(symbol: string, isWatched = false): Promise<StockQuote> {
    const cacheKey = `quote:${symbol}`;
    const ttl = isWatched ? 15000 : 60000;
    const cached = this.getCache<StockQuote>(cacheKey);
    if (cached) return cached;

    return this.enqueue(async () => {
      let attempts = 0;
      while (attempts < 3) {
        try {
          const res = await fetch(`${this.baseUrl}/quote/${symbol}`);
          if (res.status === 429) {
            attempts++;
            await new Promise((r) => setTimeout(r, 2000 * attempts));
            continue;
          }
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          const gq = data['Global Quote'];
          if (!gq || !gq['05. price']) throw new Error('Invalid response');
          const price = parseFloat(gq['05. price']);
          const change = parseFloat(gq['09. change']);
          const changePct = parseFloat(gq['10. change percent']?.replace('%', '') || '0');
          const volume = parseInt(gq['06. volume'] || '0');
          const quote: StockQuote = {
            symbol,
            shortName: symbol,
            regularMarketPrice: price,
            regularMarketChange: change,
            regularMarketChangePercent: changePct,
            regularMarketVolume: volume,
            bid: price - 0.02,
            ask: price + 0.02,
          };
          this.setCache(cacheKey, quote, ttl);
          return quote;
        } catch (e) {
          attempts++;
          if (attempts >= 3) throw e;
          await new Promise((r) => setTimeout(r, 1000 * attempts));
        }
      }
      throw new Error('Failed after retries');
    }, isWatched ? 2 : 1);
  }

  async getBatchQuotes(symbols: string[]): Promise<Record<string, StockQuote>> {
    const results: Record<string, StockQuote> = {};
    const uncached = symbols.filter((s) => {
      const cached = this.getCache<StockQuote>(`quote:${s}`);
      if (cached) {
        results[s] = cached;
        return false;
      }
      return true;
    });

    for (const sym of uncached) {
      try {
        results[sym] = await this.getQuote(sym, true);
      } catch (e) {
        console.warn(`Failed to fetch quote for ${sym}:`, e);
      }
    }
    return results;
  }

  async getDailyChart(symbol: string, compact = true): Promise<OHLCPoint[]> {
    const cacheKey = `chart:${symbol}:${compact ? 'compact' : 'full'}`;
    const cached = this.getCache<OHLCPoint[]>(cacheKey);
    if (cached) return cached;

    return this.enqueue(async () => {
      const params = new URLSearchParams({
        function: 'TIME_SERIES_DAILY',
        symbol,
        outputsize: compact ? 'compact' : 'full',
        apikey: this.apiKey,
      });
      const res = await fetch(`${this.baseUrl}/query?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const ts = data['Time Series (Daily)'];
      if (!ts) throw new Error('Invalid response');
      const dates = Object.keys(ts).sort(
        (a, b) => new Date(a).getTime() - new Date(b).getTime()
      );
      const points: OHLCPoint[] = dates.slice(-30).map((date) => {
        const d = ts[date];
        return {
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }),
          open: parseFloat(d['1. open']),
          high: parseFloat(d['2. high']),
          low: parseFloat(d['3. low']),
          close: parseFloat(d['4. close']),
          volume: parseInt(d['5. volume']),
        };
      });
      this.setCache(cacheKey, points, 300000);
      return points;
    }, 1);
  }

  async getIntradayChart(symbol: string, interval: '1min' | '5min' | '15min' | '30min' | '60min' = '5min'): Promise<OHLCPoint[]> {
    const cacheKey = `intraday:${symbol}:${interval}`;
    const cached = this.getCache<OHLCPoint[]>(cacheKey);
    if (cached) return cached;

    return this.enqueue(async () => {
      const params = new URLSearchParams({
        function: 'TIME_SERIES_INTRADAY',
        symbol,
        interval,
        outputsize: 'compact',
        apikey: this.apiKey,
      });
      const res = await fetch(`${this.baseUrl}/query?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const key = `Time Series (${interval})`;
      const ts = data[key];
      if (!ts) throw new Error('Invalid response');
      const times = Object.keys(ts).sort(
        (a, b) => new Date(a).getTime() - new Date(b).getTime()
      );
      const points: OHLCPoint[] = times.slice(-78).map((time) => {
        const d = ts[time];
        const dt = new Date(time);
        return {
          date: dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          open: parseFloat(d['1. open']),
          high: parseFloat(d['2. high']),
          low: parseFloat(d['3. low']),
          close: parseFloat(d['4. close']),
          volume: parseInt(d['5. volume']),
        };
      });
      this.setCache(cacheKey, points, 30000);
      return points;
    }, 2);
  }

  async getCompanyOverview(symbol: string) {
    const cacheKey = `overview:${symbol}`;
    const cached = this.getCache<any>(cacheKey);
    if (cached) return cached;

    return this.enqueue(async () => {
      const params = new URLSearchParams({
        function: 'OVERVIEW',
        symbol,
        apikey: this.apiKey,
      });
      const res = await fetch(`${this.baseUrl}/query?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      this.setCache(cacheKey, data, 86400000);
      return data;
    }, 0);
  }

  async getSMA(symbol: string, interval: 'daily' | 'weekly' | 'monthly' = 'daily', timePeriod = 20, seriesType: 'close' | 'open' | 'high' | 'low' = 'close') {
    const cacheKey = `sma:${symbol}:${interval}:${timePeriod}:${seriesType}`;
    const cached = this.getCache<any>(cacheKey);
    if (cached) return cached;

    return this.enqueue(async () => {
      const params = new URLSearchParams({
        function: 'SMA',
        symbol,
        interval,
        time_period: timePeriod.toString(),
        series_type: seriesType,
        apikey: this.apiKey,
      });
      const res = await fetch(`${this.baseUrl}/query?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      this.setCache(cacheKey, data, 300000);
      return data;
    }, 0);
  }

  async getRSI(symbol: string, interval: 'daily' | 'weekly' | 'monthly' = 'daily', timePeriod = 14, seriesType: 'close' | 'open' | 'high' | 'low' = 'close') {
    const cacheKey = `rsi:${symbol}:${interval}:${timePeriod}:${seriesType}`;
    const cached = this.getCache<any>(cacheKey);
    if (cached) return cached;

    return this.enqueue(async () => {
      const params = new URLSearchParams({
        function: 'RSI',
        symbol,
        interval,
        time_period: timePeriod.toString(),
        series_type: seriesType,
        apikey: this.apiKey,
      });
      const res = await fetch(`${this.baseUrl}/query?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      this.setCache(cacheKey, data, 300000);
      return data;
    }, 0);
  }

  getUsageStats() {
    const limits = RATE_LIMITS[this.tier] || RATE_LIMITS.free;
    return {
      requestsToday: this.requestsToday,
      requestsThisMinute: this.requestsThisMinute,
      dailyLimit: limits.perDay,
      minuteLimit: limits.perMinute,
      cacheSize: this.cache.size,
      queueLength: this.requestQueue.length,
    };
  }
}

export interface StockQuote {
  symbol: string;
  shortName?: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  bid?: number;
  ask?: number;
  regularMarketVolume?: number;
}

export interface OHLCPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export const alphaVantage = new AlphaVantageClient(
  ((import.meta as any).env?.VITE_ALPHA_VANTAGE_API_KEY as string) || 'demo',
  (((import.meta as any).env?.VITE_ALPHA_VANTAGE_TIER as keyof typeof RATE_LIMITS)) || 'free'
);
