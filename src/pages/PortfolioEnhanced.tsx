import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PortfolioAsset, Transaction } from '../types';
import {
  savePortfolioAsset,
  subscribeToPortfolioAssets,
  subscribeToTransactions
} from '../services/firestoreService';
import { marketDataService } from '../services/marketDataService';
import { portfolioAnalyticsService } from '../services/portfolioAnalyticsService';

export default function PortfolioEnhanced() {
  const { currentUser } = useAuth();
  const [assets, setAssets] = useState<PortfolioAsset[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showAddAsset, setShowAddAsset] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [marketData, setMarketData] = useState<any>(null);

  const [newAsset, setNewAsset] = useState({
    assetType: 'stocks' as 'stocks' | 'crypto' | 'bonds' | 'cash',
    ticker: '',
    name: '',
    quantity: '',
    valueUSD: ''
  });

  // Subscribe to portfolio assets and transactions
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribeAssets = subscribeToPortfolioAssets(currentUser.uid, setAssets);
    const unsubscribeTransactions = subscribeToTransactions(currentUser.uid, setTransactions);

    return () => {
      unsubscribeAssets();
      unsubscribeTransactions();
    };
  }, [currentUser]);

  // Subscribe to real-time market data
  useEffect(() => {
    const unsubscribe = marketDataService.subscribe(setMarketData);
    return unsubscribe;
  }, []);

  const handleAddAsset = async () => {
    if (!currentUser || !newAsset.ticker || !newAsset.name || !newAsset.quantity || !newAsset.valueUSD) {
      return;
    }

    const asset: PortfolioAsset = {
      id: `${currentUser.uid}_${Date.now()}`,
      userId: currentUser.uid,
      assetType: newAsset.assetType,
      ticker: newAsset.ticker.toUpperCase(),
      name: newAsset.name,
      quantity: parseFloat(newAsset.quantity),
      valueUSD: parseFloat(newAsset.valueUSD),
      date: new Date(),
      simulated: true
    };

    await savePortfolioAsset(currentUser.uid, asset);
    setNewAsset({ assetType: 'stocks', ticker: '', name: '', quantity: '', valueUSD: '' });
    setShowAddAsset(false);
  };

  // Calculate analytics
  const analytics = portfolioAnalyticsService.calculateAnalytics(assets, transactions);
  const totalValue = assets.reduce((sum, asset) => sum + asset.valueUSD, 0);

  const assetsByType = assets.reduce((acc, asset) => {
    if (!acc[asset.assetType]) {
      acc[asset.assetType] = { value: 0, count: 0 };
    }
    acc[asset.assetType].value += asset.valueUSD;
    acc[asset.assetType].count += 1;
    return acc;
  }, {} as Record<string, { value: number; count: number }>);

  const getAssetIcon = (type: string) => {
    const icons: Record<string, string> = {
      stocks: '📈',
      crypto: '₿',
      bonds: '📊',
      cash: '💵'
    };
    return icons[type] || '💼';
  };

  // Get real-time price for an asset
  const getRealTimePrice = (ticker: string) => {
    if (!marketData) return null;
    return marketDataService.getPrice(ticker);
  };

  return (
    <div className="page main-content with-nav">
      <div className="page-header">
        <h1 className="page-title">Portfolio Dashboard 💼</h1>
        <p className="page-description">
          Track your economic portfolio with real-time data and advanced analytics
        </p>
      </div>

      <div className="disclaimer">
        📊 This portfolio uses simulated real-time data for educational purposes. Not investment advice.
      </div>

      {/* Advanced Analytics Section */}
      {showAnalytics && assets.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '20px' }}>Advanced Analytics</h2>
            <button
              className="btn"
              onClick={() => setShowAnalytics(!showAnalytics)}
              style={{ fontSize: '14px', padding: '8px 16px' }}
            >
              {showAnalytics ? 'Hide' : 'Show'} Analytics
            </button>
          </div>

          <div className="grid grid-3" style={{ marginBottom: '20px' }}>
            <div className="stat-card">
              <div className="stat-label">Total Gain/Loss</div>
              <div className="stat-value" style={{
                color: analytics.totalGainLoss >= 0 ? 'var(--success-color)' : 'var(--danger-color)'
              }}>
                {analytics.totalGainLoss >= 0 ? '+' : ''}${analytics.totalGainLoss.toFixed(2)}
              </div>
              <div className="stat-change" style={{
                color: analytics.totalGainLossPercent >= 0 ? 'var(--success-color)' : 'var(--danger-color)'
              }}>
                {analytics.totalGainLossPercent >= 0 ? '↑' : '↓'} {Math.abs(analytics.totalGainLossPercent).toFixed(2)}%
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Diversification Score</div>
              <div className="stat-value">{analytics.diversificationScore}/100</div>
              <div className="stat-change" style={{ color: 'var(--text-light)' }}>
                {analytics.diversificationScore >= 70 ? 'Excellent' : analytics.diversificationScore >= 50 ? 'Good' : 'Fair'}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Risk Level</div>
              <div className="stat-value">{analytics.riskScore.toFixed(0)}/100</div>
              <div className="stat-change" style={{ color: 'var(--text-light)' }}>
                {analytics.riskScore >= 70 ? 'High' : analytics.riskScore >= 40 ? 'Medium' : 'Low'} Risk
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '16px' }}>Performance Metrics</h3>
            <div className="grid grid-2">
              <div>
                <div style={{ fontSize: '14px', color: 'var(--text-light)', marginBottom: '8px' }}>Sharpe Ratio</div>
                <div style={{ fontSize: '24px', fontWeight: 600 }}>{analytics.sharpeRatio.toFixed(2)}</div>
              </div>
              <div>
                <div style={{ fontSize: '14px', color: 'var(--text-light)', marginBottom: '8px' }}>Volatility</div>
                <div style={{ fontSize: '24px', fontWeight: 600 }}>{analytics.volatility.toFixed(2)}%</div>
              </div>
            </div>

            {(analytics.bestPerformer || analytics.worstPerformer) && (
              <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
                {analytics.bestPerformer && (
                  <div style={{ marginBottom: '12px' }}>
                    <span style={{ fontSize: '14px', color: 'var(--text-light)' }}>Best Performer: </span>
                    <span style={{ fontWeight: 600, color: 'var(--success-color)' }}>
                      {analytics.bestPerformer.symbol} (+${analytics.bestPerformer.gain.toFixed(2)})
                    </span>
                  </div>
                )}
                {analytics.worstPerformer && (
                  <div>
                    <span style={{ fontSize: '14px', color: 'var(--text-light)' }}>Worst Performer: </span>
                    <span style={{ fontWeight: 600, color: 'var(--danger-color)' }}>
                      {analytics.worstPerformer.symbol} (${analytics.worstPerformer.loss.toFixed(2)})
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Portfolio Overview */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Portfolio Overview</h2>
        <div className="grid grid-3">
          <div className="stat-card">
            <div className="stat-label">Total Portfolio Value</div>
            <div className="stat-value">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <div className="stat-change positive">
              ↑ {analytics.performanceMetrics.dayChange.toFixed(2)}% today
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Total Assets</div>
            <div className="stat-value">{assets.length}</div>
            <div className="stat-change" style={{ color: 'var(--text-light)' }}>
              Across {Object.keys(assetsByType).length} categories
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Portfolio Cost</div>
            <div className="stat-value">${analytics.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <div className="stat-change" style={{ color: 'var(--text-light)' }}>
              Original investment
            </div>
          </div>
        </div>
      </div>

      {/* Asset Allocation */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Asset Allocation</h2>
        <div className="card">
          {Object.entries(assetsByType).map(([type, data]) => {
            const percentage = (data.value / totalValue) * 100;
            return (
              <div key={type} style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '24px' }}>{getAssetIcon(type)}</span>
                    <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{type}</span>
                    <span style={{ color: 'var(--text-light)', fontSize: '14px' }}>
                      ({data.count} {data.count === 1 ? 'asset' : 'assets'})
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 600 }}>${data.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                    <div style={{ fontSize: '14px', color: 'var(--text-light)' }}>{percentage.toFixed(1)}%</div>
                  </div>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${percentage}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Asset Button */}
      <div style={{ marginBottom: '24px' }}>
        <button
          className="btn btn-primary"
          onClick={() => setShowAddAsset(!showAddAsset)}
        >
          {showAddAsset ? 'Cancel' : '+ Add Asset'}
        </button>
      </div>

      {/* Add Asset Form */}
      {showAddAsset && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '16px' }}>Add New Asset to Portfolio</h3>
          <div style={{ display: 'grid', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Asset Type</label>
              <select
                className="form-select"
                value={newAsset.assetType}
                onChange={(e) => setNewAsset({ ...newAsset, assetType: e.target.value as PortfolioAsset['assetType'] })}
              >
                <option value="stocks">Stocks</option>
                <option value="crypto">Cryptocurrency</option>
                <option value="bonds">Bonds</option>
                <option value="cash">Cash</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Ticker Symbol</label>
                <input
                  type="text"
                  className="form-input"
                  value={newAsset.ticker}
                  onChange={(e) => setNewAsset({ ...newAsset, ticker: e.target.value })}
                  placeholder="AAPL, BTC, etc."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Asset Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={newAsset.name}
                  onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                  placeholder="Apple Inc., Bitcoin, etc."
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Quantity</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  value={newAsset.quantity}
                  onChange={(e) => setNewAsset({ ...newAsset, quantity: e.target.value })}
                  placeholder="10"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Total Value (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  value={newAsset.valueUSD}
                  onChange={(e) => setNewAsset({ ...newAsset, valueUSD: e.target.value })}
                  placeholder="1750.00"
                />
              </div>
            </div>

            <button className="btn btn-primary" onClick={handleAddAsset}>
              Add Asset
            </button>
          </div>
        </div>
      )}

      {/* Assets List with Real-time Prices */}
      <div>
        <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Your Assets</h2>
        {assets.length === 0 ? (
          <div className="empty-state">
            <h3>No assets in portfolio</h3>
            <p>Start by adding your first asset!</p>
          </div>
        ) : (
          <div className="card">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Asset</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Type</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Quantity</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Value</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Real-time Price</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>% of Portfolio</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => {
                  const percentage = (asset.valueUSD / totalValue) * 100;
                  const realTimePrice = getRealTimePrice(asset.ticker);

                  return (
                    <tr key={asset.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px' }}>
                        <div style={{ fontWeight: 600 }}>{asset.ticker}</div>
                        <div style={{ fontSize: '14px', color: 'var(--text-light)' }}>{asset.name}</div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {getAssetIcon(asset.assetType)}
                          <span style={{ textTransform: 'capitalize' }}>{asset.assetType}</span>
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>{asset.quantity}</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>
                        ${asset.valueUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        {realTimePrice ? (
                          <div>
                            <div style={{ fontWeight: 600 }}>${realTimePrice.price.toFixed(2)}</div>
                            <div style={{
                              fontSize: '12px',
                              color: realTimePrice.changePercent >= 0 ? 'var(--success-color)' : 'var(--danger-color)'
                            }}>
                              {realTimePrice.changePercent >= 0 ? '+' : ''}{realTimePrice.changePercent.toFixed(2)}%
                            </div>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-light)', fontSize: '14px' }}>N/A</span>
                        )}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', color: 'var(--text-light)' }}>
                        {percentage.toFixed(2)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
