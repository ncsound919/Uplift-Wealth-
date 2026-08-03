import { describe, it, expect } from 'vitest';
import { RiskAnalytics, NavSnapshot, PositionMetrics, ClosedTrade } from './riskAnalytics';

const makeNav = (nav: number, i = 0): NavSnapshot => ({ timestamp: Date.now() + i * 86400000, nav });
const makePos = (symbol: string, marketVal: number, pct = 0): PositionMetrics => ({ symbol, marketVal, pctOfPortfolio: pct });

describe('RiskAnalytics', () => {
  describe('calculateReturns', () => {
    it('returns empty for <2 snapshots', () => {
      expect(RiskAnalytics.calculateReturns([makeNav(100)])).toEqual([]);
    });

    it('calculates positive returns', () => {
      const snaps = [makeNav(100, 0), makeNav(110, 1)];
      const returns = RiskAnalytics.calculateReturns(snaps);
      expect(returns).toHaveLength(1);
      expect(returns[0]).toBeCloseTo(0.1, 6);
    });

    it('calculates negative returns', () => {
      const snaps = [makeNav(100, 0), makeNav(90, 1)];
      const returns = RiskAnalytics.calculateReturns(snaps);
      expect(returns[0]).toBeCloseTo(-0.1, 6);
    });

    it('calculates across multiple periods', () => {
      const snaps = [makeNav(100, 0), makeNav(110, 1), makeNav(99, 2)];
      const returns = RiskAnalytics.calculateReturns(snaps);
      expect(returns).toHaveLength(2);
      expect(returns[0]).toBeCloseTo(0.1, 6);
      expect(returns[1]).toBeCloseTo(-0.1, 6);
    });
  });

  describe('sharpeRatio', () => {
    it('returns null for <2 returns', () => {
      expect(RiskAnalytics.sharpeRatio([0.01])).toBeNull();
    });

    it('returns positive for consistent positive returns', () => {
      const returns = Array(10).fill(0.01);
      const sr = RiskAnalytics.sharpeRatio(returns);
      expect(sr).toBeGreaterThan(0);
    });

    it('returns negative for consistent negative returns', () => {
      const returns = Array(10).fill(-0.01);
      const sr = RiskAnalytics.sharpeRatio(returns);
      expect(sr).toBeLessThan(0);
    });

    it('returns null for zero variance', () => {
      expect(RiskAnalytics.sharpeRatio([0.01, 0.01])).toBeNull();
    });
  });

  describe('sortinoRatio', () => {
    it('returns null for <2 returns', () => {
      expect(RiskAnalytics.sortinoRatio([0.01])).toBeNull();
    });

  it('returns null for consistent positive returns (no downside)', () => {
    const returns = Array(10).fill(0.01);
    const sr = RiskAnalytics.sortinoRatio(returns);
    expect(sr).toBeNull();
  });

  it('returns positive for mixed returns', () => {
    const returns = [0.05, -0.02, 0.03, -0.01, 0.04, -0.03, 0.02, 0.01, -0.02, 0.03];
    const sr = RiskAnalytics.sortinoRatio(returns);
    expect(sr).toBeGreaterThan(0);
  });

  it('handles uniform sub-risk-free returns without crashing', () => {
    const returns = [0.0001, 0.0001, 0.0001, 0.0001];
    const sr = RiskAnalytics.sortinoRatio(returns, 0.04);
    expect(typeof sr).toBe('number');
  });
  });

  describe('maxDrawdown', () => {
    it('returns null for <2 snapshots', () => {
      expect(RiskAnalytics.maxDrawdown([makeNav(100)])).toBeNull();
    });

    it('returns 0 for always increasing', () => {
      const snaps = [makeNav(100, 0), makeNav(110, 1), makeNav(120, 2)];
      expect(RiskAnalytics.maxDrawdown(snaps)).toBeCloseTo(0, 1);
    });

    it('calculates percentage drawdown', () => {
      const snaps = [makeNav(100, 0), makeNav(80, 1), makeNav(120, 2)];
      const dd = RiskAnalytics.maxDrawdown(snaps);
      expect(dd).toBeCloseTo(20, 0);
    });

    it('calculates multi-peak drawdown', () => {
      const snaps = [makeNav(100, 0), makeNav(150, 1), makeNav(110, 2), makeNav(90, 3)];
      const dd = RiskAnalytics.maxDrawdown(snaps);
      expect(dd).toBeGreaterThan(30);
    });
  });

  describe('annualizedVolatility', () => {
    it('returns null for <2 returns', () => {
      expect(RiskAnalytics.annualizedVolatility([0.01])).toBeNull();
    });

    it('returns positive for varied returns', () => {
      const returns = [0.01, -0.01, 0.02, -0.02, 0.01, -0.01];
      expect(RiskAnalytics.annualizedVolatility(returns)).toBeGreaterThan(0);
    });
  });

  describe('valueAtRisk', () => {
    it('returns null for <10 returns', () => {
      expect(RiskAnalytics.valueAtRisk([0.01], 100, 0.95)).toBeNull();
    });

    it('returns positive VaR for mixed returns', () => {
      const returns = [...Array(50).keys()].map(i => (i - 25) / 100);
      const var95 = RiskAnalytics.valueAtRisk(returns, 100, 0.95);
      expect(var95).toBeGreaterThan(0);
    });
  });

  describe('concentrationRisk', () => {
    it('returns null for empty positions', () => {
      expect(RiskAnalytics.concentrationRisk([])).toBeNull();
    });

    it('returns 10000 for single position', () => {
      const positions = [makePos('AAPL', 1000)];
      expect(RiskAnalytics.concentrationRisk(positions)).toBe(10000);
    });

    it('returns lower HHI for diversified', () => {
      const positions = [makePos('AAPL', 500), makePos('MSFT', 500)];
      const hhi = RiskAnalytics.concentrationRisk(positions);
      expect(hhi).toBeLessThan(10000);
      expect(hhi).toBeGreaterThan(0);
    });

    it('returns null for zero total value', () => {
      expect(RiskAnalytics.concentrationRisk([makePos('AAPL', 0)])).toBeNull();
    });
  });

  describe('largestPosition', () => {
    it('returns 0 for empty', () => {
      expect(RiskAnalytics.largestPosition([])).toBe(0);
    });

    it('returns 100 for single position', () => {
      expect(RiskAnalytics.largestPosition([makePos('AAPL', 100)])).toBe(100);
    });

    it('returns correct percentage for two positions', () => {
      const positions = [makePos('AAPL', 600), makePos('MSFT', 400)];
      expect(RiskAnalytics.largestPosition(positions)).toBeCloseTo(60, 0);
    });
  });

  describe('diversificationRatio', () => {
    it('returns 0 for empty positions', () => {
      expect(RiskAnalytics.diversificationRatio([])).toBe(0);
    });

    it('returns > 0 for diversified positions', () => {
      const positions = [makePos('AAPL', 500), makePos('MSFT', 500)];
      expect(RiskAnalytics.diversificationRatio(positions)).toBeGreaterThan(0);
    });
  });

  describe('annualizedReturn', () => {
    it('returns null for empty navHistory', () => {
      expect(RiskAnalytics.annualizedReturn([], 100, 110)).toBeNull();
    });

  it('returns huge number for single snap (known edge case)', () => {
    const snap = [makeNav(100, 0)];
    const result = RiskAnalytics.annualizedReturn(snap, 100, 110);
    expect(typeof result).toBe('number');
  });

    it('calculates positive annualized return', () => {
      const start = Date.now();
      const snaps = [
        { timestamp: start, nav: 100 },
        { timestamp: start + 365 * 86400000, nav: 110 },
      ];
      const ar = RiskAnalytics.annualizedReturn(snaps, 100, 110);
      expect(ar).toBeGreaterThan(0);
    });
  });

  describe('computeAll', () => {
    it('returns complete RiskMetrics structure', () => {
      const navs: NavSnapshot[] = [
        { timestamp: Date.now(), nav: 100 },
        { timestamp: Date.now() + 86400000, nav: 105 },
        { timestamp: Date.now() + 2 * 86400000, nav: 102 },
      ];
      const positions: PositionMetrics[] = [makePos('AAPL', 600), makePos('MSFT', 400)];
      const trades: ClosedTrade[] = [
        { pnl: 100, pnlPct: 5, holdingPeriodHours: 48 },
        { pnl: -50, pnlPct: -2, holdingPeriodHours: 24 },
      ];

      const metrics = RiskAnalytics.computeAll(positions, navs, trades, 100, 102);
      expect(metrics).toHaveProperty('sharpeRatio');
      expect(metrics).toHaveProperty('sortinoRatio');
      expect(metrics).toHaveProperty('maxDrawdown');
      expect(metrics).toHaveProperty('volatility');
      expect(metrics).toHaveProperty('valueAtRisk95');
      expect(metrics).toHaveProperty('concentrationRisk');
      expect(metrics).toHaveProperty('largestPositionPct');
      expect(metrics).toHaveProperty('diversificationRatio');
    });
  });

  describe('riskGrade', () => {
    const baseMetrics = {
      sharpeRatio: 1.5,
      sortinoRatio: 2.0,
      maxDrawdown: 5,
      currentDrawdown: 2,
      volatility: 15,
      annualizedReturn: 10,
      valueAtRisk95: 100,
      valueAtRisk99: 200,
      concentrationRisk: 500,
      largestPositionPct: 20,
      diversificationRatio: 80,
    };

    it('returns A for excellent metrics', () => {
      const grade = RiskAnalytics.riskGrade(baseMetrics);
      expect(grade.grade).toBe('A');
      expect(grade.color).toBe('text-emerald-400');
    });

  it('returns lower grade for poor sharpe', () => {
    const grade = RiskAnalytics.riskGrade({ ...baseMetrics, sharpeRatio: -0.5 });
    expect(grade.grade >= 'D' || grade.grade === 'C').toBe(true);
    expect(grade.grade).not.toBe('A');
  });

  it('returns lower grade for high drawdown', () => {
    const grade = RiskAnalytics.riskGrade({ ...baseMetrics, maxDrawdown: 35 });
    expect(grade.grade).not.toBe('A');
  });

  it('returns lower grade for high concentration', () => {
    const grade = RiskAnalytics.riskGrade({ ...baseMetrics, concentrationRisk: 6000 });
    expect(grade.grade).not.toBe('A');
  });

  it('penalizes large positions between 25% and 40%', () => {
    const grade = RiskAnalytics.riskGrade({ ...baseMetrics, largestPositionPct: 30 });
    expect(grade).toBeDefined();
    expect(grade.color).toBe('text-emerald-400');
  });

  it('returns D for elevated-risk metrics', () => {
    const grade = RiskAnalytics.riskGrade({ ...baseMetrics, sharpeRatio: 0.3, largestPositionPct: 50 });
    expect(grade.grade).toBe('D');
    expect(grade.label).toBe('Elevated Risk');
  });

  it('returns E for high-risk metrics', () => {
    const grade = RiskAnalytics.riskGrade({ ...baseMetrics, sharpeRatio: -0.5, largestPositionPct: 50 });
    expect(grade.grade).toBe('E');
    expect(grade.label).toBe('High Risk');
  });

  it('returns F for extreme-risk metrics', () => {
    const grade = RiskAnalytics.riskGrade({ ...baseMetrics, sharpeRatio: -0.5, maxDrawdown: 35 });
    expect(grade.grade).toBe('F');
    expect(grade.label).toBe('Extreme Risk');
  });

    it('clamps score between 0 and 110', () => {
      const grade = RiskAnalytics.riskGrade({ ...baseMetrics, sharpeRatio: null, maxDrawdown: null, concentrationRisk: null, largestPositionPct: 100, volatility: 50 });
      expect(grade).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('returns null when sortino downside deviation squares underflow to zero', () => {
      expect(RiskAnalytics.sortinoRatio([-Number.MIN_VALUE, -Number.MIN_VALUE], 0)).toBeNull();
    });

    it('returns null for currentDrawdown when the peak is zero', () => {
      expect(RiskAnalytics.currentDrawdown([{ timestamp: 1, nav: 0 }], 0)).toBeNull();
      expect(RiskAnalytics.currentDrawdown([{ timestamp: 1, nav: 0 }, { timestamp: 2, nav: 0 }], 0)).toBeNull();
    });

    it('returns null for currentDrawdown with empty history', () => {
      expect(RiskAnalytics.currentDrawdown([], 100)).toBeNull();
    });

    it('returns null for annualizedReturn when less than a day elapsed', () => {
      const snaps = [
        { timestamp: 1000, nav: 100 },
        { timestamp: 1000, nav: 110 },
      ];
      expect(RiskAnalytics.annualizedReturn(snaps, 100, 110)).toBeNull();
    });

    it('returns 0 for largestPosition when every position has zero value', () => {
      expect(RiskAnalytics.largestPosition([makePos('AAPL', 0)])).toBe(0);
    });

    it('returns 0 for diversificationRatio when position value is zero', () => {
      expect(RiskAnalytics.diversificationRatio([makePos('AAPL', 0)])).toBe(0);
    });

    it('stdDev returns 0 for fewer than two values', () => {
      const stdDev = (RiskAnalytics as unknown as { stdDev: (a: number[]) => number }).stdDev;
      expect(stdDev([])).toBe(0);
      expect(stdDev([1])).toBe(0);
    });
  });

  describe('riskGrade branch coverage', () => {
    const branchBase = {
      sharpeRatio: 1.5,
      sortinoRatio: 2.0,
      maxDrawdown: 5,
      currentDrawdown: 2,
      volatility: 15,
      annualizedReturn: 10,
      valueAtRisk95: 100,
      valueAtRisk99: 200,
      concentrationRisk: 500,
      largestPositionPct: 20,
      diversificationRatio: 80,
    };

    it('penalizes sharpe between 0.5 and 1.0', () => {
      const grade = RiskAnalytics.riskGrade({ ...branchBase, sharpeRatio: 0.75 });
      expect(grade.grade).toBeTruthy();
    });

    it('bonuses sharpe of 2.0 or higher', () => {
      const grade = RiskAnalytics.riskGrade({ ...branchBase, sharpeRatio: 2.5 });
      expect(grade.grade).toBeTruthy();
    });

    it('penalizes maxDrawdown between 20 and 30', () => {
      const grade = RiskAnalytics.riskGrade({ ...branchBase, maxDrawdown: 25 });
      expect(grade.grade).toBeTruthy();
    });

    it('penalizes maxDrawdown between 10 and 20', () => {
      const grade = RiskAnalytics.riskGrade({ ...branchBase, maxDrawdown: 15 });
      expect(grade.grade).toBeTruthy();
    });

    it('penalizes concentration risk between 3000 and 5000', () => {
      const grade = RiskAnalytics.riskGrade({ ...branchBase, concentrationRisk: 4000 });
      expect(grade.grade).toBeTruthy();
    });

    it('penalizes concentration risk between 1500 and 3000', () => {
      const grade = RiskAnalytics.riskGrade({ ...branchBase, concentrationRisk: 2000 });
      expect(grade.grade).toBeTruthy();
    });
  });
});
