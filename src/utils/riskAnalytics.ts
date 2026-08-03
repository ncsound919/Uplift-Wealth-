export interface RiskMetrics {
  sharpeRatio: number | null;
  sortinoRatio: number | null;
  maxDrawdown: number | null;
  currentDrawdown: number | null;
  volatility: number | null;
  annualizedReturn: number | null;
  valueAtRisk95: number | null;
  valueAtRisk99: number | null;
  concentrationRisk: number | null;
  largestPositionPct: number;
  diversificationRatio: number;
}

export interface PositionMetrics {
  symbol: string;
  marketVal: number;
  pctOfPortfolio: number;
}

export interface NavSnapshot {
  timestamp: number;
  nav: number;
}

export interface ClosedTrade {
  pnl: number;
  pnlPct: number;
  holdingPeriodHours: number;
}

export class RiskAnalytics {
  static computeAll(
    positions: PositionMetrics[],
    navHistory: NavSnapshot[],
    closedTrades: ClosedTrade[],
    startingCapital: number,
    currentNav: number
  ): RiskMetrics {
    const returns = this.calculateReturns(navHistory);
    const sharpe = this.sharpeRatio(returns);
    const sortino = this.sortinoRatio(returns);
    const maxDD = this.maxDrawdown(navHistory);
    const currentDD = this.currentDrawdown(navHistory, currentNav);
    const vol = this.annualizedVolatility(returns);
    const annualRet = this.annualizedReturn(navHistory, startingCapital, currentNav);
    const var95 = this.valueAtRisk(returns, currentNav, 0.95);
    const var99 = this.valueAtRisk(returns, currentNav, 0.99);
    const concentration = this.concentrationRisk(positions);
    const largest = this.largestPosition(positions);
    const divRatio = this.diversificationRatio(positions);

    return {
      sharpeRatio: sharpe,
      sortinoRatio: sortino,
      maxDrawdown: maxDD,
      currentDrawdown: currentDD,
      volatility: vol,
      annualizedReturn: annualRet,
      valueAtRisk95: var95,
      valueAtRisk99: var99,
      concentrationRisk: concentration,
      largestPositionPct: largest,
      diversificationRatio: divRatio,
    };
  }

  static calculateReturns(navHistory: NavSnapshot[]): number[] {
    if (navHistory.length < 2) return [];
    const returns: number[] = [];
    for (let i = 1; i < navHistory.length; i++) {
      const prev = navHistory[i - 1].nav;
      const curr = navHistory[i].nav;
      if (prev > 0) returns.push((curr - prev) / prev);
    }
    return returns;
  }

  static sharpeRatio(returns: number[], riskFreeRate = 0.04): number | null {
    if (returns.length < 2) return null;
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const dailyRf = Math.pow(1 + riskFreeRate, 1 / 252) - 1;
    const excess = returns.map((r) => r - dailyRf);
    const std = this.stdDev(excess);
    if (std === 0) return null;
    const dailySharpe = (mean - dailyRf) / std;
    return dailySharpe * Math.sqrt(252);
  }

  static sortinoRatio(returns: number[], riskFreeRate = 0.04): number | null {
    if (returns.length < 2) return null;
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const dailyRf = Math.pow(1 + riskFreeRate, 1 / 252) - 1;
    const downside = returns.filter((r) => r < dailyRf).map((r) => r - dailyRf);
    if (downside.length === 0) return null;
    const downsideStd = Math.sqrt(
      downside.reduce((a, b) => a + b * b, 0) / downside.length
    );
    if (downsideStd === 0) return null;
    const dailySortino = (mean - dailyRf) / downsideStd;
    return dailySortino * Math.sqrt(252);
  }

  static maxDrawdown(navHistory: NavSnapshot[]): number | null {
    if (navHistory.length < 2) return null;
    let peak = navHistory[0].nav;
    let maxDD = 0;
    for (const snap of navHistory) {
      if (snap.nav > peak) peak = snap.nav;
      const dd = (peak - snap.nav) / peak;
      if (dd > maxDD) maxDD = dd;
    }
    return maxDD * 100;
  }

  static currentDrawdown(navHistory: NavSnapshot[], currentNav: number): number | null {
    if (navHistory.length === 0) return null;
    const peak = Math.max(...navHistory.map((s) => s.nav), currentNav);
    if (peak === 0) return null;
    return ((peak - currentNav) / peak) * 100;
  }

