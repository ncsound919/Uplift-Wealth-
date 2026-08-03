import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CapstoneCanvas } from './CapstoneCanvas';

vi.mock('motion/react', () => {
  const Div = require('react').forwardRef(({ children, ...props }: any, ref: any) => <div ref={ref} {...props}>{children}</div>);
  Div.displayName = 'MotionDiv';
  return { motion: new Proxy({}, { get: () => Div }) };
});

const mockLoad = vi.fn(() => Promise.resolve({ stateData: null }));
const mockSave = vi.fn(() => Promise.resolve());
vi.mock('../lib/apiClient', () => ({
  apiClient: {
    loadSandboxState: (...args: any[]) => (mockLoad as (...args: any[]) => any)(...args),
    saveSandboxState: (...args: any[]) => (mockSave as (...args: any[]) => any)(...args),
  },
}));

const alertMock = vi.fn();
vi.stubGlobal('alert', alertMock);

describe('CapstoneCanvas', () => {
  const mockOnComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockLoad.mockReturnValue(Promise.resolve({ stateData: null }));
  });

  describe('Initial Render', () => {
    it('renders the header title', async () => {
      render(<CapstoneCanvas onComplete={mockOnComplete} />);
      expect(await screen.findByText(/Capstone Project/i)).toBeInTheDocument();
    });

    it('renders the header subtitle', async () => {
      render(<CapstoneCanvas onComplete={mockOnComplete} />);
      expect(await screen.findByText(/Design, structure, and stress-test/i)).toBeInTheDocument();
    });

    it('shows startup name input', async () => {
      render(<CapstoneCanvas onComplete={mockOnComplete} />);
      expect(await screen.findByPlaceholderText(/e\.g\., Payflow/i)).toBeInTheDocument();
    });

    it('shows product vertical select', async () => {
      render(<CapstoneCanvas onComplete={mockOnComplete} />);
      expect(await screen.findByDisplayValue('Payments & Remittances')).toBeInTheDocument();
    });

    it('shows target market select', async () => {
      render(<CapstoneCanvas onComplete={mockOnComplete} />);
      expect(await screen.findByDisplayValue('Gig Economy Workers')).toBeInTheDocument();
    });

    it('shows problem statement textarea', async () => {
      render(<CapstoneCanvas onComplete={mockOnComplete} />);
      expect(await screen.findByPlaceholderText(/Explain what friction/i)).toBeInTheDocument();
    });

    it('shows monetization strategy select', async () => {
      render(<CapstoneCanvas onComplete={mockOnComplete} />);
      expect(await screen.findByDisplayValue('Card Interchange Fees (0.5% - 2%)')).toBeInTheDocument();
    });

    it('shows regulatory framework select', async () => {
      render(<CapstoneCanvas onComplete={mockOnComplete} />);
      expect(await screen.findByDisplayValue('Sponsor Bank BaaS Partnership')).toBeInTheDocument();
    });

    it('shows all compliance checkboxes', async () => {
      render(<CapstoneCanvas onComplete={mockOnComplete} />);
      expect(await screen.findByText(/KYC\/CIP Identity Verification/i)).toBeInTheDocument();
      expect(await screen.findByText(/AML\/FinCEN Screening/i)).toBeInTheDocument();
      expect(await screen.findByText(/PCI-DSS Tokenization/i)).toBeInTheDocument();
      expect(await screen.findByText(/GDPR & CCPA Safeguards/i)).toBeInTheDocument();
    });

    it('shows evaluate button', async () => {
      render(<CapstoneCanvas onComplete={mockOnComplete} />);
      expect(await screen.findByText(/Run Stress-Test & Evaluation/i)).toBeInTheDocument();
    });

    it('shows idle state panel on the right', async () => {
      render(<CapstoneCanvas onComplete={mockOnComplete} />);
      expect(await screen.findByText(/Stress-Test Engine Idle/i)).toBeInTheDocument();
    });

    it('loads sandbox state on mount', async () => {
      render(<CapstoneCanvas onComplete={mockOnComplete} />);
      await waitFor(() => expect(mockLoad).toHaveBeenCalledWith('capstone'));
    });
  });

  describe('Form Interactions', () => {
    it('allows entering startup name', async () => {
      render(<CapstoneCanvas onComplete={mockOnComplete} />);
      const input = await screen.findByPlaceholderText(/e\.g\., Payflow/i);
      fireEvent.change(input, { target: { value: 'FinFlow' } });
      expect(await screen.findByDisplayValue('FinFlow')).toBeInTheDocument();
    });

    it('allows selecting different vertical', async () => {
      render(<CapstoneCanvas onComplete={mockOnComplete} />);
      const select = await screen.findByDisplayValue('Payments & Remittances');
      fireEvent.change(select, { target: { value: 'neobank' } });
      expect(await screen.findByDisplayValue('Neobanking (BaaS)')).toBeInTheDocument();
    });

    it('allows selecting target market', async () => {
      render(<CapstoneCanvas onComplete={mockOnComplete} />);
      const select = await screen.findByDisplayValue('Gig Economy Workers');
      fireEvent.change(select, { target: { value: 'underbanked' } });
      expect(await screen.findByDisplayValue('Underbanked / Immigrant Communities')).toBeInTheDocument();
    });

    it('allows entering problem statement', async () => {
      render(<CapstoneCanvas onComplete={mockOnComplete} />);
      const textarea = await screen.findByPlaceholderText(/Explain what friction/i);
      fireEvent.change(textarea, { target: { value: 'Solving payment friction' } });
      expect(await screen.findByDisplayValue('Solving payment friction')).toBeInTheDocument();
    });

    it('allows changing revenue model', async () => {
      render(<CapstoneCanvas onComplete={mockOnComplete} />);
      const select = await screen.findByDisplayValue('Card Interchange Fees (0.5% - 2%)');
      fireEvent.change(select, { target: { value: 'subscription' } });
      expect(await screen.findByDisplayValue('SaaS Monthly Subscription Fees')).toBeInTheDocument();
    });

    it('allows changing regulatory path', async () => {
      render(<CapstoneCanvas onComplete={mockOnComplete} />);
      const select = await screen.findByDisplayValue('Sponsor Bank BaaS Partnership');
      fireEvent.change(select, { target: { value: 'charter' } });
      expect(await screen.findByDisplayValue('Full Commercial Bank Charter (FDIC)')).toBeInTheDocument();
    });

    it('toggles KYC checkbox', async () => {
      render(<CapstoneCanvas onComplete={mockOnComplete} />);
      const checkbox = await screen.findByRole('checkbox', { name: /KYC/ });
      expect(checkbox).not.toBeChecked();
      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();
    });

    it('toggles AML checkbox', async () => {
      render(<CapstoneCanvas onComplete={mockOnComplete} />);
      const checkbox = await screen.findByRole('checkbox', { name: /AML/ });
      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();
      fireEvent.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    it('toggles PCI checkbox', async () => {
      render(<CapstoneCanvas onComplete={mockOnComplete} />);
      const checkbox = await screen.findByRole('checkbox', { name: /PCI/ });
      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();
    });

    it('toggles privacy checkbox', async () => {
      render(<CapstoneCanvas onComplete={mockOnComplete} />);
      const checkbox = await screen.findByRole('checkbox', { name: /GDPR/ });
      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();
    });
  });

  describe('Validation', () => {
    it('shows alert when evaluating with empty name', async () => {
      render(<CapstoneCanvas onComplete={mockOnComplete} />);
      fireEvent.click(await screen.findByText(/Run Stress-Test & Evaluation/i));
      expect(alertMock).toHaveBeenCalledWith('Please enter a name for your fintech startup!');
    });

    it('does not evaluate with empty name', async () => {
      render(<CapstoneCanvas onComplete={mockOnComplete} />);
      fireEvent.click(await screen.findByText(/Run Stress-Test & Evaluation/i));
      expect(await screen.findByText(/Stress-Test Engine Idle/i)).toBeInTheDocument();
    });
  });

  describe('Evaluation: Payments Vertical', () => {
    it('scores payments + interchange as strong alignment', async () => {
      render(<CapstoneCanvas onComplete={mockOnComplete} />);
      const input = await screen.findByPlaceholderText(/e\.g\., Payflow/i);
      fireEvent.change(input, { target: { value: 'PayFlow' } });
      fireEvent.click(await screen.findByText(/Run Stress-Test & Evaluation/i));
      expect(await screen.findByText(/Strong structural alignment/)).toBeInTheDocument();
    });

    it('scores payments + AUM as mismatch', async () => {
      render(<CapstoneCanvas onComplete={mockOnComplete} />);
      fireEvent.change(await screen.findByPlaceholderText(/e\.g\., Payflow/i), { target: { value: 'PayFlow' } });
      fireEvent.change(await screen.findByDisplayValue('Card Interchange Fees (0.5% - 2%)'), { target: { value: 'aum' } });
      fireEvent.click(await screen.findByText(/Run Stress-Test & Evaluation/i));
      expect(await screen.findByText(/Model mismatch/)).toBeInTheDocument();
    });

    it('scores payments + interest as acceptable', async () => {
      render(<CapstoneCanvas onComplete={mockOnComplete} />);
      fireEvent.change(await screen.findByPlaceholderText(/e\.g\., Payflow/i), { target: { value: 'PayFlow' } });
      fireEvent.change(await screen.findByDisplayValue('Card Interchange Fees (0.5% - 2%)'), { target: { value: 'interest' } });
      fireEvent.click(await screen.findByText(/Run Stress-Test & Evaluation/i));
      expect(await screen.findByText(/Payment flows can generate yield/)).toBeInTheDocument();
    });
  });

  describe('Evaluation: Neobank Vertical', () => {
    it('scores neobank + BaaS as viable', async () => {
      render(<CapstoneCanvas onComplete={mockOnComplete} />);
      fireEvent.change(await screen.findByPlaceholderText(/e\.g\., Payflow/i), { target: { value: 'NeoBank' } });
      fireEvent.change(await screen.findByDisplayValue('Payments & Remittances'), { target: { value: 'neobank' } });
      fireEvent.click(await screen.findByText(/Run Stress-Test & Evaluation/i));
      expect(await screen.findByText(/Partnering with a sponsor bank/)).toBeInTheDocument();
    });

    it('scores neobank + charter as bold', async () => {
      render(<CapstoneCanvas onComplete={mockOnComplete} />);
      fireEvent.change(await screen.findByPlaceholderText(/e\.g\., Payflow/i), { target: { value: 'NeoBank' } });
      fireEvent.change(await screen.findByDisplayValue('Payments & Remittances'), { target: { value: 'neobank' } });
      fireEvent.change(await screen.findByDisplayValue('Sponsor Bank BaaS Partnership'), { target: { value: 'charter' } });
      fireEvent.click(await screen.findByText(/Run Stress-Test & Evaluation/i));
      expect(await screen.findByText(/Bold Strategy/)).toBeInTheDocument();
    });

    it('shows extreme complexity for neobank + charter', async () => {
      render(<CapstoneCanvas onComplete={mockOnComplete} />);
      fireEvent.change(await screen.findByPlaceholderText(/e\.g\., Payflow/i), { target: { value: 'NeoBank' } });
      fireEvent.change(await screen.findByDisplayValue('Payments & Remittances'), { target: { value: 'neobank' } });
      fireEvent.change(await screen.findByDisplayValue('Sponsor Bank BaaS Partnership'), { target: { value: 'charter' } });
      fireEvent.click(await screen.findByText(/Run Stress-Test & Evaluation/i));
      expect(await screen.findByText('Extreme')).toBeInTheDocument();
    });

    it('flags neobank + no regulatory path as critical error', async () => {
      render(<CapstoneCanvas onComplete={mockOnComplete} />);
      fireEvent.change(await screen.findByPlaceholderText(/e\.g\., Payflow/i), { target: { value: 'NeoBank' } });
      fireEvent.change(await screen.findByDisplayValue('Payments & Remittances'), { target: { value: 'neobank' } });
      fireEvent.change(await screen.findByDisplayValue('Sponsor Bank BaaS Partnership'), { target: { value: 'none' } });
      fireEvent.click(await screen.findByText(/Run Stress-Test & Evaluation/i));
      expect(await screen.findByText(/CRITICAL ERROR/)).toBeInTheDocument();
    });
  });

  describe('Evaluation: Lending Vertical', () => {
    it('scores lending + interest as standard', async () => {
      render(<CapstoneCanvas onComplete={mockOnComplete} />);
      fireEvent.change(await screen.findByPlaceholderText(/e\.g\., Payflow/i), { target: { value: 'LendCo' } });
      fireEvent.change(await screen.findByDisplayValue('Payments & Remittances'), { target: { value: 'lending' } });
      fireEvent.change(await screen.findByDisplayValue('Card Interchange Fees (0.5% - 2%)'), { target: { value: 'interest' } });
      fireEvent.click(await screen.findByText(/Run Stress-Test & Evaluation/i));
      expect(await screen.findByText(/Standard model/)).toBeInTheDocument();
    });

    it('scores lending + interchange as warning', async () => {
      render(<CapstoneCanvas onComplete={mockOnComplete} />);
      fireEvent.change(await screen.findByPlaceholderText(/e\.g\., Payflow/i), { target: { value: 'LendCo' } });
      fireEvent.change(await screen.findByDisplayValue('Payments & Remittances'), { target: { value: 'lending' } });
      fireEvent.click(await screen.findByText(/Run Stress-Test & Evaluation/i));
      expect(await screen.findByText(/Economics Warning/)).toBeInTheDocument();
    });
  });

  describe('Evaluation: Wealth Vertical', () => {
    it('scores wealth + AUM as standard alignment', async () => {
      render(<CapstoneCanvas onComplete={mockOnComplete} />);
      fireEvent.change(await screen.findByPlaceholderText(/e\.g\., Payflow/i), { target: { value: 'WealthCo' } });
      fireEvent.change(await screen.findByDisplayValue('Payments & Remittances'), { target: { value: 'wealth' } });
      fireEvent.change(await screen.findByDisplayValue('Card Interchange Fees (0.5% - 2%)'), { target: { value: 'aum' } });
      fireEvent.click(await screen.findByText(/Run Stress-Test & Evaluation/i));
      expect(await screen.findByText(/Standard alignment/)).toBeInTheDocument();
    });

    it('scores wealth + RIA as proper registration', async () => {
      render(<CapstoneCanvas onComplete={mockOnComplete} />);
      fireEvent.change(await screen.findByPlaceholderText(/e\.g\., Payflow/i), { target: { value: 'WealthCo' } });
      fireEvent.change(await screen.findByDisplayValue('Payments & Remittances'), { target: { value: 'wealth' } });
      fireEvent.change(await screen.findByDisplayValue('Sponsor Bank BaaS Partnership'), { target: { value: 'ria' } });
      fireEvent.click(await screen.findByText(/Run Stress-Test & Evaluation/i));
      expect(await screen.findByText(/Proper Registration/)).toBeInTheDocument();
    });
  });

  describe('Compliance Scoring', () => {
    it('deducts points for missing KYC', async () => {
      render(<CapstoneCanvas onComplete={mockOnComplete} />);
      fireEvent.change(await screen.findByPlaceholderText(/e\.g\., Payflow/i), { target: { value: 'TestCo' } });
      fireEvent.click(await screen.findByText(/Run Stress-Test & Evaluation/i));
      expect(await screen.findByText(/Lacking KYC/)).toBeInTheDocument();
    });

    it('deducts points for missing AML', async () => {
      render(<CapstoneCanvas onComplete={mockOnComplete} />);
      fireEvent.change(await screen.findByPlaceholderText(/e\.g\., Payflow/i), { target: { value: 'TestCo' } });
      fireEvent.click(await screen.findByText(/Run Stress-Test & Evaluation/i));
      expect(await screen.findByText(/Missing Automated Transaction Monitoring/)).toBeInTheDocument();
    });

    it('deducts points for missing PCI in payments vertical', async () => {
      render(<CapstoneCanvas onComplete={mockOnComplete} />);
      fireEvent.change(await screen.findByPlaceholderText(/e\.g\., Payflow/i), { target: { value: 'TestCo' } });
      fireEvent.click(await screen.findByText(/Run Stress-Test & Evaluation/i));
      expect(await screen.findByText(/PCI-DSS validation/)).toBeInTheDocument();
    });

    it('adds feedback for enabling compliance checks', async () => {
      render(<CapstoneCanvas onComplete={mockOnComplete} />);
      fireEvent.change(await screen.findByPlaceholderText(/e\.g\., Payflow/i), { target: { value: 'SecureCo' } });
      fireEvent.click(await screen.findByRole('checkbox', { name: /KYC/ }));
      fireEvent.click(await screen.findByRole('checkbox', { name: /AML/ }));
      fireEvent.click(await screen.findByRole('checkbox', { name: /PCI/ }));
      fireEvent.click(await screen.findByRole('checkbox', { name: /GDPR/ }));
      fireEvent.click(await screen.findByText(/Run Stress-Test & Evaluation/i));
      expect(await screen.findByText(/Robust KYC protocols/)).toBeInTheDocument();
    });
  });

  describe('Results Panel', () => {
    it('displays the startup name after evaluation', async () => {
      render(<CapstoneCanvas onComplete={mockOnComplete} />);
      fireEvent.change(await screen.findByPlaceholderText(/e\.g\., Payflow/i), { target: { value: 'FinFlow' } });
      fireEvent.click(await screen.findByText(/Run Stress-Test & Evaluation/i));
      expect(await screen.findByText('FinFlow')).toBeInTheDocument();
    });

    it('displays launch score after evaluation', async () => {
      render(<CapstoneCanvas onComplete={mockOnComplete} />);
      fireEvent.change(await screen.findByPlaceholderText(/e\.g\., Payflow/i), { target: { value: 'FinFlow' } });
      fireEvent.click(await screen.findByText(/Run Stress-Test & Evaluation/i));
      expect(await screen.findByText(/\/100/)).toBeInTheDocument();
    });

    it('displays viability after evaluation', async () => {
      render(<CapstoneCanvas onComplete={mockOnComplete} />);
      fireEvent.change(await screen.findByPlaceholderText(/e\.g\., Payflow/i), { target: { value: 'FinFlow' } });
      fireEvent.click(await screen.findByText(/Run Stress-Test & Evaluation/i));
      expect(await screen.findByText(/Viability/)).toBeInTheDocument();
    });

    it('shows estimated valuation after evaluation', async () => {
      render(<CapstoneCanvas onComplete={mockOnComplete} />);
      fireEvent.change(await screen.findByPlaceholderText(/e\.g\., Payflow/i), { target: { value: 'FinFlow' } });
      fireEvent.click(await screen.findByText(/Run Stress-Test & Evaluation/i));
      expect(await screen.findByText(/Estimated Valuation/)).toBeInTheDocument();
      expect(await screen.findByText(/\$2,000,000/)).toBeInTheDocument();
    });

    it('shows submit capstone button after evaluation', async () => {
      render(<CapstoneCanvas onComplete={mockOnComplete} />);
      fireEvent.change(await screen.findByPlaceholderText(/e\.g\., Payflow/i), { target: { value: 'FinFlow' } });
      fireEvent.click(await screen.findByText(/Run Stress-Test & Evaluation/i));
      expect(await screen.findByText(/Submit Capstone Pitch/)).toBeInTheDocument();
    });

    it('shows high viability text when score >= 85', async () => {
      render(<CapstoneCanvas onComplete={mockOnComplete} />);
      fireEvent.change(await screen.findByPlaceholderText(/e\.g\., Payflow/i), { target: { value: 'HighScore' } });
      fireEvent.click(await screen.findByRole('checkbox', { name: /KYC/ }));
      fireEvent.click(await screen.findByRole('checkbox', { name: /AML/ }));
      fireEvent.click(await screen.findByRole('checkbox', { name: /PCI/ }));
      fireEvent.click(await screen.findByRole('checkbox', { name: /GDPR/ }));
      fireEvent.click(await screen.findByText(/Run Stress-Test & Evaluation/i));
      expect(await screen.findByText(/Launch Score/)).toBeInTheDocument();
      const viabilityElements = screen.getAllByText('High');
      expect(viabilityElements.length).toBeGreaterThanOrEqual(1);
    });

    it('shows low viability text when score < 65', async () => {
      render(<CapstoneCanvas onComplete={mockOnComplete} />);
      fireEvent.change(await screen.findByPlaceholderText(/e\.g\., Payflow/i), { target: { value: 'LowScore' } });
      fireEvent.change(await screen.findByDisplayValue('Payments & Remittances'), { target: { value: 'neobank' } });
      fireEvent.change(await screen.findByDisplayValue('Sponsor Bank BaaS Partnership'), { target: { value: 'none' } });
      fireEvent.click(await screen.findByText(/Run Stress-Test & Evaluation/i));
      expect(await screen.findByText(/Low \(High Risk\)/)).toBeInTheDocument();
    });
  });

  describe('Calls onComplete', () => {
    it('calls onComplete when Submit Capstone Pitch is clicked', async () => {
      render(<CapstoneCanvas onComplete={mockOnComplete} />);
      fireEvent.change(await screen.findByPlaceholderText(/e\.g\., Payflow/i), { target: { value: 'FinFlow' } });
      fireEvent.click(await screen.findByText(/Run Stress-Test & Evaluation/i));
      fireEvent.click(await screen.findByText(/Submit Capstone Pitch/));
      expect(mockOnComplete).toHaveBeenCalled();
    });
  });

  describe('Reset', () => {
    it('shows reset button after evaluation', async () => {
      render(<CapstoneCanvas onComplete={mockOnComplete} />);
      fireEvent.change(await screen.findByPlaceholderText(/e\.g\., Payflow/i), { target: { value: 'FinFlow' } });
      fireEvent.click(await screen.findByText(/Run Stress-Test & Evaluation/i));
      expect(await screen.findByText(/Reset Canvas/)).toBeInTheDocument();
    });

    it('resets form when reset button clicked', async () => {
      render(<CapstoneCanvas onComplete={mockOnComplete} />);
      fireEvent.change(await screen.findByPlaceholderText(/e\.g\., Payflow/i), { target: { value: 'FinFlow' } });
      fireEvent.click(await screen.findByText(/Run Stress-Test & Evaluation/i));
      fireEvent.click(await screen.findByText(/Reset Canvas/));
      await waitFor(() => {
        const input = screen.getByPlaceholderText(/e\.g\., Payflow/i) as HTMLInputElement;
        expect(input.value).toBe('');
      });
      expect(await screen.findByText(/Stress-Test Engine Idle/)).toBeInTheDocument();
    });

    it('resets compliance checkboxes on reset', async () => {
      render(<CapstoneCanvas onComplete={mockOnComplete} />);
      fireEvent.change(await screen.findByPlaceholderText(/e\.g\., Payflow/i), { target: { value: 'FinFlow' } });
      const kycCheckbox = await screen.findByRole('checkbox', { name: /KYC/ });
      fireEvent.click(kycCheckbox);
      fireEvent.click(await screen.findByText(/Run Stress-Test & Evaluation/i));
      fireEvent.click(await screen.findByText(/Reset Canvas/));
      await waitFor(() => {
        const resetCheckbox = screen.getByRole('checkbox', { name: /KYC/ });
        expect(resetCheckbox).not.toBeChecked();
      });
    });
  });

  describe('Sandbox State Loading', () => {
    it('restores startup name from saved state', async () => {
      mockLoad.mockReturnValue(Promise.resolve({
        stateData: { startupName: 'RestoredCo', vertical: 'payments', problem: 'test', complianceChecklist: { kyc: false, pci: false, mfa: false, aml: false, privacy: false }, evaluated: false, score: 0 },
      }));
      render(<CapstoneCanvas onComplete={mockOnComplete} />);
      expect(await screen.findByDisplayValue('RestoredCo')).toBeInTheDocument();
    });

    it('restores evaluated state from saved state', async () => {
      mockLoad.mockReturnValue(Promise.resolve({
        stateData: { startupName: 'EvalCo', vertical: 'payments', problem: 'test', complianceChecklist: { kyc: true, pci: true, mfa: false, aml: true, privacy: true }, evaluated: true, score: 85 },
      }));
      render(<CapstoneCanvas onComplete={mockOnComplete} />);
      expect(await screen.findByText('EvalCo')).toBeInTheDocument();
    });
  });

  describe('Auto-Save', () => {
    it('calls saveSandboxState when startup name is entered', async () => {
      render(<CapstoneCanvas onComplete={mockOnComplete} />);
      fireEvent.change(await screen.findByPlaceholderText(/e\.g\., Payflow/i), { target: { value: 'AutoSaveCo' } });
      await waitFor(() => expect(mockSave).toHaveBeenCalled());
    });
  });

  describe('Edge Cases', () => {
    it('handles state load errors gracefully', async () => {
      mockLoad.mockRejectedValue(new Error('Server error'));
      render(<CapstoneCanvas onComplete={mockOnComplete} />);
      expect(await screen.findByText(/Capstone Project/i)).toBeInTheDocument();
    });

    it('handles save errors gracefully', async () => {
      mockSave.mockRejectedValue(new Error('Save error'));
      render(<CapstoneCanvas onComplete={mockOnComplete} />);
      fireEvent.change(await screen.findByPlaceholderText(/e\.g\., Payflow/i), { target: { value: 'SaveTest' } });
      expect(await screen.findByDisplayValue('SaveTest')).toBeInTheDocument();
    });

    it('disables form inputs after evaluation', async () => {
      render(<CapstoneCanvas onComplete={mockOnComplete} />);
      fireEvent.change(await screen.findByPlaceholderText(/e\.g\., Payflow/i), { target: { value: 'LockedCo' } });
      fireEvent.click(await screen.findByText(/Run Stress-Test & Evaluation/i));
      const input = await screen.findByPlaceholderText(/e\.g\., Payflow/i);
      expect(input).toBeDisabled();
    });

    it('disables compliance checkboxes after evaluation', async () => {
      render(<CapstoneCanvas onComplete={mockOnComplete} />);
      fireEvent.change(await screen.findByPlaceholderText(/e\.g\., Payflow/i), { target: { value: 'LockedCo' } });
      fireEvent.click(await screen.findByText(/Run Stress-Test & Evaluation/i));
      const kycCheckbox = await screen.findByRole('checkbox', { name: /KYC/ });
      expect(kycCheckbox).toBeDisabled();
    });

    it('caps score at 100 maximum', async () => {
      render(<CapstoneCanvas onComplete={mockOnComplete} />);
      fireEvent.change(await screen.findByPlaceholderText(/e\.g\., Payflow/i), { target: { value: 'MaxScore' } });
      fireEvent.click(await screen.findByRole('checkbox', { name: /KYC/ }));
      fireEvent.click(await screen.findByRole('checkbox', { name: /AML/ }));
      fireEvent.click(await screen.findByRole('checkbox', { name: /PCI/ }));
      fireEvent.click(await screen.findByRole('checkbox', { name: /GDPR/ }));
      fireEvent.change(await screen.findByDisplayValue('Card Interchange Fees (0.5% - 2%)'), { target: { value: 'aum' } });
      fireEvent.click(await screen.findByText(/Run Stress-Test & Evaluation/i));
      const scoreText = (await screen.findByText(/\/100/)).textContent!;
      const score = parseInt(scoreText.replace(/\/100/, ''));
      expect(score).toBeLessThanOrEqual(100);
    });

    it('floors score at 0 minimum', async () => {
      render(<CapstoneCanvas onComplete={mockOnComplete} />);
      fireEvent.change(await screen.findByPlaceholderText(/e\.g\., Payflow/i), { target: { value: 'MinScore' } });
      fireEvent.change(await screen.findByDisplayValue('Payments & Remittances'), { target: { value: 'neobank' } });
      fireEvent.change(await screen.findByDisplayValue('Sponsor Bank BaaS Partnership'), { target: { value: 'none' } });
      fireEvent.change(await screen.findByDisplayValue('Card Interchange Fees (0.5% - 2%)'), { target: { value: 'aum' } });
      fireEvent.click(await screen.findByText(/Run Stress-Test & Evaluation/i));
      const scoreText = (await screen.findByText(/\/100/)).textContent!;
      const score = parseInt(scoreText.replace(/\/100/, ''));
      expect(score).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Vertical Label', () => {
    it('displays correct vertical label for payments', async () => {
      render(<CapstoneCanvas onComplete={mockOnComplete} />);
      fireEvent.change(await screen.findByPlaceholderText(/e\.g\., Payflow/i), { target: { value: 'TestCo' } });
      fireEvent.click(await screen.findByText(/Run Stress-Test & Evaluation/i));
      expect(await screen.findByText('Payments & Remittance')).toBeInTheDocument();
    });

    it('displays correct vertical label for insurtech', async () => {
      render(<CapstoneCanvas onComplete={mockOnComplete} />);
      fireEvent.change(await screen.findByPlaceholderText(/e\.g\., Payflow/i), { target: { value: 'InsureCo' } });
      fireEvent.change(await screen.findByDisplayValue('Payments & Remittances'), { target: { value: 'insurtech' } });
      fireEvent.click(await screen.findByText(/Run Stress-Test & Evaluation/i));
      expect(await screen.findByText('Insurtech & Parametrics')).toBeInTheDocument();
    });

    it('displays correct vertical label for crypto', async () => {
      render(<CapstoneCanvas onComplete={mockOnComplete} />);
      fireEvent.change(await screen.findByPlaceholderText(/e\.g\., Payflow/i), { target: { value: 'CryptoCo' } });
      fireEvent.change(await screen.findByDisplayValue('Payments & Remittances'), { target: { value: 'crypto' } });
      fireEvent.click(await screen.findByText(/Run Stress-Test & Evaluation/i));
      expect(await screen.findByText('Crypto & Digital Assets')).toBeInTheDocument();
    });

    it('displays default vertical label for an unknown vertical', async () => {
      mockLoad.mockReturnValue(Promise.resolve({
        stateData: { startupName: 'MysteryCo', vertical: 'quantum', problem: 'test', complianceChecklist: { kyc: false, pci: false, mfa: false, aml: false, privacy: false }, evaluated: false, score: 0 },
      }));
      render(<CapstoneCanvas onComplete={mockOnComplete} />);
      fireEvent.click(await screen.findByText(/Run Stress-Test & Evaluation/i));
      expect(await screen.findByText('Fintech Product')).toBeInTheDocument();
    });
  });
});
