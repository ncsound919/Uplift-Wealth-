export interface LectureSlide {
  title: string;
  subtitle: string;
  bullets: string[];
  codeSnippet?: string;
  exampleCard?: {
    title: string;
    description: string;
    example: string;
    explanation: string;
  };
  diagramTitle?: string;
  diagramData?: string[]; // Representing simplified visual layouts in table/flow forms
}

export interface LectureClass {
  id: string;
  moduleId: string;
  title: string;
  subtitle: string;
  overview: string;
  learningOutcomes: string[];
  keyConcepts: { term: string; definition: string; practicalUse: string }[];
  slides: LectureSlide[];
  teachingMoves: { phase: string; strategy: string; focus: string }[];
  appliedProjectHandout: {
    title: string;
    description: string;
    reusableOutput: string;
    checklist: string[];
    technicalSpec: string;
  };
}

export const CLASS_0: LectureClass = {
  id: 'class-0',
  moduleId: 'module-0',
  title: 'Class 0: Foundations of Financial Literacy',
  subtitle: 'Money, Markets, Credit, Crypto, and the Core Vocabulary of Modern Finance',
  overview:
    'This foundational class establishes the essential vocabulary and conceptual frameworks needed to understand all subsequent fintech material. Students learn what money actually is, how stock markets and trading work, the fundamentals of cryptocurrency and blockchain, the role of interest rates and central banking, and the mechanics of credit and debt — all before diving into the technology that powers modern financial systems.',
  learningOutcomes: [
    'Explain the three functions of money and the difference between fiat and commodity money.',
    'Distinguish between primary and secondary capital markets, and between trading and long-term investing.',
    'Describe how blockchain consensus mechanisms create tamper-proof distributed ledgers.',
    'Analyze how central bank interest rate decisions ripple through consumer lending and investment markets.',
    'Calculate credit utilization and explain how FICO scores are constructed from five weighted categories.'
  ],
  keyConcepts: [
    {
      term: 'Medium of Exchange / Store of Value / Unit of Account',
      definition: 'The three essential functions of money: as a universally accepted medium for transactions, a reliable store of purchasing power over time, and a standardized unit for pricing and comparing goods and services.',
      practicalUse: 'Evaluating whether any new financial instrument (including cryptocurrencies) qualifies as "money" by testing it against these three criteria.'
    },
    {
      term: 'Primary vs Secondary Markets',
      definition: 'Primary markets are where securities are created and sold directly by issuers (IPOs). Secondary markets are where existing securities are traded among investors on exchanges like NYSE or NASDAQ.',
      practicalUse: 'Understanding that companies only raise capital on the primary market; secondary trading does not fund the issuer but provides price discovery and liquidity.'
    },
    {
      term: 'Proof of Work vs Proof of Stake',
      definition: 'PoW requires miners to solve cryptographic puzzles expending energy to validate blocks. PoS requires validators to lock up tokens as collateral, with penalties (slashing) for dishonest behavior.',
      practicalUse: 'Evaluating the security, energy efficiency, and decentralization trade-offs of different blockchain consensus mechanisms.'
    },
    {
      term: 'Federal Funds Rate',
      definition: 'The benchmark interest rate set by the Federal Reserve that determines the cost at which banks lend reserve balances to each other overnight, influencing all other interest rates in the economy.',
      practicalUse: 'Predicting how Fed rate decisions affect mortgage rates, credit card APRs, auto loans, and stock market valuations.'
    },
    {
      term: 'FICO Score Factors',
      definition: 'Payment history (35%), credit utilization (30%), length of credit history (15%), new credit inquiries (10%), and credit mix (10%) — the five weighted components that determine consumer credit scores.',
      practicalUse: 'Advising consumers on which financial behaviors most directly improve their credit scores.'
    },
    {
      term: 'Fractional Reserve Banking',
      definition: 'A banking system where banks hold only a fraction of deposits as reserves and lend out the remainder, mathematically expanding the money supply through the money multiplier effect.',
      practicalUse: 'Understanding how a $1,000 deposit can theoretically create up to $10,000 in total money supply under a 10% reserve requirement.'
    }
  ],
  teachingMoves: [
    { phase: 'Interactive Definition Drill', strategy: 'Flash-card style rapid recall of the three functions of money and five FICO factors.', focus: 'Vocabulary retention.' },
    { phase: 'Market Structure Diagram', strategy: 'Draw and label the flow of capital from saver to borrower across primary and secondary markets.', focus: 'Capital market plumbing.' },
    { phase: 'Crypto vs Fiat Debate', strategy: 'Debate whether Bitcoin satisfies the three functions of money as well as the US dollar.', focus: 'Critical thinking about monetary theory.' }
  ],
  appliedProjectHandout: {
    title: 'Personal Finance & Market Literacy Reference (Capstone Pre-Asset)',
    description: 'Create a personal reference document defining the core financial concepts from Class 0: money functions, market structure, credit scoring, and crypto basics.',
    reusableOutput: 'Personal Financial Literacy Reference Sheet.',
    checklist: [
      'Write a one-paragraph explanation of why money was invented and how fiat money derives its value.',
      'Diagram the difference between an IPO (primary market) and a stock trade on NASDAQ (secondary market).',
      'List the five FICO factors in order of weight and state one actionable tip for each.',
      'Explain the difference between Proof of Work and Proof of Stake in one sentence each.'
    ],
    technicalSpec: 'Reference must be written in plain language accessible to a high school student, with no assumption of prior financial knowledge.'
  },
  slides: [
    {
      title: 'The Three Functions of Money',
      subtitle: 'Why societies invented money to solve the double-coincidence problem',
      bullets: [
        'Before money, barter required both parties to want what the other had — the "double coincidence of wants" problem.',
        'Money serves as a Medium of Exchange, enabling trade without direct barter matching.',
        'Money functions as a Store of Value, preserving purchasing power across time.',
        'Money acts as a Unit of Account, providing a standardized metric for pricing and comparison.'
      ],
      exampleCard: {
        title: 'From Barter to Bitcoin',
        description: 'How money evolved from physical commodities to digital ledgers.',
        example: 'Clay tablets (3000 BCE) → Gold coins → Paper banknotes → Digital bank balances → Cryptocurrency',
        explanation: 'Each step reduced friction and expanded trust. Clay tablets recorded debts locally; gold enabled cross-border trade; paper increased portability; digital rails enabled instant global settlement. Crypto extends this to trustless peer-to-peer systems.'
      }
    },
    {
      title: 'Primary vs Secondary Markets & the IPO Process',
      subtitle: 'Where companies raise capital and where investors trade',
      bullets: [
        'In an Initial Public Offering (IPO), a private company sells new shares to institutional investors on the primary market, raising fresh capital.',
        'After the IPO, shares trade on secondary exchanges (NYSE, NASDAQ) where investors buy and sell among themselves.',
        'The issuing company does not receive any money from secondary trades — only from the initial primary sale.',
        'Secondary markets provide price discovery, liquidity, and the ability to exit investments.'
      ],
      diagramTitle: 'IPO-to-Secondary Market Capital Flow',
      diagramData: [
        'Company decides to go public → Files S-1 with SEC detailing financials',
        'Investment banks underwrite → Set initial price range and allocate shares to institutional investors',
        'IPO Day → Shares begin trading on exchange at market-determined price',
        'Secondary Trading → Retail investors buy/sell on open market, company receives no proceeds'
      ]
    },
    {
      title: 'Blockchain Consensus: PoW vs PoS',
      subtitle: 'How distributed networks agree on ledger state without central authority',
      bullets: [
        'Proof of Work: Miners compete to solve energy-intensive cryptographic puzzles; winner proposes the next block and earns a reward.',
        'Proof of Stake: Validators lock up native tokens as collateral; a protocol algorithm selects a validator to propose the next block.',
        'PoW is more decentralized but consumes significant energy (Bitcoin uses ~150 TWh/year).',
        'PoS is energy-efficient but raises centralization concerns around large token holder influence.'
      ],
      exampleCard: {
        title: 'Consensus in Practice',
        description: 'How Bitcoin and Ethereum secure their ledgers differently.',
        example: 'Bitcoin (PoW): Anyone with specialized hardware can mine. Ethereum (PoS): Validators must stake 32 ETH to participate.',
        explanation: 'Both systems achieve the same goal — an immutable, distributed ledger — through different incentive mechanisms. PoW secures through physical resource expenditure; PoS secures through financial stake that can be destroyed (slashed) for misbehavior.'
      }
    },
    {
      title: 'The Federal Reserve & Monetary Policy',
      subtitle: 'How central bank rate decisions affect every loan and investment',
      bullets: [
        'The Federal Reserve manages the US economy under a dual mandate: maximum employment and stable prices (~2% inflation).',
        'The primary tool is the Federal Funds Rate — the interest rate banks charge each other for overnight reserve loans.',
        'When the Fed raises rates, borrowing costs increase (mortgages, credit cards, business loans), slowing economic activity to fight inflation.',
        'When the Fed lowers rates, borrowing becomes cheaper, stimulating spending, investment, and asset price appreciation.'
      ],
      diagramTitle: 'Fed Rate Transmission Mechanism',
      diagramData: [
        'Fed changes Federal Funds Rate → Affects banks cost of capital',
        '→ Banks adjust prime rate → Consumer loan APRs (mortgages, cards, auto) move in same direction',
        '→ Higher rates slow borrowing & spending → Lower demand reduces inflationary pressure',
        '→ Lower rates stimulate borrowing & investment → Economic activity accelerates'
      ]
    },
    {
      title: 'Credit Scoring & The FICO Algorithm',
      subtitle: 'Understanding the five factors that determine consumer creditworthiness',
      bullets: [
        'FICO scores range from 350 to 850, with higher scores indicating lower credit risk to lenders.',
        'Payment History (35%) is the heaviest factor — one missed payment can drop a score by 50-100 points.',
        'Credit Utilization (30%) measures how much of available credit is used; keeping below 30% is critical.',
        'Length of History (15%), New Credit (10%), and Credit Mix (10%) round out the remaining factors.',
        'Over 45 million Americans are "credit invisible" — they have no score, often despite steady income.'
      ],
      exampleCard: {
        title: 'The Utilization Trap',
        description: 'How maxing out a credit card hurts your score even if you pay on time.',
        example: 'If you have a $5,000 limit and carry a $4,500 balance, your utilization is 90%. Even with perfect payment history, this alone can drop your score 50-75 points.',
        explanation: 'Utilization measures how much of your available credit you are using, not just whether you pay on time. High utilization signals financial distress to scoring models, regardless of payment behavior.'
      }
    }
  ]
};

