import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ModuleBuilder } from './ModuleBuilder';

const mockOnSave = vi.fn();
const mockOnCancel = vi.fn();

const sampleModule = {
  id: 'custom-module-test',
  level: 'expert' as const,
  title: 'Prebuilt Module',
  description: 'Prebuilt description',
  icon: 'CreditCard',
  color: 'bg-amber-600',
  lessons: [
    { id: 'pre-l1', title: 'Existing Lesson', type: 'text' as const, content: 'Existing content' },
    { id: 'pre-l2', title: 'Quiz Lesson', type: 'quiz' as const, quiz: [{ question: 'Q1?', options: ['A', 'B', 'C', 'D'], correctAnswer: 0, explanation: 'Exp' }] },
  ],
};

describe('ModuleBuilder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the builder header', () => {
    render(<ModuleBuilder onSave={mockOnSave} onCancel={mockOnCancel} />);
    expect(screen.getByText('Interactive Course Studio')).toBeInTheDocument();
  });

  it('renders module settings section', () => {
    render(<ModuleBuilder onSave={mockOnSave} onCancel={mockOnCancel} />);
    expect(screen.getByText('1. Module Settings')).toBeInTheDocument();
  });

  it('renders lesson tabs', () => {
    render(<ModuleBuilder onSave={mockOnSave} onCancel={mockOnCancel} />);
    expect(screen.getByText('#1')).toBeInTheDocument();
  });

  it('allows entering a title', () => {
    render(<ModuleBuilder onSave={mockOnSave} onCancel={mockOnCancel} />);
    const input = screen.getByPlaceholderText(/e.g. Modern Payments Engineering/i);
    fireEvent.change(input, { target: { value: 'My Module' } });
    expect(screen.getByDisplayValue('My Module')).toBeInTheDocument();
  });

  it('allows entering a description', () => {
    render(<ModuleBuilder onSave={mockOnSave} onCancel={mockOnCancel} />);
    const textarea = screen.getByPlaceholderText(/Briefly describe/i);
    fireEvent.change(textarea, { target: { value: 'My description' } });
    expect(screen.getByDisplayValue('My description')).toBeInTheDocument();
  });

  it('switches difficulty level', () => {
    render(<ModuleBuilder onSave={mockOnSave} onCancel={mockOnCancel} />);
    fireEvent.click(screen.getByText('expert'));
    expect(screen.getByText('expert')).toBeInTheDocument();
  });

  it('adds a new lesson stage', () => {
    render(<ModuleBuilder onSave={mockOnSave} onCancel={mockOnCancel} />);
    fireEvent.click(screen.getByText('Add Stage'));
    expect(screen.getByText('#2')).toBeInTheDocument();
  });

  it('switches lesson type to quiz', () => {
    render(<ModuleBuilder onSave={mockOnSave} onCancel={mockOnCancel} />);
    fireEvent.click(screen.getByText(/Assessment Quiz/i));
    expect(screen.getByText('Interactive Quiz Editor')).toBeInTheDocument();
  });

  it('switches lesson type to game', () => {
    render(<ModuleBuilder onSave={mockOnSave} onCancel={mockOnCancel} />);
    fireEvent.click(screen.getByText(/Live Game/i));
    expect(screen.getByText(/Pick Sandbox Simulator Mode/i)).toBeInTheDocument();
  });

  it('switches lesson type back to text', () => {
    render(<ModuleBuilder onSave={mockOnSave} onCancel={mockOnCancel} />);
    fireEvent.click(screen.getByText(/Assessment Quiz/i));
    expect(screen.getByText('Interactive Quiz Editor')).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Text Content/i));
    expect(screen.getByText(/MD Supported/)).toBeInTheDocument();
  });

  it('calls onSave when form submitted with title', () => {
    render(<ModuleBuilder onSave={mockOnSave} onCancel={mockOnCancel} />);
    fireEvent.change(screen.getByPlaceholderText(/e.g. Modern Payments Engineering/i), { target: { value: 'Test Module' } });
    fireEvent.change(screen.getByPlaceholderText(/Briefly describe/i), { target: { value: 'A test' } });
    fireEvent.click(screen.getByText('Save Course Module'));
    expect(mockOnSave).toHaveBeenCalledOnce();
  });

  it('calls onCancel when exit clicked', () => {
    render(<ModuleBuilder onSave={mockOnSave} onCancel={mockOnCancel} />);
    fireEvent.click(screen.getByText('Exit Module Builder'));
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('does not call onSave when title is empty', () => {
    render(<ModuleBuilder onSave={mockOnSave} onCancel={mockOnCancel} />);
    fireEvent.click(screen.getByText('Save Course Module'));
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('calls onCancel when Discard Changes clicked', () => {
    render(<ModuleBuilder onSave={mockOnSave} onCancel={mockOnCancel} />);
    fireEvent.click(screen.getByText('Discard Changes'));
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('removes a lesson when more than one exists', () => {
    render(<ModuleBuilder onSave={mockOnSave} onCancel={mockOnCancel} />);
    fireEvent.click(screen.getByText('Add Stage'));
    expect(screen.getByText('#2')).toBeInTheDocument();
    const trashSvg = document.querySelector('.lucide-trash2');
    if (trashSvg) {
      const clickTarget = trashSvg.parentElement || trashSvg;
      fireEvent.click(clickTarget);
    }
    const stageBtns = screen.getAllByRole('button').filter(b => {
      const spans = b.querySelectorAll('span');
      return Array.from(spans).some(s => s.textContent?.startsWith('#'));
    });
    expect(stageBtns.length).toBe(1);
  });

  it('selects a color from the palette', () => {
    render(<ModuleBuilder onSave={mockOnSave} onCancel={mockOnCancel} />);
    fireEvent.click(screen.getByTitle('Emerald'));
    const emeraldBtn = screen.getByTitle('Emerald');
    expect(emeraldBtn.className).toContain('border-slate-800');
  });

  it('selects an icon from the picker', () => {
    render(<ModuleBuilder onSave={mockOnSave} onCancel={mockOnCancel} />);
    fireEvent.click(screen.getByTitle('CreditCard'));
    const creditBtn = screen.getByTitle('CreditCard');
    expect(creditBtn.className).toContain('border-blue-600');
  });

  it('updates preview card with title', () => {
    render(<ModuleBuilder onSave={mockOnSave} onCancel={mockOnCancel} />);
    const input = screen.getByPlaceholderText(/e.g. Modern Payments Engineering/i);
    fireEvent.change(input, { target: { value: 'Custom Title' } });
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });

  it('shows untitled curriculum in preview when no title', () => {
    render(<ModuleBuilder onSave={mockOnSave} onCancel={mockOnCancel} />);
    expect(screen.getByText('Untitled Curriculum')).toBeInTheDocument();
  });

  it('shows default summary in preview when no description', () => {
    render(<ModuleBuilder onSave={mockOnSave} onCancel={mockOnCancel} />);
    expect(screen.getByText(/No summary added yet/)).toBeInTheDocument();
  });

  it('shows level track in preview', () => {
    render(<ModuleBuilder onSave={mockOnSave} onCancel={mockOnCancel} />);
    expect(screen.getByText(/beginner track/)).toBeInTheDocument();
  });

  it('shows stages count in preview', () => {
    render(<ModuleBuilder onSave={mockOnSave} onCancel={mockOnCancel} />);
    expect(screen.getByText(/1 stages/)).toBeInTheDocument();
  });

  it('adds a quiz question in quiz mode', () => {
    render(<ModuleBuilder onSave={mockOnSave} onCancel={mockOnCancel} />);
    fireEvent.click(screen.getByText(/Assessment Quiz/i));
    fireEvent.click(screen.getByText('Add Question'));
    expect(screen.getByDisplayValue('New Question?')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Option A')).toBeInTheDocument();
  });

  it('creates first question from empty quiz state', () => {
    render(<ModuleBuilder onSave={mockOnSave} onCancel={mockOnCancel} />);
    fireEvent.click(screen.getByText(/Assessment Quiz/i));
    expect(screen.getByText(/No Quiz Questions Added Yet/)).toBeInTheDocument();
    fireEvent.click(screen.getByText('Create First Question'));
    expect(screen.getByDisplayValue('New Question?')).toBeInTheDocument();
  });

  it('removes a quiz question', () => {
    render(<ModuleBuilder onSave={mockOnSave} onCancel={mockOnCancel} />);
    fireEvent.click(screen.getByText(/Assessment Quiz/i));
    fireEvent.click(screen.getByText('Add Question'));
    expect(screen.getAllByDisplayValue('New Question?')).toHaveLength(1);
    const trashButtons = screen.getAllByRole('button');
    const quizTrash = trashButtons.find(b =>
      b.className.includes('text-slate-400 hover:text-rose-500')
    );
    if (quizTrash) fireEvent.click(quizTrash);
    expect(screen.queryByDisplayValue('New Question?')).not.toBeInTheDocument();
  });

  it('edits quiz question text', () => {
    render(<ModuleBuilder onSave={mockOnSave} onCancel={mockOnCancel} />);
    fireEvent.click(screen.getByText(/Assessment Quiz/i));
    fireEvent.click(screen.getByText('Add Question'));
    const qInput = screen.getByDisplayValue('New Question?');
    fireEvent.change(qInput, { target: { value: 'What is 2+2?' } });
    expect(screen.getByDisplayValue('What is 2+2?')).toBeInTheDocument();
  });

  it('selects correct answer for quiz question', () => {
    render(<ModuleBuilder onSave={mockOnSave} onCancel={mockOnCancel} />);
    fireEvent.click(screen.getByText(/Assessment Quiz/i));
    fireEvent.click(screen.getByText('Add Question'));
    fireEvent.click(screen.getByRole('button', { name: 'Option 2' }));
    const option2Btn = screen.getByRole('button', { name: 'Option 2' });
    expect(option2Btn.className).toContain('bg-emerald-600');
  });

  it('selects a game type', () => {
    render(<ModuleBuilder onSave={mockOnSave} onCancel={mockOnCancel} />);
    fireEvent.click(screen.getByText(/Live Game/i));
    fireEvent.click(screen.getByText(/Stock Sim Terminal Game/));
    const tradingBtn = screen.getByText(/Stock Sim Terminal Game/);
    expect(tradingBtn.className).toContain('bg-blue-50');
  });

  it('loads initialModule data', () => {
    render(<ModuleBuilder onSave={mockOnSave} onCancel={mockOnCancel} initialModule={sampleModule as any} />);
    expect(screen.getByDisplayValue('Prebuilt Module')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Prebuilt description')).toBeInTheDocument();
    expect(screen.getByText('expert')).toBeInTheDocument();
    expect(screen.getByText('Existing Lesson')).toBeInTheDocument();
    expect(screen.getByText('#2')).toBeInTheDocument();
  });

  it('edits lesson content in text mode', () => {
    render(<ModuleBuilder onSave={mockOnSave} onCancel={mockOnCancel} />);
    const textarea = screen.getByPlaceholderText(/Write comprehensive/);
    fireEvent.change(textarea, { target: { value: 'New content' } });
    expect(screen.getByDisplayValue('New content')).toBeInTheDocument();
  });

  it('switches between lesson tabs', () => {
    render(<ModuleBuilder onSave={mockOnSave} onCancel={mockOnCancel} />);
    fireEvent.click(screen.getByText('Add Stage'));
    fireEvent.click(screen.getByText('#2'));
    const stageLabel = screen.getByText(/Editing Curriculum Stage #2/);
    expect(stageLabel).toBeInTheDocument();
  });

  it('shows module settings section labels', () => {
    render(<ModuleBuilder onSave={mockOnSave} onCancel={mockOnCancel} />);
    expect(screen.getByText('Module Title')).toBeInTheDocument();
    expect(screen.getByText('Short Summary')).toBeInTheDocument();
    expect(screen.getByText('Track Difficulty')).toBeInTheDocument();
    expect(screen.getByText('Accent Palette')).toBeInTheDocument();
    expect(screen.getByText('Icon Symbol')).toBeInTheDocument();
  });

  it('renders all available colors', () => {
    render(<ModuleBuilder onSave={mockOnSave} onCancel={mockOnCancel} />);
    expect(screen.getByTitle('Indigo')).toBeInTheDocument();
    expect(screen.getByTitle('Lux Onyx')).toBeInTheDocument();
    expect(screen.getByTitle('Deep Royal')).toBeInTheDocument();
  });

  it('edits quiz option text', () => {
    render(<ModuleBuilder onSave={mockOnSave} onCancel={mockOnCancel} />);
    fireEvent.click(screen.getByText(/Assessment Quiz/i));
    fireEvent.click(screen.getByText('Add Question'));
    const optInput = screen.getByDisplayValue('Option A');
    fireEvent.change(optInput, { target: { value: 'Correct Answer' } });
    expect(screen.getByDisplayValue('Correct Answer')).toBeInTheDocument();
  });

  it('edits quiz explanation', () => {
    render(<ModuleBuilder onSave={mockOnSave} onCancel={mockOnCancel} />);
    fireEvent.click(screen.getByText(/Assessment Quiz/i));
    fireEvent.click(screen.getByText('Add Question'));
    const explanation = screen.getByPlaceholderText(/Why is this option correct/);
    fireEvent.change(explanation, { target: { value: 'Because it is right' } });
    expect(screen.getByDisplayValue('Because it is right')).toBeInTheDocument();
  });

  it('does not save when form submitted directly with empty title', () => {
    render(<ModuleBuilder onSave={mockOnSave} onCancel={mockOnCancel} />);
    const form = document.querySelector('form');
    expect(form).toBeTruthy();
    if (form) fireEvent.submit(form);
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('updates the stage title field', () => {
    render(<ModuleBuilder onSave={mockOnSave} onCancel={mockOnCancel} />);
    const stageTitle = screen.getByPlaceholderText('e.g. Cleared Settlement and Timelines');
    fireEvent.change(stageTitle, { target: { value: 'Settlement Fundamentals' } });
    expect(screen.getByDisplayValue('Settlement Fundamentals')).toBeInTheDocument();
  });
});
