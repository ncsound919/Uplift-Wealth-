import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ModuleView } from './ModuleView';
import type { Module } from '../data/courseData';

vi.mock('motion/react', () => ({
  motion: new Proxy({}, { get: () => 'div' }),
  AnimatePresence: ({ children }: any) => <div>{children}</div>,
}));
vi.mock('react-markdown', () => ({ default: ({ children }: any) => <div>{children}</div> }));
vi.mock('remark-math', () => ({ default: () => {} }));
vi.mock('rehype-katex', () => ({ default: () => {} }));
vi.mock('./diagrams', () => ({ DiagramMermaid: () => <div>Diagram</div>, DiagramFlow: () => <div>Flow</div>, DiagramMindMap: () => <div>MindMap</div> }));
vi.mock('./Quiz', () => ({ Quiz: ({ onComplete }: any) => <div data-testid="quiz-mock"><button data-testid="quiz-complete-btn" onClick={() => onComplete()}>Quiz Component</button></div> }));
vi.mock('../data/lectureLibrary', () => ({
  LECTURE_CLASSES: [
    {
      moduleId: 'mod-1',
      id: 'class-1',
      title: 'Test Class',
      subtitle: 'Test Subtitle',
      overview: 'Test overview',
      learningOutcomes: ['Outcome 1', 'Outcome 2'],
      keyConcepts: [
        { term: 'Term 1', definition: 'Definition 1', practicalUse: 'Use 1' },
        { term: 'Term 2', definition: 'Definition 2', practicalUse: 'Use 2' },
        { term: 'Term 3', definition: 'Definition 3', practicalUse: 'Use 3' },
      ],
      slides: [{ title: 'Slide 1', subtitle: 'Sub 1', bullets: ['Professional insight text'] }],
      teachingMoves: [],
      appliedProjectHandout: { title: '', description: '', reusableOutput: '', checklist: [], technicalSpec: '' },
    },
    {
      moduleId: 'mod-nobullets',
      id: 'class-nob',
      title: 'No Bullets Class',
      subtitle: 'Test',
      overview: 'Fallback overview text for slide without bullets',
      learningOutcomes: [],
      keyConcepts: [{ term: 'Term', definition: 'Def', practicalUse: 'Use' }],
      slides: [{ title: 'Slide 1', subtitle: 'Sub 1' }] as any,
      teachingMoves: [],
      appliedProjectHandout: { title: '', description: '', reusableOutput: '', checklist: [], technicalSpec: '' },
    },
  ],
}));
vi.mock('../utils/iconResolver', () => ({ resolveIcon: vi.fn(() => () => <div>Icon</div>) }));
vi.mock('./YouTubeVideoPlayer', () => ({ YouTubeVideoPlayer: ({ videoId, title }: any) => <div data-testid="youtube-mock">{title} - {videoId}</div> }));
vi.mock('./TradingGame', () => ({ TradingGame: () => <div data-testid="trading-game">TradingGame</div> }));
vi.mock('./UnderwritingGame', () => ({ UnderwritingGame: () => <div data-testid="underwriting-game">UnderwritingGame</div> }));
vi.mock('./ParametricGame', () => ({ ParametricGame: () => <div data-testid="parametric-game">ParametricGame</div> }));
vi.mock('./FraudGame', () => ({ FraudGame: () => <div data-testid="fraud-game">FraudGame</div> }));

const mockModule: Module = {
  id: 'mod-1',
  level: 'beginner' as const,
  title: 'Test Module',
  description: 'A test module description',
  icon: 'Landmark' as any,
  color: 'bg-indigo-600',
  takeaways: ['Takeaway 1', 'Takeaway 2'],
  didYouKnow: 'Interesting fact about fintech',
  lessons: [
    { id: 'l1', title: 'Text Lesson', type: 'text' as const, content: '# Hello World' },
    { id: 'l2', title: 'Quiz Lesson', type: 'quiz' as const, content: 'Quiz', quiz: [{ question: 'Q1?', options: ['A', 'B', 'C', 'D'], correctAnswer: 0, explanation: 'Because' }] },
    { id: 'l3', title: 'Trading Sim', type: 'game' as const, content: 'Game', gameType: 'trading' as const },
    { id: 'l4', title: 'Video Lesson', type: 'video' as const, content: 'Video desc', videoId: 'abc123xyz' },
    { id: 'l5', title: 'Underwriting Sim', type: 'game' as const, content: 'Game', gameType: 'underwriting' as const },
    { id: 'l6', title: 'Parametric Sim', type: 'game' as const, content: 'Game', gameType: 'parametric' as const },
    { id: 'l7', title: 'Fraud Sim', type: 'game' as const, content: 'Game', gameType: 'fraud' as const },
  ],
};

