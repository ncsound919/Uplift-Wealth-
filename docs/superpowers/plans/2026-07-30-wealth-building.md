# Wealth Building Section — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Wealth Building" section to the FinTech Foundations platform — 5 chapters, 5 interactive tools, hub with compound growth preview, completion tracking via localStorage.

**Architecture:** New top-level sidebar section between "Business Builder" and "Fintech Starter Map". 6 new routes (`/wealth-building`, `/wealth-building/credit`, etc.), 5 chapter components wrapping a shared `ChapterShell` + markdown body, 5 tool components with pure-function math. Completion-only localStorage tracking. Reuses existing `react-markdown` renderer and App.tsx view-state machine.

**Tech Stack:** React, TypeScript, react-markdown, lucide-react, localStorage.

---

## File Map

### Created files:

| File | Responsibility |
|---|---|
| `src/data/wealthChapters.ts` | 5 chapter entries with markdown bodies |
| `src/hooks/useChapterCompletion.ts` | localStorage-based completion read/write |
| `src/components/wealth/ChapterShell.tsx` | Shared chapter layout wrapper |
| `src/components/wealth/MarkCompleteButton.tsx` | Completion toggle button |
| `src/components/wealth/CreditMastery.tsx` | Chapter 1 component |
| `src/components/wealth/InvestingIRAs.tsx` | Chapter 2 component |
| `src/components/wealth/RealEstate.tsx` | Chapter 3 component |
| `src/components/wealth/BusinessBuilding.tsx` | Chapter 4 component |
| `src/components/wealth/GroupEconomics.tsx` | Chapter 5 component |
| `src/components/wealth/tools/CompoundGrowthVisualizer.tsx` | Flagship tool — growth calculator with milestones |
| `src/components/wealth/tools/CreditActionPlan.tsx` | Tool — credit score improvement estimator |
| `src/components/wealth/tools/RealEstateAnalyzer.tsx` | Tool — cap rate + cash-on-cash calculator |
| `src/components/wealth/tools/BusinessViabilityCalculator.tsx` | Tool — break-even + P&L projection |
| `src/components/wealth/tools/GroupPoolCalculator.tsx` | Tool — pooled capital growth calculator |
| `src/components/WealthBuilding.tsx` | Hub page with 5 chapter cards + growth preview |

### Modified files:

| File | Change |
|---|---|
| `src/App.tsx` | Add 6 view values, lazy-load wealth components, add sidebar entry, add route sync |
| `src/App.test.tsx` | Add sidebar entry + navigation tests |

---

### Task 1: Chapter data + completion hook + shared components

**Files:**
- Create: `src/data/wealthChapters.ts`
- Create: `src/hooks/useChapterCompletion.ts`
- Create: `src/components/wealth/ChapterShell.tsx`
- Create: `src/components/wealth/MarkCompleteButton.tsx`
- Create: `src/components/wealth/wealth.test.tsx`

- [ ] **Step 1: Create data file**

```ts
// src/data/wealthChapters.ts
export interface WealthChapter {
  id: 'credit' | 'investing' | 'real_estate' | 'business' | 'group_economics';
  title: string;
  subtitle: string;
  gradient: string;
  body: string;
  estimatedMinutes: number;
}

export const wealthChapters: WealthChapter[] = [
  {
    id: 'credit',
    title: 'Credit Mastery',
    subtitle: 'Building the foundation for every wealth-building move',
    gradient: 'from-blue-600 to-indigo-600',
    estimatedMinutes: 12,
    body: `## Why Credit Is Your First Wealth Tool

Your credit score is not a grade. It is a **price tag on your financial life.** A 760+ score saves you $200K+ over a lifetime compared to a 620 score — in lower mortgage rates, insurance premiums, and car loan terms.

The credit system was historically used to exclude Black Americans (redlining, predatory lending). But the rules today can be worked in your favor once you understand them.

> **Black Wall Street Wisdom:** Greenwood, Tulsa had Black-owned banks that lent to Black businesses at fair rates — proof that community-controlled capital works.

## The 5 Factors of Your FICO Score

1. **Payment history (35%)** — Pay every bill on time. One 30-day late can drop you 100 points.
2. **Credit utilization (30%)** — Keep balances under 10% of your limit. $500 of a $5,000 limit = 10%.
3. **Length of credit history (15%)** — Older accounts are better. Never close your oldest card.
4. **New credit (10%)** — Too many hard inquiries in 6 months = risk signal.
5. **Credit mix (10%)** — Installment loans (car/mortgage) + revolving (credit cards) = stronger profile.

## Action Plan: 0 to 800 in 18 Months

