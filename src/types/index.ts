export interface User {
  id: string;
  email: string;
  fullName: string;
  goals: string[];
  skills: string[];
  subscriptionTier: 'Free' | 'Premium' | 'Pro';
  onboardingResults?: Record<string, any>;
  createdAt: Date;
}

export interface PortfolioAsset {
  id: string;
  userId: string;
  assetType: 'stocks' | 'crypto' | 'bonds' | 'cash';
  ticker: string;
  name: string;
  quantity: number;
  valueUSD: number;
  date: Date;
  simulated: boolean;
}

export interface PortfolioSummary {
  totalValue: number;
  dayChange: number;
  dayChangePercent: number;
  assets: PortfolioAsset[];
}

export interface FinancialGoal {
  id: string;
  userId: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: Date;
  category: 'retirement' | 'emergency' | 'investment' | 'home' | 'education' | 'other';
}

export interface LearningModule {
  id: string;
  title: string;
  category: 'beginner' | 'intermediate' | 'advanced';
  topic: 'basics' | 'investing' | 'crypto' | 'trading' | 'budgeting' | 'taxes';
  description: string;
  durationMinutes: number;
  completed: boolean;
  content?: string;
  quizQuestions?: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface RevenueIdea {
  id: string;
  title: string;
  description: string;
  estimatedRevenueRange: string;
  skillMatchScore: number;
  difficulty: 'easy' | 'medium' | 'hard';
  timeCommitment: string;
  requiredSkills: string[];
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'buy' | 'sell' | 'deposit' | 'withdrawal';
  asset: string;
  amount: number;
  price: number;
  profitLoss?: number;
  date: Date;
  simulated: boolean;
}