  static annualizedVolatility(returns: number[]): number | null {
    if (returns.length < 2) return null;
    const std = this.stdDev(returns);
    return std * Math.sqrt(252) * 100;
  }

  static annualizedReturn(navHistory: NavSnapshot[], startingCapital: number, currentNav: number): number | null {
    if (navHistory.length === 0) return null;
    const totalReturn = (currentNav - startingCapital) / startingCapital;
    const daysElapsed =
      navHistory.length > 1
        ? (navHistory[navHistory.length - 1].timestamp - navHistory[0].timestamp) / 86400000
        : 1;
    if (daysElapsed < 1) return null;
    const annualFactor = 365 / daysElapsed;
    return (Math.pow(1 + totalReturn, annualFactor) - 1) * 100;
  }

  static valueAtRisk(returns: number[], currentNav: number, confidence: number): number | null {
    if (returns.length < 10) return null;
    const sorted = [...returns].sort((a, b) => a - b);
    const index = Math.floor((1 - confidence) * sorted.length);
    const worstReturn = sorted[Math.min(index, sorted.length - 1)];
    return Math.abs(worstReturn * currentNav);
  }

  static concentrationRisk(positions: PositionMetrics[]): number | null {
    if (positions.length === 0) return null;
    const totalVal = positions.reduce((s, p) => s + p.marketVal, 0);
    if (totalVal === 0) return null;
    const hhi = positions.reduce((s, p) => {
      const share = (p.marketVal / totalVal) * 100;
      return s + share * share;
    }, 0);
    return hhi;
  }

  static largestPosition(positions: PositionMetrics[]): number {
    if (positions.length === 0) return 0;
    const totalVal = positions.reduce((s, p) => s + p.marketVal, 0);
    if (totalVal === 0) return 0;
    return Math.max(...positions.map((p) => (p.marketVal / totalVal) * 100));
  }

  static diversificationRatio(positions: PositionMetrics[]): number {
    if (positions.length === 0) return 0;
    const hhi = this.concentrationRisk(positions);
    if (hhi === null || hhi === 0) return 0;
    return Math.min(100, (1 / hhi) * positions.length * 100);
  }

  private static stdDev(arr: number[]): number {
    if (arr.length < 2) return 0;
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    const variance = arr.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / (arr.length - 1);
    return Math.sqrt(variance);
  }

  static riskGrade(metrics: RiskMetrics): { grade: string; color: string; label: string } {
    let score = 100;
    if (metrics.sharpeRatio !== null) {
      if (metrics.sharpeRatio < 0) score -= 30;
      else if (metrics.sharpeRatio < 0.5) score -= 20;
      else if (metrics.sharpeRatio < 1.0) score -= 10;
      else if (metrics.sharpeRatio < 2.0) score -= 0;
      else score += 10;
    }
    if (metrics.maxDrawdown !== null) {
      if (metrics.maxDrawdown > 30) score -= 25;
      else if (metrics.maxDrawdown > 20) score -= 15;
      else if (metrics.maxDrawdown > 10) score -= 5;
    }
    if (metrics.concentrationRisk !== null) {
      if (metrics.concentrationRisk > 5000) score -= 20;
      else if (metrics.concentrationRisk > 3000) score -= 10;
      else if (metrics.concentrationRisk > 1500) score -= 5;
    }
    if (metrics.largestPositionPct > 40) score -= 15;
    else if (metrics.largestPositionPct > 25) score -= 8;
    if (metrics.volatility !== null && metrics.volatility > 30) score -= 10;

    score = Math.max(0, Math.min(110, score));
    if (score >= 90) return { grade: 'A', color: 'text-emerald-400', label: 'Low Risk' };
    if (score >= 80) return { grade: 'B', color: 'text-green-400', label: 'Moderate-Low Risk' };
    if (score >= 70) return { grade: 'C', color: 'text-yellow-400', label: 'Moderate Risk' };
    if (score >= 60) return { grade: 'D', color: 'text-orange-400', label: 'Elevated Risk' };
    if (score >= 50) return { grade: 'E', color: 'text-red-400', label: 'High Risk' };
    return { grade: 'F', color: 'text-red-500', label: 'Extreme Risk' };
  }
}