**Month 1:** Pull all 3 reports at [AnnualCreditReport.com](https://www.annualcreditreport.com) — free weekly. Dispute errors at [CFPB dispute portal](https://www.consumerfinance.gov/complaint/).
**Month 2:** Get a secured card (Capital One, Discover, Chime Credit Builder). Put $200 deposit. Spend $20/mo, auto-pay in full.
**Month 6:** Ask for an unsecured upgrade. Request credit limit increases every 6 months.
**Month 12:** Add a credit-builder loan (Self, Chime, or credit union). Mix + installment history.
**Month 18:** 700+ score. Apply for Chase Freedom or Amex — premium cards with benefits.

> **Caution:** Pay off your statement balance in full every month. Interest rates (20-29% APR) will destroy wealth if you carry a balance.

## Business Credit: The Hidden Lever

Your personal credit opens doors. Business credit opens **warehouses.**

- Get a DUNS number (Dun & Bradstreet) — free at [dnb.com](https://www.dnb.com)
- Open a business credit card (Amex Blue Business, Capital One Spark)
- Vendor credit: Net-30 accounts with Uline, Grainger, Quill
- Business credit uses your EIN, not your SSN — protects personal score`

  },
  {
    id: 'investing',
    title: 'Investing & IRAs',
    subtitle: 'Making your money work as hard as you do',
    gradient: 'from-emerald-600 to-teal-600',
    estimatedMinutes: 18,
    body: `## The Math That Changes Everything

Time in the market beats timing the market. A 22-year-old who invests **$200/mo at 8%** has **$700K+ at 65**. The same person starting at 35 has **$200K**. The difference is not skill — it is **13 years of compound growth**.

## The Investment Ladder

### Step 1: Employer Match (Free Money)
If your employer offers a 401(k) match, contribute enough to get the full match. That is an **immediate 100% return.** No stock, no real estate, no crypto beats that.

### Step 2: Roth IRA (Tax-Free Growth)
- Contribute up to $7,000/year (2026 limit)
- Pay taxes now. Growth and withdrawals are **tax-free forever.**
- Open at Vanguard, Fidelity, or Schwab — they are the big three for a reason
- Invest in a target-date index fund (e.g., VFIFX for 2065 retirement) — zero thought required

### Step 3: Max Your 401(k)
- $23,500/year (2026 limit, +$7,500 catch-up if 50+)
- Traditional = tax break today. Roth = tax break in retirement.
- The general rule: Roth if you expect higher taxes in retirement, Traditional if lower

### Step 4: Taxable Brokerage
- Once retirement accounts are maxed, invest in a regular brokerage
- Focus on total-market index funds: VTI (total US) + VXUS (total international) + BND (bonds)
- The **3-fund portfolio** — all you ever need

## Compound Growth Visualizer

Use the tool below to see exactly how your money grows. Start with $100, add $200/mo, and watch it cross every milestone.

## Key Terms

| Term | Definition |
|---|---|
| **ETF** | Exchange-Traded Fund — basket of stocks you buy like a single stock |
| **Index Fund** | Fund that tracks S&P 500 or total market — low fees, passive management |
| **Expense Ratio** | Annual fee — aim for under 0.10% (VTI = 0.03%) |
| **Dividend** | Company profit share paid to shareholders — reinvest automatically |
| **Bond** | Loan to government/corp — lower risk, 4-5% return, stabilizes portfolio |

> **Black Wall Street Wisdom:** The Black Panthers' survival programs included free financial education. The modern version is understanding that Wall Street is just a tool — and tools belong to whoever picks them up.`

  },
  {
    id: 'real_estate',
    title: 'Real Estate',
    subtitle: 'From rent checks to equity — owning the roof over your head and more',
    gradient: 'from-amber-600 to-orange-600',
    estimatedMinutes: 22,
    body: `## Why Real Estate?

Real estate builds wealth through **four mechanisms**:
1. **Appreciation** — property value rises over time (~3-5%/year nationally)
2. **Cash flow** — tenants pay down your mortgage + send you profit each month
3. **Equity paydown** — every mortgage payment builds ownership
4. **Tax advantages** — depreciation, 1031 exchanges, mortgage interest deduction

## The Path: From Renter to Portfolio

### Phase 1: House Hacking (Year 1-3)
- Buy a 2-4 unit property with an FHA loan (3.5% down)
- Live in one unit, rent the others — they cover your mortgage
- You live for free + build equity
- FHA requires owner occupancy + credit score 580+

### Phase 2: BRRRR Method (Year 3-7)
**Buy → Rehab → Rent → Refinance → Repeat**

1. Buy a distressed property below market value
2. Renovate ($20-50K, funded by a hard-money loan or HELOC)
3. Rent to tenants (rent must cover mortgage + expenses + 10% vacancy)
4. Refinance at the new appraised value (pull out cash, tax-free)
5. Use the cash for the next property

**The math that works:**
- Purchase: $150K
- Rehab: $30K
- After-repair value: $220K
- Refinance 75% LTV: $165K
- Pay off purchase + rehab ($180K) — wait, shortfall. Better example:
- Purchase: $100K (cash or hard money)
- Rehab: $20K
- ARV: $160K
- Refinance 75%: $120K — pay off $100K purchase, $20K rehab, **$0 of your own money back**

### Phase 3: Scale (Year 7+)
- Use 1031 exchange to sell properties tax-free and roll into larger ones
- Partner with other investors through LLCs
- Hire property management — you stop being a landlord and become an investor

## The One Percent Rule

Monthly rent must be **at least 1% of purchase price.** A $200K house must rent for $2,000/mo. If it doesn't, keep looking.

> **Reality check:** This is harder in high-cost cities (NY, SF) and easier in the Midwest and South. Consider investing out-of-state before you give up on real estate.

## Key Metrics

| Metric | Formula | Good Target |
|---|---|---|
| **Cap Rate** | NOI ÷ Purchase Price | 8%+ |
| **Cash-on-Cash** | Annual Cash Flow ÷ Cash Invested | 10%+ |
| **Debt Coverage** | NOI ÷ Annual Debt Service | 1.25+ |

Use the Real Estate Analyzer tool below to run the numbers on any property.`

  },
  {
    id: 'business',
    title: 'Business Building',
    subtitle: 'Creating assets that pay you while you sleep',
    gradient: 'from-purple-600 to-pink-600',
    estimatedMinutes: 25,
    body: `## The Wealth Multiplier

A job pays you for your time. A business pays you for **systems.** The goal is to build something that runs without you — a self-driving asset.

## Two Paths

### Path A: Buy an Existing Business
- [BizBuySell.com](https://www.bizbuysell.com) — millions of listings
- Look for: $100-500K purchase price, 2+ years of profitable history, owner willing to train
- SBA 7(a) loan: 10-20% down, 10-year term, rates 8-12%
- Best for: first-time owners who want cash flow day 1

### Path B: Start from Scratch

#### Stage 1: $0 → $10K (3-6 months)
- Service business with low startup cost: pressure washing, lawn care, mobile car detailing, cleaning
- You do the work. Your phone = your office. Your car = your HQ.
- Goal: 10 paying customers, recurring revenue model

#### Stage 2: $10K → $100K (6-18 months)
- Hire your first employee. You stop doing the work and start managing.
- Add a second service line. Cross-sell to existing customers.
- Goal: $8-10K/mo recurring, work 20 hours/week

#### Stage 3: $100K → $1M (18-60 months)
- Systematize: SOPs, automated scheduling, software stack (CRM, invoicing)
- Scale marketing: Facebook ads, Google Local, referral program
- Goal: 80% gross margin, 20% net margin, business can run without you for 30 days

### Path C: Dropshipping / E-Commerce
- Low inventory risk — supplier ships directly to customer
- Platforms: Shopify, WooCommerce
- Need: finding a niche product + paid ads + good product page
- Warning: low margins (10-20%), high competition, returns eat profit
- Better as a side stream than a primary strategy

## Legal Structure Quick Reference

| Structure | Best For | Tax Treatment |
|---|---|---|
| **LLC** | Most small businesses | Pass-through (no corporate tax) |
| **S-Corp** | Profitable businesses ($60K+) | Salary + distribution (saves self-employment tax) |
| **C-Corp** | High-growth, seeking investment | Corporate tax + double tax on dividends |

> [SBA Small Business Planner](https://www.sba.gov/business-guide) — free, comprehensive, government-backed

## The $1 Math

| Revenue | Monthly Cash | Wealth Impact |
|---|---|---|
| $10K/yr | ~$800/mo | Side income, no lifestyle change |
| $50K/yr | ~$4K/mo | Replace a part-time job |
| $100K/yr | ~$8K/mo | Replace full-time median income |
| $500K/yr | ~$40K/mo | Financial independence territory |
| $1M/yr | ~$80K/mo | Wealth-building velocity`

  },
  {
    id: 'group_economics',
    title: 'Group Economics',
    subtitle: 'Together, we can afford what none of us could alone',
    gradient: 'from-emerald-500 to-amber-500',
    estimatedMinutes: 15,
    body: `## The Oldest Wealth System

Group economics is not a theory. It is how every immigrant community in America built wealth — and it is how Black communities did it too before systemic destruction of those systems.

> **Black Wall Street Wisdom:** In 1921, Tulsa's Greenwood district had 600 Black-owned businesses, 21 churches, 2 newspapers, a hospital, a bank, a school system, and a bus line — all funded by community pooled capital. It was destroyed, but **the model still works.**

## Historical Roots That Still Matter

### Susu / Sou Sou / Tanda / Hui
West African rotating credit system brought to the Americas through the transatlantic slave trade. A group of 10-20 people each contributes $X per week. Each week, one member gets the entire pool. No interest. No bank. Trust-based.

**Modern version:** An investment club where 12 members contribute $200/mo = $28,800/year invested as a group. Better access to deals, lower fees, shared research.

### Marcus Garvey's UNIA
The Universal Negro Improvement Association (1914) raised capital from Black shareholders to fund the Black Star Line — a Black-owned shipping company. It failed due to sabotage, not economics. **The principle was sound: pool capital from the community, invest in the community.**

**Modern version:** A crowdfunded real estate syndicate where 50 Black investors each put $5K to buy a $250K apartment building.

## Modern Group Economics Playbook

### 1. Investment Club
- 10-25 members, $100-500/mo each
- Legal structure: LLC or partnership
- Vote on investments quarterly
- Resources: [BetterInvesting (NAIC)](https://www.betterinvesting.org), [SEC investment club guide](https://www.sec.gov/reportspubs/investor-publications/investor-pubsinvclubhtm.html)

### 2. Real Estate Syndication
- Pool capital to buy larger properties
- Passive investors (limited partners) provide capital
- Active sponsor (general partner) finds and manages the deal
- Minimum: 5-10 investors at $25-50K+ each

### 3. Group Purchasing
- Collective buying for business supplies, healthcare, insurance
- Lower rates through volume
- Existing models: Black business associations, church-based buying groups

### 4. Crowdfunding & Syndication Platforms
- [Republic.co](https://republic.co) — invest in startups with $100+
- [Wefunder.com](https://wefunder.com) — community round investing
- [iFundWomen](https://ifundwomen.com) — specifically supports women of color founders
- [Official Black Wall Street](https://www.officialblackwallstreet.com) — Black business directory
- [Buy Black app](https://www.buyblack.app) — find Black-owned businesses near you

## The Compound Pool Effect

10 people × $500/mo × 12 months = $60,000/year.
Invested at 8% for 10 years = **$870,000.**

One person × $500/mo × 12 months = $6,000/year.
Invested at 8% for 10 years = **$87,000.**

**The group is 10x more efficient** because the pool unlocks larger, higher-return investments.

## Key Principle

Group economics does not mean everyone must agree on everything. It means **resources are combined, decisions are voted, profits are shared proportionally, and the community is strengthened.** Start with 3 trusted people. Prove the model. Scale.`
  }
];
```

- [ ] **Step 2: Create the completion hook**

```ts
// src/hooks/useChapterCompletion.ts
import { useState, useEffect } from 'react';

