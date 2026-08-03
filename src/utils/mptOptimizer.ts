/**
 * Modern Portfolio Theory (MPT) Optimizer
 * 
 * Computes historical returns, standard deviations, and covariance matrix
 * for five core assets (AAPL, TSLA, JNJ, JPM, BND) over the 10-day price history,
 * then performs a Monte Carlo simulation (N=2000) to identify the mathematically optimal allocations:
 * 1. Maximum Sharpe Ratio Portfolio (MSR) - optimizes risk-adjusted return.
 * 2. Global Minimum Variance Portfolio (GMVP) - minimizes overall portfolio volatility.
 */

export interface MptPortfolio {
  weights: Record<string, number>;
  expectedReturn: number; // daily
  volatility: number;     // daily
  sharpeRatio: number;
}

export interface AssetMetrics {
  symbol: string;
  expectedReturn: number; // daily
  volatility: number;     // daily
}

const SYMBOLS = ['AAPL', 'TSLA', 'JNJ', 'JPM', 'BND'];

// 10-day historical prices from the simulation
const HISTORICAL_PRICES: Record<string, number[]> = {
  AAPL: [180.00, 189.00, 177.66, 179.43, 178.50, 182.00, 169.26, 175.18, 174.50, 178.80],
  TSLA: [220.00, 233.20, 212.21, 237.67, 235.30, 230.10, 207.09, 217.44, 215.20, 222.70],
  JNJ:  [160.00, 160.80, 161.20, 159.60, 166.00, 166.80, 163.46, 165.10, 165.90, 167.50],
  JPM:  [140.00, 141.40, 142.10, 141.25, 141.90, 149.00, 146.02, 147.50, 144.55, 148.10],
  BND:  [75.00, 75.10, 74.35, 74.45, 74.60, 74.50, 75.62, 75.40, 75.55, 75.80],
};

// Income/yield overlays to model total return
const DAILY_YIELD_BND = 0.15 / 75.00; // ~0.002 daily yield
const JNJ_DIVIDEND_DAY = 5;
const JNJ_DIVIDEND_AMOUNT = 1.50;

/**
 * Calculates the daily returns for each asset, accounting for prices and income overlays.
 */
function calculateHistoricalReturns(): Record<string, number[]> {
  const returns: Record<string, number[]> = {};

  SYMBOLS.forEach(symbol => {
    const prices = HISTORICAL_PRICES[symbol];
    const assetReturns: number[] = [];

    for (let t = 1; t < prices.length; t++) {
      let priceReturn = (prices[t] - prices[t - 1]) / prices[t - 1];

      // Add JNJ dividend on Day 5 (which is index 4 in returns)
      if (symbol === 'JNJ' && t === JNJ_DIVIDEND_DAY - 1) {
        priceReturn += JNJ_DIVIDEND_AMOUNT / prices[t - 1];
      }

      // Add BND daily yield
      if (symbol === 'BND') {
        priceReturn += DAILY_YIELD_BND;
      }

      assetReturns.push(priceReturn);
    }
    returns[symbol] = assetReturns;
  });

  return returns;
}

/**
 * Performs full Modern Portfolio Theory optimization based on lookback price histories.
 */
