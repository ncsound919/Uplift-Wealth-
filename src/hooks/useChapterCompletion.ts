import { useState, useEffect } from 'react';
import { getJSON, setJSON, safeRemoveItem, storageKeys } from '../lib/storage';

export function useChapterCompletion() {
  const [completed, setCompleted] = useState<Set<string>>(() => {
    return new Set(getJSON<string[]>(storageKeys.wealthChaptersCompleted, []));
  });

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === storageKeys.wealthChaptersCompleted) {
        try {
          setCompleted(new Set(JSON.parse(e.newValue || '[]')));
        } catch {
          setCompleted(new Set());
        }
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const isComplete = (id: string) => completed.has(id);

  const markComplete = (id: string) => {
    const next = new Set(completed);
    next.add(id);
    setJSON(storageKeys.wealthChaptersCompleted, [...next]);
    setCompleted(next);
  };

  const reset = () => {
    safeRemoveItem(storageKeys.wealthChaptersCompleted);
    setCompleted(new Set());
  };

  return { isComplete, markComplete, reset, completed: [...completed] };
}
