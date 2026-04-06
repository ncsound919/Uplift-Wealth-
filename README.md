# Uplift Wealth

**Deploy AI Agents. Build Revenue. Master Wealth.**

Uplift Wealth is an all-in-one educational platform for revenue generation, skill building, financial strategy, and wealth management. This platform helps beginners gain financial literacy, build economic portfolios, and track their growth through an intuitive wealth dashboard.

> ⚠️ **Educational Purpose Only**: All content, tools, simulators, and features are for educational and simulation purposes only. This is not financial, investment, tax, or trading advice.

## 🎯 Features

### 🔐 User Authentication & Cloud Sync
- **Firebase Authentication**: Secure email/password and Google OAuth login
- **Cloud Data Sync**: Real-time synchronization of portfolio and financial data across devices
- **User Profiles**: Personalized experience with saved preferences and goals
- **Secure Storage**: All user data encrypted and stored in Firebase Firestore

### 📈 Real-Time Market Data
- **Live Price Updates**: Simulated real-time stock and cryptocurrency price feeds
- **Market Monitoring**: Track price changes and daily movements
- **Multi-Asset Support**: Stocks, cryptocurrency, bonds, and cash holdings
- **Price History**: View historical performance and trends

### 💼 Advanced Portfolio Analytics
- **Performance Metrics**: Track total returns, gains/losses, and portfolio growth
- **Diversification Analysis**: Measure portfolio diversification with detailed scoring
- **Risk Assessment**: Understand your portfolio's risk level and volatility
- **Sharpe Ratio**: Evaluate risk-adjusted returns
- **Best/Worst Performers**: Identify top and bottom performing assets
- **Asset Allocation**: Visual breakdown of your investment distribution

### 🎯 Wealth Building Strategies
- **Personalized Strategies**: Get recommendations based on age, risk tolerance, and goals
- **5 Investment Strategies**: Conservative, Balanced, Growth, Aggressive, and Income-focused
- **Target Allocations**: Detailed asset allocation recommendations
- **Risk Profiles**: Match strategies to your risk tolerance
- **Implementation Guidance**: Tips and best practices for each strategy

### 📚 Financial Literacy Academy
- **Beginner-Friendly Courses**: Learn the fundamentals of personal finance, budgeting, investing, cryptocurrency, and more
- **Interactive Learning**: Engaging content with quizzes to test your knowledge
- **Self-Paced**: Learn at your own pace with courses designed for all experience levels
- **Topics Include**:
  - Financial Literacy Basics
  - Introduction to Investing
  - Understanding Cryptocurrency
  - Building Your First Budget
  - Side Hustles and Income Generation

### 💼 Portfolio Dashboard
- **Track Your Assets**: Monitor stocks, cryptocurrency, bonds, and cash holdings
- **Growth Visualization**: See your portfolio value and daily changes at a glance
- **Asset Allocation**: Understand your diversification across different asset types
- **Simulated Trading**: Practice with paper trading to learn without risk

### 💰 Revenue Hub
- **Personalized Revenue Ideas**: Discover side hustle opportunities based on your skills
- **Skill Matching**: Get recommendations tailored to your abilities
- **Realistic Estimates**: See estimated revenue ranges and time commitments
- **Difficulty Ratings**: Find opportunities that match your experience level

### 📈 Financial Planner
- **Goal Setting**: Create and track financial goals (emergency fund, retirement, home purchase, etc.)
- **Progress Tracking**: Monitor your progress toward each goal
- **Net Worth Calculator**: Calculate and track your total savings
- **Visual Progress**: See completion percentages and timelines

### 🎓 Beginner-Friendly Onboarding
- **Personalized Experience**: Answer questions about your goals and skills
- **Custom Recommendations**: Get AI-powered suggestions based on your profile
- **Step-by-Step Guidance**: Easy onboarding process for complete beginners

## 🚀 Getting Started

