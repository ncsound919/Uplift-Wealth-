interface StarterFile {
  id: string;
  title: string;
  description: string;
  category: 'legal' | 'pitch' | 'finance' | 'compliance' | 'product';
  format: 'md' | 'txt' | 'csv' | 'json';
  content: string;
}

export interface BusinessContext {
  businessName: string;
  founderName: string;
  founderState: string;
  filingState: string;
  structure: 'LLC' | 'C-Corp' | 'Sole Prop';
  finalLane: string;
  selectedCohort: string;
  finalProblem: string;
  selectedApis: string[];
  monetization: string;
  equitySplit: string;
  fundingStrategy: string;
  hqType: string;
}

const buildTemplate = (tpl: string, ctx: BusinessContext): string => {
  return tpl.replace(/\{\{([^}]+?)\}\}/g, (_, expr) => {
    try {
      const trimmed = expr.trim();
      if (trimmed === 'ctx.businessName.toUpperCase()') return (ctx.businessName || 'Your Fintech').toUpperCase();
      if (trimmed === 'ctx.businessName || "Your Fintech"') return ctx.businessName || 'Your Fintech';
      if (trimmed === 'ctx.founderName') return ctx.founderName;
      if (trimmed === 'ctx.finalLane') return ctx.finalLane;
      if (trimmed === 'ctx.selectedCohort') return ctx.selectedCohort;
      if (trimmed === 'ctx.finalProblem') return ctx.finalProblem;
      if (trimmed === 'ctx.filingState') return ctx.filingState;
      if (trimmed === 'ctx.founderState') return ctx.founderState;
      if (trimmed === 'ctx.hqType') return ctx.hqType;
      if (trimmed === 'ctx.monetization') return ctx.monetization;
      if (trimmed === 'ctx.equitySplit') return ctx.equitySplit;
      if (trimmed === 'ctx.fundingStrategy') return ctx.fundingStrategy;
      if (trimmed === 'ctx.structure') return ctx.structure;

      const match = trimmed.match(/^ctx\.selectedApis\.length \? ctx\.selectedApis\.slice\(0, 2\)\.join\(' & '\) : '(.*)'$/);
      if (match) {
        return ctx.selectedApis.length ? ctx.selectedApis.slice(0, 2).join(' & ') : match[1];
      }

      const corpMatch = trimmed.match(/^ctx\.structure === 'C-Corp' \? '(.*)' : '(.*)'$/);
      if (corpMatch) {
        return ctx.structure === 'C-Corp' ? corpMatch[1] : corpMatch[2];
      }

      const structMatch = trimmed.match(/^ctx\.structure === 'LLC' \? '(.*)' : ctx\.structure === 'C-Corp' \? '(.*)' : '(.*)'$/);
      if (structMatch) {
        if (ctx.structure === 'LLC') return structMatch[1];
        if (ctx.structure === 'C-Corp') return structMatch[2];
        return structMatch[3];
      }

      const fillMatch = trimmed.match(/^\(ctx\.businessName \|\| 'Your Fintech'\)\.toUpperCase\(\)$/);
      if (fillMatch) return (ctx.businessName || 'Your Fintech').toUpperCase();

      return '';
    } catch {
      return '';
    }
  });
};

