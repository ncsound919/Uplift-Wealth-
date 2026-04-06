import { PortfolioAsset, Transaction } from '../types';

export interface PortfolioAnalytics {
  totalValue: number;
  totalCost: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  diversificationScore: number;
  riskScore: number;
  sharpeRatio: number;
  volatility: number;
  bestPerformer: { symbol: string; gain: number } | null;
  worstPerformer: { symbol: string; loss: number } | null;
  assetAllocation: {
    stocks: number;
    crypto: number;
    bonds: number;
    cash: number;
  };
  monthlyReturns: { month: string; return: number }[];
  performanceMetrics: {
    dayChange: number;
    weekChange: number;
    monthChange: number;
    yearChange: number;
  };
}

export interface WealthBuildingStrategy {
  id: string;
  name: string;
  description: string;
  riskLevel: 'conservative' | 'moderate' | 'aggressive';
  recommendedAllocation: {
    stocks: number;
    crypto: number;
    bonds: number;
    cash: number;
  };
  targetReturn: number;
  timeHorizon: string;
  suitableFor: string[];
}

class PortfolioAnalyticsService {
  // Calculate comprehensive portfolio analytics
  calculateAnalytics(
    assets: PortfolioAsset[],
    transactions: Transaction[]
  ): PortfolioAnalytics {
    const totalValue = assets.reduce((sum, asset) => sum + asset.valueUSD, 0);

    // Calculate total cost from buy transactions
    const totalCost = transactions
      .filter(t => t.type === 'buy')
      .reduce((sum, t) => sum + (t.amount * t.price), 0) || totalValue * 0.95; // Fallback if no transactions

    const totalGainLoss = totalValue - totalCost;
    const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

    // Calculate diversification score (0-100)
    const diversificationScore = this.calculateDiversification(assets);

    // Calculate risk score based on asset allocation
    const riskScore = this.calculateRiskScore(assets);

    // Calculate Sharpe Ratio (simplified)
    const sharpeRatio = this.calculateSharpeRatio(totalGainLossPercent);

    // Calculate volatility
    const volatility = this.calculateVolatility(transactions);

    // Find best and worst performers
    const { bestPerformer, worstPerformer } = this.findPerformers(assets, transactions);

    // Calculate asset allocation percentages
    const assetAllocation = this.calculateAssetAllocation(assets, totalValue);

    // Generate monthly returns (simulated)
    const monthlyReturns = this.generateMonthlyReturns();

    // Calculate performance metrics
    const performanceMetrics = this.calculatePerformanceMetrics(totalValue, transactions);

    return {
      totalValue,
      totalCost,
      totalGainLoss,
      totalGainLossPercent,
      diversificationScore,
      riskScore,
      sharpeRatio,
      volatility,
      bestPerformer,
      worstPerformer,
      assetAllocation,
      monthlyReturns,
      performanceMetrics
    };
  }

  private calculateDiversification(assets: PortfolioAsset[]): number {
    if (assets.length === 0) return 0;

    const assetTypes = new Set(assets.map(a => a.assetType));
    const uniqueAssets = new Set(assets.map(a => a.ticker));

    // Score based on: number of asset types (0-40) + number of unique assets (0-60)
    const typeScore = Math.min(assetTypes.size * 10, 40);
    const assetScore = Math.min(uniqueAssets.size * 6, 60);

    return typeScore + assetScore;
  }

  private calculateRiskScore(assets: PortfolioAsset[]): number {
    if (assets.length === 0) return 50;

    const totalValue = assets.reduce((sum, a) => sum + a.valueUSD, 0);

    // Risk weights: crypto (high), stocks (medium), bonds (low), cash (minimal)
    const riskWeights = { crypto: 8, stocks: 5, bonds: 2, cash: 1 };

    const weightedRisk = assets.reduce((sum, asset) => {
      const weight = riskWeights[asset.assetType] || 5;
      const allocation = asset.valueUSD / totalValue;
      return sum + (weight * allocation * 10);
    }, 0);

    return Math.min(weightedRisk, 100);
  }

