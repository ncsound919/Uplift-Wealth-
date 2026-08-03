import React, { ComponentType } from 'react';
import { motion } from 'motion/react';
import { Module, CourseLevel } from '../data/courseData';
import { cn } from '../lib/utils';
import { resolveIcon } from '../utils/iconResolver';
import { FintechMasteryInfographic } from './FintechMasteryInfographic';
import { 
  CheckCircle2, 
  Lock, 
  Play, 
  Award, 
  Flame, 
  Trophy, 
  Globe, 
  Cpu, 
  Coins, 
  LineChart, 
  CloudRain, 
  Activity, 
  ShieldAlert, 
  Sparkles, 
  BookOpen,
  Target,
  Plus,
  Edit3,
  Trash2,
  Heart,
  ShieldCheck,
  Building2,
  Users,
  TrendingUp,
  Landmark
} from 'lucide-react';

interface DashboardProps {
  modules: Module[];
  completedModules: string[];
  onSelectModule: (moduleId: string) => void;
  activeLevel: CourseLevel;
  onSelectLevel: (level: CourseLevel) => void;
  xp: number;
  streak: number;
  badges: string[];
  completedLessonsCount: number;
  onCreateCustomModule?: () => void;
  onEditCustomModule?: (module: Module) => void;
  onDeleteCustomModule?: (moduleId: string) => void;
}

export interface BadgeInfo {
  id: string;
  title: string;
  description: string;
  moduleId: string;
  icon: ComponentType<{ size?: number; strokeWidth?: number }>;
  color: string;
}

const BADGES: BadgeInfo[] = [
  { id: 'wise_wizard', title: 'Remittance Wizard', description: 'Mastered global currency corridors & peer matching.', moduleId: 'module-1', icon: Globe, color: 'bg-indigo-600' },
  { id: 'card_commander', title: 'Card Rail Expert', description: 'Mastered credit authorization and processing unit economics.', moduleId: 'module-2', icon: Cpu, color: 'bg-sky-500' },
  { id: 'api_architect', title: 'BaaS Integrator', description: 'Linked secure open banking core ledgers via APIs.', moduleId: 'module-3', icon: Cpu, color: 'bg-emerald-600' },
  { id: 'credit_analyst', title: 'Inclusive Underwriter', description: 'Shed legacy credit bias using alternative cashflow indices.', moduleId: 'module-4', icon: Coins, color: 'bg-amber-600' },
  { id: 'market_maker', title: 'Portfolio Arbitrageur', description: 'Beat index volatility in the trading terminal.', moduleId: 'module-5', icon: LineChart, color: 'bg-emerald-500' },
  { id: 'weather_oracle', title: 'Parametric Operator', description: 'Executed rainfall indices smart contract triggers.', moduleId: 'module-6', icon: CloudRain, color: 'bg-blue-700' },
  { id: 'crypto_pioneer', title: 'DeFi Protocol Pioneer', description: 'Traded stable assets against smart AMM liquidity pools.', moduleId: 'module-7', icon: Activity, color: 'bg-purple-600' },
  { id: 'compliance_officer', title: 'Forensic Risk Agent', description: 'Blocked money laundering and structuring alerts.', moduleId: 'module-8', icon: ShieldAlert, color: 'bg-slate-700' },
  { id: 'capstone_champion', title: 'Fintech Venture Founder', description: 'Successfully stress-tested and certified a seed venture.', moduleId: 'module-12', icon: Award, color: 'bg-indigo-900' }
];

export function Dashboard({ 
  modules, 
  completedModules, 
  onSelectModule, 
  activeLevel, 
  onSelectLevel,
  xp,
  streak,
  badges,
  completedLessonsCount,
  onCreateCustomModule,
  onEditCustomModule,
  onDeleteCustomModule
}: DashboardProps) {
  
  const levels: { id: CourseLevel; label: string }[] = [
    { id: 'beginner', label: 'Beginner' },
    { id: 'intermediate', label: 'Intermediate' },
    { id: 'expert', label: 'Expert' }
  ];

  // XP calculation
  const currentLevel = Math.floor(Math.sqrt(xp / 100)) + 1;
  const xpForCurrentLevel = Math.pow(currentLevel - 1, 2) * 100;
  const xpForNextLevel = Math.pow(currentLevel, 2) * 100;
  const xpInLevel = xp - xpForCurrentLevel;
  const levelRange = xpForNextLevel - xpForCurrentLevel;
  const xpPercentage = Math.min((xpInLevel / levelRange) * 100, 100);

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-12">
      
      {/* Title Header */}
      <div className="text-center pt-8 pb-4 space-y-4">
        <h1 className="text-4xl md:text-6xl font-display font-black text-slate-900 dark:text-white tracking-tight">
          Master Modern Money & Financial Tech
        </h1>
        
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed">
          An easy, step-by-step guide to how modern money works: from digital payments and bank apps to stocks, crypto, and starting your own app.
        </p>
      </div>


      {/* Blueprint Roadmap (Serves as Formal Class Directory) */}
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-4 md:p-8 shadow-sm relative overflow-hidden ring-1 ring-blue-500/20 dark:ring-blue-500/30 shadow-blue-500/5">
          {/* Subtle Ambient Glow Effect Behind Roadmap */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none -mt-20 -mr-20" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-3xl pointer-events-none -mb-20 -ml-20" />
          
          <FintechMasteryInfographic 
            completedModules={completedModules}
            onSelectModule={onSelectModule}
          />
        </div>
      </div>
    </div>
  );
}
