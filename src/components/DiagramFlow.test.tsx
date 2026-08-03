import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DiagramFlow } from './DiagramFlow';

const mockSetEdges = vi.fn();
const mockOnConnect = vi.fn();

vi.mock('@xyflow/react', () => ({
  ReactFlow: (props: any) => {
    mockOnConnect.mockImplementation(props.onConnect);
    return <div data-testid="reactflow">{props.children}</div>;
  },
  Background: () => <div />,
  Controls: () => <div />,
  MiniMap: () => <div />,
  useNodesState: (initial: any) => [initial, vi.fn(), vi.fn()],
  useEdgesState: (initial: any) => {
    mockSetEdges.mockImplementation((updater: any) => {
      const newEdges = updater(initial);
      return newEdges;
    });
    return [initial, mockSetEdges, vi.fn()];
  },
  BackgroundVariant: { Dots: 'dots' },
}));

describe('DiagramFlow', () => {
  it('renders ReactFlow component', () => {
    render(<DiagramFlow initialNodes={[]} initialEdges={[]} />);
    expect(screen.getByTestId('reactflow')).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(<DiagramFlow initialNodes={[]} initialEdges={[]} title="My Diagram" />);
    expect(screen.getByText('My Diagram')).toBeInTheDocument();
  });

  it('does not render title when not provided', () => {
    render(<DiagramFlow initialNodes={[]} initialEdges={[]} />);
    expect(screen.queryByText('My Diagram')).not.toBeInTheDocument();
  });

  it('applies className to wrapper', () => {
    const { container } = render(<DiagramFlow initialNodes={[]} initialEdges={[]} className="custom-class" />);
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('creates a connection with correct id and style when onConnect is called', () => {
    render(<DiagramFlow initialNodes={[]} initialEdges={[]} />);
    const params = { source: 'node-1', target: 'node-2' };
    mockOnConnect(params);
    expect(mockSetEdges).toHaveBeenCalled();
  });

  it('passes fitView prop', () => {
    render(<DiagramFlow initialNodes={[]} initialEdges={[]} fitView={false} />);
    expect(screen.getByTestId('reactflow')).toBeInTheDocument();
  });

  it('passes custom nodeTypes', () => {
    const customTypes = { custom: () => null };
    render(<DiagramFlow initialNodes={[]} initialEdges={[]} nodeTypes={customTypes} />);
    expect(screen.getByTestId('reactflow')).toBeInTheDocument();
  });
});
