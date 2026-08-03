const preloadedChunks = new Set<string>();

export function preloadComponent(importFn: () => Promise<unknown>): void {
  if (preloadedChunks.has(importFn.toString())) return;
  preloadedChunks.add(importFn.toString());
  importFn().catch(() => {
    preloadedChunks.delete(importFn.toString());
  });
}

export function usePreloadOnHover<T>(importFn: () => Promise<{ default: T }>) {
  return {
    onMouseEnter: () => preloadComponent(importFn),
    onFocus: () => preloadComponent(importFn),
  };
}
