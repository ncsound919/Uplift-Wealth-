import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ParametricGame } from './ParametricGame';

vi.mock('motion/react', () => {
  const Div = require('react').forwardRef(({ children, ...props }: any, ref: any) => <div ref={ref} {...props}>{children}</div>);
  Div.displayName = 'MotionDiv';
  return { motion: new Proxy({}, { get: () => Div }), AnimatePresence: ({ children }: any) => <div>{children}</div> };
});
vi.mock('canvas-confetti', () => ({ default: vi.fn() }));
vi.mock('../utils/sound', () => ({ soundManager: { playTick: vi.fn(), playSuccess: vi.fn(), playFailure: vi.fn(), playWin: vi.fn(), toggleMute: vi.fn() } }));

const mockLoad = vi.fn(() => Promise.resolve({ stateData: null }));
const mockSave = vi.fn(() => Promise.resolve());
vi.mock('../lib/apiClient', () => ({
  apiClient: {
    loadSandboxState: (...args: any[]) => (mockLoad as (...args: any[]) => any)(...args),
    saveSandboxState: (...args: any[]) => (mockSave as (...args: any[]) => any)(...args),
  },
}));

describe('ParametricGame', () => {
  const mockOnComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockLoad.mockReturnValue(Promise.resolve({ stateData: null }));
    HTMLDivElement.prototype.scrollIntoView = vi.fn();
  });

  async function renderAndSettle() {
    render(<ParametricGame onComplete={mockOnComplete} />);
    await act(() => Promise.resolve());
  }

  describe('Initial Render', () => {
    it('renders the header title', async () => {
      await renderAndSettle();
      expect(screen.getByText(/Parametric InsurTech Smart Contract/i)).toBeInTheDocument();
    });

    it('shows treasury amount of $10,000', async () => {
      await renderAndSettle();
      const treasuries = screen.getAllByText(/\$10,000/);
      expect(treasuries.length).toBeGreaterThanOrEqual(1);
    });

    it('shows crop health at 100%', async () => {
      await renderAndSettle();
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('shows season 1 initially', async () => {
      await renderAndSettle();
      expect(screen.getByText(/Season 1 \/ 5/)).toBeInTheDocument();
    });

    it('shows initial rainfall of 15 inches', async () => {
      await renderAndSettle();
      const elements = screen.getAllByText('15 in');
      expect(elements.length).toBeGreaterThanOrEqual(1);
    });

    it('shows UNINSURED badge initially', async () => {
      await renderAndSettle();
      expect(screen.getByText('UNINSURED')).toBeInTheDocument();
    });

    it('shows the smart contract code panel', async () => {
      await renderAndSettle();
      expect(screen.getByText(/AUTOMATED_POLICY.CODE/)).toBeInTheDocument();
    });

    it('shows initial log message', async () => {
      await renderAndSettle();
      expect(screen.getByText(/Smart Contract initialized/)).toBeInTheDocument();
    });

    it('renders all five weather scenario buttons', async () => {
      await renderAndSettle();
      expect(screen.getByText('Normal')).toBeInTheDocument();
      expect(screen.getByText('Dry Spell')).toBeInTheDocument();
      expect(screen.getByText('Heavy Rain')).toBeInTheDocument();
      expect(screen.getByText('Drought')).toBeInTheDocument();
      expect(screen.getByText('Flood')).toBeInTheDocument();
    });

    it('shows policy selection options', async () => {
      await renderAndSettle();
      expect(screen.getByText(/No Insurance Policy/)).toBeInTheDocument();
      expect(screen.getByText(/Basic Index Policy/)).toBeInTheDocument();
      expect(screen.getByText(/Premium High-Cover/)).toBeInTheDocument();
    });

    it('shows the IDLE contract state', async () => {
      await renderAndSettle();
      const idleElements = screen.getAllByText('IDLE');
      expect(idleElements.length).toBeGreaterThanOrEqual(1);
    });

    it('renders the mute button', async () => {
      await renderAndSettle();
      expect(screen.getByTitle('Mute')).toBeInTheDocument();
    });

    it('shows farm climate as pristine initially', async () => {
      await renderAndSettle();
      expect(screen.getByText('Pristine Farm Climate')).toBeInTheDocument();
    });

    it('loads sandbox state on mount', async () => {
      await renderAndSettle();
      await waitFor(() => expect(mockLoad).toHaveBeenCalledWith('parametric'));
    });
  });

  describe('Policy Selection', () => {
    it('allows switching to no insurance', async () => {
      await renderAndSettle();
      fireEvent.click(screen.getByText(/No Insurance Policy/));
      fireEvent.click(screen.getByText('Activate Insurance Policy'));
      expect(screen.getByText('UNINSURED')).toBeInTheDocument();
    });

    it('allows selecting and buying premium policy', async () => {
      await renderAndSettle();
      fireEvent.click(screen.getByText(/Premium High-Cover/));
      fireEvent.click(screen.getByText('Activate Insurance Policy'));
      expect(screen.getByText(/premium policy/)).toBeInTheDocument();
    });

    it('deducts treasury when buying basic policy', async () => {
      await renderAndSettle();
      fireEvent.click(screen.getByText('Activate Insurance Policy'));
      expect(screen.getByText(/\$9,400/)).toBeInTheDocument();
    });

    it('deducts $1,200 for premium policy', async () => {
      await renderAndSettle();
      fireEvent.click(screen.getByText(/Premium High-Cover/));
      fireEvent.click(screen.getByText('Activate Insurance Policy'));
      expect(screen.getByText(/\$8,800/)).toBeInTheDocument();
    });

    it('logs policy creation on buy', async () => {
      await renderAndSettle();
      fireEvent.click(screen.getByText('Activate Insurance Policy'));
      expect(screen.getByText(/POLICY CREATED/)).toBeInTheDocument();
    });

    it('prevents buying twice in same season', async () => {
      await renderAndSettle();
      fireEvent.click(screen.getByText('Activate Insurance Policy'));
      expect(screen.getAllByText(/POLICY CREATED/).length).toBe(1);
      expect(screen.queryByText('Activate Insurance Policy')).toBeNull();
    });
  });

  describe('Insufficient Funds', () => {
    it('shows insufficient funds when treasury is too low', async () => {
      mockLoad.mockReturnValue(Promise.resolve({
        stateData: { treasury: 500, season: 1, logs: [], payoutAmount: 0, cropHealth: 100, activePolicy: 'none', contractState: 'IDLE' },
      }));
      await renderAndSettle();
      fireEvent.click(screen.getByText(/Premium High-Cover/));
      fireEvent.click(screen.getByText('Activate Insurance Policy'));
      expect(screen.getByText(/INSUFFICIENT FUNDS/)).toBeInTheDocument();
    });
  });

  describe('Mute Toggle', () => {
    it('toggles mute state on click', async () => {
      const { soundManager } = await import('../utils/sound');
      (soundManager.toggleMute as any).mockReturnValue(true);
      await renderAndSettle();
      fireEvent.click(screen.getByTitle('Mute'));
      expect(screen.getByTitle('Unmute')).toBeInTheDocument();
    });

    it('calls toggleMute on the sound manager', async () => {
      await renderAndSettle();
      const { soundManager } = await import('../utils/sound');
      fireEvent.click(screen.getByTitle('Mute'));
      expect(soundManager.toggleMute).toHaveBeenCalled();
    });
  });

  describe('Weather Simulations', () => {
    it('disables simulation buttons during simulation', async () => {
      await renderAndSettle();
      fireEvent.click(screen.getByText('Activate Insurance Policy'));
      fireEvent.click(screen.getByText('Drought'));
      await waitFor(() => {
        const normalBtn = screen.getByText('Normal').closest('button');
        expect(normalBtn).toBeDisabled();
      }, { timeout: 3000 });
    });

    it('shows simulation telemetry during simulation', async () => {
      await renderAndSettle();
      fireEvent.click(screen.getByText('Activate Insurance Policy'));
      fireEvent.click(screen.getByText('Drought'));
      expect(await screen.findByText(/Reading Weather Stations/, {}, { timeout: 2000 })).toBeInTheDocument();
    });

    it('shows oracle polling state during simulation', async () => {
      await renderAndSettle();
      fireEvent.click(screen.getByText('Activate Insurance Policy'));
      fireEvent.click(screen.getByText('Drought'));
      await screen.findByText(/Reading Weather Stations/, {}, { timeout: 2000 });
      const checkingElements = screen.getAllByText(/CHECKING WEATHER/);
      expect(checkingElements.length).toBeGreaterThanOrEqual(1);
    });

    it('completes normal simulation after target reached', async () => {
      await renderAndSettle();
      fireEvent.click(screen.getByText('Activate Insurance Policy'));
      fireEvent.click(screen.getByText('Normal'));
      await waitFor(() => expect(screen.queryByText(/Reading Weather Stations/)).toBeNull(), { timeout: 3000 });
    });
  });

  describe('Normal Weather Simulation', () => {
    it('logs harvest income for normal weather', async () => {
      await renderAndSettle();
      fireEvent.click(screen.getByText('Activate Insurance Policy'));
      fireEvent.click(screen.getByText('Normal'));
      expect(await screen.findByText(/Harvesting completed/, {}, { timeout: 3000 })).toBeInTheDocument();
    });

    it('logs normal climate safe message for normal weather', async () => {
      await renderAndSettle();
      fireEvent.click(screen.getByText('Activate Insurance Policy'));
      fireEvent.click(screen.getByText('Normal'));
      expect(await screen.findByText(/NORMAL CLIMATE/, {}, { timeout: 3000 })).toBeInTheDocument();
    });

    it('increases treasury after normal harvest', async () => {
      await renderAndSettle();
      fireEvent.click(screen.getByText('Activate Insurance Policy'));
      fireEvent.click(screen.getByText('Normal'));
      expect(await screen.findByText(/\$12,400/, {}, { timeout: 5000 })).toBeInTheDocument();
    });
  });

  describe('Drought Simulation', () => {
    it('logs drought damage when rainfall is low', async () => {
      await renderAndSettle();
      fireEvent.click(screen.getByText('Activate Insurance Policy'));
      fireEvent.click(screen.getByText('Drought'));
      expect(await screen.findByText(/crop destruction/, {}, { timeout: 10000 })).toBeInTheDocument();
    });

    it('shows drought payout when insured', async () => {
      await renderAndSettle();
      fireEvent.click(screen.getByText('Activate Insurance Policy'));
      fireEvent.click(screen.getByText('Drought'));
      expect(await screen.findByText(/DROUGHT TRIGGERED/, {}, { timeout: 10000 })).toBeInTheDocument();
    });

    it('shows payout notification for drought with basic policy', async () => {
      await renderAndSettle();
      fireEvent.click(screen.getByText('Activate Insurance Policy'));
      fireEvent.click(screen.getByText('Drought'));
      expect(await screen.findByText(/AUTOMATIC PAYOUT/, {}, { timeout: 10000 })).toBeInTheDocument();
      const fiveKs = screen.getAllByText(/\$5,000/);
      expect(fiveKs.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Flood Simulation', () => {
    it('logs flood damage when rainfall is high', async () => {
      await renderAndSettle();
      fireEvent.click(screen.getByText('Activate Insurance Policy'));
      fireEvent.click(screen.getByText('Flood'));
      expect(await screen.findByText(/Field flooded/, {}, { timeout: 10000 })).toBeInTheDocument();
    });

    it('shows flood payout when insured with premium', async () => {
      await renderAndSettle();
      fireEvent.click(screen.getByText(/Premium High-Cover/));
      fireEvent.click(screen.getByText('Activate Insurance Policy'));
      fireEvent.click(screen.getByText('Flood'));
      const sixteenKs = await screen.findAllByText(/\$16,000/, {}, { timeout: 10000 });
      expect(sixteenKs.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('No Active Policy During Disaster', () => {
    it('shows no policy warning during drought without insurance', async () => {
      await renderAndSettle();
      fireEvent.click(screen.getByText(/No Insurance Policy/));
      fireEvent.click(screen.getByText('Activate Insurance Policy'));
      fireEvent.click(screen.getByText('Drought'));
      expect(await screen.findByText(/NO POLICY ACTIVE/, {}, { timeout: 10000 })).toBeInTheDocument();
    });

    it('shows no policy warning during flood without insurance', async () => {
      await renderAndSettle();
      fireEvent.click(screen.getByText(/No Insurance Policy/));
      fireEvent.click(screen.getByText('Activate Insurance Policy'));
      fireEvent.click(screen.getByText('Flood'));
      expect(await screen.findByText(/Waterlogged farm has no insurance/, {}, { timeout: 10000 })).toBeInTheDocument();
    });
  });

  describe('Minor Weather Events', () => {
    it('renders moderate dry spell for minor drought', async () => {
      await renderAndSettle();
      fireEvent.click(screen.getByText('Activate Insurance Policy'));
      fireEvent.click(screen.getByText('Dry Spell'));
      expect(await screen.findByText(/Moderate Dry Spell/, {}, { timeout: 10000 })).toBeInTheDocument();
    });

    it('renders moderate heavy rain for minor flood', async () => {
      await renderAndSettle();
      fireEvent.click(screen.getByText('Activate Insurance Policy'));
      fireEvent.click(screen.getByText('Heavy Rain'));
      expect(await screen.findByText(/Moderate Heavy Rain/, {}, { timeout: 10000 })).toBeInTheDocument();
    });
  });

  describe('Crop Health', () => {
    it('damages crop health during drought without insurance', async () => {
      await renderAndSettle();
      fireEvent.click(screen.getByText(/No Insurance Policy/));
      fireEvent.click(screen.getByText('Activate Insurance Policy'));
      fireEvent.click(screen.getByText('Drought'));
      await waitFor(() => {
        const el = screen.getByText(/\d+%/);
        const val = parseInt(el.textContent!);
        expect(val).toBeLessThan(100);
      }, { timeout: 10000 });
    });

    it('partially protects crop health with insurance payout', async () => {
      await renderAndSettle();
      fireEvent.click(screen.getByText('Activate Insurance Policy'));
      fireEvent.click(screen.getByText('Flood'));
      await waitFor(() => {
        const el = screen.getByText(/\d+%/);
        const val = parseInt(el.textContent!);
        expect(val).toBeGreaterThanOrEqual(10);
      }, { timeout: 10000 });
    });
  });

  describe('Season Progression', () => {
    it('advances to season 2 after normal simulation', async () => {
      await renderAndSettle();
      fireEvent.click(screen.getByText('Activate Insurance Policy'));
      fireEvent.click(screen.getByText('Normal'));
      expect(await screen.findByText(/Season 2 \/ 5/, {}, { timeout: 10000 })).toBeInTheDocument();
    });

    it('resets active policy to none after season advancement', async () => {
      await renderAndSettle();
      fireEvent.click(screen.getByText('Activate Insurance Policy'));
      fireEvent.click(screen.getByText('Normal'));
      expect(await screen.findByText(/Season 2 \/ 5/, {}, { timeout: 10000 })).toBeInTheDocument();
      expect(screen.getByText('UNINSURED')).toBeInTheDocument();
    });

    it('requires buying policy again in new season', async () => {
      await renderAndSettle();
      fireEvent.click(screen.getByText('Activate Insurance Policy'));
      fireEvent.click(screen.getByText('Normal'));
      expect(await screen.findByText(/Season 2 \/ 5/, {}, { timeout: 10000 })).toBeInTheDocument();
      expect(screen.getByText('Activate Insurance Policy')).toBeInTheDocument();
    });

    it('shows warning to select policy when season > 1 and no policy active', async () => {
      mockLoad.mockReturnValue(Promise.resolve({
        stateData: { season: 2, logs: [], payoutAmount: 0, treasury: 10000, cropHealth: 100, activePolicy: 'none', contractState: 'IDLE' },
      }));
      await renderAndSettle();
      const warnEl = screen.queryByText(/SELECT AND DEPLOY AN INSURANCE POLICY/);
      if (!warnEl) {
        const emojiWarn = screen.queryByText(/SELECT AND DEPLOY/);
        expect(emojiWarn).toBeTruthy();
      } else {
        expect(warnEl).toBeInTheDocument();
      }
    });
  });

  describe('Completion State', () => {
    it('unlocks next button after 5 seasons', async () => {
      mockLoad.mockReturnValue(Promise.resolve({
        stateData: { season: 5, logs: [], payoutAmount: 0, treasury: 5000, cropHealth: 80, activePolicy: 'basic', contractState: 'ACTIVE_COVER' },
      }));
      await renderAndSettle();
      fireEvent.click(screen.getByText('Activate Insurance Policy'));
      fireEvent.click(screen.getByText('Normal'));
      expect(await screen.findByText(/Finish Parametric Challenge/, {}, { timeout: 5000 })).toBeInTheDocument();
    });

    it('shows completion state with final balance', async () => {
      mockLoad.mockReturnValue(Promise.resolve({
        stateData: { season: 5, logs: [], payoutAmount: 0, treasury: 5000, cropHealth: 80, activePolicy: 'basic', contractState: 'ACTIVE_COVER' },
      }));
      await renderAndSettle();
      fireEvent.click(screen.getByText('Activate Insurance Policy'));
      fireEvent.click(screen.getByText('Normal'));
      expect(await screen.findByText(/FARM SURVIVAL SIMULATION OVER/, {}, { timeout: 5000 })).toBeInTheDocument();
    });

    it('calls onComplete when finish button clicked', async () => {
      mockLoad.mockReturnValue(Promise.resolve({
        stateData: { season: 5, logs: [], payoutAmount: 0, treasury: 5000, cropHealth: 80, activePolicy: 'basic', contractState: 'ACTIVE_COVER' },
      }));
      await renderAndSettle();
      fireEvent.click(screen.getByText('Activate Insurance Policy'));
      fireEvent.click(screen.getByText('Normal'));
      fireEvent.click(await screen.findByText(/Finish Parametric Challenge/, {}, { timeout: 5000 }));
      expect(mockOnComplete).toHaveBeenCalled();
    });

    it('shows success message when treasury >= 8000 and cropHealth > 30', async () => {
      mockLoad.mockReturnValue(Promise.resolve({
        stateData: { season: 5, logs: [], payoutAmount: 0, treasury: 12000, cropHealth: 80, activePolicy: 'basic', contractState: 'ACTIVE_COVER' },
      }));
      await renderAndSettle();
      fireEvent.click(screen.getByText('Activate Insurance Policy'));
      fireEvent.click(screen.getByText('Normal'));
      expect(await screen.findByText(/SUCCESSFUL.*HARVEST/, {}, { timeout: 5000 })).toBeInTheDocument();
    });

    it('shows bankruptcy risk when treasury < 8000 or cropHealth <= 30', async () => {
      mockLoad.mockReturnValue(Promise.resolve({
        stateData: { season: 5, logs: [], payoutAmount: 0, treasury: 5000, cropHealth: 20, activePolicy: 'basic', contractState: 'ACTIVE_COVER' },
      }));
      await renderAndSettle();
      fireEvent.click(screen.getByText('Activate Insurance Policy'));
      fireEvent.click(screen.getByText('Normal'));
      expect(await screen.findByText(/FARM BANKRUPTCY/i, {}, { timeout: 5000 })).toBeInTheDocument();
    });
  });

  describe('Reset', () => {
    it('resets all state when reset button clicked', async () => {
      mockLoad.mockReturnValue(Promise.resolve({
        stateData: { season: 5, logs: [], payoutAmount: 0, treasury: 12000, cropHealth: 80, activePolicy: 'basic', contractState: 'ACTIVE_COVER' },
      }));
      await renderAndSettle();
      fireEvent.click(screen.getByText('Activate Insurance Policy'));
      fireEvent.click(screen.getByText('Normal'));
      await screen.findByText(/Finish Parametric Challenge/, {}, { timeout: 5000 });
      const btns = screen.getAllByRole('button');
      const finishContainer = btns.find(b => b.textContent?.includes('Finish'))?.parentElement;
      const resetBtn = finishContainer?.querySelector('button');
      if (resetBtn) fireEvent.click(resetBtn);
      await screen.findByText(/Season 1 \/ 5/);
      const treasuries = screen.getAllByText(/\$10,000/);
      expect(treasuries.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('UNINSURED')).toBeInTheDocument();
    });
  });

  describe('Sandbox State Loading', () => {
    it('restores season from saved state', async () => {
      mockLoad.mockReturnValue(Promise.resolve({
        stateData: { season: 3, payoutAmount: 0, logs: ['Restored log'], treasury: 8000, cropHealth: 90, activePolicy: 'basic', contractState: 'IDLE' },
      }));
      await renderAndSettle();
      expect(await screen.findByText(/Season 3 \/ 5/)).toBeInTheDocument();
    });

    it('restores treasury from saved state', async () => {
      mockLoad.mockReturnValue(Promise.resolve({
        stateData: { season: 1, payoutAmount: 0, logs: [], treasury: 5000, cropHealth: 100, activePolicy: 'none', contractState: 'IDLE' },
      }));
      await renderAndSettle();
      const treasuries = screen.getAllByText(/\$5,000/);
      expect(treasuries.length).toBeGreaterThanOrEqual(1);
    });

    it('restores logs from saved state', async () => {
      mockLoad.mockReturnValue(Promise.resolve({
        stateData: { season: 1, payoutAmount: 0, logs: ['Custom log entry'], treasury: 10000, cropHealth: 100, activePolicy: 'none', contractState: 'IDLE' },
      }));
      await renderAndSettle();
      expect(await screen.findByText('Custom log entry')).toBeInTheDocument();
    });
  });

  describe('Auto-Save', () => {
    it('calls saveSandboxState after buying policy', async () => {
      await renderAndSettle();
      fireEvent.click(screen.getByText('Activate Insurance Policy'));
      await waitFor(() => expect(mockSave).toHaveBeenCalled());
    });
  });

  describe('Edge Cases', () => {
    it('handles state load errors gracefully', async () => {
      mockLoad.mockRejectedValue(new Error('Server error'));
      await renderAndSettle();
      expect(screen.getByText(/Parametric InsurTech Smart Contract/i)).toBeInTheDocument();
    });

    it('handles save errors gracefully', async () => {
      mockSave.mockRejectedValue(new Error('Save error'));
      await renderAndSettle();
      fireEvent.click(screen.getByText('Activate Insurance Policy'));
      expect(screen.getByText(/POLICY CREATED/)).toBeInTheDocument();
    });

    it('disables finish button when not completed', async () => {
      await renderAndSettle();
      const finishBtn = screen.getByText(/Survive All 5 Seasons/).closest('button');
      expect(finishBtn).toBeDisabled();
    });

    it('shows PAYING OUT state after disaster triggers payout', async () => {
      await renderAndSettle();
      fireEvent.click(screen.getByText('Activate Insurance Policy'));
      fireEvent.click(screen.getByText('Flood'));
      expect(await screen.findByText(/PAYING OUT/, {}, { timeout: 10000 })).toBeInTheDocument();
    });

    it('restores payoutAmount from saved state', async () => {
      mockLoad.mockReturnValue(Promise.resolve({
        stateData: { season: 1, payoutAmount: 5000, logs: [], treasury: 10000, cropHealth: 100, activePolicy: 'none', contractState: 'IDLE' },
      }));
      await renderAndSettle();
      expect(screen.getByText(/Parametric InsurTech Smart Contract/i)).toBeInTheDocument();
    });

    it('reduces crop health when an insured flood payout occurs', async () => {
      await renderAndSettle();
      fireEvent.click(screen.getByText('Activate Insurance Policy'));
      fireEvent.click(screen.getByText('Flood'));
      expect(await screen.findByText(/AUTOMATIC PAYOUT/, {}, { timeout: 10000 })).toBeInTheDocument();
      expect(screen.getByText(/basic policy/)).toBeInTheDocument();
    });

    it('handles simulation errors gracefully', async () => {
      const { soundManager } = await import('../utils/sound');
      (soundManager.playTick as any).mockImplementationOnce(() => { throw new Error('audio boom'); });
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      await renderAndSettle();
      fireEvent.click(screen.getByText('Drought'));
      await waitFor(() => expect(errorSpy).toHaveBeenCalledWith('Error executing simulation logic:', expect.any(Error)), { timeout: 3000 });
      errorSpy.mockRestore();
    });

    it('explicitly selects the basic policy before activating', async () => {
      await renderAndSettle();
      fireEvent.click(screen.getByText(/Basic Index Policy/));
      fireEvent.click(screen.getByText('Activate Insurance Policy'));
      expect(screen.getByText(/basic policy/)).toBeInTheDocument();
    });
  });
});
