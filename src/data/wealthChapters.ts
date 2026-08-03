import { CreditCard, LineChart, Home, Briefcase, Users, Zap, ShieldPlus, LucideIcon } from 'lucide-react';

export interface WealthChapter {
  id: 'credit' | 'investing' | 'real_estate' | 'business' | 'group_economics' | 'side_hustles' | 'emergency_fund';
  title: string;
  subtitle: string;
  gradient: string;
  icon: LucideIcon;
  body: string;
  estimatedMinutes: number;
}

export const wealthChapters: WealthChapter[] = [
  {
    id: 'credit',
    title: 'Credit Mastery',
    subtitle: 'Building the foundation for every wealth-building move',
    gradient: 'from-blue-600 to-indigo-600',
    icon: CreditCard,
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

- Get a DUNS number (Dun & Bradstreet) — free at dnb.com
- Open a business credit card (Amex Blue Business, Capital One Spark)
- Vendor credit: Net-30 accounts with Uline, Grainger, Quill
- Business credit uses your EIN, not your SSN — protects personal score`
  },
  {
    id: 'investing',
    title: 'Investing & IRAs',
    subtitle: 'Making your money work as hard as you do',
    gradient: 'from-emerald-600 to-teal-600',
    icon: LineChart,
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
    icon: Home,
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
    icon: Briefcase,
    estimatedMinutes: 25,
    body: `## The Wealth Multiplier

A job pays you for your time. A business pays you for **systems.** The goal is to build something that runs without you — a self-driving asset.

## Two Paths

### Path A: Buy an Existing Business
- BizBuySell.com — millions of listings
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
    icon: Users,
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
- Resources: BetterInvesting (NAIC), SEC investment club guide

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
- Republic.co — invest in startups with $100+
- Wefunder.com — community round investing
- iFundWomen — specifically supports women of color founders
- Official Black Wall Street — Black business directory
- Buy Black app — find Black-owned businesses near you

## The Compound Pool Effect

10 people × $500/mo × 12 months = $60,000/year.
Invested at 8% for 10 years = **$870,000.**

One person × $500/mo × 12 months = $6,000/year.
Invested at 8% for 10 years = **$87,000.**

**The group is 10x more efficient** because the pool unlocks larger, higher-return investments.

## Key Principle

Group economics does not mean everyone must agree on everything. It means **resources are combined, decisions are voted, profits are shared proportionally, and the community is strengthened.** Start with 3 trusted people. Prove the model. Scale.`
  },
  {
    id: 'side_hustles',
    title: 'Side Hustles & Gig Income',
    subtitle: 'Multiple streams, faster momentum — extra income that compounds',
    gradient: 'from-orange-500 to-red-500',
    icon: Zap,
    estimatedMinutes: 15,
    body: `## Why Hustle?

Your main job covers the bills. A hustle buys you **velocity** — extra cash to attack debt, fund an IRA, or bootstrap a business without touching your survival money. Even $500/mo of hustle income, invested for 20 years at 8%, becomes **$275,000.**

## The Four Hustle Categories

### 1. Service Hustles (Fastest to Start)
- **Pressure washing** — $150-400 per driveway. Equipment starts under $500.
- **Lawn care** — recurring monthly contracts = predictable income. $40-80 per cut.
- **Mobile car detailing** — you bring the supplies, clean at their driveway. $100-200 per car.
- **Cleaning** — residential/commercial cleaning is boring, steady, and in demand. $25-50/hr.

### 2. Digital Hustles (Highest Ceiling)
- **Freelance writing** — blogs, newsletters, landing pages. $50-500 per project.
- **Design** — Canva-level logos and social graphics for small businesses. $100-1,000 per project.
- **Development** — build sites, automations, and simple tools. $500-10,000 per project.
- **Virtual assistant** — schedule, inbox, bookkeeping support. $15-40/hr, remote.

### 3. Platform Gigs (Lowest Barrier)
- **DoorDash / Instacart / Grubhub** — start tonight, cash out weekly. But factor in gas, wear-and-tear, and 1099 taxes.
- **Uber / Lyft** — highest earning potential but also the highest hidden costs of any gig.
- **Best use:** bridge income while you build a higher-value hustle, not a forever plan.

### 4. Selling Products Online (Scale Leverage)
- Sell on Etsy, eBay, or a Shopify store.
- **Dropshipping warning:** suppliers take most of the margin. Expect **10-20% margins** before ad costs — most dropshipping stores lose money. Treat it as a learning lab, not a get-rich plan.
- Better: sell your own products (print-on-demand, digital downloads, niche goods) where you control 50%+ margin.

## Reinvest the Hustle Money

Hustle income is easy to leak. Route it before you spend it:

1. **Pay yourself first** — auto-transfer 50% of every gig payout to savings or investing.
2. **Fund a Roth IRA** — up to $7,000/year of tax-free growth (2026 limit). Hustle income is earned income — it qualifies.
3. **Seed a business** — put 20-30% into the tools, ads, and licenses that grow the hustle into a real company.
4. **Attack high-interest debt** — 20-29% credit card APR is a guaranteed return on paying it off.

## Avoid the Hustle Trap

- **Taxes:** Gig income is 1099 income. Set aside **25-35%** for taxes or April is brutal. Open a separate "tax jar" account.
- **Burnout:** Your hustle should fund your life, not consume it. Protect one rest day and cap hours. Quit when the hourly rate drops below your main job's.
- **Opportunity cost:** Not all hustles are equal. A $15/hr gig and a $50/hr skill-building hustle both take 10 hours — the skill compound. Choose hustles that teach you something.
- **Lifestyle creep:** Every dollar of hustle income that goes to a new subscription is a dollar that didn't build wealth. Keep your lifestyle flat for one year.

> **Black Wall Street Wisdom:** Greenwood entrepreneurs didn't wait for permission — they built barber shops, grocery stores, and banks to serve their own community first. Your hustle starts the same way: solve a problem for people you know, get paid, then reinvest.`
  },
  {
    id: 'emergency_fund',
    title: 'Cash Flow & Emergency Fund',
    subtitle: 'The financial shock absorber that keeps every other plan alive',
    gradient: 'from-sky-500 to-blue-600',
    icon: ShieldPlus,
    estimatedMinutes: 10,
    body: `## Why the Emergency Fund Comes First

Investing while carrying zero savings is like building a house on sand. The first surprise bill (car repair, medical, job loss) forces you to **sell investments early** or rack up 25% credit card debt — which erases years of gains. The emergency fund is the **foundation that makes every other wealth move safe.**

## The 3 / 6 / 12-Month Rule

| Situation | Target |
|---|---|
| **3 months** | Stable job, two-income household, low expenses |
| **6 months** | Single income, variable income, dependents, own a home |
| **12 months** | Self-employed, commission-based, or seasonal income |

Your number = **monthly expenses × target months.** If you spend $3,000/mo and want 6 months, you need $18,000 parked and untouched.

## Where the Money Lives: High-Yield Savings (HYSA)

- **HYSA** (e.g., Ally, Marcus, Capital One 360) — currently 3.5-5% APY vs. 0.01% at big banks. That's ~$500/year extra on $10K.
- **Must be liquid** — no CDs with early-withdrawal penalties, no stocks that can crash 40% when you need the cash.
- **FDIC insured** up to $250K — your money is safe and instantly accessible.

## Sinking Funds: Your Emergency Fund's Sibling

An emergency fund covers *surprises*. Sinking funds cover *expected* big costs so they never become emergencies:

- **Car** — $150/mo for repairs + registration
- **Medical** — $100/mo toward deductibles and copays
- **Holidays / back-to-school** — save monthly so December doesn't blow the budget

Separate accounts or sub-accounts for each. When the bill arrives, the money is already there.

## Automate It

- **Pay yourself first:** The moment a paycheck lands, auto-transfer your savings target before you can spend it. If you never see it, you never miss it.
- **Round-ups:** Apps that round purchases to the next dollar silently stack $50-100/mo.
- **Raises & windfalls:** Send 50% of every raise, bonus, and tax refund straight to the fund. Your lifestyle stays flat while the cushion grows.
- **Schedule it:** Set the transfer for the same day as payday — consistency beats willpower every time.

## When to Stop Saving and Start Investing

Once you hit your target months, **you are done saving for emergencies.** Stop dumping cash into a 4% HYSA and start deploying into the market where it can grow at 8-10%:

1. Full employer 401(k) match
2. Max the emergency fund (3-6-12 months)
3. Max the Roth IRA ($7,000/yr)
4. Max the 401(k)
5. Taxable brokerage

**One nuance:** if you change jobs, start a business, or add a dependent, re-run the numbers. The fund is not a one-time goal — it's a living number.

> **Black Wall Street Wisdom:** Greenwood's mutual aid societies collected small weekly dues from members and paid out for sickness, death, and hard times — a community emergency fund. Build yours the same way: small, consistent, automatic, and always there when it matters.`
  }
];