### Prerequisites
- Node.js 20.19+ or 22.12+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ncsound919/Uplift-Wealth-.git
cd Uplift-Wealth-
```

2. Install dependencies:
```bash
npm install
```

3. Set up Firebase (required for authentication and cloud sync):
   - Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password and Google providers)
   - Create a Firestore database
   - Copy your Firebase configuration

4. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Add your Firebase configuration values to `.env`

5. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The production-ready files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## 📁 Project Structure

```
Uplift-Wealth-/
├── src/
│   ├── components/       # Reusable React components
│   │   └── Navigation.tsx
│   ├── pages/           # Page components
│   │   ├── HomePage.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Academy.tsx
│   │   ├── Portfolio.tsx
│   │   ├── RevenueHub.tsx
│   │   ├── FinancialPlanner.tsx
│   │   └── Onboarding.tsx
│   ├── data/            # Static data and content
│   │   ├── learningModules.ts
│   │   └── revenueIdeas.ts
│   ├── types/           # TypeScript type definitions
│   │   └── index.ts
│   ├── styles/          # CSS stylesheets
│   │   ├── index.css
│   │   └── App.css
│   ├── App.tsx          # Main application component
│   └── main.tsx         # Application entry point
├── public/              # Static assets
├── index.html           # HTML template
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Project dependencies
```

## 🛠️ Technology Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Authentication**: Firebase Authentication
- **Database**: Firebase Firestore (Cloud NoSQL)
- **Real-time Data**: Custom market data simulation service
- **Styling**: Custom CSS with CSS Variables
- **State Management**: React Hooks (useState, useEffect, useContext)
- **Type Safety**: TypeScript 6.0
- **Charts & Analytics**: Recharts (for future visualizations)

## 🎨 Design System

The platform uses a consistent color scheme:
- **Primary Color**: `#10b981` (Green) - Growth and prosperity
- **Accent Color**: `#3b82f6` (Blue) - Trust and stability
- **Success**: `#10b981`
- **Warning**: `#f59e0b`
- **Danger**: `#ef4444`

## 📖 User Guide

### For Complete Beginners

1. **Start with Onboarding**: Answer a few questions about your financial goals and skills
2. **Explore the Academy**: Begin with "Financial Literacy Basics" to build foundational knowledge
3. **Set Financial Goals**: Use the Financial Planner to create your first goal (e.g., Emergency Fund)
4. **Track Your Progress**: Add assets to your Portfolio (even if simulated) to practice tracking
5. **Discover Revenue Opportunities**: Check the Revenue Hub for side hustle ideas

### Dashboard Overview

The Dashboard is your central hub showing:
- Portfolio summary with total value and daily changes
- Quick action buttons to navigate to key features
- Recent activity tracking
- Learning progress

### Learning Path Recommendation

For beginners, we recommend this learning sequence:
1. Financial Literacy Basics (15 min)
2. Building Your First Budget (15 min)
3. Introduction to Investing (20 min)
4. Understanding Cryptocurrency (25 min)
5. Side Hustles and Income Generation (20 min)

## 🔒 Privacy & Data

**Cloud Data Sync with Firebase:**
- ✅ Secure authentication with Firebase Auth
- ✅ Real-time data synchronization across devices
- ✅ Data encrypted at rest and in transit by Firebase/Google Cloud infrastructure
- ✅ User data is private and accessible only to the account owner
- ✅ Google OAuth for quick and secure sign-in
- ⚠️ Requires internet connection for cloud features

**Security Features:**
- Password authentication with minimum 6 characters
- Secure session management via Firebase Auth tokens
- Data validation and sanitization

## 🤝 Contributing

Contributions are welcome! This is an educational platform designed to help people build financial literacy.

## 📄 License

See the [LICENSE](LICENSE) file for details.

## ⚠️ Legal Disclaimer

**IMPORTANT**: This platform and all its content, tools, simulators, and features are for **educational and simulation purposes only**.

- This is **NOT** financial, investment, tax, or trading advice
- Past performance is not indicative of future results
- Cryptocurrency and futures trading involve high risk of loss
- Always consult licensed financial professionals before making investment decisions
- The creators assume no responsibility for financial decisions made based on this platform

## 🎯 Roadmap

Completed features:
- [x] User authentication and cloud data sync
- [x] Real-time market data integration
- [x] Advanced portfolio analytics
- [x] Wealth building strategies

Future enhancements may include:
- [ ] AI-powered financial advice chatbot
- [ ] Community features and forums
- [ ] Mobile app (React Native)
- [ ] Integration with real brokerage APIs (paper trading)
- [ ] Advanced charting and technical analysis
- [ ] Tax optimization tools
- [ ] Automated portfolio rebalancing

## 💡 Support

For questions, issues, or suggestions, please open an issue on GitHub.

---

**Built with ❤️ to help people achieve financial freedom through education**
 
