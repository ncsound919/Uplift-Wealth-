import { LearningModule } from '../types';

export const learningModules: LearningModule[] = [
  {
    id: '1',
    title: 'Financial Literacy Basics',
    category: 'beginner',
    topic: 'basics',
    description: 'Learn the fundamentals of personal finance, budgeting, and money management.',
    durationMinutes: 15,
    completed: false,
    content: `
# Financial Literacy Basics

## What is Financial Literacy?

Financial literacy is the ability to understand and effectively use various financial skills, including personal financial management, budgeting, and investing.

## Key Concepts:

### 1. Income and Expenses
- **Income**: Money you receive (salary, side hustles, investments)
- **Expenses**: Money you spend (rent, food, entertainment)
- **Net Income**: Income minus expenses

### 2. The 50/30/20 Rule
- 50% of income for needs (housing, food, utilities)
- 30% for wants (entertainment, dining out)
- 20% for savings and debt repayment

### 3. Emergency Fund
Build 3-6 months of expenses in a savings account for unexpected events.

### 4. The Power of Compound Interest
Money grows exponentially when you reinvest earnings. Start early!

## Action Steps:
1. Track your income and expenses for one month
2. Create a simple budget
3. Open a savings account
4. Set up automatic transfers to savings
    `,
    quizQuestions: [
      {
        id: 'q1',
        question: 'What percentage of income should go to savings according to the 50/30/20 rule?',
        options: ['10%', '20%', '30%', '50%'],
        correctAnswer: 1
      },
      {
        id: 'q2',
        question: 'How many months of expenses should you keep in an emergency fund?',
        options: ['1-2 months', '3-6 months', '12 months', '24 months'],
        correctAnswer: 1
      }
    ]
  },
  {
    id: '2',
    title: 'Introduction to Investing',
    category: 'beginner',
    topic: 'investing',
    description: 'Understand the basics of investing in stocks, bonds, and other assets.',
    durationMinutes: 20,
    completed: false,
    content: `
# Introduction to Investing

## Why Invest?

Investing helps your money grow faster than keeping it in a savings account, allowing you to build wealth over time.

## Types of Investments:

### 1. Stocks
- Ownership in a company
- Higher potential returns, higher risk
- Can receive dividends

### 2. Bonds
- Loans to companies or governments
- Lower risk, more stable returns
- Provide regular interest payments

### 3. Index Funds & ETFs
- Baskets of stocks or bonds
- Diversification reduces risk
- Lower fees than actively managed funds

### 4. Real Estate
- Physical property investment
- Can generate rental income
- Requires significant capital

## Key Principles:

1. **Diversification**: Don't put all eggs in one basket
2. **Long-term Thinking**: Markets fluctuate; stay invested
3. **Dollar-Cost Averaging**: Invest regularly regardless of market conditions
4. **Risk Tolerance**: Invest based on your comfort level and goals

## Getting Started:
1. Pay off high-interest debt first
2. Build an emergency fund
3. Open a brokerage account
4. Start with index funds
5. Increase contributions over time
    `,
    quizQuestions: [
      {
        id: 'q1',
        question: 'What is diversification?',
        options: [
          'Putting all money in one stock',
          'Spreading investments across different assets',
          'Only investing in bonds',
          'Trading stocks daily'
        ],
        correctAnswer: 1
      }
    ]
  },
  {
    id: '3',
    title: 'Understanding Cryptocurrency',
    category: 'beginner',
    topic: 'crypto',
    description: 'Learn about cryptocurrency, blockchain technology, and digital assets.',
    durationMinutes: 25,
    completed: false,
    content: `
# Understanding Cryptocurrency

## What is Cryptocurrency?

Digital or virtual currency that uses cryptography for security and operates independently of central banks.

## How Blockchain Works:

A blockchain is a distributed ledger that records all transactions across a network of computers.

**Key Features:**
- Decentralized (no single authority)
- Transparent (all transactions are public)
- Immutable (cannot be altered once recorded)
- Secure (cryptographic protection)

## Popular Cryptocurrencies:

### Bitcoin (BTC)
- First cryptocurrency (2009)
- Digital gold / store of value
- Limited supply (21 million)

### Ethereum (ETH)
- Smart contract platform
- Powers decentralized applications
- Used for DeFi and NFTs

### Stablecoins
- Pegged to traditional currencies (USD)
- Less volatile
- Used for transactions

## Important Considerations:

⚠️ **Educational Only**: This platform is for learning, not investment advice

1. **High Volatility**: Prices can change dramatically
2. **Security**: Store in secure wallets
3. **Research**: Understand before investing
4. **Scam Risk**: Be wary of "get rich quick" schemes
5. **Regulation**: Laws vary by country

## Safe Practices:
- Use reputable exchanges
- Enable two-factor authentication
- Never share private keys
- Start with small amounts
- Use hardware wallets for large holdings
    `,
    quizQuestions: [
      {
        id: 'q1',
        question: 'What makes blockchain technology secure?',
        options: [
          'It uses passwords',
          'Cryptography and decentralization',
          'Government regulation',
          'Bank verification'
        ],
        correctAnswer: 1
      }
    ]
  },
  {
    id: '4',
    title: 'Building Your First Budget',
    category: 'beginner',
    topic: 'budgeting',
    description: 'Create and maintain an effective personal budget to control your finances.',
    durationMinutes: 15,
    completed: false,
    content: `
# Building Your First Budget

## Why Budget?

A budget helps you:
- Track where money goes
- Save for goals
- Reduce financial stress
- Avoid debt

## Steps to Create a Budget:

### Step 1: Calculate Your Income
Add up all sources:
- Salary (after taxes)
- Side hustles
- Passive income
- Other sources

### Step 2: List Your Expenses

**Fixed Expenses** (same each month):
- Rent/mortgage
- Insurance
- Loan payments
- Subscriptions

**Variable Expenses** (change monthly):
- Groceries
- Utilities
- Transportation
- Entertainment

### Step 3: Apply the 50/30/20 Rule
- **50% Needs**: Essential expenses
- **30% Wants**: Non-essential but enjoyable
- **20% Savings**: Emergency fund, retirement, goals

### Step 4: Track and Adjust
- Review weekly
- Use budgeting apps
- Adjust categories as needed
- Be realistic

## Budgeting Tools:
- Spreadsheets (Excel, Google Sheets)
- Apps (Mint, YNAB, EveryDollar)
- Envelope method (cash-based)
- Zero-based budgeting

## Common Mistakes to Avoid:
1. Being too restrictive
2. Forgetting irregular expenses
3. Not tracking small purchases
4. Giving up after one bad month
5. Not leaving room for fun

## Pro Tips:
✓ Pay yourself first (automate savings)
✓ Build in buffer amounts
✓ Review and adjust monthly
✓ Celebrate small wins
    `
  },
  {
    id: '5',
    title: 'Side Hustles and Income Generation',
    category: 'beginner',
    topic: 'basics',
    description: 'Discover ways to generate additional income through side hustles and passive income streams.',
    durationMinutes: 20,
    completed: false,
    content: `
# Side Hustles and Income Generation

## Why Multiple Income Streams?

- Financial security
- Faster goal achievement
- Skill development
- Career flexibility

## Popular Side Hustles:

### Online Services:
- **Freelance Writing**: $25-$150/hour
- **Graphic Design**: $30-$100/hour
- **Web Development**: $50-$200/hour
- **Virtual Assistant**: $15-$50/hour
- **Online Tutoring**: $20-$80/hour

### Local Services:
- **Pet Sitting/Dog Walking**: $15-$40/visit
- **House Cleaning**: $25-$50/hour
- **Handyman Services**: $30-$75/hour
- **Photography**: $100-$500/event

### Content Creation:
- YouTube videos
- Blogging
- Podcasting
- Social media management

### Selling Products:
- E-commerce (Amazon, Etsy)
- Print-on-demand
- Digital products
- Dropshipping

## Passive Income Ideas:

1. **Dividend Stocks**: Regular income from investments
2. **Rental Income**: Real estate or room rentals
3. **Create Digital Products**: Courses, templates, ebooks
4. **Affiliate Marketing**: Earn commissions from referrals
5. **Royalties**: Music, books, photography

## How to Start:

### Step 1: Identify Your Skills
What are you good at? What do people ask you for help with?

### Step 2: Research Demand
Is there a market? What do people pay for this?

### Step 3: Start Small
Test the waters before investing heavily

### Step 4: Set Up Systems
- Create a simple website
- Set up payment processing
- Develop a portfolio
- Build social media presence

### Step 5: Scale Up
Once profitable, invest time and money to grow

## Time Management:
- Start with 5-10 hours/week
- Use evenings and weekends
- Automate where possible
- Outsource as you grow

## Important Reminders:
⚠️ Report all income to tax authorities
⚠️ Keep business and personal finances separate
⚠️ Reinvest profits to grow faster
⚠️ Don't quit your day job too soon
    `
  }
];

export const getModulesByCategory = (category: string) => {
  return learningModules.filter(m => m.category === category);
};

export const getModulesByTopic = (topic: string) => {
  return learningModules.filter(m => m.topic === topic);
};
