import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { FraudGame } from './FraudGame';

vi.mock('motion/react', () => {
  const Div = require('react').forwardRef(({ children, ...props }: any, ref: any) => <div ref={ref} {...props}>{children}</div>);
  Div.displayName = 'MotionDiv';
  return { motion: new Proxy({}, { get: () => Div }), AnimatePresence: ({ children }: any) => <>{children}</> };
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

async function renderAsync(ui: React.ReactElement) {
  render(ui);
  await act(async () => {});
}

function clickAndCheck(btnText: string): HTMLElement {
  fireEvent.click(screen.getByText(btnText));
  return screen.getByText(/(IDENTIFIED SECURITY EVENT|FALSE POSITIVE|FRAUD LEAK)/);
}

describe('FraudGame', () => {
  const mockOnComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockLoad.mockReturnValue(Promise.resolve({ stateData: null }));
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the AML header', async () => {
    await renderAsync(<FraudGame onComplete={mockOnComplete} />);
    expect(screen.getByText('AML Risk Intelligence Deck')).toBeInTheDocument();
  });

  it('renders current transaction sender name', async () => {
    await renderAsync(<FraudGame onComplete={mockOnComplete} />);
    expect(screen.getByText('Arthur Dent')).toBeInTheDocument();
  });

  it('renders Block & Report and Approve Wire buttons', async () => {
    await renderAsync(<FraudGame onComplete={mockOnComplete} />);
    expect(screen.getByText('Block & Report')).toBeInTheDocument();
    expect(screen.getByText('Approve Wire')).toBeInTheDocument();
  });

  it('shows treasury and XP display', async () => {
    await renderAsync(<FraudGame onComplete={mockOnComplete} />);
    expect(screen.getByText('$1,000,000')).toBeInTheDocument();
    expect(screen.getByText('0 XP')).toBeInTheDocument();
  });

  it('shows muted toggle button', async () => {
    await renderAsync(<FraudGame onComplete={mockOnComplete} />);
    expect(screen.getByTitle('Mute')).toBeInTheDocument();
  });

  it('transitions to next transaction', async () => {
    await renderAsync(<FraudGame onComplete={mockOnComplete} />);
    clickAndCheck('Approve Wire');
    act(() => { vi.advanceTimersByTime(2000); });
    expect(screen.getByText('Anonymous Shell LLC')).toBeInTheDocument();
  });

  it('loads sandbox state on mount', async () => {
    await renderAsync(<FraudGame onComplete={mockOnComplete} />);
    expect(mockLoad).toHaveBeenCalledWith('fraud');
  });

  it('shows FALSE POSITIVE for blocking Arthur Dent', async () => {
    await renderAsync(<FraudGame onComplete={mockOnComplete} />);
    const el = clickAndCheck('Block & Report');
    expect(el.textContent).toMatch(/FALSE POSITIVE/i);
  });

  it('shows correct feedback for approving Arthur Dent', async () => {
    await renderAsync(<FraudGame onComplete={mockOnComplete} />);
    const el = clickAndCheck('Approve Wire');
    expect(el.textContent).toMatch(/IDENTIFIED SECURITY EVENT/i);
  });

  it('deducts treasury for false positive', async () => {
    await renderAsync(<FraudGame onComplete={mockOnComplete} />);
    clickAndCheck('Block & Report');
    expect(screen.getAllByText(/\$850,000/).length).toBeGreaterThan(0);
  });

  it('deducts treasury for fraud leak on tx-2', async () => {
    await renderAsync(<FraudGame onComplete={mockOnComplete} />);
    clickAndCheck('Approve Wire');
    act(() => { vi.advanceTimersByTime(2000); });
    clickAndCheck('Approve Wire');
    expect(screen.getByText(/FRAUD LEAK/)).toBeInTheDocument();
  });

  it('shows velocity alert for tx-2', async () => {
    await renderAsync(<FraudGame onComplete={mockOnComplete} />);
    clickAndCheck('Approve Wire');
    act(() => { vi.advanceTimersByTime(2000); });
    expect(screen.getByText(/VELOCITY \/ DISTANCE ANOMALY/i)).toBeInTheDocument();
  });

  it('shows PEP alert for Ivan Petrovich', async () => {
    await renderAsync(<FraudGame onComplete={mockOnComplete} />);
    clickAndCheck('Approve Wire');
    act(() => { vi.advanceTimersByTime(2000); });
    clickAndCheck('Block & Report');
    act(() => { vi.advanceTimersByTime(2000); });
    expect(screen.getByText(/POLITICALLY EXPOSED PERSON/)).toBeInTheDocument();
  });

  it('shows streak after correct', async () => {
    await renderAsync(<FraudGame onComplete={mockOnComplete} />);
    clickAndCheck('Approve Wire');
    expect(screen.getByText('1x')).toBeInTheDocument();
  });

  it('no streak on incorrect', async () => {
    await renderAsync(<FraudGame onComplete={mockOnComplete} />);
    clickAndCheck('Block & Report');
    expect(screen.queryByText(/x/)).not.toBeInTheDocument();
  });

  it('shows XP award', async () => {
    await renderAsync(<FraudGame onComplete={mockOnComplete} />);
    const el = clickAndCheck('Approve Wire');
    expect(el.textContent).toMatch(/\+150/);
  });

  it('toggles mute', async () => {
    const { soundManager } = await import('../utils/sound');
    vi.mocked(soundManager.toggleMute).mockReturnValue(true);
    await renderAsync(<FraudGame onComplete={mockOnComplete} />);
    fireEvent.click(screen.getByTitle('Mute'));
    expect(screen.getByTitle('Unmute')).toBeInTheDocument();
  });

  it('calls toggleMute', async () => {
    const { soundManager } = await import('../utils/sound');
    await renderAsync(<FraudGame onComplete={mockOnComplete} />);
    fireEvent.click(screen.getByTitle('Mute'));
    expect(soundManager.toggleMute).toHaveBeenCalled();
  });

  it('saves state after decision', async () => {
    await renderAsync(<FraudGame onComplete={mockOnComplete} />);
    clickAndCheck('Approve Wire');
    expect(mockSave).toHaveBeenCalled();
  });

  it('loads saved state', async () => {
    mockLoad.mockResolvedValue({ stateData: { decisions: {}, index: 0, resultsMode: false, securedAssets: 850000, xp: 150, streak: 1 } });
    await renderAsync(<FraudGame onComplete={mockOnComplete} />);
    expect(screen.getByText('150 XP')).toBeInTheDocument();
  });

  it('loads state with partial data (some properties missing)', async () => {
    mockLoad.mockResolvedValue({ stateData: { decisions: {} } });
    await renderAsync(<FraudGame onComplete={mockOnComplete} />);
    expect(screen.getByText('0 XP')).toBeInTheDocument();
  });

  it('loads state with empty object', async () => {
    mockLoad.mockResolvedValue({ stateData: {} });
    await renderAsync(<FraudGame onComplete={mockOnComplete} />);
    expect(screen.getByText('$1,000,000')).toBeInTheDocument();
  });

  it('reaches results mode after 7', async () => {
    await renderAsync(<FraudGame onComplete={mockOnComplete} />);
    for (let i = 0; i < 7; i++) {
      clickAndCheck('Approve Wire');
      act(() => { vi.advanceTimersByTime(2000); });
    }
    expect(screen.getByText('Compliance Audit Completed')).toBeInTheDocument();
  });

  it('shows audit score', async () => {
    await renderAsync(<FraudGame onComplete={mockOnComplete} />);
    for (let i = 0; i < 7; i++) {
      clickAndCheck('Approve Wire');
      act(() => { vi.advanceTimersByTime(2000); });
    }
    expect(screen.getByText(/\/ 100/)).toBeInTheDocument();
  });

  it('shows blocked crimes', async () => {
    await renderAsync(<FraudGame onComplete={mockOnComplete} />);
    for (let i = 0; i < 7; i++) {
      clickAndCheck('Approve Wire');
      act(() => { vi.advanceTimersByTime(2000); });
    }
    expect(screen.getByText(/0 \/ 5/)).toBeInTheDocument();
  });

  it('shows false alarms', async () => {
    await renderAsync(<FraudGame onComplete={mockOnComplete} />);
    for (let i = 0; i < 7; i++) {
      clickAndCheck('Block & Report');
      act(() => { vi.advanceTimersByTime(2000); });
    }
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('shows mistakes when score low', async () => {
    await renderAsync(<FraudGame onComplete={mockOnComplete} />);
    for (let i = 0; i < 7; i++) {
      clickAndCheck('Block & Report');
      act(() => { vi.advanceTimersByTime(2000); });
    }
    expect(screen.getByText(/Detailed Auditor Findings/)).toBeInTheDocument();
  });

  it('shows flawless when score >= 70', async () => {
    await renderAsync(<FraudGame onComplete={mockOnComplete} />);
    const seq = ['Approve Wire', 'Block & Report', 'Block & Report', 'Block & Report', 'Approve Wire', 'Block & Report', 'Block & Report'];
    for (const btn of seq) {
      clickAndCheck(btn);
      act(() => { vi.advanceTimersByTime(2000); });
    }
    expect(screen.getByText(/Flawless screening/)).toBeInTheDocument();
  });

  it('shows Try Again when not winner', async () => {
    await renderAsync(<FraudGame onComplete={mockOnComplete} />);
    for (let i = 0; i < 7; i++) {
      clickAndCheck('Approve Wire');
      act(() => { vi.advanceTimersByTime(2000); });
    }
    expect(screen.getByText('Try Screening Again')).toBeInTheDocument();
  });

  it('resets on Try Again', async () => {
    await renderAsync(<FraudGame onComplete={mockOnComplete} />);
    for (let i = 0; i < 7; i++) {
      clickAndCheck('Approve Wire');
      act(() => { vi.advanceTimersByTime(2000); });
    }
    fireEvent.click(screen.getByText('Try Screening Again'));
    expect(screen.getByText('Arthur Dent')).toBeInTheDocument();
    expect(screen.getByText('0 XP')).toBeInTheDocument();
  });

  it('disables finish when not winner', async () => {
    await renderAsync(<FraudGame onComplete={mockOnComplete} />);
    for (let i = 0; i < 7; i++) {
      clickAndCheck('Approve Wire');
      act(() => { vi.advanceTimersByTime(2000); });
    }
    const btn = screen.getByText(/Achieve Score >= 70/);
    expect(btn.closest('button')).toBeDisabled();
  });

  it('calls onComplete when winner', async () => {
    await renderAsync(<FraudGame onComplete={mockOnComplete} />);
    const seq = ['Approve Wire', 'Block & Report', 'Block & Report', 'Block & Report', 'Approve Wire', 'Block & Report', 'Block & Report'];
    for (const btn of seq) {
      clickAndCheck(btn);
      act(() => { vi.advanceTimersByTime(2000); });
    }
    const finishBtn = screen.getByText('Complete AML Module');
    expect(finishBtn.closest('button')).not.toBeDisabled();
    fireEvent.click(finishBtn);
    expect(mockOnComplete).toHaveBeenCalled();
  });

  it('handles load errors', async () => {
    mockLoad.mockRejectedValue(new Error('err'));
    await renderAsync(<FraudGame onComplete={mockOnComplete} />);
    expect(screen.getByText('AML Risk Intelligence Deck')).toBeInTheDocument();
  });

  it('handles save errors', async () => {
    mockSave.mockRejectedValue(new Error('err'));
    await renderAsync(<FraudGame onComplete={mockOnComplete} />);
    clickAndCheck('Approve Wire');
  });

  it('deducts treasury to 0 with 7 wrong decisions', async () => {
    await renderAsync(<FraudGame onComplete={mockOnComplete} />);
    clickAndCheck('Block & Report'); act(() => { vi.advanceTimersByTime(2000); }); // tx-1 legit → wrong
    clickAndCheck('Approve Wire'); act(() => { vi.advanceTimersByTime(2000); }); // tx-2 fraud → wrong
    clickAndCheck('Approve Wire'); act(() => { vi.advanceTimersByTime(2000); }); // tx-3 fraud → wrong
    clickAndCheck('Approve Wire'); act(() => { vi.advanceTimersByTime(2000); }); // tx-4 fraud → wrong
    clickAndCheck('Block & Report'); act(() => { vi.advanceTimersByTime(2000); }); // tx-5 legit → wrong
    clickAndCheck('Approve Wire'); act(() => { vi.advanceTimersByTime(2000); }); // tx-6 fraud → wrong
    clickAndCheck('Approve Wire'); act(() => { vi.advanceTimersByTime(2000); }); // tx-7 fraud → wrong
    expect(screen.getAllByText('$0').length).toBeGreaterThan(0);
  });

  it('plays success sound', async () => {
    const { soundManager } = await import('../utils/sound');
    await renderAsync(<FraudGame onComplete={mockOnComplete} />);
    clickAndCheck('Approve Wire');
    expect(soundManager.playSuccess).toHaveBeenCalled();
  });

  it('plays failure sound', async () => {
    const { soundManager } = await import('../utils/sound');
    await renderAsync(<FraudGame onComplete={mockOnComplete} />);
    clickAndCheck('Block & Report');
    expect(soundManager.playFailure).toHaveBeenCalled();
  });

  it('plays win on completion', async () => {
    const { soundManager } = await import('../utils/sound');
    await renderAsync(<FraudGame onComplete={mockOnComplete} />);
    for (let i = 0; i < 6; i++) {
      clickAndCheck('Approve Wire');
      act(() => { vi.advanceTimersByTime(2000); });
    }
    clickAndCheck('Approve Wire');
    act(() => { vi.advanceTimersByTime(2000); });
    expect(soundManager.playWin).toHaveBeenCalled();
  });

  it('shows BSA text', async () => {
    await renderAsync(<FraudGame onComplete={mockOnComplete} />);
    expect(screen.getByText(/Bank Secrecy Act/)).toBeInTheDocument();
  });

  it('shows SECURE', async () => {
    await renderAsync(<FraudGame onComplete={mockOnComplete} />);
    expect(screen.getByText('SECURE')).toBeInTheDocument();
  });
});
