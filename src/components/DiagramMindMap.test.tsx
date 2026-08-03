import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DiagramMindMap } from './DiagramMindMap';

const { mockTransform, mockCreate, MockTransformer } = vi.hoisted(() => {
  const transformFn = vi.fn();
  const createFn = vi.fn();
  return {
    mockTransform: transformFn,
    mockCreate: createFn,
    MockTransformer: class { transform = transformFn; },
  };
});

vi.mock('markmap-lib', () => ({
  Transformer: MockTransformer,
}));

vi.mock('markmap-view', () => ({
  Markmap: { create: (...args: any[]) => mockCreate(...args) },
}));

describe('DiagramMindMap', () => {
  beforeEach(() => {
    mockTransform.mockReset();
    mockCreate.mockReset();
  });

  it('returns null when markdown is empty', () => {
    const { container } = render(<DiagramMindMap markdown="" />);
    expect(container.innerHTML).toBe('');
  });

  it('renders mind map when markdown is provided', () => {
    const root = { data: {}, children: [] };
    mockTransform.mockReturnValue({ root });
    render(<DiagramMindMap markdown={'# Title\n- Item'} />);
    expect(mockTransform).toHaveBeenCalledWith('# Title\n- Item');
    expect(mockCreate).toHaveBeenCalledWith(
      expect.any(SVGSVGElement),
      expect.objectContaining({ zoom: true, pan: true, duration: 500 }),
      root,
    );
  });

  it('displays title when provided', () => {
    mockTransform.mockReturnValue({ root: { data: {}, children: [] } });
    render(<DiagramMindMap markdown="# Title" title="Mind Map" />);
    expect(screen.getByText('Mind Map')).toBeInTheDocument();
  });

  it('does not display title when not provided', () => {
    mockTransform.mockReturnValue({ root: { data: {}, children: [] } });
    render(<DiagramMindMap markdown="# Title" />);
    expect(screen.queryByText('Mind Map')).not.toBeInTheDocument();
  });

  it('applies className to wrapper', () => {
    mockTransform.mockReturnValue({ root: { data: {}, children: [] } });
    const { container } = render(<DiagramMindMap markdown="# Title" className="extra-class" />);
    expect(container.querySelector('.extra-class')).toBeInTheDocument();
  });

  it('uses custom height', () => {
    mockTransform.mockReturnValue({ root: { data: {}, children: [] } });
    const { container } = render(<DiagramMindMap markdown="# Title" height={600} />);
    const svg = container.querySelector('svg');
    expect(svg?.style.height).toBe('600px');
  });

  it('shows error on render failure', () => {
    mockTransform.mockImplementation(() => { throw new Error('Parse error'); });
    render(<DiagramMindMap markdown="# Invalid" />);
    expect(screen.getByText('Parse error')).toBeInTheDocument();
  });

  it('handles error with no message', () => {
    mockTransform.mockImplementation(() => { throw {}; });
    render(<DiagramMindMap markdown="# Invalid" />);
    expect(screen.getByText('Mind map render failed')).toBeInTheDocument();
  });

  it('resets error on successful re-render', () => {
    mockTransform.mockImplementationOnce(() => { throw new Error('Fail'); });
    mockTransform.mockImplementationOnce(() => ({ root: { data: {}, children: [] } }));
    const { rerender } = render(<DiagramMindMap markdown="# Invalid" />);
    expect(screen.getByText('Fail')).toBeInTheDocument();
    rerender(<DiagramMindMap markdown="# Valid" />);
    expect(screen.queryByText('Fail')).not.toBeInTheDocument();
  });
});