export const CLASS_1: LectureClass = {
  id: 'class-1',
  moduleId: 'module-1',
  title: 'Class 1: Foundations of Financial Systems',
  subtitle: 'TradFi Architecture, Fintech Disruption, Remittances, and Core Ledger Modernization',
  overview:
    'This class introduces the structural foundations of modern finance and explains why fintech emerged as a response to friction, delay, opacity, and expensive intermediation. Students study how traditional banking rails, remittance networks, and legacy core systems work, then compare them with API-driven, cloud-native fintech architectures built for speed, transparency, and programmability.',
  learningOutcomes: [
    'Analyze the operational and technical differences between batch-processed legacy bank ledgers and continuous real-time cloud registries.',
    'Deconstruct the multi-step correspondent banking pipeline and trace fee leakage and delays across the SWIFT network.',
    'Formulate a balanced, double-entry database schema that enforces immutability and transaction finality.'
  ],
  keyConcepts: [
    {
      term: 'Nostro / Vostro Accounts',
      definition: 'Nostro ("our money at your bank") and Vostro ("your money at our bank") are accounts held by one bank with another in a foreign currency, used to settle cross-border correspondent transactions.',
      practicalUse: 'Critical for tracking interbank liquidity and settlement capacities in cross-border remittance engines.'
    },
    {
      term: 'Batch vs. Continuous Processing',
      definition: 'Batch processing consolidates transactions over a period and executes them in bulk during off-peak hours. Continuous processing updates account ledger states immediately and atomically upon each transaction.',
      practicalUse: 'Essential for designing 24/7 real-time payment interfaces where users expect instantaneous balance updates.'
    },
    {
      term: 'Double-Entry Ledger',
      definition: 'An accounting system where every transaction is recorded as both a debit and a credit across distinct accounts, ensuring that the total sum of debits exactly matches the total sum of credits.',
      practicalUse: 'Used as the core architectural invariant when building neobank databases, stock brokers, and cryptocurrency exchanges.'
    }
  ],
  teachingMoves: [
    { phase: 'Direct Lecture', strategy: 'Map the physical path of a $500 wire passing through SWIFT correspondent banks.', focus: 'Differentiating clearing messages from physical settlement.' },
    { phase: 'Plaid Discussion', strategy: 'Review how screen scraping passwords has been replaced by secure OAuth tokens.', focus: 'Data privacy standards.' }
  ],
  appliedProjectHandout: {
    title: 'Double-Entry Ledger Design & Idempotency Spec (Capstone Asset #1)',
    description: 'Design the database schema, ledger transaction APIs, and duplicate-prevention mechanism (idempotency) for a core banking ledger.',
    reusableOutput: 'Core Database Schema and Idempotent Transaction API Payload Contract.',
    checklist: [
      'Define a SQL schema with separate `accounts`, `transactions`, and `journal_entries` tables.',
      'Implement an idempotency-key validation flow using a Redis cache state-machine check.',
      'Write a mock transaction POST route that executes a safe double-entry transfer between two users inside a database transaction block.'
    ],
    technicalSpec: 'The system must support automatic retries from mobile clients and handle high-concurrency race conditions gracefully without double-crediting accounts.'
  },
  slides: [
    {
      title: 'The Traditional Financial Core',
      subtitle: 'How legacy financial systems organize money movement and recordkeeping',
      bullets: [
        'Traditional finance relies on centralized ledgers maintained by banks, central banks, and clearing institutions.',
        'Core financial functions (clearing, settlement, custody, and credit allocation) are heavily intermediated by commercial and central banks.',
        'Traditional retail banking relies on batch processing, where accounts are reconciled at end-of-day rather than updated in real-time.'
      ],
      exampleCard: {
        title: "Legacy Batch vs Modern Continuous Ledger Updates",
        description: "How banks move from overnight batching to instant processing.",
        example: "Legacy Bank: Processes all wire transfers at 2:00 AM in a single large queue. Modern Neobank: Updates the database instantly upon user tap.",
        explanation: "Legacy systems wait until the end of the day to process transactions, meaning you might not see your balance update until the next morning. Modern fintechs update the database continuously, ensuring immediate reflection of funds and a seamless user experience."
      }
    },
    {
      title: 'The Mechanics of SWIFT and Correspondent Banking',
      subtitle: 'Why cross-border payments have historically taken 3-5 days and cost $30+',
      bullets: [
        'Cross-border payments historically relied on correspondent banking, where intermediary banks maintain Nostro and Vostro accounts with each other to settle cross-border transactions.',
        'The SWIFT network is a pure messaging protocol—it does not settle or move physical capital; it only transmits encrypted clearing instructions.',
        'Every intermediary bank in a SWIFT correspondent banking chain deducts fees, introduces settlement risk, and causes operational delays.'
      ],
      diagramTitle: 'SWIFT Correspondent Banking Chain Routing Flow',
      diagramData: [
        'Sender (USD) -> Initiates transfer at local Bank A',
        'Bank A -> Deducts wire fee ($35) and sends SWIFT MT103 to Correspondent Bank B',
        'Correspondent Bank B -> Charges clearing markup ($15), converts USD to EUR (3% spread)',
        'Correspondent Bank B -> Transfers EUR to Beneficiary Bank C via TARGET2/SEPA',
        'Beneficiary Bank C -> Charges inward processing fee ($10), credits final Recipient account'
      ]
    },
    {
      title: 'Modern Core Ledger Modernization',
      subtitle: 'Designing real-time, double-entry, immutable database cores',
      bullets: [
        'Modern fintech architectures replace legacy batch databases with event-driven, double-entry ledger databases.',
        'A double-entry ledger ensures that every financial event has equal and opposite debit and credit entries, guaranteeing that total assets always equal liabilities plus equity.',
        'Immutable ledger tables prevent arbitrary database updates, forcing all updates to be recorded as discrete transactions for perfect historical auditing.'
      ],
      exampleCard: {
        title: "Immutable Double-Entry Ledger",
        description: "The golden rule of financial engineering.",
        example: "When sending $50, the sender's account is debited $50, and the receiver's account is credited $50 in the same transaction.",
        explanation: "Double-entry ensures that money is never 'created' or 'destroyed' in the database. If the debits don't perfectly match the credits, the transaction is rejected. Immutability means records can't be deleted—only corrected with a new transaction."
      }
    }
  ]
};

export const CLASS_2: LectureClass = {
  id: 'class-2',
  moduleId: 'module-2',
  title: 'Class 2: Payment Rails, Acquiring Processors, and FedNow Real-Time Settlement',
  subtitle: 'From Card Swipe Interchange loops to Fed Reserve Real-Time Reserve Systems',
  overview: 'A deep dive into payment system mechanics: card payment loops, merchant gateways, interchange math, and the architecture of instant central bank settlement rails like FedNow.',
  learningOutcomes: [
    'Deconstruct the four stakeholders involved in a standard credit card transaction swipe.',
    'Calculate the split of merchant discount rates between gateways, processors, and issuers.',
    'Detail the ISO 20022 messaging schema and real-time liquidity balancing required by FedNow.'
  ],
  keyConcepts: [
    {
      term: 'Merchant Discount Rate (MDR)',
      definition: 'The total percentage fee charged to a merchant for accepting debit or credit card payments (e.g., 2.9% + 30¢).',
      practicalUse: 'Modeling the cash inflow and fee structures for retail checkout platforms.'
    },
    {
      term: 'ISO 20022 Standard',
      definition: 'The standardized XML financial messaging protocol allowing rich structured metadata to travel alongside payments.',
      practicalUse: 'Engineering automated invoice matching pipelines nested directly inside transaction events.'
    },
    {
      term: 'Federal Reserve Master Account',
      definition: 'The ultimate central bank deposit account where commercial banks settle payments in real-time reserve balances.',
      practicalUse: 'Managing instant settlement liquidity around the clock without manual bank closures.'
    }
  ],
  teachingMoves: [
    { phase: 'Interchange Calculation', strategy: 'Run through a card swipe fee breakdown comparing a basic debit card with a premium signature credit card.', focus: 'Understanding who gets the largest cut.' },
    { phase: 'FedNow Architecture', strategy: 'Step-by-step tracking of an ISO 20022 message payload checking Federal Reserve reserve balances in seconds.', focus: 'Clearing vs final settlement.' }
  ],
  appliedProjectHandout: {
    title: 'Card Payment Loop Fee Ledger (Capstone Asset #2)',
    description: 'Model a detailed card swipe fee breakdown for a retail store transaction showing the exact split of capital between payment players.',
    reusableOutput: 'Interchange & Processing Fee Calculator demonstrating payment gateway economics.',
    checklist: [
      'Isolate Interchange fee paid to the card-issuing bank.',
      'List Network Assessment fees paid to card networks like Visa/Mastercard.',
      'Calculate gateway and acquiring processor margins from the total MDR.'
    ],
    technicalSpec: 'Differentiate between standard domestic debit fees vs premium consumer cash-back credit interchange rates.'
  },
  slides: [
    {
      title: 'The Four-Party Card Transaction Loop',
      subtitle: 'Gateway, Acquirer, Card Network, and Issuing Institution',
      bullets: [
        'The Cardholder initiates transaction by presenting card tokens at the Gateway.',
        'The Gateway encrypts and routes credentials to the Acquiring Processor.',
        'The Processor queries the Card Network to request clearing checks from the Issuing Bank.',
        'The Issuing Bank validates credit capacity, approves the transaction, and routes funds back.'
      ],
      exampleCard: {
        title: "The Invisible 3% Tax",
        description: "Who gets paid when you swipe your card.",
        example: "On a $100 coffee shop purchase: The issuing bank gets $1.50, the payment network (Visa) gets $0.50, the acquiring bank gets $1.00. The merchant keeps $97.",
        explanation: "Interchange fees are how 'free' debit cards make money. Every time you tap, the merchant is charged a fee, which is split across the four parties that facilitated the immediate trust and movement of those funds."
      }
    },
    {
      title: 'ISO 20022 Financial Messaging Engine',
      subtitle: 'Formatting Rich Transactional Metadata for Instant Payment Rails',
      bullets: [
        'ISO 20022 standardizes financial XML and JSON schemas, attaching rich transactional parameters to payment routing.',
        'Structured parameterization enables automated ledger reconciliation, removing hours of manual billing checks.',
        'Legacy text-based clearing strings (like NACHA or SWIFT MT) are fully replaced by hierarchical metadata nodes.'
      ],
      exampleCard: {
        title: "The Global Financial Language: ISO 20022",
        description: "How central banks talk to each other.",
        example: "A structured message containing rich data: sender name, purpose of payment, and ultimate beneficiary, all encoded in standard XML.",
        explanation: "Before ISO 20022, bank wires carried very little data, making fraud detection and reconciliation difficult. ISO 20022 is the new global standard that carries rich, structured data along with the payment, enabling instant clearing and smarter compliance."
      }
    },
    {
      title: 'FedNow Liquidity Management & Settlement',
      subtitle: 'Real-Time Reserve Adjustments and Risk Thresholds',
      bullets: [
        'FedNow executes payment transfers individually within seconds, around the clock, with instant settlement finality.',
        'Commercial banks must monitor reserve buffers continuously to prevent intraday account overdrafts.',
        'Fintech software routes customer payroll payouts using secure API handshakes to these real-time pipelines.'
      ],
      diagramTitle: 'FedNow Real-Time Settlement Sequence Flow',
      diagramData: [
        'Client initiates payment -> Front-end triggers API call to Sponsor bank',
        'Sponsor bank validates balance -> Packs ISO 20022 payment initiation payload',
        'FedNow network processes request -> Debits/Credits Federal Reserve accounts instantly',
        'Recipient bank receives clearing note -> Credits recipient funds in under 2 seconds'
      ]
    }
  ]
};

export const CLASS_3: LectureClass = {
  id: 'class-3',
  moduleId: 'module-3',
  title: 'Class 3: Banking-as-a-Service (BaaS) & Embedded API Frameworks',
  subtitle: 'OAuth Tokens, Aggregation Iframe Vaults, and Sponsor Banking Systems',
  overview: 'Explains how technology companies deliver compliant deposit accounts and financial services without holding a banking charter, leveraging Open APIs and sponsor structures.',
  learningOutcomes: [
    'Describe the role and integration flow of Open Banking aggregators like Plaid.',
    'Deconstruct the compliance split and ledger sync between a neobank, a BaaS middleman, and an FDIC-insured Sponsor Bank.',
    'Draft standardized webhook notification payloads that update client application states.'
  ],
  keyConcepts: [
    {
      term: 'Sponsor Banking',
      definition: 'A partnership model where fully chartered, regulated banks rent their licensing and balance sheets to tech platforms.',
      practicalUse: 'Issuing FDIC-insured deposit accounts under a white-label interface.'
    },
    {
      term: 'Aggregation Iframes',
      definition: 'Secure, sandboxed browser frames (like Plaid Link) that handle credential collection directly on bank servers.',
      practicalUse: 'Bypassing the risks of screen-scraping and database credential exposure.'
    },
    {
      term: 'Real-Time Webhooks',
      definition: 'Event-triggered HTTPS POST requests sent immediately from banking engines to notify neobanks of user transactions.',
      practicalUse: 'Powering instant mobile push alerts the exact millisecond a card is swiped.'
    }
  ],
  teachingMoves: [
    { phase: 'Integration Diagramming', strategy: 'Draw the data pathways of a neobank balance check showing the Plaid proxy flow.', focus: 'How OAuth tokens bypass database password leaks.' },
    { phase: 'Sponsor Risk Audit', strategy: 'Discuss the historical Synapse bankruptcy and the critical need for split-ledger reconciliation.', focus: 'Depository ledger safety.' }
  ],
  appliedProjectHandout: {
    title: 'BaaS Ledger Sync Schema (Capstone Asset #3)',
    description: 'Draft the data model and API payload contract for syncing balances between a mobile neobank front-end and a chartered sponsor bank ledger.',
    reusableOutput: 'JSON Data Contract and Webhook schema representing payment clearing notifications.',
    checklist: [
      'Include secure user OAuth access tokens.',
      'Define webhook payload for a successful deposit event.',
      'Model the database table matching neobank user IDs with sponsor bank program accounts.'
    ],
    technicalSpec: 'Specify system rules that prevent duplicate transaction events if a webhook is retried.'
  },
  slides: [
    {
      title: 'The Banking-as-a-Service (BaaS) Stack',
      subtitle: 'Frontend UI, BaaS API Middleman, and Chartered Deposit Custody',
      bullets: [
        'Fintech Frontend: Collects users, handles identity KYC flows, and serves the dashboard.',
        'BaaS API layer: standardizes legacy core banking outputs into simple JSON APIs.',
        'Chartered Sponsor Bank: Holds consumer capital in insured custodial deposit structures.'
      ],
      exampleCard: {
        title: "Event-Driven Finance (Webhooks)",
        description: "How apps know instantly when you get paid.",
        example: "Sponsor Bank -> Webhook -> Fintech App -> Push Notification 'You just received $500!'",
        explanation: "Instead of the app constantly asking the bank 'Did the money arrive yet?' (polling), the bank's servers immediately send a secure data package (webhook) to the app the millisecond the funds clear, triggering instant notifications."
      }
    },
    {
      title: 'Double-Entry Ledger Synchronization Loop',
      subtitle: 'Reconciling Virtual Platform Ledgers Against Chartered Bank Masters',
      bullets: [
        'Neobanks manage localized databases representing individual customer wallets and balance sheets.',
        'The physical money is stored in a master "For Benefit Of" (FBO) omnibus account at the sponsor bank.',
        'Reconciliation scripts execute daily to match the sum of virtual rows against the physical bank statements.'
      ],
      exampleCard: {
        title: "The Daily Reconciliation Loop",
        description: "Making sure the math adds up.",
        example: "Internal Ledger Total ($1M) == Sponsor Bank Account Total ($1M)",
        explanation: "Reconciliation is the heartbeat of fintech. Every day, automated scripts compare the fintech's internal database with the actual cash sitting at their partner bank. If there is a one-cent discrepancy, an alert is fired and trading is halted until it is fixed."
      }
    },
    {
      title: 'Managing Tri-Party Compliance Risks',
      subtitle: 'Lessons from Historic Middleware Intermediation Failures',
      bullets: [
        'Legacy BaaS structures isolated sponsor banks from direct view of the neobank sub-ledgers.',
        'BaaS platform bankruptcies (e.g. Synapse) locked retail savings due to un-reconciled ledgers.',
        'Modern compliance mandates demand direct, real-time sync between bank cores and neobank databases.'
      ],
      diagramTitle: 'Direct Bank-Sync Ledger Architecture',
      diagramData: [
        'Consumer App -> Calls API routed through secure middleware gate',
        'Sponsor Bank Core Ledger -> Real-time balance debited with direct FBO hooks',
        'Neobank Sub-Ledger -> Instant database write triggers state mirror',
        'Audit Guard -> Automatic exception alerts raised if records drift by 1 millisecond'
      ]
    }
  ]
};