  private calculateSharpeRatio(returnPercent: number): number {
    // Simplified Sharpe Ratio: (Return - Risk-free rate) / Standard Deviation
    // Assuming 2% risk-free rate and estimated volatility
    const riskFreeRate = 2;
    const estimatedVolatility = 15;

    return (returnPercent - riskFreeRate) / estimatedVolatility;
  }

  private calculateVolatility(transactions: Transaction[]): number {
    const relevantTransactions = transactions
      .filter(t => t.type === 'buy' || t.type === 'sell')
      .slice()
      .sort((a, b) => {
        const getTimestamp = (value: unknown): number => {
          if (value instanceof Date) return value.getTime();
          if (typeof value === 'number') return value;
          if (typeof value === 'string') return new Date(value).getTime();
          if (value && typeof value === 'object') {
            const dateValue = value as { toDate?: () => Date; seconds?: number };
            if (typeof dateValue.toDate === 'function') {
              return dateValue.toDate().getTime();
            }
            if (typeof dateValue.seconds === 'number') {
              return dateValue.seconds * 1000;
            }
          }
          return 0;
        };

        return getTimestamp(a.date) - getTimestamp(b.date);
      });

    if (relevantTransactions.length < 2) return 0;

    // Calculate returns between chronologically ordered transactions
    const returns = relevantTransactions
      .slice(1)
      .map((t, i) => {
        const prevValue = relevantTransactions[i].amount * relevantTransactions[i].price;
        const currValue = t.amount * t.price;

        if (prevValue <= 0) return null;

        return ((currValue - prevValue) / prevValue) * 100;
      })
      .filter((r): r is number => r !== null && Number.isFinite(r));

    if (returns.length === 0) return 0;
    // Calculate standard deviation
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;

    return Math.sqrt(variance);
  }

  private findPerformers(
    assets: PortfolioAsset[],
    transactions: Transaction[]
  ): {
    bestPerformer: { symbol: string; gain: number } | null;
    worstPerformer: { symbol: string; loss: number } | null;
  } {
    const performance = assets.map(asset => {
      const buyTransactions = transactions.filter(
        t => t.type === 'buy' && t.asset === asset.ticker
      );

      const totalCost = buyTransactions.reduce((sum, t) => sum + (t.amount * t.price), 0);
      const gainLoss = totalCost > 0 ? asset.valueUSD - totalCost : 0;

      return { symbol: asset.ticker, gainLoss };
    });

    const sorted = performance.sort((a, b) => b.gainLoss - a.gainLoss);

    return {
      bestPerformer: sorted.length > 0 && sorted[0].gainLoss > 0
        ? { symbol: sorted[0].symbol, gain: sorted[0].gainLoss }
        : null,
      worstPerformer: sorted.length > 0 && sorted[sorted.length - 1].gainLoss < 0
        ? { symbol: sorted[sorted.length - 1].symbol, loss: sorted[sorted.length - 1].gainLoss }
        : null
    };
  }

  private calculateAssetAllocation(
    assets: PortfolioAsset[],
    totalValue: number
  ): { stocks: number; crypto: number; bonds: number; cash: number } {
    const allocation = { stocks: 0, crypto: 0, bonds: 0, cash: 0 };

    if (totalValue === 0) return allocation;

    assets.forEach(asset => {
      allocation[asset.assetType] += (asset.valueUSD / totalValue) * 100;
    });

    return allocation;
  }

  private generateMonthlyReturns(): { month: string; return: number }[] {
    // Generate last 12 months of returns (simulated)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();

    return Array.from({ length: 12 }, (_, i) => {
      const monthIndex = (currentMonth - 11 + i + 12) % 12;
      return {
        month: months[monthIndex],
        return: (Math.random() - 0.3) * 20 // -6% to +14% range
      };
    });
  }

