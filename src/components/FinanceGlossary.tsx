import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  BookOpen, 
  Bookmark, 
  BookmarkCheck, 
  Sparkles, 
  RotateCw, 
  Check, 
  X, 
  HelpCircle, 
  Filter, 
  GraduationCap, 
  Layers, 
  ArrowRight,
  Lightbulb,
  CheckCircle2,
  RefreshCw,
  Tag
} from 'lucide-react';
import { cn } from '../lib/utils';
import { getJSON, setJSON, storageKeys } from '../lib/storage';

export interface GlossaryTerm {
  id: string;
  term: string;
  category: 'Basics' | 'Foundations' | 'Banking & Rails' | 'Lending & Credit' | 'Markets & Wealth' | 'InsurTech' | 'Crypto & Web3' | 'Ethics & Compliance';
  definition: string;
  example: string;
  phaseLink?: number;
}

export const FINANCE_GLOSSARY_TERMS: GlossaryTerm[] = [
  // --- BASICS ---
  {
    id: 'g-money',
    term: 'Money',
    category: 'Basics',
    definition: 'A universally accepted medium of exchange used to purchase goods, services, and settle financial transactions or debts.',
    example: 'Paying a $5 bill to a cashier to buy a cup of coffee instead of trading bartered goods.',
    phaseLink: 1
  },
  {
    id: 'g-checking-account',
    term: 'Checking Account',
    category: 'Basics',
    definition: 'A transactional deposit account held at a bank or credit union that allows for frequent, daily deposits and withdrawals of funds.',
    example: 'Using a debit card linked directly to your checking account to pay for your weekly groceries.',
    phaseLink: 1
  },
  {
    id: 'g-savings-account',
    term: 'Savings Account',
    category: 'Basics',
    definition: 'An interest-bearing deposit account held at a financial institution that provides a safe place to build cash reserves while earning a return.',
    example: 'Depositing a portion of your monthly income into a savings account to establish a rainy-day fund.',
    phaseLink: 1
  },
  {
    id: 'g-interest-basic',
    term: 'Interest',
    category: 'Basics',
    definition: 'The fee charged by a lender for borrowing money, or the yield earned by a depositor for keeping funds in a bank.',
    example: 'Earning a 4% annual interest rate on your savings balance, or paying 15% interest on an unpaid credit card balance.',
    phaseLink: 1
  },
  {
    id: 'g-credit-card-basic',
    term: 'Credit Card',
    category: 'Basics',
    definition: 'A payment card that enables cardholders to borrow funds up to a pre-approved limit to pay for purchases, requiring future repayment.',
    example: 'Charging $100 for dining to a credit card and paying it in full at the end of the statement cycle to avoid interest fees.',
    phaseLink: 1
  },
  {
    id: 'g-debit-card-basic',
    term: 'Debit Card',
    category: 'Basics',
    definition: 'A plastic or digital card that deducts money directly and immediately from your checking account to settle purchases.',
    example: 'Withdrawing $50 cash from an ATM machine, which instantly reduces your personal checking balance.',
    phaseLink: 1
  },
  {
    id: 'g-budget-basic',
    term: 'Budget',
    category: 'Basics',
    definition: 'A structured plan tracking expected cash income against planned expenses over a specific period to manage spending and saving.',
    example: 'Creating a monthly budget allocating $300 for utilities, $400 for groceries, and $200 for savings.',
    phaseLink: 1
  },
  {
    id: 'g-income-basic',
    term: 'Income',
    category: 'Basics',
    definition: 'Money received or earned regularly by an individual or business in exchange for labor, services, products, or investments.',
    example: 'Earning a bi-weekly salary of $2,500 from your job.',
    phaseLink: 1
  },
  {
    id: 'g-expense-basic',
    term: 'Expense',
    category: 'Basics',
    definition: 'An outflow of money incurred to purchase goods, acquire assets, or pay recurring bills.',
    example: 'Paying a monthly rental payment of $1,500 is a recurring essential housing expense.',
    phaseLink: 1
  },
  {
    id: 'g-debt-basic',
    term: 'Debt',
    category: 'Basics',
    definition: 'An outstanding obligation or sum of money owed by a borrower to a creditor, typically scheduled for repayment with interest.',
    example: 'Borrowing $25,000 via a federal student loan to finance college tuition fees.',
    phaseLink: 1
  },
  {
    id: 'g-loan-basic',
    term: 'Loan',
    category: 'Basics',
    definition: 'A formal credit agreement where a lender provides capital to a borrower in exchange for structured principal and interest repayments.',
    example: 'Securing a 5-year auto loan to buy a vehicle, making fixed monthly payments of $350.',
    phaseLink: 1
  },
  {
    id: 'g-atm-basic',
    term: 'ATM (Automated Teller Machine)',
    category: 'Basics',
    definition: 'An electronic self-service banking terminal allowing customers to perform basic deposits, transfers, and cash withdrawals.',
    example: 'Inserting your debit card into an ATM to withdraw $40 cash on a weekend evening.',
    phaseLink: 1
  },
  {
    id: 'g-bank-statement-basic',
    term: 'Bank Statement',
    category: 'Basics',
    definition: 'A monthly summary document provided by a bank detailing all deposits, withdrawals, fees, and transactions within an account.',
    example: 'Downloading your online bank statement to audit and cross-reference your debit purchases from the last month.',
    phaseLink: 1
  },
  {
    id: 'g-overdraft-basic',
    term: 'Overdraft',
    category: 'Basics',
    definition: 'A negative balance in a checking account that occurs when a transaction exceeds the available funds, often resulting in fees.',
    example: 'Attempting to buy a $40 subscription with only $15 in checking, leading to an overdraft and a fee.',
    phaseLink: 1
  },
  {
    id: 'g-direct-deposit-basic',
    term: 'Direct Deposit',
    category: 'Basics',
    definition: 'An automated electronic transfer of payroll or other recurring payouts directly into an individual\'s bank account.',
    example: 'Having your bi-weekly paycheck automatically clear in your checking account on payday morning.',
    phaseLink: 1
  },
  {
    id: 'g-taxes-basic',
    term: 'Taxes',
    category: 'Basics',
    definition: 'Mandatory payments collected by government entities from individuals and corporations to fund public services and infrastructure.',
    example: 'Paying a 10% local sales tax on retail purchases, or paying federal income tax withheld from your payroll.',
    phaseLink: 1
  },
  {
    id: 'g-gross-income-basic',
    term: 'Gross Income',
    category: 'Basics',
    definition: 'An individual\'s or entity\'s total earnings before any taxes, voluntary deductions, or withholdings are subtracted.',
    example: 'Securing a job offer of $50,000 per year, which is your raw gross salary.',
    phaseLink: 1
  },
  {
    id: 'g-net-income-basic',
    term: 'Net Income (Take-Home Pay)',
    category: 'Basics',
    definition: 'The actual portion of earnings deposited into your account after all income taxes, FICA, and deductions are subtracted from gross pay.',
    example: 'A worker with a gross monthly pay of $4,000 receiving a net check of $3,100 after withholding.',
    phaseLink: 1
  },
  {
    id: 'g-inflation-basic',
    term: 'Inflation',
    category: 'Basics',
    definition: 'The systemic rise in prices of common goods and services over time, which reduces the purchasing power of a currency.',
    example: 'A movie ticket that cost $8 ten years ago costing $14 today due to cumulative inflation.',
    phaseLink: 1
  },
  {
    id: 'g-credit-history-basic',
    term: 'Credit History',
    category: 'Basics',
    definition: 'A historical record showing how a borrower manages credit card balances, loans, and debt payments over time.',
    example: 'Lenders reviewing your 5-year history of on-time credit payments before approving a new auto loan.',
    phaseLink: 1
  },
  {
    id: 'g-fico-score-basic',
    term: 'FICO Score',
    category: 'Basics',
    definition: 'A specialized 300-to-850 credit rating standard evaluating creditworthiness based on payment history and debt levels.',
    example: 'Achieving a FICO score of 790, which qualifies you for the lowest mortgage interest rates.',
    phaseLink: 1
  },
  {
    id: 'g-credit-bureau-basic',
    term: 'Credit Bureau',
    category: 'Basics',
    definition: 'An agency (such as Equifax, Experian, or TransUnion) that aggregates consumer credit records to generate credit reports.',
    example: 'A card issuer reporting your monthly payments to the three credit bureaus to build your file.',
    phaseLink: 1
  },
  {
    id: 'g-collateral-basic',
    term: 'Collateral',
    category: 'Basics',
    definition: 'A valuable asset pledged by a borrower to secure a loan, which the lender can seize if the borrower defaults.',
    example: 'Pledging your vehicle as collateral for a car title loan, which can be repossessed if payments stop.',
    phaseLink: 1
  },
  {
    id: 'g-apy-basic',
    term: 'APY (Annual Percentage Yield)',
    category: 'Basics',
    definition: 'The compound annual interest rate earned on savings, reflecting both the base rate and compounding frequency.',
    example: 'A savings account with a 5.00% interest rate compounding daily earning a higher APY of 5.13%.',
    phaseLink: 1
  },
  {
    id: 'g-apr-basic',
    term: 'APR (Annual Percentage Rate)',
    category: 'Basics',
    definition: 'The total cost of borrowing credit annually, combining the basic interest rate with any mandatory upfront lender fees.',
    example: 'A credit card charging a 24% APR on outstanding revolving balances calculated monthly.',
    phaseLink: 1
  },
  {
    id: 'g-fintech-basic',
    term: 'FinTech (Financial Technology)',
    category: 'Basics',
    definition: 'The integration of software, mobile apps, and cloud computing to automate, streamline, and improve banking and financial services.',
    example: 'Depositing a physical paper check using your phone camera instead of driving to a bank branch.',
    phaseLink: 1
  },
  {
    id: 'g-neobank-basic',
    term: 'Neobank (Challenger Bank)',
    category: 'Basics',
    definition: 'A digital-only financial platform that operates entirely online or through mobile apps without traditional physical branches.',
    example: 'Opening a checking account with a neobank that has no monthly maintenance fees.',
    phaseLink: 1
  },
  {
    id: 'g-mobile-wallet-basic',
    term: 'Mobile Wallet',
    category: 'Basics',
    definition: 'A digital app on smartphones or smartwatches that securely stores encrypted payment cards to facilitate contactless checkout.',
    example: 'Using Apple Pay or Google Wallet at a retail scanner to pay for items without pulling out cards.',
    phaseLink: 1
  },
  {
    id: 'g-api-basic',
    term: 'API (Application Programming Interface)',
    category: 'Basics',
    definition: 'A secure software bridge allowing different financial platforms to connect and exchange data instantly.',
    example: 'A personal finance app using a secure API to sync your current bank ledger balances.',
    phaseLink: 1
  },
  {
    id: 'g-p2p-basic',
    term: 'Peer-to-Peer (P2P) Payment',
    category: 'Basics',
    definition: 'A digital system enabling individuals to transfer funds instantly from their bank account to another person\'s mobile app.',
    example: 'Using Venmo, Cash App, or Zelle to send $15 to a friend to pay for lunch.',
    phaseLink: 1
  },
  {
    id: 'g-ecommerce-basic',
    term: 'E-Commerce',
    category: 'Basics',
    definition: 'The buying and selling of physical goods, digital assets, or services directly over the internet.',
    example: 'Shopping on an online store and checking out with a saved debit card.',
    phaseLink: 1
  },
  {
    id: 'g-phishing-basic',
    term: 'Phishing',
    category: 'Basics',
    definition: 'A deceptive cyber-fraud technique where attackers pose as legitimate banks to steal sensitive passwords or account credentials.',
    example: 'Receiving an email spoofing Chase Bank that asks you to log in to resolve a fake security alert.',
    phaseLink: 1
  },

  // --- FOUNDATIONS ---
  {
    id: 'g-apr-vs-apy',
    term: 'APR vs. APY',
    category: 'Foundations',
    definition: 'APR (Annual Percentage Rate) reflects the basic cost of borrowing without compounding. APY (Annual Percentage Yield) includes compounding frequency to show the total annual yield earned on savings or owed on loans.',
    example: 'A savings account with 5.00% APR compounding monthly yields an APY of 5.12% per year.',
    phaseLink: 1
  },
  {
    id: 'g-credit-score',
    term: 'Credit Score (FICO)',
    category: 'Foundations',
    definition: 'A 300 to 850 numerical rating derived from credit history evaluating a consumer\'s creditworthiness, payment reliability, and debt burden.',
    example: 'A FICO score of 750+ qualifies borrowers for prime mortgage rates, whereas scores under 620 face subprime rates.',
    phaseLink: 1
  },
  {
    id: 'g-emergency-fund',
    term: 'Emergency Fund',
    category: 'Foundations',
    definition: 'A highly liquid cash reserve (typically 3 to 6 months of essential living expenses) set aside in a high-yield savings account to protect against unexpected job loss or medical expenses.',
    example: 'Saving $15,000 in a high-yield savings account to cover 6 months of housing and food costs.',
    phaseLink: 1
  },
  {
    id: 'g-dti-ratio',
    term: 'Debt-to-Income Ratio (DTI)',
    category: 'Foundations',
    definition: 'The percentage of gross monthly income spent on recurring debt payments (credit cards, loans, housing). Mortgage underwriters typically prefer DTIs below 36% to 43%.',
    example: 'If gross monthly income is $5,000 and total debt payments are $1,500, the DTI ratio is 30%.',
    phaseLink: 1
  },
  {
    id: 'g-net-worth',
    term: 'Net Worth',
    category: 'Foundations',
    definition: 'The total value of all financial and physical assets owned minus total outstanding liabilities and debts.',
    example: 'Owning $150,000 in home equity, retirement accounts, and cash, minus $30,000 in student loans, yields a net worth of $120,000.',
    phaseLink: 1
  },
  {
    id: 'g-principal-vs-interest',
    term: 'Principal vs. Interest',
    category: 'Foundations',
    definition: 'Principal is the original sum of money borrowed or invested. Interest is the fee charged by a lender or earned by an investor on top of the principal.',
    example: 'On a $200,000 mortgage payment of $1,200, $300 reduces the principal balance and $900 pays accrued interest.',
    phaseLink: 1
  },
  {
    id: 'g-liquidity',
    term: 'Liquidity',
    category: 'Foundations',
    definition: 'The speed and ease with which an asset can be converted into spendable cash without suffering a significant loss in market value.',
    example: 'Cash in a checking account is 100% liquid; commercial real estate is illiquid because selling takes months.',
    phaseLink: 1
  },
  {
    id: 'g-fdic-insurance',
    term: 'FDIC Deposit Insurance',
    category: 'Foundations',
    definition: 'Federal insurance provided by the FDIC protecting bank deposits up to $250,000 per depositor, per insured bank, against bank insolvency.',
    example: 'If an FDIC-member bank fails, the government guarantees reimbursement for depositor balances up to $250,000.',
    phaseLink: 1
  },
  {
    id: 'g-budgeting-rule',
    term: '50/30/20 Budgeting Framework',
    category: 'Foundations',
    definition: 'A popular personal finance rule allocating 50% of net income to Needs (rent, food), 30% to Wants (entertainment), and 20% to Savings & Debt Repayment.',
    example: 'With a $4,000 take-home paycheck: $2,000 goes to rent/groceries, $1,200 to personal desires, and $800 to high-yield savings.',
    phaseLink: 1
  },
  {
    id: 'g-index-fund',
    term: 'Index Fund / ETF',
    category: 'Foundations',
    definition: 'A low-cost pooled investment vehicle designed to match or track the performance of a financial market index (e.g., S&P 500), offering broad diversification.',
    example: 'Investing in an S&P 500 ETF provides instant ownership across 500 of the largest U.S. publicly traded corporations.',
    phaseLink: 1
  },
  {
    id: 'g-assets-vs-liabilities',
    term: 'Assets vs. Liabilities',
    category: 'Foundations',
    definition: 'Assets are resources owned that hold economic value or produce positive cash flow. Liabilities are financial obligations or debts owed to others.',
    example: 'Stocks, cash reserves, and income property are assets; credit card debt and auto loans are liabilities.',
    phaseLink: 1
  },
  {
    id: 'g-amortization',
    term: 'Amortization Schedule',
    category: 'Foundations',
    definition: 'A table detailing periodic loan payments over time, breaking down how each payment is split between principal reduction and interest charges.',
    example: 'Early mortgage payments consist mostly of interest, while later payments amortize mostly principal.',
    phaseLink: 1
  },
  {
    id: 'g-dividends',
    term: 'Stock Dividends',
    category: 'Foundations',
    definition: 'A distribution of a portion of a profitable corporation\'s earnings directly to shareholders on a per-share basis.',
    example: 'Receiving $0.50 per share quarterly on 100 shares yields $200 in annual dividend income.',
    phaseLink: 1
  },
  {
    id: 'g-escrow',
    term: 'Escrow Account',
    category: 'Foundations',
    definition: 'A neutral third-party account holding funds during a transaction until specific legal or contractual conditions (e.g., property taxes, insurance) are met.',
    example: 'A mortgage servicer collecting monthly escrow payments to pay home insurance premiums and property taxes on your behalf.',
    phaseLink: 1
  },
  {
    id: 'g-barter',
    term: 'Barter Economy',
    category: 'Foundations',
    definition: 'A system of exchange where goods or services are directly traded for other goods or services without using money as a medium.',
    example: 'A farmer trading 3 bushels of wheat to a shoemaker in exchange for 1 pair of leather boots.',
    phaseLink: 1
  },
  {
    id: 'g-fiat',
    term: 'Fiat Money',
    category: 'Foundations',
    definition: 'Currency established as legal tender by government decree that is not backed by a physical commodity like gold or silver.',
    example: 'The U.S. Dollar (USD), Euro (EUR), or Japanese Yen (JPY).',
    phaseLink: 1
  },
  {
    id: 'g-commodity-money',
    term: 'Commodity Money',
    category: 'Foundations',
    definition: 'Money whose value comes from a physical commodity of which it is made.',
    example: 'Gold coins, silver ingots, or salt blocks used as currency in historic trade routes.',
    phaseLink: 1
  },
  {
    id: 'g-interest-rate',
    term: 'Interest Rate (APR)',
    category: 'Foundations',
    definition: 'The cost of borrowing money expressed as a percentage of the principal loan amount per year.',
    example: 'A 6% APR mortgage means you pay $6,000 annually in interest for every $100,000 borrowed.',
    phaseLink: 1
  },
  {
    id: 'g-compound-interest',
    term: 'Compound Interest',
    category: 'Foundations',
    definition: 'Interest calculated on the initial principal plus all accumulated interest from previous periods ("interest on interest").',
    example: 'A $1,000 deposit at 10% annual compound interest grows to $1,100 after Year 1, and $1,210 after Year 2.',
    phaseLink: 1
  },
  {
    id: 'g-federal-reserve',
    term: 'Federal Reserve (The Fed)',
    category: 'Foundations',
    definition: 'The central bank of the United States, responsible for conducting national monetary policy and overseeing banking stability.',
    example: 'The Fed raising benchmark interest rates to cool down high inflation.',
    phaseLink: 1
  },
  {
    id: 'g-inflation',
    term: 'Inflation & CPI',
    category: 'Foundations',
    definition: 'The rate at which the general level of prices for goods and services rises, eroding purchasing power over time. Tracked by the Consumer Price Index (CPI).',
    example: 'When annual inflation is 3%, a basket of groceries that cost $100 last year costs $103 today.',
    phaseLink: 1
  },
  {
    id: 'g-stock',
    term: 'Stock (Equity Share)',
    category: 'Foundations',
    definition: 'A security that represents fractional ownership in a corporation.',
    example: 'Buying 10 shares of Apple stock gives you fractional ownership in Apple Inc. assets and earnings.',
    phaseLink: 1
  },
  {
    id: 'g-ipo',
    term: 'Initial Public Offering (IPO)',
    category: 'Foundations',
    definition: 'The process of offering shares of a private corporation to the public in a new stock issuance on the primary market.',
    example: 'Airbnb going public in 2020 by issuing new shares to raise expansion capital.',
    phaseLink: 1
  },
  {
    id: 'g-time-value-money',
    term: 'Time Value of Money (TVM)',
    category: 'Foundations',
    definition: 'The core financial principle that money available now is worth more than the identical sum in the future due to its earning capacity.',
    example: '$100 today invested at 5% interest is worth $105 next year, making $100 today preferable to receiving $100 a year from now.',
    phaseLink: 1
  },

  // --- BANKING & RAILS ---
  {
    id: 'g-core-ledger',
    term: 'Core Banking Ledger',
    category: 'Banking & Rails',
    definition: 'The central database of record maintained by a bank that tracks customer deposits, debits, credits, and account balance histories.',
    example: 'A cloud-native core system like Mambu updating an account balance in sub-milliseconds.',
    phaseLink: 2
  },
  {
    id: 'g-cobol',
    term: 'COBOL System',
    category: 'Banking & Rails',
    definition: 'An older programming language created in 1959 that is still used today by major banks to run their core systems and process transaction updates overnight.',
    example: 'Nightly processing scripts executing on legacy bank systems to update everyone\'s balances at midnight.',
    phaseLink: 2
  },
  {
    id: 'g-ach',
    term: 'ACH (Automated Clearing House)',
    category: 'Banking & Rails',
    definition: 'A secure electronic network used in the US to move money from one bank account to another in batches, commonly used for payroll and bill pay.',
    example: 'Your employer automatically depositing your bi-weekly paycheck directly into your checking account.',
    phaseLink: 2
  },
  {
    id: 'g-fednow',
    term: 'FedNow Rail',
    category: 'Banking & Rails',
    definition: 'A 24/7 instant payment network launched by the U.S. Federal Reserve in 2023 that lets banks transfer funds to each other within seconds, any time of day.',
    example: 'Receiving an instant insurance payout directly into your checking account on a Sunday afternoon.',
    phaseLink: 2
  },
  {
    id: 'g-swift',
    term: 'SWIFT Network',
    category: 'Banking & Rails',
    definition: 'A global secure messaging network that banks use to send international money transfer instructions quickly and safely across borders.',
    example: 'A bank in Tokyo sending a SWIFT payment message to a bank in New York to finalize an international transaction.',
    phaseLink: 2
  },
  {
    id: 'g-interchange',
    term: 'Interchange Fee',
    category: 'Banking & Rails',
    definition: 'The percentage fee (usually 1.5% to 3%) that a business\'s bank pays to your card-issuing bank every time you buy something with a card.',
    example: 'A small interchange fee earned by Chase when a customer buys coffee using a Chase credit card.',
    phaseLink: 2
  },
  {
    id: 'g-merchant-category-code',
    term: 'Merchant Category Code (MCC)',
    category: 'Banking & Rails',
    definition: 'A 4-digit code assigned to businesses by credit card companies to classify what kind of products or services they sell (e.g., dining, travel).',
    example: 'MCC 5812 used by credit card issuers to automatically award 3x reward points on dining out.',
    phaseLink: 2
  },

  // --- LENDING & CREDIT ---
  {
    id: 'g-baas',
    term: 'Banking-as-a-Service (BaaS)',
    category: 'Lending & Credit',
    definition: 'A system where traditional, licensed banks allow modern tech apps to embed real banking services (like checking accounts and debit cards) directly into their apps.',
    example: 'Chime offering bank accounts powered behind the scenes by Stride Bank or The Bancorp Bank using secure code integrations.',
    phaseLink: 3
  },
  {
    id: 'g-cashflow-underwriting',
    term: 'Cashflow Underwriting',
    category: 'Lending & Credit',
    definition: 'A way of deciding to approve a borrower for a loan by looking at their real bank account deposits and cash history, instead of just checking their credit score.',
    example: 'Approving a student with no credit history for a loan because they show stable monthly income deposits.',
    phaseLink: 3
  },
  {
    id: 'g-thin-file',
    term: 'Thin-File Consumer',
    category: 'Lending & Credit',
    definition: 'A person who has very little or no credit history on file with the major credit bureaus, making them practically invisible to traditional lenders.',
    example: 'A young adult who has never owned a credit card or taken out a loan, meaning they do not have a FICO score yet.',
    phaseLink: 3
  },
  {
    id: 'g-dti',
    term: 'Debt-to-Income (DTI) Ratio',
    category: 'Lending & Credit',
    definition: 'The percentage of your gross monthly income that goes toward paying monthly debts (such as rent, credit cards, or student loans).',
    example: 'A borrower earning $5,000/month with $1,500 in total monthly debt payments has a 30% DTI ratio.',
    phaseLink: 3
  },
  {
    id: 'g-bnpl',
    term: 'Buy Now, Pay Later (BNPL)',
    category: 'Lending & Credit',
    definition: 'A point-of-sale payment option that lets you buy items immediately and pay them off in smaller, usually interest-free installments over a short period.',
    example: 'Splitting a $200 purchase into 4 interest-free payments of $50 made every two weeks via Klarna or Affirm.',
    phaseLink: 3
  },

  // --- MARKETS & WEALTH ---
  {
    id: 'g-market-order',
    term: 'Market Order',
    category: 'Markets & Wealth',
    definition: 'An order to buy or sell a stock or security immediately at the current best available market price.',
    example: 'Clicking "Buy Now" on Robinhood to purchase $100 of Tesla stock instantly.',
    phaseLink: 4
  },
  {
    id: 'g-limit-order',
    term: 'Limit Order',
    category: 'Markets & Wealth',
    definition: 'An order to buy or sell a stock or security only at a specific price (or better), protecting you from unexpected price shifts during the trade.',
    example: 'Setting an order to buy Apple stock only if the price drops to $180 per share or lower.',
    phaseLink: 4
  },
  {
    id: 'g-hft',
    term: 'High-Frequency Trading (HFT)',
    category: 'Markets & Wealth',
    definition: 'Ultra-fast, automated trading where supercomputers run algorithms to buy and sell thousands of stock shares in a fraction of a second.',
    example: 'Trading firms placing servers right next to stock exchange computers to capture tiny price differences before anyone else.',
    phaseLink: 4
  },
  {
    id: 'g-bid-ask-spread',
    term: 'Bid-Ask Spread',
    category: 'Markets & Wealth',
    definition: 'The difference between the highest price a buyer is willing to pay (the "bid") and the lowest price a seller is willing to accept (the "ask").',
    example: 'If a buyer offers $50.00 for a stock and a seller demands $50.05, the bid-ask spread is $0.05.',
    phaseLink: 4
  },
  {
    id: 'g-pfof',
    term: 'Payment for Order Flow (PFOF)',
    category: 'Markets & Wealth',
    definition: 'A small payment that a retail stock broker gets from major trading firms in exchange for sending customer orders to them to be filled.',
    example: 'A free trading app receiving tiny sub-penny rewards per share from a trading firm to route customer buy/sell orders through them.',
    phaseLink: 4
  },
  {
    id: 'g-robo-advisor',
    term: 'Robo-Advisor',
    category: 'Markets & Wealth',
    definition: 'An online service that uses computer algorithms to automatically manage and rebalance your investment portfolio based on your goals and risk comfort, without needing a human advisor.',
    example: 'Investing money into a service that automatically purchases a diversified set of ETFs and balances them over time.',
    phaseLink: 4
  },
  {
    id: 'g-etf',
    term: 'Exchange Traded Fund (ETF)',
    category: 'Markets & Wealth',
    definition: 'A basket of investments (like stocks or bonds) packaged together into a single fund that you can buy and sell on the stock market just like an individual stock.',
    example: 'An ETF that tracks the S&P 500, giving you fractional ownership of 500 major companies in a single transaction.',
    phaseLink: 4
  },

  // --- INSURTECH ---
  {
    id: 'g-parametric',
    term: 'Parametric Insurance',
    category: 'InsurTech',
    definition: 'A type of insurance that pays out a set, pre-agreed amount instantly when a verified data trigger occurs (like an earthquake or wind speed threshold), with no claims to file.',
    example: 'A farmer receiving an automatic $10,000 payout if satellite weather data confirms local rainfall was below 2 inches in July.',
    phaseLink: 5
  },
  {
    id: 'g-oracle',
    term: 'Data Oracle',
    category: 'InsurTech',
    definition: 'A secure software service that feeds real-world data (like weather, prices, or sports scores) from the physical world into digital smart contracts.',
    example: 'A crop insurance contract automatically checking an official government weather station feed to verify local rainfall levels.',
    phaseLink: 5
  },
  {
    id: 'g-telematics',
    term: 'Telematics Insurance',
    category: 'InsurTech',
    definition: 'Insurance coverage where your pricing or premiums are based on your real-time actions, tracked via phone sensors or device plug-ins.',
    example: 'A car insurance app giving you a 20% discount on your monthly premium for demonstrating safe driving habits.',
    phaseLink: 5
  },

  // --- CRYPTO & WEB3 ---
  {
    id: 'g-blockchain',
    term: 'Blockchain Ledger',
    category: 'Crypto & Web3',
    definition: 'A secure, digital database shared across a network of computers that records transactions in blocks linked together in chronological order, making the history unchangeable.',
    example: 'The Bitcoin network keeping a public, shared ledger of all transactions ever made, verified by computers worldwide.',
    phaseLink: 6
  },
  {
    id: 'g-smart-contract',
    term: 'Smart Contract',
    category: 'Crypto & Web3',
    definition: 'A digital program stored on a blockchain that automatically executes agreement rules (like sending money or transferring ownership) as soon as pre-set conditions are met, without needing a middleman.',
    example: 'A program automatically sending digital funds to a creator once their digital artwork ownership is transferred.',
    phaseLink: 6
  },
  {
    id: 'g-amm',
    term: 'Automated Market Maker (AMM)',
    category: 'Crypto & Web3',
    definition: 'A decentralized trading system that lets people swap different digital tokens directly with a pooled reserve backed by math, instead of needing to match individual buyers and sellers on an order book.',
    example: 'Uniswap letting a user instantly exchange ETH for USDC by trading directly with an automated smart pool.',
    phaseLink: 6
  },
  {
    id: 'g-stablecoin',
    term: 'Stablecoin',
    category: 'Crypto & Web3',
    definition: 'A cryptocurrency designed to have a stable price by pegging its value to a traditional asset, usually a physical currency like the U.S. Dollar.',
    example: 'USDC, which aims to stay at exactly $1.00 because each token is backed by real dollars held in secure reserve accounts.',
    phaseLink: 6
  },
  {
    id: 'g-cold-wallet',
    term: 'Cold Wallet (Hardware Wallet)',
    category: 'Crypto & Web3',
    definition: 'A physical device (like a USB drive) that stores your cryptocurrency passwords offline, keeping them safe from online hackers.',
    example: 'A Ledger or Trezor device that must be physically plugged into a computer to approve and authorize a transaction.',
    phaseLink: 6
  },
  {
    id: 'g-gas-fee',
    term: 'Gas Fee',
    category: 'Crypto & Web3',
    definition: 'A small processing fee paid in cryptocurrency to the computer operators who run and secure a blockchain network to complete your transaction.',
    example: 'Paying a tiny fraction of an Ether (ETH) coin to send a digital payment over the Ethereum network.',
    phaseLink: 6
  },

  // --- ETHICS & COMPLIANCE ---
  {
    id: 'g-kyc',
    term: 'KYC (Know Your Customer)',
    category: 'Ethics & Compliance',
    definition: 'Mandatory identity verification procedures banks and fintechs must perform to prevent fraud and identity theft.',
    example: 'Uploading your driver\'s license and selfie when opening a new neobank account.',
    phaseLink: 7
  },
  {
    id: 'g-aml',
    term: 'AML (Anti-Money Laundering)',
    category: 'Ethics & Compliance',
    definition: 'Legal frameworks and software monitoring rules designed to stop criminals from disguising illegally obtained funds as legitimate income.',
    example: 'Automated screening algorithms flagging rapid transfers just under $10,000 (structuring alerts).',
    phaseLink: 7
  },
  {
    id: 'g-cfpb',
    term: 'CFPB (Consumer Financial Protection Bureau)',
    category: 'Ethics & Compliance',
    definition: 'A U.S. federal agency created in 2010 to protect consumers from unfair, deceptive, or abusive practices by financial companies.',
    example: 'The CFPB fining a bank for illegally charging hidden overdraft fees without user consent.',
    phaseLink: 7
  },
  {
    id: 'g-mdi',
    term: 'Minority Depository Institution (MDI)',
    category: 'Ethics & Compliance',
    definition: 'FDIC-insured banks where 51%+ of voting stock is owned by minority individuals, dedicated to serving historically underbanked communities.',
    example: 'OneUnited Bank or Citizens Trust Bank providing targeted capital access and mortgages.',
    phaseLink: 7
  },
  {
    id: 'g-redlining',
    term: 'Redlining & Structural Discrimination',
    category: 'Ethics & Compliance',
    definition: 'The illegal historical practice of denying financial services, mortgages, or insurance to residents of specific neighborhoods based on race.',
    example: '1930s federal maps shading Black neighborhoods in red to systematically deny government-backed home loans.',
    phaseLink: 7
  }
];

