import { useState } from 'react';

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    goals: [] as string[],
    skills: [] as string[],
    experience: 'beginner',
  });

  const goalOptions = [
    'Build emergency fund',
    'Save for retirement',
    'Invest in stocks',
    'Learn about cryptocurrency',
    'Start a side hustle',
    'Buy a home',
    'Pay off debt',
    'Build passive income',
  ];

  const skillOptions = [
    'Writing',
    'Design',
    'Programming',
    'Marketing',
    'Teaching',
    'Photography',
    'Video editing',
    'Customer service',
    'Accounting',
    'Sales',
  ];

  const handleGoalToggle = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }));
  };

  const handleSkillToggle = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Save onboarding data (in real app, would save to backend)
      localStorage.setItem('upliftWealthOnboarding', JSON.stringify(formData));
      onComplete();
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.fullName.trim().length > 0;
      case 2:
        return formData.goals.length > 0;
      case 3:
        return formData.skills.length > 0;
      default:
        return false;
    }
  };

  return (
    <div className="page" style={{ maxWidth: '700px', margin: '0 auto', paddingTop: '60px' }}>
      <div className="card">
        <div style={{ marginBottom: '32px' }}>
          <h1 className="page-title">Welcome to Uplift Wealth! 🎉</h1>
          <p className="page-description">Let's personalize your experience (Step {step} of 3)</p>
          <div className="progress-bar" style={{ marginTop: '20px' }}>
            <div className="progress-fill" style={{ width: `${(step / 3) * 100}%` }}></div>
          </div>
        </div>

        {step === 1 && (
          <div>
            <h2 style={{ marginBottom: '24px' }}>Tell us about yourself</h2>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Enter your name"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Financial Experience Level</label>
              <select
                className="form-select"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              >
                <option value="beginner">Beginner - Just getting started</option>
                <option value="intermediate">Intermediate - Some knowledge and experience</option>
                <option value="advanced">Advanced - Experienced investor</option>
              </select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 style={{ marginBottom: '16px' }}>What are your financial goals?</h2>
            <p style={{ marginBottom: '24px', color: 'var(--text-light)' }}>
              Select all that apply. We'll customize your experience based on your goals.
            </p>
            <div className="checkbox-group">
              {goalOptions.map((goal) => (
                <label key={goal} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.goals.includes(goal)}
                    onChange={() => handleGoalToggle(goal)}
                  />
                  <span>{goal}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 style={{ marginBottom: '16px' }}>What are your skills?</h2>
            <p style={{ marginBottom: '24px', color: 'var(--text-light)' }}>
              This helps us recommend relevant revenue opportunities for you.
            </p>
            <div className="checkbox-group">
              {skillOptions.map((skill) => (
                <label key={skill} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.skills.includes(skill)}
                    onChange={() => handleSkillToggle(skill)}
                  />
                  <span>{skill}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginTop: '32px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          {step > 1 && (
            <button className="btn" onClick={() => setStep(step - 1)} style={{ background: '#e5e7eb' }}>
              Back
            </button>
          )}
          <button
            className="btn btn-primary"
            onClick={handleNext}
            disabled={!canProceed()}
            style={{ opacity: canProceed() ? 1 : 0.5 }}
          >
            {step === 3 ? 'Complete Setup' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
