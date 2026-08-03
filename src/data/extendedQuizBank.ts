export interface DiagramData {
  type: 'flow' | 'ledger' | 'code' | 'scorecard' | 'comparison' | 'formula';
  title?: string;
  nodes?: { label: string; sub?: string }[];
  debits?: { account: string; amount: string }[];
  credits?: { account: string; amount: string }[];
  code?: string;
  language?: string;
  rows?: { metric: string; valA: string; valB: string; status?: string }[];
  formula?: string;
  explanationNote?: string;
}

export interface ExtendedQuizQuestion {
  id: string;
  category: string;
  points: number; // 100, 200, 300, 500
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  diagram?: DiagramData;
}

export const EXTENDED_QUIZ_BANK: ExtendedQuizQuestion[] = [
  // --- HISTORICAL & ARCHITECTURE OF EXTRACTION ---
  {
    id: 'hist-1',
    category: 'Historical Analysis',
    points: 300,
    question: 'In what year was the Freedman\'s Savings and Trust Company chartered by the U.S. Congress, and who signed its incorporating act into law?',
    options: [
      '1865 by President Abraham Lincoln',
      '1877 by President Rutherford B. Hayes',
      '1860 by President James Buchanan',
      '1890 by President Benjamin Harrison'
    ],
    correctIndex: 0,
    explanation: 'Congress incorporated the Freedman\'s Savings Bank on March 3, 1865, and President Abraham Lincoln signed the bill into law to safeguard savings for newly emancipated Black Americans.',
    diagram: {
      type: 'comparison',
      title: 'Freedman\'s Bank Founding Charter vs Speculative Reality',
      rows: [
        { metric: '1865 Mandate', valA: 'U.S. Government Backed Safe Haven', valB: '100% Low-Risk Federal Bonds' },
        { metric: '1870 Amendment', valA: 'Lobbied by Wall Street Financiers', valB: 'Allowed Risky Private Real Estate & Railroad Loans' }
      ]
    }
  },
  {
    id: 'hist-2',
    category: 'Historical Analysis',
    points: 300,
    question: 'How did Henry Cooke and Jay Cooke & Company exploit the Freedman\'s Savings Bank assets leading up to its 1874 failure?',
    options: [
      'By transferring physical gold bars to European central banks',
      'By forging banknotes using counterfeit printing presses in Philadelphia',
      'By amending the bank charter in 1870 to siphon Black depositors\' savings into unsecured speculative loans for Northern Pacific Railroad bonds',
      'By shutting down all physical branches without notice during a blizzard'
    ],
    correctIndex: 2,
    explanation: 'Henry Cooke used his influence as head of the finance committee to divert over $3 million in Black depositor savings to fund his brother\'s failing Northern Pacific Railroad venture.',
    diagram: {
      type: 'flow',
      title: 'Mechanism of Extraction (1870-1874)',
      nodes: [
        { label: 'Black Depositors', sub: 'Deposited $3M+ Earned Wages' },
        { label: '1870 Charter Amendment', sub: 'Removed Strict Bond Mandate' },
        { label: 'Henry Cooke / Trustee Board', sub: 'Approved Unsecured Loans' },
        { label: 'Northern Pacific Railroad', sub: 'Collateral Collapse (Panic of 1873)' },
        { label: '1874 Insolvency', sub: '60,000+ Families Wiped Out' }
      ]
    }
  },
  {
    id: 'hist-3',
    category: 'Historical Analysis',
    points: 200,
    question: 'What was the estimated total dollar loss to the Black community when the Freedman\'s Savings Bank collapsed in 1874?',
    options: [
      'Around $50,000',
      'Over $3 Million in 1874 dollars (equivalent to tens of billions today in wealth potential)',
      'Under $100,000',
      'Zero, because the federal government reimbursed all depositors immediately'
    ],
    correctIndex: 1,
    explanation: 'Over 61,000 Black individuals and organizations lost more than $3 million in savings—a catastrophic blow that wiped out intergenerational capital formation during Reconstruction.',
    diagram: {
      type: 'scorecard',
      title: 'Freedman\'s Bank Collapse Impact',
      rows: [
        { metric: 'Depositor Accounts Wiped', valA: '61,144', valB: 'Reconstruction Families' },
        { metric: 'Total Capital Extracted', valA: '$3,000,000+', valB: '1874 Unadjusted USD' },
        { metric: 'Federal Guarantee', valA: 'FALSE', valB: 'Congress Refused Direct Bailout' }
      ]
    }
  },
  {
    id: 'hist-4',
    category: 'Historical Analysis',
    points: 200,
    question: 'How did HOLC (Home Owners\' Loan Corporation) redlining maps created in the 1930s structurally enforce wealth extraction?',
    options: [
      'By giving high-interest loans only to corporate CEOs',
      'By marking Black and minority neighborhoods in red pencil as "hazardous", denying them FHA-backed mortgages and locking communities out of real estate appreciation',
      'By requiring all homeowners to pay property taxes in physical silver coins',
      'By forcing citizens to sell homes to foreign governments'
    ],
    correctIndex: 1,
    explanation: 'HOLC maps codified institutional redlining, denying federally insured mortgages to redlined neighborhoods and creating a systemic multi-trillion dollar racial housing wealth gap.'
  },
  {
    id: 'hist-5',
    category: 'Historical Analysis',
    points: 200,
    question: 'What landmark federal legislation was passed in 1977 to combat bank redlining and force banks to meet local credit needs?',
    options: [
      'The Glass-Steagall Act',
      'The Federal Reserve Act',
      'The Community Reinvestment Act (CRA)',
      'The Dodd-Frank Wall Street Reform Act'
    ],
    correctIndex: 2,
    explanation: 'The Community Reinvestment Act (CRA) of 1977 mandated that commercial banks meet the credit needs of all segments of their communities, including low- and moderate-income neighborhoods.'
  },
  {
    id: 'hist-6',
    category: 'Historical Analysis',
    points: 300,
    question: 'How do predatory fringe financial services (like check-cashing outlets and payday lenders) extract disproportionate income from unbanked consumers?',
    options: [
      'By offering free debit cards with cash back rewards',
      'By charging high upfront cashing fees (e.g. 2-5%) on paycheck stubs and annualized interest rates exceeding 300-400% on short-term payday loans',
      'By forcing borrowers to buy corporate stock shares',
      'By requiring customers to deposit $10,000 in escrow accounts'
    ],
    correctIndex: 1,
    explanation: 'Fringe financial services monetize systemic banking exclusion, stripping billions of dollars annually from low-income workers through compounding fees and debt traps.'
  },

  // --- TRUE / FALSE QUESTIONS ---
  {
    id: 'tf-1',
    category: 'Payment Rails',
    points: 100,
    question: 'True or False: A debit card authorization instantly settles cash between the merchant and issuing bank account on the exact second the swipe occurs.',
    options: [
      'True',
      'False'
    ],
    correctIndex: 1,
    explanation: 'False! Card authorization only places a temporary hold and checks balance. Actual settlement occurs hours or days later in batch interbank clearing.'
  },
  {
    id: 'tf-2',
    category: 'Core Banking',
    points: 100,
    question: 'True or False: Under double-entry accounting rules, an increase in a bank\'s Customer Deposit account is recorded as a Credit to the bank\'s Liabilities.',
    options: [
      'True',
      'False'
    ],
    correctIndex: 0,
    explanation: 'True! Customer deposits represent money the bank owes back to customers on demand, making them a liability on the bank\'s balance sheet.'
  },
  {
    id: 'tf-3',
    category: 'Compliance & Risk',
    points: 100,
    question: 'True or False: Deliberately breaking a $15,000 cash deposit into two separate $7,500 deposits to avoid triggering a $10,000 CTR report is illegal "structuring".',
    options: [
      'True',
      'False'
    ],
    correctIndex: 0,
    explanation: 'True! Under 31 U.S.C. 5324, structuring transactions specifically to evade federal Anti-Money Laundering (AML) threshold reporting is a federal crime.'
  },
  {
    id: 'tf-4',
    category: 'DeFi & Web3',
    points: 100,
    question: 'True or False: Flash loans in DeFi require borrowers to post at least 150% collateral upfront before receiving funds.',
    options: [
      'True',
      'False'
    ],
    correctIndex: 1,
    explanation: 'False! Flash loans require 0% collateral because the entire loan must be borrowed, used, and fully repaid within the exact same atomic EVM block transaction.'
  },
  {
    id: 'tf-5',
    category: 'Historical Analysis',
    points: 100,
    question: 'True or False: The Freedman\'s Savings Bank was explicitly backed by the full faith and credit of the United States Treasury when it collapsed in 1874.',
    options: [
      'True',
      'False'
    ],
    correctIndex: 1,
    explanation: 'False! Despite displaying military insignia and Lincoln\'s image on passbooks, Congress refused to guarantee or bail out Freedman\'s Bank deposits when it failed.'
  },
  {
    id: 'tf-6',
    category: 'Underwriting',
    points: 100,
    question: 'True or False: The Equal Credit Opportunity Act (ECOA) prohibits lenders from using marital status, race, or sex in credit decisioning algorithms.',
    options: [
      'True',
      'False'
    ],
    correctIndex: 0,
    explanation: 'True! ECOA (Regulation B) explicitly bans using protected demographics in both manual and automated underwriting models.'
  },

  // --- PAYMENT RAILS & CORE BANKING (VARIOUS ANSWERS A, B, C, D) ---
  {
    id: 'eq-101',
    category: 'Payment Rails',
    points: 200,
    question: 'Which entity in the four-party payment network is responsible for setting standard interchange rates?',
    options: [
      'The Card Network (Visa / Mastercard)',
      'The Merchant POS terminal hardware vendor',
      'The Consumer\'s local web browser',
      'The Federal Deposit Insurance Corporation (FDIC)'
    ],
    correctIndex: 0,
    explanation: 'Card networks set baseline interchange rates schedule matrices, which issuers earn and acquirers pay during transaction clearing.'
  },
  {
    id: 'eq-102',
    category: 'Payment Rails',
    points: 300,
    question: 'In ISO 20022 XML messaging standards used by FedNow and real-time payment rails, which message represents an interbank credit transfer request?',
    options: [
      'camt.053 (Bank Statement)',
      'pain.001 (Customer Credit Transfer)',
      'pacs.008 (FI-to-FI Customer Credit Transfer)',
      'head.001 (Business Header)'
    ],
    correctIndex: 2,
    explanation: 'pacs.008 is the standard ISO 20022 XML message used for executing direct interbank real-time credit transfers between financial institutions.'
  },
  {
    id: 'eq-103',
    category: 'Payment Rails',
    points: 100,
    question: 'What is an "Original Credit Transaction" (OCT) used for in push-to-card payments like Visa Direct?',
    options: [
      'Charging annual membership fees to credit card holders',
      'Sending physical paper checks via express mail',
      'Routing real-time credit payouts directly onto a user\'s debit card number within seconds',
      'Canceling stolen credit card accounts'
    ],
    correctIndex: 2,
    explanation: 'OCT messages enable instant push payments (gig economy payouts, instant disbursements) directly to cardholders\' debit cards.'
  },
  {
    id: 'eq-104',
    category: 'Core Banking',
    points: 200,
    question: 'What ledger entry is posted on a bank\'s books when a user deposits $1,000 cash at a bank branch?',
    options: [
      'Debit Cash Asset ($1,000); Credit Customer Deposit Liability ($1,000)',
      'Credit Cash Asset ($1,000); Debit Retained Earnings ($1,000)',
      'Debit Interest Income ($1,000); Credit Marketing Expense ($1,000)',
      'Debit Customer Deposit Liability ($1,000); Credit Cash Asset ($1,000)'
    ],
    correctIndex: 0,
    explanation: 'Cash in vault increases (Debit Asset), and the obligation to repay the customer on demand increases (Credit Liability).'
  },
  {
    id: 'eq-105',
    category: 'Core Banking',
    points: 300,
    question: 'Why is Optimistic Concurrency Control (OCC) or ledger row locking required in high-throughput banking engines?',
    options: [
      'To prevent cyber hackers from changing font colors',
      'To ensure that two simultaneous withdrawal requests cannot cause a race condition leading to double-spending',
      'To speed up website video playback',
      'To compress database backup files'
    ],
    correctIndex: 1,
    explanation: 'Concurrency control ensures strict transaction atomicity and isolation (ACID), preventing simultaneous requests from draining a balance below zero.'
  },

  // --- UNDERWRITING & CREDIT RISK ---
  {
    id: 'eq-201',
    category: 'Underwriting',
    points: 200,
    question: 'Which factor carries the single largest weight (35%) in calculating a consumer\'s traditional FICO Credit Score?',
    options: [
      'Credit Utilization Ratio (30%)',
      'Length of Credit History (15%)',
      'Types of Credit Used (10%)',
      'Payment History / On-Time Payment Record (35%)'
    ],
    correctIndex: 3,
    explanation: 'Payment History accounts for 35% of a traditional FICO score, making on-time payments the most critical scoring component.'
  },
  {
    id: 'eq-202',
    category: 'Underwriting',
    points: 300,
    question: 'What is "Adverse Action" under the Fair Credit Reporting Act (FCRA)?',
    options: [
      'A physical fight at a bank teller window',
      'A mandatory legal notice explaining the specific reasons why a lender denied credit or offered less favorable loan terms',
      'An action movie filmed inside a stock exchange',
      'A penalty fee charged for closing a checking account'
    ],
    correctIndex: 1,
    explanation: 'FCRA and Regulation B require lenders to supply an Adverse Action notice disclosing key principal reasons whenever a credit application is rejected.'
  },
  {
    id: 'eq-203',
    category: 'Underwriting',
    points: 200,
    question: 'What does "Debt-to-Income (DTI) Ratio" measure in mortgage underwriting?',
    options: [
      'Gross Monthly Debt Obligations divided by Gross Monthly Income',
      'Annual Income divided by Total Credit Card Limit',
      'Monthly Rent divided by Total Stock Investments',
      'Credit Score divided by Age'
    ],
    correctIndex: 0,
    explanation: 'DTI compares total recurring monthly debt payments against gross monthly income, with qualified mortgage limits usually capped around 36%-43%.'
  },

  // --- WEALTHTECH & CAPITAL MARKETS ---
  {
    id: 'eq-301',
    category: 'Wealth Tech',
    points: 200,
    question: 'In options pricing models (Black-Scholes), what does option "Delta" represent?',
    options: [
      'The rate of time decay as expiration approaches',
      'The sensitivity of the option price relative to a $1.00 move in the underlying asset',
      'The sensitivity of the option price to changes in implied volatility (Vega)',
      'The risk-free interest rate multiplier'
    ],
    correctIndex: 1,
    explanation: 'Delta measures the expected dollar change in option price per $1 change in the underlying stock price.'
  },
  {
    id: 'eq-302',
    category: 'Wealth Tech',
    points: 300,
    question: 'What is "Payment for Order Flow" (PFOF) in retail zero-commission brokerage models?',
    options: [
      'Compensation paid by market makers (e.g. Citadel Securities) to brokerages for routing retail order flow to them for execution',
      'A monthly subscription fee charged directly to retail traders',
      'A government tax on stock dividends',
      'Paying company executives to issue stock shares'
    ],
    correctIndex: 0,
    explanation: 'PFOF lets brokerages offer $0 commission trading by monetizing order execution routing to market makers who profit off the bid-ask spread.'
  },
  {
    id: 'eq-303',
    category: 'Wealth Tech',
    points: 200,
    question: 'How does Direct Indexing differ from buying an S&P 500 ETF fund?',
    options: [
      'Direct Indexing requires calling floor traders on the telephone',
      'Direct Indexing directly purchases all individual component stocks in the investor\'s brokerage account, enabling custom stock exclusions and individual share tax-loss harvesting',
      'Direct Indexing is only available for cryptocurrency',
      'Direct Indexing guarantees a 20% annual return'
    ],
    correctIndex: 1,
    explanation: 'Direct indexing holds underlying individual equities directly, providing ETF diversification while permitting granular tax harvesting and personalized ESG screening.'
  },

  // --- INSURTECH & COMPLIANCE ---
  {
    id: 'eq-401',
    category: 'Insurtech',
    points: 200,
    question: 'What is "Parametric Insurance" in modern Insurtech platform design?',
    options: [
      'Insurance that requires submitting physical paper receipts after a loss',
      'Insurance that pays out automatically upon pre-agreed parameter thresholds (e.g. earthquake magnitude > 6.0) verified by oracle data',
      'Car insurance offered exclusively to taxi drivers',
      'Health insurance covering paramedical exams only'
    ],
    correctIndex: 1,
    explanation: 'Parametric insurance automates claim payouts triggered by verified environmental or operational data points without manual claims adjustment.'
  },
  {
    id: 'eq-402',
    category: 'Compliance & Risk',
    points: 300,
    question: 'What is the "OFAC SDN" (Specially Designated Nationals) list screening requirement?',
    options: [
      'Checking if an account holder has an active driver license',
      'A mandatory regulatory check against US Treasury watchlists to block transactions involving sanctioned terrorists, warlords, or foreign regimes',
      'A social security verification for college student discounts',
      'Checking if a merchant accepts credit cards'
    ],
    correctIndex: 1,
    explanation: 'Financial institutions are legally obligated to screen users and payment counterparties against OFAC SDN databases to prevent illegal cross-border flows.'
  },

  // --- DEFI & WEB3 ---
  {
    id: 'eq-501',
    category: 'DeFi & Web3',
    points: 200,
    question: 'What is an "Automated Market Maker" (AMM) in decentralized finance protocols like Uniswap?',
    options: [
      'A high-frequency trading robot running on Wall Street servers',
      'A decentralized smart contract protocol using liquidity pools and mathematical pricing formulas (e.g. x * y = k) instead of central order books',
      'A central bank issuing digital currency',
      'An automated ATM machine accepting physical cash'
    ],
    correctIndex: 1,
    explanation: 'AMMs eliminate order books by allowing users to swap tokens against liquidity pools governed by constant-product mathematical curves.'
  },
  {
    id: 'eq-502',
    category: 'DeFi & Web3',
    points: 300,
    question: 'What is a "Zero-Knowledge Proof" (ZK-Proof) in financial cryptography?',
    options: [
      'A math proof showing zero balance in an account',
      'A cryptographic technique allowing one party to mathematically prove a statement is true without revealing any underlying private data',
      'An authentication code sent via SMS text message',
      'A technique for erasing hard drive storage'
    ],
    correctIndex: 1,
    explanation: 'ZK-proofs enable privacy-preserving verification of identity, solvency, or age without exposing underlying personal credentials.'
  },

  // --- WHAT IS... SERIES & FINANCE DICTIONARY QUESTIONS ---
  {
    id: 'eq-601',
    category: 'Foundations of Finance',
    points: 100,
    question: 'What are the three fundamental economic functions of money?',
    options: [
      'Buying stocks, paying taxes, and printing banknotes',
      'Medium of exchange, store of value, and unit of account',
      'Earning dividends, taking loans, and opening checking accounts',
      'Cryptographic hashing, distributed ledger, and smart contracts'
    ],
    correctIndex: 1,
    explanation: 'To serve as money, an asset must be a medium of exchange (accepted in trade), store of value (holds wealth over time), and unit of account (standardized pricing unit).',
    diagram: {
      type: 'comparison',
      title: 'The 3 Functions of Money',
      rows: [
        { metric: 'Medium of Exchange', valA: 'Eliminates Barter Matching', valB: 'Accepted by Everyone for Trade' },
        { metric: 'Store of Value', valA: 'Retains Purchasing Power', valB: 'Allows Saving Income for Future' },
        { metric: 'Unit of Account', valA: 'Standardized Measure', valB: 'Compares Prices & Values Accurately' }
      ]
    }
  },
  {
    id: 'eq-602',
    category: 'Foundations of Finance',
    points: 200,
    question: 'How does Compound Interest differ from Simple Interest?',
    options: [
      'Simple interest is charged by government central banks, while compound interest is charged by crypto wallets',
      'Simple interest applies only to credit card debt, while compound interest applies only to savings bonds',
      'Compound interest calculates earnings on the initial principal PLUS all previously accumulated interest, accelerating growth over time',
      'Compound interest subtracts 5% each year for inflation tax'
    ],
    correctIndex: 2,
    explanation: 'Compound interest generates "interest on interest." A $1,000 deposit at 10% annual compound interest yields $1,100 after Year 1 and $1,210 (10% of $1,100) after Year 2.',
    diagram: {
      type: 'formula',
      title: 'Compound Interest Formula',
      formula: 'A = P × (1 + r/n)^(n × t)',
      explanationNote: 'P = Principal ($1,000), r = Rate (10%), t = Years. Exponential growth accelerates as time increases.'
    }
  },
  {
    id: 'eq-603',
    category: 'Central Banking',
    points: 200,
    question: 'What is the "Dual Mandate" established by Congress for the U.S. Federal Reserve?',
    options: [
      'Maximizing stock market valuations and printing foreign currency',
      'Bailing out commercial banks and running national lotteries',
      'Maintaining maximum sustainable employment and price stability (low inflation ~2%)',
      'Setting credit card interest rates to 0% and regulating stock brokers'
    ],
    correctIndex: 2,
    explanation: 'The Fed operates under a dual statutory mandate: promoting maximum employment while keeping inflation stable near its target rate.'
  },
  {
    id: 'eq-604',
    category: 'Credit & Debt',
    points: 200,
    question: 'Which two factors account for a massive 65% of your standard FICO credit score calculation?',
    options: [
      'Total annual salary (35%) and number of active checking accounts (30%)',
      'Payment history (35%) and credit utilization ratio (30%)',
      'Length of credit history (35%) and new credit inquiries (30%)',
      'Age (35%) and home value (30%)'
    ],
    correctIndex: 1,
    explanation: 'FICO scores heavily prioritize on-time payments (35%) and keeping your credit balance usage low relative to total credit limits (30%).',
    diagram: {
      type: 'scorecard',
      title: 'FICO Credit Score Breakdown',
      rows: [
        { metric: 'Payment History', valA: '35%', valB: 'On-time bill payment track record' },
        { metric: 'Credit Utilization', valA: '30%', valB: 'Balance used vs total available limit' },
        { metric: 'Length of History', valA: '15%', valB: 'Average age of open accounts' },
        { metric: 'Credit Mix & New Inquiries', valA: '20%', valB: 'Revolving/installment mix & recent checks' }
      ]
    }
  },
  {
    id: 'eq-605',
    category: 'Banking Infrastructure',
    points: 300,
    question: 'What is the primary technological advantage of the Federal Reserve\'s FedNow payment rail over traditional ACH transfers?',
    options: [
      'FedNow relies on physical courier trucks to carry cash between banks overnight',
      'FedNow provides 24/7/365 real-time gross settlement clearing payments instantly in seconds rather than batch processing over 1-3 business days',
      'FedNow converts USD into Bitcoin automatically before sending',
      'FedNow eliminates the need for sender account numbers'
    ],
    correctIndex: 1,
    explanation: 'Launched in 2023, FedNow enables instant interbank clearing 24/7/365, bypassing traditional ACH multi-day batch window delays.',
    diagram: {
      type: 'comparison',
      title: 'ACH Batch Rail vs. FedNow Instant Rail',
      rows: [
        { metric: 'Settlement Speed', valA: '1 to 3 Business Days (Batch)', valB: 'Sub-3 Seconds (Real-Time)' },
        { metric: 'Operating Hours', valA: 'Mon-Fri Business Hours Only', valB: '24 / 7 / 365 Non-Stop' },
        { metric: 'Use Case', valA: 'Payroll & Bill Pay Batches', valB: 'Instant P2P, Earned Wage & Emergency Claims' }
      ]
    }
  },
  {
    id: 'eq-606',
    category: 'Markets & Trading',
    points: 100,
    question: 'What is the "Bid-Ask Spread" in market trading?',
    options: [
      'The tax rate charged on short-term stock capital gains',
      'The difference between the highest price a buyer is willing to pay (bid) and the lowest price a seller is willing to accept (ask)',
      'The physical distance between Wall Street and NASDAQ servers',
      'The commission percentage paid to a stock broker'
    ],
    correctIndex: 1,
    explanation: 'Market makers earn revenue by buying at the lower bid price and selling at the higher ask price, capturing the spread.'
  },
  {
    id: 'eq-607',
    category: 'Fintech Credit',
    points: 300,
    question: 'How does "Cashflow Underwriting" expand credit access for thin-file consumers?',
    options: [
      'By requiring applicants to mail physical gold jewelry as collateral',
      'By evaluating real-time bank account cash deposits, recurring income streams, and spending patterns instead of relying solely on static FICO credit scores',
      'By automatically granting $100,000 credit lines without checking income',
      'By using government stimulus grants to pay off defaulted loans'
    ],
    correctIndex: 1,
    explanation: 'Cashflow underwriting uses open banking APIs (like Plaid) to analyze live cash inflow, enabling creditworthy thin-file consumers to qualify for loans.'
  },
  {
    id: 'eq-608',
    category: 'Crypto & Wallets',
    points: 100,
    question: 'In cryptocurrency security, what is the critical difference between your Public Key and your Secret Seed Phrase (Private Key)?',
    options: [
      'Your public key is secret, while your seed phrase can be published on social media',
      'Your public key acts like a bank account address to receive funds, while your seed phrase grants total cryptographic control over your assets and must NEVER be shared',
      'Your seed phrase is only used to pay annual account maintenance fees',
      'Public keys work on iPhones, while private keys work on Android phones'
    ],
    correctIndex: 1,
    explanation: 'Public keys are safe to share for receiving transfers. Secret seed phrases control wallet private keys—sharing them allows anyone to steal your assets.'
  },
  {
    id: 'eq-609',
    category: 'InsurTech',
    points: 200,
    question: 'How does Telematics technology lower car insurance costs for safe drivers?',
    options: [
      'By sending a physical inspector to check your car engine every week',
      'By collecting real-time driving data (braking, speed, late-night hours) via smartphone sensors or OBD-II car devices to score actual risk rather than broad demographic averages',
      'By forcing drivers to take a written driving test every 6 months',
      'By replacing car repairs with digital video game credits'
    ],
    correctIndex: 1,
    explanation: 'Telematics allows InsurTechs (like Root or Lemonade) to reward individual safe driving behavior with personalized lower premiums.'
  },
  {
    id: 'eq-610',
    category: 'Ethics & Compliance',
    points: 300,
    question: 'What is the primary mission of the Consumer Financial Protection Bureau (CFPB)?',
    options: [
      'Managing U.S. government foreign trade tariffs',
      'Enforcing federal consumer financial laws to protect everyday families from unfair, deceptive, or predatory banking and lending practices',
      'Setting daily stock prices on the New York Stock Exchange',
      'Printing paper currency at the Bureau of Engraving and Printing'
    ],
    correctIndex: 1,
    explanation: 'Established in 2010 under Dodd-Frank, the CFPB regulates financial companies, penalizes illegal fees, and enforces transparency in consumer lending.'
  }
];

