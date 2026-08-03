import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Rocket, 
  MapPin, 
  ExternalLink, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  CreditCard, 
  Code, 
  Building2, 
  Wallet, 
  Scale, 
  TrendingUp, 
  DollarSign, 
  Sparkles, 
  BookOpen,
  ChevronRight,
  Layers,
  Zap,
  Briefcase
} from 'lucide-react';
import { getJSON, setJSON, storageKeys } from '../lib/storage';

interface RoadmapStep {
  id: string;
  phase: string;
  stepNumber: number;
  title: string;
  description: string;
  category: 'Investing' | 'Developer' | 'Payments' | 'Compliance' | 'DeFi' | 'Startup';
  icon: React.ElementType;
  keyActions: string[];
  recommendedPlatforms: { name: string; url: string; note: string; isAction?: boolean }[];
  proTip: string;
  isBusinessBuilderStep?: boolean;
}

const FINTECH_MAP_STEPS: RoadmapStep[] = [
  {
    id: 'step-0',
    phase: 'Phase 0: Corporate Entity Formation & Setup',
    stepNumber: 0,
    title: 'Form Your Fintech Legal Entity & Corporation',
    description: 'Before deploying live API keys or opening production bank sweep ledgers, you must establish a legitimate business entity. Use our integrated Fintech Business Builder to draft your Operating Agreement, Articles of Organization, and EIN guidelines.',
    category: 'Startup',
    icon: Briefcase,
    keyActions: [
      'Select your fintech lane category, brand style, and business name.',
      'Generate customized Operating Agreements and Articles of Organization.',
      'Obtain your Employer Identification Number (EIN) free from IRS.gov.',
      'File articles directly with your selected state portal (LLC recommended).'
    ],
    recommendedPlatforms: [
      { name: 'Launch Fintech Business Builder', url: '#builder', note: 'Interactive, open-ended business formation data generator', isAction: true },
      { name: 'IRS EIN Online Portal', url: 'https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online', note: 'Obtain an EIN instantly for free' }
    ],
    proTip: 'Forming an LLC protects your personal assets from software security liabilities and financial compliance triggers. Start with Delaware or your home state.',
    isBusinessBuilderStep: true
  },
  {
    id: 'step-community',
    phase: 'Black Financial Organizations & Community Resources',
    stepNumber: 1,
    title: 'Connect with Black Financial Community Organizations',
    description: 'Join established networks that support Black professionals, entrepreneurs, and investors in financial services. These organizations offer mentorship, capital access, career opportunities, and community.',
    category: 'Startup',
    icon: Briefcase,
    keyActions: [
      'Explore membership opportunities with national Black finance associations.',
      'Connect with Black-owned banks and investment firms.',
      'Access mentorship and career development programs.',
      'Attend industry conferences and networking events.'
    ],
    recommendedPlatforms: [
      { name: 'National Assoc. of Securities Professionals', url: 'https://www.nasphq.org/', note: 'Championing diversity in finance and investments' },
      { name: 'National Black MBA Association', url: 'https://nbmbaa.org/', note: 'Black business professionals network and development' },
      { name: 'Assoc. of African American Financial Advisors', url: 'https://www.aaafa.info/', note: 'Supporting Black financial advisors and planners' },
      { name: 'Coalition of Black Investors', url: 'https://coalitionofblackinvestors.org/', note: 'Community for Black investors and wealth building' },
      { name: 'OneUnited Bank (Black-Owned Bank)', url: 'https://www.oneunited.com/', note: 'Largest Black-owned bank in the United States' },
      { name: 'Black Women in Finance Network', url: 'https://www.blackwomeninfinance.org/', note: 'Empowering Black women in financial careers' },
      { name: 'Real Estate Executive Council', url: 'https://reec.org/', note: 'Black real estate professionals and executives' }
    ],
    proTip: 'Many of these organizations offer free or low-cost student memberships. Join at least one professional network while you build your fintech skills.'
  },
  {
    id: 'step-1',
    phase: 'Phase 1: Real-World Investing & Brokerage',
    stepNumber: 2,
    title: 'Open Real-World Brokerage & Retirement Accounts',
    description: 'Transition from paper trading to real financial markets by establishing regulated brokerage accounts protected by SIPC insurance ($500k limit).',
    category: 'Investing',
    icon: TrendingUp,
    keyActions: [
      'Compare discount brokerages vs developer-first brokerage APIs.',
      'Open a Roth IRA for tax-free compound growth if eligible.',
      'Enable fractional share trading and high-yield cash sweep options.'
    ],
    recommendedPlatforms: [
      { name: 'Fidelity Investments', url: 'https://www.fidelity.com/', note: 'Zero-fee index funds & fractional shares' },
      { name: 'Interactive Brokers', url: 'https://www.interactivebrokers.com/', note: 'Global market access & pro order routing' },
      { name: 'Robinhood', url: 'https://robinhood.com/', note: 'Mobile-first trading with 3% IRA match' },
      { name: 'Schwab', url: 'https://www.schwab.com/', note: 'Thinkorswim charting & full-service banking' }
    ],
    proTip: 'Always turn on 2-Factor Authentication (2FA) using an authenticator app (e.g. YubiKey or Google Authenticator) rather than SMS.'
  },
  {
    id: 'step-2',
    phase: 'Phase 2: Developer Sandboxes & Market Data APIs',
    stepNumber: 3,
    title: 'Get Live Financial Market Data & Algo-Trading APIs',
    description: 'Connect your code directly to stock exchanges and financial data providers using REST & WebSocket APIs.',
    category: 'Developer',
    icon: Code,
    keyActions: [
      'Sign up for free developer API keys on Alpha Vantage and Alpaca.',
      'Test WebSocket streaming for real-time order books and tick data.',
      'Build automated paper-trading bots before deploying real money.'
    ],
    recommendedPlatforms: [
      { name: 'Alpaca Markets API', url: 'https://alpaca.markets/', note: 'Developer-first stock & crypto trading API' },
      { name: 'Alpha Vantage', url: 'https://www.alphavantage.co/', note: 'Stock, Forex, and Crypto historical data' },
      { name: 'Polygon.io', url: 'https://polygon.io/', note: 'Ultra-low latency market data feeds' },
      { name: 'Plaid API Sandbox', url: 'https://plaid.com/', note: 'Connect user bank accounts securely' }
    ],
    proTip: 'Store all API keys strictly in server-side environment variables (.env) and never check private keys into public GitHub repositories.'
  },
  {
    id: 'step-3',
    phase: 'Phase 3: Payments Infrastructure & Payment Rails',
    stepNumber: 4,
    title: 'Set Up Payment Gateways & Merchant Processing',
    description: 'Accept credit card payments, ACH bank transfers, and real-time payments (FedNow / RTP) for your app or startup.',
    category: 'Payments',
    icon: CreditCard,
    keyActions: [
      'Create a Stripe or Adyen Sandbox developer account.',
      'Understand credit card processing fees (Interchange + 0.15% + 30¢).',
      'Implement ACH direct debit & webhook notifications for payouts.'
    ],
    recommendedPlatforms: [
      { name: 'Stripe Payments', url: 'https://stripe.com/', note: 'Industry gold standard payment infrastructure' },
      { name: 'Adyen', url: 'https://www.adyen.com/', note: 'Global omni-channel enterprise payment platform' },
      { name: 'Unit (BaaS)', url: 'https://www.unit.co/', note: 'Embed bank accounts, cards, and loans' },
      { name: 'Treasury Prime', url: 'https://www.treasuryprime.com/', note: 'Direct bank partner API integration' }
    ],
    proTip: 'Use Stripe webhooks with cryptographic signature verification to prevent spoofed transaction events in your app server.'
  },
  {
    id: 'step-4',
    phase: 'Phase 4: Regulatory Compliance & Identity Verification (KYC/AML)',
    stepNumber: 5,
    title: 'Integrate Identity Verification & OFAC Sanction Screening',
    description: 'Comply with Bank Secrecy Act (BSA), Anti-Money Laundering (AML), and Customer Identification Program (CIP) rules.',
    category: 'Compliance',
    icon: ShieldCheck,
    keyActions: [
      'Implement document scan verification and biometric liveness checks.',
      'Automate real-time OFAC (Office of Foreign Assets Control) screening.',
      'Build Suspicious Activity Reporting (SAR) monitoring workflows.'
    ],
    recommendedPlatforms: [
      { name: 'Persona KYC', url: 'https://withpersona.com/', note: 'Custom identity verification flows & fraud prevention' },
      { name: 'Alloy', url: 'https://www.alloy.com/', note: 'Identity decisioning platform for banks & fintechs' },
      { name: 'Socure', url: 'https://www.socure.com/', note: 'AI-driven identity verification & synthetic identity detection' },
      { name: 'FinCEN BSA E-Filing', url: 'https://bsaefiling.fincen.treas.gov/', note: 'Official federal reporting portal' }
    ],
    proTip: 'Ensure PII (Personally Identifiable Information) like SSN and Passport details are encrypted at rest with AES-256 in your database.'
  },
  {
    id: 'step-5',
    phase: 'Phase 5: Digital Assets, Web3 & Decentralized Finance',
    stepNumber: 6,
    title: 'Deploy Web3 Wallets & Smart Contracts',
    description: 'Explore permissionless protocols, stablecoins (USDC/USDT), self-custody wallets, and smart contract audit frameworks.',
    category: 'DeFi',
    icon: Wallet,
    keyActions: [
      'Set up a hardware wallet (Ledger or Trezor) for cold asset security.',
      'Use Coinbase Cloud or Alchemy for RPC blockchain node endpoints.',
      'Experiment with Ethereum Sepolia testnet smart contract deployments.'
    ],
    recommendedPlatforms: [
      { name: 'Coinbase Developer Platform', url: 'https://www.coinbase.com/developer-platform', note: 'Crypto wallet SDK & onramp APIs' },
      { name: 'Alchemy', url: 'https://www.alchemy.com/', note: 'Ethereum & Solana web3 infrastructure' },
      { name: 'Circle (USDC)', url: 'https://www.circle.com/', note: 'Programmable web3 wallets & stablecoin platform' },
      { name: 'OpenZeppelin', url: 'https://www.openzeppelin.com/', note: 'Audited smart contract library' }
    ],
    proTip: 'Never store seed phrases digitally in cloud notes or unencrypted text files. Use physical stainless steel steel plates for backup.'
  },
  {
    id: 'step-6',
    phase: 'Phase 6: Startup Legal Setup & License Registration',
    stepNumber: 7,
    title: 'Register FinTech Entity & Obtain Financial Licenses',
    description: 'Transition from side-project to licensed financial institution with proper legal structure and regulatory filings.',
    category: 'Compliance',
    icon: Scale,
    keyActions: [
      'Form a Delaware C-Corporation for venture backing readiness.',
      'Determine if you need Money Transmitter Licenses (MTL) per state.',
      'Register as a Registered Investment Advisor (RIA) or Broker-Dealer if managing client money.'
    ],
    recommendedPlatforms: [
      { name: 'Stripe Atlas', url: 'https://stripe.com/atlas', note: 'Form Delaware C-Corp & US bank account in minutes' },
      { name: 'Clerky', url: 'https://www.clerky.com/', note: 'Legal paperwork for startups & founder equity' },
      { name: 'FINRA Gateway', url: 'https://www.finra.org/', note: 'Regulatory compliance portal for brokerages' },
      { name: 'SEC IAPD Portal', url: 'https://adviserinfo.sec.gov/', note: 'Investment Advisor registration database' }
    ],
    proTip: 'Consult with specialized FinTech legal counsel early before accepting public customer funds to prevent costly regulatory fines.'
  }
];

