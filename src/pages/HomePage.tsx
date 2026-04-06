interface HomePageProps {
  onGetStarted: () => void;
}

export default function HomePage({ onGetStarted }: HomePageProps) {
  return (
    <div>
      <section className="hero">
        <div className="hero-content">
          <h1>Deploy AI Agents. Build Revenue. Master Wealth.</h1>
          <p>
            All-in-one platform for revenue generation, skill building, financial strategy,
            crypto/blockchain, trading simulators, and AI agent deployment.
          </p>
          <div className="disclaimer" style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', color: 'white' }}>
            ⚠️ All content, tools, simulators, and AI agents are for educational and simulation purposes only.
            Not financial, investment, tax, or trading advice.
          </div>
          <div className="hero-buttons">
            <button className="btn btn-large btn-white" onClick={onGetStarted}>
              Get Started Free
            </button>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2 style={{ textAlign: 'center', fontSize: '36px', marginBottom: '16px' }}>
            Everything You Need to Build Wealth
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--text-light)', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>
            Learn, practice, and grow with our comprehensive platform designed for beginners and experienced investors alike.
          </p>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎓</div>
              <h3>Financial Literacy Academy</h3>
              <p>
                Master the fundamentals with beginner-friendly courses, guides, and interactive quizzes.
                Build your financial knowledge step by step.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">💼</div>
              <h3>Portfolio Tracking</h3>
              <p>
                Monitor your investments and track growth with our intuitive wealth dashboard.
                Visualize your progress toward financial goals.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>Revenue Ideas</h3>
              <p>
                Discover personalized side hustle opportunities based on your skills.
                Generate additional income streams with AI-powered recommendations.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📈</div>
              <h3>Financial Planning Tools</h3>
              <p>
                Set and track financial goals, create budgets, and plan for your future.
                Calculate net worth and monitor your progress.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Safe Simulation</h3>
              <p>
                Practice trading and investment strategies in a risk-free environment.
                Learn without risking real money.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🤝</div>
              <h3>Community Support</h3>
              <p>
                Join a community of learners on the same wealth-building journey.
                Share insights and learn from others.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 40px', background: '#f9fafb', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontSize: '36px', marginBottom: '24px' }}>Ready to Start Your Wealth Journey?</h2>
          <p style={{ fontSize: '18px', color: 'var(--text-light)', marginBottom: '32px', maxWidth: '600px', margin: '0 auto 32px' }}>
            Join thousands of members building their economic portfolios and gaining financial literacy.
          </p>
          <button className="btn btn-primary btn-large" onClick={onGetStarted}>
            Start Learning Now
          </button>
        </div>
      </section>
    </div>
  );
}
