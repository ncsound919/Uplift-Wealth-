// Market data service for real-time price updates
// Using a mock implementation that simulates real-time data
// In production, integrate with actual APIs like Alpha Vantage, Yahoo Finance, or CoinGecko

export interface MarketPrice {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: Date;
}

export interface MarketData {
  stocks: Map<string, MarketPrice>;
  crypto: Map<string, MarketPrice>;
}

class MarketDataService {
  private data: MarketData = {
    stocks: new Map(),
    crypto: new Map()
  };

  private subscribers: Set<(data: MarketData) => void> = new Set();
  private updateInterval: number | null = null;

  // Base prices for simulation
  private basePrices: Record<string, number> = {
    // Stocks
    'AAPL': 175.00,
    'MSFT': 395.00,
    'GOOGL': 140.00,
    'AMZN': 178.00,
    'TSLA': 245.00,
    'NVDA': 880.00,
    'META': 485.00,
    'SPY': 500.00,
    // Crypto
    'BTC': 43000.00,
    'ETH': 2300.00,
    'BNB': 310.00,
    'SOL': 105.00,
    'ADA': 0.52,
    'DOGE': 0.08
  };

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Initialize with base prices
    Object.entries(this.basePrices).forEach(([symbol, price]) => {
      const marketPrice: MarketPrice = {
        symbol,
        price,
        change: 0,
        changePercent: 0,
        timestamp: new Date()
      };

      if (this.isCrypto(symbol)) {
        this.data.crypto.set(symbol, marketPrice);
      } else {
        this.data.stocks.set(symbol, marketPrice);
      }
    });
  }

  private isCrypto(symbol: string): boolean {
    return ['BTC', 'ETH', 'BNB', 'SOL', 'ADA', 'DOGE'].includes(symbol);
  }

  private simulatePriceUpdate() {
    // Simulate realistic price movements
    const updatePrices = (map: Map<string, MarketPrice>) => {
      map.forEach((_marketPrice, symbol) => {
        const basePrice = this.basePrices[symbol];
        // Random walk with slight upward bias (0.1% - realistic market behavior)
        const changePercent = (Math.random() - 0.48) * 2; // -0.96% to +1.04%
        const change = basePrice * (changePercent / 100);
        const newPrice = basePrice + change;

        map.set(symbol, {
          symbol,
          price: newPrice,
          change,
          changePercent,
          timestamp: new Date()
        });

        // Update base price slightly for next iteration (creates trending behavior)
        this.basePrices[symbol] = newPrice;
      });
    };

    updatePrices(this.data.stocks);
    updatePrices(this.data.crypto);

    // Notify all subscribers
    this.notifySubscribers();
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback(this.data));
  }

  public startRealTimeUpdates(intervalMs: number = 5000) {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.updateInterval = setInterval(() => {
      this.simulatePriceUpdate();
    }, intervalMs);

    // Initial update
    this.notifySubscribers();
  }

  public stopRealTimeUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  public subscribe(callback: (data: MarketData) => void): () => void {
    this.subscribers.add(callback);

    // Start updates if this is the first subscriber
    if (this.subscribers.size === 1) {
      this.startRealTimeUpdates();
    }

    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
      // Stop updates if no more subscribers
      if (this.subscribers.size === 0) {
        this.stopRealTimeUpdates();
      }
    };
  }

  public getPrice(symbol: string): MarketPrice | undefined {
    return this.data.stocks.get(symbol) || this.data.crypto.get(symbol);
  }

  public getCurrentData(): MarketData {
    return this.data;
  }

  // Method to fetch real prices (to be implemented with actual API)
  public async fetchRealPrice(symbol: string, _assetType: 'stock' | 'crypto'): Promise<number> {
    // Placeholder for real API integration
    // Example: Alpha Vantage for stocks, CoinGecko for crypto

    // For now, return simulated price
    const price = this.getPrice(symbol);
    return price?.price || 0;
  }
}

// Export singleton instance
export const marketDataService = new MarketDataService();
