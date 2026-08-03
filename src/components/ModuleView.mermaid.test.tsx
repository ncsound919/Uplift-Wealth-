import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ModuleView } from './ModuleView';
import type { Module } from '../data/courseData';
import React from 'react';

// This file exercises the react-markdown `components.code` / `components.pre`
// handlers in ModuleView (mermaid + inline code paths) and the lazy import of
// DiagramMermaid, all of which need a mock react-markdown that actually invokes
// the components instead of just passing children through.

vi.mock('motion/react', () => ({
  motion: new Proxy({}, { get: () => 'div' }),
  AnimatePresence: ({ children }: any) => <div>{children}</div>,
}));
vi.mock('remark-math', () => ({ default: () => {} }));
vi.mock('rehype-katex', () => ({ default: () => {} }));
vi.mock('./diagrams', () => ({ DiagramMermaid: () => <div>Diagram</div>, DiagramFlow: () => <div>Flow</div>, DiagramMindMap: () => <div>MindMap</div> }));
vi.mock('./DiagramMermaid', () => ({
  DiagramMermaid: () => <div data-testid="mermaid-lazy-mock" />,
}));
vi.mock('react-markdown', () => ({
  default: ({ children, components }: any) => {
    const code = components?.code;
    const pre = components?.pre;
    // Function named exactly "DiagramMermaid" so the `pre` handler can detect it.
    function DiagramMermaid() {
      return <div data-testid="mermaid-mock" />;
    }
    const mermaidCode = code
      ? code({ className: 'language-mermaid', children: 'sequenceDiagram\n  A->>B: hi' })
      : null;
    const inlineCode = code
      ? code({ className: undefined, children: 'const inline = 1;' })
      : null;
    const preMermaid = pre ? pre({ children: [React.createElement(DiagramMermaid)] }) : null;
    const prePlain = pre ? pre({ children: [<span key="p">plain pre</span>] }) : null;
    const preSingle = pre ? pre({ children: <span key="s">single child</span> }) : null;
    return (
      <div>
        {mermaidCode}
        {inlineCode}
        {preMermaid}
        {prePlain}
        {preSingle}
        {children}
      </div>
    );
  },
}));
vi.mock('../data/lectureLibrary', () => ({
  LECTURE_CLASSES: [
    {
      moduleId: 'mod-mermaid',
      id: 'class-m',
      title: 'Mermaid Class',
      subtitle: 'Sub',
      overview: 'Overview text',
      learningOutcomes: ['Outcome'],
      keyConcepts: [{ term: 'Term', definition: 'Def', practicalUse: 'Use' }],
      slides: [{ title: 'Slide 1', subtitle: 'Sub', bullets: ['Insight text'] }],
      teachingMoves: [],
      appliedProjectHandout: { title: '', description: '', reusableOutput: '', checklist: [], technicalSpec: '' },
    },
  ],
}));
vi.mock('../utils/iconResolver', () => ({ resolveIcon: vi.fn(() => () => <div>Icon</div>) }));
vi.mock('./Quiz', () => ({ Quiz: () => <div>Quiz</div> }));
vi.mock('./TradingGame', () => ({ TradingGame: () => <div>TradingGame</div> }));
vi.mock('./UnderwritingGame', () => ({ UnderwritingGame: () => <div>UnderwritingGame</div> }));
vi.mock('./ParametricGame', () => ({ ParametricGame: () => <div>ParametricGame</div> }));
vi.mock('./FraudGame', () => ({ FraudGame: () => <div>FraudGame</div> }));
vi.mock('./YouTubeVideoPlayer', () => ({ YouTubeVideoPlayer: () => <div>YouTubeVideoPlayer</div> }));

const mermaidModule: Module = {
  id: 'mod-mermaid',
  level: 'beginner' as const,
  title: 'Mermaid Module',
  description: 'A module with diagram content',
  icon: 'Landmark' as any,
  color: 'bg-indigo-600',
  lessons: [
    { id: 'm1', title: 'Diagram Lesson', type: 'text' as const, content: '```mermaid\nsequenceDiagram\n  A->>B: hi\n```' },
  ],
};

describe('ModuleView Markdown Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders mermaid diagram through the lazy import', async () => {
    render(<ModuleView module={mermaidModule} onBack={vi.fn()} onComplete={vi.fn()} onLessonComplete={vi.fn()} />);
    expect(await screen.findByTestId('mermaid-lazy-mock')).toBeInTheDocument();
  });

  it('renders the mermaid passthrough from the pre handler', () => {
    render(<ModuleView module={mermaidModule} onBack={vi.fn()} onComplete={vi.fn()} onLessonComplete={vi.fn()} />);
    expect(screen.getByTestId('mermaid-mock')).toBeInTheDocument();
  });

  it('renders inline code and plain pre blocks', () => {
    render(<ModuleView module={mermaidModule} onBack={vi.fn()} onComplete={vi.fn()} onLessonComplete={vi.fn()} />);
    expect(screen.getByText('const inline = 1;')).toBeInTheDocument();
    expect(screen.getByText('plain pre')).toBeInTheDocument();
    expect(screen.getByText('single child')).toBeInTheDocument();
  });
});