const PITCH_DECK_TEMPLATE = `# {{(ctx.businessName || 'Your Fintech').toUpperCase()}} — PITCH DECK

## Slide 1: Title
**{{ctx.businessName || 'Your Fintech'}}**
*Modern {{ctx.finalLane}} for {{ctx.selectedCohort}}*
Founder: {{ctx.founderName}} | Pre-Seed Stage

---

## Slide 2: The Problem
**{{ctx.selectedCohort}}** struggles with:
- {{ctx.finalProblem}}
- High fees, slow processing, lack of transparency
- No purpose-built infrastructure for their needs

**TAM:** {{ctx.selectedCohort}} market in the US alone

---

## Slide 3: The Solution
**{{ctx.businessName || 'Your Fintech'}}** is a {{ctx.finalLane}} platform that:
- Solves {{ctx.finalProblem}} directly
- Integrates via {{ctx.selectedApis.length ? ctx.selectedApis.slice(0, 2).join(' & ') : 'core banking APIs'}}
- Charges via {{ctx.monetization}}

---

## Slide 4: Why Now?
- Real-time payment rails (FedNow, RTP) now available
- BaaS providers (Sutton, Stride, Column) make infrastructure cheap
- CFPB & state AGs cracking down on legacy fintech biases
- Consumers demand embedded finance in every app

---

## Slide 5: Market Size
- **TAM:** All US financial services
- **SAM:** {{ctx.selectedCohort}} in the US
- **SOM:** First 100k users in {{ctx.filingState}} and adjacent states

---

## Slide 6: Product
- API-first architecture
- SOC 2 Type II compliant
- Bank-grade encryption (AES-256, TLS 1.3)
- Mobile SDK + web dashboard

---

## Slide 7: Business Model
**Monetization:** {{ctx.monetization}}
**Pricing tiers:**
- Starter: $0/mo (limited features)
- Pro: $49/mo (full features)
- Enterprise: Custom (white-label)

**Unit economics:** LTV $1,200 / CAC $180 = 6.7x ratio

---

## Slide 8: Traction
- 5,000 beta users
- $25,000 MRR (3 months in)
- 92% month-over-month retention
- Net Promoter Score: 68

---

## Slide 9: Competition
| | Us | Plaid | Stripe | Unit |
|---|---|---|---|---|
| Speed | ✅ | ❌ | ✅ | ❌ |
| Price | ✅ | ❌ | ❌ | ✅ |
| Compliance | ✅ | ✅ | ✅ | ❌ |
| Embedded | ✅ | ✅ | ❌ | ✅ |

---

## Slide 10: Team
- **{{ctx.founderName}}** — Founder/CEO
- Background: Fintech engineer at previous startup
- Built 2 prior products, raised $2M total

---

## Slide 11: The Ask
**Raising: $500K Pre-Seed**
- $200K engineering (2 engineers, 1 year)
- $150K compliance & legal
- $100K GTM (content, community, partnerships)
- $50K runway buffer

**18-month runway to Series A milestones**
`;

const EIN_APPLICATION_GUIDE = `# HOW TO APPLY FOR YOUR EIN (FREE, 5 MINUTES)

## What is an EIN?
Employer Identification Number (EIN) is a 9-digit number the IRS assigns to your business for tax purposes. It's FREE to obtain directly from the IRS.

## Step-by-Step
1. Go to: https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online
2. Click "Apply Online Now" (do NOT pay any third-party site $150 for this)
3. Select your entity type: {{ctx.structure}}
4. Enter legal name: {{(ctx.businessName || 'Your Fintech').toUpperCase()}} {{ctx.structure === 'LLC' ? 'LLC' : ctx.structure === 'C-Corp' ? 'INC' : ''}}
5. Provide responsible party: {{ctx.founderName}}
6. Reason: "Started new business"
7. Receive EIN immediately on screen — save/print

## After You Get Your EIN
- Open a business bank account (Mercury, Brex, Relay)
- File FinCEN BOI report within 90 days
- Apply for state/local business licenses
- Set up payroll (Gusto, Justworks) when hiring

## Common Mistakes
- ❌ Using a paid service like LegalZoom ($150+ for the same form)
- ❌ Applying with mismatched legal name
- ❌ Forgetting to update EIN if you change entity type
`;

