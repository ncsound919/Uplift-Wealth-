import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Briefcase,
  ChevronRight,
  ChevronLeft,
  Check,
  Sparkles,
  RefreshCw,
  Terminal,
  Scale,
  AlertTriangle
} from 'lucide-react';
import { cn } from '../lib/utils';
import { BusinessQuickStart } from './BusinessQuickStart';
import { BusinessSummary } from './BusinessSummary';
import { downloadCompletePlan, type PlanContext } from '../lib/planDownload';
import { STATE_PORTALS } from '../lib/statePortals';
import type { BusinessBlueprint } from '../lib/businessBlueprint';

interface FintechBusinessBuilderProps {
  onAwardXp?: (amount: number, reason: string) => void;
  onCompleteCapstone?: () => void;
  badges?: string[];
  /** Initial mode for the builder. Defaults to the simplified QuickStart pipeline. */
  initialMode?: 'quickstart' | 'builder';
}

export function FintechBusinessBuilder({
  onAwardXp,
  onCompleteCapstone,
  badges = [],
  initialMode = 'quickstart'
}: FintechBusinessBuilderProps = {}) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [mode, setMode] = useState<'builder' | 'quickstart' | 'summary'>(initialMode);
  const [businessType, setBusinessType] = useState<'fintech' | 'retail' | 'food' | 'services' | 'consulting' | 'real_estate' | 'other'>('fintech');
  
  // Pipeline State Store
  const [lane, setLane] = useState<string>('Digital Banking');
  const [customLane, setCustomLane] = useState<string>('');
  
  const [problem, setProblem] = useState<string>('High transaction friction and slow settlement corridors.');
  const [customProblem, setCustomProblem] = useState<string>('');
  
  const [selectedCohort, setSelectedCohort] = useState<string>('Gig workers & Freelancers');
  const [reachUsers, setReachUsers] = useState<number>(10000); // Target User Reach
  
  const [monetization, setMonetization] = useState<string>('Subscription model (recurring software license fee)');
  const [monthlyFee, setMonthlyFee] = useState<number>(12); // Average price per user / transaction
  const [txVolume, setTxVolume] = useState<number>(150000); // Estimated monthly transaction volume in dollars (if transaction based)

  const [businessName, setBusinessName] = useState<string>('');
  const [brandStyle, setBrandStyle] = useState<string>('Urban');
  
  const [structure, setStructure] = useState<string>('LLC');
  const [filingState, setFilingState] = useState<string>('Delaware');
  const [hqType, setHqType] = useState<string>('Virtual office address');
  
  const [foundersCount, setFoundersCount] = useState<string>('Co-founding partnership');
  const [selectedApis, setSelectedApis] = useState<string[]>(['Payments API Integration', 'KYC Identity Decisioning']);
  const [marketingChannel, setMarketingChannel] = useState<string>('Developer Relations & API documentation');

  // NEW DYNAMIC USER PARAMETERS (Specific to founder identity & structuring)
  const [founderName, setFounderName] = useState<string>('');
  const [founderState, setFounderState] = useState<string>('California');
  const [fundingStrategy, setFundingStrategy] = useState<string>('Seed Venture Capital SAFE ($500K - $2M)');
  const [equitySplit, setEquitySplit] = useState<string>('Equal 50/50 Split (4-Year Vesting with 1-Year Cliff)');
  const [boiChecked, setBoiChecked] = useState<boolean>(false);

  // Interactive Simulator Game State
  const [showSimModal, setShowSimModal] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simStep, setSimStep] = useState<number>(0);
  const [simLogs, setSimLogs] = useState<string[]>([]);
  const [simSuccess, setSimSuccess] = useState<boolean | null>(null);
  const [simMetrics, setSimMetrics] = useState<{
    users: number;
    ARR: number;
    auditPassed: boolean;
    safeClosed: boolean;
    complianceScore: number;
  }>({
    users: 0,
    ARR: 0,
    auditPassed: false,
    safeClosed: false,
    complianceScore: 100
  });

  // Resolving helper values
  const finalLane = useMemo(() => lane === 'Other' ? (customLane || 'Fintech Startup') : lane, [lane, customLane]);
  const finalProblem = useMemo(() => problem === 'Other' ? (customProblem || 'Resolving legacy financial bottlenecks') : problem, [problem, customProblem]);

  // Dynamic Name suggestion prefixes & suffixes
  const NAME_SUGGESTIONS = useMemo(() => {
    const base = businessName.trim() || 'Velo';
    return [
      `${base}Rails`,
      `${base}Vault`,
      `${base}Ledger`,
      `${base}Pay`,
      `Smart${base}`,
      `Nexa${base}`,
      `${base}Base`,
      `Nova${base}`
    ];
  }, [businessName]);

  // Computed Real-time Telemetry Stats
  const stats = useMemo(() => {
    // 1. Legitimacy Score (0 - 100%)
    let legit = 10;
    if (businessName.trim().length >= 3) legit += 20;
    if (structure) legit += 15;
    if (filingState) legit += 15;
    if (hqType && hqType !== 'Home address') legit += 15;
    if (selectedApis.length >= 2) legit += 15;
    if (selectedApis.includes('KYC Identity Decisioning') || selectedApis.includes('Anti-Fraud ML Engine')) legit += 10;

    // 2. Launch Budget calculation (Filing fee + Registered Agent / Virtual Mailbox (~$15/mo) + Basic tools setup)
    const stateFee = STATE_PORTALS[filingState]?.cost || 100;
    const mailboxFee = hqType === 'Virtual office address' ? 180 : hqType === 'Shared / Coworking space' ? 450 : 0;
    const softCost = selectedApis.length * 35; // arbitrary API basic tier setup
    const totalBudget = stateFee + mailboxFee + softCost;

    // 3. Projected Year 1 Revenue estimation
    let annualRev = 0;
    if (monetization.includes('Subscription')) {
      annualRev = reachUsers * monthlyFee * 12;
    } else if (monetization.includes('Transactional') || monetization.includes('spread')) {
      // average transaction fee of 1.5%
      annualRev = txVolume * 0.015 * 12 + (reachUsers * 3 * 12);
    } else {
      annualRev = reachUsers * 15 * 12; // default flat rate
    }

    // 4. Fundability Rating
    // Rises with large user reach, acute pain points, high legitimacy, VC structure alignment
    let score = 50;
    if (reachUsers > 50000) score += 15;
    if (reachUsers > 500000) score += 15;
    if (legit >= 80) score += 15;
    if (structure === 'C-Corp') score += 15; // Delaware C-Corp is VC favorite
    if (structure === 'LLC') score += 5;
    if (foundersCount === 'Co-founding partnership') score += 10;
    if (fundingStrategy.includes('Seed')) score += 10;
    if (equitySplit.includes('Vesting')) score += 10; // Vesting schedule reassures investors

    let grade = 'C';
    if (score >= 120) grade = 'S ★';
    else if (score >= 100) grade = 'A+';
    else if (score >= 85) grade = 'A';
    else if (score >= 70) grade = 'B+';
    else if (score >= 60) grade = 'B';
    else if (score >= 50) grade = 'C+';

    // 5. Estimated CPA (Cost Per Acquisition)
    // Only the Developer channel is offered in the UI; everything else uses the default.
    let cpa = 15;
    if (marketingChannel.includes('Developer')) cpa = 8;

    return {
      legit,
      budget: totalBudget,
      revenue: annualRev,
      grade,
      cpa,
      score
    };
  }, [businessName, structure, filingState, hqType, selectedApis, reachUsers, monthlyFee, txVolume, monetization, foundersCount, marketingChannel, fundingStrategy, equitySplit]);

  // Milestone mapping (12 steps grouped into 6 clear progress phases)
  const MILESTONES = [
    { title: 'The Basics', range: [1, 2, 3] },
    { title: 'Your Money', range: [4, 5] },
    { title: 'Name & Brand', range: [6] },
    { title: 'Legal Setup', range: [7, 8, 9] },
    { title: 'Tools & Growth', range: [10, 11] },
    { title: 'Your Plan', range: [12] }
  ];

  const currentMilestoneIndex = useMemo(() => {
    return MILESTONES.findIndex(m => m.range.includes(currentStep));
  }, [currentStep]);

  // Verification helper for stepping forward
  const canAdvance = () => {
    if (currentStep === 1) return !!lane;
    if (currentStep === 2) return !!problem;
    if (currentStep === 3) return !!selectedCohort;
    if (currentStep === 4) return monthlyFee > 0 || txVolume > 0;
    if (currentStep === 5) return !!monetization && !!fundingStrategy;
    if (currentStep === 6) return businessName.trim().length >= 2 && founderName.trim().length >= 2;
    if (currentStep === 7) return !!structure;
    if (currentStep === 8) return !!filingState;
    if (currentStep === 9) return !!hqType;
    if (currentStep === 10) return selectedApis.length > 0;
    if (currentStep === 11) return !!marketingChannel && !!equitySplit;
  };

  const getStepTitle = (step: number) => {
    const titles = [
      'Your Business Type',
      'The Problem',
      'Your Customers',
      'Your Pricing',
      'How You Make Money',
      'Name & Brand',
      'Business Structure',
      'Where to Register',
      'Business Address',
      'Your Tech Tools',
      'Growth & Team',
      'Your Plan'
    ];
    return titles[step - 1] || 'Venture Progress';
  };

  const handleNext = () => {
    if (canAdvance() && currentStep < 12) {
      setCurrentStep(prev => {
        const nextStep = prev + 1;
        if (onAwardXp) {
          onAwardXp(15, `Completed Step ${prev}: ${getStepTitle(prev)}`);
        }
        return nextStep;
      });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Quick action name picker
  const handleSelectSuggestedName = (name: string) => {
    setBusinessName(name);
  };

  // Apply a QuickStart blueprint to seed the full Step-by-Step builder state.
  const applyBlueprint = (bp: BusinessBlueprint) => {
    setBusinessType(bp.businessType);
    setLane(bp.lane);
    setCustomLane('');
    setProblem(bp.problem);
    setCustomProblem('');
    setSelectedCohort(bp.selectedCohort);
    setReachUsers(bp.reachUsers);
    setMonetization(bp.monetization);
    setMonthlyFee(bp.monthlyFee);
    setTxVolume(bp.txVolume);
    setBusinessName(bp.businessName);
    setBrandStyle(bp.brandStyle);
    setStructure(bp.structure);
    setFilingState(bp.filingState);
    setHqType(bp.hqType);
    setFoundersCount(bp.foundersCount);
    setSelectedApis(bp.selectedApis);
    setMarketingChannel(bp.marketingChannel);
    setFounderName(bp.founderName);
    setFounderState(bp.founderState);
    setFundingStrategy(bp.fundingStrategy);
    setEquitySplit(bp.equitySplit);
  };

  // Restore every builder field to its default.
  const resetAllState = () => {
    setCurrentStep(1);
    setBusinessType('fintech');
    setLane('Digital Banking');
    setCustomLane('');
    setProblem('High transaction friction and slow settlement corridors.');
    setCustomProblem('');
    setSelectedCohort('Gig workers & Freelancers');
    setReachUsers(10000);
    setMonetization('Subscription model (recurring software license fee)');
    setMonthlyFee(12);
    setTxVolume(150000);
    setBusinessName('');
    setBrandStyle('Urban');
    setStructure('LLC');
    setFilingState('Delaware');
    setHqType('Virtual office address');
    setFoundersCount('Co-founding partnership');
    setSelectedApis(['Payments API Integration', 'KYC Identity Decisioning']);
    setMarketingChannel('Developer Relations & API documentation');
    setFounderName('');
    setFounderState('California');
    setFundingStrategy('Seed Venture Capital SAFE ($500K - $2M)');
    setEquitySplit('Equal 50/50 Split (4-Year Vesting with 1-Year Cliff)');
    setBoiChecked(false);
  };

  // Full context used to assemble the downloadable plan document + starter kit.
  const planContext = useMemo<PlanContext>(() => ({
    businessName: businessName.trim() || 'Your Business',
    founderName: founderName.trim() || 'Your Name',
    founderState,
    filingState,
    structure: structure === 'Solo' ? 'Sole Prop' : (structure as 'LLC' | 'C-Corp'),
    finalLane,
    selectedCohort,
    finalProblem,
    selectedApis,
    monetization,
    equitySplit,
    fundingStrategy,
    hqType,
    businessType,
    reachUsers,
    monthlyFee,
    txVolume,
    marketingChannel,
    brandStyle,
    stats,
  }), [businessName, founderName, founderState, filingState, structure, finalLane, selectedCohort, finalProblem, selectedApis, monetization, equitySplit, fundingStrategy, hqType, businessType, reachUsers, monthlyFee, txVolume, marketingChannel, brandStyle, stats]);

  const handleDownloadPlan = () => {
    downloadCompletePlan(planContext);
  };

  const handleStartOver = () => {
    resetAllState();
    setMode('quickstart');
  };

  const handleAdvancedMode = () => {
    setCurrentStep(1);
    setMode('builder');
  };

  // High fidelity stress-test simulation algorithm
  const runStressTest = () => {
    setIsSimulating(true);
    setSimStep(0);
    setSimLogs(['[SYSTEM] Initializing sandbox simulator environment v2.4.6...']);
    setShowSimModal(true);
    setSimSuccess(null);

    const logs = [
      `[00:01] Bootstrapping virtual hardware servers and setting port 3000 mapping...`,
      `[00:02] Sourcing legal incorporator parameters for CEO "${founderName}" (Resident of ${founderState})...`,
      `[00:04] Assembling core codebase using modules: ${selectedApis.join(' & ')}...`,
      `[00:06] Initiating target marketing campaigns via ${marketingChannel} targeting ${selectedCohort}...`
    ];

    let userSuccess = true;
    let finalUsers = Math.round(reachUsers * (Math.random() * 0.3 + 0.85));
    let finalARR = Math.round(finalUsers * monthlyFee * 12);
    let auditPassed = true;
    let safeClosed = false;
    let complianceScore = 100;

    // Phase 1: Security Audit Challenge (fintech) / Operations Check (general)
    if (businessType === 'fintech') {
      logs.push(`[00:08] CHALLENGE: FinCEN and state banking regulators launch sudden security audit...`);
      if (selectedApis.includes('KYC Identity Decisioning') || selectedApis.includes('Anti-Fraud ML Engine')) {
        logs.push(`[00:10] SUCCESS: Active KYC/Fraud prevention rails verified all customer profiles. Audit PASSED!`);
        complianceScore = 100;
        auditPassed = true;
      } else {
        logs.push(`[00:10] FAIL: No active compliance or anti-money-laundering API rails detected! Spoof users flagged.`);
        logs.push(`[00:11] WARNING: Regulators issue $25,000 provisional administrative penalty. Cease-and-desist warning!`);
        userSuccess = false;
        complianceScore = 35;
        auditPassed = false;
        finalUsers = Math.round(finalUsers * 0.4); // Lose 60% of users due to account freezes
      }
    } else {
      logs.push(`[00:08] CHALLENGE: Local licensing and business operations spot-check launched...`);
      if (selectedApis.length > 0) {
        logs.push(`[00:10] SUCCESS: Operations stack verified — invoicing, payments, and scheduling ready. PASSED!`);
        complianceScore = 100;
        auditPassed = true;
      } else {
        logs.push(`[00:10] WARNING: No operations tools selected. Manual record-keeping required.`);
        complianceScore = 65;
        auditPassed = true;
      }
    }

    // Phase 2: Funding Pitch Challenge
    logs.push(`[00:13] CHALLENGE: Sourcing capital under "${fundingStrategy}"...`);
    if (fundingStrategy.includes('Seed')) {
      if (structure === 'C-Corp' && filingState === 'Delaware') {
        logs.push(`[00:15] SUCCESS: Institutional venture capitals verify Delaware C-Corp bylaws & vesting schedules.`);
        logs.push(`[00:16] FUNDED: Pre-Seed SAFE Note fully signed! Closed $1.5M at $12M cap.`);
        safeClosed = true;
      } else {
        logs.push(`[00:15] REJECTED: Venture funds decline SAFE investments due to complex pass-through LLC or non-Delaware state shell.`);
        logs.push(`[00:16] ADVICE: VCs demand a corporate "Delaware Flip" first. Pivot to customer bootstrapping.`);
        safeClosed = false;
      }
    } else {
      logs.push(`[00:15] REASSURING: Focusing purely on cashflow collection. Sovereign bootstrapper path active.`);
      logs.push(`[00:16] RUNWAY: Net Operating Margin is positive at ${(monthlyFee * 0.8).toFixed(1)}% per user. Positive cash flow!`);
      safeClosed = false;
    }

    // Phase 3: GTM Traction Challenge
    logs.push(`[00:18] CHALLENGE: Launching on Product Hunt and TechCrunch...`);
    if (marketingChannel.includes('Developer')) {
      logs.push(`[00:19] TRACTION: Open-source SDK wrapper goes viral on GitHub Trending! Smashed beachhead TAM.`);
      finalUsers = Math.round(finalUsers * 1.35);
    } else if (marketingChannel.includes('SEO')) {
      logs.push(`[00:19] TRACTION: Financial calculator SEO pages lock in top rank on Google search results.`);
      finalUsers = Math.round(finalUsers * 1.15);
    } else {
      logs.push(`[00:19] TRACTION: Consistent, moderate organic accounts onboarded.`);
    }

    finalARR = Math.round(finalUsers * monthlyFee * 12);
    logs.push(`[00:20] Final Metrics Compiled: active users = ${finalUsers.toLocaleString()}, ARR = $${finalARR.toLocaleString()}.`);
    
    if (userSuccess) {
      logs.push(`[00:21] STATUS: VENTURE DECLARED STABLE AND INVESTMENT READY! 🚀`);
    } else {
      logs.push(`[00:21] STATUS: VENTURE VULNERABLE. Regulatory mitigation and infrastructure updates recommended. ⚠️`);
    }

    // Simulation log rendering interval
    let currentLogIndex = 0;
    const interval = setInterval(() => {
      if (currentLogIndex < logs.length) {
        const log = logs[currentLogIndex];
        setSimLogs(prev => [...prev, log]);
        setSimStep(currentLogIndex + 1);
        currentLogIndex++;
      } else {
        clearInterval(interval);
        setIsSimulating(false);
        setSimSuccess(userSuccess);
        setSimMetrics({
          users: finalUsers,
          ARR: finalARR,
          auditPassed,
          safeClosed,
          complianceScore
        });
        if (onAwardXp) {
          onAwardXp(50, `Running high-fidelity sandbox stress-test simulator`);
        }
      }
    }, 700);
  };

  // Preset selectors
  const LANES = [
    { id: 'banking', name: 'Digital Banking', desc: 'Neobanks, niche debit accounts, specialized ledgers', cagr: '21.5% CAGR' },
    { id: 'payments', name: 'Payments Rail', desc: 'Global payouts, borderless ACH clearing, smart routing', cagr: '18.2% CAGR' },
    { id: 'credit', name: 'Alternative Underwriting', desc: 'Alternative scoring algorithms, automated micro-loans', cagr: '24.1% CAGR' },
    { id: 'investing', name: 'Wealth & Investing', desc: 'Fractional asset allocation, algorithmic indices', cagr: '15.9% CAGR' },
    { id: 'crypto', name: 'Stablecoin Infrastructure', desc: 'Fiat-to-crypto merchant gateways, treasury ledgers', cagr: '31.2% CAGR' },
    { id: 'Other', name: 'Other Route', desc: 'Type in your own customized fintech vertical', cagr: 'N/A' }
  ];

  // Generic business lanes shown when the user picks a non-fintech business type.
  const GENERAL_LANES = [
    { id: 'retail', name: 'Retail & E-Commerce', desc: 'Online store, shop, or brand selling products', cagr: 'Grow' },
    { id: 'food', name: 'Food & Restaurants', desc: 'Restaurant, food truck, catering, or meal service', cagr: 'Grow' },
    { id: 'services', name: 'Services & Trades', desc: 'Cleaning, repair, beauty, or handyman services', cagr: 'Grow' },
    { id: 'consulting', name: 'Consulting & Coaching', desc: 'Advice, training, or professional services', cagr: 'Grow' },
    { id: 'real_estate', name: 'Real Estate', desc: 'Rental property, flipping, or property management', cagr: 'Grow' },
    { id: 'other', name: 'General Business', desc: 'Any other type of business', cagr: 'Grow' },
    { id: 'Other', name: 'Other Route', desc: 'Type in your own business specialty', cagr: 'N/A' }
  ];

  const activeLanes = businessType === 'fintech' ? LANES : GENERAL_LANES;

  const PROBLEMS = [
    { text: '“SMEs & freelancers wait 5+ days to get paid globally.”', value: 'High transaction friction and slow settlement corridors.' },
    { text: '“Legacy credit checks exclude 40M+ credit-invisible citizens.”', value: 'Systemic exclusion from thin credit files and lack of alternative underwriting.' },
    { text: '“Gen-Z and freelancers have zero tools to hedge inflation.”', value: 'Low savings rate and high difficulty in building automatic compound wealth.' },
    { text: '“Integrating financial infrastructure takes 6 months & $100k.”', value: 'High technical entry barriers for non-bank tech providers.' },
    { text: '“Financial cybercrime and card cloning are scaling exponentially.”', value: 'Vulnerability of digital transaction rails to identity theft and fraud.' },
    { text: '“I am targeting a different structural friction.”', value: 'Other' }
  ];

  const COHORTS = [
    { label: 'Gig Workers & Freelancers', size: '57 Million in US', pain: 'Variable cashflow & high tax filing complexity' },
    { label: 'Immigrants & Global Families', size: '280M Migrants Globally', pain: 'Unfair cross-border remittance spreads' },
    { label: 'SMEs & Micro-merchants', size: '32 Million Small Biz', pain: 'High processing merchant fees & delayed deposits' },
    { label: 'Creators & Web3 Developers', size: '50M Content Creators', pain: 'Lack of compliant business banking vaults' },
    { label: 'Underbanked Tech Students', size: '18M Active Enrollees', pain: 'No security credit lines or overdraft buffers' }
  ];

  const MONETIZATION_MODELS = [
    { label: 'Software Subscription (SaaS)', val: 'Subscription model (recurring software license fee)', desc: 'Consistent ARR with low churn dependency' },
    { label: 'Transactional Take-Rate (bps)', val: 'Transactional fee (small percentage + flat cost per transaction)', desc: 'Scales exponentially with card volume processing' },
    { label: 'Interest Arbitrage (Spread)', val: 'Net Interest Margin (earning interest on cash balances)', desc: 'Earn 3-5% yield on sweep ledger deposits' },
    { label: 'Advising Asset Under Management (AUM)', val: 'AUM split fee (percentage of assets actively managed)', desc: 'Aligned directly with consumer capital expansion' }
  ];

  const FUNDING_STRATEGIES = [
    { label: 'Sovereign Bootstrapper', val: 'Bootstrapped (0% Equity Diluted)', desc: 'Grow entirely from organic revenue, maintaining absolute control.' },
    { label: 'Seed Venture Capital SAFE', val: 'Seed Venture Capital SAFE ($500K - $2M)', desc: 'High-growth trajectory. Accelerates GTM scaling. Dilutes 15-20% equity.' },
    { label: 'Strategic Grants & Accelerators', val: 'Grants & Accelerators ($50K - $150K)', desc: 'Non-dilutive pre-seed funding. Best for technical university spinouts.' },
    { label: 'Reg CF Community Crowd-raise', val: 'Reg CF Community Crowdfunding', desc: 'Raise up to $5M directly from your first 1,000 core power-users.' }
  ];

  const BRAND_STYLES = [
    { name: 'Clean', style: 'font-sans tracking-wider uppercase font-semibold text-slate-800 dark:text-slate-200' },
    { name: 'Bold', style: 'font-black uppercase tracking-tighter text-indigo-600 italic' },
    { name: 'Urban', style: 'font-mono text-emerald-500 font-extrabold uppercase bg-slate-950 px-2 py-0.5 rounded border border-emerald-500' },
    { name: 'Minimal', style: 'font-serif text-slate-900 dark:text-white tracking-widest font-light' },
    { name: 'Cyber', style: 'font-mono uppercase tracking-widest text-cyan-400 font-bold drop-shadow-[0_0_8px_rgba(34,211,238,0.3)] bg-black px-1.5 py-0.5 rounded' }
  ];

  const STRUCTURES = [
    { id: 'LLC', label: 'Limited Liability Company (LLC)', desc: 'Best for bootstrappers. Flexible, pass-through taxes, robust personal asset protection.' },
    { id: 'C-Corp', label: 'C-Corporation (Delaware standard)', desc: 'Best for VC track. Required for institutional investments and issuing stock options.' },
    { id: 'Solo', label: 'Solo Proprietorship', desc: 'No state filing fee, but exposes personal assets and savings directly to software liabilities.' }
  ];

  const HQ_OPTIONS = [
    { label: 'Virtual office address', desc: 'Rents a professional corporate mailbox in selected state, guarding home privacy completely.', cost: '$15 - $25/mo' },
    { label: 'Shared / Coworking space', desc: 'Dedicated shared hot-desk address. Outstanding for passing bank KYC audits.', cost: '$200 - $400/mo' },
    { label: 'Home residential address', desc: 'Free. However, your address is listed on public records and state database lookups.', cost: 'Free' }
  ];

  const TECHNICAL_APIS = [
    { id: 'Payments API Integration', name: 'Stripe Core / Adyen API', category: 'Payments', desc: 'Enables instant credit card capture & merchant payouts.' },
    { id: 'BaaS Ledger Aggregator', name: 'Plaid / Treasury Prime SDK', category: 'Banking', desc: 'Connects to consumer checkings to sweep balances.' },
    { id: 'KYC Identity Decisioning', name: 'Persona KYC / Alloy AML', category: 'Compliance', desc: 'Validates government IDs & prevents fraud instant-on.' },
    { id: 'Anti-Fraud ML Engine', name: 'Sardine / Socure Shield', category: 'Security', desc: 'Flags chargebacks & high risk transaction telemetry.' },
    { id: 'Web3 Stablecoin Rails', name: 'Circle Mint SDK / Coinbase API', category: 'Crypto', desc: 'Interacts with USDC corridors for borderless settlements.' }
  ];

  // Generic operations stack shown for non-fintech businesses.
  const GENERAL_TOOLS = [
    { id: 'Payments API Integration', name: 'Payments Processing', category: 'Sales', desc: 'Accept card, cash, or digital payments from customers.' },
    { id: 'BaaS Ledger Aggregator', name: 'Bookkeeping & Invoicing', category: 'Finance', desc: 'Track income, expenses, and send professional invoices.' },
    { id: 'KYC Identity Decisioning', name: 'Scheduling & Booking', category: 'Operations', desc: 'Let customers book appointments or orders online.' },
    { id: 'Anti-Fraud ML Engine', name: 'Inventory & POS', category: 'Operations', desc: 'Manage stock, scan sales, and reorder automatically.' },
    { id: 'Web3 Stablecoin Rails', name: 'Website & Online Store', category: 'Growth', desc: 'Showcase your business and sell online.' }
  ];

  const activeTools = businessType === 'fintech' ? TECHNICAL_APIS : GENERAL_TOOLS;

  const GROWTH_CHANNELS = [
    { id: 'Developer Relations & API documentation', label: 'DevRel & SDK Ecosystems', desc: 'Publish open-source wrappers. Unlocks organic word-of-mouth growth among builders.' },
    { id: 'Interactive Fin-Ed SEO & Calculators', label: 'Viral Web Widgets & SEO', desc: 'Embed free calculators (e.g. tax refund estimators). Drives zero-cost, high-intent traffic.' },
    { id: 'Direct-to-Founder Referral Loops', label: 'In-app Referral Dividends', desc: 'Give $10 credit to both sender and recipient on successful deposit runs.' },
    { id: 'Niche B2B Outbound Campaigns', label: 'Direct Cold Account Outbound', desc: 'Manual outreach targeting financial directors. Best for high-margin enterprise accounts.' }
  ];

  const EQUITY_SPLITS = [
    { val: 'Equal 50/50 Split (4-Year Vesting with 1-Year Cliff)', desc: 'Ensures equal founder alignment with protection against early co-founder departures.' },
    { val: 'Solo Retained 100% Control', desc: 'No team dilution, but requires self-funding or high individual sweat equity.' },
    { val: 'Primary Founder Dominant (80/20 with 4-Yr Vesting)', desc: 'Protects the original visionary while keeping early hires incentivized.' },
    { val: 'Slicing Pie Dynamic Allocation', desc: 'Equity calculated dynamically based on hour-by-hour time and cash contributions.' }
  ];

  return (
    <div id="fintech-business-builder" className="w-full max-w-[1680px] mx-auto p-4 md:p-6 bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden transition-colors duration-300">
      
      {/* Background Grid */}
      <div className="absolute inset-0 bg-grid-slate-200/40 dark:bg-grid-slate-950/20 [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] pointer-events-none" />

      {/* HEADER */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-950 dark:bg-emerald-950/40 flex items-center justify-center border border-slate-800/80 shadow-inner">
            <Briefcase className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 dark:text-white">Business Builder</h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Answer a few questions and get a complete launch plan — legal docs, pricing, and growth steps. Full details come in your download.</p>
          </div>
        </div>

        {mode === 'builder' ? (
          <button
            onClick={() => setMode('quickstart')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Back to QuickStart
          </button>
        ) : mode === 'quickstart' ? (
          <button
            onClick={() => { setCurrentStep(1); setMode('builder'); }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
          >
            Advanced: 12-step Assembly Line
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        ) : null}
      </div>

      {mode === 'quickstart' ? (
        <BusinessQuickStart onComplete={(blueprint) => {
          applyBlueprint(blueprint);
          setMode('summary');
        }} />
      ) : mode === 'summary' ? (
        <BusinessSummary
          businessName={businessName}
          finalLane={finalLane}
          businessType={businessType}
          selectedCohort={selectedCohort}
          monetization={monetization}
          structure={structure}
          filingState={filingState}
          fundingStrategy={fundingStrategy}
          onDownload={handleDownloadPlan}
          onStressTest={runStressTest}
          onStartOver={handleStartOver}
          onAdvancedMode={handleAdvancedMode}
        />
      ) : (
      <>
      {/* ROADMAP PROGRESS BAR */}
      <div className="relative z-10 w-full mb-8 overflow-x-auto pb-2 scrollbar-none">
        <div className="flex items-center min-w-[650px] justify-between relative px-4">
          <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 -z-10" />
          
          {MILESTONES.map((m, idx) => {
            const isActive = idx === currentMilestoneIndex;
            const isCompleted = idx < currentMilestoneIndex;
            return (
              <div key={m.title} className="flex flex-col items-center gap-1.5 bg-slate-50 dark:bg-slate-900 px-2 relative z-10">
                <button 
                  onClick={() => {
                    if (isCompleted || idx === currentMilestoneIndex + 1) {
                      setCurrentStep(m.range[0]);
                    }
                  }}
                  className={cn(
                    "w-8 h-8 rounded-xl border flex items-center justify-center font-mono font-black text-xs transition-all cursor-pointer",
                    isActive 
                      ? "bg-blue-600 border-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-950/50 scale-110"
                      : isCompleted
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : "bg-white dark:bg-slate-950 border-slate-250 dark:border-slate-800 text-slate-400"
                  )}
                >
                  {isCompleted ? "✓" : idx + 1}
                </button>
                <span className={cn(
                  "text-xs font-black uppercase tracking-wider",
                  isActive ? "text-blue-600 dark:text-blue-400 font-black" : "text-slate-400"
                )}>
                  {m.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* MAIN STEP WORKSPACE */}
      <div className="relative z-10 w-full min-h-[440px]">
        
        {/* INTERACTIVE COMPONENT CONFIGURATOR CARD */}
        <div className="bg-white dark:bg-slate-950/60 p-5 md:p-6 rounded-2xl border border-slate-200 dark:border-slate-850 shadow-xs">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.18 }}
              className="space-y-6"
            >
              
              {/* STEP 1: FINTECH VERTICAL */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-xs font-mono font-bold text-blue-500 uppercase tracking-widest block">Step 1 of 12 • The Basics</span>
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">What type of business are you building?</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">Pick a category or choose Other to describe it yourself. This shapes the setup steps that follow.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {activeLanes.map(l => (
                      <button
                        key={l.id}
                        onClick={() => { setLane(l.id === 'Other' ? 'Other' : l.name); if (l.id !== 'Other') setCustomLane(''); }}
                        className={cn(
                          "p-4 rounded-xl text-left border cursor-pointer transition-all relative overflow-hidden group",
                            lane === l.name || (l.id === 'Other' && lane === 'Other')
                            ? "bg-blue-50/50 dark:bg-blue-950/15 border-blue-500"
                            : "bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800/80 hover:border-slate-350"
                        )}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-xs text-slate-900 dark:text-white">{l.name}</span>
                          <span className="text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">{l.cagr}</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">{l.desc}</p>
                      </button>
                    ))}
                  </div>

                  {lane === 'Other' && (
                    <div className="pt-2">
                      <label className="block text-xs font-black text-slate-450 uppercase mb-1">Specify Custom Specialty</label>
                      <input
                        type="text"
                        value={customLane}
                        onChange={(e) => setCustomLane(e.target.value)}
                        placeholder="e.g. Micro-remittance loyalty, decentralized escrow, corporate sweeps"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2: PROBLEM DEFINITION */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-xs font-mono font-bold text-blue-500 uppercase tracking-widest block">Step 2 of 12 • The Basics</span>
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">What problem does it solve?</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Great businesses solve a real pain point. Pick the closest one or describe your own.</p>
                  </div>
                  <div className="space-y-2.5 pt-2">
                    {PROBLEMS.map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => { setProblem(p.value); if (p.value !== 'Other') setCustomProblem(''); }}
                        className={cn(
                          "w-full p-3.5 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-3",
                          problem === p.value
                            ? "bg-blue-50/50 dark:bg-blue-950/15 border-blue-500"
                            : "bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800/80 hover:border-slate-350"
                        )}
                      >
                        <div className={cn("w-4 h-4 rounded-full border shrink-0 mt-0.5 flex items-center justify-center text-xs", problem === p.value ? "bg-blue-500 border-blue-500 text-white" : "border-slate-300")}>
                          {problem === p.value && "✓"}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-850 dark:text-slate-200 block leading-normal">{p.text}</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  {problem === 'Other' && (
                    <div className="pt-2">
                      <label className="block text-xs font-black text-slate-450 uppercase mb-1">Custom Friction Goal</label>
                      <textarea
                        value={customProblem}
                        onChange={(e) => setCustomProblem(e.target.value)}
                        placeholder="State the exact pain point (e.g. Cross border invoice clearing is slow...)"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[80px]"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: CUSTOMER COHORT TAM ESTIMATOR */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-xs font-mono font-bold text-blue-500 uppercase tracking-widest block">Step 3 of 12 • The Basics</span>
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">Who are your customers?</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Choose your starting customer base and estimate how many people you can realistically reach.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {COHORTS.map(c => (
                      <button
                        key={c.label}
                        onClick={() => setSelectedCohort(c.label)}
                        className={cn(
                          "p-3 rounded-xl border text-left cursor-pointer transition-all",
                          selectedCohort === c.label
                            ? "bg-blue-50/50 dark:bg-blue-950/15 border-blue-500"
                            : "bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800/80 hover:border-slate-350"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-900 dark:text-white">{c.label}</span>
                          <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono px-1 rounded">{c.size}</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug">Primary Pain: {c.pain}</p>
                      </button>
                    ))}
                  </div>

                  {/* TAM CALCULATOR SLIDER */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-850 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Target Beachhead Users Reach</span>
                      <span className="font-mono text-xs font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 rounded">
                        {reachUsers.toLocaleString()} active accounts
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1000"
                      max="1000000"
                      step="5000"
                      value={reachUsers}
                      onChange={(e) => setReachUsers(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-850 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-xs text-slate-400 font-mono">
                      <span>1K BEACHHEAD</span>
                      <span>500K EXPANSION</span>
                      <span>1M SCALE</span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: MONETIZATION SLIDER */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-xs font-mono font-bold text-blue-500 uppercase tracking-widest block">Step 4 of 12 • Your Money</span>
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">What will you charge?</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">Set a price per customer (or per transaction) and we'll estimate your first-year revenue.</p>
                  </div>

                  <div className="space-y-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-850">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Average Monthly User Subscription</span>
                        <span className="text-sm font-mono font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded">${monthlyFee}/mo</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="200"
                        step="1"
                        value={monthlyFee}
                        onChange={(e) => setMonthlyFee(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 dark:bg-slate-850 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                      <div className="flex justify-between text-xs text-slate-450 font-mono">
                        <span>$1 (MICROPAY)</span>
                        <span>$50 (STANDARD SAAS)</span>
                        <span>$200 (ENTERPRISE VALUE)</span>
                      </div>
                    </div>

                    <div className="border-t border-slate-250 dark:border-slate-850 pt-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Est. Monthly Transaction Processing Volume</span>
                          <span className="text-xs text-slate-400 block">Required to calculate interchange yield projections</span>
                        </div>
                        <span className="text-sm font-mono font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 px-2 py-0.5 rounded">${txVolume.toLocaleString()}/mo</span>
                      </div>
                      <input
                        type="range"
                        min="10000"
                        max="10000000"
                        step="50000"
                        value={txVolume}
                        onChange={(e) => setTxVolume(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 dark:bg-slate-850 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                      <div className="flex justify-between text-xs text-slate-450 font-mono">
                        <span>$10K STARTUP</span>
                        <span>$5M PILOT</span>
                        <span>$10M DEPOSIT DEPLOYED</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50/50 dark:bg-blue-950/15 border border-blue-100 dark:border-blue-900 rounded-xl text-xs text-blue-600 dark:text-blue-300 leading-normal flex gap-2 font-sans">
                    <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>Based on your {reachUsers.toLocaleString()} target beachhead users and subscription fee of ${monthlyFee}/mo, your projected software ARR is estimated at <strong>${(reachUsers * monthlyFee * 12).toLocaleString()}</strong>.</span>
                  </div>
                </div>
              )}

              {/* STEP 5: MONETIZATION & FUNDING STRATEGY */}
              {currentStep === 5 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-xs font-mono font-bold text-blue-500 uppercase tracking-widest block">Step 5 of 12 • Your Money</span>
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">How will you make money?</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Choose how customers pay you, then pick how you'll fund the early days.</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <span className="block text-xs font-black text-slate-450 uppercase mb-2">1. Choose Monetization Channel</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {MONETIZATION_MODELS.map(m => (
                          <button
                            key={m.label}
                            onClick={() => setMonetization(m.val)}
                            className={cn(
                              "p-3 rounded-xl text-left border cursor-pointer transition-all flex flex-col justify-between min-h-20",
                              monetization === m.val
                                ? "bg-blue-50/50 dark:bg-blue-950/15 border-blue-500"
                                : "bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-850 hover:border-slate-350"
                            )}
                          >
                            <span className="font-bold text-xs text-slate-900 dark:text-white block">{m.label}</span>
                            <p className="text-xs text-slate-500 mt-0.5">{m.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-slate-250 dark:border-slate-850 pt-4">
                      <span className="block text-xs font-black text-slate-450 uppercase mb-2">2. Capital Funding Strategy</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {FUNDING_STRATEGIES.map(fs => (
                          <button
                            key={fs.label}
                            onClick={() => setFundingStrategy(fs.val)}
                            className={cn(
                              "p-3 rounded-xl text-left border cursor-pointer transition-all flex flex-col justify-between min-h-20",
                              fundingStrategy === fs.val
                                ? "bg-indigo-50/50 dark:bg-indigo-950/15 border-indigo-500"
                                : "bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-850 hover:border-slate-350"
                            )}
                          >
                            <span className="font-bold text-xs text-slate-900 dark:text-white block">{fs.label}</span>
                            <p className="text-xs text-slate-500 mt-0.5">{fs.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 6: CORPORATE IDENTITY, AI NAME SUGGESTIONS, FOUNDER DETAILS */}
              {currentStep === 6 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-xs font-mono font-bold text-blue-500 uppercase tracking-widest block">Step 6 of 12 • Name & Brand</span>
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">What should it be called?</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">Pick a name and enter the founder's details so we can personalize your legal documents.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-black text-slate-450 uppercase mb-1">Company Root Keyword</label>
                        <input
                          type="text"
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          placeholder="e.g. Velo, Bold, Aura, Nexa"
                          className="w-full px-3 py-2 border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>

                      {/* BRAND SUGGESTION CHIPS */}
                      <div className="space-y-1.5">
                        <span className="text-xs font-mono text-slate-400 uppercase tracking-widest font-black block">AI Brand Combinations</span>
                        <div className="flex flex-wrap gap-1.5">
                          {NAME_SUGGESTIONS.map(sug => (
                            <button
                              key={sug}
                              type="button"
                              onClick={() => handleSelectSuggestedName(sug)}
                              className="px-2 py-1 bg-slate-100 dark:bg-slate-850 hover:bg-indigo-100 dark:hover:bg-indigo-950 text-slate-700 dark:text-slate-300 rounded text-xs font-mono font-bold border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
                            >
                              + {sug}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* NEW: FOUNDER IDENTITY CUSTOMIZATION */}
                      <div className="border-t border-slate-150 dark:border-slate-850 pt-3 space-y-3">
                        <div>
                          <label className="block text-xs font-black text-slate-450 uppercase mb-1">Founder / CEO Legal Name</label>
                          <input
                            type="text"
                            value={founderName}
                            onChange={(e) => setFounderName(e.target.value)}
                            placeholder="Your Full Legal Name"
                            className="w-full px-3 py-2 border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-black text-slate-450 uppercase mb-1">Residency State / Region</label>
                          <select
                            value={founderState}
                            onChange={(e) => setFounderState(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none rounded-md"
                          >
                            {['California', 'Texas', 'New York', 'Florida', 'Wyoming', 'Delaware', 'Illinois', 'Washington', 'Other'].map(st => (
                              <option key={st} value={st}>{st}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* LIVE RENDERED BRAND CARD */}
                    <div className="p-5 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-900/80 flex flex-col justify-between min-h-[220px] relative overflow-hidden">
                      <span className="text-xs font-mono font-black text-slate-400 tracking-widest uppercase block">Live Brand-Shield Compiler</span>
                      <div className="my-auto py-2 text-center space-y-2">
                        {businessName.trim() ? (
                          <div className="space-y-1.5">
                            <span className={BRAND_STYLES.find(b => b.name === brandStyle)?.style}>
                              {businessName}
                            </span>
                            <span className="block text-xs text-slate-450 uppercase tracking-widest font-bold">
                              {finalLane} &bull; EST. 2026
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Type a keyword above to compile visual brand shield</span>
                        )}
                        <div className="text-xs bg-slate-200/50 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-250 dark:border-slate-850 inline-block text-slate-600 dark:text-slate-400 font-mono">
                          Founder: <span className="text-slate-900 dark:text-slate-200 font-bold">{founderName || 'Your Name'}</span> ({founderState})
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 justify-center">
                        {BRAND_STYLES.map(bs => (
                          <button
                            key={bs.name}
                            type="button"
                            onClick={() => setBrandStyle(bs.name)}
                            className={cn(
                              "px-2 py-0.5 rounded text-xs font-bold cursor-pointer transition-all uppercase",
                              brandStyle === bs.name
                                ? "bg-indigo-600 text-white"
                                : "bg-slate-200 dark:bg-slate-850 text-slate-600 dark:text-slate-400"
                            )}
                          >
                            {bs.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 7: LEGAL ENTITY STRUCTURE */}
              {currentStep === 7 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-xs font-mono font-bold text-blue-500 uppercase tracking-widest block">Step 7 of 12 • Legal Setup</span>
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">How should your business be structured?</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">The legal structure decides how you pay taxes and whether your personal assets are protected.</p>
                  </div>

                  <div className="space-y-3 pt-1">
                    {STRUCTURES.map(s => (
                      <button
                        key={s.id}
                        onClick={() => setStructure(s.id)}
                        className={cn(
                          "w-full p-4 rounded-xl border text-left cursor-pointer transition-all relative flex flex-col justify-between",
                          structure === s.id
                            ? "bg-blue-50/50 dark:bg-blue-950/15 border-blue-500"
                            : "bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-850 hover:border-slate-350"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-900 dark:text-white">{s.label}</span>
                          {s.id === 'LLC' && (
                            <span className="text-xs font-bold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded">BOOTSTRAP STANDARD</span>
                          )}
                          {s.id === 'C-Corp' && (
                            <span className="text-xs font-bold uppercase bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 px-1.5 py-0.5 rounded">VC PREFERRED</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-snug">{s.desc}</p>
                        {structure === s.id && (
                          <div className="absolute top-4 right-4 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                            ✓
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 8: JURISDICTION STATE PICKER */}
              {currentStep === 8 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-xs font-mono font-bold text-blue-500 uppercase tracking-widest block">Step 8 of 12 • Legal Setup</span>
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">Where should you register?</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">States differ in filing fees and taxes. Most businesses register in their home state — Delaware is popular for startups raising venture money.</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                    {Object.keys(STATE_PORTALS).map(st => {
                      const portal = STATE_PORTALS[st];
                      const selected = filingState === st;
                      return (
                        <button
                          key={st}
                          onClick={() => setFilingState(st)}
                          className={cn(
                            "p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between min-h-24 text-center",
                            selected
                              ? "bg-blue-50/50 dark:bg-blue-950/15 border-blue-500"
                              : "bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-850 hover:border-slate-350"
                          )}
                        >
                          <span className="text-xs font-black text-slate-900 dark:text-white block">{st}</span>
                          <div className="space-y-0.5">
                            <span className="text-xs text-slate-400 uppercase font-mono block">State Fee</span>
                            <span className="text-xs font-mono font-black text-emerald-600 dark:text-emerald-400">${portal.cost}</span>
                          </div>
                          <div className="flex justify-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span key={i} className={cn("text-xs", i < portal.rating ? "text-amber-400" : "text-slate-300")}>★</span>
                            ))}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* HIGH VALUE COMPARISON BOX */}
                  <div className="p-4 bg-slate-100 dark:bg-slate-950/80 rounded-2xl border border-slate-250 dark:border-slate-850 space-y-2 animate-fade-in">
                    <div className="flex items-center gap-2">
                      <Scale className="w-4 h-4 text-indigo-500" />
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Active Focus: {filingState} State Analysis</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-2.5 rounded bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase block mb-1">✓ Pros</span>
                        <p className="text-slate-600 dark:text-slate-400 leading-normal">{STATE_PORTALS[filingState]?.pros}</p>
                      </div>
                      <div className="p-2.5 rounded bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                        <span className="text-rose-600 dark:text-rose-400 font-bold uppercase block mb-1">✗ Cons & Ongoing costs</span>
                        <p className="text-slate-600 dark:text-slate-400 leading-normal">
                          Franchise Tax: <span className="font-semibold text-slate-800 dark:text-slate-200">{STATE_PORTALS[filingState]?.franchiseTax}</span>. {STATE_PORTALS[filingState]?.cons}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 9: PHYSICAL HEADQUARTERS SETUP */}
              {currentStep === 9 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-xs font-mono font-bold text-blue-500 uppercase tracking-widest block">Step 9 of 12 • Legal Setup</span>
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">Where will the business have its address?</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">Your business address becomes public record. A virtual office keeps your home address private.</p>
                  </div>

                  <div className="space-y-3 pt-1">
                    {HQ_OPTIONS.map(hq => (
                      <button
                        key={hq.label}
                        onClick={() => setHqType(hq.label)}
                        className={cn(
                          "w-full p-4 rounded-xl border text-left cursor-pointer transition-all relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2",
                          hqType === hq.label
                            ? "bg-blue-50/50 dark:bg-blue-950/15 border-blue-500"
                            : "bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-850 hover:border-slate-350"
                        )}
                      >
                        <div className="space-y-0.5">
                          <span className="text-xs font-black text-slate-900 dark:text-white block">{hq.label}</span>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">{hq.desc}</p>
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-850 px-2 py-1 rounded shrink-0 self-start sm:self-center">
                          {hq.cost}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 10: DYNAMIC API CONNECTORS PANEL */}
              {currentStep === 10 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-xs font-mono font-bold text-blue-500 uppercase tracking-widest block">Step 10 of 12 • Tools & Growth</span>
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">What tools will power your business?</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">Pick the services your business runs on — payments, banking, security, and more.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {activeTools.map(api => {
                      const selected = selectedApis.includes(api.id);
                      return (
                        <button
                          key={api.id}
                          onClick={() => {
                            if (selected) {
                              setSelectedApis(prev => prev.filter(x => x !== api.id));
                            } else {
                              setSelectedApis(prev => [...prev, api.id]);
                            }
                          }}
                          className={cn(
                            "p-3 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-3",
                            selected
                              ? "bg-blue-50/50 dark:bg-blue-950/15 border-blue-500"
                              : "bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-850 hover:border-slate-350"
                          )}
                        >
                          <div className={cn("w-4 h-4 rounded border mt-0.5 shrink-0 flex items-center justify-center text-xs", selected ? "bg-blue-500 border-blue-500 text-white font-bold" : "border-slate-300 bg-transparent")}>
                            {selected && "✓"}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-black text-slate-900 dark:text-white block">{api.name}</span>
                              <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-500 px-1 rounded uppercase font-bold">{api.category}</span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug">{api.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* VISUAL CONNECTING FLOWCHART */}
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-900 flex flex-col justify-between items-center text-center relative overflow-hidden shadow-inner">
                    <div className="absolute top-2 left-3 text-xs font-mono text-slate-500 uppercase tracking-widest font-black">ACTIVE SOFTWARE PIPELINE NET</div>
                    
                    <svg className="w-full h-20 max-w-sm my-4" viewBox="0 0 400 100">
                      {/* Lines */}
                      <line x1="50" y1="50" x2="150" y2="20" stroke={selectedApis.includes('Payments API Integration') ? '#3b82f6' : '#1e293b'} strokeWidth="2" strokeDasharray="4 2" />
                      <line x1="50" y1="50" x2="150" y2="50" stroke={selectedApis.includes('KYC Identity Decisioning') ? '#22c55e' : '#1e293b'} strokeWidth="2" strokeDasharray="4 2" />
                      <line x1="50" y1="50" x2="150" y2="80" stroke={selectedApis.includes('BaaS Ledger Aggregator') ? '#ec4899' : '#1e293b'} strokeWidth="2" strokeDasharray="4 2" />
                      <line x1="150" y1="50" x2="300" y2="50" stroke="#a855f7" strokeWidth="2" />

                      {/* Core Node */}
                      <circle cx="50" cy="50" r="14" fill="#0f172a" stroke="#fff" strokeWidth="2" />
                      <text x="50" y="53" fill="#fff" fontSize="8" textAnchor="middle" fontWeight="black" fontFamily="monospace">CORE</text>

                      {/* Mid API Nodes */}
                      <circle cx="150" cy="20" r="8" fill={selectedApis.includes('Payments API Integration') ? '#3b82f6' : '#1e293b'} />
                      <circle cx="150" cy="50" r="8" fill={selectedApis.includes('KYC Identity Decisioning') ? '#22c55e' : '#1e293b'} />
                      <circle cx="150" cy="80" r="8" fill={selectedApis.includes('BaaS Ledger Aggregator') ? '#ec4899' : '#1e293b'} />

                      {/* Bank vault node */}
                      <rect x="290" y="35" width="50" height="30" rx="4" fill="#090d16" stroke="#a855f7" strokeWidth="1.5" />
                      <text x="315" y="52" fill="#a855f7" fontSize="7" textAnchor="middle" fontWeight="bold" fontFamily="monospace">BANK VAULT</text>
                    </svg>

                    <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">
                      {selectedApis.length} API {selectedApis.length === 1 ? 'Node' : 'Nodes'} Linked Into Production Gateway
                    </span>
                  </div>
                </div>
              )}

              {/* STEP 11: MARKETING CHANNELS, FOUNDERS & EQUITY SPLITS */}
              {currentStep === 11 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-xs font-mono font-bold text-blue-500 uppercase tracking-widest block">Step 11 of 12 • Tools & Growth</span>
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">How will you grow — and who's on the team?</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">Choose how you'll reach customers, how many founders there are, and how ownership is split.</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <span className="block text-xs font-black text-slate-450 uppercase mb-2">1. Customer Acquisition GTM Loop</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {GROWTH_CHANNELS.map(g => (
                          <button
                            key={g.id}
                            onClick={() => setMarketingChannel(g.id)}
                            className={cn(
                              "p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between min-h-20",
                              marketingChannel === g.id
                                ? "bg-blue-50/50 dark:bg-blue-950/15 border-blue-500"
                                : "bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-850 hover:border-slate-350"
                            )}
                          >
                            <span className="font-bold text-xs text-slate-900 dark:text-white block">{g.label}</span>
                            <p className="text-xs text-slate-500 mt-0.5">{g.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-250 dark:border-slate-850 pt-4">
                      <div>
                        <span className="block text-xs font-black text-slate-450 uppercase mb-2">2. Team Allocation Protocol</span>
                        <div className="flex flex-col gap-2">
                          {['Solo founder (bootstrap)', 'Co-founding partnership', 'Advisors appointed'].map(cnt => (
                            <button
                              key={cnt}
                              type="button"
                              onClick={() => setFoundersCount(cnt)}
                              className={cn(
                                "py-2.5 rounded-lg text-xs font-bold cursor-pointer transition-colors border text-center",
                                foundersCount === cnt
                                  ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                                  : "bg-slate-50 dark:bg-slate-900 text-slate-650 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100"
                              )}
                            >
                              {cnt}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="block text-xs font-black text-slate-450 uppercase mb-2">3. Equity & Vesting Split Plan</span>
                        <div className="flex flex-col gap-2">
                          {EQUITY_SPLITS.map(eq => (
                            <button
                              key={eq.val}
                              type="button"
                              onClick={() => setEquitySplit(eq.val)}
                              className={cn(
                                "p-2 rounded-lg text-xs text-left cursor-pointer transition-colors border",
                                equitySplit === eq.val
                                  ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                                  : "bg-slate-50 dark:bg-slate-900 text-slate-650 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100"
                              )}
                            >
                              <span className="font-black block">{eq.val.split(' ')[0]} Split</span>
                              <p className="text-xs opacity-90 mt-0.5 leading-tight">{eq.desc}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 12: WRAP-UP */}
              {currentStep === 12 && (
                <BusinessSummary
                  businessName={businessName || 'Your Fintech'}
                  finalLane={finalLane}
                  businessType={businessType}
                  selectedCohort={selectedCohort}
                  monetization={monetization}
                  structure={structure === 'Solo' ? 'Sole Prop' : structure}
                  filingState={filingState}
                  fundingStrategy={fundingStrategy}
                  onDownload={handleDownloadPlan}
                  onStressTest={runStressTest}
                  onStartOver={handleStartOver}
                  onAdvancedMode={handleAdvancedMode}
                />
              )}

            </motion.div>
          </AnimatePresence>
        </div>


      </div>

      {/* FOOTER NAVIGATION CONTROLS */}
      <div className="relative z-10 flex justify-between items-center mt-8 pt-4 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={handleBack}
          disabled={currentStep === 1}
          className={cn(
            "px-4 py-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer",
            currentStep === 1
              ? "border-slate-200 dark:border-slate-800 text-slate-350 dark:text-slate-700 cursor-not-allowed"
              : "border-slate-250 dark:border-slate-700 text-slate-650 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          )}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        {currentStep < 12 ? (
          <button
            onClick={handleNext}
            disabled={!canAdvance()}
            className={cn(
              "px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-3xs",
              canAdvance()
                ? "bg-slate-950 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-900 dark:hover:bg-slate-50"
                : "bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed"
            )}
          >
            <span>Next Step</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={() => {
              setCurrentStep(1);
              setBusinessType('fintech');
              setLane('Digital Banking');
              setCustomLane('');
              setProblem('High transaction friction and slow settlement corridors.');
              setCustomProblem('');
              setSelectedCohort('Gig workers & Freelancers');
              setReachUsers(10000);
              setMonetization('Subscription model (recurring software license fee)');
              setMonthlyFee(12);
              setTxVolume(150000);
              setBusinessName('');
              setStructure('LLC');
              setFilingState('Delaware');
              setHqType('Virtual office address');
              setFoundersCount('Co-founding partnership');
              setSelectedApis(['Payments API Integration', 'KYC Identity Decisioning']);
              setMarketingChannel('Developer Relations & API documentation');
              setFounderName('');
              setFounderState('California');
              setFundingStrategy('Seed Venture Capital SAFE ($500K - $2M)');
              setEquitySplit('Equal 50/50 Split (4-Year Vesting with 1-Year Cliff)');
              setBoiChecked(false);
            }}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Builder</span>
          </button>
        )}
      </div>
      </>
      )}

      {/* DYNAMIC SANDBOX STRESS TEST SIMULATOR MODAL */}
      {showSimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-slate-950 text-white rounded-3xl border border-slate-800 overflow-hidden flex flex-col max-h-[90vh] shadow-2xl relative animate-scale-up">
            
            {/* Header */}
            <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-emerald-500 animate-pulse" />
                <span className="text-sm font-mono font-black uppercase tracking-wider">FinTech Sandbox Stress Test Simulator</span>
              </div>
              <button 
                onClick={() => { if (!isSimulating) setShowSimModal(false); }}
                disabled={isSimulating}
                className={cn(
                  "text-slate-400 hover:text-white transition-colors font-bold text-xs uppercase cursor-pointer",
                  isSimulating && "opacity-30 cursor-not-allowed"
                )}
              >
                Close
              </button>
            </div>

            {/* Terminal View */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3 font-mono text-xs leading-relaxed min-h-[250px] max-h-[350px] bg-black text-emerald-400 select-text scrollbar-thin">
              {simLogs.map((log, idx) => {
                let color = 'text-emerald-400';
                if (log.includes('FAIL') || log.includes('REJECTED') || log.includes('WARNING') || log.includes('FRAGILE')) color = 'text-rose-500 font-bold';
                if (log.includes('SUCCESS') || log.includes('FUNDED') || log.includes('STABLE')) color = 'text-emerald-300 font-bold';
                if (log.includes('CHALLENGE') || log.includes('ALERT')) color = 'text-amber-400 font-bold';
                if (log.includes('[SYSTEM]')) color = 'text-blue-400 font-semibold';
                return (
                  <div key={idx} className={color}>
                    {log}
                  </div>
                );
              })}
              {isSimulating && (
                <div className="flex items-center gap-1 text-slate-400 italic">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                  <span>Processing transactions, compiling audit checklists and testing network volumes...</span>
                </div>
              )}
            </div>

            {/* Outcomes Block */}
            {!isSimulating && simSuccess !== null && (
              <div className="p-6 bg-slate-900 border-t border-slate-800 space-y-4 animate-fade-in text-sans">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border",
                    simSuccess 
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" 
                      : "bg-rose-500/10 border-rose-500/30 text-rose-500"
                  )}>
                    {simSuccess ? <Check className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="font-sans font-black text-sm text-slate-100">
                      Venture Simulation Outcome: {simSuccess ? 'STABLE & COMPLIANT' : 'CRITICAL COMPLIANCE FAILURE'}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {simSuccess 
                        ? 'Your active API integrations, compliance checkmarks, and structural frameworks matched regulatory standards perfectly.' 
                        : 'Your venture suffered compliance collapses during regulatory spot auditing because you launched without KYC integrations.'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-center font-mono text-xs">
                  <div className="p-2.5 rounded-xl bg-black/40 border border-slate-800">
                    <span className="text-slate-500 uppercase block text-xs font-bold">Accounts</span>
                    <span className="text-xs font-black text-blue-400 mt-1 block">{simMetrics.users.toLocaleString()}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/40 border border-slate-800">
                    <span className="text-slate-500 uppercase block text-xs font-bold">Revenue Run-rate</span>
                    <span className="text-xs font-black text-emerald-400 mt-1 block">${simMetrics.ARR.toLocaleString()} ARR</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/40 border border-slate-800">
                    <span className="text-slate-500 uppercase block text-xs font-bold">SEC Compliance</span>
                    <span className={cn("text-xs font-black mt-1 block", simMetrics.auditPassed ? "text-emerald-400" : "text-rose-500")}>
                      {simMetrics.auditPassed ? 'PASSED (100)' : 'FAILED (35)'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/40 border border-slate-800">
                    <span className="text-slate-500 uppercase block text-xs font-bold">VC SAFE closed</span>
                    <span className={cn("text-xs font-black mt-1 block", simMetrics.safeClosed ? "text-indigo-400" : "text-slate-500")}>
                      {simMetrics.safeClosed ? 'SECURED $1.5M' : 'NONE'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2 border-t border-slate-800/80">
                  <button
                    onClick={runStressTest}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer"
                  >
                    Run Simulation Again
                  </button>
                  <button
                    onClick={() => {
                      setShowSimModal(false);
                      if (onAwardXp) {
                        onAwardXp(150, "Launching Your Sovereign FinTech Venture");
                      }
                      if (onCompleteCapstone) {
                        onCompleteCapstone();
                      }
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer"
                  >
                    Accept & Settle Dossier
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