const moduleNoLecture: Module = {
  id: 'mod-unknown',
  level: 'intermediate' as const,
  title: 'No Lecture',
  description: 'No lecture class',
  icon: 'Landmark' as any,
  color: 'bg-red-600',
  lessons: [
    { id: 'x1', title: 'Generic Lesson', type: 'text' as const, content: 'Generic' },
  ],
};

const moduleNoExtra: Module = {
  ...mockModule,
  id: 'mod-2',
  takeaways: undefined,
  didYouKnow: undefined,
};

const moduleNoBullets: Module = {
  ...mockModule,
  id: 'mod-nobullets',
  lessons: [
    { id: 'nb1', title: 'No Bullets', type: 'text' as const, content: 'Content' },
  ],
};

describe('ModuleView', () => {
  const mockOnBack = vi.fn();
  const mockOnComplete = vi.fn();
  const mockOnLessonComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders module title', () => {
    render(<ModuleView module={mockModule} onBack={mockOnBack} onComplete={mockOnComplete} onLessonComplete={mockOnLessonComplete} />);
    expect(screen.getByText('Test Module')).toBeInTheDocument();
  });

  it('renders module description', () => {
    render(<ModuleView module={mockModule} onBack={mockOnBack} onComplete={mockOnComplete} onLessonComplete={mockOnLessonComplete} />);
    expect(screen.getByText('A test module description')).toBeInTheDocument();
  });

  it('renders lesson list in sidebar', () => {
    render(<ModuleView module={mockModule} onBack={mockOnBack} onComplete={mockOnComplete} onLessonComplete={mockOnLessonComplete} />);
    const textLessons = screen.getAllByText('Text Lesson');
    expect(textLessons.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Quiz Lesson')).toBeInTheDocument();
    expect(screen.getByText('Trading Sim')).toBeInTheDocument();
    expect(screen.getByText('Video Lesson')).toBeInTheDocument();
    expect(screen.getByText('Underwriting Sim')).toBeInTheDocument();
    expect(screen.getByText('Parametric Sim')).toBeInTheDocument();
    expect(screen.getByText('Fraud Sim')).toBeInTheDocument();
  });

  it('shows total lesson count', () => {
    render(<ModuleView module={mockModule} onBack={mockOnBack} onComplete={mockOnComplete} onLessonComplete={mockOnLessonComplete} />);
    expect(screen.getByText('7 total')).toBeInTheDocument();
  });

  it('renders text lesson content and counter', () => {
    render(<ModuleView module={mockModule} onBack={mockOnBack} onComplete={mockOnComplete} onLessonComplete={mockOnLessonComplete} />);
    expect(screen.getByText('# Hello World')).toBeInTheDocument();
    expect(screen.getByText('1 of 7')).toBeInTheDocument();
  });

  it('shows checkpoint after Mark Complete for text lesson', () => {
    render(<ModuleView module={mockModule} onBack={mockOnBack} onComplete={mockOnComplete} onLessonComplete={mockOnLessonComplete} />);
    fireEvent.click(screen.getByText('Mark Complete'));
    expect(screen.getByText('Did you understand this lesson?')).toBeInTheDocument();
  });

  it('advances text lesson after two clicks on next button', () => {
    render(<ModuleView module={mockModule} onBack={mockOnBack} onComplete={mockOnComplete} onLessonComplete={mockOnLessonComplete} />);
    fireEvent.click(screen.getByText('Mark Complete'));
    fireEvent.click(screen.getByText('Continue'));
    expect(mockOnLessonComplete).toHaveBeenCalledWith('l1', 'text', 'mod-1');
    const quizLessons = screen.getAllByText('Quiz Lesson');
    expect(quizLessons.length).toBeGreaterThanOrEqual(1);
  });

  it('calls onBack when All Modules is clicked', () => {
    render(<ModuleView module={mockModule} onBack={mockOnBack} onComplete={mockOnComplete} onLessonComplete={mockOnLessonComplete} />);
    fireEvent.click(screen.getByText('All Modules'));
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('renders quiz component for quiz lesson', () => {
    render(<ModuleView module={mockModule} onBack={mockOnBack} onComplete={mockOnComplete} onLessonComplete={mockOnLessonComplete} />);
    fireEvent.click(screen.getByText('Quiz Lesson'));
    expect(screen.getByTestId('quiz-mock')).toBeInTheDocument();
  });

  it('shows Assessment badge for quiz lesson', () => {
    render(<ModuleView module={mockModule} onBack={mockOnBack} onComplete={mockOnComplete} onLessonComplete={mockOnLessonComplete} />);
    fireEvent.click(screen.getByText('Quiz Lesson'));
    expect(screen.getByText('Assessment')).toBeInTheDocument();
  });

  it('renders Previous button for quiz lesson', () => {
    render(<ModuleView module={mockModule} onBack={mockOnBack} onComplete={mockOnComplete} onLessonComplete={mockOnLessonComplete} />);
    fireEvent.click(screen.getByText('Quiz Lesson'));
    expect(screen.getByText('Previous')).toBeInTheDocument();
  });

  it('renders trading game', () => {
    render(<ModuleView module={mockModule} onBack={mockOnBack} onComplete={mockOnComplete} onLessonComplete={mockOnLessonComplete} />);
    fireEvent.click(screen.getByText('Trading Sim'));
    expect(screen.getByTestId('trading-game')).toBeInTheDocument();
  });

  it('renders underwriting game', () => {
    render(<ModuleView module={mockModule} onBack={mockOnBack} onComplete={mockOnComplete} onLessonComplete={mockOnLessonComplete} />);
    fireEvent.click(screen.getByText('Underwriting Sim'));
    expect(screen.getByTestId('underwriting-game')).toBeInTheDocument();
  });

  it('renders parametric game', () => {
    render(<ModuleView module={mockModule} onBack={mockOnBack} onComplete={mockOnComplete} onLessonComplete={mockOnLessonComplete} />);
    fireEvent.click(screen.getByText('Parametric Sim'));
    expect(screen.getByTestId('parametric-game')).toBeInTheDocument();
  });

  it('renders fraud game', () => {
    render(<ModuleView module={mockModule} onBack={mockOnBack} onComplete={mockOnComplete} onLessonComplete={mockOnLessonComplete} />);
    fireEvent.click(screen.getByText('Fraud Sim'));
    expect(screen.getByTestId('fraud-game')).toBeInTheDocument();
  });

  it('renders video lesson with YouTube player', () => {
    render(<ModuleView module={mockModule} onBack={mockOnBack} onComplete={mockOnComplete} onLessonComplete={mockOnLessonComplete} />);
    fireEvent.click(screen.getByText('Video Lesson'));
    expect(screen.getByTestId('youtube-mock')).toBeInTheDocument();
    expect(screen.getByText('Video Lesson - abc123xyz')).toBeInTheDocument();
  });

  it('calls onLessonComplete when advancing a non-last lesson', () => {
    render(<ModuleView module={mockModule} onBack={mockOnBack} onComplete={mockOnComplete} onLessonComplete={mockOnLessonComplete} />);
    fireEvent.click(screen.getByText('Mark Complete'));
    fireEvent.click(screen.getByText('Continue'));
    expect(mockOnLessonComplete).toHaveBeenCalledWith('l1', 'text', 'mod-1');
    expect(mockOnComplete).not.toHaveBeenCalled();
  });

  it('calls onComplete and onBack when finishing last lesson', () => {
    const twoLessonModule = {
      ...mockModule,
      lessons: [
        { id: 'a1', title: 'Lesson 1', type: 'text' as const, content: 'A' },
        { id: 'a2', title: 'Lesson 2', type: 'text' as const, content: 'B' },
      ],
    };
    render(<ModuleView module={twoLessonModule} onBack={mockOnBack} onComplete={mockOnComplete} onLessonComplete={mockOnLessonComplete} />);
    fireEvent.click(screen.getByText('Mark Complete'));
    fireEvent.click(screen.getByText('Continue'));
    expect(screen.getByText('2 of 2')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Mark Complete'));
    fireEvent.click(screen.getByText('Continue'));
    expect(mockOnComplete).toHaveBeenCalledWith('mod-1');
    expect(mockOnBack).toHaveBeenCalled();
    expect(mockOnLessonComplete).toHaveBeenCalledWith('a2', 'text', 'mod-1');
  });

  it('navigates between lessons via sidebar click', () => {
    render(<ModuleView module={mockModule} onBack={mockOnBack} onComplete={mockOnComplete} onLessonComplete={mockOnLessonComplete} />);
    fireEvent.click(screen.getByText('Quiz Lesson'));
    expect(screen.getByTestId('quiz-mock')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Text Lesson'));
    expect(screen.getByText('# Hello World')).toBeInTheDocument();
  });

  it('previous button goes to previous lesson', () => {
    render(<ModuleView module={mockModule} onBack={mockOnBack} onComplete={mockOnComplete} onLessonComplete={mockOnLessonComplete} />);
    fireEvent.click(screen.getByText('Quiz Lesson'));
    fireEvent.click(screen.getByText('Previous'));
    expect(screen.getByText('# Hello World')).toBeInTheDocument();
  });

  it('disables previous button on first lesson', () => {
    render(<ModuleView module={mockModule} onBack={mockOnBack} onComplete={mockOnComplete} onLessonComplete={mockOnLessonComplete} />);
    const prevButtons = screen.getAllByText('Previous');
    const prevButton = prevButtons[0].closest('button');
    expect(prevButton).toBeDisabled();
  });

  it('previous button from game lesson works', () => {
    render(<ModuleView module={mockModule} onBack={mockOnBack} onComplete={mockOnComplete} onLessonComplete={mockOnLessonComplete} />);
    fireEvent.click(screen.getByText('Trading Sim'));
    fireEvent.click(screen.getByText('Previous'));
    expect(screen.getByTestId('quiz-mock')).toBeInTheDocument();
  });

  it('renders takeaways and didYouKnow sections', () => {
    render(<ModuleView module={mockModule} onBack={mockOnBack} onComplete={mockOnComplete} onLessonComplete={mockOnLessonComplete} />);
    expect(screen.getByText('Key Takeaways')).toBeInTheDocument();
    expect(screen.getByText('Takeaway 1')).toBeInTheDocument();
    expect(screen.getByText('Takeaway 2')).toBeInTheDocument();
    expect(screen.getByText('Industry Note')).toBeInTheDocument();
    expect(screen.getByText('Interesting fact about fintech')).toBeInTheDocument();
  });

  it('omits takeaways and didYouKnow when absent', () => {
    render(<ModuleView module={moduleNoExtra} onBack={mockOnBack} onComplete={mockOnComplete} onLessonComplete={mockOnLessonComplete} />);
    expect(screen.queryByText('Key Takeaways')).not.toBeInTheDocument();
    expect(screen.queryByText('Industry Note')).not.toBeInTheDocument();
  });

  it('renders progress bar with correct initial value', () => {
    render(<ModuleView module={mockModule} onBack={mockOnBack} onComplete={mockOnComplete} onLessonComplete={mockOnLessonComplete} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '0');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });

  it('shows completion count', () => {
    render(<ModuleView module={mockModule} onBack={mockOnBack} onComplete={mockOnComplete} onLessonComplete={mockOnLessonComplete} />);
    expect(screen.getByText('0 of 7 lessons completed')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Mark Complete'));
    fireEvent.click(screen.getByText('Continue'));
    expect(screen.getByText('1 of 7 lessons completed')).toBeInTheDocument();
  });

  it('shows level track badge', () => {
    render(<ModuleView module={mockModule} onBack={mockOnBack} onComplete={mockOnComplete} onLessonComplete={mockOnLessonComplete} />);
    expect(screen.getByText('beginner Track')).toBeInTheDocument();
  });

  it('renders Study Guide download button', () => {
    render(<ModuleView module={mockModule} onBack={mockOnBack} onComplete={mockOnComplete} onLessonComplete={mockOnLessonComplete} />);
    expect(screen.getByText('Study Guide')).toBeInTheDocument();
  });

  it('renders outcomes tab with learning outcomes by default', () => {
    render(<ModuleView module={mockModule} onBack={mockOnBack} onComplete={mockOnComplete} onLessonComplete={mockOnLessonComplete} />);
    expect(screen.getByText('Learning Outcomes')).toBeInTheDocument();
    expect(screen.getByText('Outcome 1')).toBeInTheDocument();
    expect(screen.getByText('Outcome 2')).toBeInTheDocument();
  });

  it('switches to terms tab', () => {
    render(<ModuleView module={mockModule} onBack={mockOnBack} onComplete={mockOnComplete} onLessonComplete={mockOnLessonComplete} />);
    fireEvent.click(screen.getByText('Terms'));
    expect(screen.getByText('Term 1')).toBeInTheDocument();
    expect(screen.getByText('Definition 1')).toBeInTheDocument();
  });

  it('switches to insight tab', () => {
    render(<ModuleView module={mockModule} onBack={mockOnBack} onComplete={mockOnComplete} onLessonComplete={mockOnLessonComplete} />);
    fireEvent.click(screen.getByText('Insight'));
    expect(screen.getByText('Professional Insight')).toBeInTheDocument();
    expect(screen.getByText('Professional insight text')).toBeInTheDocument();
  });

  it('shows fallback text when no lecture class for outcomes', () => {
    render(<ModuleView module={moduleNoLecture} onBack={mockOnBack} onComplete={mockOnComplete} onLessonComplete={mockOnLessonComplete} />);
    expect(screen.getByText('Learning outcomes available in class materials.')).toBeInTheDocument();
  });

  it('progress percentage updates as lessons are completed', () => {
    render(<ModuleView module={mockModule} onBack={mockOnBack} onComplete={mockOnComplete} onLessonComplete={mockOnLessonComplete} />);
    const zeroPcts = screen.getAllByText('0%');
    expect(zeroPcts.length).toBe(2);
    fireEvent.click(screen.getByText('Mark Complete'));
    fireEvent.click(screen.getByText('Continue'));
    const fourteenPcts = screen.getAllByText('14%');
    expect(fourteenPcts.length).toBe(2);
  });

  it('checkpoint rating shows feedback text', () => {
    render(<ModuleView module={mockModule} onBack={mockOnBack} onComplete={mockOnComplete} onLessonComplete={mockOnLessonComplete} />);
    fireEvent.click(screen.getByText('Mark Complete'));
    fireEvent.click(screen.getByText('4'));
    expect(screen.getByText('Got it!')).toBeInTheDocument();
  });

  it('shows Simulation header for game lessons', () => {
    render(<ModuleView module={mockModule} onBack={mockOnBack} onComplete={mockOnComplete} onLessonComplete={mockOnLessonComplete} />);
    fireEvent.click(screen.getByText('Trading Sim'));
    expect(screen.getByText('Simulation')).toBeInTheDocument();
  });

  it('navigates from quiz to game via quiz mock complete button', () => {
    render(<ModuleView module={mockModule} onBack={mockOnBack} onComplete={mockOnComplete} onLessonComplete={mockOnLessonComplete} />);
    fireEvent.click(screen.getByText('Quiz Lesson'));
    fireEvent.click(screen.getByTestId('quiz-complete-btn'));
    expect(screen.getByTestId('trading-game')).toBeInTheDocument();
  });

  it('previous button from video lesson returns to previous lesson', () => {
    render(<ModuleView module={mockModule} onBack={mockOnBack} onComplete={mockOnComplete} onLessonComplete={mockOnLessonComplete} />);
    fireEvent.click(screen.getByText('Video Lesson'));
    fireEvent.click(screen.getByText('Previous'));
    expect(screen.getByTestId('trading-game')).toBeInTheDocument();
  });

  it('does not call onComplete for non-last lesson', () => {
    render(<ModuleView module={mockModule} onBack={mockOnBack} onComplete={mockOnComplete} onLessonComplete={mockOnLessonComplete} />);
    fireEvent.click(screen.getByText('Mark Complete'));
    fireEvent.click(screen.getByText('Continue'));
    expect(mockOnComplete).not.toHaveBeenCalled();
  });

  it('shows Video badge for video lessons', () => {
    render(<ModuleView module={mockModule} onBack={mockOnBack} onComplete={mockOnComplete} onLessonComplete={mockOnLessonComplete} />);
    fireEvent.click(screen.getByText('Video Lesson'));
    expect(screen.getByText('Video')).toBeInTheDocument();
  });

  it('renders Mark Complete button for video lesson', () => {
    render(<ModuleView module={mockModule} onBack={mockOnBack} onComplete={mockOnComplete} onLessonComplete={mockOnLessonComplete} />);
    fireEvent.click(screen.getByText('Video Lesson'));
    expect(screen.getByText('Mark Complete')).toBeInTheDocument();
  });

  it('renders lesson type labels in sidebar', () => {
    render(<ModuleView module={mockModule} onBack={mockOnBack} onComplete={mockOnComplete} onLessonComplete={mockOnLessonComplete} />);
    const textLabels = screen.getAllByText('text');
    const quizLabels = screen.getAllByText('quiz');
    const gameLabels = screen.getAllByText('game');
    const videoLabels = screen.getAllByText('video');
    expect(textLabels.length).toBeGreaterThan(0);
    expect(quizLabels.length).toBeGreaterThan(0);
    expect(gameLabels.length).toBeGreaterThan(0);
    expect(videoLabels.length).toBeGreaterThan(0);
  });

  it('shows lesson counter in video lesson', () => {
    render(<ModuleView module={mockModule} onBack={mockOnBack} onComplete={mockOnComplete} onLessonComplete={mockOnLessonComplete} />);
    fireEvent.click(screen.getByText('Video Lesson'));
    expect(screen.getByText('4 of 7')).toBeInTheDocument();
  });

  it('handles download study guide click without error', () => {
    globalThis.URL.createObjectURL = vi.fn(() => 'blob:test');
    render(<ModuleView module={mockModule} onBack={mockOnBack} onComplete={mockOnComplete} onLessonComplete={mockOnLessonComplete} />);
    expect(() => fireEvent.click(screen.getByText('Study Guide'))).not.toThrow();
  });

  it('renders fallback glossary terms when no lecture class', () => {
    render(<ModuleView module={moduleNoLecture} onBack={mockOnBack} onComplete={mockOnComplete} onLessonComplete={mockOnLessonComplete} />);
    fireEvent.click(screen.getByText('Terms'));
    expect(screen.getByText('Fintech Core')).toBeInTheDocument();
    expect(screen.getByText('API Pipeline')).toBeInTheDocument();
  });

  it('renders fallback pro insight when no lecture class', () => {
    render(<ModuleView module={moduleNoLecture} onBack={mockOnBack} onComplete={mockOnComplete} onLessonComplete={mockOnLessonComplete} />);
    fireEvent.click(screen.getByText('Insight'));
    expect(screen.getByText('Financial engineering combines rigorous software design with deep understanding of compliance and clearing rails.')).toBeInTheDocument();
  });

  it('handles unknown lesson type gracefully', () => {
    const badModule = {
      ...mockModule,
      id: 'mod-bad',
      lessons: [{ id: 'bad', title: 'Unknown Type', type: 'unknown' as any, content: 'x' }],
    };
    render(<ModuleView module={badModule} onBack={mockOnBack} onComplete={mockOnComplete} onLessonComplete={mockOnLessonComplete} />);
    expect(screen.getByText('Unknown Type')).toBeInTheDocument();
  });

  it('renders lesson type icon default fallback', () => {
    const fallbackModule = {
      ...mockModule,
      lessons: [{ id: 'fb', title: 'Fallback', type: 'other' as any, content: 'x' }],
    };
    render(<ModuleView module={fallbackModule} onBack={mockOnBack} onComplete={mockOnComplete} onLessonComplete={mockOnLessonComplete} />);
    expect(screen.getByText('Fallback')).toBeInTheDocument();
  });

  it('renders simulation description for game lessons', () => {
    render(<ModuleView module={mockModule} onBack={mockOnBack} onComplete={mockOnComplete} onLessonComplete={mockOnLessonComplete} />);
    fireEvent.click(screen.getByText('Trading Sim'));
    expect(screen.getByText(/Complete the simulation/)).toBeInTheDocument();
  });

  it('falls back to overview when slide has no bullets', () => {
    render(<ModuleView module={moduleNoBullets} onBack={mockOnBack} onComplete={mockOnComplete} onLessonComplete={mockOnLessonComplete} />);
    fireEvent.click(screen.getByText('Insight'));
    expect(screen.getByText('Fallback overview text for slide without bullets')).toBeInTheDocument();
  });

  it('confirms the checkpoint via rating and Continue button', () => {
    render(<ModuleView module={mockModule} onBack={mockOnBack} onComplete={mockOnComplete} onLessonComplete={mockOnLessonComplete} />);
    fireEvent.click(screen.getByText('Mark Complete'));
    fireEvent.click(screen.getByText('5'));
    expect(screen.getByText('Got it!')).toBeInTheDocument();
    const continueBtns = screen.getAllByText('Continue');
    fireEvent.click(continueBtns[0]);
    expect(screen.queryByText('Did you understand this lesson?')).not.toBeInTheDocument();
  });

  it('returns to the outcomes tab after switching', () => {
    render(<ModuleView module={mockModule} onBack={mockOnBack} onComplete={mockOnComplete} onLessonComplete={mockOnLessonComplete} />);
    fireEvent.click(screen.getByText('Terms'));
    expect(screen.getByText('Term 1')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Outcomes'));
    expect(screen.getByText('Learning Outcomes')).toBeInTheDocument();
  });
});
