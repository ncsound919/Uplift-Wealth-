import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { UnderwritingGame } from './UnderwritingGame';

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

async function renderAsync(ui: React.ReactElement) {
  render(ui);
  await act(async () => {});
}

function clickAndCheck(btnText: string): HTMLElement {
  fireEvent.click(screen.getByText(btnText));
  return screen.getByText(/(CORRECT|INCORRECT) DECISION/);
}

function advanceAndCheckNext(name: string) {
  act(() => { vi.advanceTimersByTime(2000); });
  return screen.getAllByText(name);
}

describe('UnderwritingGame', () => {
  const mockOnComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockLoad.mockReturnValue(Promise.resolve({ stateData: null }));
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the header', async () => {
    await renderAsync(<UnderwritingGame onComplete={mockOnComplete} />);
    expect(screen.getByText('Open Banking Underwriting Terminal')).toBeInTheDocument();
  });

  it('shows first applicant name', async () => {
    await renderAsync(<UnderwritingGame onComplete={mockOnComplete} />);
    expect(screen.getAllByText('Marcus Vance').length).toBeGreaterThan(0);
  });

  it('shows decision buttons', async () => {
    await renderAsync(<UnderwritingGame onComplete={mockOnComplete} />);
    expect(screen.getByText('Decline Loan')).toBeInTheDocument();
    expect(screen.getByText('Approve Loan')).toBeInTheDocument();
  });

  it('shows transaction data', async () => {
    await renderAsync(<UnderwritingGame onComplete={mockOnComplete} />);
    expect(screen.getByText(/Direct Deposit/i)).toBeInTheDocument();
  });

  it('shows gamification metrics', async () => {
    await renderAsync(<UnderwritingGame onComplete={mockOnComplete} />);
    expect(screen.getByText('0 XP')).toBeInTheDocument();
  });

  it('loads sandbox state on mount', async () => {
    await renderAsync(<UnderwritingGame onComplete={mockOnComplete} />);
    expect(mockLoad).toHaveBeenCalledWith('underwriting');
  });

  it('shows correct feedback on approve', async () => {
    await renderAsync(<UnderwritingGame onComplete={mockOnComplete} />);
    const el = clickAndCheck('Approve Loan');
    expect(el.textContent).toMatch(/CORRECT DECISION/);
  });

  it('shows incorrect feedback on decline', async () => {
    await renderAsync(<UnderwritingGame onComplete={mockOnComplete} />);
    const el = clickAndCheck('Decline Loan');
    expect(el.textContent).toMatch(/INCORRECT DECISION/);
  });

  it('advances to next applicant after timeout', async () => {
    await renderAsync(<UnderwritingGame onComplete={mockOnComplete} />);
    clickAndCheck('Approve Loan');
    const result = advanceAndCheckNext('Sarah Chen');
    expect(result.length).toBeGreaterThan(0);
  });

  it('shows XP award on feedback', async () => {
    await renderAsync(<UnderwritingGame onComplete={mockOnComplete} />);
    const el = clickAndCheck('Approve Loan');
    expect(el.textContent).toMatch(/\+100 XP/);
  });

  it('shows streak after correct decision', async () => {
    await renderAsync(<UnderwritingGame onComplete={mockOnComplete} />);
    clickAndCheck('Approve Loan');
    expect(screen.getByText(/1 Streak/)).toBeInTheDocument();
  });

  it('no streak on incorrect decision', async () => {
    await renderAsync(<UnderwritingGame onComplete={mockOnComplete} />);
    clickAndCheck('Decline Loan');
    expect(screen.queryByText(/Streak/)).not.toBeInTheDocument();
  });

  it('goes through all 7 applicants and reaches review board', async () => {
    await renderAsync(<UnderwritingGame onComplete={mockOnComplete} />);
    for (let i = 0; i < 6; i++) {
      clickAndCheck('Approve Loan');
      act(() => { vi.advanceTimersByTime(2000); });
    }
    clickAndCheck('Approve Loan');
    act(() => { vi.advanceTimersByTime(2000); });
    expect(screen.getByText('Underwriting Review Board')).toBeInTheDocument();
  });

  it('shows Back to Profiles in review mode', async () => {
    await renderAsync(<UnderwritingGame onComplete={mockOnComplete} />);
    for (let i = 0; i < 7; i++) {
      clickAndCheck('Approve Loan');
      act(() => { vi.advanceTimersByTime(2000); });
    }
    expect(screen.getByText('Back to Profiles')).toBeInTheDocument();
  });

  it('returns to profiles from review board', async () => {
    await renderAsync(<UnderwritingGame onComplete={mockOnComplete} />);
    for (let i = 0; i < 7; i++) {
      clickAndCheck('Approve Loan');
      act(() => { vi.advanceTimersByTime(2000); });
    }
    fireEvent.click(screen.getByText('Back to Profiles'));
    expect(screen.getAllByText('Marcus Vance').length).toBeGreaterThan(0);
  });

  it('opens audit panel', async () => {
    await renderAsync(<UnderwritingGame onComplete={mockOnComplete} />);
    for (let i = 0; i < 7; i++) {
      clickAndCheck('Approve Loan');
      act(() => { vi.advanceTimersByTime(2000); });
    }
    fireEvent.click(screen.getByText('Submit to Compliance Audit'));
    expect(screen.getByText('Underwriting Stress-Test Complete')).toBeInTheDocument();
  });

  it('shows audit stats after all approvals', async () => {
    await renderAsync(<UnderwritingGame onComplete={mockOnComplete} />);
    for (let i = 0; i < 7; i++) {
      clickAndCheck('Approve Loan');
      act(() => { vi.advanceTimersByTime(2000); });
    }
    fireEvent.click(screen.getByText('Submit to Compliance Audit'));
    expect(screen.getAllByText(/7 \/ 7/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Approved Loans/)).toBeInTheDocument();
  });

  it('shows Try Again when not successful', async () => {
    await renderAsync(<UnderwritingGame onComplete={mockOnComplete} />);
    for (let i = 0; i < 7; i++) {
      clickAndCheck('Approve Loan');
      act(() => { vi.advanceTimersByTime(2000); });
    }
    fireEvent.click(screen.getByText('Submit to Compliance Audit'));
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('resets on Try Again', async () => {
    await renderAsync(<UnderwritingGame onComplete={mockOnComplete} />);
    for (let i = 0; i < 7; i++) {
      clickAndCheck('Approve Loan');
      act(() => { vi.advanceTimersByTime(2000); });
    }
    fireEvent.click(screen.getByText('Submit to Compliance Audit'));
    fireEvent.click(screen.getByText('Try Again'));
    expect(screen.getByText('0 XP')).toBeInTheDocument();
    expect(screen.getAllByText('Marcus Vance').length).toBeGreaterThan(0);
  });

  it('disables finish when not successful', async () => {
    await renderAsync(<UnderwritingGame onComplete={mockOnComplete} />);
    for (let i = 0; i < 7; i++) {
      clickAndCheck('Approve Loan');
      act(() => { vi.advanceTimersByTime(2000); });
    }
    fireEvent.click(screen.getByText('Submit to Compliance Audit'));
    const btn = screen.getByText(/Complete with positive returns/);
    expect(btn.closest('button')).toBeDisabled();
  });

  it('shows audit diagnostics', async () => {
    await renderAsync(<UnderwritingGame onComplete={mockOnComplete} />);
    for (let i = 0; i < 7; i++) {
      clickAndCheck('Approve Loan');
      act(() => { vi.advanceTimersByTime(2000); });
    }
    fireEvent.click(screen.getByText('Submit to Compliance Audit'));
    expect(screen.getAllByText(/Correct Approval \(Marcus Vance\)/).length).toBeGreaterThan(0);
  });

  it('toggles decision in review', async () => {
    await renderAsync(<UnderwritingGame onComplete={mockOnComplete} />);
    for (let i = 0; i < 7; i++) {
      clickAndCheck('Approve Loan');
      act(() => { vi.advanceTimersByTime(2000); });
    }
    const toggles = screen.getAllByText('Toggle');
    fireEvent.click(toggles[0]);
    expect(screen.getAllByText('Declined').length).toBeGreaterThan(0);
  });

  it('toggles decision back', async () => {
    await renderAsync(<UnderwritingGame onComplete={mockOnComplete} />);
    for (let i = 0; i < 7; i++) {
      clickAndCheck('Approve Loan');
      act(() => { vi.advanceTimersByTime(2000); });
    }
    const toggles = screen.getAllByText('Toggle');
    fireEvent.click(toggles[0]);
    fireEvent.click(toggles[0]);
    expect(screen.getAllByText('Approved').length).toBeGreaterThan(0);
  });

  it('toggles mute', async () => {
    const { soundManager } = await import('../utils/sound');
    vi.mocked(soundManager.toggleMute).mockReturnValue(true);
    await renderAsync(<UnderwritingGame onComplete={mockOnComplete} />);
    fireEvent.click(screen.getByTitle('Mute Audio'));
    expect(screen.getByTitle('Unmute Audio')).toBeInTheDocument();
  });

  it('saves state after decision', async () => {
    await renderAsync(<UnderwritingGame onComplete={mockOnComplete} />);
    clickAndCheck('Approve Loan');
    expect(mockSave).toHaveBeenCalled();
  });

  it('loads saved state', async () => {
    mockLoad.mockResolvedValue({ stateData: { decisions: {}, index: 0, reviewMode: false, auditMode: false, xp: 100, streak: 1 } });
    await renderAsync(<UnderwritingGame onComplete={mockOnComplete} />);
    expect(screen.getByText('100 XP')).toBeInTheDocument();
  });

  it('loads review mode from state', async () => {
    const all = { 'app-1': 'approve', 'app-2': 'approve', 'app-3': 'approve', 'app-4': 'approve', 'app-5': 'approve', 'app-6': 'approve', 'app-7': 'approve' };
    mockLoad.mockResolvedValue({ stateData: { decisions: all, index: 7, reviewMode: true, auditMode: false, xp: 0, streak: 0 } });
    await renderAsync(<UnderwritingGame onComplete={mockOnComplete} />);
    expect(screen.getByText('Underwriting Review Board')).toBeInTheDocument();
  });

  it('shows thin file badge', async () => {
    await renderAsync(<UnderwritingGame onComplete={mockOnComplete} />);
    for (let i = 0; i < 4; i++) {
      clickAndCheck('Approve Loan');
      act(() => { vi.advanceTimersByTime(2000); });
    }
    expect(screen.getByText('Thin Credit File')).toBeInTheDocument();
  });

  it('handles load errors', async () => {
    mockLoad.mockRejectedValue(new Error('err'));
    await renderAsync(<UnderwritingGame onComplete={mockOnComplete} />);
    expect(screen.getByText('Open Banking Underwriting Terminal')).toBeInTheDocument();
  });

  it('handles save errors', async () => {
    mockSave.mockRejectedValue(new Error('err'));
    await renderAsync(<UnderwritingGame onComplete={mockOnComplete} />);
    clickAndCheck('Approve Loan');
  });

  it('declines all and checks audit', async () => {
    await renderAsync(<UnderwritingGame onComplete={mockOnComplete} />);
    for (let i = 0; i < 7; i++) {
      clickAndCheck('Decline Loan');
      act(() => { vi.advanceTimersByTime(2000); });
    }
    fireEvent.click(screen.getByText('Submit to Compliance Audit'));
    expect(screen.getByText('0 / 7')).toBeInTheDocument();
  });

  it('shows fair lending flags for declined biasRisk', async () => {
    await renderAsync(<UnderwritingGame onComplete={mockOnComplete} />);
    for (let i = 0; i < 7; i++) {
      clickAndCheck('Decline Loan');
      act(() => { vi.advanceTimersByTime(2000); });
    }
    fireEvent.click(screen.getByText('Submit to Compliance Audit'));
    expect(screen.getByText(/3 Flag/)).toBeInTheDocument();
  });

  it('reaches finish with correct decisions', async () => {
    await renderAsync(<UnderwritingGame onComplete={mockOnComplete} />);
    const seq = ['Approve Loan', 'Decline Loan', 'Approve Loan', 'Approve Loan', 'Approve Loan', 'Decline Loan', 'Approve Loan'];
    for (const btn of seq) {
      clickAndCheck(btn);
      act(() => { vi.advanceTimersByTime(2000); });
    }
    fireEvent.click(screen.getByText('Submit to Compliance Audit'));
    const finish = screen.getAllByText(/Finish/);
    expect(finish.length).toBeGreaterThan(0);
    expect(finish[0].closest('button')).not.toBeDisabled();
    fireEvent.click(finish[0]);
    expect(mockOnComplete).toHaveBeenCalled();
  });

  it('calls sound on decision', async () => {
    const { soundManager } = await import('../utils/sound');
    await renderAsync(<UnderwritingGame onComplete={mockOnComplete} />);
    fireEvent.click(screen.getByText('Approve Loan'));
    expect(soundManager.playTick).toHaveBeenCalled();
  });

  it('plays success for correct', async () => {
    const { soundManager } = await import('../utils/sound');
    await renderAsync(<UnderwritingGame onComplete={mockOnComplete} />);
    clickAndCheck('Approve Loan');
    expect(soundManager.playSuccess).toHaveBeenCalled();
  });

  it('plays failure for incorrect', async () => {
    const { soundManager } = await import('../utils/sound');
    await renderAsync(<UnderwritingGame onComplete={mockOnComplete} />);
    clickAndCheck('Decline Loan');
    expect(soundManager.playFailure).toHaveBeenCalled();
  });
});
