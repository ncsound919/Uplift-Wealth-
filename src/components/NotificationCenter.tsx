import { useCallback, useEffect, useState } from 'react';
import { Bell, BellRing, CheckCheck } from 'lucide-react';
import { apiClient, type NotificationView } from '../lib/apiClient';
import { cn } from '../lib/utils';

export function NotificationCenter({ currentUserId }: { currentUserId?: string }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationView[]>([]);
  const [unread, setUnread] = useState(0);
  const [error, setError] = useState(false);

  const refresh = useCallback(() => {
    if (!currentUserId) return;
    apiClient.getNotifications()
      .then((res) => { setItems(res.notifications); setUnread(res.unreadCount); setError(false); })
      .catch(() => setError(true));
  }, [currentUserId]);

  useEffect(() => { refresh(); }, [refresh]);

  const markAll = async () => {
    await apiClient.markAllNotificationsRead().catch(() => {});
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
  };

  const markOne = async (id: string) => {
    await apiClient.markNotificationRead(id).catch(() => {});
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnread((u) => Math.max(0, u - 1));
  };

  if (!currentUserId) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => { setOpen((v) => !v); if (!open) refresh(); }}
        aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ''}`}
        className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
      >
        {unread > 0 ? <BellRing className="w-5 h-5 text-blue-500" /> : <Bell className="w-5 h-5" />}
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 z-50 w-80 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500">Notifications</span>
              {items.length > 0 && (
                <button onClick={markAll} className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                  <CheckCheck className="w-3 h-3" /> Mark all read
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {error && <div className="p-4 text-xs text-slate-400">Could not load notifications.</div>}
              {!error && items.length === 0 && (
                <div className="p-4 text-xs text-slate-400 italic">No notifications yet.</div>
              )}
              {items.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => markOne(n.id)}
                  className={cn('w-full text-left px-4 py-3 border-b border-slate-50 dark:border-slate-900 transition-colors cursor-pointer',
                    n.read ? 'opacity-60' : 'bg-blue-50/40 dark:bg-blue-950/20')}
                >
                  <span className="block text-xs font-bold text-slate-900 dark:text-white">{n.title}</span>
                  <span className="block text-[11px] text-slate-500 mt-0.5 leading-relaxed">{n.message}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
