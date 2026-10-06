import { useEffect, useState } from 'react';

type Mode = 'light' | 'dark';

/**
 * Light/Dark theme control. Mirrors Wealth's existing `is_dark_mode` preference
 * (used by App.tsx) and also writes the shared `overlay-theme` key.
 */
export function ThemeToggle({ className = '' }: { className?: string }) {
  const [mode, setMode] = useState<Mode>('dark');

  useEffect(() => {
    const stored = localStorage.getItem('is_dark_mode');
    setMode(stored === 'false' ? 'light' : 'dark');
  }, []);

  const apply = (m: Mode) => {
    setMode(m);
    try {
      localStorage.setItem('is_dark_mode', m === 'dark' ? 'true' : 'false');
      localStorage.setItem('overlay-theme', m);
    } catch {
      /* storage blocked */
    }
    document.documentElement.classList.toggle('dark', m === 'dark');
  };

  return (
    <div
      role="group"
      aria-label="Color theme"
      className={`relative inline-flex items-center rounded-full border border-line bg-ink/5 p-0.5 text-[11px] font-semibold ${className}`}
    >
      <span
        aria-hidden
        className={`absolute bottom-0.5 top-0.5 w-[calc(50%-2px)] rounded-full bg-accent transition-transform duration-300 ease-out ${mode === 'dark' ? 'translate-x-full' : 'translate-x-0'}`}
      />
      <button
        type="button"
        onClick={() => apply('light')}
        aria-pressed={mode === 'light'}
        className={`relative z-10 rounded-full px-3 py-1 transition-colors ${mode === 'light' ? 'text-on-accent' : 'text-muted hover:text-ink'}`}
      >
        Light
      </button>
      <button
        type="button"
        onClick={() => apply('dark')}
        aria-pressed={mode === 'dark'}
        className={`relative z-10 rounded-full px-3 py-1 transition-colors ${mode === 'dark' ? 'text-on-accent' : 'text-muted hover:text-ink'}`}
      >
        Dark
      </button>
    </div>
  );
}
