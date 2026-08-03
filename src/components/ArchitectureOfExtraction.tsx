import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  ShieldAlert, 
  TrendingDown, 
  Layers, 
  ChevronRight, 
  ChevronDown, 
  Sparkles,
  FileText
} from 'lucide-react';
import { cn } from '../lib/utils';

export interface FactModule {
  id: number;
  era: string;
  title: string;
  policy: string;
  benefited: string;
  paid: string;
  shortSummary: string;
  fullBody: string;
  keyLegislation: string[];
  impactMetric: string;
  badgeBg: string;
  badgeText: string;
  glowColor: string;
}

const FACTS_DATA: FactModule[] = [
  {
    id: 1,
    era: '1790s',
    title: 'The Founding Debt: A System Built for Creditors',
    policy: 'Alexander Hamilton\'s First Report on Public Credit & Funding Act of 1790',
    benefited: 'Northern financiers, war bond speculators',
    paid: 'Taxpayers, farmers, enslaved laborers',
    shortSummary: 'America\'s initial financial stack assumed state debts to bind wealthy creditors to the state. Revenue came from tariffs & excise taxes on working farmers, while the national capital was placed in slave-holding Potomac territory.',
    fullBody: `The American financial system's first major act was Alexander Hamilton's First Report on Public Credit, delivered to Congress on January 9, 1790. Hamilton proposed that the federal government assume the states' Revolutionary War debts (roughly $22 million). This converted depreciated war bonds bought up by speculators into new federal securities — transferring wealth directly to financiers who bet the new government would pay.

The Funding Act of 1790 paired debt assumption with locating the federal capital on the Potomac, where economy and infrastructure were built on enslaved labor. Black Americans were not participants in this founding debt system; they were its collateral.`,
    keyLegislation: ['Funding Act of 1790', 'Report on Public Credit', 'Compromise of 1790'],
    impactMetric: '$22M Debt Securitized',
    badgeBg: 'bg-amber-500/10 dark:bg-amber-950/60',
    badgeText: 'text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800',
    glowColor: 'border-amber-500/30'
  },
  {
    id: 2,
    era: '1600s–1865',
    title: 'Slavery as America\'s First Securitized Asset Class',
    policy: 'Antebellum Banking Mortgages, Life Insurance Policies & Foreclosures',
    benefited: 'Southern plantation owners, Wall Street banks, insurers',
    paid: 'Enslaved Black human beings',
    shortSummary: 'Enslaved people were legally treated as property and transformed into mortgage collateral, credit instruments, and insurable risk. Banks foreclosed on human beings when plantation owners defaulted.',
    fullBody: `Enslaved people were financial instruments. Economic historians studying antebellum credit found that enslaved people were mortgaged, pledged as loan collateral, and seized in foreclosures alongside land. Southern and Northern banks actively funded slave purchases or accepted enslaved bodies as collateral.

Insurance companies wrote policies on enslaved lives, actuarially calculating risk "from birth to death." Financial institutions provided the capital and credit markets allowing slavery to expand westward — making human bodies America's first securitized asset class.`,
    keyLegislation: ['Antebellum Property & Banking Codes', 'Southern Mortgage Charters'],
    impactMetric: '4 Million Human Beings Securitized',
    badgeBg: 'bg-red-500/10 dark:bg-red-950/60',
    badgeText: 'text-red-700 dark:text-red-400 border-red-300 dark:border-red-800',
    glowColor: 'border-red-500/30'
  },
  {
    id: 3,
    era: '1865–1874',
    title: 'Reconstruction\'s Broken Promise: Freedman\'s Savings Bank',
    policy: 'Congressional Chartering & Mismanagement of Freedman\'s Trust',
    benefited: 'White trustees, speculative real estate borrowers',
    paid: '61,144+ Black Civil War veterans & depositors',
    shortSummary: 'Congress chartered Freedman\'s Savings Bank to help emancipated Black families build wealth ($57M+ deposited). Trustees speculatively gambled deposits into failing projects, wiping out $3M ($70M+ modern equivalent) in savings without federal reimbursement.',
    fullBody: `Congress chartered the Freedman's Savings and Trust Company in March 1865 to give newly emancipated Black Americans and veterans a safe place to build savings. Over $57 million was deposited. In 1870, Congress loosened investment restrictions, and the all-white board of trustees funneled deposits into speculative unsecured loans.

Frederick Douglass was brought in as president in March 1874 to restore confidence, personally investing $10,000, but the bank closed on June 29, 1874. Over 61,000 depositors lost $3 million in savings. Congress repeatedly blocked reimbursement bills, leaving generations with justified distrust of banking institutions.`,
    keyLegislation: ['Freedman\'s Savings Charter Act', 'Panic of 1873 Legislation'],
    impactMetric: '$57M Deposited • $3M Wiped Out',
    badgeBg: 'bg-orange-500/10 dark:bg-orange-950/60',
    badgeText: 'text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-800',
    glowColor: 'border-orange-500/30'
  },
  {
    id: 4,
    era: '1870s–1910s',
    title: 'The Gilded Age: Private Banker as Central Bank',
    policy: 'Panic of 1907 Liquidity Syndicates & Private Banker Monopoly',
    benefited: 'J.P. Morgan, Wall Street syndicate bank presidents',
    paid: 'Unbanked citizens, excluded Black communities',
    shortSummary: 'With no U.S. central bank, J.P. Morgan personally organized bank syndicates to rescue Wall Street during panics. Black Americans were completely excluded from mainstream banking relationships and access to emergency capital.',
    fullBody: `During the Panic of 1907, the NYSE fell by nearly 50%. J.P. Morgan personally organized a syndicate of bank presidents, pledged his own money, and secured federal Treasury funds to rescue the banking system.

For Black Americans, who were largely barred from mainstream banking, this period provided zero capital access. Whoever controlled emergency liquidity dictated economic recovery terms — sitting in the hands of a few private financiers accountable to no public body.`,
    keyLegislation: ['National Banking Acts of 1863/1864'],
    impactMetric: '100% Private Liquidity Control',
    badgeBg: 'bg-yellow-500/10 dark:bg-yellow-950/60',
    badgeText: 'text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-800',
    glowColor: 'border-yellow-500/30'
  },
  {
    id: 5,
    era: '1913',
    title: 'The Federal Reserve: Born From Bankers, for Banks',
    policy: 'Federal Reserve Act of 1913 & Aldrich Plan (Jekyll Island Meeting)',
    benefited: 'Member commercial banks, institutional liquidity',
    paid: 'General public & excluded communities',
    shortSummary: 'Drafted in secret at Jekyll Island by top Wall Street bankers, the Federal Reserve Act created a central bank designed to stabilize private banking liquidity, without any mandate or representation for Black economic inclusion.',
    fullBody: `In November 1910, Senator Nelson Aldrich convened a secret meeting at the Jekyll Island Club in Georgia with partners from J.P. Morgan, National City Bank, and top financiers. They authored the Aldrich Plan, which became the Federal Reserve Act signed by President Woodrow Wilson on December 23, 1913.

While the Glass-Owen bill added regional public oversight, the Fed was conceived primarily to backstop private banks against panics — not to promote equitable wealth distribution or Black economic participation. Zero Black Americans were present at Jekyll Island or in drafting the Act.`,
    keyLegislation: ['Federal Reserve Act of 1913', 'Glass-Owen Bill'],
    impactMetric: '12 Regional Fed Backstops Established',
    badgeBg: 'bg-emerald-500/10 dark:bg-emerald-950/60',
    badgeText: 'text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800',
    glowColor: 'border-emerald-500/30'
  },
  {
    id: 6,
    era: '1930s–1940s',
    title: 'The New Deal: Rescuing Capitalism, Codifying Segregation',
    policy: 'FHA Underwriting Guidelines & HOLC Color-Coded Security Maps (Redlining)',
    benefited: 'White suburban homebuyers & developer cartels',
    paid: 'Black urban families systematically denied mortgages',
    shortSummary: 'Federal housing policy built modern white suburban wealth through FHA-backed low-cost mortgages while explicitly grading Black neighborhoods as "Hazardous" (Type D / Redlined), denying them federal mortgage guarantees for decades.',
    fullBody: `The Home Owners' Loan Corporation (HOLC) created color-coded security maps for 200+ cities, grading Black neighborhoods as "D" (red, hazardous). The Federal Housing Administration (FHA), created in 1934, adopted underwriting standards that systematically insured mortgages for new white suburban housing developments while starving Black urban neighborhoods of credit.

The effect was devastating and permanent: Black families were excluded from the premier wealth-building machine of the 20th century. Most HOLC "hazardous" redlined zones remain lower-income and majority-minority today.`,
    keyLegislation: ['National Housing Act of 1934', 'HOLC City Maps'],
    impactMetric: '98%+ FHA Loans Directed to White Suburbs',
    badgeBg: 'bg-cyan-500/10 dark:bg-cyan-950/60',
    badgeText: 'text-cyan-700 dark:text-cyan-400 border-cyan-300 dark:border-cyan-800',
    glowColor: 'border-cyan-500/30'
  },
  {
    id: 7,
    era: '1944–1968',
    title: 'Postwar Prosperity, Selectively Distributed',
    policy: 'Servicemen\'s Readjustment Act of 1944 (GI Bill Local VA Control)',
    benefited: '1.2M White WWII veterans receiving suburban homes & tuition',
    paid: 'Black WWII veterans shut out by local Southern VA administrators',
    shortSummary: 'The GI Bill transformed white veterans into the American middle class through free tuition and low-cost mortgages. Southern legislators ensured local VA offices administered benefits, rejecting Black veterans\' home loans and college entry.',
    fullBody: `Signed in June 1944, the GI Bill offered veterans college tuition, unemployment pay, and low-interest mortgages. However, Southern congressmen ensured administration was delegated to local state VA offices.

Out of 67,000 initial GI Bill mortgages insured, fewer than 100 went to non-white veterans in the South. Black colleges were underfunded and overwhelmed, and banks routinely refused to originate GI loans in Black neighborhoods, widening the racial wealth gap at the exact moment of post-war expansion.`,
    keyLegislation: ['Servicemen\'s Readjustment Act of 1944', 'Jim Crow Local VA Mandates'],
    impactMetric: '< 100 of 67,000 Mortgages for Non-White Veterans',
    badgeBg: 'bg-blue-500/10 dark:bg-blue-950/60',
    badgeText: 'text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-800',
    glowColor: 'border-blue-500/30'
  },
  {
    id: 8,
    era: '1980s–1999',
    title: 'Deregulation and the Return of "Too Big to Fail"',
    policy: 'Gramm-Leach-Bliley Act of 1999 & Repeal of Glass-Steagall Safeguards',
    benefited: 'Mega-bank holding conglomerates & Wall Street trading desks',
    paid: 'Ordinary taxpayers & targeted subprime borrowers',
    shortSummary: 'Repealing Glass-Steagall merged commercial banks, investment houses, and insurance firms into massive holding conglomerates, creating "Too Big to Fail" institutions and giving rise to explosive predatory subprime lending targeting minority communities.',
    fullBody: `The Gramm-Leach-Bliley Act of 1999 repealed Glass-Steagall restrictions that had separated commercial banking from high-risk investment banking since 1933. Consolidation accelerated into massive mega-banks guaranteed implicit federal bailouts.

This deregulatory wave coincided with predatory subprime mortgage proliferation—financial firms specifically targeted Black and Latino neighborhoods with high-cost, adjustable-rate subprime products regardless of creditworthiness.`,
    keyLegislation: ['Gramm-Leach-Bliley Act of 1999', 'Commodity Futures Modernization Act'],
    impactMetric: '$10T+ Mega-Bank Financial Holding Combines',
    badgeBg: 'bg-indigo-500/10 dark:bg-indigo-950/60',
    badgeText: 'text-indigo-700 dark:text-indigo-400 border-indigo-300 dark:border-indigo-800',
    glowColor: 'border-indigo-500/30'
  },
  {
    id: 9,
    era: '2008',
    title: '2008 Crisis: Asymmetric Bailouts for Banks, Foreclosure for Communities',
    policy: 'Emergency Economic Stabilization Act of 2008 & $700B TARP Bailout',
    benefited: 'Citigroup ($25B+), Bank of America ($45B), Wells Fargo ($25B)',
    paid: 'Black & Latino families losing 53% of collective net worth in foreclosures',
    shortSummary: 'Subprime mortgage defaults triggered the global financial crash. Washington bailed out Wall Street mega-banks with $700B TARP funds while Black families suffered massive wealth destruction, losing over 50% of collective wealth in foreclosures.',
    fullBody: `Subprime loans were targeted heavily at Black communities. When the market crashed, the federal response was asymmetrical: TARP supplied $700B in direct cash and guarantees to Wall Street mega-banks. Citigroup received $25B in TARP and $306B in asset guarantees.

Meanwhile, foreclosure mitigation programs helped only a fraction of affected homeowners. Black families lost 53% of their collective wealth between 2007 and 2010, resetting Black homeownership rates back to 1968 levels.`,
    keyLegislation: ['Troubled Asset Relief Program (TARP)', 'Emergency Economic Stabilization Act'],
    impactMetric: '53% Collective Black Wealth Destroyed',
    badgeBg: 'bg-purple-500/10 dark:bg-purple-950/60',
    badgeText: 'text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-800',
    glowColor: 'border-purple-500/30'
  },
  {
    id: 10,
    era: '2010s–Present',
    title: 'The Algorithmic Era: New Tools, Familiar Patterns',
    policy: 'Fintech Algorithmic Underwriting & ML Credit Scoring Models',
    benefited: 'Fintech platforms, automated underwriting margins',
    paid: 'Minority borrowers subjected to automated proxy bias',
    shortSummary: 'Fintech algorithms promised objective, non-biased lending. However, algorithms trained on 100+ years of historically biased redlining data reproduce disparate pricing, charging Black and Latino borrowers higher interest rates for identical risk profiles.',
    fullBody: `Automated algorithmic underwriting is marketed as neutral. Yet peer-reviewed research shows machine learning models still charge Black and Latino borrowers higher interest rates and fees for identical risk profiles.

Because algorithms train on historical credit data shaped by a century of redlining and unequal wage access, automated models act as modern proxies for historic discrimination under a mathematical veneer.`,
    keyLegislation: ['Dodd-Frank CFPB Rules', 'Fair Credit Reporting Act AI Updates'],
    impactMetric: 'Automated Disparate Impact at Scale',
    badgeBg: 'bg-rose-500/10 dark:bg-rose-950/60',
    badgeText: 'text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-800',
    glowColor: 'border-rose-500/30'
  }
];

