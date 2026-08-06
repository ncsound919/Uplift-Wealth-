import { downloadAllStarterFiles, type BusinessContext } from './starterKit';
import { STATE_PORTALS } from './statePortals';

export interface PlanStats {
  legit: number;
  budget: number;
  revenue: number;
  grade: string;
  cpa: number;
  score: number;
}

/** Everything needed to assemble the complete plan document. Extends the
 *  StarterKit `BusinessContext` so the same context drives both downloads. */
export interface PlanContext extends BusinessContext {
  businessType: string;
  reachUsers: number;
  monthlyFee: number;
  txVolume: number;
  marketingChannel: string;
  brandStyle: string;
  stats: PlanStats;
}

const MONTHS = [
  'Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6',
  'Month 7', 'Month 8', 'Month 9', 'Month 10', 'Month 11', 'Month 12',
];

/** Structure-specific legal blueprint, mirroring the dossier's legal tab. */
function legalSection(ctx: PlanContext): string {
  const bizName = (ctx.businessName || 'Your Business').toUpperCase();
  if (ctx.structure === 'LLC') {
    return [
      `# LIMITED LIABILITY COMPANY OPERATING AGREEMENT OF: ${bizName} LLC`,
      '',
      '1. FORMATION: Organized in the State of ' + ctx.filingState + '.',
      '2. PRINCIPAL RESIDENCY OF FOUNDER: Sourced in ' + ctx.founderState + '.',
      '3. CHIEF OPERATING EXECUTIVE: ' + ctx.founderName + '.',
      '4. OPERATIONAL LANE: ' + ctx.finalLane + '.',
      '5. EQUITY & VESTING SCHEDULE: ' + ctx.equitySplit + '.',
      '6. TAX CLAUSE: Pass-through taxation structure default.',
      '7. COMPLIANCE OBLIGATION: Handled under virtual mailbox: ' + ctx.hqType + '.',
      '',
      `This document certifies that ${ctx.founderName} is registered as the sole/managing organizer of ${bizName} LLC. Keep this file in secure PDF directories.`,
    ].join('\n');
  }
  if (ctx.structure === 'C-Corp') {
    return [
      `# CORPORATE BYLAWS OF: ${bizName} CORPORATION`,
      '',
      '1. INCORPORATION: Formed under the Delaware General Corporation Law.',
      '2. REGISTERED OFFICE: Registered agent physical address in Delaware.',
      `3. FOUNDER & BOARD SEAT: ${ctx.founderName} (Residing in ${ctx.founderState}).`,
      '4. CAPITAL STOCK AUTHORIZED: 10,000,000 shares of common stock at $0.0001 par value.',
      '5. FOUNDER ALLOCATION: Sourced under vesting schedule: ' + ctx.equitySplit + '.',
      '6. STOCK PURCHASING SAFE note support: Activated under ' + ctx.fundingStrategy + '.',
      '',
      `These bylaws govern the internal administration of ${bizName} CORPORATION, an active Delaware high-growth tech enterprise.`,
    ].join('\n');
  }
  return [
    `# SOLO PROPRIETORSHIP CHARTER: ${bizName}`,
    '',
    '1. OPERATOR: ' + ctx.founderName + ' (Residing in ' + ctx.founderState + ').',
    '2. JURISDICTION: Registered locally in ' + ctx.founderState + '.',
    '3. OPERATIONAL FOCUS: ' + ctx.finalLane + '.',
    '4. LIABILITY WARNING: Operational risks apply directly to personal savings.',
    '',
    'Sole proprietorships do not require state-level franchise fees but lack asset shields against financial chargebacks.',
  ].join('\n');
}

