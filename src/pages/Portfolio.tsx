import { useState } from 'react';
import { PortfolioAsset } from '../types';

export default function Portfolio() {
  const [assets, setAssets] = useState<PortfolioAsset[]>([
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
    {
      id: '3',
      userId: 'user1',
      assetType: 'stocks',
      ticker: 'MSFT',
      name: 'Microsoft Corporation',
      quantity: 5,
      valueUSD: 1975.00,
      date: new Date(),
      simulated: true
    },
    {
      id: '4',
      userId: 'user1',
      assetType: 'crypto',
      ticker: 'ETH',
      name: 'Ethereum',
      quantity: 2.5,
      valueUSD: 4518.50,
      date: new Date(),
      simulated: true
    }
  ]);

  const [showAddAsset, setShowAddAsset] = useState(false);
  const [newAsset, setNewAsset] = useState({
    assetType: 'stocks' as 'stocks' | 'crypto' | 'bonds' | 'cash',
    ticker: '',
    name: '',
    quantity: '',
    valueUSD: ''
  });

  const handleAddAsset = () => {
    if (newAsset.ticker && newAsset.name && newAsset.quantity && newAsset.valueUSD) {
      const asset: PortfolioAsset = {
        id: String(Date.now()),
        userId: 'user1',
        assetType: newAsset.assetType,
        ticker: newAsset.ticker.toUpperCase(),
        name: newAsset.name,
        quantity: parseFloat(newAsset.quantity),
        valueUSD: parseFloat(newAsset.valueUSD),
        date: new Date(),
        simulated: true
      };
      setAssets([...assets, asset]);
      setNewAsset({ assetType: 'stocks', ticker: '', name: '', quantity: '', valueUSD: '' });
      setShowAddAsset(false);
    }
  };

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

  return (
    <div className="page" style={{ marginLeft: '250px' }}>
      <div className="page-header">
        <h1 className="page-title">Portfolio Dashboard 💼</h1>
        <p className="page-description">
          Track your economic portfolio and monitor asset growth
        </p>
      </div>

      <div className="disclaimer">
        📊 This is a simulated portfolio for educational purposes. Track real investments or practice with paper trading.
      </div>

      {/* Portfolio Overview */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Portfolio Overview</h2>
        <div className="grid grid-3">
          <div className="stat-card">
            <div className="stat-label">Total Portfolio Value</div>
            <div className="stat-value">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <div className="stat-change positive">
              ↑ $234.20 (1.9%) today
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
            <div className="stat-label">Diversification Score</div>
            <div className="stat-value">
              {Object.keys(assetsByType).length >= 3 ? 'Good' : 'Fair'}
            </div>
            <div className="stat-change" style={{ color: 'var(--text-light)' }}>
              {Object.keys(assetsByType).length} asset types
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
                onChange={(e) => setNewAsset({ ...newAsset, assetType: e.target.value as any })}
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

      {/* Assets List */}
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
                  <th style={{ padding: '12px', textAlign: 'right' }}>% of Portfolio</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => {
                  const percentage = (asset.valueUSD / totalValue) * 100;
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
