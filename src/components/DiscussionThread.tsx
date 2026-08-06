import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { MessageSquare, ThumbsUp, Flag, Trash2, Send, Loader2, ChevronDown, ChevronRight } from 'lucide-react';
import { apiClient, type ThreadView, type CommentView } from '../lib/apiClient';
import { cn } from '../lib/utils';

interface DiscussionThreadProps {
  moduleId?: string;
  lessonId?: string;
  currentUserId?: string;
  onRequireAuth?: () => void;
}

export function DiscussionThread({ moduleId, lessonId, currentUserId, onRequireAuth }: DiscussionThreadProps) {
  const [threads, setThreads] = useState<ThreadView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [posting, setPosting] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, CommentView[] | undefined>>({});
  const [expandedLoading, setExpandedLoading] = useState<Record<string, boolean>>({});

  const refresh = useCallback(() => {
    setLoading(true);
    apiClient.listThreads({ moduleId, lessonId })
      .then((res) => setThreads(res.threads))
      .catch(() => setError('Could not load discussions.'))
      .finally(() => setLoading(false));
  }, [moduleId, lessonId]);

  useEffect(() => { refresh(); }, [refresh]);

  const requireAuth = (): boolean => {
    if (currentUserId) return true;
    onRequireAuth?.();
    return false;
  };

  const submitThread = async (e: FormEvent) => {
    e.preventDefault();
    if (!requireAuth()) return;
    setPosting(true);
    setError(null);
    try {
      const res = await apiClient.createThread({ moduleId, lessonId, title, body });
      setThreads((prev) => [res.thread, ...prev]);
      setTitle('');
      setBody('');
      setShowNew(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not post. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  const toggleExpand = async (threadId: string) => {
    if (expanded[threadId]) {
      const next = { ...expanded };
      delete next[threadId];
      setExpanded(next);
      return;
    }
    setExpandedLoading((prev) => ({ ...prev, [threadId]: true }));
    try {
      const res = await apiClient.getThread(threadId);
      setExpanded((prev) => ({ ...prev, [threadId]: res.comments }));
    } catch {
      setError('Could not load replies.');
    } finally {
      setExpandedLoading((prev) => ({ ...prev, [threadId]: false }));
    }
  };

  const reply = async (threadId: string, text: string) => {
    if (!requireAuth() || !text.trim()) return;
    try {
      const res = await apiClient.addComment(threadId, text.trim());
      setExpanded((prev) => ({ ...prev, [threadId]: [...(prev[threadId] || []), res.comment] }));
      setThreads((prev) => prev.map((t) => (t.id === threadId ? { ...t, commentCount: t.commentCount + 1 } : t)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reply.');
    }
  };

  const upvoteThread = async (threadId: string) => {
    if (!requireAuth()) return;
    try {
      const res = await apiClient.upvoteThread(threadId);
      setThreads((prev) => prev.map((t) => (t.id === threadId ? { ...t, upvotes: res.upvotes } : t)));
    } catch { /* ignore */ }
  };

  const upvoteComment = async (threadId: string, commentId: string) => {
    if (!requireAuth()) return;
    try {
      const res = await apiClient.upvoteComment(commentId);
      setExpanded((prev) => ({
        ...prev,
        [threadId]: (prev[threadId] || []).map((c) => (c.id === commentId ? { ...c, upvotes: res.upvotes } : c)),
      }));
    } catch { /* ignore */ }
  };

  const report = async (type: 'thread' | 'comment', id: string) => {
    if (!requireAuth()) return;
    try {
      await apiClient.report(type, id);
      setError('Reported. Thank you for keeping the community safe.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Report failed.');
    }
  };

  const removeThread = async (threadId: string) => {
    try {
      await apiClient.deleteThread(threadId);
      setThreads((prev) => prev.filter((t) => t.id !== threadId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed.');
    }
  };

  const removeComment = async (threadId: string, commentId: string) => {
    try {
      await apiClient.deleteComment(commentId);
      setExpanded((prev) => ({ ...prev, [threadId]: (prev[threadId] || []).filter((c) => c.id !== commentId) }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed.');
    }
  };

  const canModerateThread = (t: ThreadView) => currentUserId && (currentUserId === t.userId);
  const canModerateComment = (c: CommentView) => currentUserId && (currentUserId === c.userId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-blue-500" />
          <span className="text-xs font-black uppercase tracking-wider text-slate-500">Discussions</span>
        </div>
        <button
          type="button"
          onClick={() => { if (requireAuth()) setShowNew((v) => !v); }}
          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer transition-colors"
        >
          {showNew ? 'Cancel' : '+ New Thread'}
        </button>
      </div>

      {error && (
        <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-400">
          {error}
        </div>
      )}

      {showNew && (
        <form onSubmit={submitThread} className="space-y-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Start a discussion…"
            maxLength={120}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Share what you learned or what you're wondering…"
            maxLength={4000}
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={posting || !title.trim() || !body.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {posting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Post
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-xs text-slate-400 animate-pulse py-4">Loading discussions…</div>
      ) : threads.length === 0 ? (
        <div className="text-xs text-slate-400 italic py-4">No discussions yet — start the conversation.</div>
      ) : (
        <div className="space-y-2">
          {threads.map((t) => (
            <div key={t.id} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-3">
              <button type="button" onClick={() => toggleExpand(t.id)} className="w-full text-left">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{t.title}</span>
                    <span className="block text-[11px] text-slate-400 mt-0.5">
                      {t.authorName} · {new Date(t.createdAt).toLocaleDateString()} · {t.commentCount} replies
                    </span>
                  </div>
                  <span className="text-slate-300">{expanded[t.id] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}</span>
                </div>
              </button>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed whitespace-pre-wrap">{t.body}</p>
              <div className="flex items-center gap-3 mt-2">
                <button type="button" onClick={() => upvoteThread(t.id)} aria-label={`Upvote thread (${t.upvotes})`} className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-blue-500 cursor-pointer">
                  <ThumbsUp className="w-3 h-3" /> {t.upvotes}
                </button>
                <button type="button" onClick={() => report('thread', t.id)} aria-label="Report thread" className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-amber-500 cursor-pointer">
                  <Flag className="w-3 h-3" /> Report
                </button>
                {canModerateThread(t) && (
                  <button type="button" onClick={() => removeThread(t.id)} aria-label="Delete thread" className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-500 cursor-pointer">
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                )}
              </div>

              {expandedLoading[t.id] && <div className="text-[11px] text-slate-400 animate-pulse mt-2">Loading replies…</div>}
              {expanded[t.id] && (
                <div className="mt-3 space-y-2 border-t border-slate-100 dark:border-slate-800 pt-2">
                  {expanded[t.id]!.map((c) => (
                    <div key={c.id} className="rounded-lg bg-slate-50 dark:bg-slate-900 p-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-500">{c.authorName}</span>
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => upvoteComment(t.id, c.id)} aria-label={`Upvote comment (${c.upvotes})`} className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-blue-500 cursor-pointer">
                            <ThumbsUp className="w-3 h-3" /> {c.upvotes}
                          </button>
                          <button type="button" onClick={() => report('comment', c.id)} aria-label="Report comment" className="text-slate-400 hover:text-amber-500 cursor-pointer">
                            <Flag className="w-3 h-3" />
                          </button>
                          {canModerateComment(c) && (
                            <button type="button" onClick={() => removeComment(t.id, c.id)} aria-label="Delete comment" className="text-slate-400 hover:text-rose-500 cursor-pointer">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 whitespace-pre-wrap">{c.body}</p>
                    </div>
                  ))}
                  <ReplyBox onReply={(text) => reply(t.id, text)} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ReplyBox({ onReply }: { onReply: (text: string) => void }) {
  const [text, setText] = useState('');
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onReply(text.trim());
    setText('');
  };
  return (
    <form onSubmit={submit} className="flex gap-2">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write a reply…"
        maxLength={2000}
        className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
      />
      <button type="submit" disabled={!text.trim()} className="px-3 py-1.5 rounded-lg bg-slate-800 dark:bg-white text-white dark:text-slate-950 text-[11px] font-bold cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
        Reply
      </button>
    </form>
  );
}
