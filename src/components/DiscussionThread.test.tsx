import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DiscussionThread } from './DiscussionThread';

const mocks = vi.hoisted(() => ({
  listThreads: vi.fn(),
  getThread: vi.fn(),
  createThread: vi.fn(),
  addComment: vi.fn(),
  upvoteThread: vi.fn(),
  upvoteComment: vi.fn(),
  report: vi.fn(),
  deleteThread: vi.fn(),
  deleteComment: vi.fn(),
}));

vi.mock('../lib/apiClient', () => ({
  apiClient: mocks,
}));

function thread(overrides: Partial<Parameters<typeof mocks.listThreads>[0] & { id: string; title: string; body: string; authorName: string; commentCount: number; upvotes: number; userId: string; createdAt: string }> = {}) {
  return {
    id: 'thr-1', moduleId: 'module-1', lessonId: 'm1-l1', userId: 'u1',
    title: 'How do rails settle?', body: 'Curious about settlement.', authorName: 'Nia',
    commentCount: 0, upvotes: 1, createdAt: '2024-01-01T00:00:00.000Z', ...overrides,
  };
}

function comment(overrides: Partial<{ id: string; threadId: string; userId: string; body: string; authorName: string; upvotes: number; createdAt: string }> = {}) {
  return {
    id: 'cmt-1', threadId: 'thr-1', userId: 'u2', body: 'Great question!',
    authorName: 'Kofi', upvotes: 0, createdAt: '2024-01-02T00:00:00.000Z', ...overrides,
  };
}

describe('DiscussionThread', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.listThreads.mockResolvedValue({ threads: [] });
  });

  it('shows the empty state', async () => {
    render(<DiscussionThread moduleId="module-1" currentUserId="u1" />);
    expect(await screen.findByText(/No discussions yet/i)).toBeInTheDocument();
  });

  it('lists threads', async () => {
    mocks.listThreads.mockResolvedValue({ threads: [thread()] });
    render(<DiscussionThread moduleId="module-1" currentUserId="u1" />);
    expect(await screen.findByText('How do rails settle?')).toBeInTheDocument();
    expect(screen.getByText(/Nia/)).toBeInTheDocument();
  });

  it('posts a new thread', async () => {
    mocks.createThread.mockResolvedValue({ success: true, thread: thread({ id: 'thr-new' }) });
    render(<DiscussionThread moduleId="module-1" currentUserId="u1" />);
    fireEvent.click(screen.getByRole('button', { name: /\+ New Thread/i }));
    fireEvent.change(screen.getByPlaceholderText(/Start a discussion/i), { target: { value: 'A new question' } });
    fireEvent.change(screen.getByPlaceholderText(/Share what you learned/i), { target: { value: 'Details here' } });
    fireEvent.click(screen.getByRole('button', { name: /post/i }));
    await waitFor(() => {
      expect(mocks.createThread).toHaveBeenCalledWith(expect.objectContaining({ moduleId: 'module-1', title: 'A new question' }));
    });
  });

  it('expands a thread and replies', async () => {
    mocks.listThreads.mockResolvedValue({ threads: [thread()] });
    mocks.getThread.mockResolvedValue({ thread: thread(), comments: [comment()] });
    mocks.addComment.mockResolvedValue({ success: true, comment: comment({ id: 'cmt-2', body: 'Thanks!' }) });
    render(<DiscussionThread moduleId="module-1" currentUserId="u1" />);
    const item = await screen.findByText('How do rails settle?');
    fireEvent.click(item);
    expect(await screen.findByText('Great question!')).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText(/Write a reply/i), { target: { value: 'Thanks!' } });
    fireEvent.click(screen.getByRole('button', { name: /reply/i }));
    await waitFor(() => expect(mocks.addComment).toHaveBeenCalledWith('thr-1', 'Thanks!'));
  });

  it('upvotes a thread', async () => {
    mocks.listThreads.mockResolvedValue({ threads: [thread()] });
    mocks.upvoteThread.mockResolvedValue({ success: true, upvoted: true, upvotes: 2 });
    render(<DiscussionThread moduleId="module-1" currentUserId="u1" />);
    await screen.findByText('How do rails settle?');
    fireEvent.click(screen.getByRole('button', { name: /upvote thread/i }));
    await waitFor(() => expect(mocks.upvoteThread).toHaveBeenCalledWith('thr-1'));
  });

  it('reports a thread', async () => {
    mocks.listThreads.mockResolvedValue({ threads: [thread()] });
    mocks.report.mockResolvedValue({ success: true, report: {} });
    render(<DiscussionThread moduleId="module-1" currentUserId="u1" />);
    await screen.findByText('How do rails settle?');
    fireEvent.click(screen.getByRole('button', { name: /report thread/i }));
    await waitFor(() => expect(mocks.report).toHaveBeenCalledWith('thread', 'thr-1'));
  });

  it('prompts for auth when posting without a user', () => {
    const onRequireAuth = vi.fn();
    render(<DiscussionThread moduleId="module-1" onRequireAuth={onRequireAuth} />);
    fireEvent.click(screen.getByRole('button', { name: /\+ New Thread/i }));
    expect(onRequireAuth).toHaveBeenCalled();
  });
});