export const CLASS_4: LectureClass = {
  id: 'class-4',
  moduleId: 'module-4',
  title: 'Class 4: Credit Tech, Alternative Underwriting, and Algorithmic Bias Risks',
  subtitle: 'Cash Flow Feature Engineering, Point-of-Sale Loans, and Fair Lending Rules',
  overview: 'Examines alternative data credit risk assessment modeling—incorporating real-time checking cash-flow history, utility and rent payments, and e-commerce transaction velocity—and Buy Now Pay Later (BNPL) economics, while addressing legal constraints around machine learning bias.',
  learningOutcomes: [
    'Contrast traditional FICO credit scoring metrics with modern cash flow analytics.',
    'Calculate Buy Now Pay Later merchant economics (MDR vs consumer interest loops).',
    'Audit machine learning models to identify and mitigate proxy discrimination variables.'
  ],
  keyConcepts: [
    {
      term: 'ECOA (Equal Credit Opportunity Act)',
      definition: 'Federal statute prohibiting discrimination in any aspect of a credit transaction on the basis of race, color, religion, national origin, sex, marital status, or age.',
      practicalUse: 'Underpinning fair lending flags when creditworthy thin-file applicants are disproportionately excluded.'
    },
    {
      term: 'Credit Invisible',
      definition: 'A consumer with no credit record at any of the three major credit bureaus.',
      practicalUse: 'Identifying applicants requiring alternative data (like rent and bank histories) for viable underwriting.'
    },
    {
      term: 'Thin File',
      definition: 'A consumer with some credit history but insufficient data to generate a traditional credit score reliably.',
      practicalUse: 'Evaluating applicants where traditional FICO thresholds obscure actual repayment capacity.'
    },
    {
      term: 'DTI (Debt-to-Income Ratio)',
      definition: 'Measures a borrower\'s monthly debt obligations as a percentage of their monthly gross income.',
      practicalUse: 'Assessing affordability alongside cash flow to ensure a projected loan payment is sustainable.'
    },
    {
      term: 'Surplus (Monthly Cash Flow Surplus)',
      definition: 'Monthly income minus monthly expenses, representing actual capacity to service new debt.',
      practicalUse: 'Using real-time bank transaction data to predict default risk more effectively than historical credit scores.'
    },
    {
      term: 'Regulation B',
      definition: 'Implementing regulation for ECOA detailing rules creditors must follow when processing applications and evaluating credit.',
      practicalUse: 'Enforcing frameworks for adverse action notices and determining if policies cause disparate impact.'
    },
    {
      term: 'FCRA (Fair Credit Reporting Act)',
      definition: 'Regulates how consumer credit information is collected, used, and shared to promote accuracy, fairness, and privacy.',
      practicalUse: 'Ensuring consumers are notified and can access their reports when adverse actions are taken based on credit information.'
    },
    {
      term: 'Disparate Impact',
      definition: 'A legal theory where a facially neutral policy disproportionately affects a protected class, even without discriminatory intent.',
      practicalUse: 'Auditing policies like strict minimum FICO score requirements that may systematically exclude specific demographic groups.'
    },
    {
      term: 'CRA (Community Reinvestment Act)',
      definition: 'Encourages banks to meet the credit needs of their entire communities, including low- and moderate-income neighborhoods.',
      practicalUse: 'Aligning alternative data underwriting programs with affirmative obligations to serve underserved populations.'
    },
    {
      term: 'CFPB (Consumer Financial Protection Bureau)',
      definition: 'Federal agency with rulemaking authority over consumer financial laws and supervisory authority over large financial institutions.',
      practicalUse: 'Monitoring enforcement priorities around fair lending, financial inclusion, and alternative underwriting practices.'
    },
    {
      term: 'Adverse Action',
      definition: 'A denial or revocation of credit, or an unfavorable change in credit terms.',
      practicalUse: 'Generating transparent notices citing principal reasons for denial, such as insufficient cash flow surplus rather than FICO.'
    },
    {
      term: 'FICO Scoring',
      definition: 'A credit scoring system based on historical bureau debt repayment files.',
      practicalUse: 'Identifying credit limitations for thin-file, young, or unbanked demographics.'
    },
    {
      term: 'Alternative Underwriting Data',
      definition: 'Nontraditional datasets (cash-flow histories, utility/rent payment records, e-commerce transaction velocity) analyzed to gauge creditworthiness.',
      practicalUse: 'Formulating credit decisions and risk scoring profiles for thin-file or unbanked applicants.'
    },
    {
      term: 'Proxy Discrimination',
      definition: 'When an underwriting model utilizes non-protected variables (like zip code) that strongly correlate with protected characteristics, leading to illegal systemic bias.',
      practicalUse: 'Auditing machine learning credit algorithms for compliance with fair lending laws.'
    },
    {
      term: 'MDR Merchant Subsidy',
      definition: 'BNPL firms charging merchants high credit fees in exchange for driving massive cart conversions.',
      practicalUse: 'Evaluating the viability of zero-interest installment options.'
    }
  ],
  teachingMoves: [
    { phase: 'Simulator Interactive Session', strategy: 'Run students through the Alternative Underwriting Simulator.', focus: 'Balancing default rates with credit volume.' },
    { phase: 'Bias Auditing', strategy: 'Inspect an underwriting decision database to check if certain attributes systematically deny loans.', focus: 'Fair Lending compliance.' }
  ],
  appliedProjectHandout: {
    title: 'Underwriting API Feature Specification (Capstone Asset #4)',
    description: 'Define the cashflow parameters extracted via checking account histories to build an instant alternative underwriting scorecard.',
    reusableOutput: 'Cashflow Underwriting scorecard detailing credit assessment attributes.',
    checklist: [
      'List at least three specific deposit frequency features (such as inflow consistency).',
      'Define formula for calculating monthly debt-to-savings cash ratios.',
      'List exact criteria for identifying and removing credit variables representing systemic bias.'
    ],
    technicalSpec: 'Include detailed step-by-step rules demonstrating compliance with the US Equal Credit Opportunity Act.'
  },
  slides: [
    {
      title: 'The Real-Time Alternative Credit Decision Pipeline',
      subtitle: 'From Ingestion to Probability of Default Calculation',
      bullets: [
        'Fintech applications bypass legacy bureau reports by directly ingesting alternative data streams: real-time cash-flow histories, utility and rent payment records, and merchant e-commerce transaction velocity.',
        'Algorithms parse raw ledger files to compute dynamic features (such as net cash flow volatility, deposit consistency, and income stability index).',
        'An automated rules and machine learning decision system maps these features into real-time default probabilities (PD) in under 200 milliseconds.'
      ],
      exampleCard: {
        title: "Cashflow Underwriting",
        description: "Lending without relying on traditional credit scores.",
        example: "Looking at 12 months of bank data to see: Does the user always pay rent on time? Do they have a surplus of $300 at the end of the month?",
        explanation: "Instead of using a FICO score (which relies on past debt), cashflow underwriting analyzes the actual inflows and outflows from a bank account. This provides credit to millions of responsible people who have historically avoided debt and are therefore 'credit invisible.'"
      }
    },
    {
      title: 'Mathematical Modeling of Algorithmic Bias',
      subtitle: 'Measuring and Mitigating Disparate Impact and Proxy Discrimination',
      bullets: [
        'Machine learning models can inherit historical bias through proxy attributes (e.g. zip codes).',
        'Demographic parity asserts that loan approval ratios should be equivalent across protected cohorts.',
        'Developers must verify credit metrics using Adverse Impact Ratio (AIR) audits.'
      ],
      exampleCard: {
        title: "Testing for Algorithmic Bias (AIR)",
        description: "Ensuring AI models don't discriminate.",
        example: "If 80% of majority applicants are approved, the approval rate for minority applicants must be at least 64% (80% of 80%).",
        explanation: "The Adverse Impact Ratio (AIR) is a regulatory test (the 'Four-Fifths Rule') used to ensure algorithms don't unintentionally redline or discriminate against protected classes. If a model fails this test, it must be retrained."
      }
    },
    {
      title: 'Buy Now Pay Later (BNPL) Securitization',
      subtitle: 'Merchant Subsidy Models and Funding Facility Mechanics',
      bullets: [
        'BNPL platforms substitute consumer interest charges with high merchant fee structures (3-6%).',
        'Merchants cover this expense because installments drive higher checkout conversion rates.',
        'BNPL companies pack short-term loan debts into securitized pools to secure cheap credit facilities.'
      ],
      diagramTitle: 'BNPL Receivables Pipeline Flow',
      diagramData: [
        'User purchases $200 item -> Pays first $50 split down payment',
        'BNPL provider pays merchant $190 immediately -> Deducting 5% merchant subsidy fee ($10)',
        'BNPL provider captures remaining $150 -> Split across 3 bi-weekly $50 statements',
        'Debt aggregation -> Receivables bundled into warehouse facility for bank financing'
      ]
    }
  ]
};

export const CLASS_5: LectureClass = {
  id: 'class-5',
  moduleId: 'module-5',
  title: 'Class 5: Wealth Management, Market Microstructure, and Payment for Order Flow',
  subtitle: 'Modern Portfolio Theory (MPT), Tax-Loss Harvesting, and Brokerage Spreads',
  overview: 'Focuses on the algorithms driving digital-first robo-advisors (MPT, portfolio rebalancing) and explores the trading mechanics funding zero-commission brokerages.',
  learningOutcomes: [
    'Synthesize diversified investment allocations based on covariance matrices.',
    'Explain the automated mechanics of Tax-Loss Harvesting (TLH) under the Wash-Sale rule.',
    'Deconstruct the revenue flows and regulatory conflicts of Payment for Order Flow (PFOF).'
  ],
  keyConcepts: [
    {
      term: 'Efficient Frontier',
      definition: 'The mathematical curve representing diversified portfolios that maximize return for a designated level of risk.',
      practicalUse: 'Constructing optimal ETF allocation frameworks based on asset correlations.'
    },
    {
      term: 'Tax-Loss Harvesting (TLH)',
      definition: 'Algorithms automatically selling declining assets to harvest capital losses, instantly reinvesting into correlating proxies.',
      practicalUse: 'Maximizing investor net-of-tax returns in taxable retail brokerage accounts.'
    },
    {
      term: 'Wash-Sale Rule',
      definition: 'IRS regulation denying tax writeoffs if a matching asset is bought within 30 days of sale.',
      practicalUse: 'Designing robo-advisors to buy similar index proxies instead of exact matching stocks.'
    }
  ],
  teachingMoves: [
    { phase: 'Portfolio Rebalancing Math', strategy: 'Work through a numerical example of portfolio drift and calculate rebalancing trade volumes.', focus: 'Tax-efficient selling.' },
    { phase: 'PFOF Debate', strategy: 'Simulate high-frequency trading market maker spreads to show how zero-commission trades are paid.', focus: 'Broker conflict of interest.' }
  ],
  appliedProjectHandout: {
    title: 'Robo-Advisor Portfolio & Rebalancing Engine (Capstone Asset #5)',
    description: 'Model a portfolio construction algorithm detailing the target asset weights, correlation factors, and automated rebalancing triggers.',
    reusableOutput: 'Automated Portfolio Rebalancer demonstrating portfolio drift adjustments.',
    checklist: [
      'List target ETF allocations based on a conservative risk profile.',
      'Detail tax-loss harvesting rules showing proxy asset pairs.',
      'Calculate the exact trading actions required to restore target allocations after a stock surge.'
    ],
    technicalSpec: 'Incorporate strict rules to systematically prevent IRS wash-sales across accounts.'
  },
  slides: [
    {
      title: 'Modern Portfolio Theory and Covariance',
      subtitle: 'Building the Mathematically Optimal Risk-Return Frontier',
      bullets: [
        'Diversification relies on asset classes containing low correlation coefficients.',
        'Algorithms evaluate overall portfolio variance, not individual stock risks.',
        'Rebalancing restores optimal asset ratios, systematically selling high and buying low.'
      ],
      exampleCard: {
        title: "Automated Portfolio Rebalancing",
        description: "Keeping investments perfectly aligned with goals.",
        example: "Target: 60% Stocks, 40% Bonds. Market moves -> 70% Stocks, 30% Bonds. Robo-advisor automatically sells 10% Stocks and buys 10% Bonds.",
        explanation: "Robo-advisors constantly monitor your portfolio. When market movements cause your asset allocation to drift away from your original risk profile, algorithms automatically trade fractional shares to restore the perfect balance without any human intervention."
      }
    },
    {
      title: 'Tax-Loss Harvesting (TLH) & Wash-Sale Bounds',
      subtitle: 'Automating Tax Alpha Generation Without Violating IRS Guidelines',
      bullets: [
        'Robo-advisors scan portfolios daily for positions with losses exceeding cost basis.',
        'The asset is sold to harvest capital losses, which offset client taxable capital gains.',
        'To satisfy the IRS Wash-Sale rule, proceeds are instantly deployed into similar index proxies.'
      ],
      codeSnippet: `// Tax Loss Harvesting execution model
interface SecurityPosition { ticker: string; purchaseCost: number; currentVal: number; units: number }
function evaluateTlh(pos: SecurityPosition, proxyTicker: string): { action: 'HARVEST' | 'HOLD'; value: number } {
  const paperLoss = (pos.purchaseCost - pos.currentVal) * pos.units;
  if (paperLoss > 250.00) { // Harvest only if paper loss justifies trading friction
    return { action: 'HARVEST', value: paperLoss };
  }
  return { action: 'HOLD', value: 0 };
}`
    },
    {
      title: 'Market Microstructure & Order Routing (PFOF)',
      subtitle: 'Analyzing Wholesaler Spreads and Zero-Commission Brokerage Economics',
      bullets: [
        'Retail brokerages earn revenue by routing client market orders to Wholesalers.',
        'Wholesalers pay fractions of a penny per share (PFOF) to capture bid-ask spreads on retail orders.',
        'This practice creates operational conflicts of interest, regulated strictly under SEC Best Execution mandates.'
      ],
      diagramTitle: 'Payment for Order Flow Execution Stream',
      diagramData: [
        'Retail Trader places market order -> System routes order with $0 commission fee',
        'Brokerage routes order to Wholesaler -> Bypassing public lit stock exchanges',
        'Wholesaler fills trade instantly -> Captures fraction of bid-ask spread',
        'Wholesaler shares profits -> Sends fraction of spread rebate (PFOF) back to brokerage'
      ]
    }
  ]
};

