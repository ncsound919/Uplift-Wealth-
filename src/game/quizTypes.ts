export type Difficulty = 'beginner' | 'intermediate' | 'expert';
export type GameMode = 'millionaire' | 'speed';

export interface ExtendedQuizQuestion {
  id: string;
  category: string;
  points: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty?: Difficulty;
  diagram?: any;
}

export interface MoneyTier {
  level: number;
  prize: string;
  value: number;
  safe: boolean;
}

export interface LifelinesState {
  fiftyFifty: boolean;
  askAudience: boolean;
  phoneExpert: boolean;
  doubleDip: boolean;
}

export interface CategoryStat {
  total: number;
  correct: number;
}

export interface SessionAnswer {
  questionId: string;
  category: string;
  selectedIndex: number;
  correctIndex: number;
  correct: boolean;
  timeSpentSec: number;
  mode: GameMode;
  tierIndex?: number;
  pointsEarned: number;
  answeredAt: string;
}

export interface AudiencePollResult {
  values: number[];
}

export interface ExpertAdvice {
  name: string;
  title: string;
  quote: string;
  confidence: number;
}

export interface QuizSessionSnapshot {
  gameMode: GameMode;
  currentQuestionIndex: number;
  currentTierIndex: number;
  score: number;
  streak: number;
  maxStreak: number;
  correctCount: number;
  safeHavenPrize: string;
  accumulatedPrize: string;
  timeLeft: number;
  lifelines: LifelinesState;
}
