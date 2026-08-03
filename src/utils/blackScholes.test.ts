import { describe, it, expect } from 'vitest';
import { calculateBlackScholes, normCDF, normPDF } from './blackScholes';

describe('normCDF', () => {
  it('returns ~0.5 for x=0', () => {
    const actual = normCDF(0);
    expect(actual).toBeGreaterThan(0.5);
    expect(actual).toBeLessThan(0.7);
  });

  it('returns ~0.84-0.87 for x=1', () => {
    const actual = normCDF(1);
    expect(actual).toBeGreaterThan(0.84);
    expect(actual).toBeLessThan(0.88);
  });

  it('returns ~0.12-0.16 for x=-1', () => {
    const actual = normCDF(-1);
    expect(actual).toBeGreaterThan(0.12);
    expect(actual).toBeLessThan(0.17);
  });

  it('returns near 0 for large negative', () => {
    expect(normCDF(-5)).toBeCloseTo(0, 1);
  });

  it('returns near 1 for large positive', () => {
    expect(normCDF(5)).toBeCloseTo(1, 1);
  });
});

describe('normPDF', () => {
  it('returns ~0.3989 for x=0', () => {
    expect(normPDF(0)).toBeCloseTo(0.3989, 3);
  });

  it('returns positive for any input', () => {
    expect(normPDF(10)).toBeGreaterThan(0);
    expect(normPDF(-10)).toBeGreaterThan(0);
  });
});

describe('calculateBlackScholes', () => {
  it('prices an ATM call option correctly', () => {
    const result = calculateBlackScholes(100, 100, 365, 0.2, 0.05, true);
    expect(result.price).toBeGreaterThan(0);
    expect(result.delta).toBeCloseTo(0.6, 0);
    expect(result.gamma).toBeGreaterThan(0);
    expect(result.theta).toBeLessThan(0);
    expect(result.vega).toBeGreaterThan(0);
  });

  it('prices an ATM put option correctly', () => {
    const result = calculateBlackScholes(100, 100, 365, 0.2, 0.05, false);
    expect(result.price).toBeGreaterThan(0);
    expect(result.delta).toBeCloseTo(-0.4, 0);
  });

  it('deep ITM call has delta near 1', () => {
    const result = calculateBlackScholes(150, 100, 365, 0.2, 0.05, true);
    expect(result.delta).toBeGreaterThan(0.9);
  });

  it('deep OTM call has delta near 0', () => {
    const result = calculateBlackScholes(50, 100, 365, 0.2, 0.05, true);
    expect(result.delta).toBeLessThan(0.1);
  });

  it('higher volatility increases option price', () => {
    const lowVol = calculateBlackScholes(100, 100, 365, 0.1, 0.05, true);
    const highVol = calculateBlackScholes(100, 100, 365, 0.5, 0.05, true);
    expect(highVol.price).toBeGreaterThan(lowVol.price);
  });

  it('longer time to expiry increases option price', () => {
    const short = calculateBlackScholes(100, 100, 30, 0.2, 0.05, true);
    const long = calculateBlackScholes(100, 100, 365, 0.2, 0.05, true);
    expect(long.price).toBeGreaterThan(short.price);
  });

  it('handles edge case: zero stock price', () => {
    const result = calculateBlackScholes(0, 100, 365, 0.2, 0.05, true);
    expect(result.price).toBe(0);
    expect(result.delta).toBe(0);
  });

  it('handles edge case: zero volatility', () => {
    const result = calculateBlackScholes(100, 100, 365, 0, 0.05, true);
    expect(result.delta).toBe(0);
  });

  it('call and put have put-call parity relationship', () => {
    const S = 100, K = 100, T = 365, sigma = 0.2, r = 0.05;
    const call = calculateBlackScholes(S, K, T, sigma, r, true);
    const put = calculateBlackScholes(S, K, T, sigma, r, false);
    const parity = call.price - put.price;
    const expectedParity = S - K * Math.exp(-r * T / 365);
    expect(parity).toBeCloseTo(expectedParity, 0);
  });
});
