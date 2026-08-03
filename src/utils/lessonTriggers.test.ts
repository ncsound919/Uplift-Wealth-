import { describe, it, expect } from 'vitest';
import { evaluateTradeTriggers, evaluateDayAdvanceTriggers, evaluateGameOverTriggers } from './lessonTriggers';

const baseTradeContext = {
  symbol: 'AAPL',
  qty: 10,
  price: 150,
  side: 'buy' as const,
  currentDayTransCount: 0,
  totalPortfolioValue: 100000,
  holdings: {},
  assetsConfig: [
    { symbol: 'AAPL', sector: 'Technology' },
    { symbol: 'VOO', sector: 'Index' },
    { symbol: 'BND', sector: 'Bond' },
  ],
};

describe('lessonTriggers', () => {
  describe('evaluateTradeTriggers', () => {
    it('awards first_trade badge and unlocks market_clearing on any successful trade', () => {
      const result = evaluateTradeTriggers({ ...baseTradeContext, qty: 5 });
      expect(result.badgesToEarn.some(b => b.id === 'first_trade')).toBe(true);
      expect(result.lessonsToUnlock).toContain('market_clearing');
    });

    it('does nothing for zero-quantity trades', () => {
      const result = evaluateTradeTriggers({ ...baseTradeContext, qty: 0 });
      expect(result.badgesToEarn).toHaveLength(0);
      expect(result.lessonsToUnlock).toHaveLength(0);
    });

    it('unlocks overtrading lesson when 3+ same-stock trades in a day', () => {
      const result = evaluateTradeTriggers({ ...baseTradeContext, currentDayTransCount: 3 });
      expect(result.lessonsToUnlock).toContain('overtrading');
    });

    it('flags concentration risk when single stock > 45% of portfolio', () => {
      const result = evaluateTradeTriggers({
        ...baseTradeContext,
        holdings: { AAPL: { shares: 400, totalCost: 50000 } },
        totalPortfolioValue: 100000,
      });
      expect(result.lessonsToUnlock).toContain('concentration_risk');
    });

    it('excludes VOO and BND from concentration check', () => {
      const result = evaluateTradeTriggers({
        ...baseTradeContext,
        symbol: 'VOO',
        holdings: { VOO: { shares: 500, totalCost: 50000 } },
        totalPortfolioValue: 100000,
      });
      expect(result.lessonsToUnlock).not.toContain('concentration_risk');
    });

    it('awards diversified_guard when 5+ holdings across 3+ sectors', () => {
      const result = evaluateTradeTriggers({
        ...baseTradeContext,
        holdings: {
          AAPL: { shares: 10, totalCost: 1500 },
          MSFT: { shares: 10, totalCost: 3000 },
          JPM: { shares: 10, totalCost: 1500 },
          XOM: { shares: 10, totalCost: 1000 },
          JNJ: { shares: 10, totalCost: 1500 },
        },
        assetsConfig: [
          { symbol: 'AAPL', sector: 'Technology' },
          { symbol: 'MSFT', sector: 'Technology' },
          { symbol: 'JPM', sector: 'Financial' },
          { symbol: 'XOM', sector: 'Energy' },
          { symbol: 'JNJ', sector: 'Healthcare' },
        ],
      });
      expect(result.badgesToEarn.some(b => b.id === 'diversified_guard')).toBe(true);
    });

    it('unlocks sector_diversification lesson when 5+ holdings but < 3 sectors', () => {
      const result = evaluateTradeTriggers({
        ...baseTradeContext,
        holdings: {
          AAPL: { shares: 10, totalCost: 1500 },
          MSFT: { shares: 10, totalCost: 3000 },
          GOOGL: { shares: 10, totalCost: 1500 },
          META: { shares: 10, totalCost: 3000 },
          NVDA: { shares: 10, totalCost: 5000 },
        },
        assetsConfig: [
          { symbol: 'AAPL', sector: 'Technology' },
          { symbol: 'MSFT', sector: 'Technology' },
          { symbol: 'GOOGL', sector: 'Technology' },
          { symbol: 'META', sector: 'Technology' },
          { symbol: 'NVDA', sector: 'Technology' },
        ],
      });
      expect(result.lessonsToUnlock).toContain('sector_diversification');
    });

    it('unlocks loss_aversion lesson on losing sell', () => {
      const result = evaluateTradeTriggers({
        ...baseTradeContext,
        side: 'sell',
        realizedPL: -500,
      });
      expect(result.lessonsToUnlock).toContain('loss_aversion');
    });

    it('does not unlock loss_aversion on winning sell', () => {
      const result = evaluateTradeTriggers({
        ...baseTradeContext,
        side: 'sell',
        realizedPL: 500,
      });
      expect(result.lessonsToUnlock).not.toContain('loss_aversion');
    });
  });

  describe('evaluateDayAdvanceTriggers', () => {
    it('awards steady_hands on day 7 without panic sells', () => {
      const result = evaluateDayAdvanceTriggers({
        day: 7,
        tradeLogs: ['Day 1: Bought AAPL', 'Day 7: Held all positions'],
      });
      expect(result.badgesToEarn.some(b => b.id === 'steady_hands')).toBe(true);
    });

    it('does not award steady_hands if panic sold on day 7', () => {
      const result = evaluateDayAdvanceTriggers({
        day: 7,
        tradeLogs: ['Day 7: Sold AAPL at loss'],
      });
      expect(result.badgesToEarn).toHaveLength(0);
    });

    it('does nothing on other days', () => {
      const result = evaluateDayAdvanceTriggers({
        day: 5,
        tradeLogs: ['Day 5: Bought AAPL'],
      });
      expect(result.badgesToEarn).toHaveLength(0);
      expect(result.lessonsToUnlock).toHaveLength(0);
    });
  });

  describe('evaluateGameOverTriggers', () => {
    it('awards index_beater when final value beats benchmark', () => {
      const result = evaluateGameOverTriggers({
        finalPortfolioValue: 120000,
        benchmarkValue: 100000,
      });
      expect(result.badgesToEarn.some(b => b.id === 'index_beater')).toBe(true);
    });

    it('does not award index_beater when underperforming', () => {
      const result = evaluateGameOverTriggers({
        finalPortfolioValue: 90000,
        benchmarkValue: 100000,
      });
      expect(result.badgesToEarn).toHaveLength(0);
    });
  });
});