export function optimizeMptPortfolios(): {
  msr: MptPortfolio;
  gmvp: MptPortfolio;
  naive: MptPortfolio;
  assetMetrics: AssetMetrics[];
  covarianceMatrix: Record<string, Record<string, number>>;
} {
  const returns = calculateHistoricalReturns();
  const N_PERIODS = returns['AAPL'].length; // 9 daily return points

  // 1. Calculate Expected Returns (Mean) for each asset
  const expectedReturns: Record<string, number> = {};
  SYMBOLS.forEach(symbol => {
    const sum = returns[symbol].reduce((acc, r) => acc + r, 0);
    expectedReturns[symbol] = sum / N_PERIODS;
  });

  // 2. Calculate Covariance Matrix and Volatilities (Standard Deviations)
  const covarianceMatrix: Record<string, Record<string, number>> = {};
  const volatilities: Record<string, number> = {};

  SYMBOLS.forEach(symbolA => {
    covarianceMatrix[symbolA] = {};
    const meanA = expectedReturns[symbolA];

    SYMBOLS.forEach(symbolB => {
      const meanB = expectedReturns[symbolB];
      let sumCov = 0;

      for (let t = 0; t < N_PERIODS; t++) {
        sumCov += (returns[symbolA][t] - meanA) * (returns[symbolB][t] - meanB);
      }

      // Sample covariance (N - 1 denominator)
      const cov = sumCov / (N_PERIODS - 1);
      covarianceMatrix[symbolA][symbolB] = cov;
    });

    volatilities[symbolA] = Math.sqrt(covarianceMatrix[symbolA][symbolA]);
  });

  const assetMetrics: AssetMetrics[] = SYMBOLS.map(symbol => ({
    symbol,
    expectedReturn: expectedReturns[symbol],
    volatility: volatilities[symbol]
  }));

  // Risk-free rate (approx. 3.0% annual daily equivalent: 0.03 / 252 = 0.00012)
  const RISK_FREE_RATE = 0.00012;

  // Helper to evaluate portfolio statistics for a given weight vector
  const evaluatePortfolio = (weightsArr: number[]): MptPortfolio => {
    const weights: Record<string, number> = {};
    SYMBOLS.forEach((sym, i) => {
      weights[sym] = weightsArr[i];
    });

    // Expected Portfolio Return: E(Rp) = sum(w_i * E(Ri))
    let expectedReturn = 0;
    SYMBOLS.forEach((sym, i) => {
      expectedReturn += weightsArr[i] * expectedReturns[sym];
    });

    // Portfolio Variance: Var(Rp) = sum_i sum_j w_i * w_j * Cov(i, j)
    let variance = 0;
    SYMBOLS.forEach((symI, i) => {
      SYMBOLS.forEach((symJ, j) => {
        variance += weightsArr[i] * weightsArr[j] * covarianceMatrix[symI][symJ];
      });
    });

    const volatility = Math.sqrt(variance);
    const sharpeRatio = volatility > 0 ? (expectedReturn - RISK_FREE_RATE) / volatility : 0;

    return {
      weights,
      expectedReturn,
      volatility,
      sharpeRatio
    };
  };

  // 3. Naive Equal Weight Portfolio (20% each)
  const naiveWeights = [0.20, 0.20, 0.20, 0.20, 0.20];
  const naive = evaluatePortfolio(naiveWeights);

  // 4. Monte Carlo Simulation for MSR and GMVP
  let bestSharpe = -Infinity;
  let bestMsrWeights: number[] = [];

  let minVol = Infinity;
  let bestGmvpWeights: number[] = [];

  const SIMULATION_RUNS = 2000;

  // We seed the simulation with individual asset holdings as boundaries, plus naive
  const candidateWeights: number[][] = [
    [1, 0, 0, 0, 0],
    [0, 1, 0, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 0, 1, 0],
    [0, 0, 0, 0, 1],
    naiveWeights
  ];

  // Generate 2000 random portfolios
  for (let i = 0; i < SIMULATION_RUNS; i++) {
    const weightsArr = SYMBOLS.map(() => Math.random());
    const sum = weightsArr.reduce((acc, w) => acc + w, 0);
    const normalized = weightsArr.map(w => w / sum);
    candidateWeights.push(normalized);
  }

  // Evaluate and select optimal portfolios
  candidateWeights.forEach(weights => {
    const port = evaluatePortfolio(weights);

    if (port.sharpeRatio > bestSharpe) {
      bestSharpe = port.sharpeRatio;
      bestMsrWeights = [...weights];
    }

    if (port.volatility < minVol) {
      minVol = port.volatility;
      bestGmvpWeights = [...weights];
    }
  });

  // Re-evaluate to get exact rounded final details
  const msr = evaluatePortfolio(bestMsrWeights);
  const gmvp = evaluatePortfolio(bestGmvpWeights);

  return {
    msr,
    gmvp,
    naive,
    assetMetrics,
    covarianceMatrix
  };
}
