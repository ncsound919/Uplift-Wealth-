import { PortfolioSummary } from '../types';

type Page = 'home' | 'onboarding' | 'dashboard' | 'academy' | 'revenue' | 'planner' | 'portfolio';

interface DashboardProps {
  onNavigate: (page: Page) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  // Mock data - in real app would come from API/database
  const portfolioSummary: PortfolioSummary = {
    totalValue: 12543.50,
    dayChange: 234.20,
    dayChangePercent: 1.9,
    assets: [
      {
        id: '1',
        userId: 'user1',
        assetType: 'stocks',
        ticker: 'AAPL',
        name: 'Apple Inc.',
        quantity: 10,
        valueUSD: 1750.00,
        date: new Date(),
        simulated: true
      },
      {
        id: '2',
        userId: 'user1',
        assetType: 'crypto',
        ticker: 'BTC',
        name: 'Bitcoin',
        quantity: 0.1,
        valueUSD: 4300.00,
        date: new Date(),
        simulated: true
      },
    ]
  };

  const recentActivity = [
    { id: '1', action: 'Completed', item: 'Financial Literacy Basics', time: '2 hours ago' },
    { id: '2', action: 'Added', item: '$500 to Emergency Fund', time: '1 day ago' },
    { id: '3', action: 'Viewed', item: 'Introduction to Investing', time: '2 days ago' },
  ];

  const quickActions = [
    { id: 'academy', label: 'Continue Learning', icon: '🎓', description: 'Resume your courses' },
    { id: 'portfolio', label: 'Update Portfolio', icon: '💼', description: 'Track your assets' },
    { id: 'revenue', label: 'Explore Revenue Ideas', icon: '💰', description: 'Find side hustles' },
    { id: 'planner', label: 'Set Financial Goals', icon: '🎯', description: 'Plan your future' },
  ];

  const getUserNameFromOnboarding = () => {
    const onboardingData = localStorage.getItem('upliftWealthOnboarding');

    if (!onboardingData) {
      return 'Member';
    }

    try {
      const parsedData = JSON.parse(onboardingData);
      return typeof parsedData?.fullName === 'string' && parsedData.fullName.trim()
        ? parsedData.fullName
        : 'Member';
    } catch {
      return 'Member';
    }
  };

  const userName = getUserNameFromOnboarding();
  return (
    <div className="page main-content with-nav">
      <div className="page-header">
        <h1 className="page-title">Welcome back, {userName}! 👋</h1>
        <p className="page-description">Here's your wealth-building progress at a glance</p>
      </div>

      <div className="disclaimer">
        ⚠️ All portfolio values and simulations are for educational purposes only. Not investment advice.
      </div>

      {/* Portfolio Summary */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Portfolio Summary</h2>
        <div className="grid grid-3">
          <div className="stat-card">
            <div className="stat-label">Total Portfolio Value</div>
            <div className="stat-value">${portfolioSummary.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <div className={`stat-change ${portfolioSummary.dayChange >= 0 ? 'positive' : 'negative'}`}>
              {portfolioSummary.dayChange >= 0 ? '↑' : '↓'} ${Math.abs(portfolioSummary.dayChange).toFixed(2)} ({Math.abs(portfolioSummary.dayChangePercent)}%) today
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Assets Tracked</div>
            <div className="stat-value">{portfolioSummary.assets.length}</div>
            <div className="stat-change" style={{ color: 'var(--text-light)' }}>
              Across {new Set(portfolioSummary.assets.map(a => a.assetType)).size} categories
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Learning Progress</div>
            <div className="stat-value">20%</div>
            <div className="stat-change" style={{ color: 'var(--text-light)' }}>
              1 of 5 courses completed
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Quick Actions</h2>
        <div className="grid grid-2">
          {quickActions.map((action) => (
            <div
              key={action.id}
              className="card"
              style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
              onClick={() => onNavigate(action.id as Page)}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ fontSize: '40px' }}>{action.icon}</div>
                <div>
                  <h3 style={{ fontSize: '18px', marginBottom: '4px' }}>{action.label}</h3>
                  <p style={{ color: 'var(--text-light)', fontSize: '14px' }}>{action.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Recent Activity</h2>
        <div className="card">
          {recentActivity.length === 0 ? (
            <div className="empty-state">
              <p>No recent activity. Start by exploring the Academy or setting financial goals!</p>
            </div>
          ) : (
            <div>
              {recentActivity.map((activity, index) => (
                <div
                  key={activity.id}
                  style={{
                    padding: '16px 0',
                    borderBottom: index < recentActivity.length - 1 ? '1px solid var(--border-color)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <span style={{ fontWeight: 600, color: 'var(--primary-color)' }}>{activity.action}</span>
                      <span style={{ marginLeft: '8px' }}>{activity.item}</span>
                    </div>
                    <span style={{ fontSize: '14px', color: 'var(--text-light)' }}>{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
