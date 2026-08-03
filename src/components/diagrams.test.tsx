import { describe, it, expect } from 'vitest';
import { DiagramMermaid } from './DiagramMermaid';
import { DiagramFlow } from './DiagramFlow';
import { DiagramMindMap } from './DiagramMindMap';
import * as diagrams from './diagrams';

describe('diagrams barrel exports', () => {
  it('exports DiagramMermaid', () => {
    expect(diagrams.DiagramMermaid).toBe(DiagramMermaid);
  });

  it('exports DiagramFlow', () => {
    expect(diagrams.DiagramFlow).toBe(DiagramFlow);
  });

  it('exports DiagramMindMap', () => {
    expect(diagrams.DiagramMindMap).toBe(DiagramMindMap);
  });

  it('exports exactly three members', () => {
    expect(Object.keys(diagrams)).toHaveLength(3);
  });

  it('re-exports DiagramMermaid as a function component', () => {
    expect(typeof DiagramMermaid).toBe('function');
  });

  it('re-exports DiagramFlow as a function component', () => {
    expect(typeof DiagramFlow).toBe('function');
  });

  it('re-exports DiagramMindMap as a function component', () => {
    expect(typeof DiagramMindMap).toBe('function');
  });
});