const BOI_REPORTING_GUIDE = `# FinCEN BENEFICIAL OWNERSHIP INFORMATION (BOI) REPORT

## Who Must File?
All LLCs and Corporations formed in the US after January 1, 2024.

## Deadline
**Within 90 days** of formation for new entities in 2024+.
**Within 30 days** for entities formed in 2025+.

## Penalty for Not Filing
$500 per day, up to $10,000, plus criminal penalties.

## Required Information
1. **Company legal name:** {{(ctx.businessName || 'Your Fintech').toUpperCase()}} {{ctx.structure === 'LLC' ? 'LLC' : ctx.structure === 'C-Corp' ? 'INC' : ''}}
2. **Trade name (if different):** N/A
3. **Tax ID type:** EIN
4. **Tax ID number:** (your EIN)
5. **Jurisdiction of formation:** {{ctx.filingState}}
6. **Principal office address:** {{ctx.hqType}}
7. **Mailing address:** Same as principal

## Beneficial Owner Information (for each owner with 25%+ stake)
- Full legal name: {{ctx.founderName}}
- Date of birth
- Residential address
- ID document type + number (passport or driver's license)
- Image of the ID document

## How to File (FREE)
1. Go to: https://boiefiling.fincen.gov/
2. Click "File BOIR"
3. Create account with your email
4. Fill out the form
5. Upload ID images
6. Submit (you'll get a confirmation receipt)

## After Filing
- Save the confirmation PDF in your compliance folder
- Update your BOI within 30 days of any changes (ownership, address, etc.)
- Annual report is NOT required, but updates ARE
`;

const COMPLIANCE_CHECKLIST = `# 2026 STARTUP COMPLIANCE CHECKLIST

## Month 1: Foundation
- [ ] File Articles of Incorporation / Operating Agreement
- [ ] Apply for EIN (IRS.gov — free, 5 min)
- [ ] File FinCEN BOI Report (within 90 days)
- [ ] Open business bank account (Mercury/Brex/Relay)
- [ ] Get a virtual mailbox (Earth Class Mail, iPostal1)

## Month 2-3: Operations
- [ ] Register for state franchise tax
- [ ] Set up accounting (QuickBooks, Xero, or Wave)
- [ ] Apply for any required state licenses
- [ ] Set up payroll (Gusto/Justworks) if hiring
- [ ] Draft terms of service + privacy policy (Termly, iubenda)

## Month 4-6: Growth Prep
- [ ] Trademark search + file (USPTO.gov)
- [ ] Domain name registration + SSL
- [ ] SOC 2 Type I readiness assessment
- [ ] Cyber insurance (Coalition, At-Bay)
- [ ] D&O insurance (if board exists)

## Annual
- [ ] State franchise tax filing
- [ ] Federal tax return (1120 for C-Corp, 1065 for LLC)
- [ ] BOI updates within 30 days of any change
- [ ] Annual board meeting (C-Corp/S-Corp)
- [ ] Renew business licenses
- [ ] Review and renew insurance policies
`;

const FINANCIAL_PROJECTION_TEMPLATE = `# 36-MONTH FINANCIAL PROJECTION
# {{(ctx.businessName || 'Your Fintech').toUpperCase()}}

Month,Revenue,Costs,Headcount,MRR,Cumulative Cash
1,0,8000,2,0,-8000
2,1500,9500,2,1500,-16000
3,3500,11000,3,3500,-23500
4,6000,13500,3,6000,-31000
5,9000,15500,4,9000,-37500
6,13000,18000,4,13000,-42500
7,18000,21000,5,18000,-45500
8,24000,24000,5,24000,-45500
9,31000,27500,6,31000,-42000
10,39000,31000,6,39000,-34000
11,48000,34500,7,48000,-20500
12,58000,38000,7,58000,-500
13,69000,42000,8,69000,26500
14,81000,46000,8,81000,61500
15,94000,50500,9,94000,105000
16,108000,55000,9,108000,158000
17,123000,60000,10,123000,221000
18,139000,65000,10,139000,295000
19,156000,70500,11,156000,380500
20,174000,76000,11,174000,478500
21,193000,82000,12,193000,589500
22,213000,88000,12,213000,714500
23,234000,94500,13,234000,854000
24,256000,101000,13,256000,1009000
25,279000,108000,14,279000,1180000
26,303000,115000,14,303000,1368000
27,328000,122500,15,328000,1573500
28,354000,130000,15,354000,1797500
29,381000,138000,16,381000,2040500
30,409000,146000,16,409000,2303500
31,438000,154500,17,438000,2587000
32,468000,163000,17,468000,2892000
33,499000,172000,18,499000,3219000
34,531000,181000,18,531000,3569000
35,564000,190500,19,564000,3942500
36,598000,200000,19,598000,4340500
`;

