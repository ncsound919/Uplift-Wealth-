/**
 * Black-Scholes Options Pricing and Greeks Calculator
 * Implements standard quantitative finance formulas for pricing European calls/puts
 * and computing Greeks: Delta, Gamma, Theta, Vega.
 */

// Cumulative Normal Distribution approximation
export function normCDF(x: number): number {
  const t = 1.0 / (1.0 + 0.2316419 * Math.abs(x));
  const d = 0.3989422804014327; // 1 / sqrt(2pi)
  const p = 0.3275911;
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  
  const prob = 1.0 - d * Math.exp(-0.5 * x * x) * (a1 * t + a2 * Math.pow(t, 2) + a3 * Math.pow(t, 3) + a4 * Math.pow(t, 4) + a5 * Math.pow(t, 5));
  return x >= 0 ? prob : 1.0 - prob;
}

// Probability Density Function of standard normal distribution
export function normPDF(x: number): number {
  return (1.0 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * x * x);
}

export interface Greeks {
  price: number;
  delta: number;
  gamma: number;
  theta: number; // Daily theta
  vega: number;  // 1% volatility change vega
}

/**
 * Computes options price and Greeks using Black-Scholes model
 * @param S Current Stock Price
 * @param K Option Strike Price
 * @param T Days to Expiry (scaled to years inside function: T / 365)
 * @param sigma Implied Volatility (e.g., 0.30 for 30%)
 * @param r Risk-Free Interest Rate (e.g., 0.05 for 5%)
 * @param isCall True for Call, False for Put
 */
export function calculateBlackScholes(
  S: number,
  K: number,
  T_days: number,
  sigma: number,
  r: number = 0.05,
  isCall: boolean = true
): Greeks {
  // Edge cases handling
  if (S <= 0 || K <= 0 || sigma <= 0) {
    return { price: 0, delta: 0, gamma: 0, theta: 0, vega: 0 };
  }
  
  // T must be positive, map to minimum 1 day to avoid division by zero
  const T = Math.max(0.0001, T_days) / 365.0;
  
  const d1 = (Math.log(S / K) + (r + (sigma * sigma) / 2.0) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);
  
  const nd1 = normCDF(d1);
  const nd2 = normCDF(d2);
  const n_d1 = normCDF(-d1);
  const n_d2 = normCDF(-d2);
  
  const pdf_d1 = normPDF(d1);
  
  let price = 0;
  let delta = 0;
  let theta_annual = 0;
  
  const discountFactor = Math.exp(-r * T);
  
  if (isCall) {
    price = S * nd1 - K * discountFactor * nd2;
    delta = nd1;
    theta_annual = 
      -(S * pdf_d1 * sigma) / (2 * Math.sqrt(T)) - 
      r * K * discountFactor * nd2;
  } else {
    price = K * discountFactor * n_d2 - S * n_d1;
    delta = nd1 - 1.0;
    theta_annual = 
      -(S * pdf_d1 * sigma) / (2 * Math.sqrt(T)) + 
      r * K * discountFactor * n_d2;
  }
  
  const gamma = pdf_d1 / (S * sigma * Math.sqrt(T));
  // Vega for 1% change in volatility
  const vega = (S * Math.sqrt(T) * pdf_d1) / 100.0;
  // Theta per day
  const theta = theta_annual / 365.0;
  
  return {
    price: Math.max(0.01, price),
    delta: Number(delta.toFixed(3)),
    gamma: Number(gamma.toFixed(4)),
    theta: Number(theta.toFixed(4)),
    vega: Number(vega.toFixed(4))
  };
}
