import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Dashboard } from './Dashboard';
import { Module } from '../data/courseData';
import { Wallet, Landmark } from 'lucide-react';

const mockModules: Module[] = [
  {
    id: 'module-0', level: 'beginner', title: 'Foundations of Financial Literacy',
    description: 'Master core financial concepts.',
    icon: Wallet, color: 'bg-emerald-600',
    lessons: [
      { id: 'm0-l1', title: 'What Is Money?', type: 'text', content: 'Money is...' },
      { id: 'm0-q1', title: 'Quick Check', type: 'quiz', quiz: [{ question: 'Q?', options: ['A', 'B'], correctAnswer: 0, explanation: 'E' }] },
    ],
    takeaways: ['Money is a social trust technology.'],
    didYouKnow: 'Clay tablets were early ledgers.',
  },
  {
    id: 'module-1', level: 'beginner', title: 'How Banks & Digital Money Work',
    description: 'Understand where money lives.',
    icon: Landmark, color: 'bg-indigo-600',
    lessons: [{ id: 'm1-l1', title: 'Bank Ledgers', type: 'text', content: 'Banks are...' }],
    takeaways: ['Banks are ledgers.'],
    didYouKnow: 'COBOL still runs banks.',
  },
  {
    id: 'module-5', level: 'intermediate', title: 'Stocks & Savings',
    description: 'Learn about stocks.',
    icon: Wallet, color: 'bg-emerald-500',
    lessons: [{ id: 'm5-l1', title: 'Investing', type: 'text', content: 'Invest...' }],
  },
];

describe('Dashboard', () => {
  it('renders the main title', () => {
    render(
      <Dashboard modules={mockModules} completedModules={[]} onSelectModule={() => {}} activeLevel="beginner" onSelectLevel={() => {}}
        xp={0} streak={0} badges={[]} completedLessonsCount={0} />
    );
    expect(screen.getByText('Master Modern Money & Financial Tech')).toBeInTheDocument();
  });

  it('renders module count in subtext', () => {
    render(
      <Dashboard modules={mockModules} completedModules={[]} onSelectModule={() => {}} activeLevel="beginner" onSelectLevel={() => {}}
        xp={0} streak={0} badges={[]} completedLessonsCount={0} />
    );
    expect(screen.getByText(/step-by-step guide/)).toBeInTheDocument();
  });

  it('renders the curriculum roadmap heading', () => {
    render(
      <Dashboard modules={mockModules} completedModules={[]} onSelectModule={() => {}} activeLevel="beginner" onSelectLevel={() => {}}
        xp={0} streak={0} badges={[]} completedLessonsCount={0} />
    );
    expect(screen.getByText('Curriculum Blueprint Roadmap')).toBeInTheDocument();
  });
});
