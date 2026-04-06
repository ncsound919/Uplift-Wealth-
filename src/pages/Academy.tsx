import { useState } from 'react';
import { learningModules } from '../data/learningModules';
import { LearningModule } from '../types';

export default function Academy() {
  const [selectedModule, setSelectedModule] = useState<LearningModule | null>(null);
  const [filter, setFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');

  const filteredModules = filter === 'all'
    ? learningModules
    : learningModules.filter(m => m.category === filter);

  const handleStartModule = (module: LearningModule) => {
    setSelectedModule(module);
  };

  const handleCompleteModule = () => {
    if (selectedModule) {
      // In real app, would save to backend
      const moduleIndex = learningModules.findIndex(m => m.id === selectedModule.id);
      if (moduleIndex !== -1) {
        learningModules[moduleIndex].completed = true;
      }
      setSelectedModule(null);
    }
  };

  if (selectedModule) {
    return (
      <div className="page main-content with-nav" style={{ maxWidth: '900px' }}>
        <div style={{ marginBottom: '24px' }}>
          <button
            className="btn"
            onClick={() => setSelectedModule(null)}
            style={{ background: '#e5e7eb', marginBottom: '16px' }}
          >
            ← Back to Academy
          </button>
          <h1 className="page-title">{selectedModule.title}</h1>
          <div className="module-meta">
            <span className={`badge badge-${selectedModule.category}`}>{selectedModule.category}</span>
            <span>⏱️ {selectedModule.durationMinutes} minutes</span>
            <span>📚 {selectedModule.topic}</span>
          </div>
        </div>

        <div className="card">
          <div
            style={{
              lineHeight: '1.8',
              fontSize: '16px',
              whiteSpace: 'pre-wrap'
            }}
          >
            {selectedModule.content}
          </div>

          {selectedModule.quizQuestions && selectedModule.quizQuestions.length > 0 && (
            <div style={{ marginTop: '32px', padding: '24px', background: '#f9fafb', borderRadius: '8px' }}>
              <h3 style={{ marginBottom: '16px' }}>Quick Quiz</h3>
              {selectedModule.quizQuestions.map((q, index) => (
                <div key={q.id} style={{ marginBottom: '24px' }}>
                  <p style={{ fontWeight: 600, marginBottom: '12px' }}>
                    {index + 1}. {q.question}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {q.options.map((option, optIndex) => (
                      <label
                        key={optIndex}
                        style={{
                          padding: '12px',
                          background: 'white',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        <input type="radio" name={`question-${q.id}`} style={{ marginRight: '8px' }} />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: '32px', textAlign: 'center' }}>
            <button className="btn btn-primary btn-large" onClick={handleCompleteModule}>
              {selectedModule.completed ? 'Review Complete ✓' : 'Mark as Complete'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page" style={{ marginLeft: '250px' }}>
      <div className="page-header">
        <h1 className="page-title">Financial Literacy Academy 🎓</h1>
        <p className="page-description">
          Master financial concepts with our beginner-friendly courses and guides
        </p>
      </div>

      <div className="disclaimer">
        📚 All educational content is designed to help you build financial literacy. Take your time and learn at your own pace!
      </div>

      {/* Filter Tabs */}
      <div style={{ marginBottom: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((level) => (
          <button
            key={level}
            className="btn"
            onClick={() => setFilter(level)}
            style={{
              background: filter === level ? 'var(--primary-color)' : '#e5e7eb',
              color: filter === level ? 'white' : 'var(--text-dark)',
            }}
          >
            {level.charAt(0).toUpperCase() + level.slice(1)}
          </button>
        ))}
      </div>

      {/* Learning Modules */}
      <div className="grid grid-2">
        {filteredModules.map((module) => (
          <div
            key={module.id}
            className="module-card"
            onClick={() => handleStartModule(module)}
          >
            <div className="module-header">
              <div>
                <h3 className="module-title">{module.title}</h3>
                <div className="module-meta">
                  <span>⏱️ {module.durationMinutes} min</span>
                  <span>📚 {module.topic}</span>
                </div>
              </div>
              {module.completed && (
                <span className="badge badge-completed">Completed ✓</span>
              )}
            </div>
            <p style={{ color: 'var(--text-light)', marginBottom: '12px', lineHeight: '1.5' }}>
              {module.description}
            </p>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span className={`badge badge-${module.category}`}>{module.category}</span>
              {module.quizQuestions && module.quizQuestions.length > 0 && (
                <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>
                  📝 {module.quizQuestions.length} quiz questions
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredModules.length === 0 && (
        <div className="empty-state">
          <h3>No modules found</h3>
          <p>Try selecting a different filter level</p>
        </div>
      )}
    </div>
  );
}
