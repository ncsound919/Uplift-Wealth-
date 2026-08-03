export interface ReviewCard {
  id: string;
  question: string;
  answer: string;
  explanation: string;
}

export interface ScheduleEntry {
  cardId: string;
  dueDate: string;
  ease: number;
  interval: number;
  repetitions: number;
  lastReview: string | null;
}

const STORAGE_KEY = 'spaced_repetition_schedule';

export function loadSchedule(): ScheduleEntry[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveSchedule(entries: ScheduleEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function sm2(entry: ScheduleEntry, quality: number): ScheduleEntry {
  const q = Math.min(5, Math.max(0, quality));

  if (q < 3) {
    return {
      ...entry,
      repetitions: 0,
      interval: 1,
      ease: Math.max(1.3, entry.ease - 0.2),
      lastReview: new Date().toISOString(),
      dueDate: getDueDate(1),
    };
  }

  let newEase = entry.ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  newEase = Math.max(1.3, newEase);

  let newInterval: number;
  if (entry.repetitions === 0) {
    newInterval = 1;
  } else if (entry.repetitions === 1) {
    newInterval = 6;
  } else {
    newInterval = Math.round(entry.interval * newEase);
  }

  return {
    ...entry,
    repetitions: entry.repetitions + 1,
    ease: newEase,
    interval: newInterval,
    lastReview: new Date().toISOString(),
    dueDate: getDueDate(newInterval),
  };
}

function getDueDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString();
}

export function recordReview(cardId: string, quality: number) {
  const schedule = loadSchedule();
  const existing = schedule.find(e => e.cardId === cardId);

  if (existing) {
    const updated = sm2(existing, quality);
    saveSchedule(schedule.map(e => e.cardId === cardId ? updated : e));
  } else {
    const entry: ScheduleEntry = {
      cardId,
      dueDate: getDueDate(1),
      ease: 2.5,
      interval: 1,
      repetitions: 0,
      lastReview: new Date().toISOString(),
    };
    saveSchedule([...schedule, entry]);
  }
}

export function getDueCards(): ScheduleEntry[] {
  const now = new Date().toISOString();
  return loadSchedule().filter(e => e.dueDate <= now);
}

export function getDueCount(): number {
  return getDueCards().length;
}

export function getReviewStats() {
  const schedule = loadSchedule();
  const now = new Date().toISOString();
  const due = schedule.filter(e => e.dueDate <= now).length;
  const reviewed = schedule.filter(e => e.lastReview).length;
  return { total: schedule.length, due, reviewed };
}

export function buildQuizCards(): ReviewCard[] {
  const modules = [
    { id: 'm0', title: 'Foundations', questions: [
      { q: 'What are the three functions of money?', a: 'Medium of exchange, store of value, unit of account', e: 'Money serves as a universal medium for transactions, retains purchasing power over time, and provides a standard unit for pricing.' },
      { q: 'What is the difference between fiat and commodity money?', a: 'Fiat money has value by government decree; commodity money is backed by intrinsic value (gold, silver)', e: 'Modern currencies like USD are fiat; historical gold coins were commodity money.' },
      { q: 'What is a stock?', a: 'A stock represents fractional ownership in a corporation', e: 'When you buy a share, you own a tiny piece of the company\'s assets and future earnings.' },
    ]},
    { id: 'm1', title: 'Banking', questions: [
      { q: 'What is fractional reserve banking?', a: 'Banks hold only a fraction of deposits as reserves and lend out the remainder', e: 'This system expands the money supply through the money multiplier effect.' },
      { q: 'What is the Federal Funds Rate?', a: 'The benchmark rate at which banks lend reserves to each other overnight', e: 'Set by the Federal Reserve, it influences all other interest rates in the economy.' },
      { q: 'What is a central bank\'s primary role?', a: 'Monetary policy, financial stability, and serving as lender of last resort', e: 'Central banks control money supply and interest rates to manage inflation and employment.' },
    ]},
    { id: 'm2', title: 'Payments', questions: [
      { q: 'What are the four parties in a card payment transaction?', a: 'Cardholder, merchant, acquirer (merchant bank), and issuer (cardholder bank)', e: 'The card network (Visa/Mastercard) routes transactions between acquirers and issuers.' },
      { q: 'What is an interchange fee?', a: 'A fee paid by the merchant\'s bank to the cardholder\'s bank for each transaction', e: 'Interchange fees help cover fraud risk and the cost of extending credit to cardholders.' },
    ]},
    { id: 'm3', title: 'BaaS', questions: [
      { q: 'What is Banking-as-a-Service?', a: 'BaaS allows non-banks to access banking infrastructure via APIs', e: 'Companies can embed financial services without becoming licensed banks themselves.' },
      { q: 'What is the difference between a BaaS provider and a sponsor bank?', a: 'The sponsor bank holds the charter and regulatory responsibility; the BaaS provider supplies the API layer', e: 'The sponsor bank is the regulated entity; BaaS middleware connects fintech apps to banking systems.' },
    ]},
    { id: 'm5', title: 'Crypto', questions: [
      { q: 'What is Proof of Work vs Proof of Stake?', a: 'PoW: miners solve puzzles expending energy. PoS: validators lock tokens as collateral', e: 'PoS is more energy-efficient; Ethereum switched from PoW to PoS in 2022.' },
      { q: 'What is a blockchain?', a: 'A distributed, tamper-proof digital ledger maintained by a network of nodes', e: 'Each block contains a cryptographic hash of the previous block, creating an immutable chain.' },
    ]},
    { id: 'm6', title: 'DeFi', questions: [
      { q: 'What is a liquidity pool?', a: 'A smart contract that holds reserves of two tokens to facilitate decentralized trading', e: 'Liquidity providers earn fees from trades executed against the pool.' },
    ]},
    { id: 'm7', title: 'WealthTech', questions: [
      { q: 'What is Modern Portfolio Theory?', a: 'An investment framework that optimizes the balance between risk and return through diversification', e: 'MPT uses the efficient frontier to find portfolios with maximum return for a given risk level.' },
    ]},
    { id: 'm11', title: 'Cybersecurity', questions: [
      { q: 'What is the difference between encryption at rest and in transit?', a: 'At rest: data stored on disk is encrypted. In transit: data moving over network is encrypted (TLS/SSL)', e: 'Both are essential for financial data protection compliance.' },
    ]},
  ];

  const cards: ReviewCard[] = [];
  for (const mod of modules) {
    for (const q of mod.questions) {
      cards.push({
        id: `review-${mod.id}-${q.q.slice(0, 20)}`,
        question: q.q,
        answer: q.a,
        explanation: q.e,
      });
    }
  }
  return cards;
}
