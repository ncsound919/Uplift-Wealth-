import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { FintechBusinessBuilder } from './FintechBusinessBuilder';

vi.mock('motion/react', () => {
  const Div = require('react').forwardRef(({ children, ...props }: any, ref: any) => <div ref={ref} {...props}>{children}</div>);
  Div.displayName = 'MotionDiv';
  return { motion: new Proxy({}, { get: () => Div }), AnimatePresence: ({ children }: any) => <div>{children}</div> };
});

function enterBizName(name = 'Velo') {
  const input = screen.getByPlaceholderText(/e.g. Velo, Bold, Aura/i);
  enterFounder();
  fireEvent.change(input, { target: { value: name } });
}

function enterFounder(name = 'Nia R.') {
  const input = screen.getByPlaceholderText(/Your Full Legal Name/i);
  fireEvent.change(input, { target: { value: name } });
}

function clickNext(count: number) {
  for (let i = 0; i < count; i++) {
    fireEvent.click(screen.getByRole('button', { name: /next step/i }));
  }
}

// Advance from step 1 all the way to the step 12 dossier screen
function goToDossier(name = 'Velo') {
  clickNext(5);
  enterBizName(name);
  enterFounder();
  clickNext(6);
}

// Advance the simulator interval one 700ms tick at a time while the component
// stays mounted. Each tick flushes React state so the terminal renders each log
// push in order. The final STATUS log lands on the last push, and the finish
// (outcome panel) branch runs one tick after it — so use 15 ticks to reach it.
function advanceMounted(ticks: number) {
  for (let i = 0; i < ticks; i++) {
    act(() => { vi.advanceTimersByTime(700); });
  }
}

// Let the simulator run to completion by unmounting the component first. The
// interval callback keeps executing (its state setters become no-ops), so the
// final "else" branch runs and calls onAwardXp(50) without a render crash.
function finishSimAfterUnmount(onAwardXp: any) {
  const { unmount } = render(<FintechBusinessBuilder onAwardXp={onAwardXp} />);
  goToDossier();
  fireEvent.click(screen.getByText(/Run stress test simulator/i));
  unmount();
  act(() => { vi.advanceTimersByTime(700 * 20); });
}