  private calculatePerformanceMetrics(
    _currentValue: number,
    _transactions: Transaction[]
  ): { dayChange: number; weekChange: number; monthChange: number; yearChange: number } {
    // Simplified calculation - in real app would use historical data
    return {
      dayChange: (Math.random() - 0.45) * 4, // -1.8% to +2.2%
      weekChange: (Math.random() - 0.4) * 8, // -3.2% to +4.8%
      monthChange: (Math.random() - 0.35) * 15, // -5.25% to +9.75%
      yearChange: (Math.random() - 0.2) * 40 // -8% to +32%
    };
  }

  // Wealth building strategies
  getWealthBuildingStrategies(): WealthBuildingStrategy[] {
    return [
      {
        id: 'conservative',
        name: 'Conservative Growth',
        description: 'Low-risk strategy focused on preserving capital while generating modest returns through bonds and dividend stocks.',
        riskLevel: 'conservative',
        recommendedAllocation: {
          stocks: 30,
          crypto: 0,
          bonds: 50,
          cash: 20
        },
        targetReturn: 5,
        timeHorizon: '1-3 years',
        suitableFor: ['Near retirement', 'Risk-averse investors', 'Short-term goals']
      },
      {
        id: 'balanced',
        name: 'Balanced Portfolio',
        description: 'Moderate risk with a mix of stocks and bonds, suitable for medium-term wealth building.',
        riskLevel: 'moderate',
        recommendedAllocation: {
          stocks: 50,
          crypto: 5,
          bonds: 30,
          cash: 15
        },
        targetReturn: 8,
        timeHorizon: '3-7 years',
        suitableFor: ['Mid-career professionals', 'Balanced risk tolerance', 'Medium-term goals']
      },
      {
        id: 'growth',
        name: 'Growth-Focused',
        description: 'Higher risk strategy emphasizing stocks and some alternative investments for long-term growth.',
        riskLevel: 'moderate',
        recommendedAllocation: {
          stocks: 70,
          crypto: 10,
          bonds: 10,
          cash: 10
        },
        targetReturn: 12,
        timeHorizon: '7-15 years',
        suitableFor: ['Young professionals', 'Long-term investors', 'Retirement planning']
      },
      {
        id: 'aggressive',
        name: 'Aggressive Growth',
        description: 'Maximum growth potential through high-risk assets including growth stocks and cryptocurrency.',
        riskLevel: 'aggressive',
        recommendedAllocation: {
          stocks: 60,
          crypto: 25,
          bonds: 5,
          cash: 10
        },
        targetReturn: 18,
        timeHorizon: '10+ years',
        suitableFor: ['Young investors', 'High risk tolerance', 'Long time horizon']
      },
      {
        id: 'income',
        name: 'Income Generation',
        description: 'Focus on generating steady income through dividend-paying stocks and bonds.',
        riskLevel: 'conservative',
        recommendedAllocation: {
          stocks: 40,
          crypto: 0,
          bonds: 45,
          cash: 15
        },
        targetReturn: 6,
        timeHorizon: '3-10 years',
        suitableFor: ['Income-focused investors', 'Retirees', 'Passive income seekers']
      }
    ];
  }

  // Recommend strategy based on user profile
  recommendStrategy(
    age: number,
    riskTolerance: 'low' | 'medium' | 'high',
    timeHorizon: number
  ): WealthBuildingStrategy {
    const strategies = this.getWealthBuildingStrategies();

    if (riskTolerance === 'low' || age > 55) {
      return strategies.find(s => s.id === 'conservative')!;
    }

    if (riskTolerance === 'high' && age < 35 && timeHorizon > 10) {
      return strategies.find(s => s.id === 'aggressive')!;
    }

    if (timeHorizon > 7) {
      return strategies.find(s => s.id === 'growth')!;
    }

    return strategies.find(s => s.id === 'balanced')!;
  }
}

export const portfolioAnalyticsService = new PortfolioAnalyticsService();
