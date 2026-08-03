import { ExtendedQuizQuestion, Difficulty, MoneyTier, AudiencePollResult, ExpertAdvice } from './quizTypes';

export const MONEY_LADDER: MoneyTier[] = [
  { level: 1, prize: '$100', value: 100, safe: false },
  { level: 2, prize: '$200', value: 200, safe: false },
  { level: 3, prize: '$300', value: 300, safe: false },
  { level: 4, prize: '$500', value: 500, safe: false },
  { level: 5, prize: '$1,000', value: 1000, safe: true },
  { level: 6, prize: '$2,000', value: 2000, safe: false },
  { level: 7, prize: '$4,000', value: 4000, safe: false },
  { level: 8, prize: '$8,000', value: 8000, safe: false },
  { level: 9, prize: '$16,000', value: 16000, safe: false },
  { level: 10, prize: '$32,000', value: 32000, safe: true },
  { level: 11, prize: '$64,000', value: 64000, safe: false },
  { level: 12, prize: '$125,000', value: 125000, safe: false },
  { level: 13, prize: '$250,000', value: 250000, safe: false },
  { level: 14, prize: '$500,000', value: 500000, safe: false },
  { level: 15, prize: '$1,000,000', value: 1000000, safe: true }
];

export function inferDifficulty(q: ExtendedQuizQuestion): Difficulty {
  if (q.difficulty) return q.difficulty;
  if (q.points >= 500) return 'expert';
  if (q.points >= 300) return 'intermediate';
  return 'beginner';
}

export function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function buildMillionaireQueue(bank: ExtendedQuizQuestion[]): ExtendedQuizQuestion[] {
  const buckets: Record<Difficulty, ExtendedQuizQuestion[]> = {
    beginner: shuffle(bank.filter(q => inferDifficulty(q) === 'beginner')),
    intermediate: shuffle(bank.filter(q => inferDifficulty(q) === 'intermediate')),
    expert: shuffle(bank.filter(q => inferDifficulty(q) === 'expert')),
  };
  const plan: Difficulty[] = [
    'beginner', 'beginner', 'beginner', 'beginner',
    'intermediate', 'intermediate', 'intermediate', 'intermediate', 'intermediate',
    'expert', 'expert', 'expert', 'expert', 'expert', 'expert'
  ];
  const used = new Set<string>();
  const queue: ExtendedQuizQuestion[] = [];
  for (const level of plan) {
    let pick = buckets[level].find(q => !used.has(q.id));
    if (!pick) {
      for (const alt of ['beginner', 'intermediate', 'expert'] as Difficulty[]) {
        pick = buckets[alt].find(q => !used.has(q.id));
        if (pick) break;
      }
    }
    if (pick) {
      used.add(pick.id);
      queue.push(pick);
    }
  }
  return queue;
}

export function buildSpeedQueue(bank: ExtendedQuizQuestion[], count = 20): ExtendedQuizQuestion[] {
  return shuffle(bank).slice(0, count);
}

export function createAudiencePoll(question: ExtendedQuizQuestion, disabledOptions: number[]): AudiencePollResult {
  const poll = [0, 0, 0, 0];
  const correctIdx = question.correctIndex;
  let correctShare = 55 + Math.floor(Math.random() * 25);
  if (disabledOptions.length > 0) correctShare += 10;
  correctShare = Math.min(92, correctShare);
  poll[correctIdx] = correctShare;
  let remaining = 100 - correctShare;
  const otherIndices = [0, 1, 2, 3].filter(i => i !== correctIdx && !disabledOptions.includes(i));
  otherIndices.forEach((idx, i) => {
    if (i === otherIndices.length - 1) {
      poll[idx] = remaining;
    } else {
      const share = Math.floor(Math.random() * (remaining + 1));
      poll[idx] = share;
      remaining -= share;
    }
  });
  return { values: poll };
}

export function createExpertAdvice(question: ExtendedQuizQuestion): ExpertAdvice {
  const experts: ExpertAdvice[] = [
    {
      name: 'Dr. Satoshi Nakamoto',
      title: 'Cryptographic Protocol Pioneer',
      quote: `I am highly confident the correct answer is Option ${String.fromCharCode(65 + question.correctIndex)} based on the structure of the problem.`,
      confidence: 90,
    },
    {
      name: 'Ada Lovelace',
      title: 'Chief Software & Algo Architect',
      quote: `Option ${String.fromCharCode(65 + question.correctIndex)} best matches the system logic and the numerical assumptions behind the question.`,
      confidence: 95,
    },
    {
      name: 'Jerome Powell',
      title: 'Monetary Policy & Liquidity Expert',
      quote: `Our policy review points to Option ${String.fromCharCode(65 + question.correctIndex)} as the strongest answer here.`,
      confidence: 88,
    },
  ];
  return experts[Math.floor(Math.random() * experts.length)];
}

export function create5050(question: ExtendedQuizQuestion, disabledOptions: number[]): number[] {
  const wrong = question.options.map((_, i) => i).filter(i => i !== question.correctIndex && !disabledOptions.includes(i));
  return shuffle(wrong).slice(0, 2);
}

export function scoreSpeedQuestion(basePoints: number, streak: number): number {
  const multiplier = Math.min(2, 1 + Math.max(0, streak - 1) * 0.2);
  return Math.round(basePoints * multiplier);
}

export function safePrizeForTier(currentTierIndex: number): string {
  const tier = MONEY_LADDER[currentTierIndex];
  if (!tier) return '$0';
  const safe = [...MONEY_LADDER].slice(0, currentTierIndex + 1).filter(t => t.safe).at(-1);
  return safe?.prize ?? '$0';
}
