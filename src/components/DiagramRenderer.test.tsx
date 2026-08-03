import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DiagramRenderer } from './DiagramRenderer';
import type { DiagramData } from '../data/extendedQuizBank';

describe('DiagramRenderer', () => {
  it('returns null when diagram is null', () => {
    const { container } = render(<DiagramRenderer diagram={null as any} />);
    expect(container.innerHTML).toBe('');
  });

  it('returns null when diagram is undefined', () => {
    const { container } = render(<DiagramRenderer diagram={undefined as any} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders title when provided', () => {
    const diagram: DiagramData = { type: 'flow', title: 'Flow Title', nodes: [] };
    render(<DiagramRenderer diagram={diagram} />);
    expect(screen.getByText('Flow Title')).toBeInTheDocument();
  });

  it('does not render title when not provided', () => {
    const diagram: DiagramData = { type: 'flow', nodes: [] };
    render(<DiagramRenderer diagram={diagram} />);
    expect(screen.queryByText('Flow Title')).not.toBeInTheDocument();
  });

  it('renders flow diagram with nodes', () => {
    const diagram: DiagramData = {
      type: 'flow',
      title: 'Process',
      nodes: [{ label: 'Step 1', sub: 'Start' }, { label: 'Step 2' }, { label: 'Step 3', sub: 'End' }],
    };
    render(<DiagramRenderer diagram={diagram} />);
    expect(screen.getByText('Step 1')).toBeInTheDocument();
    expect(screen.getByText('Step 2')).toBeInTheDocument();
    expect(screen.getByText('Step 3')).toBeInTheDocument();
    expect(screen.getByText('Start')).toBeInTheDocument();
  });

  it('renders ledger diagram with debits and credits', () => {
    const diagram: DiagramData = {
      type: 'ledger',
      title: 'T-Account',
      debits: [{ account: 'Cash', amount: '$1,000' }],
      credits: [{ account: 'Revenue', amount: '$1,000' }],
    };
    render(<DiagramRenderer diagram={diagram} />);
    expect(screen.getByText('DEBITS (Dr)')).toBeInTheDocument();
    expect(screen.getByText('CREDITS (Cr)')).toBeInTheDocument();
    expect(screen.getByText('Cash')).toBeInTheDocument();
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getAllByText('$1,000').length).toBe(2);
  });

  it('renders scorecard/comparison table with rows', () => {
    const diagram: DiagramData = {
      type: 'scorecard',
      title: 'Comparison',
      rows: [
        { metric: 'Revenue', valA: '$100', valB: '$200', status: 'Better' },
        { metric: 'Cost', valA: '$50', valB: '$30', status: 'Worse' },
      ],
    };
    render(<DiagramRenderer diagram={diagram} />);
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('Cost')).toBeInTheDocument();
    expect(screen.getByText('$100')).toBeInTheDocument();
    expect(screen.getByText('$200')).toBeInTheDocument();
    expect(screen.getByText('Better')).toBeInTheDocument();
    expect(screen.getByText('Worse')).toBeInTheDocument();
  });

  it('renders scorecard without status column when rows have no status', () => {
    const diagram: DiagramData = {
      type: 'scorecard',
      rows: [{ metric: 'Metric', valA: 'A', valB: 'B' }],
    };
    render(<DiagramRenderer diagram={diagram} />);
    expect(screen.getByText('Metric / Signal')).toBeInTheDocument();
    expect(screen.getByText('Metric')).toBeInTheDocument();
    expect(screen.getByText('Value / Condition A')).toBeInTheDocument();
    expect(screen.getByText('Value / Condition B')).toBeInTheDocument();
    expect(screen.queryByText('Assessment')).not.toBeInTheDocument();
  });

  it('renders comparison type the same as scorecard', () => {
    const diagram: DiagramData = {
      type: 'comparison',
      rows: [{ metric: 'M1', valA: 'A', valB: 'B' }],
    };
    render(<DiagramRenderer diagram={diagram} />);
    expect(screen.getByText('M1')).toBeInTheDocument();
  });

  it('renders formula diagram', () => {
    const diagram: DiagramData = {
      type: 'formula',
      title: 'Formula',
      formula: 'E = mc²',
    };
    render(<DiagramRenderer diagram={diagram} />);
    expect(screen.getByText('E = mc²')).toBeInTheDocument();
  });

  it('renders code diagram', () => {
    const diagram: DiagramData = {
      type: 'code',
      title: 'Code Block',
      code: 'const x = 1;',
    };
    render(<DiagramRenderer diagram={diagram} />);
    expect(screen.getByText('const x = 1;')).toBeInTheDocument();
  });

  it('renders explanation note', () => {
    const diagram: DiagramData = {
      type: 'formula',
      formula: 'A = B',
      explanationNote: 'This is a note',
    };
    render(<DiagramRenderer diagram={diagram} />);
    expect(screen.getByText('* This is a note')).toBeInTheDocument();
  });

  it('renders ledger with empty debits/credits', () => {
    const diagram: DiagramData = { type: 'ledger', debits: [], credits: [] };
    render(<DiagramRenderer diagram={diagram} />);
    expect(screen.getByText('DEBITS (Dr)')).toBeInTheDocument();
    expect(screen.getByText('CREDITS (Cr)')).toBeInTheDocument();
  });

  it('renders flow with single node', () => {
    const diagram: DiagramData = { type: 'flow', nodes: [{ label: 'Only' }] };
    render(<DiagramRenderer diagram={diagram} />);
    expect(screen.getByText('Only')).toBeInTheDocument();
  });

  it('renders comparison with status on rows', () => {
    const diagram: DiagramData = {
      type: 'comparison',
      rows: [{ metric: 'M', valA: 'A', valB: 'B', status: 'OK' }],
    };
    render(<DiagramRenderer diagram={diagram} />);
    expect(screen.getByText('Assessment')).toBeInTheDocument();
    expect(screen.getByText('OK')).toBeInTheDocument();
  });
});
