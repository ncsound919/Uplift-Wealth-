# Uplift Wealth

**Deploy AI Agents. Build Revenue. Master Wealth.**

Uplift Wealth is an all-in-one educational platform for revenue generation, skill building, financial strategy, and wealth management. This platform helps beginners gain financial literacy, build economic portfolios, and track their growth through an intuitive wealth dashboard.

> ⚠️ **Educational Purpose Only**: All content, tools, simulators, and features are for educational and simulation purposes only. This is not financial, investment, tax, or trading advice.

## 🎯 Features

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

3. Start the development server:
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
- **Styling**: Custom CSS with CSS Variables
- **State Management**: React Hooks (useState)
- **Type Safety**: TypeScript 6.0

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

Currently, all data is stored locally in your browser's localStorage. This means:
- ✅ Your data stays on your device
- ✅ No account creation required
- ⚠️ Data will be lost if you clear browser data
- ⚠️ Data is not synced across devices

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

Future enhancements may include:
- [ ] User authentication and cloud data sync
- [ ] Real-time market data integration
- [ ] AI-powered financial advice chatbot
- [ ] Community features and forums
- [ ] Mobile app (React Native)
- [ ] Advanced portfolio analytics
- [ ] Integration with real brokerage APIs (paper trading)

## 💡 Support

For questions, issues, or suggestions, please open an issue on GitHub.

---

**Built with ❤️ to help people achieve financial freedom through education**
 
