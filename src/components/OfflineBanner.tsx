import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';
import { apiClient } from '../lib/apiClient';

/** Shows a subtle banner while offline and flushes queued stats on reconnect. */
export function OfflineBanner() {
  const [offline, setOffline] = useState<boolean>(() => typeof navigator !== 'undefined' ? !navigator.onLine : false);

  useEffect(() => {
    const goOnline = () => {
      setOffline(false);
      apiClient.flushPendingStats().catch(() => {});
    };
    const goOffline = () => setOffline(true);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-bold shadow-lg">
      <WifiOff className="w-3.5 h-3.5" />
      You're offline — progress will sync when you reconnect.
    </div>
  );
}