interface FintechStarterMapProps {
  onNavigateToSim?: () => void;
  onNavigateToBusinessBuilder?: () => void;
}

export function FintechStarterMap({ onNavigateToSim, onNavigateToBusinessBuilder }: FintechStarterMapProps = {}) {
  const [completedSteps, setCompletedSteps] = useState<string[]>(() => {
    return getJSON<string[]>(storageKeys.fintechMapSteps, []);
  });

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('ALL');

  const toggleStep = (stepId: string) => {
    setCompletedSteps(prev => {
      const next = prev.includes(stepId) ? prev.filter(s => s !== stepId) : [...prev, stepId];
      setJSON(storageKeys.fintechMapSteps, next);
      return next;
    });
  };

  const filteredSteps = FINTECH_MAP_STEPS.filter(s => {
    if (activeCategoryFilter === 'ALL') return true;
    return s.category.toUpperCase() === activeCategoryFilter.toUpperCase();
  });

  const progressPercent = Math.round((completedSteps.length / FINTECH_MAP_STEPS.length) * 100);

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-fade-in p-2 text-slate-900 dark:text-white">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 md:p-8 border border-blue-800/50 shadow-xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-black uppercase tracking-wider">
            <Rocket className="w-3.5 h-3.5 text-blue-400" />
            <span>Real-World Launchpad</span>
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-black font-display tracking-tight text-white">
              FinTech Starter Map
            </h1>
            <p className="text-slate-300 text-sm md:text-base max-w-2xl font-sans">
              From sandbox simulations to real-world financial deployment. Follow this step-by-step launch plan to connect live brokerages, API keys, payment rails, and regulatory registration.
            </p>
          </div>

          {/* Progress Indicator Bar */}
          <div className="pt-2 max-w-xl space-y-2">
            <div className="flex justify-between items-center text-xs font-bold font-mono">
              <span className="text-blue-300 uppercase">Real-World Readiness Index</span>
              <span className="text-emerald-400">{completedSteps.length} of {FINTECH_MAP_STEPS.length} Completed ({progressPercent}%)</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {['ALL', 'Startup', 'Investing', 'Developer', 'Payments', 'Compliance', 'DeFi'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategoryFilter(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeCategoryFilter === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          Click step checkboxes to save your progress
        </div>
      </div>

      {/* Steps List Timeline */}
      <div className="space-y-6">
        {filteredSteps.map((step) => {
          const isDone = completedSteps.includes(step.id);
          const IconComp = step.icon;

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all p-6 shadow-xs ${
                isDone 
                  ? 'border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/10' 
                  : 'border-slate-200 dark:border-slate-800 hover:border-blue-500/30'
              }`}
            >
              <div className="flex flex-col md:flex-row items-start gap-5 justify-between">
                
                {/* Step Icon & Header */}
                <div className="flex items-start gap-4 flex-1">
                  <button
                    onClick={() => toggleStep(step.id)}
                    className={`mt-1 w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                      isDone 
                        ? 'bg-emerald-600 border-emerald-500 text-white shadow' 
                        : 'border-slate-300 dark:border-slate-700 hover:border-blue-500 text-transparent'
                    }`}
                    title={isDone ? 'Mark as Incomplete' : 'Mark as Completed'}
                  >
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </button>

                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                        {step.phase}
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {step.category}
                      </span>
                    </div>

                    <h3 className={`text-xl font-black font-display flex items-center gap-2 ${isDone ? 'line-through text-slate-500 dark:text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                      <IconComp className="w-5 h-5 text-blue-500 shrink-0" />
                      <span>{step.title}</span>
                    </h3>

                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>

              </div>

              {/* Action Checklist & Resources */}
              <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Left column: Key Action Steps */}
                <div className="space-y-3">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>Actionable Checkpoints</span>
                  </span>
                  <ul className="space-y-2">
                    {step.keyActions.map((action, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                        <ChevronRight className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Pro Tip Callout */}
                  <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 rounded-xl p-3 text-xs text-amber-900 dark:text-amber-300 space-y-1">
                    <span className="font-bold uppercase tracking-wider text-xs text-amber-700 dark:text-amber-400 block">💡 Pro Engineering Tip</span>
                    <p>{step.proTip}</p>
                  </div>
                </div>

                {/* Right column: Recommended Live Platforms & Links */}
                <div className="space-y-3">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
                    <span>Curated Resources & Live Platforms</span>
                  </span>

                  <div className="space-y-2">
                    {step.recommendedPlatforms.map((plat, i) => {
                      if (plat.isAction) {
                        return (
                          <button
                            key={i}
                            onClick={onNavigateToBusinessBuilder}
                            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white border border-blue-600 transition-all group cursor-pointer text-left"
                          >
                            <div className="space-y-0.5">
                              <span className="text-xs font-bold flex items-center gap-1.5 text-white">
                                {plat.name}
                                <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
                              </span>
                              <span className="text-xs text-blue-100 block">{plat.note}</span>
                            </div>
                            <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform shrink-0" />
                          </button>
                        );
                      }
                      return (
                        <a
                          key={i}
                          href={plat.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-800 transition-all group cursor-pointer"
                        >
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 flex items-center gap-1.5">
                              {plat.name}
                              <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-blue-500 transition-transform group-hover:scale-110" />
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 block">{plat.note}</span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-transform group-hover:translate-x-1 shrink-0" />
                        </a>
                      );
                    })}
                  </div>
                </div>

              </div>

            </motion.div>
          );
        })}
      </div>

    </div>
  );
}