const STORAGE_KEY = 'wealth_chapters_completed';

export function useChapterCompletion() {
  const [completed, setCompleted] = useState<Set<string>>(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        try {
          setCompleted(new Set(JSON.parse(e.newValue || '[]')));
        } catch {
          setCompleted(new Set());
        }
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const isComplete = (id: string) => completed.has(id);

  const markComplete = (id: string) => {
    const next = new Set(completed);
    next.add(id);
    const arr = [...next];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    setCompleted(next);
  };

  const reset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setCompleted(new Set());
  };

  return { isComplete, markComplete, reset, completed: [...completed] };
}
```

- [ ] **Step 3: Create MarkCompleteButton**

```tsx
// src/components/wealth/MarkCompleteButton.tsx
interface Props {
  chapterId: string;
  isComplete: boolean;
  onToggle: (id: string) => void;
}

export function MarkCompleteButton({ chapterId, isComplete, onToggle }: Props) {
  return (
    <div className="flex justify-center pt-8 border-t border-slate-200 dark:border-slate-800 mt-8">
      <button
        onClick={() => onToggle(chapterId)}
        className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
          isComplete
            ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 cursor-default'
            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
        }`}
        aria-label={isComplete ? `${chapterId} chapter completed` : `Mark ${chapterId} chapter as complete`}
      >
        {isComplete ? (
          <>
            <span>✓</span>
            <span>Completed</span>
          </>
        ) : (
          <>
            <span>○</span>
            <span>Mark Complete</span>
          </>
        )}
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Create ChapterShell**

```tsx
// src/components/wealth/ChapterShell.tsx
import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Markdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { WealthChapter } from '../../data/wealthChapters';
import { useChapterCompletion } from '../../hooks/useChapterCompletion';
import { MarkCompleteButton } from './MarkCompleteButton';

interface Props {
  chapter: WealthChapter;
  tool: ReactNode;
}

export function ChapterShell({ chapter, tool }: Props) {
  const navigate = useNavigate();
  const { isComplete, markComplete } = useChapterCompletion();

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-2 animate-fade-in">
      <button
        onClick={() => navigate('/wealth-building')}
        className="flex items-center text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Wealth Building
      </button>

      <div className={`bg-gradient-to-r ${chapter.gradient} rounded-3xl p-8 text-white shadow-md`}>
        <h1 className="text-2xl font-black">{chapter.title}</h1>
        <p className="text-white/80 mt-2 text-sm max-w-2xl">{chapter.subtitle}</p>
        <span className="inline-block mt-3 text-[10px] font-bold uppercase tracking-wider text-white/60">
          ~{chapter.estimatedMinutes} min read
        </span>
      </div>

      <div className="prose prose-slate dark:prose-invert max-w-none">
        <Markdown
          remarkPlugins={[remarkMath]}
          rehypePlugins={[rehypeKatex]}
          components={{
            a: ({ href, children }) => (
              <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline underline-offset-2 hover:text-blue-800 dark:hover:text-blue-300">
                {children} ↗
              </a>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 pl-4 py-2 pr-4 my-4 rounded-r-lg text-sm text-slate-700 dark:text-slate-300">
                <span className="font-black text-[10px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block mb-1">Black Wall Street Wisdom</span>
                {children}
              </blockquote>
            ),
          }}
        >
          {chapter.body}
        </Markdown>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        {tool}
      </div>

      <MarkCompleteButton chapterId={chapter.id} isComplete={isComplete(chapter.id)} onToggle={markComplete} />
    </div>
  );
}
```

- [ ] **Step 5: Write tests for completion hook and MarkCompleteButton**

```tsx
// src/components/wealth/wealth.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MarkCompleteButton } from './MarkCompleteButton';