const INVESTOR_EMAIL_TEMPLATE = `# INVESTOR OUTREACH EMAIL

## Subject: {{(ctx.businessName || 'Your Fintech')}} — pre-seed round intro

Hi {Investor Name},

{{ctx.founderName}} here — founder of {{ctx.businessName || 'Your Fintech'}}, a {{ctx.finalLane}} platform for {{ctx.selectedCohort}}.

**The problem:** {{ctx.finalProblem}}

**What we built:** We're using {{ctx.selectedApis.length ? ctx.selectedApis.slice(0, 2).join(' & ') : 'BaaS APIs'}} to deliver a purpose-built solution. Early traction: 5,000 beta users, $25K MRR, 92% MoM retention.

**Why now:** Real-time payment rails (FedNow) just went live, CFPB is cracking down on legacy fintech biases, and consumers are demanding embedded finance in every app.

**The ask:** Raising a $500K pre-seed to fund 18 months of runway to Series A milestones.

Would you have 20 minutes this week or next for a quick call? Happy to send a 1-pager in advance.

Best,
{{ctx.founderName}}
{{ctx.businessName || 'Your Fintech'}}
`;

const TECH_STACK_TEMPLATE = `# RECOMMENDED FINTECH TECH STACK

## Frontend
- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS
- **State:** Zustand
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts

## Backend
- **Runtime:** Node.js + TypeScript
- **Framework:** Express
- **Database:** PostgreSQL (production) or SQLite (MVP)
- **ORM:** Drizzle or Prisma
- **Auth:** Auth.js or Clerk

## Banking & Payments
- **BaaS Provider:** Column, Unit, or Synctera
- **Card Issuing:** Lithic or Stripe Issuing
- **KYC/KYB:** Persona, Alloy, or Veriff
- **ACH:** Plaid or Modern Treasury
- **Wire/RTP:** Modern Treasury

## Infrastructure
- **Hosting:** Vercel (frontend) + Fly.io or Railway (backend)
- **CDN:** Cloudflare
- **Monitoring:** Sentry + LogRocket
- **Email:** Resend or Postmark
- **Background Jobs:** Inngest or Trigger.dev

## Compliance
- **SOC 2:** Drata or Vanta
- **Pen Testing:** Cobalt or HackerOne
- **Privacy:** Termly or iubenda

## Estimated Monthly Cost (Year 1)
- Hosting: $200
- BaaS: $500 (low volume)
- KYC: $300 (500 verifications/mo)
- Monitoring: $100
- Email: $50
- **Total: ~$1,150/mo**
`;

const CAP_TABLE_TEMPLATE = `# {{(ctx.businessName || 'Your Fintech').toUpperCase()}} — INITIAL CAP TABLE

## Founders
| Name | Role | Shares | % | Vesting |
|------|------|--------|---|---------|
| {{ctx.founderName}} | CEO | 8,000,000 | 80% | 4yr / 1yr cliff |
| (Reserved) | Co-founder | 1,000,000 | 10% | TBD |
| (Reserved) | Advisor | 0 | 0% | TBD |

## Option Pool
| Pool | Shares | % |
|------|--------|---|
| Employee Stock Option Pool (ESOP) | 1,000,000 | 10% |

## Total Authorized
{{ctx.structure === 'C-Corp' ? '10,000,000 shares common at $0.0001 par value' : 'Membership units (LLC) or sole proprietorship'}}

## Funding Rounds (Projected)
| Round | Amount | Valuation | Lead Investor | Date |
|-------|--------|-----------|---------------|------|
| Pre-Seed | $500K | $3M | TBD | TBD |
| Seed | $3M | $15M | TBD | TBD |
| Series A | $12M | $60M | TBD | TBD |
`;

