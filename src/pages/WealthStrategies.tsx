import { useState, useEffect } from 'react';
import { portfolioAnalyticsService, WealthBuildingStrategy } from '../services/portfolioAnalyticsService';

export default function WealthStrategies() {
  const [selectedStrategy, setSelectedStrategy] = useState<WealthBuildingStrategy | null>(null);
  const [strategies, setStrategies] = useState<WealthBuildingStrategy[]>([]);
  const [userProfile, setUserProfile] = useState({
    age: 30,
    riskTolerance: 'medium' as 'low' | 'medium' | 'high',
    timeHorizon: 10
  });

  useEffect(() => {
    const allStrategies = portfolioAnalyticsService.getWealthBuildingStrategies();
    setStrategies(allStrategies);

    // Set recommended strategy based on user profile
    const recommended = portfolioAnalyticsService.recommendStrategy(
      userProfile.age,
      userProfile.riskTolerance,
      userProfile.timeHorizon
    );
    setSelectedStrategy(recommended);
  }, [userProfile]);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'conservative': return 'var(--success-color)';
      case 'moderate': return 'var(--warning-color)';
      case 'aggressive': return 'var(--danger-color)';
      default: return 'var(--text-light)';
    }
  };

  return (
    <div className="page main-content with-nav">
      <div className="page-header">
        <h1 className="page-title">Wealth Building Strategies 📈</h1>
        <p className="page-description">
          Discover personalized strategies to grow your wealth based on your goals and risk tolerance
        </p>
      </div>

      <div className="disclaimer">
        💡 These strategies are educational templates. Consult with a financial advisor before making investment decisions.
      </div>

      {/* User Profile Configuration */}
      <div className="card" style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Your Profile</h2>
        <div className="grid grid-3">
          <div className="form-group">
            <label className="form-label">Age</label>
            <input
              type="number"
              className="form-input"
              value={userProfile.age}
              onChange={(e) => setUserProfile({ ...userProfile, age: parseInt(e.target.value) || 30 })}
              min="18"
              max="100"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Risk Tolerance</label>
            <select
              className="form-select"
              value={userProfile.riskTolerance}
              onChange={(e) => setUserProfile({ ...userProfile, riskTolerance: e.target.value as 'low' | 'medium' | 'high' })}
            >
              <option value="low">Low (Conservative)</option>
              <option value="medium">Medium (Balanced)</option>
              <option value="high">High (Aggressive)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Time Horizon (years)</label>
            <input
              type="number"
              className="form-input"
              value={userProfile.timeHorizon}
              onChange={(e) => setUserProfile({ ...userProfile, timeHorizon: parseInt(e.target.value) || 10 })}
              min="1"
              max="50"
            />
          </div>
        </div>
      </div>

      {/* Recommended Strategy */}
      {selectedStrategy && (
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>
            Recommended Strategy: {selectedStrategy.name}
          </h2>
          <div className="card" style={{ border: '2px solid var(--primary-color)' }}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '24px', marginBottom: '8px' }}>{selectedStrategy.name}</h3>
                  <p style={{ color: 'var(--text-light)', fontSize: '16px' }}>{selectedStrategy.description}</p>
                </div>
                <div style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: getRiskColor(selectedStrategy.riskLevel),
                  color: 'white',
                  fontWeight: 600,
                  textTransform: 'capitalize'
                }}>
                  {selectedStrategy.riskLevel}
                </div>
              </div>
            </div>

            <div className="grid grid-2" style={{ marginBottom: '20px' }}>
              <div className="stat-card">
                <div className="stat-label">Target Annual Return</div>
                <div className="stat-value">{selectedStrategy.targetReturn}%</div>
              </div>

              <div className="stat-card">
                <div className="stat-label">Time Horizon</div>
                <div className="stat-value">{selectedStrategy.timeHorizon}</div>
              </div>
            </div>

            {/* Asset Allocation */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ marginBottom: '12px' }}>Recommended Asset Allocation</h4>
              {Object.entries(selectedStrategy.recommendedAllocation).map(([type, percentage]) => (
                percentage > 0 && (
                  <div key={type} style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{type}</span>
                      <span style={{ fontWeight: 600 }}>{percentage}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                )
              ))}
            </div>

            {/* Suitable For */}
            <div>
              <h4 style={{ marginBottom: '12px' }}>Best Suited For:</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {selectedStrategy.suitableFor.map((item, index) => (
                  <span
                    key={index}
                    style={{
                      padding: '6px 12px',
                      background: 'var(--bg-secondary)',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All Strategies */}
      <div>
        <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>All Wealth Building Strategies</h2>
        <div className="grid grid-2">
          {strategies.map((strategy) => (
            <div
              key={strategy.id}
              className="card"
              style={{
                cursor: 'pointer',
                border: selectedStrategy?.id === strategy.id ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                transition: 'all 0.2s'
              }}
              onClick={() => setSelectedStrategy(strategy)}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '20px' }}>{strategy.name}</h3>
                <div style={{
                  padding: '4px 12px',
                  borderRadius: '6px',
                  background: getRiskColor(strategy.riskLevel),
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 600,
                  textTransform: 'capitalize'
                }}>
                  {strategy.riskLevel}
                </div>
              </div>

              <p style={{ color: 'var(--text-light)', fontSize: '14px', marginBottom: '16px', lineHeight: '1.5' }}>
                {strategy.description}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-light)' }}>Target Return</div>
                  <div style={{ fontSize: '20px', fontWeight: 600, color: 'var(--primary-color)' }}>
                    {strategy.targetReturn}%
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-light)' }}>Time Horizon</div>
                  <div style={{ fontSize: '16px', fontWeight: 600 }}>{strategy.timeHorizon}</div>
                </div>
              </div>

              {/* Mini allocation bars */}
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-light)', marginBottom: '6px' }}>Allocation</div>
                <div style={{ display: 'flex', gap: '4px', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                  {strategy.recommendedAllocation.stocks > 0 && (
                    <div
                      style={{
                        width: `${strategy.recommendedAllocation.stocks}%`,
                        background: 'var(--accent-color)',
                        borderRadius: '2px'
                      }}
                      title={`Stocks: ${strategy.recommendedAllocation.stocks}%`}
                    />
                  )}
                  {strategy.recommendedAllocation.crypto > 0 && (
                    <div
                      style={{
                        width: `${strategy.recommendedAllocation.crypto}%`,
                        background: 'var(--warning-color)',
                        borderRadius: '2px'
                      }}
                      title={`Crypto: ${strategy.recommendedAllocation.crypto}%`}
                    />
                  )}
                  {strategy.recommendedAllocation.bonds > 0 && (
                    <div
                      style={{
                        width: `${strategy.recommendedAllocation.bonds}%`,
                        background: 'var(--success-color)',
                        borderRadius: '2px'
                      }}
                      title={`Bonds: ${strategy.recommendedAllocation.bonds}%`}
                    />
                  )}
                  {strategy.recommendedAllocation.cash > 0 && (
                    <div
                      style={{
                        width: `${strategy.recommendedAllocation.cash}%`,
                        background: 'var(--text-light)',
                        borderRadius: '2px'
                      }}
                      title={`Cash: ${strategy.recommendedAllocation.cash}%`}
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Implementation Tips */}
      <div className="card" style={{ marginTop: '32px' }}>
        <h3 style={{ marginBottom: '16px' }}>Implementation Tips 💡</h3>
        <ul style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
          <li>Start with a strategy that matches your risk tolerance and adjust as you gain experience</li>
          <li>Regularly rebalance your portfolio to maintain target allocations (quarterly or annually)</li>
          <li>Consider tax implications when buying and selling assets</li>
          <li>Dollar-cost averaging can help reduce market timing risk</li>
          <li>Keep an emergency fund separate from your investment portfolio</li>
          <li>Review and adjust your strategy as your life circumstances change</li>
          <li>Diversify within asset classes (e.g., different sectors for stocks)</li>
        </ul>
      </div>
    </div>
  );
}