export const CLASS_6: LectureClass = {
  id: 'class-6',
  moduleId: 'module-6',
  title: 'Class 6: Insurtech IoT, Parametrics, and Automated Oracle Settlements',
  subtitle: 'From Telematics to Instant Smart Contract Payouts',
  overview: 'Explains how the integration of real-time IoT feeds and secure data oracles allows insurance policies to settle instantly, bypassing adjusters.',
  learningOutcomes: [
    'Explain how vehicle telematics GPS data directly prices insurance premiums.',
    'Architect a parametric smart contract insurance workflow using secure data Oracles.',
    'Compare actuarial claims processing costs with automated parametric rules engines.'
  ],
  keyConcepts: [
    {
      term: 'Telematics GPS Data',
      definition: 'Piping active accelerometer, braking, and steering data directly into insurance risk scoring pipelines.',
      practicalUse: 'Basing auto insurance premiums on real-time safe driving metrics.'
    },
    {
      term: 'Decentralized Oracle',
      definition: 'A secure middleware network bridging authenticated real-world offline datasets (like weather logs) to automated digital contracts.',
      practicalUse: 'Removing human bias and claim filing friction from risk settlement.'
    },
    {
      term: 'Parametric Smart Contract',
      definition: 'An automated agreement that immediately releases payouts upon verification of a specific data threshold.',
      practicalUse: 'Engineering rapid relief insurance for weather, flight delays, or natural disasters.'
    }
  ],
  teachingMoves: [
    { phase: 'Parametric Coding Scenario', strategy: 'Design the programmatic flow of a parametric crop insurance trigger using NOAA weather sensor inputs.', focus: 'Designing verifiable thresholds.' },
    { phase: 'Adjuster Friction Audit', strategy: 'Map the financial and administrative costs of deploying manual property inspectors.', focus: 'Insurtech cost reduction.' }
  ],
  appliedProjectHandout: {
    title: 'Parametric Policy Data Contract (Capstone Asset #6)',
    description: 'Author the functional spec for a parametric insurance product, mapping the input datasets, trusted oracle partners, and automated payout rules.',
    reusableOutput: 'Parametric Data Schema & Oracle integration spec.',
    checklist: [
      'Identify specific weather, flight, or physical data metrics.',
      'Define the precise oracle data source (such as national databases).',
      'Map the automated payout rules and cash distribution API routes.'
    ],
    technicalSpec: 'Include a detailed analysis of systemic risks (such as oracle connection failures) and model fallback procedures.'
  },
  slides: [
    {
      title: 'Oracle Integration in Automated Contracts',
      subtitle: 'Connecting Real-World Indicator Feeds to Instant Payments',
      bullets: [
        'Contracts can only process data on their local digital ledger.',
        'Oracles bridge the physical world, piping certified sensor datasets into agreements.',
        'Settle events execute immediately upon verified indicators, bypassing claims adjusters.'
      ],
      codeSnippet: `// Core logic of a parametric insurance settlement
interface WeatherPayload { zipCode: string; tempCelsius: number; timestamp: string }

function evaluateParametricClaim(data: WeatherPayload, policy: ParametricPolicy) {
  if (data.zipCode === policy.zipCode && data.tempCelsius <= policy.freezeThresholdCelsius) {
    return {
      status: "TRIGGERED_PAYOUT",
      payoutAmount: policy.payoutAmountUSD,
      routingDetails: policy.userBankDetails
    };
  }
  return { status: "MONITORING" };
}`
    },
    {
      title: 'Vehicle Telematics and Dynamically Priced Premiums',
      subtitle: 'Ingesting IoT Accelerometer Signals to Underwrite Real-Time Driving Risk',
      bullets: [
        'Insurtech mobile software checks smartphone accelerometers to analyze driver behavior.',
        'Underwriting risk engines extract features: hard braking events, turning velocities, and driving hours.',
        'The driver safety score adjusts monthly premium prices, rewarding low-risk behaviors immediately.'
      ],
      codeSnippet: `// Hard deceleration alert threshold calculator
interface AccelerometerRecord { gravityY: number; timeSec: number }
function analyzeBrakingSafety(readings: AccelerometerRecord[]): { hardBrakesCount: number; premiumAdjustmentPercent: number } {
  const hardBrakes = readings.filter(r => r.gravityY < -0.38).length; // Decel limit
  const adjustment = hardBrakes > 3 ? 15 : (hardBrakes === 0 ? -10 : 0);
  return { hardBrakesCount: hardBrakes, premiumAdjustmentPercent: adjustment };
}`
    },
    {
      title: 'Parametric Insurance Administrative Cost Savings',
      subtitle: 'Eliminating Loss Adjustment Expenses (LAE) via Binary Decision Engines',
      bullets: [
        'Legacy indemnity insurance requires claim forms, adjuster visits, and weeks of back-and-forth.',
        'Parametric systems execute on-chain binary audits, clearing transaction wires in seconds.',
        'This drops administrative processing overhead, letting insurtechs route maximum cash back to cover client losses.'
      ],
      diagramTitle: 'Traditional Indemnity vs Parametric Claims Timelines',
      diagramData: [
        'Indemnity Rail: Crop damages -> File claim -> Adjuster inspection (3w) -> Settlement dispute (3m)',
        'Parametric Rail: Satellite reports severe drought -> Sensor oracle triggers contract -> Funds wire in 30s'
      ]
    }
  ]
};

export const CLASS_7: LectureClass = {
  id: 'class-7',
  moduleId: 'module-7',
  title: 'Class 7: Blockchain Systems, Cryptographic Settlement, and Automated Market Makers',
  subtitle: 'Decentralized Ledgers, DeFi Protocols, Stablecoin Reserves, and constant product (x * y = k) AMMs',
  overview:
    'This class introduces systems designed to operate with fewer traditional financial intermediaries by using decentralized ledgers and smart contracts. Students learn how blockchains function as distributed ledgers, and how DeFi protocols reconstruct trading and lending through smart contracts rather than centralized institutions.',
  learningOutcomes: [
    'Analyze how blockchains function as distributed ledgers and how DeFi protocols reconstruct trading and lending without traditional central intermediaries.',
    'Deconstruct the market structure of Automated Market Makers (AMMs) and calculate swaps using the constant-product pricing model (x * y = k) directly against pooled assets.',
    'Evaluate stablecoins as fiat-pegged digital assets for blockchain-based settlement speed without price volatility.',
    'Calculate slippage and impermanent loss to explain how removing intermediaries shifts complexity into protocol design and liquidity risk.'
  ],
  keyConcepts: [
    {
      term: 'Distributed Ledger & Smart Contracts',
      definition: 'A cryptographic consensus-driven database replicated across nodes where smart contracts execute self-enforcing programmatic financial agreements without central bank registry intermediaries.',
      practicalUse: 'Reconstructing atomic financial products (trading, borrowing, lending) that settle deterministically on-chain.'
    },
    {
      term: 'Automated Market Makers & Liquidity Pools',
      definition: 'A smart contract-based market structure holding token reserve pairs, allowing users to trade directly against the pool instead of matching peer-to-peer order books.',
      practicalUse: 'Enabling continuous 24/7 liquidity and instant trade execution for digital assets.'
    },
    {
      term: 'Constant-Product Model (x * y = k)',
      definition: 'The pricing formula keeping the product of two pooled asset quantities constant, dynamically adjusting price relative to trade size.',
      practicalUse: 'Calculating exact slippage parameters and trade execution costs directly against pooled assets.'
    },
    {
      term: 'Stablecoins & Volatility Mitigation',
      definition: 'Fiat-pegged digital assets backed by audited cash or short-term high-quality liquid reserves, combining cryptographic settlement speed with price stability.',
      practicalUse: 'Providing low-friction cross-border settlements and cash-preservation safe havens without Bitcoin-style price volatility.'
    },
    {
      term: 'Slippage & Impermanent Loss',
      definition: 'Slippage is the price deviation from order placement to execution. Impermanent loss is the temporary value divergence of pooled assets compared to simply holding them in a private wallet during price fluctuations.',
      practicalUse: 'Underwriting liquidity risk and calculating net returns for decentralized yield protocols.'
    }
  ],
  teachingMoves: [
    { phase: 'AMM Pool Calculation', strategy: 'Calculate the execution price of a massive trade swap, demonstrating slippage and pool rebalancing.', focus: 'Constant Product math.' },
    { phase: 'Stablecoin Audits', strategy: 'Deconstruct the reserve portfolios of major stablecoins checking for capital adequacy.', focus: 'Stablecoin reserve backing.' }
  ],
  appliedProjectHandout: {
    title: 'Decentralized Stablecoin Clearing Model (Capstone Asset #7)',
    description: 'Model a borderless commercial payments pipeline utilizing fully backed stablecoin tokens on public networks to bypass SWIFT processing rails.',
    reusableOutput: 'AMM Price Swap and Slippage Simulator.',
    checklist: [
      'Calculate exchange rates and transaction clearing times.',
      'Compare gas transaction fees with traditional wire fee margins.',
      'Detail reserve custodian and audit procedures ensuring the 1:1 fiat peg.'
    ],
    technicalSpec: 'Include the constant product mathematical formulas detailing slippage factors on large transactions.'
  },
  slides: [
    {
      title: 'Decentralized Ledgers and DeFi Protocols',
      subtitle: 'Reconstructing Financial Middlemen with Cryptographic Smart Contracts',
      bullets: [
        'Traditional finance relies on trusted centralized registries to record balances and clear transactions.',
        'Blockchains function as peer-to-peer distributed ledgers, ensuring cryptographic state consistency across an untrusted network.',
        'DeFi protocols replace clearinghouses, brokers, and central exchanges with deterministic, self-executing smart contracts.'
      ],
      codeSnippet: `// Concept of a Decentralized Lending Smart Contract execution
interface LoanState { borrower: string; collateralAmount: number; debtAmount: number }
function evaluateLiquidation(loan: LoanState, currentPrice: number): boolean {
  const healthFactor = (loan.collateralAmount * currentPrice) / loan.debtAmount;
  // If collateral value drops below 110% of debt, liquidate automatically
  return healthFactor < 1.10;
}`
    },
    {
      title: 'AMM Market Structure & Constant Product Math',
      subtitle: 'Pricing Swaps and Executing Trades Directly Against Liquidity Pools',
      bullets: [
        'Automated Market Makers (AMMs) eliminate bid-ask order matching engines in favor of unified liquidity pools.',
        'Liquidity providers deposit equal values of two assets (e.g., USD and ETH) directly into the pool contract.',
        'Trades must satisfy the constant-product pricing equation (x * y = k) directly against the pooled reserves.'
      ],
      codeSnippet: `// Constant Product AMM Swap calculation
function calculateSwapOutput(reserveX: number, reserveY: number, amountInX: number) {
  const k = reserveX * reserveY;
  const nextReserveX = reserveX + amountInX;
  const nextReserveY = k / nextReserveX;
  const amountOutY = reserveY - nextReserveY;
  const slippage = (amountInX / reserveX) - (amountOutY / reserveY);
  
  return { amountOutY, nextReserveX, nextReserveY, slippage };
}`
    },
    {
      title: 'Stablecoin Reserves and Liquidity Risk Mechanics',
      subtitle: 'Combining Blockchain Settlement Speed with Volatility Protection and Underwriting Risk',
      bullets: [
        'Fiat-pegged digital assets (stablecoins) provide 24/7 blockchain-based settlement speeds without the extreme price volatility of Bitcoin.',
        'Impermanent loss represents the risk where price shifts make holding assets more profitable than supplying them as AMM liquidity.',
        'Removing centralized intermediaries does not eliminate risk; it shifts complexity directly into protocol design and liquidity mechanics.'
      ],
      diagramTitle: 'Clearing Settlement Pipeline Comparison',
      diagramData: [
        'TradFi Stock Rail: Trade executed -> Cleared by clearinghouse (NSCC) -> Settle via custodian (DTC) in 1 day',
        'Crypto Blockchain: Signed tx broadcast -> Block mined on-chain -> Balances update instantly in 12 seconds'
      ]
    }
  ]
};

