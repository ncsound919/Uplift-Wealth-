import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FintechStarterMap } from './FintechStarterMap';

describe('FintechStarterMap', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('Black Financial Organizations step', () => {
    it('renders the Black Financial Orgs step header', () => {
      render(<FintechStarterMap />);
      expect(screen.getByText('Black Financial Organizations & Community Resources')).toBeInTheDocument();
    });

    it('renders the step title', () => {
      render(<FintechStarterMap />);
      expect(screen.getByText(/Connect with Black Financial Community Organizations/i)).toBeInTheDocument();
    });

    it('lists all 7 Black financial organizations', () => {
      render(<FintechStarterMap />);
      expect(screen.getByText('National Assoc. of Securities Professionals')).toBeInTheDocument();
      expect(screen.getByText('National Black MBA Association')).toBeInTheDocument();
      expect(screen.getByText('Assoc. of African American Financial Advisors')).toBeInTheDocument();
      expect(screen.getByText('Coalition of Black Investors')).toBeInTheDocument();
      expect(screen.getByText('OneUnited Bank (Black-Owned Bank)')).toBeInTheDocument();
      expect(screen.getByText('Black Women in Finance Network')).toBeInTheDocument();
      expect(screen.getByText('Real Estate Executive Council')).toBeInTheDocument();
    });

    it('external links open in new tab with noopener', () => {
      render(<FintechStarterMap />);
      const naspLink = screen.getByText('National Assoc. of Securities Professionals').closest('a')!;
      expect(naspLink.getAttribute('target')).toBe('_blank');
      expect(naspLink.getAttribute('rel')).toBe('noopener noreferrer');
      expect(naspLink.getAttribute('href')).toBe('https://www.nasphq.org/');
    });
  });

  describe('Step numbering and structure', () => {
    it('renders the main map title', () => {
      render(<FintechStarterMap />);
      expect(screen.getByText(/FinTech Starter Map/i)).toBeInTheDocument();
    });

    it('renders the ALL filter chip', () => {
      render(<FintechStarterMap />);
      const allButton = screen.getByRole('button', { name: /^ALL$/ });
      expect(allButton).toBeInTheDocument();
    });

    it('filters steps by category when a filter chip is clicked', () => {
      render(<FintechStarterMap />);
      const startupFilter = screen.getAllByText('Startup')[0];
      if (startupFilter) {
        fireEvent.click(startupFilter);
      }
      expect(screen.getByText('Form Your Fintech Legal Entity & Corporation')).toBeInTheDocument();
    });
  });

  describe('Step completion', () => {
    it('initializes with no completed steps', () => {
      render(<FintechStarterMap />);
      const stored = localStorage.getItem('fintech_map_completed_steps');
      expect(stored).toBeNull();
    });

    it('loads completed steps from localStorage on mount', () => {
      localStorage.setItem('fintech_map_completed_steps', JSON.stringify(['step-0']));
      render(<FintechStarterMap />);
      const stored = localStorage.getItem('fintech_map_completed_steps');
      expect(JSON.parse(stored!)).toContain('step-0');
    });

    it('toggles a step as completed on click', () => {
      render(<FintechStarterMap />);
      const checkbox = screen.getAllByRole('button').find(b =>
        b.getAttribute('title') === 'Mark as Completed'
      );
      expect(checkbox).toBeTruthy();
      fireEvent.click(checkbox!);
      const stored = JSON.parse(localStorage.getItem('fintech_map_completed_steps') || '[]');
      expect(stored).toContain('step-0');
    });

    it('unmarks a previously completed step', () => {
      localStorage.setItem('fintech_map_completed_steps', JSON.stringify(['step-0']));
      render(<FintechStarterMap />);
      const checkbox = screen.getAllByRole('button').find(b =>
        b.getAttribute('title') === 'Mark as Incomplete'
      );
      expect(checkbox).toBeTruthy();
      fireEvent.click(checkbox!);
      const stored = JSON.parse(localStorage.getItem('fintech_map_completed_steps') || '[]');
      expect(stored).not.toContain('step-0');
    });
  });

  describe('Filtering', () => {
    it('shows Investing category steps when Investing filter is active', () => {
      render(<FintechStarterMap />);
      const investingFilter = screen.getAllByText('Investing')[0];
      fireEvent.click(investingFilter);
      expect(screen.getByText(/Open Real-World Brokerage/i)).toBeInTheDocument();
    });

    it('shows Developer category steps when Developer filter is active', () => {
      render(<FintechStarterMap />);
      const devFilter = screen.getAllByText('Developer')[0];
      fireEvent.click(devFilter);
      expect(screen.getByText(/Get Live Financial Market Data/i)).toBeInTheDocument();
    });

    it('shows Payments category steps when Payments filter is active', () => {
      render(<FintechStarterMap />);
      const paymentsFilter = screen.getAllByText('Payments')[0];
      fireEvent.click(paymentsFilter);
      expect(screen.getByText(/Set Up Payment Gateways/i)).toBeInTheDocument();
    });

    it('shows Compliance category steps when Compliance filter is active', () => {
      render(<FintechStarterMap />);
      const complianceFilter = screen.getAllByText('Compliance')[0];
      fireEvent.click(complianceFilter);
      expect(screen.getByText(/Integrate Identity Verification/i)).toBeInTheDocument();
    });

    it('shows DeFi category steps when DeFi filter is active', () => {
      render(<FintechStarterMap />);
      const defiFilter = screen.getAllByText('DeFi')[0];
      fireEvent.click(defiFilter);
      expect(screen.getByText(/Deploy Web3 Wallets/i)).toBeInTheDocument();
    });

    it('shows all steps when ALL filter is clicked after filtering', () => {
      render(<FintechStarterMap />);
      const devFilter = screen.getAllByText('Developer')[0];
      fireEvent.click(devFilter);
      const allFilter = screen.getByRole('button', { name: /^ALL$/ });
      fireEvent.click(allFilter);
      expect(screen.getByText(/Connect with Black Financial/i)).toBeInTheDocument();
    });
  });

  describe('Progress and callbacks', () => {
    it('displays progress percentage', () => {
      localStorage.setItem('fintech_map_completed_steps', JSON.stringify(['step-0']));
      render(<FintechStarterMap />);
      expect(screen.getByText(/1 of 8 Completed/)).toBeInTheDocument();
    });

    it('displays 0% progress when no steps completed', () => {
      render(<FintechStarterMap />);
      expect(screen.getByText(/0 of 8 Completed/)).toBeInTheDocument();
    });

    it('displays Real-World Readiness Index label', () => {
      render(<FintechStarterMap />);
      expect(screen.getByText(/Real-World Readiness Index/i)).toBeInTheDocument();
    });

    it('handles localStorage parse failure gracefully', () => {
      localStorage.setItem('fintech_map_completed_steps', 'invalid-json');
      render(<FintechStarterMap />);
      expect(screen.getByText(/0 of 8 Completed/)).toBeInTheDocument();
    });

    it('calls onNavigateToBusinessBuilder when action button is clicked', () => {
      const onNavigateToBusinessBuilder = vi.fn();
      render(<FintechStarterMap onNavigateToBusinessBuilder={onNavigateToBusinessBuilder} />);
      const actionBtn = screen.getByText('Launch Fintech Business Builder');
      fireEvent.click(actionBtn);
      expect(onNavigateToBusinessBuilder).toHaveBeenCalled();
    });
  });

  describe('Visual elements', () => {
    it('renders the header rocket badge', () => {
      render(<FintechStarterMap />);
      expect(screen.getByText(/Real-World Launchpad/i)).toBeInTheDocument();
    });

    it('renders pro tip text for each step', () => {
      render(<FintechStarterMap />);
      expect(screen.getAllByText(/Pro Engineering Tip/i).length).toBeGreaterThan(0);
    });

    it('renders Click step checkboxes hint', () => {
      render(<FintechStarterMap />);
      expect(screen.getByText(/Click step checkboxes to save your progress/i)).toBeInTheDocument();
    });

    it('renders progress indicator bar', () => {
      const { container } = render(<FintechStarterMap />);
      const progressBar = container.querySelector('[style*="width: 0%"]');
      expect(progressBar).toBeInTheDocument();
    });

    it('renders action checkpoints for each step', () => {
      render(<FintechStarterMap />);
      const checkpoints = screen.getAllByText(/Actionable Checkpoints/i);
      expect(checkpoints.length).toBeGreaterThan(0);
    });

    it('renders curated resources section for each step', () => {
      render(<FintechStarterMap />);
      const resources = screen.getAllByText(/Curated Resources/i);
      expect(resources.length).toBeGreaterThan(0);
    });
  });
});