const USER_PERSONA_TEMPLATE = `# USER PERSONA WORKSHEET

## Primary Persona: {{ctx.selectedCohort}}

### Demographics
- **Age range:**
- **Income range:**
- **Location:**
- **Education:**
- **Tech savviness:**

### Goals
1. What are they trying to achieve?
2. What does success look like for them?
3. What are they measured on at work/home?

### Pain Points
1. What frustrates them daily?
2. What tools have they tried?
3. What's the cost of NOT solving this problem?

### Jobs to Be Done
- "When [situation], I want to [motivation], so I can [outcome]."

### Channels
- Where do they hang out online?
- What publications do they read?
- What events do they attend?

### Buying Behavior
- How do they research solutions?
- Who else is involved in the decision?
- What's their budget?
- How long is their evaluation cycle?

### Quotes
- "I wish there was a way to..."
- "The biggest pain for me is..."
- "I'd pay for something that..."
`;

export const STARTER_FILES: StarterFile[] = [
  {
    id: 'pitch-deck',
    title: 'Pitch Deck Template',
    description: '11-slide investor pitch deck (fill-in-the-blank)',
    category: 'pitch',
    format: 'md',
    content: PITCH_DECK_TEMPLATE,
  },
  {
    id: 'investor-email',
    title: 'Investor Cold Email',
    description: 'Personalized cold outreach template for VCs and angels',
    category: 'pitch',
    format: 'md',
    content: INVESTOR_EMAIL_TEMPLATE,
  },
  {
    id: 'cap-table',
    title: 'Cap Table Worksheet',
    description: 'Initial capitalization table with founder/ESOP splits',
    category: 'finance',
    format: 'md',
    content: CAP_TABLE_TEMPLATE,
  },
  {
    id: 'financial-projection',
    title: '36-Month Financial Model',
    description: 'CSV projection template (revenue, costs, headcount)',
    category: 'finance',
    format: 'csv',
    content: FINANCIAL_PROJECTION_TEMPLATE,
  },
  {
    id: 'ein-guide',
    title: 'EIN Application Guide',
    description: 'Step-by-step: apply for your EIN free in 5 minutes',
    category: 'legal',
    format: 'md',
    content: EIN_APPLICATION_GUIDE,
  },
  {
    id: 'boi-guide',
    title: 'FinCEN BOI Filing Guide',
    description: 'How to file your Beneficial Ownership report (free, mandatory)',
    category: 'compliance',
    format: 'md',
    content: BOI_REPORTING_GUIDE,
  },
  {
    id: 'compliance-checklist',
    title: '2026 Compliance Checklist',
    description: 'Month-by-month regulatory checklist for new startups',
    category: 'compliance',
    format: 'md',
    content: COMPLIANCE_CHECKLIST,
  },
  {
    id: 'tech-stack',
    title: 'Recommended Tech Stack',
    description: 'Production-grade fintech tech stack with cost estimates',
    category: 'product',
    format: 'md',
    content: TECH_STACK_TEMPLATE,
  },
  {
    id: 'user-persona',
    title: 'User Persona Worksheet',
    description: 'Define your ideal customer profile with jobs-to-be-done',
    category: 'product',
    format: 'md',
    content: USER_PERSONA_TEMPLATE,
  },
];

export function buildStarterFile(file: StarterFile, ctx: BusinessContext): string {
  return buildTemplate(file.content, ctx);
}

export function downloadStarterFile(file: StarterFile, ctx: BusinessContext) {
  const content = buildStarterFile(file, ctx);
  const filename = `${(ctx.businessName || 'fintech').toLowerCase().replace(/\s+/g, '-')}-${file.id}.${file.format}`;
  const mimeMap: Record<string, string> = {
    md: 'text/markdown',
    txt: 'text/plain',
    csv: 'text/csv',
    json: 'application/json',
  };
  const blob = new Blob([content], { type: mimeMap[file.format] || 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadAllStarterFiles(ctx: BusinessContext) {
  STARTER_FILES.forEach((file, i) => {
    setTimeout(() => downloadStarterFile(file, ctx), i * 10);
  });
}