export const CLASS_8: LectureClass = {
  id: 'class-8',
  moduleId: 'module-8',
  title: 'Class 8: Regtech Compliance and Risk Control Architectures',
  subtitle: 'Designing Scalable Trust with KYC, AML, Sanctions Screening, and Real-Time Fraud Engines',
  overview:
    'This class reframes compliance as an essential system-design problem rather than a purely legal afterthought. Students study KYC, AML, sanctions screening, and real-time fraud detection as interlocking operational controls that financial products must implement from day one to scale trust and satisfy supervisory expectations.',
  learningOutcomes: [
    'Analyze customer onboarding KYC steps and sanctions screening as interlocking core controls that scalable products need from day one.',
    'Design real-time fraud detection systems that analyze behavioral, biometric, device, and transaction-velocity signals to identify suspicious activity.',
    'Examine regulatory sandboxes as supervised environments where fintech startups can test new products safely with real users.'
  ],
  keyConcepts: [
    {
      term: 'Core Compliance Controls',
      definition: 'KYC (Know Your Customer), AML (Anti-Money Laundering), and sanctions screening working together as interlocking, foundational systems.',
      practicalUse: 'Preventing illicit financial flows and establishing platform eligibility at customer onboarding.'
    },
    {
      term: 'Operational Fraud Controls',
      definition: 'Real-time detection pipelines checking user behavior, biometrics, device fingerprints, and transaction velocity.',
      practicalUse: 'Detecting and freezing high-velocity fraud vectors before funds clear out of the system.'
    },
    {
      term: 'Regulatory Sandbox',
      definition: 'A supervised, restricted environment offered by regulators where fintech firms test innovative models with real users.',
      practicalUse: 'Securing temporary regulatory relief to validate product market fit under close regulatory eyes.'
    },
    {
      term: 'Phonetic Fuzzy Matching',
      definition: 'Comparing names based on phonetic algorithms (e.g., Soundex, Levenshtein distance) rather than character-by-character matches.',
      practicalUse: 'Identifying OFAC sanctions evasion attempts bypassing standard character filters.'
    }
  ],
  teachingMoves: [
    { phase: 'Soundex Coding Challenge', strategy: 'Trace names through Levenshtein distance algorithms to show spelling bypass detection.', focus: 'Sanctions screening accuracy.' },
    { phase: 'Fraud Profile Review', strategy: 'Analyze structured transaction histories to separate standard customer habits from money laundering patterns.', focus: 'AML alert management.' }
  ],
  appliedProjectHandout: {
    title: 'Compliance & KYC Matrix (Capstone Asset #8)',
    description: 'Detail the end-to-end identity proofing, sanctions screening, and transaction surveillance framework for customer onboarding.',
    reusableOutput: 'AML & KYC Compliance Decision Tree mapping customer screening states.',
    checklist: [
      'Detail verification checks during user registration.',
      'Incorporate Soundex phonetic algorithms matching names against OFAC databases.',
      'Define exact transaction volume limits representing suspicious structuring events.'
    ],
    technicalSpec: 'Specify system rules that immediately freeze accounts and flag alerts for federal reporting compliance.'
  },
  slides: [
    {
      title: 'Compliance as a Core System Design Problem',
      subtitle: 'Building Scalable Trust through Interlocking Controls from Day One',
      bullets: [
        'Fintech compliance is not a legal afterthought; it is an active system-engineering parameter.',
        'Foundational systems—KYC, AML, sanctions screening, and fraud detection—must interlock natively.',
        'Scalable financial products require scalable trust, automated monitoring, and systemic controls to succeed.'
      ],
      codeSnippet: `// Simple Levenshtein Distance string comparison concept
function calculateLevenshteinDistance(a: string, b: string): number {
  const tmp = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));
  for (let i = 0; i <= a.length; i++) tmp[0][i] = i;
  for (let j = 0; j <= b.length; j++) tmp[j][0] = j;
  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      tmp[j][i] = Math.min(
        tmp[j - 1][i] + 1, // deletion
        tmp[j][i - 1] + 1, // insertion
        tmp[j - 1][i - 1] + indicator // substitution
      );
    }
  }
  return tmp[b.length][a.length];
}`
    },
    {
      title: 'Real-Time Operational Fraud Systems',
      subtitle: 'Analyzing Behavioral, Biometric, Device, and Velocity Signals',
      bullets: [
        'Static forms are insufficient; modern fraud engines analyze live, multidimensional event data.',
        'Systems ingest smartphone device IDs, biometric signatures, and behavioral typing speeds in real time.',
        'Transaction velocity tracking blocks smurfing and structuring patterns before funds settle.'
      ],
      codeSnippet: `// Sliding window AML structuring detector
interface AccountTx { amount: number; timeEpoch: number }
function detectStructuringPattern(txs: AccountTx[], threshold: number = 10000, daysLimit: number = 3): boolean {
  const cutoff = Date.now() - (daysLimit * 24 * 60 * 60 * 1000);
  const activePeriodSum = txs
    .filter(t => t.timeEpoch >= cutoff)
    .reduce((sum, t) => sum + t.amount, 0);
  // Alert if total transaction sum is 90% to 100% of CTR threshold
  return activePeriodSum >= threshold * 0.9 && activePeriodSum <= threshold;
}`
    },
    {
      title: 'Testing Under Supervised Regulatory Sandboxes',
      subtitle: 'Deploying Innovative Products to Real Users Safely and Legally',
      bullets: [
        'Regulatory sandboxes provide structured, supervised environments to trial brand-new fintech products.',
        'Startups run under restricted caps on transaction volumes, absolute customer sizes, and capital limits.',
        'This allows developers to collect live performance and fraud metrics while demonstrating risk controls.'
      ],
      diagramTitle: 'Automated KYC Verification Stream',
      diagramData: [
        'User signup -> Uploads document photo + Takes liveness selfie scan',
        'Document OCR -> Extracts full name, birthdate, and document MRZ characters',
        'Watchlist screen -> Checks details against OFAC registries',
        'Facial match -> Compares camera selfie vector against document portrait'
      ]
    }
  ]
};

export const CLASS_9: LectureClass = {
  id: 'class-9',
  moduleId: 'module-9',
  title: 'Class 9: Business Models & Unit Economics',
  subtitle: 'Monetization Channels, Core Margins, and 10-K-Style Financial Engineering',
  overview:
    'This class examines how a fintech company survives and thrives by analyzing revenue lines, cost structures, and scalability. Students transition toward 10-K-style analytical thinking, viewing a fintech product not just as a software application, but as a complex financial engine shaped by dependencies, regulatory pressures, and scale constraints.',
  learningOutcomes: [
    'Deconstruct major fintech monetization channels: interchange, net interest margin, SaaS fees, and AUM-based revenue.',
    'Evaluate core financial metrics including Customer Acquisition Cost (CAC), Lifetime Value (LTV), margin structure, and operational leverage.',
    'Analyze the direct impact of regulatory pressure and margin compression on a fintech venture’s long-term profitability.'
  ],
  keyConcepts: [
    {
      term: 'Fintech Revenue Streams',
      definition: 'The primary ways fintech products monetize: card interchange fees, net interest margin (NIM) on swept assets, SaaS subscription fees, and assets under management (AUM) fees.',
      practicalUse: 'Diversifying income models to avoid reliance on volatile, spend-dependent interchange loops.'
    },
    {
      term: 'LTV to CAC Ratio',
      definition: 'Dividing the customer lifetime contribution margin by total user acquisition spend (sustainable target scale is >3.0x).',
      practicalUse: 'Assessing if customer marketing budgets represent viable, profitable operations.'
    },
    {
      term: '10-K-Style Analysis',
      definition: 'Reading a fintech company as a financial engine with balance-sheet dependencies, funding costs, and operational constraints.',
      practicalUse: 'Performing due diligence on competitor platforms or preparing financial plans for venture capital audits.'
    },
    {
      term: 'Durbin Exemption Loophole',
      definition: 'US regulatory exemption letting community banks with under $10 billion in assets collect uncapped debit swipe interchange cuts.',
      practicalUse: 'Partnering with small chartered banks to secure higher margins from consumer card swipes.'
    }
  ],
  teachingMoves: [
    { phase: 'Unit Economics Math', strategy: 'Work through an interactive spreadsheet calculating LTV and CAC across varying retention factors.', focus: 'Fintech unit profitability.' },
    { phase: 'Durbin Loop Case Study', strategy: 'Deconstruct neobank financial statements to trace how much revenue originates from card swipe cuts.', focus: 'BaaS revenue models.' }
  ],
  appliedProjectHandout: {
    title: 'Venture Unit Economics Ledger (Capstone Asset #9)',
    description: 'Build a unit economics model for a fintech venture, detailing customer acquisition spends, interchange loops, subscription margins, and lifetime value projections.',
    reusableOutput: 'Fintech Unit Economics Ledger & LTV:CAC Sensitivity Table.',
    checklist: [
      'Calculate customer acquisition costs (CAC) across marketing spend paths.',
      'Model the interchange loop card swipe margins.',
      'Demonstrate customer lifetime value (LTV) models over a 36-month timeline.'
    ],
    technicalSpec: 'Include detailed sensitivity tables checking how LTV metrics adjust as customer churn rate varies.'
  },
  slides: [
    {
      title: 'Fintech Monetization Channels',
      subtitle: 'The Core Revenue Engines: Interchange, NIM, SaaS, and AUM',
      bullets: [
        'Interchange: Generating transactional cuts from consumer debit or credit card swipes.',
        'Net Interest Margin (NIM): Earning yield spreads by sweeping idle customer deposits into interest-bearing partner accounts.',
        'SaaS & AUM Tiers: Capturing recurring subscription fees or charging small percentage cuts on overall managed wealth.'
      ],
      codeSnippet: `// Concept of Customer Lifetime Value (LTV) Math
interface CustomerMetrics {
  averageMonthlyRevenue: number;
  grossMarginPercent: number;
  monthlyChurnRate: number; // e.g., 0.02 is 2% monthly churn
}

function calculateCustomerLTV(metrics: CustomerMetrics): number {
  const monthlyContributionMargin = metrics.averageMonthlyRevenue * metrics.grossMarginPercent;
  // LTV = Contribution Margin / Churn Rate
  return monthlyContributionMargin / metrics.monthlyChurnRate;
}`
    },
    {
      title: '10-K-Style Thinking: The Financial Engine',
      subtitle: 'Reading Fintech Products as Balance-Sheet Structures with Constraints',
      bullets: [
        'Fintech applications are not just user interfaces; they are operational pipelines wrapping capital flow.',
        'Venture success requires analyzing cost of capital, treasury operations, and transaction loss reserves.',
        'Students must evaluate margin structures and balance sheet dependencies to trace risk exposures.'
      ],
      codeSnippet: `// Modeling ARR under churn parameters
function projectAnnualRecurringRevenue(subscribers: number, monthlyFee: number, annualChurnRate: number): number {
  const baseArr = subscribers * monthlyFee * 12;
  return baseArr * (1.0 - annualChurnRate); // Net forecasted revenue
}`
    },
    {
      title: 'Regulatory Pressures and Core Metrics',
      subtitle: 'Managing CAC, LTV, and Margin Compression over Scaling Cycles',
      bullets: [
        'Regulatory shifts (like Durbin enforcement caps or broker-dealer rule updates) can instantly compress margins.',
        'CAC must bundle all onboarding costs, identity checks, and fraud recovery allocations.',
        'Healthy companies maintain an operational leverage curve where software scales faster than headcount.'
      ],
      diagramTitle: 'Fintech User Acquisition Funnel',
      diagramData: [
        'Ad Impression -> CPM cost of $15 per thousand views',
        'Store Click -> Click-through conversion rate of 8%',
        'Document KYC Completed -> Conversion of clicks to identity verified account: 12%',
        'Funded Account -> CAC matches total ad spend divided by funded accounts'
      ]
    }
  ]
};

