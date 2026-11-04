import { useSyncExternalStore } from "react";

/**
 * Subscribes to an attribute or class on <html>. Accent and blueprint mode live
 * there (CSS reads them before React hydrates), so <html> is the source of truth.
 */
export function useHtmlState<T>(read: (root: HTMLElement) => T, server: T): T {
  return useSyncExternalStore(
    (notify) => {
      const observer = new MutationObserver(notify);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class", "data-accent", "data-theme"],
      });
      return () => observer.disconnect();
    },
    () => read(document.documentElement),
    () => server,
  );
}
