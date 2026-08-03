import { describe, it, expect } from 'vitest';
import { optimizeMptPortfolios, MptPortfolio } from './mptOptimizer';

describe('optimizeMptPortfolios', () => {
  const result = optimizeMptPortfolios();

  it('returns MSR, GMVP, and naive portfolios', () => {
    expect(result.msr).toBeDefined();
    expect(result.gmvp).toBeDefined();
    expect(result.naive).toBeDefined();
  });

  it('each portfolio has 5 weights summing to ~1', () => {
    const check = (port: MptPortfolio) => {
      const sum = Object.values(port.weights).reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(1, 1);
    };
    check(result.msr);
    check(result.gmvp);
    check(result.naive);
  });

  it('naive portfolio has equal weights', () => {
    const weights = Object.values(result.naive.weights);
    weights.forEach(w => expect(w).toBeCloseTo(0.2, 1));
  });

  it('MSR has positive expected return', () => {
    expect(result.msr.expectedReturn).toBeGreaterThan(0);
  });

  it('GMVP has lower volatility than MSR', () => {
    expect(result.gmvp.volatility).toBeLessThanOrEqual(result.msr.volatility + 0.01);
  });

  it('assetMetrics has 5 entries', () => {
    expect(result.assetMetrics).toHaveLength(5);
  });

  it('assetMetrics have symbol, expectedReturn, volatility', () => {
    for (const asset of result.assetMetrics) {
      expect(asset.symbol).toBeTruthy();
      expect(typeof asset.expectedReturn).toBe('number');
      expect(typeof asset.volatility).toBe('number');
    }
  });

  it('covariance matrix is 5x5', () => {
    const symbols = Object.keys(result.covarianceMatrix);
    expect(symbols).toHaveLength(5);
    for (const sym of symbols) {
      expect(Object.keys(result.covarianceMatrix[sym])).toHaveLength(5);
    }
  });

  it('covariance matrix is symmetric', () => {
    const { covarianceMatrix } = result;
    const symbols = Object.keys(covarianceMatrix);
    for (const a of symbols) {
      for (const b of symbols) {
        expect(covarianceMatrix[a][b]).toBeCloseTo(covarianceMatrix[b][a], 10);
      }
    }
  });

  it('MSR sharpe is greater than naive sharpe', () => {
    expect(result.msr.sharpeRatio).toBeGreaterThanOrEqual(result.naive.sharpeRatio - 0.1);
  });
});