export const CLASS_10: LectureClass = {
  id: 'class-10',
  moduleId: 'module-10',
  title: 'Class 10: Regulation & Risk Landscape',
  subtitle: 'Regulatory Perimeters, Sponsor Banking Dependencies, and State money transmitter licenses (MTLs)',
  overview:
    'This class studies the regulatory agencies, licenses, and risk frameworks that define the legal perimeter of fintech. Students learn that legal structure is not separate from product design; it fundamentally shapes what a financial venture can launch, where it can operate, and how it must manage risks.',
  learningOutcomes: [
    'Analyze the jurisdictional, supervisory, and regulatory boundaries of key agencies including the SEC, FDIC, OCC, and CFPB.',
    'Evaluate sponsor-bank partnerships as mechanisms to expand capabilities, identifying their inherent operational and regulatory dependencies.',
    'Map when money-movement and custody activities trigger licensing obligations such as State Money Transmitter Licenses (MTLs).'
  ],
  keyConcepts: [
    {
      term: 'Regulatory Perimeter',
      definition: 'The boundaries determining which regulatory frameworks and agencies (SEC, FDIC, OCC, CFPB) govern specific financial activities.',
      practicalUse: 'Structuring product features specifically to comply with target federal agency rules.'
    },
    {
      term: 'Sponsor-Bank Dependencies',
      definition: 'A partnership model letting un-chartered tech platforms deliver FDIC-insured deposit products, introducing significant operational and sub-ledger synchronization risks.',
      practicalUse: 'Managing tri-party compliance risks and preventing ledger failures during partner core audits.'
    },
    {
      term: 'Money Transmitter License (MTL)',
      definition: 'State-by-state statutory licensing triggered when a tech platform holds, receives, or moves customer cash directly on its own books.',
      practicalUse: 'Filing and maintaining necessary state approvals when operating payment gateways, remittance services, or stablecoins.'
    },
    {
      term: 'Strategic Legal Integration',
      definition: 'Treating regulatory compliance and legal structuring as an active, integrated component of the technical product design.',
      practicalUse: 'Preventing severe enforcement shutdowns by aligning code, custody, and licensing from day one.'
    }
  ],
  teachingMoves: [
    { phase: 'Compliance Mapping Session', strategy: 'Design the regulatory map for a hypothetical fintech launch (stablecoin, neobank, or credit card).', focus: 'Determining necessary licensing.' },
    { phase: 'Surety Bond Calculations', strategy: 'Verify the financial capital reserves required to purchase surety bonds across separate state jurisdictions.', focus: 'MTL startup capital constraints.' }
  ],
  appliedProjectHandout: {
    title: 'Compliance Stack Blueprint (Capstone Asset #10)',
    description: 'Design the regulatory and state money transmitter licensing (MTL) requirements matching your fintech platform concept.',
    reusableOutput: 'Regulatory compliance matrix mapping state jurisdictions and permissible reserves.',
    checklist: [
      'List target states for product launch with specific filing fees.',
      'Detail surety bond collateral requirements per state jurisdiction.',
      'Define the permissible asset reserve strategy ensuring deposit liquidity.'
    ],
    technicalSpec: 'Specify system controls matching Circle or Stripe-style audits to prove compliance.'
  },
  slides: [
    {
      title: 'Navigating Regulatory Bodies: SEC, FDIC, OCC, and CFPB',
      subtitle: 'Mapping Agency Jurisdictions and Legal Perimeters in Fintech',
      bullets: [
        'OCC: Grants federal charters, supervising traditional banks and depository structures.',
        'FDIC: Insures customer bank deposits and monitors bank partner safety and soundness.',
        'SEC & CFPB: SEC regulates securities and capital market instruments, while CFPB enforces consumer protection laws.'
      ],
      codeSnippet: `// Permissible Reserves Audit Concept
interface SovereignLedger { clientLiabilities: number; cashReserves: number; tbillsReserves: number }

function verifyPermissibleReserves(ledger: SovereignLedger): { compliant: boolean; reserveRatio: number } {
  const liquidAssets = ledger.cashReserves + ledger.tbillsReserves;
  const ratio = liquidAssets / ledger.clientLiabilities;
  return {
    compliant: ratio >= 1.0, // Permissible reserves must match liabilities 100%
    reserveRatio: ratio
  };
}`
    },
    {
      title: 'Sponsor Banking & Partner Dependencies',
      subtitle: 'Leveraging Chartered Bank Core Systems while Managing Operational Risks',
      bullets: [
        'Sponsor banks let tech startups bypass the multi-year process of acquiring an OCC national bank charter.',
        'This partnership creates absolute technical and operational dependencies on the sponsor bank core systems.',
        'Platform code must synchronize ledgers perfectly to ensure consumer funds remain secure and auditable.'
      ],
      codeSnippet: `// Programmatic SAR trigger checking velocity limits
interface MoneyTransfer { amount: number; senderCountry: string; isSanctionedRisk: boolean }
function evaluateFinCenReporting(tx: MoneyTransfer): { fileSar: boolean; reason: string } {
  if (tx.isSanctionedRisk) {
    return { fileSar: true, reason: "OFAC Watchlist High-Risk Match Triggered" };
  }
  if (tx.amount >= 10000) {
    return { fileSar: true, reason: "Transaction exceeds currency reporting thresholds" };
  }
  return { fileSar: false, reason: "Monitoring flow" };
}`
    },
    {
      title: 'Money Transmitter Licenses & Permissible Reserves',
      subtitle: 'Satisfying State Rules on Fund Custody, Net Worth, and Asset Backing',
      bullets: [
        'Directly transmitting or storing customer cash triggers Money Transmitter Licensing (MTL) rules in most US states.',
        'Money transmitters are legally required to hold 1:1 permissible asset reserves (like cash or short-term Treasuries) against liabilities.',
        'Legal structure is not separate from product design; it determines target features, launch regions, and operating rules.'
      ],
      diagramTitle: 'Omnibus FBO Pass-Through Structure',
      diagramData: [
        'Retail Customer -> Places $100 checking balance in mobile neobank',
        'Neobank Sub-Ledger -> Logs ownership records mapping user balance',
        'Sponsor depository Bank -> Receives bulk $100 deposit pooled in Omnibus account',
        'FDIC Protection -> Extends $250,000 coverage down to individual sub-ledger owners'
      ]
    }
  ]
};

export const CLASS_11: LectureClass = {
  id: 'class-11',
  moduleId: 'module-11',
  title: 'Class 11: Building Fintech Products',
  subtitle: 'Distributed Transaction Integrity, API reconciliation, and Double-Entry Safeguards',
  overview:
    'This class turns the curriculum toward systems design, reliability, and operational correctness in financial software engineering. Students analyze why standard software practices are insufficient for moving capital, studying double-entry ledger databases, real-time API reconciliation, and idempotency as critical architectural safeguards.',
  learningOutcomes: [
    'Explain why balanced double-entry ledgering is an absolute technical invariant for consistent financial state.',
    'Implement multi-party API reconciliation engines that detect and resolve drift when internal ledgers, partner APIs, and external rails fall out of sync.',
    'Design robust idempotency layers in payment and trading systems to guarantee that retries never trigger duplicate charges, duplicate orders, or inconsistent balances.',
    'Architect distributed transactions using Saga patterns to handle asynchronous failures, automatic retries, and event-ordering constraints across decoupled networks.'
  ],
  keyConcepts: [
    {
      term: 'Double-Entry Invariant',
      definition: 'An immutable ledger database design where every transaction consists of balancing debit and credit entries, ensuring the absolute equation of Assets = Liabilities + Equity.',
      practicalUse: 'Preventing balance drift and ensuring that no financial entry can be written without a matching source or destination.'
    },
    {
      term: 'API Reconciliation',
      definition: 'The automated process of comparing internal database records against partner bank core ledgers and network clearing statements to flag transaction variances.',
      practicalUse: 'Detecting and resolving ledger drift caused by system timeouts or delayed batch clears.'
    },
    {
      term: 'Idempotency Guarantee',
      definition: 'Designing API endpoints to return the exact same response for identical request payloads, preventing duplicate writes on retries.',
      practicalUse: 'Ensuring shaky mobile network disconnects and repeated client button-taps do not charge a user twice.'
    },
    {
      term: 'Distributed Saga Pattern',
      definition: 'A microservice coordinator pattern that executes local transactions in sequence, triggering compensating rollback steps if any segment fails.',
      practicalUse: 'Ensuring ultimate eventual consistency across decoupled third-party payment rails.'
    }
  ],
  teachingMoves: [
    { phase: 'Double-Entry SQL Schema', strategy: 'Design a SQL table schema with foreign keys mapping balancing credit and debit rows.', focus: 'Relational data integrity.' },
    { phase: 'Idempotency Testing', strategy: 'Simulate a timed-out API call that retries three times to verify the server handles the key without double-billing.', focus: 'Payment pipeline reliability.' }
  ],
  appliedProjectHandout: {
    title: 'Technical Product Spec (Capstone Asset #11)',
    description: 'Detail the distributed transaction flow, SQL schemas, and idempotency checking logic for a credit payment engine.',
    reusableOutput: 'Balanced transaction database schema and API idempotency sequence spec.',
    checklist: [
      'Write SQL table definitions showing double-entry entries.',
      'Trace the system sequence diagram handling a network timeout retry.',
      'Define compensating transaction flows using Saga principles.'
    ],
    technicalSpec: 'Specify system rules that prevent database deadlock locks during massive concurrent payment processing.'
  },
  slides: [
    {
      title: 'Ledgers, Invariants, and Reconciliation',
      subtitle: 'Maintaining Mathematical Core Correctness when External Systems Drift',
      bullets: [
        'Traditional column updates (balance = balance + X) are forbidden in financial systems due to poor auditability.',
        'Double-entry ledgers treat state as an immutable stream of balancing credits and debits.',
        'Reconciliation engines must run continuously to detect when partner APIs or legacy rails drift out of sync.'
      ],
      codeSnippet: `// Example of a ledger reconciliation loop checking for record drift
interface LedgerEntry { txId: string; amount: number }
function reconcileStatements(internalLedger: LedgerEntry[], bankStatement: LedgerEntry[]): LedgerEntry[] {
  const bankMap = new Map(bankStatement.map(e => [e.txId, e.amount]));
  // Return entries that have a mismatch or are missing in bank logs
  return internalLedger.filter(entry => {
    const bankAmt = bankMap.get(entry.txId);
    return bankAmt === undefined || bankAmt !== entry.amount;
  });
}`
    },
    {
      title: 'API Idempotency Layers',
      subtitle: 'Preventing Duplicate Transactions and Account Double-Billing',
      bullets: [
        'Idempotency is an essential safeguard in transaction engineering, not an optional convenience.',
        'Shaky mobile connections often cause API requests to timeout even if they successfully executed on the server.',
        'Servers check the unique idempotency key in the cache; if it exists, they return the cached receipt instead of retrying.'
      ],
      codeSnippet: `// Idempotency check logic concept
class IdempotencyGuard {
  private keyStore = new Set<string>();
  public checkAndRegister(key: string): boolean {
    if (this.keyStore.has(key)) {
      return false; // Key was already processed, reject retry
    }
    this.keyStore.add(key);
    return true; // Key registered successfully, safe to proceed
  }
}`
    },
    {
      title: 'Sagas, Event Ordering, and Asynchronous Failures',
      subtitle: 'Coordinating Transaction Consistency Across Decoupled Payment Networks',
      bullets: [
        'ACID transactions cannot lock tables across external APIs or legacy bank networks.',
        'Sagas solve this by executing local steps, rolling back with compensating steps if downstream steps fail.',
        'System design must explicitly handle asynchronous failures, message retries, and out-of-order events.'
      ],
      diagramTitle: 'Double-Entry Database Schema Mapping',
      diagramData: [
        'Transaction Journal -> Generates unique auto-incrementing journal ID record',
        'Debits Record -> Logs $100 debit row linked to sender account ledger UUID',
        'Credits Record -> Logs $100 credit row linked to recipient account ledger UUID',
        'Validation Audit -> Confirms total sum(debits) - sum(credits) == 0 before commit'
      ]
    }
  ]
};