export function FinanceGlossary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [mode, setMode] = useState<'dictionary' | 'flashcards'>('dictionary');
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Bookmarks state stored in localStorage
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    return getJSON<string[]>(storageKeys.glossaryBookmarks, []);
  });

  const categories = ['All', 'Bookmarks', 'Basics', 'Foundations', 'Banking & Rails', 'Lending & Credit', 'Markets & Wealth', 'InsurTech', 'Crypto & Web3', 'Ethics & Compliance'];

  const toggleBookmark = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const next = bookmarkedIds.includes(id) 
      ? bookmarkedIds.filter(item => item !== id)
      : [...bookmarkedIds, id];
    setBookmarkedIds(next);
    setJSON(storageKeys.glossaryBookmarks, next);
  };

  const filteredTerms = useMemo(() => {
    return FINANCE_GLOSSARY_TERMS.filter(item => {
      const matchesSearch = item.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.example.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchesSearch) return false;

      if (selectedCategory === 'All') return true;
      if (selectedCategory === 'Bookmarks') return bookmarkedIds.includes(item.id);
      return item.category === selectedCategory;
    });
  }, [searchQuery, selectedCategory, bookmarkedIds]);

  // Flashcards queue
  const flashcardQueue = useMemo(() => {
    return filteredTerms.length > 0 ? filteredTerms : FINANCE_GLOSSARY_TERMS;
  }, [filteredTerms]);

  const currentFlashcard = flashcardQueue[flashcardIndex % flashcardQueue.length];

  const handleNextFlashcard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setFlashcardIndex(prev => (prev + 1) % flashcardQueue.length);
    }, 150);
  };

  const handlePrevFlashcard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setFlashcardIndex(prev => (prev - 1 + flashcardQueue.length) % flashcardQueue.length);
    }, 150);
  };

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/40 rounded-3xl p-6 md:p-8 text-white shadow-md relative overflow-hidden space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-900/60 border border-indigo-700/50 text-indigo-300 text-xs font-black uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Phase 8 • Curriculum Mastery Hub</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight font-display">
              The Finance & FinTech Dictionary
            </h1>
            <p className="text-sm md:text-base text-slate-300 max-w-2xl font-medium">
              A comprehensive, easy-to-recall dictionary combining foundational financial terms with modern fintech & infrastructure concepts.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-950/80 p-1.5 rounded-2xl border border-indigo-900/50 shrink-0 self-start md:self-auto">
            <button
              onClick={() => setMode('dictionary')}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer",
                mode === 'dictionary'
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              )}
            >
              <BookOpen className="w-4 h-4" />
              <span>Dictionary</span>
            </button>
            <button
              onClick={() => {
                setMode('flashcards');
                setIsFlipped(false);
              }}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer",
                mode === 'flashcards'
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              )}
            >
              <RotateCw className="w-4 h-4" />
              <span>Flashcard Recall</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative pt-2">
          <Search className="w-5 h-5 absolute left-4 top-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search terms, definitions, or real-world examples (e.g. FedNow, Interchange, FICO, Blockchain)..."
            className="w-full bg-slate-950/90 border border-indigo-800/60 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-5 text-slate-400 hover:text-white text-xs uppercase font-bold"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer",
                selectedCategory === cat
                  ? "bg-white text-slate-900 border-white font-black shadow-xs"
                  : "bg-slate-900/60 text-slate-300 border-slate-800 hover:bg-slate-800"
              )}
            >
              {cat === 'Bookmarks' ? (
                <span className="flex items-center gap-1">
                  <Bookmark className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span>Bookmarks ({bookmarkedIds.length})</span>
                </span>
              ) : (
                cat
              )}
            </button>
          ))}
        </div>
      </div>

      {/* DICTIONARY VIEW */}
      {mode === 'dictionary' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Showing {filteredTerms.length} Terms
            </span>
            {bookmarkedIds.length > 0 && (
              <span className="text-xs text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                <Bookmark className="w-3.5 h-3.5 fill-current" />
                <span>{bookmarkedIds.length} Saved</span>
              </span>
            )}
          </div>

          {filteredTerms.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-4">
              <HelpCircle className="w-12 h-12 text-slate-400 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-800 dark:text-white">No Terms Found</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Try adjusting your search query or switching category filters.</p>
              </div>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTerms.map((item) => {
                const isSaved = bookmarkedIds.includes(item.id);
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:border-indigo-500/50 hover:shadow-[0_4px_24px_rgba(99,102,241,0.06)] dark:hover:shadow-[0_4px_24px_rgba(99,102,241,0.12)] transition-all flex flex-col justify-between space-y-4 group relative"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="inline-block px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 text-xs font-black uppercase tracking-wider mb-1">
                            {item.category}
                          </span>
                          <h3 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {item.term}
                          </h3>
                        </div>

                        <button
                          onClick={(e) => toggleBookmark(item.id, e)}
                          className={cn(
                            "p-2 rounded-xl border transition-all cursor-pointer",
                            isSaved
                              ? "bg-amber-50 dark:bg-amber-950/50 border-amber-300 text-amber-600 dark:text-amber-400"
                              : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                          )}
                          title={isSaved ? "Remove Bookmark" : "Save to Bookmarks"}
                        >
                          {isSaved ? <BookmarkCheck className="w-4 h-4 fill-current" /> : <Bookmark className="w-4 h-4" />}
                        </button>
                      </div>

                      <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                        {item.definition}
                      </p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-150 dark:border-slate-800 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                        <Lightbulb className="w-3.5 h-3.5" />
                        <span>Real-World Example</span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 italic font-medium">
                        "{item.example}"
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* FLASHCARD RECALL MODE VIEW */}
      {mode === 'flashcards' && currentFlashcard && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 px-2">
            <span>Flashcard {flashcardIndex + 1} of {flashcardQueue.length}</span>
            <span className="uppercase text-indigo-600 dark:text-indigo-400 font-black">{currentFlashcard.category}</span>
          </div>

          <div 
            onClick={() => setIsFlipped(!isFlipped)}
            className="cursor-pointer min-h-[320px] bg-white dark:bg-slate-900 border-2 border-indigo-200 dark:border-indigo-800/80 rounded-3xl p-8 shadow-md flex flex-col justify-between items-center text-center transition-all hover:border-indigo-500 relative select-none"
          >
            <div className="w-full flex items-center justify-between text-xs font-black uppercase tracking-widest text-slate-400">
              <span>{isFlipped ? 'Definition & Real-World Example' : 'Term Name'}</span>
              <span className="text-indigo-600 dark:text-indigo-400">Click Card to Flip</span>
            </div>

            <div className="my-auto space-y-4 max-w-md">
              {!isFlipped ? (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                    {currentFlashcard.category}
                  </span>
                  <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white font-display">
                    {currentFlashcard.term}
                  </h2>
                  <p className="text-xs text-slate-400 italic">Tap or click anywhere to test your recall definition</p>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  <p className="text-base md:text-lg font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                    {currentFlashcard.definition}
                  </p>
                  <div className="bg-indigo-50 dark:bg-indigo-950/60 p-4 rounded-2xl border border-indigo-200 dark:border-indigo-800 text-left space-y-1">
                    <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                      Real-World Application
                    </span>
                    <p className="text-xs text-indigo-900 dark:text-indigo-200 italic font-medium">
                      "{currentFlashcard.example}"
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              {isFlipped ? '✓ Memory Recall Checked' : 'Tap to Reveal Answer'}
            </div>
          </div>

          {/* Flashcard Controls */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={handlePrevFlashcard}
              className="px-6 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-black text-xs uppercase tracking-wider hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              ← Previous Term
            </button>

            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer"
            >
              Flip Card
            </button>

            <button
              onClick={handleNextFlashcard}
              className="px-6 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-black text-xs uppercase tracking-wider hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              Next Term →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
