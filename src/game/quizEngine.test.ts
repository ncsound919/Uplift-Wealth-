import { describe, it, expect } from 'vitest';
import {
  shuffle,
  inferDifficulty,
  buildMillionaireQueue,
  buildSpeedQueue,
  createAudiencePoll,
  createExpertAdvice,
  create5050,
  scoreSpeedQuestion,
  safePrizeForTier,
  MONEY_LADDER,
} from './quizEngine';
import { ExtendedQuizQuestion } from './quizTypes';

const makeQ = (id: string, points = 100): ExtendedQuizQuestion => ({
  id,
  category: 'test',
  question: `Question ${id}?`,
  options: ['A', 'B', 'C', 'D'],
  correctIndex: 0,
  explanation: 'Test explanation',
  points,
  difficulty: undefined,
});

describe('shuffle', () => {
  it('returns array of same length', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(shuffle(arr)).toHaveLength(arr.length);
  });

  it('contains all original elements', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(shuffle(arr).sort()).toEqual(arr.sort());
  });

  it('does not mutate original', () => {
    const arr = [1, 2, 3, 4, 5];
    const copy = [...arr];
    shuffle(arr);
    expect(arr).toEqual(copy);
  });
});

describe('inferDifficulty', () => {
  it('returns explicit difficulty if set', () => {
    const q = makeQ('q1');
    q.difficulty = 'expert';
    expect(inferDifficulty(q)).toBe('expert');
  });

  it('returns beginner for low points', () => {
    expect(inferDifficulty(makeQ('q1', 100))).toBe('beginner');
  });

  it('returns intermediate for medium points', () => {
    expect(inferDifficulty(makeQ('q1', 300))).toBe('intermediate');
  });

  it('returns expert for high points', () => {
    expect(inferDifficulty(makeQ('q1', 500))).toBe('expert');
  });
});

describe('buildMillionaireQueue', () => {
  it('returns 15 questions', () => {
    const bank = Array.from({ length: 30 }, (_, i) => makeQ(`q${i}`, i * 50));
    const queue = buildMillionaireQueue(bank);
    expect(queue).toHaveLength(15);
  });

  it('returns empty for empty bank', () => {
    expect(buildMillionaireQueue([])).toHaveLength(0);
  });

  it('starts with beginner questions', () => {
    const bank = Array.from({ length: 20 }, (_, i) => makeQ(`q${i}`, 100));
    const queue = buildMillionaireQueue(bank);
    expect(inferDifficulty(queue[0])).toBe('beginner');
  });
});

describe('buildSpeedQueue', () => {
  it('returns default 20 questions', () => {
    const bank = Array.from({ length: 30 }, (_, i) => makeQ(`q${i}`));
    expect(buildSpeedQueue(bank)).toHaveLength(20);
  });

  it('respects custom count', () => {
    const bank = Array.from({ length: 30 }, (_, i) => makeQ(`q${i}`));
    expect(buildSpeedQueue(bank, 10)).toHaveLength(10);
  });

  it('returns all if bank is smaller than count', () => {
    const bank = Array.from({ length: 5 }, (_, i) => makeQ(`q${i}`));
    expect(buildSpeedQueue(bank, 20)).toHaveLength(5);
  });
});

describe('createAudiencePoll', () => {
  it('returns percentages that sum to ~100', () => {
    const q = makeQ('q1');
    const poll = createAudiencePoll(q, []);
    const sum = poll.values.reduce((a, b) => a + b, 0);
    expect(sum).toBe(100);
  });

  it('gives most weight to correct answer', () => {
    const q = makeQ('q1');
    const poll = createAudiencePoll(q, []);
    expect(poll.values[q.correctIndex]).toBeGreaterThan(50);
  });

  it('handles disabled options correctly', () => {
    const q = makeQ('q1');
    const poll = createAudiencePoll(q, [1, 2]);
    expect(poll.values[1]).toBe(0);
    expect(poll.values[2]).toBe(0);
    expect(poll.values[q.correctIndex]).toBeGreaterThan(50);
  });
});

describe('createExpertAdvice', () => {
  it('returns an expert object', () => {
    const q = makeQ('q1');
    const expert = createExpertAdvice(q);
    expect(expert.name).toBeTruthy();
    expect(expert.title).toBeTruthy();
    expect(expert.quote).toBeTruthy();
    expect(expert.confidence).toBeGreaterThan(0);
  });

  it('always points to correct answer', () => {
    const q = makeQ('q1');
    for (let i = 0; i < 10; i++) {
      const expert = createExpertAdvice(q);
      expect(expert.quote).toContain('Option A');
    }
  });
});

describe('create5050', () => {
  it('removes 2 wrong options', () => {
    const q = makeQ('q1');
    const toRemove = create5050(q, []);
    expect(toRemove).toHaveLength(2);
    expect(toRemove).not.toContain(q.correctIndex);
  });
});

describe('scoreSpeedQuestion', () => {
  it('base score for no streak', () => {
    expect(scoreSpeedQuestion(100, 1)).toBe(100);
  });

  it('multiplied score for streak', () => {
    expect(scoreSpeedQuestion(100, 5)).toBe(180);
  });

  it('caps at 2x multiplier', () => {
    expect(scoreSpeedQuestion(100, 10)).toBe(200);
  });
});

describe('safePrizeForTier', () => {
  it('returns $0 for tier before first safe', () => {
    expect(safePrizeForTier(0)).toBe('$0');
  });

  it('returns correct safe prize', () => {
    expect(safePrizeForTier(4)).toBe('$1,000');
    expect(safePrizeForTier(9)).toBe('$32,000');
    expect(safePrizeForTier(14)).toBe('$1,000,000');
  });

  it('returns $0 for an out-of-range tier index', () => {
    expect(safePrizeForTier(-1)).toBe('$0');
    expect(safePrizeForTier(15)).toBe('$0');
    expect(safePrizeForTier(100)).toBe('$0');
  });
});

describe('MONEY_LADDER', () => {
  it('has 15 tiers', () => {
    expect(MONEY_LADDER).toHaveLength(15);
  });

  it('every tier has prize, level, value', () => {
    for (const tier of MONEY_LADDER) {
      expect(tier.level).toBeGreaterThan(0);
      expect(tier.value).toBeGreaterThan(0);
      expect(tier.prize).toBeTruthy();
    }
  });

  it('values increase with levels', () => {
    for (let i = 1; i < MONEY_LADDER.length; i++) {
      expect(MONEY_LADDER[i].value).toBeGreaterThan(MONEY_LADDER[i - 1].value);
    }
  });

  it('tiers 5, 10, 15 are safe havens', () => {
    expect(MONEY_LADDER[4].safe).toBe(true);
    expect(MONEY_LADDER[9].safe).toBe(true);
    expect(MONEY_LADDER[14].safe).toBe(true);
  });
});