export const CLASS_12: LectureClass = {
  id: 'class-12',
  moduleId: 'module-12',
  title: 'Class 12: Capstone Project Workshop',
  subtitle: 'Venture Blueprint Construction, Due Diligence Auditing, and Milestone Reviews',
  overview:
    'This culminating Capstone Workshop requires students to synthesize the entire course into a coherent, production-grade fintech venture blueprint. Operating as a structured build-and-review session with interactive milestones, peer critiques, and refinement cycles, students must design and defend their core strategy, flow-of-funds architecture, and regulatory compliance plan.',
  learningOutcomes: [
    'Synthesize course principles into a full, coherent fintech venture blueprint that integrates strategy, monetization, systems design, and regulatory planning.',
    'Deconstruct and map a precise user problem, product wireframe flow, and detailed flow-of-funds custody path.',
    'Defend a venture concept under institutional due-diligence review, validating its monetization logic, database architecture, and regulatory viability.'
  ],
  keyConcepts: [
    {
      term: 'Fintech Venture Blueprint',
      definition: 'A complete, integrated strategic document detailing product flows, monetization math, system architecture, and regulatory licensing paths.',
      practicalUse: 'Presenting a validated, bank-ready proposal to secure sponsor relationships and early venture funding.'
    },
    {
      term: 'Flow of Funds Diagram',
      definition: 'A step-by-step schematic tracing exactly which bank accounts, ledgers, and rails hold custody and move capital during a payment event.',
      practicalUse: 'Demonstrating operational risk boundaries and regulatory compliance pathways to bank underwriters.'
    },
    {
      term: 'Due Diligence Defense',
      definition: 'An analytical review simulating VC audits where creators must defend their monetization sustainability, technical integrity, and regulatory perimeter alignment.',
      practicalUse: 'Ensuring your startup idea is mathematically, legally, and technically defensible before launch.'
    },
    {
      term: 'Iterative Refinement Workshop',
      definition: 'A structured studio format utilizing defined project milestones, constructive peer critiques, and iterative refinement cycles.',
      practicalUse: 'Gathering expert feedback to polish and mature product layouts, systems logic, and compliance strategies.'
    }
  ],
  teachingMoves: [
    { phase: 'Flow of Funds Mapping', strategy: 'Map the flow of funds for a hypothetical neobank account, checking custody boundaries.', focus: 'Designing clear ledger lines.' },
    { phase: 'Venture Pitch Rehearsal', strategy: 'Peer review and audit pitch models checking for compliance, economic viability, and engineering depth.', focus: 'Fintech program sustainability.' }
  ],
  appliedProjectHandout: {
    title: 'Graduate Venture Proposal & Deck (Capstone Final)',
    description: 'Build the master venture deck combining product economics, system architectures, compliance structures, and flow-of-funds diagrams.',
    reusableOutput: 'Venture Proposal & Flow of Funds Architecture.',
    checklist: [
      'Include a detailed Flow of Funds diagram detailing clearing/settlement custody.',
      'Provide a complete unit economics ledger proving long-term LTV viability.',
      'Outline the compliance framework (such as partner sponsor banks or MTL plans).'
    ],
    technicalSpec: 'Include a detailed analysis of operational risks, system fallback procedures, and regulatory launch steps.'
  },
  slides: [
    {
      title: 'Synthesizing the Venture Blueprint',
      subtitle: 'Constructing the Complete Strategic, Technical, and Compliance Proposal',
      bullets: [
        'A viable fintech product requires perfect alignment of strategy, engineering, and regulation.',
        'The capstone workspace combines user problem identification, monetization models, and compliance plans.',
        'Students must defend every technical decision, including ledger choice, idempotency keys, and reconciliation frequencies.'
      ],
      codeSnippet: `// Flow of funds step routing concept
interface FundsFlowStep {
  step: number;
  sourceAccount: string;
  destinationAccount: string;
  settlementRail: 'ach' | 'wire' | 'fednow' | 'card_network';
  custodianBank: string;
  estimatedSettlementDelayHours: number;
}`
    },
    {
      title: 'Institutional Due Diligence Standards',
      subtitle: 'Simulating VC Partner Audits and Bank Compliance Soundness Checks',
      bullets: [
        'Due diligence is not a marketing pitch; it requires absolute technical and legal defensibility.',
        'Investors audit the software architecture for double-entry invariants, security posture, and data integrity.',
        'Regulators check if money movement rules trigger Money Transmitter state licensures or SEC registrations.'
      ],
      codeSnippet: `// Verification of bank onboarding readiness
interface ProgramAudit { amlPolicySigned: boolean; fundFlowMAPPED: boolean; techDiligencePASSED: boolean }
function checkSponsorLaunchApproval(audit: ProgramAudit): boolean {
  // All parameters must pass before sponsor banks sign off
  return audit.amlPolicySigned && audit.fundFlowMAPPED && audit.techDiligencePASSED;
}`
    },
    {
      title: 'Structured Build-and-Review Cycles',
      subtitle: 'Polishing Financial Concepts Through Milestones, Critiques, and Revisions',
      bullets: [
        'The Capstone operates as an interactive workshop rather than a standard, passive lecture session.',
        'Milestones structure progress from user problem definitions to full operational flowcharts.',
        'Rigorous critiques from peers and instructors push strategies from simple ideas into production-ready blueprints.'
      ],
      diagramTitle: 'Venture Capital Capital Deployment Pipeline',
      diagramData: [
        'Capital Raised -> Seed financing of $2,000,000 pooled in corporate bank account',
        'Integration Phase -> API setup, security audits, and compliance officers ($600k)',
        'Marketing Launch -> Customer acquisition promos and card printing ($900k)',
        'Operating Buffer -> Cash reserve remaining to reach break-even scale ($500k)'
      ]
    }
  ]
};

export const CLASS_13: LectureClass = {
  id: 'class-13',
  moduleId: 'module-13',
  title: 'Class 13: AI & Machine Learning in Finance',
  subtitle: 'Credit ML, Fraud Detection, Algorithmic Trading, NLP, and Ethical AI Governance',
  overview:
    'This class explores how artificial intelligence and machine learning are being deployed across the financial industry — from credit underwriting and fraud detection to algorithmic trading and NLP-powered compliance. Students learn the technical architectures, regulatory constraints, and ethical considerations that distinguish responsible financial AI from black-box risk.',
  learningOutcomes: [
    'Compare ML model types used in credit underwriting (XGBoost, neural networks, ensembles) and explain why feature interpretability is a compliance requirement.',
    'Design a multi-layer fraud detection pipeline combining rules engines, supervised ML, and unsupervised anomaly detection.',
    'Apply SHAP and LIME explainability techniques to audit ML credit decisions for ECOA compliance.',
    'Evaluate systemic risks from algorithmic trading and the regulatory response (circuit breakers, best execution rules).',
    'Analyze the limitations and risks of deploying LLMs in regulated financial environments.'
  ],
  keyConcepts: [
    {
      term: 'ML Model Governance',
      definition: 'The framework of policies, documentation, and audits ensuring ML models are explainable, fair, and compliant with financial regulations.',
      practicalUse: 'Maintaining model risk management documentation required by Fed SR 11-7 and EU AI Act.'
    },
    {
      term: 'SHAP (SHapley Additive exPlanations)',
      definition: 'A game-theoretic approach to ML interpretability that calculates each features marginal contribution to a specific prediction.',
      practicalUse: 'Providing legally sufficient adverse action reasons (e.g., "denied due to cash flow volatility contributing -15 points").'
    },
    {
      term: 'SMOTE (Synthetic Minority Oversampling)',
      definition: 'A technique generating synthetic examples of rare events (fraud) by interpolating between existing examples in feature space.',
      practicalUse: 'Training fraud detection models on balanced datasets when fraud represents <0.1% of transactions.'
    },
    {
      term: 'Circuit Breakers',
      definition: 'Automated market-wide trading halts triggered when the S&P 500 drops by preset thresholds (7%, 13%, 20%).',
      practicalUse: 'Preventing cascading algorithmic selling during flash crashes like the 2010 event.'
    }
  ],
  teachingMoves: [
    { phase: 'Credit ML Audit', strategy: 'Inspect XGBoost feature importance rankings and check for prohibited proxy variables like zip code.', focus: 'Fair lending compliance.' },
    { phase: 'Fraud Pipeline Design', strategy: 'Design a three-layer fraud detection system with rules, supervised ML, and anomaly detection.', focus: 'Real-time decision architecture.' },
    { phase: 'AI Ethics Debate', strategy: 'Debate whether LLM-powered financial advice should require the same licenses as human advisors.', focus: 'Regulatory boundary of AI.' }
  ],
  appliedProjectHandout: {
    title: 'AI Model Governance & Fairness Audit (Capstone Asset #13)',
    description: 'Document a credit underwriting ML model including feature engineering, explainability methodology, and disparate impact testing results.',
    reusableOutput: 'Model Governance Document with SHAP analysis and AIR audit.',
    checklist: [
      'Define feature set with rationale for each variable and explicit check for prohibited proxies.',
      'Implement SHAP analysis on a sample of denied applications and generate adverse action reasons.',
      'Run Adverse Impact Ratio (AIR) audit across protected demographic groups.',
      'Document model validation methodology and human-in-the-loop thresholds.'
    ],
    technicalSpec: 'Document must satisfy both EU AI Act high-risk AI requirements and Fed SR 11-7 model risk management guidance.'
  },
  slides: [
    {
      title: 'ML in Credit Underwriting',
      subtitle: 'From FICO to feature-engineered machine learning decisions',
      bullets: [
        'XGBoost models ingest hundreds of features from bank transaction data and generate risk scores in under 200ms.',
        'Feature engineering transforms raw transactions into predictive metrics: cash flow volatility, deposit consistency, utilization trends.',
        'ECOA requires specific adverse action reasons — favoring interpretable models like XGBoost over black-box neural networks.',
        'Model governance docs must include feature definitions, training data demographics, and disparate impact audits.'
      ],
      exampleCard: {
        title: 'XGBoost vs Neural Networks for Credit',
        description: 'Why interpretability wins in regulated lending.',
        example: 'XGBoost: "Denied because cash flow volatility contributed -15 points and DTI contributed -12 points." Neural Network: "Denied — model score 0.42."',
        explanation: 'Regulators require specific, actionable reasons for denial. Tree-based models provide feature importance; neural networks require post-hoc explainability tools like SHAP or LIME.'
      }
    },
    {
      title: 'The Three-Layer Fraud Detection Stack',
      subtitle: 'Rules, supervised ML, and unsupervised anomaly detection',
      bullets: [
        'Layer 1: Deterministic rules catch obvious fraud in sub-50ms (velocity checks, geographic anomalies, CVV mismatches).',
        'Layer 2: Gradient boosting models score every transaction on a 0-100 fraud probability scale, trained on historical confirmed fraud.',
        'Layer 3: Autoencoder neural networks learn each users normal spending patterns and flag deviations, catching novel fraud types.',
        'SMOTE and cost-sensitive training address the extreme class imbalance (fraud is <0.1% of transactions).'
      ],
      codeSnippet: `// Multi-layer fraud scoring pipeline concept
interface Transaction { amount: number; userId: string; merchant: string; location: string; deviceId: string }
function scoreFraudRisk(tx: Transaction, userProfile: UserProfile): { score: number; layer: string; action: 'APPROVE' | 'VERIFY' | 'BLOCK' } {
  if (tx.amount > userProfile.avgDaily * 3) return { score: 90, layer: 'Rules', action: 'VERIFY' };
  const mlScore = fraudModel.predict(tx); // Layer 2: Gradient boosting
  if (mlScore > 0.9) return { score: mlScore, layer: 'ML', action: 'BLOCK' };
  const anomalyScore = autoencoder.reconstructionError(tx); // Layer 3
  if (anomalyScore > 3.0) return { score: anomalyScore, layer: 'Anomaly', action: 'VERIFY' };
  return { score: mlScore, layer: 'ML', action: 'APPROVE' };
}`
    },
    {
      title: 'Algorithmic Trading & Systemic Risk',
      subtitle: 'How HFT, market making, and flash crashes work',
      bullets: [
        'Algorithmic trading now accounts for 70%+ of US equity volume, running on co-located servers measuring latency in microseconds.',
        'Strategies range from simple moving-average crossovers to pairs trading and statistical arbitrage.',
        'The 2010 Flash Crash showed how a single large order can trigger cascading algorithmic sell orders, dropping the Dow 1,000 points in 36 minutes.',
        'Circuit breakers pause trading at 7%, 13%, and 20% S&P 500 declines to prevent cascading algorithmic failures.'
      ],
      diagramTitle: 'Flash Crash Cascade Sequence (May 6, 2010)',
      diagramData: [
        'Large institutional sell order executed -> 75,000 E-mini S&P 500 futures contracts sold in 20 minutes',
        'HFT algorithms detect price decline -> Begin selling and withdrawing liquidity',
        'Sell pressure accelerates -> Cross-asset selling spreads to individual stocks',
        'Dow drops 998 points -> Market-wide circuit breakers trigger, stabilizing prices',
        'Recovery -> Prices rebound most losses within 30 minutes; SEC implements kill-switch rules'
      ]
    }
  ]
};

