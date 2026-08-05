import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Dashboard } from './components/Dashboard';
import { PageMeta } from './components/PageMeta';
import { SearchModal } from './components/SearchModal';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { AuthModal } from './components/AuthModal';
import { Certificate } from './components/Certificate';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingFallback } from './components/LoadingFallback';

const ModuleView = lazy(() => import('./components/ModuleView').then(m => ({ default: m.ModuleView })));
const ModuleBuilder = lazy(() => import('./components/ModuleBuilder').then(m => ({ default: m.ModuleBuilder })));
const KnowledgeBase = lazy(() => import('./components/KnowledgeBase').then(m => ({ default: m.KnowledgeBase })));
const AdminDashboard = lazy(() => import('./components/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const ArchitectureOfExtraction = lazy(() => import('./components/ArchitectureOfExtraction').then(m => ({ default: m.ArchitectureOfExtraction })));
const DonationView = lazy(() => import('./components/DonationView').then(m => ({ default: m.DonationView })));
const FintechStarterMap = lazy(() => import('./components/FintechStarterMap').then(m => ({ default: m.FintechStarterMap })));
const FinanceGlossary = lazy(() => import('./components/FinanceGlossary').then(m => ({ default: m.FinanceGlossary })));
const ConnectingTheDotsArticle = lazy(() => import('./components/ConnectingTheDotsArticle').then(m => ({ default: m.ConnectingTheDotsArticle })));
const FintechBusinessBuilder = lazy(() => import('./components/FintechBusinessBuilder').then(m => ({ default: m.FintechBusinessBuilder })));
const ProgressDashboard = lazy(() => import('./components/ProgressDashboard').then(m => ({ default: m.ProgressDashboard })));


const WealthBuilding = lazy(() => import('./components/WealthBuilding').then(m => ({ default: m.WealthBuilding })));
const CreditMastery = lazy(() => import('./components/wealth/CreditMastery').then(m => ({ default: m.CreditMastery })));
const InvestingIRAs = lazy(() => import('./components/wealth/InvestingIRAs').then(m => ({ default: m.InvestingIRAs })));
const RealEstate = lazy(() => import('./components/wealth/RealEstate').then(m => ({ default: m.RealEstate })));
const BusinessBuilding = lazy(() => import('./components/wealth/BusinessBuilding').then(m => ({ default: m.BusinessBuilding })));
const GroupEconomics = lazy(() => import('./components/wealth/GroupEconomics').then(m => ({ default: m.GroupEconomics })));
const SideHustles = lazy(() => import('./components/wealth/SideHustles').then(m => ({ default: m.SideHustles })));
const EmergencyFund = lazy(() => import('./components/wealth/EmergencyFund').then(m => ({ default: m.EmergencyFund })));
const NotFound = lazy(() => import('./components/NotFound').then(m => ({ default: m.NotFound })));
const StudentProfile = lazy(() => import('./components/StudentProfile').then(m => ({ default: m.StudentProfile })));
const GamesHub = lazy(() => import('./components/GamesHub').then(m => ({ default: m.GamesHub })));
const StandaloneGameView = lazy(() => import('./components/StandaloneGameView').then(m => ({ default: m.StandaloneGameView })));

import { Module, courseModules, CourseLevel } from './data/courseData';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, PanelLeftClose, PanelLeftOpen, 
  Trophy, 
  Sparkles, 
  RefreshCw, 
  Layers, 
  Menu,
  X,
  Moon,
  Sun,
  User,
  Clock,
  Gamepad2,
  CheckCircle2,
  ArrowLeft,
  Heart,
  DollarSign,
  LogIn,
  LogOut,
  ShieldCheck,
  ExternalLink,
  MapPin,
  Briefcase,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from './lib/utils';
import { capture } from './lib/analytics';
import confetti from 'canvas-confetti';
import { apiClient, UserProfile } from './lib/apiClient';

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  // dashboardTab reserved for future tab switching
  
  // Auth state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => apiClient.getStoredUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [certModuleId, setCertModuleId] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Sidebar Views and settings states
  const [activeView, setActiveView] = useState<'dashboard' | 'knowledge' | 'builder' | 'profile' | 'game' | 'games' | 'donation' | 'architecture' | 'fintech_map' | 'business_builder' | 'glossary' | 'dots_article' | 'admin' | 'wealth_building' | 'wealth_credit' | 'wealth_investing' | 'wealth_real_estate' | 'wealth_business' | 'wealth_group_economics' | 'wealth_side_hustles' | 'wealth_emergency_fund' | 'not_found'>('dashboard');
  const [activeDirectGame, setActiveDirectGame] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('is_dark_mode') !== 'false';
  });
  
  const [gameTimeSeconds, setGameTimeSeconds] = useState<number>(() => {
    return parseInt(localStorage.getItem('game_time_seconds') || '0', 10);
  });

  // Track isDarkMode
  useEffect(() => {
    localStorage.setItem('is_dark_mode', isDarkMode.toString());
  }, [isDarkMode]);

  // Track page views
  useEffect(() => {
    const titles: Record<string, string> = {
      dashboard: 'Dashboard',
      knowledge: 'Lecture Library',
      profile: 'My Profile',
      game: 'Game',
      games: 'Games',
      donation: 'Support',
      architecture: 'History of Black American Finance',
      fintech_map: 'Fintech Starter Map',
      business_builder: 'Business Builder',
      glossary: 'Finance Dictionary',
      dots_article: 'Connecting The Dots',
      admin: 'Admin Dashboard',
      wealth_building: 'Wealth Building',
      wealth_credit: 'Wealth Building — Credit Mastery',
      wealth_investing: 'Wealth Building — Investing & IRAs',
      wealth_real_estate: 'Wealth Building — Real Estate',
      wealth_business: 'Wealth Building — Business',
      wealth_group_economics: 'Wealth Building — Group Economics',
      wealth_side_hustles: 'Wealth Building — Side Hustles & Gig Income',
      wealth_emergency_fund: 'Wealth Building — Cash Flow & Emergency Fund',
    };
    capture('page_view', { path: location.pathname, title: titles[activeView] || activeView });
  }, [activeView, location.pathname]);

  // Sync server progress and health state
  useEffect(() => {
    apiClient.getProgress().then((progress) => {
      if (progress.completedLessons?.length) {
        setCompletedLessons((prev) => Array.from(new Set([...prev, ...progress.completedLessons])));
      }
      if (progress.completedModules?.length) {
        setCompletedModules((prev) => Array.from(new Set([...prev, ...progress.completedModules])));
      }
    }).catch((err) => console.log('[Server Sync] Using local cache:', err));
  }, []);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sync URL → state on initial load and browser back/forward
  useEffect(() => {
    const path = location.pathname;
    const match = path.match(/^\/module\/(\d+)$/);
    const gameMatch = path.match(/^\/game\/(\w+)$/);
    if (match) {
      const moduleId = `module-${match[1]}`;
      setActiveModuleId(moduleId);
      setActiveView('dashboard');
      setActiveDirectGame(null);
    } else if (gameMatch) {
      setActiveView('game');
      setActiveDirectGame(gameMatch[1]);
      setActiveModuleId(null);
    } else if (path === '/profile') {
      setActiveView('profile');
      setActiveModuleId(null);
      setActiveDirectGame(null);
    } else if (path === '/knowledge') {
      setActiveView('knowledge');
      setActiveModuleId(null);
      setActiveDirectGame(null);
    } else if (path === '/architecture') {
      setActiveView('architecture');
      setActiveModuleId(null);
      setActiveDirectGame(null);
    } else if (path === '/glossary') {
      setActiveView('glossary');
      setActiveModuleId(null);
      setActiveDirectGame(null);
    } else if (path === '/business-builder') {
      setActiveView('business_builder');
      setActiveModuleId(null);
      setActiveDirectGame(null);
    } else if (path === '/map') {
      setActiveView('fintech_map');
      setActiveModuleId(null);
      setActiveDirectGame(null);
    } else if (path === '/donate') {
      setActiveView('donation');
      setActiveModuleId(null);
      setActiveDirectGame(null);
    } else if (path === '/article') {
      setActiveView('dots_article');
      setActiveModuleId(null);
      setActiveDirectGame(null);
    } else if (path === '/games') {
      setActiveView('games');
      setActiveModuleId(null);
      setActiveDirectGame(null);
      setIsBuildingModule(false);
      setEditingModule(null);
    } else if (path === '/builder') {
      setIsBuildingModule(true);
      setActiveModuleId(null);
      setActiveDirectGame(null);
    } else if (path === '/progress') {
      setActiveView('profile');
      setActiveModuleId(null);
      setActiveDirectGame(null);
      navigate('/profile');
    } else if (path === '/wealth-building') {
      setActiveView('wealth_building');
      setActiveModuleId(null);
      setActiveDirectGame(null);
    } else if (path === '/wealth-building/credit') {
      setActiveView('wealth_credit');
      setActiveModuleId(null);
      setActiveDirectGame(null);
    } else if (path === '/wealth-building/investing') {
      setActiveView('wealth_investing');
      setActiveModuleId(null);
      setActiveDirectGame(null);
    } else if (path === '/wealth-building/real-estate') {
      setActiveView('wealth_real_estate');
      setActiveModuleId(null);
      setActiveDirectGame(null);
    } else if (path === '/wealth-building/business') {
      setActiveView('wealth_business');
      setActiveModuleId(null);
      setActiveDirectGame(null);
    } else if (path === '/wealth-building/group-economics') {
      setActiveView('wealth_group_economics');
      setActiveModuleId(null);
      setActiveDirectGame(null);
    } else if (path === '/wealth-building/side-hustles') {
      setActiveView('wealth_side_hustles');
      setActiveModuleId(null);
      setActiveDirectGame(null);
    } else if (path === '/wealth-building/emergency-fund') {
      setActiveView('wealth_emergency_fund');
      setActiveModuleId(null);
      setActiveDirectGame(null);
    } else if (path !== '/' && path !== '/profile' && path !== '/knowledge' && path !== '/architecture' && path !== '/glossary' && path !== '/business-builder' && path !== '/map' && path !== '/donate' && path !== '/article' && path !== '/builder' && path !== '/progress' && path !== '/games' && !path.startsWith('/module/') && !path.startsWith('/game/') && !path.startsWith('/wealth-building/')) {
      setActiveView('not_found');
      setActiveModuleId(null);
      setActiveDirectGame(null);
    } else {
      setActiveView('dashboard');
      setActiveModuleId(null);
      setActiveDirectGame(null);
      setIsBuildingModule(false);
      setEditingModule(null);
    }
  }, [location.pathname]);

  // Track game seconds with stable ref to avoid stale closures
  const gameTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const gameTimeRef = useRef(gameTimeSeconds);
  gameTimeRef.current = gameTimeSeconds;
  useEffect(() => {
    const isPlaying = activeDirectGame !== null || activeModuleId !== null;
    if (isPlaying && !gameTimerRef.current) {
      gameTimerRef.current = setInterval(() => {
        setGameTimeSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (gameTimerRef.current) {
        clearInterval(gameTimerRef.current);
        gameTimerRef.current = null;
        localStorage.setItem('game_time_seconds', gameTimeRef.current.toString());
      }
    };
  }, [activeDirectGame, activeModuleId]);
  
  // Custom Modules & Builder state
  const [customModules, setCustomModules] = useState<Module[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('custom_modules') || '[]');
    } catch {
      return [];
    }
  });
  const [isBuildingModule, setIsBuildingModule] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  
  // Gamified States
  const [completedModules, setCompletedModules] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('completed_modules') || '[]');
    } catch {
      return [];
    }
  });

  const [completedLessons, setCompletedLessons] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('completed_lessons') || '[]');
    } catch {
      return [];
    }
  });

  const [xp, setXp] = useState<number>(() => {
    return parseInt(localStorage.getItem('user_xp') || '0', 10);
  });

  const [streak, setStreak] = useState<number>(() => {
    return parseInt(localStorage.getItem('user_streak') || '3', 10);
  });

  const [badges, setBadges] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('user_badges') || '[]');
    } catch {
      return [];
    }
  });

  const [activeLevel, setActiveLevel] = useState<CourseLevel>('beginner');

  const [toasts, setToasts] = useState<{ id: string; message: string; sub: string; points?: number }[]>([]);

  const showToast = (message: string, sub: string, points?: number) => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts((prev) => [...prev, { id, message, sub, points }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const addXp = (amount: number, reason?: string) => {
    showToast("XP Earned!", `+${amount} XP ${reason ? `for ${reason}` : ''}`, amount);
    setXp((prev) => {
      const nextXp = prev + amount;
      localStorage.setItem('user_xp', nextXp.toString());
      
      // Calculate level up
      const currentLvl = Math.floor(Math.sqrt(prev / 100)) + 1;
      const nextLvl = Math.floor(Math.sqrt(nextXp / 100)) + 1;
      if (nextLvl > currentLvl) {
        // Trigger celebratory level-up confetti
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.4 },
          colors: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']
        });
        showToast("Level Up!", `Congratulations! You reached Level ${nextLvl}!`);
      }
      return nextXp;
    });
  };

  const handleLessonComplete = (lessonId: string, lessonType: string) => {
    if (!completedLessons.includes(lessonId)) {
      const newLessons = [...completedLessons, lessonId];
      setCompletedLessons(newLessons);
      localStorage.setItem('completed_lessons', JSON.stringify(newLessons));

      // Persist to Express backend server DB
      apiClient.saveLessonProgress(lessonId, activeModuleId || 'module-1').catch((err) => {
        console.warn('[API Client Sync Error]:', err);
      });

      // Reward XP based on lesson types
      let points = 50;
      let reason = 'Completing Material';
      if (lessonType === 'quiz') { points = 100; reason = 'Acing the Quiz'; }
      if (lessonType === 'game') { points = 150; reason = 'Finishing Sandbox Game'; }

      addXp(points, reason);

      // Increment streak
      setStreak(prev => {
        const nextStreak = prev + 1;
        localStorage.setItem('user_streak', nextStreak.toString());
        return nextStreak;
      });
    }
  };

  const handleModuleComplete = (moduleId: string) => {
    if (!completedModules.includes(moduleId)) {
      const newModules = [...completedModules, moduleId];
      setCompletedModules(newModules);
      localStorage.setItem('completed_modules', JSON.stringify(newModules));

      // Award whole module completion bonus
      addXp(200);

      // Unlock matching credentials/badges
      let badgeToUnlock = '';
      if (moduleId === 'module-1') badgeToUnlock = 'wise_wizard';
      if (moduleId === 'module-2') badgeToUnlock = 'card_commander';
      if (moduleId === 'module-3') badgeToUnlock = 'api_architect';
      if (moduleId === 'module-4') badgeToUnlock = 'credit_analyst';
      if (moduleId === 'module-5') badgeToUnlock = 'market_maker';
      if (moduleId === 'module-6') badgeToUnlock = 'weather_oracle';
      if (moduleId === 'module-7') badgeToUnlock = 'crypto_pioneer';
      if (moduleId === 'module-8') badgeToUnlock = 'compliance_officer';
      if (moduleId === 'module-12') badgeToUnlock = 'capstone_champion';

      if (badgeToUnlock && !badges.includes(badgeToUnlock)) {
        const newBadges = [...badges, badgeToUnlock];
        setBadges(newBadges);
        localStorage.setItem('user_badges', JSON.stringify(newBadges));

        // Celebratory badge confetti
        confetti({
          particleCount: 100,
          spread: 60,
          origin: { y: 0.6 }
        });
      }
      setTimeout(() => setCertModuleId(moduleId), 500);
    }
  };

  const handleReset = () => {
    [
      'completed_modules', 'completed_lessons', 'user_xp', 'user_streak',
      'user_badges', 'custom_modules', 'game_time_seconds',
      'hacu_progress', 'trading-game-store', 'stock_sim_metrics'
    ].forEach(key => localStorage.removeItem(key));
    setCompletedModules([]);
    setCompletedLessons([]);
    setCustomModules([]);
    setXp(0);
    setStreak(3);
    setBadges([]);
    setActiveModuleId(null);
    setIsBuildingModule(false);
    setEditingModule(null);
    setActiveView('dashboard');
    setActiveDirectGame(null);
    setGameTimeSeconds(0);
    navigate('/');
  };

  const handleSaveCustomModule = (savedModule: Module) => {
    let nextModules: Module[];
    const exists = customModules.some(m => m.id === savedModule.id);
    if (exists) {
      nextModules = customModules.map(m => m.id === savedModule.id ? savedModule : m);
    } else {
      nextModules = [...customModules, savedModule];
    }
    setCustomModules(nextModules);
    localStorage.setItem('custom_modules', JSON.stringify(nextModules));
    setIsBuildingModule(false);
    setEditingModule(null);
  };

  const handleDeleteCustomModule = (moduleId: string) => {
    const nextModules = customModules.filter(m => m.id !== moduleId);
    setCustomModules(nextModules);
    localStorage.setItem('custom_modules', JSON.stringify(nextModules));
  };

  const allModules = [...courseModules, ...customModules];

  const activeModule = activeModuleId 
    ? allModules.find(m => m.id === activeModuleId) 
    : null;

  const filteredModules = allModules.filter(m => m.level === activeLevel);

  const currentLevel = Math.floor(Math.sqrt(xp / 100)) + 1;


  return (
    <div className={cn("min-h-screen font-sans flex flex-col md:flex-row transition-colors duration-200", isDarkMode ? "dark bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900")}>
      
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-40">
        <div className="flex items-center">
          <div className="w-6 h-6 bg-slate-900 dark:bg-blue-600 rounded-md flex items-center justify-center text-white mr-2 shadow-sm">
            <GraduationCap className="w-3.5 h-3.5" />
          </div>
          <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white">
            Overlay<span className="text-blue-600">Wealth</span>
          </span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isMobileMenuOpen}
          className="p-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
        >
          {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside aria-label="Main navigation" role="navigation" className={cn(
        `fixed md:sticky top-0 left-0 h-screen shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between z-40 transition-all duration-300 md:translate-x-0 ${isSidebarCollapsed ? "w-20" : "w-72"}`,
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        {/* Sidebar Content */}
        <div className="flex flex-col h-full overflow-y-auto p-5 space-y-6">
          
          {/* Logo Brand Header */}
          <div className="hidden md:flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className={`flex items-center ${isSidebarCollapsed ? 'hidden' : ''}`}>
              <img src="/overlay-logo-192.png" alt="Overlay Wealth" className="w-7 h-7 rounded-lg object-contain mr-2 shadow-sm" />
              <div>
                <h1 className="text-sm font-black font-display tracking-tight text-slate-900 dark:text-white leading-none">Overlay</h1>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Wealth</span>
              </div>
            </div>
            <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-500 transition-colors">
              {isSidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>
          </div>
          {isSidebarCollapsed && (
            <div className="hidden md:flex flex-col items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <img src="/overlay-logo-192.png" alt="Overlay Wealth" className="w-7 h-7 rounded-lg object-contain shadow-sm" />
            </div>
          )}

          {/* Auth */}
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Account</span>
            {currentUser ? (
              <button
                type="button"
                onClick={() => { apiClient.logout(); setCurrentUser(null); }}
                className="text-xs font-bold text-slate-400 hover:text-rose-500 flex items-center gap-1 cursor-pointer transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-3 h-3" />
                <span>Sign Out</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shadow-xs"
              >
                <LogIn className="w-3 h-3" />
                <span>Sign In</span>
              </button>
            )}
          </div>

          {/* Navigation Menus */}
          <div className="space-y-4">
            <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block pl-2">Syllabus Path</span>
            <div className="space-y-1">
              {/* 1. Student Profile */}
              <button
                onClick={() => {
                  setActiveView('profile');
                  setActiveModuleId(null);
                  setIsBuildingModule(false);
                  setEditingModule(null);
                  setActiveDirectGame(null);
                  setIsMobileMenuOpen(false);
                  navigate('/profile');
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer",
                  activeView === 'profile'
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-450 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                )}
              >
                <User className="w-4 h-4" />
                <span>My Student Profile</span>
              </button>

              {/* 2. Learning Pathways */}
              <button
                onClick={() => {
                  setActiveView('dashboard');
                  setActiveModuleId(null);
                  setIsBuildingModule(false);
                  setEditingModule(null);
                  setActiveDirectGame(null);
                  setIsMobileMenuOpen(false);
                  navigate('/');
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer",
                  activeView === 'dashboard' && !activeDirectGame
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-450 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                )}
              >
                <Layers className="w-4 h-4" />
                <span>Learning Pathways</span>
              </button>

              {/* 3. Finance Dictionary */}
              <button
                onClick={() => {
                  setActiveView('glossary');
                  setActiveModuleId(null);
                  setIsBuildingModule(false);
                  setEditingModule(null);
                  setActiveDirectGame(null);
                  setIsMobileMenuOpen(false);
                  navigate('/glossary');
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer",
                  activeView === 'glossary'
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-450 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                )}
              >
                <Sparkles className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                <span>Finance Dictionary</span>
              </button>

              {/* 4. Fintech Business Builder */}
              <button
                onClick={() => {
                  setActiveView('business_builder');
                  setActiveModuleId(null);
                  setIsBuildingModule(false);
                  setEditingModule(null);
                  setActiveDirectGame(null);
                  setIsMobileMenuOpen(false);
                  navigate('/business-builder');
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer",
                  activeView === 'business_builder'
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-450 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                )}
              >
                <Briefcase className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                <span>Business Builder</span>
              </button>

              {/* 5. Support */}
              <button
                onClick={() => {
                  setActiveView('donation');
                  setActiveModuleId(null);
                  setIsBuildingModule(false);
                  setEditingModule(null);
                  setActiveDirectGame(null);
                  setIsMobileMenuOpen(false);
                  navigate('/donate');
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer",
                  activeView === 'donation'
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-450 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                )}
              >
                <Heart className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                <span>Support</span>
              </button>
            </div>

            {/* Games Hub */}
            <button
              onClick={() => {
                setActiveView('games');
                setActiveModuleId(null);
                setIsBuildingModule(false);
                setEditingModule(null);
                setActiveDirectGame(null);
                setIsMobileMenuOpen(false);
                navigate('/games');
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer",
                activeView === 'games'
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-450 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              )}
            >
              <Gamepad2 className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              <span>Games</span>
            </button>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 space-y-2 shrink-0">

          {/* Settings (language + theme) */}
          {!isSidebarCollapsed && (
            <>
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </span>
                {isSettingsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {isSettingsOpen && (
                <div className="space-y-3 px-1.5 pb-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Language</span>
                    <LanguageSwitcher />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">UI Theme</span>
                    <button
                      onClick={() => setIsDarkMode(!isDarkMode)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold shadow-3xs hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer text-slate-750 dark:text-slate-200 overflow-hidden"
                    >
                      <AnimatePresence mode="wait" initial={false}>
                        {isDarkMode ? (
                          <motion.div
                            key="sun"
                            initial={{ y: -12, opacity: 0, rotate: -45 }}
                            animate={{ y: 0, opacity: 1, rotate: 0 }}
                            exit={{ y: 12, opacity: 0, rotate: 45 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            className="flex items-center gap-1.5"
                          >
                            <Sun className="w-3.5 h-3.5 text-amber-500" />
                            <span>Light Mode</span>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="moon"
                            initial={{ y: -12, opacity: 0, rotate: -45 }}
                            animate={{ y: 0, opacity: 1, rotate: 0 }}
                            exit={{ y: 12, opacity: 0, rotate: 45 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            className="flex items-center gap-1.5"
                          >
                            <Moon className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Dark Mode</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="flex-1 flex items-center justify-center gap-1.5 p-2 rounded-xl border border-rose-150 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Progress</span>
            </button>
          </div>

          {/* Admin Link */}
          <button
            onClick={() => {
              setActiveView('admin');
              setActiveModuleId(null);
              setActiveDirectGame(null);
              navigate('/admin');
            }}
            className="flex items-center gap-2 px-1 py-1.5 text-xs font-bold text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
          >
            <BarChart3 className="w-3 h-3" />
            <span>Admin</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
        />
      )}

      {/* Main Content Workspace */}
      <main id="main-content" role="main" aria-label="Course content" className="flex-1 h-screen overflow-y-auto px-4 md:px-8 py-8 md:py-10">
        <ErrorBoundary>
        <Suspense fallback={<LoadingFallback label="Loading module..." />}>
        <AnimatePresence mode="wait">
          {activeView === 'games' ? (
            <motion.div
              key="games-menu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
            >
              <PageMeta title="Educational Games" description="Interactive fintech learning games and simulations." />
              <GamesHub onSelectGame={(gameId) => { setActiveView('game'); setActiveDirectGame(gameId); navigate('/game/' + gameId); }} />
            </motion.div>
          ) : activeView === 'game' && activeDirectGame ? (
            <motion.div
              key="standalone-game"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
            >
              <PageMeta title={activeDirectGame === 'trading' ? 'Stock Market Simulator' : activeDirectGame === 'underwriting' ? 'Alternative Lending Sim' : activeDirectGame === 'parametric' ? 'Parametric Insurance Sim' : activeDirectGame === 'fraud' ? 'Compliance Screener' : 'FinTech Pop Quiz'} description="Interactive educational game." ogType="game" />
              <StandaloneGameView activeDirectGame={activeDirectGame} onAddXp={(amount, reason) => addXp(amount, reason)} onBackToDashboard={() => { setActiveView('dashboard'); setActiveDirectGame(null); navigate('/'); }} />
            </motion.div>
          ) : activeView === 'profile' ? (
            <motion.div
              key="user-profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
            >
              <PageMeta title="My Profile & Progress" canonical="/profile" />
              <StudentProfile xp={xp} streak={streak} gameTimeSeconds={gameTimeSeconds} badges={badges} completedLessons={completedLessons} allModules={allModules} completedModules={completedModules} onOpenGame={(gameId) => { setActiveView('game'); setActiveDirectGame(gameId); navigate('/game/' + gameId); }} onNavigateToDashboard={() => navigate('/')} />
              <div className="mt-8 max-w-4xl mx-auto">
                <ProgressDashboard
                  modules={filteredModules}
                  completedModules={completedModules}
                  completedLessons={completedLessons}
                  xp={xp}
                  streak={streak}
                  gameTimeSeconds={gameTimeSeconds}
                  badges={badges}
                  onSelectModule={(id) => {
                    setActiveModuleId(id);
                    const moduleNum = id.replace('module-', '');
                    navigate(`/module/${moduleNum}`);
                  }}
                />
              </div>
            </motion.div>
          ) : activeView === 'knowledge' ? (
            <motion.div
              key="knowledge-base"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
            >
              <PageMeta title="Lecture Library" canonical="/knowledge" />
              <KnowledgeBase />
            </motion.div>
          ) : activeView === 'donation' ? (
            <motion.div
              key="donation-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
            >
              <PageMeta title="Support" canonical="/donate" />
              <DonationView onBackToDashboard={() => { setActiveView('dashboard'); navigate('/'); }} />
            </motion.div>
          ) : activeView === 'architecture' ? (
            <motion.div
              key="architecture-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
            >
              <PageMeta title="History of Black American Finance" canonical="/architecture" />
              <ArchitectureOfExtraction />
            </motion.div>
          ) : activeView === 'business_builder' ? (
            <motion.div
              key="business-builder-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
            >
              <PageMeta title="Fintech Business Builder" canonical="/business-builder" />
              <FintechBusinessBuilder 
                onAwardXp={(amount, reason) => addXp(amount, reason)}
                onCompleteCapstone={() => handleModuleComplete('module-12')}
                badges={badges}
              />
            </motion.div>
          ) : activeView === 'fintech_map' ? (
            <motion.div
              key="fintech-map-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
            >
              <PageMeta title="Fintech Starter Map" canonical="/map" />
              <FintechStarterMap 
                onNavigateToSim={() => {
                  setActiveView('game');
                  setActiveDirectGame('trading');
                  navigate('/game/trading');
                }} 
                onNavigateToBusinessBuilder={() => {
                  setActiveView('business_builder');
                  navigate('/business-builder');
                }}
              />
            </motion.div>
          ) : activeView === 'glossary' ? (
            <motion.div
              key="glossary-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
            >
              <PageMeta title="Finance Dictionary" canonical="/glossary" />
              <FinanceGlossary />
            </motion.div>
          ) : activeView === 'dots_article' ? (
            <motion.div
              key="dots-article-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
            >
              <PageMeta title="Connecting The Dots" canonical="/article" />
              <ConnectingTheDotsArticle />
            </motion.div>
          ) : activeView === 'wealth_building' ? (
            <motion.div key="wealth-building" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.25 }}>
              <PageMeta title="Wealth Building" canonical="/wealth-building" />
              <WealthBuilding />
            </motion.div>
          ) : activeView === 'wealth_credit' ? (
            <motion.div key="wealth-credit" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.25 }}>
              <PageMeta title="Wealth Building — Credit Mastery" canonical="/wealth-building/credit" />
              <CreditMastery />
            </motion.div>
          ) : activeView === 'wealth_investing' ? (
            <motion.div key="wealth-investing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.25 }}>
              <PageMeta title="Wealth Building — Investing & IRAs" canonical="/wealth-building/investing" />
              <InvestingIRAs />
            </motion.div>
          ) : activeView === 'wealth_real_estate' ? (
            <motion.div key="wealth-realestate" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.25 }}>
              <PageMeta title="Wealth Building — Real Estate" canonical="/wealth-building/real-estate" />
              <RealEstate />
            </motion.div>
          ) : activeView === 'wealth_business' ? (
            <motion.div key="wealth-business" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.25 }}>
              <PageMeta title="Wealth Building — Business" canonical="/wealth-building/business" />
              <BusinessBuilding />
            </motion.div>
          ) : activeView === 'wealth_group_economics' ? (
            <motion.div key="wealth-groupecon" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.25 }}>
              <PageMeta title="Wealth Building — Group Economics" canonical="/wealth-building/group-economics" />
              <GroupEconomics />
            </motion.div>
          ) : activeView === 'wealth_side_hustles' ? (
            <motion.div key="wealth-sidehustles" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.25 }}>
              <PageMeta title="Wealth Building — Side Hustles & Gig Income" canonical="/wealth-building/side-hustles" />
              <SideHustles />
            </motion.div>
          ) : activeView === 'wealth_emergency_fund' ? (
            <motion.div key="wealth-emergencyfund" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.25 }}>
              <PageMeta title="Wealth Building — Cash Flow & Emergency Fund" canonical="/wealth-building/emergency-fund" />
              <EmergencyFund />
            </motion.div>
          ) : isBuildingModule || editingModule ? (
            <motion.div
              key="module-builder"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <PageMeta title="Module Builder" canonical="/builder" />
              <ModuleBuilder 
                initialModule={editingModule}
                onSave={handleSaveCustomModule}
                onCancel={() => {
                  setIsBuildingModule(false);
                  setEditingModule(null);
                }}
              />
            </motion.div>
          ) : activeView === 'admin' ? (
            <motion.div
              key="admin-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
            >
              <PageMeta title="Admin Dashboard" canonical="/admin" />
              <AdminDashboard />
            </motion.div>
          ) : activeView === 'not_found' ? (
            <motion.div
              key="not-found"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
            >
              <PageMeta title="Page Not Found" />
              <NotFound />
            </motion.div>
          ) : activeModule ? (
            <motion.div
              key="module-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <PageMeta title={activeModule.title} canonical={`/module/${activeModule.id.replace('module-', '')}`} />
              <ModuleView 
                module={activeModule} 
                onBack={() => setActiveModuleId(null)}
                onComplete={handleModuleComplete}
                onLessonComplete={handleLessonComplete}
              />
            </motion.div>
          ) : (
            <motion.div
              key="dashboard-view"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <PageMeta title="Master Modern Money" />
              <Dashboard 
                modules={filteredModules} 
                completedModules={completedModules}
                completedLessons={completedLessons}
                onSelectModule={(id) => {
                  if (id === 'glossary') {
                    setActiveView('glossary');
                    setActiveModuleId(null);
                    navigate('/glossary');
                  } else if (id === 'dots_article') {
                    setActiveView('dots_article');
                    setActiveModuleId(null);
                    navigate('/article');
                  } else {
                    setActiveModuleId(id);
                    const moduleNum = id.replace('module-', '');
                    navigate(`/module/${moduleNum}`);
                  }
                }}
                activeLevel={activeLevel}
                onSelectLevel={setActiveLevel}
                xp={xp}
                streak={streak}
                badges={badges}
                completedLessonsCount={completedLessons.length}
                onCreateCustomModule={() => setIsBuildingModule(true)}
                onEditCustomModule={(module) => setEditingModule(module)}
                onDeleteCustomModule={handleDeleteCustomModule}
              />
              <div className="mt-16 border-t border-slate-200 dark:border-slate-800 pt-12">
                <WealthBuilding />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </Suspense>
        </ErrorBoundary>
      </main>

      {/* Google and Email Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
        }}
      />

      {/* Certificate Modal */}
      {certModuleId && (() => {
        const certModule = allModules.find(m => m.id === certModuleId);
        if (!certModule) return null;
        return (
          <Certificate
            userName={currentUser?.name || 'Fintech Engineer'}
            moduleTitle={certModule.title}
            completedDate={new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            certId={`F-FND-${certModuleId.replace('module-', '').toUpperCase().padStart(3, '0')}-${Date.now().toString(36).toUpperCase()}`}
            score={(() => {
              const lessonIds = certModule.lessons.map(l => l.id);
              const completed = completedLessons.filter(id => lessonIds.includes(id));
              return Math.round((completed.length / lessonIds.length) * 100);
            })()}
            onClose={() => setCertModuleId(null)}
          />
        );
      })()}

      {/* Floating Toasts Overlay */}
      <div role="status" aria-live="polite" className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.15 } }}
              className="bg-slate-900/95 dark:bg-white/95 text-white dark:text-slate-950 border border-slate-800 dark:border-slate-200 shadow-xl rounded-2xl p-4 flex items-center gap-3.5 pointer-events-auto backdrop-blur-md"
            >
              {toast.points ? (
                <div className="w-10 h-10 rounded-xl bg-blue-600 dark:bg-blue-100 flex items-center justify-center shrink-0 shadow-sm text-white dark:text-blue-600 font-black text-sm">
                  +{toast.points}
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-indigo-600 dark:bg-indigo-100 flex items-center justify-center shrink-0 shadow-sm text-white dark:text-indigo-600 font-black text-sm">
                  ✓
                </div>
              )}
              <div className="flex-1 min-w-0">
                <span className="block text-xs font-black leading-tight">
                  {toast.message}
                </span>
                <span className="block text-xs text-slate-400 dark:text-slate-500 font-bold mt-0.5 leading-none">
                  {toast.sub}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}
