import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AdminDashboard } from './AdminDashboard';

vi.mock('../lib/experiments', () => ({
  ACTIVE_EXPERIMENTS: [
    {
      key: 'onboarding-flow',
      name: 'Onboarding Flow Redesign',
      description: 'Tests the new guided onboarding vs. the current sidebar-first experience.',
      variants: ['control', 'guided-tour'],
      trafficSplit: [50, 50],
      metric: 'lesson_start (first 7 days)',
    },
  ],
  getVariant: () => 'control',
}));

describe('AdminDashboard', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('renders the admin header', () => {
    render(<AdminDashboard />);
    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
    expect(screen.getByText('Dashboard', { selector: 'h2' })).toBeInTheDocument();
  });

  it('shows Analytics Disabled when no PostHog key is set', () => {
    render(<AdminDashboard />);
    expect(screen.getByText('Analytics Disabled')).toBeInTheDocument();
  });

  it('shows a notice about configuring PostHog', () => {
    render(<AdminDashboard />);
    expect(screen.getByText('Analytics Not Configured')).toBeInTheDocument();
  });

  it('lists the feature flags with their keys', () => {
    render(<AdminDashboard />);
    expect(screen.getByText('New Onboarding Flow')).toBeInTheDocument();
    expect(screen.getByText('New Dashboard Layout')).toBeInTheDocument();
    expect(screen.getByText('Glossary Beta Badge')).toBeInTheDocument();
    expect(screen.getByText('Market Data Beta Badge')).toBeInTheDocument();
    expect(screen.getByText('new-dashboard')).toBeInTheDocument();
  });

  it('toggles a feature flag override on click', () => {
    render(<AdminDashboard />);
    const newDashboardLabel = screen.getByText('New Dashboard Layout');
    const row = newDashboardLabel.closest('div.flex.items-center.justify-between')!;
    const toggleButton = row.querySelector('button[type="button"]')!;

    expect(toggleButton).toBeInTheDocument();
    fireEvent.click(toggleButton);
    const stored = localStorage.getItem('fintech_feature_overrides');
    expect(stored).toBeTruthy();
    expect(JSON.parse(stored!)).toHaveProperty('new-dashboard', true);
  });

  it('clears a feature flag override on second click', () => {
    localStorage.setItem('fintech_feature_overrides', JSON.stringify({ 'new-dashboard': true }));
    render(<AdminDashboard />);
    const newDashboardLabel = screen.getByText('New Dashboard Layout');
    const row = newDashboardLabel.closest('div.flex.items-center.justify-between')!;
    const toggleButton = row.querySelector('button[type="button"]')!;

    fireEvent.click(toggleButton);
    const stored = JSON.parse(localStorage.getItem('fintech_feature_overrides') || '{}');
    expect(stored).not.toHaveProperty('new-dashboard');
  });

  it('resets all overrides when Reset button is clicked', () => {
    localStorage.setItem('fintech_feature_overrides', JSON.stringify({ 'new-dashboard': true }));
    render(<AdminDashboard />);
    const resetButton = screen.getByText('Reset');
    expect(resetButton).toBeInTheDocument();
    fireEvent.click(resetButton);
    expect(localStorage.getItem('fintech_feature_overrides')).toBeNull();
  });

  it('shows experiments in the A/B experiments panel', () => {
    render(<AdminDashboard />);
    expect(screen.getByText('Onboarding Flow Redesign')).toBeInTheDocument();
  });

  it('displays the assigned variant for an experiment', () => {
    render(<AdminDashboard />);
    expect(screen.getByText('control')).toBeInTheDocument();
  });
});

describe('AdminDashboard with PostHog key', () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    vi.unstubAllEnvs();
  });

  it('shows PostHog Connected when key is set', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'test-key');
    const { AdminDashboard: AD } = await import('./AdminDashboard');
    render(<AD />);
    expect(screen.getByText('PostHog Connected')).toBeInTheDocument();
  });

  it('shows PostHog Insights section when key is set', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'test-key');
    const { AdminDashboard: AD } = await import('./AdminDashboard');
    render(<AD />);
    expect(screen.getByText('PostHog Insights')).toBeInTheDocument();
    expect(screen.queryByText('Analytics Disabled')).not.toBeInTheDocument();
    expect(screen.queryByText('Analytics Not Configured')).not.toBeInTheDocument();
  });
});