export const CLASS_14: LectureClass = {
  id: 'class-14',
  moduleId: 'module-14',
  title: 'Class 14: Embedded Finance & The API Economy',
  subtitle: 'Platform Payments, Embedded Lending, API Security, and Webhook Architecture',
  overview:
    'This class examines the fastest-growing segment of fintech: the integration of financial services into non-financial platforms. Students study the API architectures, revenue models, and regulatory boundaries that define embedded finance, from marketplace payments to in-app lending and insurance bundling.',
  learningOutcomes: [
    'Map the flow of funds in a marketplace payment system and design the API contract for split payments.',
    'Evaluate the unit economics of embedded lending vs. traditional point-of-sale credit.',
    'Design a production-grade webhook delivery system with retry logic, idempotency, and signature verification.',
    'Analyze the regulatory boundary between enhancing user experience and engaging in unlicensed banking.'
  ],
  keyConcepts: [
    {
      term: 'Embedded Finance',
      definition: 'The integration of financial services (payments, lending, insurance, banking) into non-financial platforms via APIs.',
      practicalUse: 'Enabling any platform to offer financial products without becoming a regulated financial institution.'
    },
    {
      term: 'Stripe Connect Model',
      definition: 'An API platform providing marketplace payment infrastructure: seller accounts, KYC, payment splitting, and automated payouts.',
      practicalUse: 'Launching platform payments in days instead of months, with built-in compliance for KYC and tax reporting.'
    },
    {
      term: 'Webhook Signature Verification',
      definition: 'Cryptographic signing of HTTP callback payloads using HMAC-SHA256 so receivers can verify authenticity.',
      practicalUse: 'Ensuring financial event notifications (payment received, transfer failed) are genuine and unmodified in transit.'
    }
  ],
  teachingMoves: [
    { phase: 'Marketplace Flow Mapping', strategy: 'Diagram the complete flow of funds for a ride-sharing platform from rider payment to driver payout.', focus: 'Payment splitting and settlement timing.' },
    { phase: 'Webhook Architecture Design', strategy: 'Design a webhook delivery system with exponential backoff, dead letter queues, and signature verification.', focus: 'Reliability in financial APIs.' }
  ],
  appliedProjectHandout: {
    title: 'Embedded Finance API Contract (Capstone Asset #14)',
    description: 'Design the API specification, flow-of-funds diagram, and webhook architecture for an embedded payments platform.',
    reusableOutput: 'Embedded Payments API Contract with webhook reliability specification.',
    checklist: [
      'Define the flow of funds: how money moves from buyer to platform to seller, including settlement timing.',
      'Write the API contract for split payment creation, with idempotency key requirements.',
      'Design the webhook system: event types, retry strategy with exponential backoff, dead letter queue, and signature verification.',
      'Document the KYC onboarding flow and regulatory compliance boundary.'
    ],
    technicalSpec: 'API must support at-least-once webhook delivery with exponential backoff (1s, 10s, 100s, 1000s) and dead letter queue after 10 failures.'
  },
  slides: [
    {
      title: 'Marketplace Payments Architecture',
      subtitle: 'The flow of funds from buyer to platform to seller',
      bullets: [
        'The platform collects payment from the buyer via card or ACH, often through Stripe or Braintree.',
        'The platform deducts its commission (e.g., 25% for Uber, 15% for Airbnb) before sending funds to the seller.',
        'Seller payouts occur via ACH (2-3 days), instant card payout (fees apply), or real-time payment rails.',
        'Tax compliance requires 1099-K reporting for sellers exceeding $600 in transactions annually.'
      ],
      diagramTitle: 'Ride-Sharing Payment Flow',
      diagramData: [
        'Rider pays $20 via credit card -> Stored in Stripe platform account',
        'Uber platform deducts $5 commission (25% fee) -> Recorded as platform revenue',
        'Stripe Connect routes $15 to driver sub-ledger -> Driver balance updated instantly',
        'Driver requests payout -> ACH to driver bank account (arrives in 1-2 business days)'
      ]
    },
    {
      title: 'Embedded Lending Unit Economics',
      subtitle: 'Why platforms can lend profitably where banks cannot',
      bullets: [
        'Platforms have proprietary transaction data (sales history, tenure, revenue consistency) that predicts repayment better than FICO.',
        'Amazon Lending charges 6-16% APR with under 3% default rates — significantly lower than traditional small business lending.',
        'Repayment is collected automatically as a % of future sales, reducing collection costs to near zero.',
        'The data advantage means platforms can lend to thin-file customers who would be rejected by traditional banks.'
      ],
      exampleCard: {
        title: 'The Data Advantage',
        description: 'Why Amazon knows more about a sellers credit risk than a bank does.',
        example: 'Amazon sees: daily sales, inventory turns, return rate, customer satisfaction, fulfillment speed. Bank sees: FICO score of 620, no prior business loan.',
        explanation: 'Platforms observe actual business performance in real-time. This data is far more predictive of repayment than traditional credit bureau data, enabling profitable lending to previously "unscoreable" borrowers.'
      }
    },
    {
      title: 'Financial API Reliability Patterns',
      subtitle: 'Idempotency, webhooks, and security in production financial systems',
      bullets: [
        'Idempotency keys (UUIDs in HTTP headers) prevent duplicate charges when clients retry timed-out requests.',
        'Webhooks deliver financial event notifications with at-least-once guarantees, exponential backoff, and dead letter queues.',
        'HMAC-SHA256 signature verification ensures webhook payloads are authentic and unmodified.',
        'Mutual TLS (mTLS) is increasingly required for regulatory API connections (UK Open Banking, EU PSD2).'
      ],
      codeSnippet: `// Webhook delivery with exponential backoff
interface WebhookDelivery { url: string; payload: object; signature: string; attempt: number }
async function deliverWithRetry(delivery: WebhookDelivery, maxAttempts = 10): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(delivery.url, { method: 'POST', body: JSON.stringify(delivery.payload), headers: { 'X-Signature': delivery.signature } });
      if (response.ok) return true;
    } catch {}
    await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000)); // Exponential backoff: 1s, 2s, 4s, 8s...
  }
  // Move to dead letter queue for manual inspection
  await deadLetterQueue.enqueue(delivery);
  return false;
}`
    }
  ]
};

export const CLASS_15: LectureClass = {
  id: 'class-15',
  moduleId: 'module-15',
  title: 'Class 15: Open Banking, Data Rights & Financial Inclusion',
  subtitle: 'PSD2, Section 1033, Consumer Data Rights, and Bridging the Inclusion Gap',
  overview:
    'This class examines the global movement to give consumers control over their financial data. Students study the regulatory frameworks (PSD2 in Europe, Section 1033 in the US, CDR in Australia), the technical architecture of Open Banking APIs, and the profound implications for financial inclusion and consumer empowerment.',
  learningOutcomes: [
    'Compare Open Banking regulatory frameworks across the UK, EU, US, and Australia — including their scope, enforcement mechanisms, and market maturity.',
    'Explain the technical architecture of OAuth 2.0-based Open Banking APIs, including scoped consent, token revocation, and liability allocation.',
    'Analyze how Open Banking enables cash-flow underwriting for credit-invisible populations and evaluate the associated privacy risks.',
    'Articulate the argument for data portability as a civil rights issue in financial services.'
  ],
  keyConcepts: [
    {
      term: 'PSD2 / PSD3',
      definition: 'EU Payment Services Directive requiring banks to open customer data to authorized third parties via standardized APIs, creating AISP and PISP regulated entity categories.',
      practicalUse: 'Enabling account aggregation services and "Pay by Bank" checkout across all EU member states with a single regulatory framework.'
    },
    {
      term: 'Section 1033 (Dodd-Frank)',
      definition: 'The proposed CFPB rule implementing consumers right to access and share their financial data through standardized, secure APIs.',
      practicalUse: 'Establishing a US Open Banking framework that will phase out screen scraping and require API-based data access.'
    },
    {
      term: 'AISP vs PISP',
      definition: 'Account Information Service Providers (read access to transaction data) vs Payment Initiation Service Providers (write access to initiate payments).',
      practicalUse: 'AISPs power budgeting and credit scoring apps; PISPs enable lower-cost "Pay by Bank" checkout alternatives to card networks.'
    },
    {
      term: 'Financial Inclusion Technology',
      definition: 'Tech solutions that extend financial services to unbanked and underbanked populations, often leveraging alternative data and mobile money infrastructure.',
      practicalUse: 'M-Pesa in Africa, cash-flow underwriting for credit-invisible Americans, and mobile-first banking in emerging markets.'
    }
  ],
  teachingMoves: [
    { phase: 'Regulatory Comparison Matrix', strategy: 'Build a comparison table of Open Banking frameworks across UK, EU, US, Australia, and Brazil.', focus: 'Different regulatory approaches to the same problem.' },
    { phase: 'Inclusion Impact Analysis', strategy: 'Analyze M-Pesas impact on Kenyans financial inclusion and identify which lessons apply to US credit-invisible populations.', focus: 'Alternative data as a bridge to credit access.' }
  ],
  appliedProjectHandout: {
    title: 'Open Banking Data Rights Blueprint (Capstone Asset #15)',
    description: 'Design an Open Banking-powered financial inclusion product that uses consumer-permissioned data to extend credit to thin-file populations.',
    reusableOutput: 'Open Banking Product Blueprint with data rights framework.',
    checklist: [
      'Define the target population (e.g., credit-invisible gig workers) and their specific financial exclusion barrier.',
      'Design the OAuth 2.0 data consent flow specifying exactly which data points are requested and for what purpose.',
      'Map the alternative underwriting model: which cash-flow features replace traditional FICO scoring.',
      'Document the consumer protection framework: data minimization, right to revoke, and dispute resolution process.'
    ],
    technicalSpec: 'Product must comply with both the proposed Section 1033 rule (US) and include a path to PSD2 compliance for EU expansion.'
  },
  slides: [
    {
      title: 'Global Open Banking Frameworks Compared',
      subtitle: 'Different regulatory approaches to the same consumer data right',
      bullets: [
        'UK: Mandated for the 9 largest banks (CMA9), with standardized API specifications, live since 2018 — the most mature market globally with 7M+ active users.',
        'EU: PSD2 mandates bank API access across all 27 member states, but implementation quality varies — UK leads while southern Europe lags.',
        'US: Section 1033 CFPB rule proposed in 2023, final rule expected phased implementation starting with largest banks.',
        'Australia: Consumer Data Right (CDR) extends beyond banking to energy and telecommunications — the broadest data-right scope globally.'
      ],
      exampleCard: {
        title: 'The UK Open Banking Standard',
        description: 'The most mature Open Banking market in the world.',
        example: '7M+ UK consumers use Open Banking to: aggregate accounts from 20+ banks in one app, switch banks with 7-day guarantee, get cash-flow based mortgage offers.',
        explanation: 'The UKs approach combined a regulatory mandate (CMA9) with a centralized implementation body (OBIE) that wrote the API standard, certified providers, and handled dispute resolution.'
      }
    },
    {
      title: 'OAuth 2.0 & Financial Data APIs',
      subtitle: 'The technical architecture of secure data sharing',
      bullets: [
        'Consent is obtained through the banks own authentication UI — the third-party app never sees the users banking credentials.',
        'Scoped access tokens limit what data the third-party can access (e.g., read-only transaction history for 90 days).',
        'Tokens are revocable: the user can revoke access from their bank dashboard at any time, immediately cutting off the third-party.',
        'Liability allocation: under PSD2, the bank is liable for unauthorized access; under US proposals, liability shifts to the party that fails to secure data.'
      ],
      diagramTitle: 'OAuth 2.0 Open Banking Consent Flow',
      diagramData: [
        'User taps "Connect Bank" in fintech app -> App redirects to banks login page',
        'User authenticates directly with bank -> Bank verifies credentials (no shared passwords)',
        'Bank presents consent screen -> "Allow FinTechApp to read 12 months of transactions?"',
        'User approves consent -> Bank issues scoped OAuth token to fintech app',
        'Fintech uses token to access API -> Accesses only authorized data; can be revoked anytime'
      ]
    },
    {
      title: 'Financial Inclusion Through Data Rights',
      subtitle: 'How alternative data bridges the credit invisibility gap',
      bullets: [
        '1.4 billion adults globally remain unbanked; 45M Americans are credit invisible despite having steady income.',
        'Open Banking APIs enable lenders to access 12-24 months of bank transaction data with one click of consumer consent.',
        'Cash-flow underwriting using this data can score credit-invisible populations who pay rent, utilities, and receive payroll deposits on time.',
        'M-Pesa (Kenya) demonstrated that mobile money transaction data can replace traditional credit scoring, lifting 194,000 households out of poverty.'
      ],
      codeSnippet: `// Cash-flow underwriting features from Open Banking data
interface CashFlowFeatures {
  avgMonthlyNetSurplus: number;          // Income - Expenses (positive = capacity to repay)
  depositConsistencyScore: number;        // % of months with >= 1 payroll deposit
  rentPaymentOnTime: number;              // % of rent payments within 3 days of due date
  utilizationTrend: number;               // (Utilization last 3mo) / (Utilization last 12mo) — declining = positive
  incomeVolatility: number;               // StdDev of monthly net deposits — lower = more stable
}
function evaluateCreditWorthiness(cf: CashFlowFeatures): { score: number; decision: string } {
  if (cf.avgMonthlyNetSurplus > 500 && cf.depositConsistencyScore > 0.85 && cf.rentPaymentOnTime > 0.9) {
    return { score: 78, decision: 'APPROVE — Monthly surplus and on-time rent indicate strong repayment capacity.' };
  }
  return { score: 45, decision: 'DECLINE — Insufficient cash flow surplus to support new debt payments.' };
}`
    }
  ]
};

export const LECTURE_CLASSES: LectureClass[] = [
  CLASS_0,
  CLASS_1,
  CLASS_2,
  CLASS_3,
  CLASS_4,
  CLASS_5,
  CLASS_6,
  CLASS_7,
  CLASS_8,
  CLASS_9,
  CLASS_10,
  CLASS_11,
  CLASS_12,
  CLASS_13,
  CLASS_14,
  CLASS_15
];
