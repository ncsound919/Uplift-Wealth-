import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { DiagramMermaid } from './DiagramMermaid';

const { mockRender, mockMermaid } = vi.hoisted(() => {
  const renderFn = vi.fn(() => Promise.resolve({ svg: '<svg>default</svg>' }));
  return {
    mockRender: renderFn,
    mockMermaid: {
      initialize: vi.fn(),
      render: (...args: any[]) => (renderFn as any)(...args),
    },
  };
});

vi.mock('mermaid', () => ({ default: mockMermaid }));

function deferred(): { p: Promise<{ svg: string }>; resolve: (v: { svg: string }) => void; reject: (e: any) => void } {
  let resolve: any;
  let reject: any;
  const p = new Promise<any>((res, rej) => { resolve = res; reject = rej; });
  return { p, resolve, reject };
}

describe('DiagramMermaid', () => {
  beforeEach(() => {
    mockRender.mockClear();
    mockRender.mockImplementation(() => Promise.resolve({ svg: '<svg>default</svg>' }));
  });

  it('returns null when chart is empty', () => {
    const { container } = render(<DiagramMermaid chart="" />);
    expect(container.innerHTML).toBe('');
  });

  it('renders mermaid diagram when chart is provided', async () => {
    const d = deferred();
    mockRender.mockReturnValue(d.p);
    render(<DiagramMermaid chart="graph TD; A-->B;" />);
    d.resolve({ svg: '<svg>diagram</svg>' });
    await act(async () => { await d.p; });
    expect(mockRender).toHaveBeenCalled();
  });

  it('sanitizes SVG output', async () => {
    const d = deferred();
    mockRender.mockReturnValue(d.p);
    render(<DiagramMermaid chart="graph TD; A-->B;" />);
    d.resolve({ svg: '<svg><script>alert(1)</script><g>safe</g></svg>' });
    await act(async () => { await d.p; });
    const wrapper = document.querySelector('.mermaid-wrapper');
    expect(wrapper?.innerHTML).not.toContain('<script>');
    expect(wrapper?.innerHTML).toContain('<g>safe</g>');
  });

  it('displays title when provided', () => {
    render(<DiagramMermaid chart="graph TD; A-->B;" title="My Diagram" />);
    expect(screen.getByText('My Diagram')).toBeInTheDocument();
  });

  it('does not display title when not provided', () => {
    render(<DiagramMermaid chart="graph TD; A-->B;" />);
    expect(screen.queryByText('My Diagram')).not.toBeInTheDocument();
  });

  it('applies className to wrapper', () => {
    const { container } = render(<DiagramMermaid chart="graph TD;" className="extra-class" />);
    expect(container.querySelector('.extra-class')).toBeInTheDocument();
  });

  it('shows error message on render failure', async () => {
    const d = deferred();
    mockRender.mockReturnValue(d.p);
    render(<DiagramMermaid chart="graph TD; A-->B;" />);
    d.reject(new Error('Syntax error in graph'));
    await act(async () => {
      try { await d.p; } catch {}
    });
    expect(screen.getByText('Syntax error in graph')).toBeInTheDocument();
  });

  it('does not update after unmount', async () => {
    const d = deferred();
    mockRender.mockReturnValue(d.p);
    const { unmount } = render(<DiagramMermaid chart="graph TD; A-->B;" />);
    unmount();
    d.resolve({ svg: '<svg>diagram</svg>' });
    await act(async () => { await d.p.catch(() => {}); });
    expect(document.querySelector('.mermaid-wrapper')).toBeNull();
  });

  it('does not update chart ref after unmount on error', async () => {
    const d = deferred();
    mockRender.mockReturnValue(d.p);
    const { unmount } = render(<DiagramMermaid chart="graph TD; A-->B;" />);
    unmount();
    d.reject(new Error('fail'));
    await act(async () => {
      try { await d.p; } catch {}
    });
    expect(screen.queryByText('fail')).not.toBeInTheDocument();
  });

  it('shows SVG parse failed error when output is not valid SVG', async () => {
    const d = deferred();
    mockRender.mockReturnValue(d.p);
    render(<DiagramMermaid chart="graph TD; A-->B;" />);
    d.resolve({ svg: 'not-an-svg' });
    await act(async () => { await d.p; });
    expect(screen.getByText('SVG parse failed')).toBeInTheDocument();
  });
});