/** Assembles the full Markdown plan document from builder state. */
export function buildPlanDocument(ctx: PlanContext): string {
  const bizName = ctx.businessName || 'Your Business';
  const bizUpper = bizName.toUpperCase();
  const portal = STATE_PORTALS[ctx.filingState];
  const tam = ctx.reachUsers * ctx.monthlyFee * 12 * 6.5;
  const fee = ctx.monthlyFee;
  const revenue = ctx.stats.revenue;
  const pipeline = MONTHS.map((m, i) => {
    const runRate = Math.round((revenue / 12) * (i + 1));
    return `| ${m} | $${runRate.toLocaleString()} |`;
  }).join('\n');

  return `# ${bizUpper} — COMPLETE BUSINESS PLAN
Generated ${new Date().toLocaleDateString()}

---

## 1. Executive Summary

**${bizName}** is a ${ctx.finalLane} business founded to serve **${ctx.selectedCohort}**, specifically addressing **${ctx.finalProblem}**. Based in ${ctx.founderState}, the venture is led by **${ctx.founderName}**. We run operations with ${ctx.selectedApis.length > 0 ? ctx.selectedApis.slice(0, 2).join(' & ') : 'everyday business tools'} and earn revenue through **${ctx.monetization}**.

- **Legal structure:** ${ctx.structure}
- **Registered in:** ${ctx.filingState}
- **Business address:** ${ctx.hqType}
- **Funding strategy:** ${ctx.fundingStrategy}
- **Equity / vesting:** ${ctx.equitySplit}
- **Marketing channel:** ${ctx.marketingChannel}

## 2. Market Opportunity

- **Target customers (beachhead):** ${ctx.reachUsers.toLocaleString()}
- **Estimated total addressable market (TAM):** $${tam.toLocaleString()}
- **Year-1 projected revenue:** $${revenue.toLocaleString()}

## 3. Pricing & Revenue

- **Model:** ${ctx.monetization}
- **Average price:** $${fee}/mo per customer (or per transaction)
- **Est. monthly transaction volume:** $${ctx.txVolume.toLocaleString()}

### 12-Month Revenue Pipeline (estimated run-rate)

| Month | Run-rate Revenue |
|---|---|
${pipeline}

## 4. Legal Blueprint

${legalSection(ctx)}

## 5. Action Steps to Launch

### Step 1 — File Your Certificate with the State

Submit your Operating Agreement / Articles on the official state corporations portal. Total fee: **$${portal ? portal.cost : 'varies'}**.
${portal ? `Portal: ${portal.name} (${portal.url})` : ''}

### Step 2 — Apply Free for Your EIN

Do NOT pay commercial registration portals $150 for an EIN. Secure it free in 5 minutes at https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online
Legal filer: **${bizUpper} ${ctx.structure === 'LLC' ? 'LLC' : ctx.structure === 'C-Corp' ? 'INC' : ''}**

### Step 3 — Open a Startup Bank Account

Traditional banks often freeze startup software platforms. Connect with startup-first banking hubs: Mercury (https://mercury.com) or Brex (https://brex.com).

## 6. Compliance Calendar

- **FinCEN BOI Report:** Required within 90 days of registration for new LLCs/Corps. File free at https://boiefiling.fincen.gov/ — penalties up to $500/day for missing it.
${ctx.businessType === 'fintech' ? '- **FinTech licensing:** Review money-transmitter licensing requirements with a specialist before moving customer funds.' : '- **Local licenses:** Your city/county may require a general business license; your industry may need extra permits (food handling, contractor license, seller permit). Check with your local city clerk.'}
- **State franchise tax:** ${portal ? portal.franchiseTax : 'Varies by state'} — ${ctx.filingState === 'Delaware' ? 'Due June 1st (LLCs) or March 1st (Corps) annually.' : ctx.filingState === 'Florida' ? 'Due May 1st annually ($400 penalty if late).' : 'Due on the anniversary of your filing date.'}

## 7. Tools & Growth Stack

- **Operations tools:** ${ctx.selectedApis.join(', ') || 'None selected'}
- **Customer acquisition:** ${ctx.marketingChannel}
- **Credits & grants:** Apply for AWS Activate or Stripe Atlas to secure up to $5,000 in free cloud credits and automated incorporation pipelines.

---

*Generated by the Overlay Wealth Business Builder. Pair this document with the accompanying Starter Kit files (pitch deck, investor email, cap table, financial model, EIN guide, FinCEN BOI guide, compliance checklist, tech stack, and user persona worksheet) for a complete launch kit.*
`;
}

/** Downloads the main plan document and all Starter Kit files. */
export function downloadCompletePlan(ctx: PlanContext) {
  const doc = buildPlanDocument(ctx);
  const filename = `${(ctx.businessName || 'business').toLowerCase().replace(/\s+/g, '-')}-complete-plan.md`;
  const blob = new Blob([doc], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  downloadAllStarterFiles(ctx);
}