describe('MarkCompleteButton', () => {
  it('shows mark complete when not complete', () => {
    render(<MarkCompleteButton chapterId="test" isComplete={false} onToggle={vi.fn()} />);
    expect(screen.getByText(/Mark Complete/i)).toBeInTheDocument();
  });

  it('shows completed when complete', () => {
    render(<MarkCompleteButton chapterId="test" isComplete={true} onToggle={vi.fn()} />);
    expect(screen.getByText(/Completed/i)).toBeInTheDocument();
  });

  it('calls onToggle with chapterId on click', () => {
    const onToggle = vi.fn();
    render(<MarkCompleteButton chapterId="credit" isComplete={false} onToggle={onToggle} />);
    fireEvent.click(screen.getByText(/Mark Complete/i));
    expect(onToggle).toHaveBeenCalledWith('credit');
  });
});

describe('useChapterCompletion', () => {
  beforeEach(() => localStorage.clear());

  it('initializes empty from localStorage', async () => {
    const { useChapterCompletion } = await import('../../hooks/useChapterCompletion');
    const { result } = renderHook(() => useChapterCompletion());
    expect(result.current.isComplete('credit')).toBe(false);
  });

  it('reads existing completion from localStorage', async () => {
    localStorage.setItem('wealth_chapters_completed', JSON.stringify(['credit']));
    const { useChapterCompletion } = await import('../../hooks/useChapterCompletion');
    const { result } = renderHook(() => useChapterCompletion());
    expect(result.current.isComplete('credit')).toBe(true);
  });

  it('writes completion to localStorage on markComplete', async () => {
    const { useChapterCompletion } = await import('../../hooks/useChapterCompletion');
    const { result } = renderHook(() => useChapterCompletion());
    result.current.markComplete('investing');
    expect(JSON.parse(localStorage.getItem('wealth_chapters_completed')!)).toContain('investing');
  });

  it('resets all completions', async () => {
    localStorage.setItem('wealth_chapters_completed', JSON.stringify(['credit', 'investing']));
    const { useChapterCompletion } = await import('../../hooks/useChapterCompletion');
    const { result } = renderHook(() => useChapterCompletion());
    result.current.reset();
    expect(localStorage.getItem('wealth_chapters_completed')).toBeNull();
  });
});
```

Note: add `import { renderHook } from '@testing-library/react';` at top.

- [ ] **Step 6: Run foundation tests**

Run: `npx vitest run src/components/wealth/wealth.test.tsx -v`
Expected: All tests pass

---

### Task 2: Build all 5 tools

**Files:**
- Create: `src/components/wealth/tools/CompoundGrowthVisualizer.tsx`
- Create: `src/components/wealth/tools/CreditActionPlan.tsx`
- Create: `src/components/wealth/tools/RealEstateAnalyzer.tsx`
- Create: `src/components/wealth/tools/BusinessViabilityCalculator.tsx`
- Create: `src/components/wealth/tools/GroupPoolCalculator.tsx`

- [ ] **Step 1: Create CompoundGrowthVisualizer (flagship)**

```tsx
// src/components/wealth/tools/CompoundGrowthVisualizer.tsx
import { useState } from 'react';
import { Sparkles } from 'lucide-react';

interface Props {
  compact?: boolean;
}

function calculateGrowth(starting: number, monthly: number, rate: number, years: number) {
  const monthlyRate = rate / 100 / 12;
  let total = starting;
  for (let m = 0; m < years * 12; m++) {
    total = total * (1 + monthlyRate) + monthly;
  }
  return Math.round(total);
}

const MILESTONES = [
  { value: 100, label: '$100' },
  { value: 1000, label: '$1,000' },
  { value: 10000, label: '$10,000' },
  { value: 100000, label: '$100,000' },
  { value: 1000000, label: '$1,000,000' },
];