export function ArchitectureOfExtraction() {
  const [selectedFactId, setSelectedFactId] = useState<number | null>(null);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-12 pt-4 px-2">
      
      {/* Header Banner Module */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800 rounded-3xl p-6 md:p-10 text-white shadow-2xl relative overflow-hidden space-y-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shadow-inner">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-red-400">Historical Module • 10 Critical Eras</span>
              <h1 className="text-2xl md:text-3xl font-black font-display text-white">History of Black American Finance</h1>
            </div>
          </div>
        </div>

        <p className="text-sm md:text-base text-slate-300 leading-relaxed max-w-3xl relative z-10">
          A definitive, data-grounded chronicling of Black American financial history. Explore how legislative barriers, banking structures, and local policies impacted wealth building, alongside powerful moments of cooperative economics, community resilience, and systemic change.
        </p>
      </div>

      {/* 10 FACT MODULE CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {FACTS_DATA.map((fact) => {
          const isSelected = selectedFactId === fact.id;
          return (
            <motion.div
              key={fact.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "bg-white dark:bg-slate-900 border rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4 transition-all relative overflow-hidden",
                isSelected
                  ? "ring-2 ring-blue-500 border-blue-500 shadow-xl dark:bg-slate-900/90"
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
              )}
            >
              {/* Fact Card Top Header */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded border shadow-2xs",
                    fact.badgeBg,
                    fact.badgeText
                  )}>
                    FACT {fact.id} • {fact.era}
                  </span>

                  <span className="text-xs font-mono font-bold text-slate-400">
                    {fact.impactMetric}
                  </span>
                </div>

                <h3 className="text-lg font-black font-display text-slate-900 dark:text-white leading-snug">
                  {fact.title}
                </h3>

                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 flex items-start gap-2">
                  <FileText className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <span><strong className="text-slate-700 dark:text-slate-300">Policy Mechanism:</strong> {fact.policy}</span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {fact.shortSummary}
                </p>

                {/* Who Benefited vs Who Paid Breakdown */}
                <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block mb-1">Who Benefited</span>
                    <span className="text-emerald-900 dark:text-emerald-200 font-bold block">{fact.benefited}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40">
                    <span className="text-xs font-black uppercase tracking-wider text-red-700 dark:text-red-400 block mb-1">Who Paid / Impacted</span>
                    <span className="text-red-900 dark:text-red-200 font-bold block">{fact.paid}</span>
                  </div>
                </div>

                {/* Expanded Details Body */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3"
                    >
                      <div className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-slate-950/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                        {fact.fullBody}
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Key Federal / Legal Frameworks:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {fact.keyLegislation.map((leg, idx) => (
                            <span key={idx} className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              {leg}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Toggle Detail Card Action */}
              <button
                onClick={() => setSelectedFactId(isSelected ? null : fact.id)}
                className={cn(
                  "w-full py-2 px-4 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer border",
                  isSelected
                    ? "bg-blue-600 text-white border-blue-500 shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-blue-600 hover:text-white"
                )}
              >
                <span>{isSelected ? 'Collapse Fact Analysis' : 'Expand Fact Deep Dive'}</span>
                {isSelected ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Summary Footer Note */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-slate-300 space-y-3">
        <h4 className="text-base font-black font-display text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span>Historical Conclusion & Educational Mandate</span>
        </h4>
        <p className="text-xs md:text-sm leading-relaxed text-slate-400">
          Across two and a half centuries, the throughline is clear: financial reforms routinely stabilized capital for institutions while codifying exclusion for Black communities. Understanding this architecture is crucial for building modern fintech alternatives, credit underwriting tools, and decentralized financial systems that democratize wealth.
        </p>
      </div>

    </div>
  );
}
