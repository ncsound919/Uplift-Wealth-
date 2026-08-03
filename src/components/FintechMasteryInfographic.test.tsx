import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FintechMasteryInfographic } from './FintechMasteryInfographic';

vi.mock('motion/react', () => ({
  motion: new Proxy({}, { get: () => 'div' }),
  AnimatePresence: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('../lib/utils', () => ({ cn: (...args: any[]) => args.filter(Boolean).join(' ') }));

describe('FintechMasteryInfographic', () => {
  it('renders the main title', () => {
    render(<FintechMasteryInfographic />);
    expect(screen.getByText(/Curriculum Blueprint Roadmap/i)).toBeInTheDocument();
  });

  it('shows progress as 0/6 Phases with no completed modules', () => {
    render(<FintechMasteryInfographic />);
    expect(screen.getByText(/0\/6 Phases/i)).toBeInTheDocument();
  });

  it('renders all 8 phase cards', () => {
    render(<FintechMasteryInfographic />);
    expect(screen.getByText('Foundations of Financial Literacy')).toBeInTheDocument();
    expect(screen.getByText('Unlocking the Rails')).toBeInTheDocument();
    expect(screen.getByText('The New Financial Stack')).toBeInTheDocument();
    expect(screen.getByText('Software-Driven Verticals')).toBeInTheDocument();
    expect(screen.getByText('Parametric Protection')).toBeInTheDocument();
    expect(screen.getByText('Digital Coins & DeFi')).toBeInTheDocument();
    expect(screen.getByText('Systemic Reform & Architecture')).toBeInTheDocument();
    expect(screen.getByText('Finance & FinTech Dictionary')).toBeInTheDocument();
  });

  it('marks a phase as in-progress when some shortcuts are completed', () => {
    render(<FintechMasteryInfographic completedModules={['module-1']} />);
    expect(screen.getByText(/1\/2 Active/i)).toBeInTheDocument();
    const activeElements = screen.getAllByText(/Active/i);
    expect(activeElements.length).toBeGreaterThanOrEqual(1);
  });

  it('marks a phase as fully done when all shortcuts completed', () => {
    render(<FintechMasteryInfographic completedModules={['module-1', 'module-2']} />);
    expect(screen.getAllByText(/Done/i).length).toBeGreaterThanOrEqual(1);
  });

  it('shows progress badge as 1/6 Phases after completing one phase', () => {
    render(<FintechMasteryInfographic completedModules={['module-1', 'module-2']} />);
    expect(screen.getByText(/1\/6 Phases/i)).toBeInTheDocument();
  });

  it('opens modal when Info button is clicked', () => {
    render(<FintechMasteryInfographic />);
    const infoBtns = screen.getAllByTitle('View Phase Details');
    fireEvent.click(infoBtns[0]);
    expect(screen.getByText(/Phase 1 • Foundations/i)).toBeInTheDocument();
  });

  it('closes modal when X button is clicked', () => {
    render(<FintechMasteryInfographic />);
    const infoBtns = screen.getAllByTitle('View Phase Details');
    fireEvent.click(infoBtns[0]);
    fireEvent.click(screen.getByText('Close Window'));
    expect(screen.queryByText(/Phase 1 • Foundations/i)).not.toBeInTheDocument();
  });

  it('opens modal when Details button is clicked', () => {
    render(<FintechMasteryInfographic />);
    const detailsBtns = screen.getAllByText('Details');
    fireEvent.click(detailsBtns[0]);
    expect(screen.getByText(/Phase 1 • Foundations/i)).toBeInTheDocument();
  });

  it('calls onSelectModule when a module shortcut is clicked', () => {
    const onSelectModule = vi.fn();
    render(<FintechMasteryInfographic onSelectModule={onSelectModule} />);
    const startBtns = screen.getAllByText('Start');
    fireEvent.click(startBtns[0]);
    expect(onSelectModule).toHaveBeenCalledWith('module-0');
  });

  it('calls onSelectModule from modal and closes modal', () => {
    const onSelectModule = vi.fn();
    render(<FintechMasteryInfographic onSelectModule={onSelectModule} />);
    const detailsBtns = screen.getAllByText('Details');
    fireEvent.click(detailsBtns[0]);
    const beginBtns = screen.getAllByText(/Begin Now ➔/i);
    fireEvent.click(beginBtns[0]);
    expect(onSelectModule).toHaveBeenCalled();
    expect(screen.queryByText(/Phase 1 • Foundations/i)).not.toBeInTheDocument();
  });

  it('shows Completed label for done modules in modal', () => {
    render(<FintechMasteryInfographic completedModules={['module-1']} />);
    const detailsBtns = screen.getAllByText('Details');
    fireEvent.click(detailsBtns[1]);
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('shows a module as done in the card list', () => {
    render(<FintechMasteryInfographic completedModules={['module-0']} />);
    const doneLabels = screen.getAllByText('Done');
    expect(doneLabels.length).toBeGreaterThanOrEqual(1);
  });

  it('closes modal with X button', () => {
    render(<FintechMasteryInfographic />);
    const infoBtns = screen.getAllByTitle('View Phase Details');
    fireEvent.click(infoBtns[0]);
    const modal = screen.getByText(/Launch Classes/i);
    expect(modal).toBeInTheDocument();
    const xBtns = screen.getAllByRole('button', { name: '' });
    const xBtn = xBtns.find(b => b.innerHTML.includes('lucide-x'));
    if (xBtn) fireEvent.click(xBtn);
    expect(screen.queryByText(/Launch Classes/i)).not.toBeInTheDocument();
  });

  it('does not fail when onSelectModule is not provided', () => {
    render(<FintechMasteryInfographic />);
    const startBtns = screen.getAllByText('Start');
    fireEvent.click(startBtns[0]);
    expect(screen.getByText(/Curriculum Blueprint/i)).toBeInTheDocument();
  });

  it('does not fail when onSelectModule is not provided from modal', () => {
    render(<FintechMasteryInfographic />);
    const infoBtns = screen.getAllByTitle('View Phase Details');
    fireEvent.click(infoBtns[0]);
    const beginBtns = screen.getAllByText(/Begin Now ➔/i);
    fireEvent.click(beginBtns[0]);
    expect(screen.queryByText(/Launch Classes/i)).not.toBeInTheDocument();
  });

  it('shows key building blocks in modal', () => {
    render(<FintechMasteryInfographic />);
    const infoBtns = screen.getAllByTitle('View Phase Details');
    fireEvent.click(infoBtns[0]);
    expect(screen.getByText(/Key Building Blocks/i)).toBeInTheDocument();
  });

  it('shows performance goal in modal', () => {
    render(<FintechMasteryInfographic />);
    const infoBtns = screen.getAllByTitle('View Phase Details');
    fireEvent.click(infoBtns[0]);
    expect(screen.getByText(/Performance Goal/i)).toBeInTheDocument();
  });
});
