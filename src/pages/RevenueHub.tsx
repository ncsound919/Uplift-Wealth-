import { useState } from 'react';
import { revenueIdeas } from '../data/revenueIdeas';

export default function RevenueHub() {
  const [filter, setFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');

  const filteredIdeas = filter === 'all'
    ? revenueIdeas
    : revenueIdeas.filter(idea => idea.difficulty === filter);

  const sortedIdeas = [...filteredIdeas].sort((a, b) => b.skillMatchScore - a.skillMatchScore);

  return (
    <div className="page main-content with-nav">
      <div className="page-header">
        <h1 className="page-title">Revenue Hub 💰</h1>
        <p className="page-description">
          Discover personalized side hustle ideas based on your skills and interests
        </p>
      </div>

      <div className="disclaimer">
        💡 These revenue ideas are suggestions based on your skills. Research each opportunity thoroughly before starting!
      </div>

      {/* Filter Tabs */}
      <div style={{ marginBottom: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {(['all', 'easy', 'medium', 'hard'] as const).map((level) => (
          <button
            key={level}
            className="btn"
            onClick={() => setFilter(level)}
            style={{
              background: filter === level ? 'var(--primary-color)' : '#e5e7eb',
              color: filter === level ? 'white' : 'var(--text-dark)',
            }}
          >
            {level === 'all' ? 'All Ideas' : `${level.charAt(0).toUpperCase() + level.slice(1)} Difficulty`}
          </button>
        ))}
      </div>

      {/* Revenue Ideas Grid */}
      <div className="grid grid-2">
        {sortedIdeas.map((idea) => (
          <div key={idea.id} className="card">
            <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 600 }}>{idea.title}</h3>
              <div style={{
                padding: '4px 12px',
                background: idea.skillMatchScore >= 80 ? '#d1fae5' :
                           idea.skillMatchScore >= 60 ? '#fef3c7' : '#fee2e2',
                color: idea.skillMatchScore >= 80 ? '#065f46' :
                       idea.skillMatchScore >= 60 ? '#92400e' : '#991b1b',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 600,
                whiteSpace: 'nowrap'
              }}>
                {idea.skillMatchScore}% Match
              </div>
            </div>

            <p style={{ color: 'var(--text-light)', marginBottom: '16px', lineHeight: '1.6' }}>
              {idea.description}
            </p>

            <div style={{ display: 'grid', gap: '12px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>💵</span>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-light)' }}>Estimated Revenue</div>
                  <div style={{ fontWeight: 600, color: 'var(--primary-color)' }}>{idea.estimatedRevenueRange}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>⏰</span>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-light)' }}>Time Commitment</div>
                  <div style={{ fontWeight: 600 }}>{idea.timeCommitment}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>📊</span>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-light)' }}>Difficulty</div>
                  <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>{idea.difficulty}</div>
                </div>
              </div>
            </div>

            <button className="btn btn-primary" style={{ width: '100%' }}>
              Learn More
            </button>
          </div>
        ))}
      </div>

      {sortedIdeas.length === 0 && (
        <div className="empty-state">
          <h3>No revenue ideas found</h3>
          <p>Try selecting a different difficulty level</p>
        </div>
      )}
    </div>
  );
}
