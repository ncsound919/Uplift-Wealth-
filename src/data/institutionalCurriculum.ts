/**
 * Instructor-facing classroom materials for the institutional curriculum guide.
 * Each module gets a teaching direction, a student worksheet activity, and
 * reinforcing references. Rendered by InstitutionalCurriculum.tsx.
 */

export interface ModuleClassroom {
  moduleId: string;
  instructorDirection: string;
  worksheet: string;
  references: string[];
}

export const classroomMaterials: Record<string, ModuleClassroom> = {
  'module-0': {
    moduleId: 'module-0',
    instructorDirection: 'Open by asking students what "money" means to them and why financial knowledge matters in their community. Frame money as a tool, not a grade. End by having each student state one money goal for the course.',
    worksheet: 'Write a one-paragraph definition of money in your own words. List three ways money shows up in your daily life. Set one 90-day money goal you will revisit at the end of the course.',
    references: [
      'CFPB: Financial Literacy Resources — consumerfinance.gov/consumer-tools',
      '"The Wealth Choice" by Dennis Kimbro — habits of successful Black entrepreneurs and investors',
    ],
  },
  'module-1': {
    moduleId: 'module-1',
    instructorDirection: 'Use the Bank Ledger simulator to show how deposits and withdrawals change a balance. Connect the lesson to community banks and credit unions that reinvest locally, and mention the history of Black-owned banks.',
    worksheet: 'Trace one deposit of $100 through a bank ledger. Explain why a bank can lend money it does not fully hold. Research one Black-owned bank or credit union near you.',
    references: [
      'FDIC: How Banking Works — fdic.gov/consumers',
      'The Freedmans Savings Bank (1865) — history of Black banking in America',
    ],
  },
  'module-2': {
    moduleId: 'module-2',
    instructorDirection: 'Walk the full payment flow — card swipe, acquirer, issuer, settlement — using the Payment Rail simulator. Emphasize that every swipe costs merchants ~2-3%, which affects small-business owners.',
    worksheet: 'Draw the path of one tap-to-pay transaction from card to merchant bank. Estimate the interchange fee on a $50 purchase at 2.5%. List two ways a small business can lower payment costs.',
    references: [
      'CFPB: What is a payment? — consumerfinance.gov',
      'NerdWallet: How Credit Card Processing Works',
    ],
  },
  'module-3': {
    moduleId: 'module-3',
    instructorDirection: 'Use the BaaS Configurator to show how apps like Chime build on bank rails without owning a bank. Discuss minority depository institutions (MDIs) and how embedded banking can serve the underbanked.',
    worksheet: 'Explain the difference between a bank and a fintech app. List three features an app could offer using banking-as-a-service. Research one MDI and its mission.',
    references: [
      'FDIC: Minority Depository Institutions Program',
      'a16z / Stripe docs on Banking-as-a-Service basics',
    ],
  },
  'module-4': {
    moduleId: 'module-4',
    instructorDirection: 'Run the Underwriting Game to show how lenders score risk. Pair it with the historical reality of redlining and credit invisibility. Emphasize that a credit score is a price tag, not a moral grade.',
    worksheet: 'List the five FICO factors and their weights. Build a 12-month plan to raise a score from 620 to 700. Write one sentence on why credit history can exclude people and what fair lending means.',
    references: [
      'CFPB: How to build credit — consumerfinance.gov',
      'AnnualCreditReport.com — free weekly credit reports',
      'FTC: Redlining and Fair Lending history',
    ],
  },
  'module-5': {
    moduleId: 'module-5',
    instructorDirection: 'Use the Trading Simulator to teach that time in the market beats timing the market. Show the compound-interest math and the power of dollar-cost averaging. Keep risk conversations honest and calm.',
    worksheet: 'Compute what $200/month grows to at 8% over 30 years. Explain the difference between a stock and an index fund. Write one rule you would teach a friend about investing.',
    references: [
      'SEC: Investor.gov — Compound Interest Calculator',
      'Bogleheads: Three-fund portfolio guide',
      'Federal Reserve: History of the racial wealth gap',
    ],
  },
  'module-6': {
    moduleId: 'module-6',
    instructorDirection: 'Use the Parametric Insurance simulator to explain how insurance pools risk. Contrast traditional insurance with weather-indexed parametric policies and their value in underserved communities.',
    worksheet: 'Define deductible, premium, and payout. Compare a $500/year policy with a $2,000 deductible vs a $1,000 deductible. Explain how a parametric policy pays out when an index triggers.',
    references: [
      'NAIC: Insurance Basics — naic.org/consumers',
      'World Bank: Parametric insurance explained',
    ],
  },
  'module-7': {
    moduleId: 'module-7',
    instructorDirection: 'Teach crypto with balance: explain the technology (blockchain, keys, volatility) without hype or fear. Use the Trading Sandbox to practice. Warn about scams that target new crypto users.',
    worksheet: 'Explain a blockchain in two sentences. Describe the difference between a wallet address and a private key. List two risks of crypto and one rule for staying safe.',
    references: [
      'SEC: Crypto assets investor alerts — investor.gov',
      'CFPB: What to know before investing in crypto',
    ],
  },
  'module-8': {
    moduleId: 'module-8',
    instructorDirection: 'Use the Fraud Screener to role-play real scams — phishing, fake check, grandparent scam. Make it interactive: have students spot the fraud signals themselves.',
    worksheet: 'Identify three red flags in a sample phishing email. Write one rule to protect your accounts. Explain what to do if you believe you have been scammed (report to FTC and your bank).',
    references: [
      'FTC: How to recognize and avoid scams — consumer.ftc.gov',
      'CISA: Secure Your Accounts guidance',
    ],
  },
  'module-9': {
    moduleId: 'module-9',
    instructorDirection: 'Use the Fintech P&L Simulator to show how apps earn money — fees, subscriptions, interest, data. Discuss which models serve users well and which exploit them.',
    worksheet: 'List four ways a fintech app can make money. For each, say whether it is aligned or misaligned with the user. Design a fair pricing model for a small money app.',
    references: [
      'Khan Academy / CFI: Revenue Models in Fintech',
      'FDIC: Overdraft and fee disclosure guides',
    ],
  },
  'module-10': {
    moduleId: 'module-10',
    instructorDirection: 'Use the Compliance Maze to teach why financial rules exist — KYC/AML, consumer protections. Connect to state money-transmitter licenses and what it takes to launch a financial product legally.',
    worksheet: 'Define KYC and AML in your own words. Name one consumer-protection law and what it does. List two licenses a money app might need to operate.',
    references: [
      'FinCEN: Beneficial Ownership Information — boiefiling.fincen.gov',
      'CFPB: Consumer financial protection laws',
      'FFIEC: BSA/AML Examination Manual',
    ],
  },
  'module-11': {
    moduleId: 'module-11',
    instructorDirection: 'Use the Ledger Simulator to build intuition for double-entry accounting. Explain why every debit has a credit and why a balanced ledger is how businesses stay honest.',
    worksheet: 'Record a $50 sale and a $20 expense as journal entries with debits and credits. Explain what a balanced trial balance tells you. Build a simple 3-row ledger.',
    references: [
      'IRS: Small Business Recordkeeping — irs.gov',
      'AccountingCoach: Double-Entry Bookkeeping explained',
    ],
  },
  'module-12': {
    moduleId: 'module-12',
    instructorDirection: 'Use the Venture Pitch Simulator + Business Builder as the capstone. Guide students from idea to structured pitch — problem, customer, pricing, structure, launch steps. Celebrate every completed plan.',
    worksheet: 'Write a one-page venture plan: problem, target customer, how you make money, legal structure, first three launch steps. Draft a one-sentence pitch.',
    references: [
      'SBA: Business Plan Basics — sba.gov',
      'IRS: Choosing a Business Structure',
      'CFPB: Small business lending resources',
    ],
  },
  'module-13': {
    moduleId: 'module-13',
    instructorDirection: 'Teach AI in finance with a critical lens: credit scoring models, chatbots, fraud detection — and the bias risks. Ask students whether an AI denying a loan should be explainable.',
    worksheet: 'Give one example of AI used in finance. Explain a fairness risk of algorithmic lending. Argue for or against: "AI decisions should always be explainable."',
    references: [
      'CFPB: Fair Lending and AI — consumerfinance.gov',
      'Brookings: AI in financial services and bias',
    ],
  },
  'module-14': {
    moduleId: 'module-14',
    instructorDirection: 'Show how APIs let apps plug into banks (Plaid, Stripe). Connect embedded finance to financial inclusion — banking inside the apps people already use.',
    worksheet: 'Define an API in one sentence. Give two examples of embedded finance you have used. Explain how embedded finance can reach the underbanked.',
    references: [
      'Plaid / Stripe developer docs — API economy',
      'Federal Reserve: Fintech and inclusion research',
    ],
  },
  'module-15': {
    moduleId: 'module-15',
    instructorDirection: 'Close the course with open banking and data rights. Tie it to financial inclusion and student data ownership. Have students reflect on the full journey and their next step.',
    worksheet: 'Explain open banking in your own words. List two rights you have over your financial data. Write a short reflection: how has your view of money changed through this course?',
    references: [
      'CFPB: Open Banking Rule — consumerfinance.gov',
      'FDIC: National Survey of Unbanked and Underbanked Households',
    ],
  },
};