export function CompoundGrowthVisualizer({ compact }: Props) {
  const [starting, setStarting] = useState(100);
  const [monthly, setMonthly] = useState(200);
  const [rate, setRate] = useState(8);
  const [years, setYears] = useState(30);

  const result = calculateGrowth(starting, monthly, rate, years);
  const milestone = [...MILESTONES].reverse().find(m => result >= m.value);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-amber-500" />
        <h3 className="font-black text-sm text-slate-900 dark:text-white">Compound Growth Visualizer</h3>
      </div>

      <div className={`grid ${compact ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'} gap-4`}>
        <div>
          <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Starting Amount</label>
          <input type="number" value={starting} onChange={e => setStarting(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold" min={0} />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Monthly Contribution</label>
          <input type="number" value={monthly} onChange={e => setMonthly(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold" min={0} />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Annual Return %</label>
          <input type="number" value={rate} onChange={e => setRate(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold" min={0} max={100} step={0.5} />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Years</label>
          <input type="number" value={years} onChange={e => setYears(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold" min={1} max={80} />
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-2xl p-6 text-center border border-blue-100 dark:border-blue-900/50">
        <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">Final Value</span>
        <div className="text-4xl font-black text-slate-900 dark:text-white mt-1">
          ${result.toLocaleString()}
        </div>
        {milestone && (
          <div className="inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-[10px] font-bold uppercase">
            <Sparkles className="w-3 h-3" />
            You reached {milestone.label}
          </div>
        )}
      </div>

      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 via-emerald-500 to-amber-500 rounded-full transition-all duration-500"
          style={{ width: `${Math.min(100, (result / 1000000) * 100)}%` }}
        />
      </div>
      <p className="text-[10px] text-slate-400 text-center">
        Progress bar shows how close you are to $1,000,000
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Create CreditActionPlan tool**

```tsx
// src/components/wealth/tools/CreditActionPlan.tsx
import { useState } from 'react';
import { CreditCard } from 'lucide-react';

export function CreditActionPlan() {
  const [currentScore, setCurrentScore] = useState(650);
  const [targetScore, setTargetScore] = useState(760);
  const [monthlyBudget, setMonthlyBudget] = useState(200);

  const gap = targetScore - currentScore;
  const months = gap > 0 ? Math.ceil((gap / 10) * 3) : 0;
  const utilTarget = Math.round((monthlyBudget / 5000) * 100);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <CreditCard className="w-5 h-5 text-blue-500" />
        <h3 className="font-black text-sm text-slate-900 dark:text-white">Credit Action Plan</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div>
          <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Current Score</label>
          <input type="number" value={currentScore} onChange={e => setCurrentScore(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold" min={300} max={850} />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Target Score</label>
          <input type="number" value={targetScore} onChange={e => setTargetScore(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold" min={300} max={850} />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Monthly Budget</label>
          <input type="number" value={monthlyBudget} onChange={e => setMonthlyBudget(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold" min={0} />
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-950/30 rounded-2xl p-5 border border-blue-100 dark:border-blue-900/50 space-y-2">
        <div className="flex justify-between">
          <span className="text-xs font-bold text-slate-500">Estimated time to target</span>
          <span className="text-lg font-black text-slate-900 dark:text-white">{months} months</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs font-bold text-slate-500">Target utilization</span>
          <span className="text-lg font-black text-slate-900 dark:text-white">{utilTarget}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs font-bold text-slate-500">Score gap to close</span>
          <span className="text-lg font-black text-slate-900 dark:text-white">{gap > 0 ? `+${gap}` : '✓ Target reached'}</span>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create RealEstateAnalyzer tool**

```tsx
// src/components/wealth/tools/RealEstateAnalyzer.tsx
import { useState } from 'react';
import { Building2 } from 'lucide-react';

export function RealEstateAnalyzer() {
  const [purchasePrice, setPurchasePrice] = useState(200000);
  const [rehab, setRehab] = useState(20000);
  const [rent, setRent] = useState(2000);
  const [vacancy, setVacancy] = useState(5);

  const totalInvestment = purchasePrice + rehab;
  const annualRent = rent * 12 * (1 - vacancy / 100);
  const expenses = annualRent * 0.35;
  const noi = annualRent - expenses;
  const capRate = totalInvestment > 0 ? (noi / totalInvestment) * 100 : 0;
  const cashFlow = (noi - purchasePrice * 0.07) / 12;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Building2 className="w-5 h-5 text-amber-500" />
        <h3 className="font-black text-sm text-slate-900 dark:text-white">Real Estate Analyzer</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Purchase Price</label>
          <input type="number" value={purchasePrice} onChange={e => setPurchasePrice(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold" min={0} step={5000} />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Rehab Cost</label>
          <input type="number" value={rehab} onChange={e => setRehab(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold" min={0} step={5000} />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Monthly Rent</label>
          <input type="number" value={rent} onChange={e => setRent(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold" min={0} step={100} />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Vacancy %</label>
          <input type="number" value={vacancy} onChange={e => setVacancy(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold" min={0} max={50} step={1} />
        </div>
      </div>

      <div className="bg-amber-50 dark:bg-amber-950/30 rounded-2xl p-5 border border-amber-100 dark:border-amber-900/50 space-y-2">
        <div className="flex justify-between">
          <span className="text-xs font-bold text-slate-500">Cap Rate</span>
          <span className="text-lg font-black text-slate-900 dark:text-white">{capRate.toFixed(1)}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs font-bold text-slate-500">Total Investment</span>
          <span className="text-lg font-black text-slate-900 dark:text-white">${totalInvestment.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs font-bold text-slate-500">Net Operating Income (Annual)</span>
          <span className="text-lg font-black text-slate-900 dark:text-white">${noi.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs font-bold text-slate-500">Monthly Cash Flow (Est.)</span>
          <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">${Math.round(cashFlow).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create BusinessViabilityCalculator tool**

```tsx
// src/components/wealth/tools/BusinessViabilityCalculator.tsx
import { useState } from 'react';
import { Briefcase } from 'lucide-react';

export function BusinessViabilityCalculator() {
  const [startup, setStartup] = useState(10000);
  const [revenue, setRevenue] = useState(5000);
  const [expenses, setExpenses] = useState(3500);
  const [cac, setCac] = useState(50);

  const monthlyProfit = revenue - expenses;
  const breakEven = monthlyProfit > 0 ? Math.ceil(startup / monthlyProfit) : Infinity;
  const yearOneRevenue = revenue * 12;
  const yearOneProfit = monthlyProfit * 12;
  const yearTwoRunRate = revenue * 24;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Briefcase className="w-5 h-5 text-purple-500" />
        <h3 className="font-black text-sm text-slate-900 dark:text-white">Business Viability Calculator</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Startup Cost</label>
          <input type="number" value={startup} onChange={e => setStartup(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold" min={0} step={1000} />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Monthly Revenue</label>
          <input type="number" value={revenue} onChange={e => setRevenue(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold" min={0} step={500} />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Monthly Expenses</label>
          <input type="number" value={expenses} onChange={e => setExpenses(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold" min={0} step={500} />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">CAC ($)</label>
          <input type="number" value={cac} onChange={e => setCac(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold" min={0} step={5} />
        </div>
      </div>

      <div className="bg-purple-50 dark:bg-purple-950/30 rounded-2xl p-5 border border-purple-100 dark:border-purple-900/50 space-y-2">
        <div className="flex justify-between">
          <span className="text-xs font-bold text-slate-500">Break-even</span>
          <span className="text-lg font-black text-slate-900 dark:text-white">
            {breakEven === Infinity ? 'Not reached' : `${breakEven} months`}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs font-bold text-slate-500">Year 1 Revenue</span>
          <span className="text-lg font-black text-slate-900 dark:text-white">${yearOneRevenue.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs font-bold text-slate-500">Year 1 Profit</span>
          <span className={`text-lg font-black ${yearOneProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            ${yearOneProfit.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs font-bold text-slate-500">24-Month Run Rate</span>
          <span className="text-lg font-black text-slate-900 dark:text-white">${yearTwoRunRate.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create GroupPoolCalculator tool**

```tsx
// src/components/wealth/tools/GroupPoolCalculator.tsx
import { useState } from 'react';
import { Users } from 'lucide-react';

export function GroupPoolCalculator() {
  const [members, setMembers] = useState(12);
  const [monthlyContribution, setMonthlyContribution] = useState(200);
  const [months, setMonths] = useState(12);
  const [returnRate, setReturnRate] = useState(8);

  const totalPrincipal = members * monthlyContribution * months;
  const monthlyRate = returnRate / 100 / 12;
  let futureValue = 0;
  for (let m = 0; m < months; m++) {
    futureValue = (futureValue + monthlyContribution * members) * (1 + monthlyRate);
  }
  const perMember = futureValue / members;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Users className="w-5 h-5 text-emerald-500" />
        <h3 className="font-black text-sm text-slate-900 dark:text-white">Group Pool Calculator</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Members</label>
          <input type="number" value={members} onChange={e => setMembers(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold" min={2} max={100} />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Monthly Contribution</label>
          <input type="number" value={monthlyContribution} onChange={e => setMonthlyContribution(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold" min={0} step={50} />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Months in Pool</label>
          <input type="number" value={months} onChange={e => setMonths(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold" min={1} max={120} />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Expected Return %</label>
          <input type="number" value={returnRate} onChange={e => setReturnRate(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold" min={0} max={30} step={0.5} />
        </div>
      </div>

      <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl p-5 border border-emerald-100 dark:border-emerald-900/50 space-y-2">
        <div className="flex justify-between">
          <span className="text-xs font-bold text-slate-500">Total Pool Value</span>
          <span className="text-lg font-black text-slate-900 dark:text-white">${Math.round(futureValue).toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs font-bold text-slate-500">Per Member Payout</span>
          <span className="text-lg font-black text-slate-900 dark:text-white">${Math.round(perMember).toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs font-bold text-slate-500">Total Principal Contributed</span>
          <span className="text-lg font-black text-slate-900 dark:text-white">${totalPrincipal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs font-bold text-slate-500">Return on Contribution</span>
          <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
            {totalPrincipal > 0 ? `+${Math.round(((futureValue - totalPrincipal) / totalPrincipal) * 100)}%` : '—'}
          </span>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Create tool tests**

```tsx
// add to src/components/wealth/wealth.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CompoundGrowthVisualizer } from './tools/CompoundGrowthVisualizer';
import { CreditActionPlan } from './tools/CreditActionPlan';
import { RealEstateAnalyzer } from './tools/RealEstateAnalyzer';
import { BusinessViabilityCalculator } from './tools/BusinessViabilityCalculator';
import { GroupPoolCalculator } from './tools/GroupPoolCalculator';

// Inside the existing describe('MarkCompleteButton') block, add a new describe for tools

describe('CompoundGrowthVisualizer', () => {
  it('renders with default values', () => {
    render(<CompoundGrowthVisualizer />);
    expect(screen.getByText(/Compound Growth Visualizer/i)).toBeInTheDocument();
    expect(screen.getByText(/\$[0-9,]+/)).toBeInTheDocument();
  });

  it('renders compact mode without crash', () => {
    render(<CompoundGrowthVisualizer compact />);
    expect(screen.getByText('$100')).toBeInTheDocument();
  });
});

describe('CreditActionPlan', () => {
  it('renders with default values', () => {
    render(<CreditActionPlan />);
    expect(screen.getByText(/Credit Action Plan/i)).toBeInTheDocument();
    expect(screen.getByText(/months/i)).toBeInTheDocument();
  });

  it('shows target reached when score already meets target', () => {
    render(<CreditActionPlan />);
    const input = screen.getByDisplayValue('650');
    fireEvent.change(input, { target: { value: '760' } });
    const target = screen.getByDisplayValue('760');
    fireEvent.change(target, { target: { value: '650' } });
    expect(screen.getByText(/Target reached/i)).toBeInTheDocument();
  });
});

describe('RealEstateAnalyzer', () => {
  it('renders with default values', () => {
    render(<RealEstateAnalyzer />);
    expect(screen.getByText(/Real Estate Analyzer/i)).toBeInTheDocument();
    expect(screen.getByText(/Cap Rate/i)).toBeInTheDocument();
  });
});

describe('BusinessViabilityCalculator', () => {
  it('renders with default values', () => {
    render(<BusinessViabilityCalculator />);
    expect(screen.getByText(/Business Viability/i)).toBeInTheDocument();
    expect(screen.getByText(/Break-even/i)).toBeInTheDocument();
  });
});

describe('GroupPoolCalculator', () => {
  it('renders with default values', () => {
    render(<GroupPoolCalculator />);
    expect(screen.getByText(/Group Pool/i)).toBeInTheDocument();
    expect(screen.getByText(/Per Member/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 7: Run all tool tests**

Run: `npx vitest run src/components/wealth/wealth.test.tsx -v`
Expected: All 10+ tests pass

---

### Task 3: 5 chapter components

**Files:**
- Create: `src/components/wealth/CreditMastery.tsx`
- Create: `src/components/wealth/InvestingIRAs.tsx`
- Create: `src/components/wealth/RealEstate.tsx`
- Create: `src/components/wealth/BusinessBuilding.tsx`
- Create: `src/components/wealth/GroupEconomics.tsx`

- [ ] **Step 1: Create all 5 chapter components** (each is 3 lines)

```tsx
// src/components/wealth/CreditMastery.tsx
import { ChapterShell } from './ChapterShell';
import { wealthChapters } from '../../data/wealthChapters';
import { CreditActionPlan } from './tools/CreditActionPlan';
export function CreditMastery() {
  return <ChapterShell chapter={wealthChapters.find(c => c.id === 'credit')!} tool={<CreditActionPlan />} />;
}
```

```tsx
// src/components/wealth/InvestingIRAs.tsx
import { ChapterShell } from './ChapterShell';
import { wealthChapters } from '../../data/wealthChapters';
import { CompoundGrowthVisualizer } from './tools/CompoundGrowthVisualizer';
export function InvestingIRAs() {
  return <ChapterShell chapter={wealthChapters.find(c => c.id === 'investing')!} tool={<CompoundGrowthVisualizer />} />;
}
```

```tsx
// src/components/wealth/RealEstate.tsx
import { ChapterShell } from './ChapterShell';
import { wealthChapters } from '../../data/wealthChapters';
import { RealEstateAnalyzer } from './tools/RealEstateAnalyzer';
export function RealEstate() {
  return <ChapterShell chapter={wealthChapters.find(c => c.id === 'real_estate')!} tool={<RealEstateAnalyzer />} />;
}
```

```tsx
// src/components/wealth/BusinessBuilding.tsx
import { ChapterShell } from './ChapterShell';
import { wealthChapters } from '../../data/wealthChapters';
import { BusinessViabilityCalculator } from './tools/BusinessViabilityCalculator';
export function BusinessBuilding() {
  return <ChapterShell chapter={wealthChapters.find(c => c.id === 'business')!} tool={<BusinessViabilityCalculator />} />;
}
```

```tsx
// src/components/wealth/GroupEconomics.tsx
import { ChapterShell } from './ChapterShell';
import { wealthChapters } from '../../data/wealthChapters';
import { GroupPoolCalculator } from './tools/GroupPoolCalculator';
export function GroupEconomics() {
  return <ChapterShell chapter={wealthChapters.find(c => c.id === 'group_economics')!} tool={<GroupPoolCalculator />} />;
}
```

- [ ] **Step 2: Verify each renders** — run the test suite and check no compile errors

Run: `npx tsc --noEmit --pretty false 2>&1 | Select-String -Pattern "wealth"` — should have 0 errors
Run: `npx vitest run --reporter=verbose 2>&1 | Select-String -Pattern "(FAIL|wealth)"` — should have 0 failures

---

### Task 4: Wealth Building hub page

**Files:**
- Create: `src/components/WealthBuilding.tsx`
- Modify: `src/components/wealth/wealth.test.tsx`

- [ ] **Step 1: Create hub page**

```tsx
// src/components/WealthBuilding.tsx
import { useNavigate } from 'react-router-dom';
import { wealthChapters } from '../data/wealthChapters';
import { useChapterCompletion } from '../hooks/useChapterCompletion';
import { CompoundGrowthVisualizer } from './wealth/tools/CompoundGrowthVisualizer';
import { TrendingUp, RotateCcw } from 'lucide-react';

export function WealthBuilding() {
  const navigate = useNavigate();
  const { isComplete, completed, reset } = useChapterCompletion();

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-2 animate-fade-in">
      {/* Hero */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-amber-500 text-white text-[10px] font-black uppercase tracking-wider">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Personal Wealth</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Wealth Building</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-2xl">
          From $1 to $1M — building credit, investing, real estate, business, and group economics on your terms.
        </p>
      </div>

      {/* Progress bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-500">Chapters Completed</span>
          <span className="text-sm font-black text-slate-900 dark:text-white">{completed.length} / {wealthChapters.length}</span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-amber-500 rounded-full transition-all duration-500"
            style={{ width: `${(completed.length / wealthChapters.length) * 100}%` }}
          />
        </div>
        <button
          onClick={reset}
          className="mt-3 flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
          aria-label="Reset all wealth building progress"
        >
          <RotateCcw className="w-3 h-3" />
          Reset Progress
        </button>
      </div>

      {/* Chapter cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {wealthChapters.map(chapter => {
          const done = isComplete(chapter.id);
          const Icon = TrendingUp;
          return (
            <button
              key={chapter.id}
              onClick={() => navigate(`/wealth-building/${chapter.id}`)}
              className={`text-left bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-xs hover:shadow-sm transition-all cursor-pointer group relative overflow-hidden ${
                done ? 'border-emerald-300 dark:border-emerald-800' : 'border-slate-200 dark:border-slate-800'
              }`}
              aria-label={`${chapter.title}${done ? ' (completed)' : ''}`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${chapter.gradient} rounded-xl flex items-center justify-center shrink-0 text-white shadow-sm group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <h3 className="font-black text-sm text-slate-900 dark:text-white">{chapter.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{chapter.subtitle}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-slate-400 font-bold">{chapter.estimatedMinutes} min</span>
                    {done && <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">✓ Complete</span>}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Compound growth preview */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <CompoundGrowthVisualizer compact />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Add hub tests**

```tsx
// add to src/components/wealth/wealth.test.tsx
import { WealthBuilding } from '../WealthBuilding';
import { MemoryRouter } from 'react-router-dom';

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  MemoryRouter: ({ children }: any) => <div>{children}</div>,
}));

describe('WealthBuilding', () => {
  it('renders all 5 chapter titles', () => {
    render(<WealthBuilding />);
    expect(screen.getByText('Credit Mastery')).toBeInTheDocument();
    expect(screen.getByText('Investing & IRAs')).toBeInTheDocument();
    expect(screen.getByText('Real Estate')).toBeInTheDocument();
    expect(screen.getByText('Business Building')).toBeInTheDocument();
    expect(screen.getByText('Group Economics')).toBeInTheDocument();
  });

  it('shows correct completion count', () => {
    localStorage.setItem('wealth_chapters_completed', JSON.stringify(['credit', 'investing']));
    render(<WealthBuilding />);
    expect(screen.getByText('2 / 5')).toBeInTheDocument();
  });
});
```

- [ ] **Step 4: Run hub tests**

Run: `npx vitest run src/components/wealth/wealth.test.tsx -v`
Expected: 15+ tests pass

---

### Task 5: Wire into App.tsx

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/App.test.tsx`

- [ ] **Step 1: Add view values and lazy imports to App.tsx**

Find the `activeView` type union near the top of App.tsx (around line 80):

```tsx
const [activeView, setActiveView] = useState<'dashboard' | 'knowledge' | 'builder' | 'profile' | 'game' | 'games' | 'donation' | 'architecture' | 'fintech_map' | 'business_builder' | 'glossary' | 'dots_article' | 'admin'>('dashboard');
```

Replace with:

```tsx
const [activeView, setActiveView] = useState<'dashboard' | 'knowledge' | 'builder' | 'profile' | 'game' | 'games' | 'donation' | 'architecture' | 'fintech_map' | 'business_builder' | 'glossary' | 'dots_article' | 'admin' | 'wealth_building' | 'wealth_credit' | 'wealth_investing' | 'wealth_real_estate' | 'wealth_business' | 'wealth_group_economics'>('dashboard');
```

Add lazy imports after the existing ones (~line 21):

```tsx
const WealthBuilding = lazy(() => import('./components/WealthBuilding').then(m => ({ default: m.WealthBuilding })));
const CreditMastery = lazy(() => import('./components/wealth/CreditMastery').then(m => ({ default: m.CreditMastery })));
const InvestingIRAs = lazy(() => import('./components/wealth/InvestingIRAs').then(m => ({ default: m.InvestingIRAs })));
const RealEstate = lazy(() => import('./components/wealth/RealEstate').then(m => ({ default: m.RealEstate })));
const BusinessBuilding = lazy(() => import('./components/wealth/BusinessBuilding').then(m => ({ default: m.BusinessBuilding })));
const GroupEconomics = lazy(() => import('./components/wealth/GroupEconomics').then(m => ({ default: m.GroupEconomics })));
```

Add to the `titles` record in the page-view effect (~line 99):

```tsx
wealth_building: 'Wealth Building',
wealth_credit: 'Wealth Building — Credit Mastery',
wealth_investing: 'Wealth Building — Investing & IRAs',
wealth_real_estate: 'Wealth Building — Real Estate',
wealth_business: 'Wealth Building — Business',
wealth_group_economics: 'Wealth Building — Group Economics',
```

Add route sync branches in the `useLocation` effect (~line 160, after the `else if (path === '/progress')` block):

```tsx
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
```

- [ ] **Step 2: Add sidebar button**

Find the Business Builder button in the sidebar (~line 970-995) and add after it, before the Fintech Starter Map button. Use the `TrendingUp` icon:

```tsx
{/* 7b. Wealth Building */}
<button
  onClick={() => {
    setActiveView('wealth_building');
    setActiveModuleId(null);
    setIsBuildingModule(false);
    setEditingModule(null);
    setActiveDirectGame(null);
    setIsMobileMenuOpen(false);
    navigate('/wealth-building');
  }}
  className={cn(
    "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer",
    activeView === 'wealth_building' || activeView === 'wealth_credit' || activeView === 'wealth_investing' || activeView === 'wealth_real_estate' || activeView === 'wealth_business' || activeView === 'wealth_group_economics'
      ? "bg-gradient-to-r from-emerald-500 to-amber-500 text-white shadow-sm"
      : "text-slate-600 dark:text-slate-450 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50"
  )}
>
  <div className="flex items-center gap-3">
    <TrendingUp className="w-4 h-4 text-emerald-500" />
    <span>Wealth Building</span>
  </div>
  <span className="text-[9px] bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-black px-1.5 py-0.5 rounded uppercase">
    Personal Wealth
  </span>
</button>
```

- [ ] **Step 3: Add render cases in the main content area**

Find the `Suspense/AnimatePresence` block and add 6 new `else if` branches for the wealth views (before the `activeModule` check). Place them alongside the existing view branches:

```tsx
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
```

Also add `TrendingUp` to the import from `lucide-react` at the top if it's not already there. Check — it's already imported on line 57: `TrendingUp`. Good.

- [ ] **Step 4: Add App.tsx tests**

Add to `src/App.test.tsx`:

```tsx
vi.mock('./components/WealthBuilding', () => ({ WealthBuilding: () => <div data-testid="wealth-mock">Wealth Building</div> }));
vi.mock('./components/wealth/CreditMastery', () => ({ CreditMastery: () => <div data-testid="wealth-credit-mock">Credit</div> }));
vi.mock('./components/wealth/InvestingIRAs', () => ({ InvestingIRAs: () => <div data-testid="wealth-investing-mock">Investing</div> }));
vi.mock('./components/wealth/RealEstate', () => ({ RealEstate: () => <div data-testid="wealth-realestate-mock">Real Estate</div> }));
vi.mock('./components/wealth/BusinessBuilding', () => ({ BusinessBuilding: () => <div data-testid="wealth-business-mock">Business</div> }));
vi.mock('./components/wealth/GroupEconomics', () => ({ GroupEconomics: () => <div data-testid="wealth-groupecon-mock">Group</div> }));
```

Add test cases inside the `describe('App', ...)` block:

```tsx
it('shows wealth building link in sidebar', async () => {
  await renderApp();
  const wealth = screen.getByText(/Wealth Building/i);
  expect(wealth).toBeInTheDocument();
});

it('navigates to wealth building hub', async () => {
  await renderApp();
  fireEvent.click(screen.getByText(/Wealth Building/i));
  await waitFor(() => expect(screen.getByTestId('wealth-mock')).toBeInTheDocument());
});
```

- [ ] **Step 5: Run full test suite**

Run: `npx vitest run --reporter=verbose 2>&1 | Select-String -Pattern "(FAIL|Tests|Test Files)"`
Expected: 0 failures

---

### Task 6: Regression and polish

- [ ] **Step 1: Run full suite with coverage**

Run: `npx vitest run --coverage`
Expected: 750+ tests pass, coverage report generated

- [ ] **Step 2: Verify all external links**

Manually check each URL in the markdown bodies:
- AnnualCreditReport.com, CFPB, SEC EDGAR, SBA, etc. — all should resolve

- [ ] **Step 3: Create test file for the wealth modules**

```tsx
// src/components/wealth/wealth.test.tsx (full file combining all above)
```
