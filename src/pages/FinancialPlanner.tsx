import { useState } from 'react';
import { FinancialGoal } from '../types';

export default function FinancialPlanner() {
  const [goals, setGoals] = useState<FinancialGoal[]>([
    {
      id: '1',
      userId: 'user1',
      title: 'Emergency Fund',
      targetAmount: 10000,
      currentAmount: 3500,
      deadline: new Date('2027-12-31'),
      category: 'emergency'
    },
    {
      id: '2',
      userId: 'user1',
      title: 'Retirement Savings',
      targetAmount: 100000,
      currentAmount: 12000,
      deadline: new Date('2045-01-01'),
      category: 'retirement'
    }
  ]);

  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    targetAmount: '',
    currentAmount: '',
    deadline: '',
    category: 'other' as FinancialGoal['category']
  });

  const handleAddGoal = () => {
    if (newGoal.title && newGoal.targetAmount && newGoal.deadline) {
      const goal: FinancialGoal = {
        id: String(Date.now()),
        userId: 'user1',
        title: newGoal.title,
        targetAmount: parseFloat(newGoal.targetAmount),
        currentAmount: parseFloat(newGoal.currentAmount) || 0,
        deadline: new Date(newGoal.deadline),
        category: newGoal.category
      };
      setGoals([...goals, goal]);
      setNewGoal({ title: '', targetAmount: '', currentAmount: '', deadline: '', category: 'other' });
      setShowAddGoal(false);
    }
  };

  const calculateProgress = (goal: FinancialGoal) => {
    return Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      emergency: '🚨',
      retirement: '🏖️',
      investment: '📈',
      home: '🏠',
      education: '🎓',
      other: '🎯'
    };
    return icons[category] || '🎯';
  };

  const totalSaved = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const totalTargets = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const overallProgress = totalTargets > 0 ? (totalSaved / totalTargets) * 100 : 0;

  return (
    <div className="page" style={{ marginLeft: '250px' }}>
      <div className="page-header">
        <h1 className="page-title">Financial Planner 📈</h1>
        <p className="page-description">
          Set and track your financial goals to build wealth systematically
        </p>
      </div>

      <div className="disclaimer">
        🎯 Setting clear financial goals is the first step to building wealth. Track your progress and celebrate milestones!
      </div>

      {/* Overview Stats */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Goals Overview</h2>
        <div className="grid grid-3">
          <div className="stat-card">
            <div className="stat-label">Total Saved</div>
            <div className="stat-value">${totalSaved.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <div className="stat-change" style={{ color: 'var(--text-light)' }}>
              Across {goals.length} goals
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Target Amount</div>
            <div className="stat-value">${totalTargets.toLocaleString('en-US', { minimumFractionDigits: 0 })}</div>
            <div className="stat-change" style={{ color: 'var(--text-light)' }}>
              Combined goal targets
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Overall Progress</div>
            <div className="stat-value">{overallProgress.toFixed(1)}%</div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${overallProgress}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Goal Button */}
      <div style={{ marginBottom: '24px' }}>
        <button
          className="btn btn-primary"
          onClick={() => setShowAddGoal(!showAddGoal)}
        >
          {showAddGoal ? 'Cancel' : '+ Add New Goal'}
        </button>
      </div>

      {/* Add Goal Form */}
      {showAddGoal && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '16px' }}>Create New Financial Goal</h3>
          <div style={{ display: 'grid', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Goal Title</label>
              <input
                type="text"
                className="form-input"
                value={newGoal.title}
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                placeholder="e.g., Down Payment for House"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Target Amount ($)</label>
                <input
                  type="number"
                  className="form-input"
                  value={newGoal.targetAmount}
                  onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                  placeholder="50000"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Current Amount ($)</label>
                <input
                  type="number"
                  className="form-input"
                  value={newGoal.currentAmount}
                  onChange={(e) => setNewGoal({ ...newGoal, currentAmount: e.target.value })}
                  placeholder="5000"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={newGoal.category}
                  onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value as any })}
                >
                  <option value="emergency">Emergency Fund</option>
                  <option value="retirement">Retirement</option>
                  <option value="investment">Investment</option>
                  <option value="home">Home Purchase</option>
                  <option value="education">Education</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Target Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                />
              </div>
            </div>

            <button className="btn btn-primary" onClick={handleAddGoal}>
              Create Goal
            </button>
          </div>
        </div>
      )}

      {/* Goals List */}
      <div>
        <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Your Financial Goals</h2>
        {goals.length === 0 ? (
          <div className="empty-state">
            <h3>No goals yet</h3>
            <p>Start by creating your first financial goal!</p>
          </div>
        ) : (
          <div className="grid grid-2">
            {goals.map((goal) => {
              const progress = calculateProgress(goal);
              const daysUntilDeadline = Math.ceil(
                (goal.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
              );

              return (
                <div key={goal.id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '32px' }}>{getCategoryIcon(goal.category)}</span>
                      <div>
                        <h3 style={{ fontSize: '18px', marginBottom: '4px' }}>{goal.title}</h3>
                        <span className="badge" style={{
                          background: '#e5e7eb',
                          color: 'var(--text-dark)',
                          textTransform: 'capitalize'
                        }}>
                          {goal.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 600, fontSize: '20px', color: 'var(--primary-color)' }}>
                        ${goal.currentAmount.toLocaleString()}
                      </span>
                      <span style={{ color: 'var(--text-light)' }}>
                        of ${goal.targetAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                    </div>
                    <div style={{ fontSize: '14px', marginTop: '8px', color: 'var(--text-light)' }}>
                      {progress.toFixed(1)}% complete
                    </div>
                  </div>

                  <div style={{
                    padding: '12px',
                    background: '#f9fafb',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '14px'
                  }}>
                    <span>Target Date:</span>
                    <span style={{ fontWeight: 600 }}>
                      {goal.deadline.toLocaleDateString()}
                      <span style={{ marginLeft: '8px', color: 'var(--text-light)' }}>
                        ({daysUntilDeadline} days)
                      </span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