describe('FintechBusinessBuilder', () => {
  const mockAwardXp = vi.fn();
  const mockCompleteCapstone = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ---- EXISTING TESTS (preserved) ----
  it('renders the header', () => {
    render(<FintechBusinessBuilder />);
    expect(screen.getByText(/Business Builder/i)).toBeInTheDocument();
  });

  it('shows step 1 vertical selector', () => {
    render(<FintechBusinessBuilder />);
    expect(screen.getByText(/What type of business are you building/i)).toBeInTheDocument();
  });

  it('renders lane options', () => {
    render(<FintechBusinessBuilder />);
    const digitals = screen.getAllByText(/Digital Banking/i);
    expect(digitals.length).toBeGreaterThanOrEqual(1);
  });

  it('shows roadmap milestones', () => {
    render(<FintechBusinessBuilder />);
    expect(screen.getAllByText(/The Basics/i).length).toBeGreaterThanOrEqual(1);
  });

  it('renders badge shelf area', () => {
    render(<FintechBusinessBuilder />);
    expect(screen.getByText(/ACTIVE UNLOCKS/i)).toBeInTheDocument();
  });

  it('accepts optional props', () => {
    render(<FintechBusinessBuilder onAwardXp={mockAwardXp} onCompleteCapstone={mockCompleteCapstone} badges={['test']} />);
    expect(screen.getByText(/What type of business are you building/i)).toBeInTheDocument();
  });

  // ---- STEP NAVIGATION ----
  it('navigates forward with Next button', () => {
    render(<FintechBusinessBuilder />);
    fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    expect(screen.getByText(/What problem does it solve/i)).toBeInTheDocument();
  });

  it('navigates back with Back button', () => {
    render(<FintechBusinessBuilder />);
    fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    expect(screen.getByText(/What problem does it solve/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /back/i }));
    expect(screen.getByText(/What type of business are you building/i)).toBeInTheDocument();
  });

  it('disables back button on step 1', () => {
    render(<FintechBusinessBuilder />);
    expect(screen.getByRole('button', { name: /back/i })).toBeDisabled();
  });

  it('navigates to step 4 via milestone click (adjacent)', () => {
    render(<FintechBusinessBuilder />);
    fireEvent.click(screen.getByRole('button', { name: /^2$/ }));
    expect(screen.getByText(/What will you charge/i)).toBeInTheDocument();
  });

  it('shows pricing milestones', () => {
    render(<FintechBusinessBuilder />);
    const ms = screen.getAllByText(/The Basics|Your Money|Name & Brand|Legal Setup|Tools & Growth|Your Plan/i);
    expect(ms.length).toBeGreaterThanOrEqual(6);
  });

  it('shows step 3 demographic section after 2 next clicks', () => {
    render(<FintechBusinessBuilder />);
    fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    expect(screen.getByText(/Who are your customers/i)).toBeInTheDocument();
  });

  // ---- STEP 1: LANE SELECTION ----
  it('selects a fintech lane (Payments Rail)', () => {
    render(<FintechBusinessBuilder />);
    const laneBtn = screen.getByRole('button', { name: /payments.*rail/i });
    fireEvent.click(laneBtn);
    const updatedBtn = screen.getByRole('button', { name: /payments.*rail/i });
    expect(updatedBtn.className).toContain('border-blue-500');
  });

  // ---- STEP 2: PROBLEM DEFINITION ----
  it('selects a problem friction on step 2', () => {
    render(<FintechBusinessBuilder />);
    fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    const btn = screen.getByText(/SMEs & freelancers wait 5\+ days/i).closest('button')!;
    fireEvent.click(btn);
    expect(btn.className).toContain('border-blue-500');
  });

  it('shows custom problem textarea on step 2 when Other selected', () => {
    render(<FintechBusinessBuilder />);
    fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    fireEvent.click(screen.getByText(/I am targeting a different structural friction/i).closest('button')!);
    const textareas = screen.getAllByRole('textbox');
    expect(textareas.length).toBeGreaterThanOrEqual(1);
  });

  // ---- STEP 3: COHORT ----
  it('selects a customer cohort', () => {
    render(<FintechBusinessBuilder />);
    fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    const btn = screen.getByText('Immigrants & Global Families').closest('button')!;
    fireEvent.click(btn);
    expect(btn.className).toContain('border-blue-500');
  });

  it('has a TAM reach slider', () => {
    render(<FintechBusinessBuilder />);
    fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    const slider = document.querySelector('input[type="range"]') as HTMLInputElement;
    expect(slider).toBeTruthy();
    fireEvent.change(slider, { target: { value: '250000' } });
    expect(slider.value).toBe('250000');
  });

  // ---- STEP 4: PRICING ----
  it('shows projected ARR info on step 4', () => {
    render(<FintechBusinessBuilder />);
    fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    expect(screen.getByText(/projected software ARR/i)).toBeInTheDocument();
  });

  it('has monthly fee slider on step 4', () => {
    render(<FintechBusinessBuilder />);
    fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    const sliders = document.querySelectorAll('input[type="range"]');
    expect(sliders.length).toBeGreaterThanOrEqual(2);
    fireEvent.change(sliders[0], { target: { value: '25' } });
    expect((sliders[0] as HTMLInputElement).value).toBe('25');
  });

  // ---- STEP 5: MONETIZATION ----
  it('selects monetization model', () => {
    render(<FintechBusinessBuilder />);
    for (let i = 0; i < 4; i++) fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    const btn = screen.getByText('Software Subscription (SaaS)').closest('button')!;
    fireEvent.click(btn);
    expect(btn.className).toContain('border-blue-500');
  });

  it('selects a funding strategy', () => {
    render(<FintechBusinessBuilder />);
    for (let i = 0; i < 4; i++) fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    const btn = screen.getByText('Strategic Grants & Accelerators').closest('button')!;
    fireEvent.click(btn);
    expect(btn.className).toContain('border-indigo-500');
  });

  // ---- STEP 6: CORPORATE IDENTITY ----
  it('enters business name and sees AI suggestions', () => {
    render(<FintechBusinessBuilder />);
    for (let i = 0; i < 5; i++) fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    const input = screen.getByPlaceholderText(/e.g. Velo, Bold, Aura/i);
    expect(input).toBeInTheDocument();
    fireEvent.change(input, { target: { value: 'Nexus' } });
    expect(screen.getByText('+ NexusPay')).toBeInTheDocument();
  });

  it('selects a suggested business name', () => {
    render(<FintechBusinessBuilder />);
    for (let i = 0; i < 5; i++) fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    const input = screen.getByPlaceholderText(/e.g. Velo, Bold, Aura/i);
    fireEvent.change(input, { target: { value: 'Nexus' } });
    fireEvent.click(screen.getByText('+ NexusPay'));
    expect(input).toHaveValue('NexusPay');
  });

  it('changes founder name', () => {
    render(<FintechBusinessBuilder />);
    for (let i = 0; i < 5; i++) fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    const input = screen.getByPlaceholderText(/Your Full Legal Name/i);
    fireEvent.change(input, { target: { value: 'Jane Doe' } });
    expect(input).toHaveValue('Jane Doe');
  });

  it('changes founder residency state', () => {
    render(<FintechBusinessBuilder />);
    for (let i = 0; i < 5; i++) fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    const select = screen.getByDisplayValue('California');
    fireEvent.change(select, { target: { value: 'Texas' } });
    expect(screen.getByDisplayValue('Texas')).toBeInTheDocument();
  });

  it('changes brand style', () => {
    render(<FintechBusinessBuilder />);
    for (let i = 0; i < 5; i++) fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    const boldBtn = screen.getByText('Bold');
    fireEvent.click(boldBtn);
    expect(boldBtn.closest('button')!.className).toContain('bg-indigo-600');
  });

  // ---- STEP 7: STRUCTURE ----
  it('selects C-Corp structure on step 7', () => {
    render(<FintechBusinessBuilder />);
    for (let i = 0; i < 5; i++) fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    enterBizName();
  enterFounder();
    fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    const btn = screen.getByText(/C-Corporation \(Delaware standard\)/).closest('button')!;
    fireEvent.click(btn);
    expect(btn.className).toContain('border-blue-500');
  });

  it('selects Solo Proprietorship', () => {
    render(<FintechBusinessBuilder />);
    for (let i = 0; i < 5; i++) fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    enterBizName();
  enterFounder();
    fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    const btn = screen.getByText(/Solo Proprietorship/).closest('button')!;
    fireEvent.click(btn);
    expect(btn.className).toContain('border-blue-500');
  });

  // ---- STEP 8: JURISDICTION ----
  it('selects Wyoming jurisdiction', () => {
    render(<FintechBusinessBuilder />);
    for (let i = 0; i < 5; i++) fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    enterBizName();
  enterFounder();
    for (let i = 0; i < 2; i++) fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    const wyBtn = screen.getByText('Wyoming').closest('button')!;
    fireEvent.click(wyBtn);
    expect(screen.getByText(/Industry-leading asset privacy/i)).toBeInTheDocument();
  });

  it('shows Delaware state analysis by default', () => {
    render(<FintechBusinessBuilder />);
    for (let i = 0; i < 5; i++) fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    enterBizName();
  enterFounder();
    for (let i = 0; i < 2; i++) fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    expect(screen.getByText(/Active Focus: Delaware/i)).toBeInTheDocument();
  });

  // ---- STEP 9: HQ ----
  it('selects home address HQ', () => {
    render(<FintechBusinessBuilder />);
    for (let i = 0; i < 5; i++) fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    enterBizName();
  enterFounder();
    for (let i = 0; i < 3; i++) fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    const btn = screen.getByText(/Home residential address/i).closest('button')!;
    fireEvent.click(btn);
    expect(btn.className).toContain('border-blue-500');
  });

  it('selects coworking space HQ', () => {
    render(<FintechBusinessBuilder />);
    for (let i = 0; i < 5; i++) fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    enterBizName();
  enterFounder();
    for (let i = 0; i < 3; i++) fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    const btn = screen.getByText(/Shared \/ Coworking space/i).closest('button')!;
    fireEvent.click(btn);
    expect(btn.className).toContain('border-blue-500');
  });

  // ---- STEP 10: API SELECTION ----
  it('toggles API selection on step 10', () => {
    render(<FintechBusinessBuilder />);
    for (let i = 0; i < 5; i++) fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    enterBizName();
  enterFounder();
    for (let i = 0; i < 4; i++) fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    const antiFraudBtn = screen.getByText('Sardine / Socure Shield').closest('button')!;
    fireEvent.click(antiFraudBtn);
    expect(screen.getByText(/3 API Nodes Linked/i)).toBeInTheDocument();
  });

  it('deselects API on step 10', () => {
    render(<FintechBusinessBuilder />);
    for (let i = 0; i < 5; i++) fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    enterBizName();
  enterFounder();
    for (let i = 0; i < 4; i++) fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    const kycBtn = screen.getByText('Persona KYC / Alloy AML').closest('button')!;
    fireEvent.click(kycBtn);
    expect(screen.getByText(/1 API Node Linked/i)).toBeInTheDocument();
  });

  // ---- STEP 11: GTM & EQUITY ----
  it('selects a marketing channel on step 11', () => {
    render(<FintechBusinessBuilder />);
    for (let i = 0; i < 5; i++) fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    enterBizName();
  enterFounder();
    for (let i = 0; i < 5; i++) fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    const btn = screen.getByText('Viral Web Widgets & SEO').closest('button')!;
    fireEvent.click(btn);
    expect(btn.className).toContain('border-blue-500');
  });

  it('selects founders count on step 11', () => {
    render(<FintechBusinessBuilder />);
    for (let i = 0; i < 5; i++) fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    enterBizName();
  enterFounder();
    for (let i = 0; i < 5; i++) fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    const btn = screen.getByText('Solo founder (bootstrap)');
    fireEvent.click(btn);
    expect(btn.closest('button')!.className).toContain('bg-indigo-600');
  });

  it('selects equity split on step 11', () => {
    render(<FintechBusinessBuilder />);
    for (let i = 0; i < 5; i++) fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    enterBizName();
  enterFounder();
    for (let i = 0; i < 5; i++) fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    const btn = screen.getByText('Solo Split').closest('button')!;
    fireEvent.click(btn);
    expect(btn.className).toContain('bg-indigo-600');
  });

  // ---- STEP 12: DOSSIER ----
  it('shows venture dossier on step 12', () => {
    render(<FintechBusinessBuilder />);
    for (let i = 0; i < 5; i++) fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    enterBizName();
  enterFounder();
    for (let i = 0; i < 6; i++) fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    expect(screen.getByText('Venture Dossier Unlocked!')).toBeInTheDocument();
  });

  it('switches dossier tabs on step 12', () => {
    render(<FintechBusinessBuilder />);
    for (let i = 0; i < 5; i++) fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    enterBizName();
  enterFounder();
    for (let i = 0; i < 6; i++) fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    fireEvent.click(screen.getByText('4. FinCEN BOI & Tax Calendar'));
    expect(screen.getByText(/FinCEN Beneficial Ownership/i)).toBeInTheDocument();
  });

  it('toggles BOI checkbox in compliance tab', () => {
    render(<FintechBusinessBuilder />);
    for (let i = 0; i < 5; i++) fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    enterBizName();
  enterFounder();
    for (let i = 0; i < 6; i++) fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    fireEvent.click(screen.getByText('4. FinCEN BOI & Tax Calendar'));
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it('shows stress test button on step 12', () => {
    render(<FintechBusinessBuilder />);
    for (let i = 0; i < 5; i++) fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    enterBizName();
  enterFounder();
    for (let i = 0; i < 6; i++) fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    expect(screen.getByText(/Run stress test simulator/i)).toBeInTheDocument();
  });

  // ---- AWARD XP CALLBACK ----
  it('calls onAwardXp when advancing steps', () => {
    render(<FintechBusinessBuilder onAwardXp={mockAwardXp} />);
    fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    expect(mockAwardXp).toHaveBeenCalledWith(15, expect.stringContaining('Completed Step'));
  });

  it('does not call onAwardXp when not provided', () => {
    render(<FintechBusinessBuilder />);
    fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    expect(mockAwardXp).not.toHaveBeenCalled();
  });

  // ---- RESET ----
  it('shows reset button on step 12', () => {
    render(<FintechBusinessBuilder />);
    for (let i = 0; i < 5; i++) fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    enterBizName();
  enterFounder();
    for (let i = 0; i < 6; i++) fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    expect(screen.getByText('Reset Builder')).toBeInTheDocument();
  });

  it('reset returns to step 1 on step 12', () => {
    render(<FintechBusinessBuilder />);
    for (let i = 0; i < 5; i++) fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    enterBizName();
  enterFounder();
    for (let i = 0; i < 6; i++) fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    expect(screen.getByText('Venture Dossier Unlocked!')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Reset Builder'));
    expect(screen.getByText(/What type of business are you building/i)).toBeInTheDocument();
  });

  it('next button shown (not reset) before step 12', () => {
    render(<FintechBusinessBuilder />);
    expect(screen.getByRole('button', { name: /next step/i })).toBeInTheDocument();
    expect(screen.queryByText('Reset Builder')).not.toBeInTheDocument();
  });

  // ---- BADGES ----
  it('unlocks Compliance Guard badge by default (KYC + LLC)', () => {
    render(<FintechBusinessBuilder />);
    expect(screen.getByText(/Compliance Guard/i)).toBeInTheDocument();
  });

  it('unlocks VC Catalyst badge with C-Corp + Delaware + Seed + Vesting', () => {
    render(<FintechBusinessBuilder />);
    for (let i = 0; i < 5; i++) fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    enterBizName();
  enterFounder();
    fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    fireEvent.click(screen.getByText(/C-Corporation \(Delaware standard\)/).closest('button')!);
    for (let i = 0; i < 5; i++) fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    expect(screen.getByText(/VC Catalyst/i)).toBeInTheDocument();
  });

  it('unlocks TAM Commander badge with large reach', () => {
    render(<FintechBusinessBuilder />);
    for (let i = 0; i < 2; i++) fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    const slider = document.querySelector('input[type="range"]') as HTMLInputElement;
    fireEvent.change(slider, { target: { value: '500000' } });
    expect(screen.getByText(/TAM Commander/i)).toBeInTheDocument();
  });

  it('unlocks Sovereign Bootstrapper badge', () => {
    render(<FintechBusinessBuilder />);
    for (let i = 0; i < 4; i++) fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    fireEvent.click(screen.getByText('Sovereign Bootstrapper').closest('button')!);
    fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    enterBizName();
  enterFounder();
    fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    fireEvent.click(screen.getByText(/Limited Liability Company \(LLC\)/).closest('button')!);
    for (let i = 0; i < 4; i++) fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    const soloFounderBtn = screen.getByText('Solo founder (bootstrap)');
    fireEvent.click(soloFounderBtn);
    expect(screen.getByText(/Sovereign Bootstrapper/i)).toBeInTheDocument();
  });

  // ---- SIMULATION MODAL ----
  function runSimTest() {
    for (let i = 0; i < 5; i++) fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    enterBizName();
  enterFounder();
    for (let i = 0; i < 6; i++) fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    fireEvent.click(screen.getByText(/Run stress test simulator/i));
  }

  it('opens simulation modal on stress test click', async () => {
    render(<FintechBusinessBuilder />);
    runSimTest();
    expect(screen.getByText(/Run stress test simulator/i)).toBeInTheDocument();
  });

  it('shows simulation modal opens', () => {
    vi.useFakeTimers();
    const originalInterval = globalThis.setInterval;
    globalThis.setInterval = ((fn: TimerHandler, _ms: number, ...args: any[]) => {
      (fn as Function)(...args);
      return 0 as unknown as ReturnType<typeof setInterval>;
    }) as typeof globalThis.setInterval;
    render(<FintechBusinessBuilder onAwardXp={mockAwardXp} />);
    for (let i = 0; i < 5; i++) fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    enterBizName();
  enterFounder();
    for (let i = 0; i < 6; i++) fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    act(() => { fireEvent.click(screen.getByText(/Run stress test simulator/i)); });
    expect(screen.getByText(/FinTech Sandbox Stress Test Simulator/i)).toBeInTheDocument();
    globalThis.setInterval = originalInterval;
    vi.useRealTimers();
  });

  // ---- EDGE CASES ----
  it('progresses through all 12 steps with Next button', () => {
    render(<FintechBusinessBuilder />);
    for (let i = 0; i < 5; i++) fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    enterBizName();
  enterFounder();
    for (let i = 5; i < 11; i++) {
      const nextBtn = screen.queryByRole('button', { name: /next step/i });
      if (nextBtn && !nextBtn.hasAttribute('disabled')) fireEvent.click(nextBtn);
    }
    expect(screen.getByText('Venture Dossier Unlocked!')).toBeInTheDocument();
  });

  it('next button is disabled when business name is short on step 6', () => {
    render(<FintechBusinessBuilder />);
    for (let i = 0; i < 5; i++) fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    const bizInput = screen.getByPlaceholderText(/e.g. Velo, Bold, Aura/i);
    fireEvent.change(bizInput, { target: { value: '' } });
    const nameInput = screen.getByPlaceholderText(/Your Full Legal Name/i);
    fireEvent.change(nameInput, { target: { value: '' } });
    expect(screen.getByRole('button', { name: /next step/i })).toBeDisabled();
  });

  it('disables next when APIs empty on step 10', () => {
    render(<FintechBusinessBuilder />);
    for (let i = 0; i < 5; i++) fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    enterBizName();
  enterFounder();
    for (let i = 0; i < 4; i++) fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    const paymentApi = screen.getByText('Stripe Core / Adyen API').closest('button')!;
    fireEvent.click(paymentApi);
    const kycApi = screen.getByText('Persona KYC / Alloy AML').closest('button')!;
    fireEvent.click(kycApi);
    expect(screen.getByRole('button', { name: /next step/i })).toBeDisabled();
  });

  it('handles all lane selections', () => {
    render(<FintechBusinessBuilder />);
    const laneNames = ['Payments Rail', 'Alternative Underwriting', 'Wealth & Investing', 'Stablecoin Infrastructure'];
    laneNames.forEach(name => {
      const laneBtn = screen.getByRole('button', { name: new RegExp(name, 'i') });
      fireEvent.click(laneBtn);
    });
    expect(screen.getByRole('button', { name: /stablecoin infrastructure/i }).className).toContain('border-blue-500');
  });

  it('first milestone is active on load', () => {
    render(<FintechBusinessBuilder />);
    const milestone1 = screen.getByRole('button', { name: /^1$/ });
    expect(milestone1.className).toContain('bg-blue-600');
  });

  it('telemetry hud renders with legitimacy score', () => {
    render(<FintechBusinessBuilder />);
    expect(screen.getByText(/Legitimacy/)).toBeInTheDocument();
    expect(screen.getByText(/80%/)).toBeInTheDocument();
  });

  // ---- ADDITIONAL COVERAGE: REVENUE MODEL BRANCHES ----
  it('computes transactional take-rate revenue when Transactional monetization is selected', () => {
    render(<FintechBusinessBuilder />);
    clickNext(4);
    const btn = screen.getByText('Transactional Take-Rate (bps)').closest('button')!;
    fireEvent.click(btn);
    expect(btn.className).toContain('border-blue-500');
    // txVolume(150000)*0.015*12 + reachUsers(10000)*3*12 = 387,000
    expect(screen.getByText('$387,000')).toBeInTheDocument();
  });

  it('computes flat-rate revenue for AUM monetization model', () => {
    render(<FintechBusinessBuilder />);
    clickNext(4);
    const btn = screen.getByText('Advising Asset Under Management (AUM)').closest('button')!;
    fireEvent.click(btn);
    // default flat rate: reachUsers(10000)*15*12 = 1,800,000
    expect(screen.getByText('$1,800,000')).toBeInTheDocument();
  });

  // ---- ADDITIONAL COVERAGE: FUNDABILITY GRADE BANDS ----
  it('shows S grade and boosts score when beachhead reach exceeds 500K', () => {
    render(<FintechBusinessBuilder />);
    clickNext(2);
    const slider = document.querySelector('input[type="range"]') as HTMLInputElement;
    fireEvent.change(slider, { target: { value: '600000' } });
    expect(screen.getByText('S ★')).toBeInTheDocument();
  });

  it('shows B+ grade with bootstrapped funding, LLC and no vesting', () => {
    render(<FintechBusinessBuilder />);
    clickNext(4);
    fireEvent.click(screen.getByText('Sovereign Bootstrapper').closest('button')!);
    fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    enterBizName('AB');
  enterFounder();
    clickNext(5); // steps 7,8,9,10,11 (LLC/Delaware/virtual/default apis)
    fireEvent.click(screen.getByText('Slicing Split').closest('button')!);
    expect(screen.getByText('B+')).toBeInTheDocument();
  });

  it('shows B grade when legitimacy is low but co-founder partnership is used', () => {
    render(<FintechBusinessBuilder />);
    clickNext(4);
    fireEvent.click(screen.getByText('Sovereign Bootstrapper').closest('button')!);
    fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    enterBizName('AB');
  enterFounder();
    fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    fireEvent.click(screen.getByText(/Solo Proprietorship/).closest('button')!);
    fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    fireEvent.click(screen.getByText(/Home residential address/i).closest('button')!);
    fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    fireEvent.click(screen.getByText('Persona KYC / Alloy AML').closest('button')!);
    fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    fireEvent.click(screen.getByText('Slicing Split').closest('button')!);
    expect(screen.getByText('B')).toBeInTheDocument();
  });

  it('shows C+ grade when legitimacy is low and running solo', () => {
    render(<FintechBusinessBuilder />);
    clickNext(4);
    fireEvent.click(screen.getByText('Sovereign Bootstrapper').closest('button')!);
    fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    enterBizName('AB');
  enterFounder();
    clickNext(3); // steps 7,8,9
    fireEvent.click(screen.getByText(/Home residential address/i).closest('button')!);
    fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    fireEvent.click(screen.getByText('Persona KYC / Alloy AML').closest('button')!);
    fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    fireEvent.click(screen.getByText('Solo founder (bootstrap)'));
    fireEvent.click(screen.getByText('Slicing Split').closest('button')!);
    expect(screen.getByText('C+')).toBeInTheDocument();
  });

  // ---- ADDITIONAL COVERAGE: BADGES ----
  it('unlocks Web3 Trailblazer badge with stablecoin lane and Web3 API', () => {
    render(<FintechBusinessBuilder />);
    fireEvent.click(screen.getByRole('button', { name: /stablecoin infrastructure/i }));
    clickNext(4);
    fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    enterBizName();
  enterFounder();
    clickNext(4); // steps 7,8,9,10
    fireEvent.click(screen.getByText('Circle Mint SDK / Coinbase API').closest('button')!);
    expect(screen.getByText(/Web3 Trailblazer/i)).toBeInTheDocument();
  });

  // ---- ADDITIONAL COVERAGE: CUSTOM INPUTS ----
  it('lets the user type a custom friction goal', () => {
    render(<FintechBusinessBuilder />);
    fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    fireEvent.click(screen.getByText(/I am targeting a different structural friction/i).closest('button')!);
    const textarea = screen.getByPlaceholderText(/State the exact pain point/i);
    fireEvent.change(textarea, { target: { value: 'Cross border invoice clearing is slow' } });
    expect(textarea).toHaveValue('Cross border invoice clearing is slow');
  });

  it('updates transaction processing volume slider on step 4', () => {
    render(<FintechBusinessBuilder />);
    clickNext(3);
    const sliders = document.querySelectorAll('input[type="range"]');
    fireEvent.change(sliders[1], { target: { value: '500000' } });
    expect((sliders[1] as HTMLInputElement).value).toBe('500000');
  });

  // ---- ADDITIONAL COVERAGE: PRINT DOSSIER ----
  it('calls window.print from the pitch deck tab', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    render(<FintechBusinessBuilder />);
    goToDossier();
    fireEvent.click(screen.getByText(/Print Dossier/i));
    expect(printSpy).toHaveBeenCalled();
    printSpy.mockRestore();
  });

  // ---- ADDITIONAL COVERAGE: SIMULATOR LOG PATHS ----
  it('funds a Delaware C-Corp seed round during the sim', () => {
    vi.useFakeTimers();
    render(<FintechBusinessBuilder />);
    clickNext(5);
    enterBizName();
  enterFounder();
    fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    fireEvent.click(screen.getByText(/C-Corporation \(Delaware standard\)/).closest('button')!);
    clickNext(5); // steps 8,9,10,11,12
    fireEvent.click(screen.getByText(/Run stress test simulator/i));
    advanceMounted(12);
    expect(screen.getByText(/FUNDED: Pre-Seed SAFE Note fully signed/i)).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('completes the simulator run after unmount and awards stress-test XP', () => {
    vi.useFakeTimers();
    finishSimAfterUnmount(mockAwardXp);
    expect(mockAwardXp).toHaveBeenCalledWith(50, 'Running high-fidelity sandbox stress-test simulator');
    vi.useRealTimers();
  });

  it('renders success, stable and rejected log categories in a default run', () => {
    vi.useFakeTimers();
    render(<FintechBusinessBuilder />);
    goToDossier();
    fireEvent.click(screen.getByText(/Run stress test simulator/i));
    advanceMounted(15);
    expect(screen.getByText(/SUCCESS: Active KYC\/Fraud prevention rails/i)).toBeInTheDocument();
    expect(screen.getByText(/VENTURE DECLARED STABLE/i)).toBeInTheDocument();
    expect(screen.getByText(/REJECTED: Venture funds decline/i)).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('runs a bootstrapper sim with a referral growth channel', () => {
    vi.useFakeTimers();
    render(<FintechBusinessBuilder />);
    clickNext(4);
    fireEvent.click(screen.getByText('Sovereign Bootstrapper').closest('button')!);
    fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    enterBizName();
  enterFounder();
    clickNext(5); // steps 7,8,9,10,11
    fireEvent.click(screen.getByText('In-app Referral Dividends').closest('button')!);
    fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    fireEvent.click(screen.getByText(/Run stress test simulator/i));
    advanceMounted(12);
    expect(screen.getByText(/REASSURING: Focusing purely on cashflow collection/i)).toBeInTheDocument();
    expect(screen.getByText(/Consistent, moderate organic accounts onboarded/i)).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('runs a sim with the SEO marketing channel', () => {
    vi.useFakeTimers();
    render(<FintechBusinessBuilder />);
    clickNext(5);
    enterBizName();
  enterFounder();
    clickNext(5); // steps 7,8,9,10,11
    fireEvent.click(screen.getByText('Viral Web Widgets & SEO').closest('button')!);
    fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    fireEvent.click(screen.getByText(/Run stress test simulator/i));
    advanceMounted(12);
    expect(screen.getByText(/Financial calculator SEO pages lock in top rank/i)).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('flags compliance failure when KYC APIs are missing', () => {
    vi.useFakeTimers();
    render(<FintechBusinessBuilder />);
    clickNext(5);
    enterBizName();
  enterFounder();
    clickNext(4); // steps 7,8,9,10
    fireEvent.click(screen.getByText('Persona KYC / Alloy AML').closest('button')!);
    fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    fireEvent.click(screen.getByRole('button', { name: /next step/i }));
    fireEvent.click(screen.getByText(/Run stress test simulator/i));
    advanceMounted(15);
    expect(screen.getByText(/No active compliance or anti-money-laundering API rails/i)).toBeInTheDocument();
    expect(screen.getByText(/VENTURE VULNERABLE/i)).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('shows the custom specialty input when Other Route is chosen', () => {
    render(<FintechBusinessBuilder />);
    fireEvent.click(screen.getByText('Other Route').closest('button')!);
    const customInput = screen.getByPlaceholderText(/e.g. Micro-remittance loyalty/i);
    expect(customInput).toBeInTheDocument();
    fireEvent.change(customInput, { target: { value: 'Micro-remittance loyalty' } });
    expect(customInput).toHaveValue('Micro-remittance loyalty');
  });

  it('completes a mounted simulator run and settles the dossier', () => {
    vi.useFakeTimers();
    const awardXp = vi.fn();
    const completeCapstone = vi.fn();
    render(<FintechBusinessBuilder onAwardXp={awardXp} onCompleteCapstone={completeCapstone} />);
    goToDossier();
    fireEvent.click(screen.getByText(/Run stress test simulator/i));
    expect(screen.getByText(/Initializing sandbox simulator/i)).toBeInTheDocument();
    advanceMounted(15);
    // Outcome panel is now reachable: the finish branch ran after the final log.
    fireEvent.click(screen.getByText(/Accept & Settle Dossier/i));
    expect(awardXp).toHaveBeenCalledWith(150, 'Launching Your Sovereign FinTech Venture');
    expect(completeCapstone).toHaveBeenCalledTimes(1);
    // Modal is closed and the modal's Close button is covered on later opens.
    expect(screen.queryByText(/FinTech Sandbox Stress Test Simulator/i)).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it('covers the modal Close button once the simulation is not running', () => {
    vi.useFakeTimers();
    render(<FintechBusinessBuilder />);
    goToDossier();
    fireEvent.click(screen.getByText(/Run stress test simulator/i));
    advanceMounted(15);
    fireEvent.click(screen.getByText('Close'));
    expect(screen.queryByText(/FinTech Sandbox Stress Test Simulator/i)).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  // ---- QUICKSTART WIZARD ----
  it('opens QuickStart mode and shows the first question', () => {
    render(<FintechBusinessBuilder />);
    fireEvent.click(screen.getByRole('button', { name: /quickstart/i }));
    expect(screen.getByText(/What kind of business are you starting/i)).toBeInTheDocument();
    expect(screen.getByText(/Question 1 of 8/i)).toBeInTheDocument();
  });

  it('runs the full QuickStart flow and lands on the pre-filled dossier', async () => {
    render(<FintechBusinessBuilder />);
    fireEvent.click(screen.getByRole('button', { name: /quickstart/i }));

    // Q1: business type
    fireEvent.click(screen.getByRole('button', { name: /Fintech \/ Digital Finance/i }));
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    // Q2: customers
    fireEvent.change(screen.getByPlaceholderText(/e.g. Local small businesses/i), { target: { value: 'Gig workers' } });
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    // Q3: problem
    fireEvent.change(screen.getByPlaceholderText(/e.g. They can't find fast/i), { target: { value: 'Slow payments' } });
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    // Q4: monetization
    fireEvent.click(screen.getByRole('button', { name: /Subscription \/ Recurring Fee/i }));
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    // Q5: team
    fireEvent.click(screen.getByRole('button', { name: /Just me/i }));
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    // Q6: name
    fireEvent.change(screen.getByPlaceholderText(/e.g. Velo, Atlas Goods/i), { target: { value: 'NiaPay' } });
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    // Q7: funding
    fireEvent.click(screen.getByRole('button', { name: /Raise investor money/i }));
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    // Q8: state
    fireEvent.click(screen.getByRole('button', { name: 'Delaware' }));
    fireEvent.click(screen.getByRole('button', { name: /build my plan/i }));

    // Reveal phase
    expect(screen.getByText(/Connecting the dots/i)).toBeInTheDocument();

    // Wait for reveal to finish, then click through to the dossier.
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /view my plan/i })).toBeInTheDocument();
    }, { timeout: 5000 });
    fireEvent.click(screen.getByRole('button', { name: /view my plan/i }));

    // Landed on the pre-filled dossier.
    expect(screen.getByText('Venture Dossier Unlocked!')).toBeInTheDocument();
    expect(screen.getAllByText(/NiaPay/i).length).toBeGreaterThanOrEqual(1);
  }, 15000);

  it('lets the user skip all QuickStart questions', async () => {
    render(<FintechBusinessBuilder />);
    fireEvent.click(screen.getByRole('button', { name: /quickstart/i }));

    for (let i = 0; i < 8; i++) {
      fireEvent.click(screen.getByRole('button', { name: /skip/i }));
    }

    // Reveal phase reached; defaults still produce a plan.
    expect(screen.getByText(/Connecting the dots/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /view my plan/i })).toBeInTheDocument();
    }, { timeout: 5000 });
    fireEvent.click(screen.getByRole('button', { name: /view my plan/i }));
    expect(screen.getByText('Venture Dossier Unlocked!')).toBeInTheDocument();
  }, 15000);

  it('switches from QuickStart back to Step-by-Step mode', () => {
    render(<FintechBusinessBuilder />);
    fireEvent.click(screen.getByRole('button', { name: /quickstart/i }));
    expect(screen.getByText(/What kind of business are you starting/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /step-by-step/i }));
    expect(screen.getByText(/What type of business are you building/i)).toBeInTheDocument();
  });
});
