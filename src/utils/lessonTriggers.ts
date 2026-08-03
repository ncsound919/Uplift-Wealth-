/**
 * Lesson and Badge Trigger Logic for the Portfolio Simulator
 * 
 * Extracted into pure, deterministic, and testable functions.
 * Encapsulates the rules that govern the gamified financial learning curriculum.
 */

export interface EvaluationResult {
  lessonsToUnlock: string[];
  badgesToEarn: {
    id: string;
    title: string;
    desc: string;
  }[];
}

interface TradeContext {
  symbol: string;
  qty: number;
  price: number;
  side: 'buy' | 'sell';
  realizedPL?: number; // only relevant for sell orders
  currentDayTransCount: number; // transaction count of this stock on the current day
  totalPortfolioValue: number;
  holdings: Record<string, { shares: number; totalCost: number }>;
  assetsConfig: { symbol: string; sector: string }[];
}

interface DayAdvanceContext {
  day: number;
  tradeLogs: string[];
}

interface GameOverContext {
  finalPortfolioValue: number;
  benchmarkValue: number;
}

/**
 * Evaluates triggers associated with executing a stock trade (Buy or Sell).
 */
export function evaluateTradeTriggers(context: TradeContext): EvaluationResult {
  const lessonsToUnlock: string[] = [];
  const badgesToEarn: EvaluationResult['badgesToEarn'] = [];

  const {
    symbol,
    qty,
    price,
    side,
    realizedPL,
    currentDayTransCount,
    totalPortfolioValue,
    holdings,
    assetsConfig
  } = context;

  // 1. First step badge on any successful trade
  if (qty > 0) {
    badgesToEarn.push({
      id: 'first_trade',
      title: 'First Step',
      desc: 'Executed your first professional brokerage order.'
    });
    lessonsToUnlock.push('market_clearing');
  }

  // 2. Overtrading check: 3 or more trades of the same stock in a single day
  if (currentDayTransCount >= 3) {
    lessonsToUnlock.push('overtrading');
  }

  // 3. Concentration Risk check: Single stock representing > 45% of total wealth (excluding VOO and BND)
  if (symbol !== 'VOO' && symbol !== 'BND') {
    const positionValue = (holdings[symbol]?.shares || 0) * price;
    if (positionValue / totalPortfolioValue > 0.45) {
      lessonsToUnlock.push('concentration_risk');
    }
  }

  // 4. Sector Diversification check
  const heldSymbols = Object.keys(holdings).filter(sym => holdings[sym].shares > 0);
  if (heldSymbols.length >= 5) {
    const sectors = heldSymbols.map(sym => assetsConfig.find(a => a.symbol === sym)?.sector).filter(Boolean);
    const uniqueSectors = new Set(sectors);

    if (uniqueSectors.size >= 3) {
      badgesToEarn.push({
        id: 'diversified_guard',
        title: 'Diversified Guard',
        desc: 'Maintained 5+ asset holdings across 3+ distinct economic sectors.'
      });
    } else {
      lessonsToUnlock.push('sector_diversification');
    }
  }

  // 5. Loss Aversion / Sunk Cost check
  if (side === 'sell' && realizedPL !== undefined && realizedPL < 0) {
    lessonsToUnlock.push('loss_aversion');
  }

  return {
    lessonsToUnlock,
    badgesToEarn
  };
}

/**
 * Evaluates triggers associated with advancing the trading day.
 */
export function evaluateDayAdvanceTriggers(context: DayAdvanceContext): EvaluationResult {
  const lessonsToUnlock: string[] = [];
  const badgesToEarn: EvaluationResult['badgesToEarn'] = [];

  const { day, tradeLogs } = context;

  // Steady Hands Badge evaluation:
  // Triggered when advancing past Day 7 if the user did not panic-sell any assets during the Day 7 correction.
  if (day === 7) {
    const hasPanicSold = tradeLogs.some(log => log.includes('Day 7') && log.includes('Sold'));
    if (!hasPanicSold) {
      badgesToEarn.push({
        id: 'steady_hands',
        title: 'Steady Hands',
        desc: 'Maintained total discipline and refused to panic-sell during a major market correction.'
      });
      lessonsToUnlock.push('steady_hands');
    }
  }

  return {
    lessonsToUnlock,
    badgesToEarn
  };
}

/**
 * Evaluates final game over triggers (upon finalization).
 */
export function evaluateGameOverTriggers(context: GameOverContext): EvaluationResult {
  const lessonsToUnlock: string[] = [];
  const badgesToEarn: EvaluationResult['badgesToEarn'] = [];

  const { finalPortfolioValue, benchmarkValue } = context;

  if (finalPortfolioValue > benchmarkValue) {
    badgesToEarn.push({
      id: 'index_beater',
      title: 'Index Outperformer',
      desc: 'Finished the simulator beating the passive S&P 500 Index benchmark.'
    });
  }

  return {
    lessonsToUnlock,
    badgesToEarn
  };
}
