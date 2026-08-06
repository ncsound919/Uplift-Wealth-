import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NotificationCenter } from './NotificationCenter';

const mocks = vi.hoisted(() => ({
  getNotifications: vi.fn(),
  markAllNotificationsRead: vi.fn(),
  markNotificationRead: vi.fn(),
}));

vi.mock('../lib/apiClient', () => ({ apiClient: mocks }));

const notification = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id: 'not-1', userId: 'u1', type: 'reply', title: 'Nia replied to your discussion',
  message: '"How do rails settle?"', read: false, createdAt: '2024-01-01T00:00:00.000Z', ...overrides,
});

describe('NotificationCenter', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns null for guests', () => {
    const { container } = render(<NotificationCenter />);
    expect(container.innerHTML).toBe('');
  });

  it('shows an unread badge and lists notifications', async () => {
    mocks.getNotifications.mockResolvedValue({ notifications: [notification(), notification({ id: 'not-2', read: true })], unreadCount: 1 });
    render(<NotificationCenter currentUserId="u1" />);
    await waitFor(() => expect(mocks.getNotifications).toHaveBeenCalled());
    fireEvent.click(await screen.findByRole('button', { name: /notifications \(1 unread\)/i }));
    expect((await screen.findAllByText('Nia replied to your discussion')).length).toBeGreaterThan(0);
  });

  it('marks a notification read on click', async () => {
    mocks.getNotifications.mockResolvedValue({ notifications: [notification()], unreadCount: 1 });
    mocks.markNotificationRead.mockResolvedValue({ success: true, notification: notification({ read: true }) });
    render(<NotificationCenter currentUserId="u1" />);
    fireEvent.click(await screen.findByRole('button', { name: /notifications \(1 unread\)/i }));
    const item = await screen.findByText('Nia replied to your discussion');
    fireEvent.click(item);
    await waitFor(() => expect(mocks.markNotificationRead).toHaveBeenCalledWith('not-1'));
  });

  it('marks all read', async () => {
    mocks.getNotifications.mockResolvedValue({ notifications: [notification()], unreadCount: 1 });
    mocks.markAllNotificationsRead.mockResolvedValue({ success: true, changed: 1 });
    render(<NotificationCenter currentUserId="u1" />);
    fireEvent.click(await screen.findByRole('button', { name: /notifications \(1 unread\)/i }));
    fireEvent.click(await screen.findByRole('button', { name: /mark all read/i }));
    await waitFor(() => expect(mocks.markAllNotificationsRead).toHaveBeenCalled());
  });
});
