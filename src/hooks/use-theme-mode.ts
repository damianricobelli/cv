import { useCallback, useEffect, useSyncExternalStore } from "react";

export type ThemeMode = "light" | "dark" | "auto";
export type ResolvedTheme = "light" | "dark";

type ThemeState = {
  mode: ThemeMode;
  resolvedTheme: ResolvedTheme;
};

const THEME_STORAGE_KEY = "theme";

/**
 * The page background per theme (`--background` in `styles.css`), which
 * Android Chrome and the installed app paint behind the status bar and the
 * browser toolbar through `<meta name="theme-color">`.
 */
export const THEME_COLORS: Record<ResolvedTheme, string> = {
  light: "#f5f1e8",
  dark: "#0d111c",
};

function isThemeMode(value: string | null): value is ThemeMode {
  return value === "light" || value === "dark" || value === "auto";
}

function getStoredThemeMode(): ThemeMode {
  if (typeof window === "undefined") {
    return "light";
  }

  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemeMode(stored) ? stored : "light";
  } catch {
    return "light";
  }
}

function getDocumentTheme(): ResolvedTheme | null {
  if (typeof document === "undefined") {
    return null;
  }

  if (document.documentElement.classList.contains("dark")) {
    return "dark";
  }

  if (document.documentElement.classList.contains("light")) {
    return "light";
  }

  return null;
}

function resolveThemeMode(mode: ThemeMode): ResolvedTheme {
  if (mode !== "auto") {
    return mode;
  }

  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getThemeState(): ThemeState {
  const mode = getStoredThemeMode();

  return {
    mode,
    resolvedTheme: getDocumentTheme() ?? resolveThemeMode(mode),
  };
}

function applyThemeMode(mode: ThemeMode) {
  if (typeof document === "undefined") {
    return;
  }

  const resolved = resolveThemeMode(mode);
  const root = document.documentElement;

  root.classList.remove("light", "dark");
  root.classList.add(resolved);

  if (mode === "auto") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", mode);
  }

  root.style.colorScheme = resolved;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", THEME_COLORS[resolved]);
}

const themeListeners = new Set<() => void>();

function notifyTheme() {
  for (const notify of themeListeners) notify();
}

let stopObservingTheme: (() => void) | undefined;

function subscribeTheme(listener: () => void) {
  themeListeners.add(listener);
  stopObservingTheme ??= observeTheme();
  return () => {
    themeListeners.delete(listener);
    if (themeListeners.size === 0) {
      stopObservingTheme?.();
      stopObservingTheme = undefined;
    }
  };
}

/**
 * One set of observers for every `useThemeMode`: the `<html>` classes the
 * init script and `applyThemeMode` write, the system scheme (for `auto`), and
 * other tabs changing the stored choice.
 */
function observeTheme() {
  const observer =
    typeof MutationObserver === "undefined"
      ? null
      : new MutationObserver(notifyTheme);
  observer?.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class", "data-theme"],
  });

  const media =
    typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-color-scheme: dark)")
      : null;
  const onSystemThemeChange = () => {
    if (getStoredThemeMode() === "auto") {
      applyThemeMode("auto");
    }
    notifyTheme();
  };
  media?.addEventListener("change", onSystemThemeChange);

  const onStorage = (event: StorageEvent) => {
    if (event.key !== null && event.key !== THEME_STORAGE_KEY) {
      return;
    }
    applyThemeMode(getStoredThemeMode());
    notifyTheme();
  };
  window.addEventListener("storage", onStorage);

  return () => {
    observer?.disconnect();
    media?.removeEventListener("change", onSystemThemeChange);
    window.removeEventListener("storage", onStorage);
  };
}

/** The server can't read the visitor's choice: it renders, and the page
 * hydrates, with the default; the stored theme takes over right after. */
const SERVER_THEME: ThemeState = { mode: "light", resolvedTheme: "light" };
const getServerMode = () => SERVER_THEME.mode;
const getServerResolvedTheme = () => SERVER_THEME.resolvedTheme;
const getMode = () => getThemeState().mode;
const getResolvedTheme = () => getThemeState().resolvedTheme;

/**
 * Subscribes to the document color theme: reads/writes the `"theme"` key in `localStorage`,
 * applies `light`/`dark` classes plus `data-theme` and `colorScheme` on `<html>`, and stays
 * in sync via `MutationObserver`, system `prefers-color-scheme`, and cross-tab `storage` events.
 *
 * Hydration reads the server's default (`light`), never `localStorage`, so the
 * markup matches the server's; anything that must look right from the first
 * paint follows `<html data-theme>` in CSS instead (see `ThemeToggle`).
 */
export function useThemeMode() {
  const mode = useSyncExternalStore(subscribeTheme, getMode, getServerMode);
  const resolvedTheme = useSyncExternalStore(
    subscribeTheme,
    getResolvedTheme,
    getServerResolvedTheme,
  );

  const setThemeMode = useCallback((nextMode: ThemeMode) => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextMode);
    } catch {
      // Blocked storage: the choice lasts for this page only.
    }

    applyThemeMode(nextMode);
    notifyTheme();
  }, []);

  useEffect(() => {
    // The init script already applied the stored theme; this repairs a
    // document it couldn't reach (blocked storage, a script error).
    applyThemeMode(getStoredThemeMode());
  }, []);

  return {
    /** User preference (`light`, `dark`, or `auto` to follow the OS/browser). */
    mode,
    /** Effective palette (`light` or `dark`), including resolution of `auto`
     * from `prefers-color-scheme` when the document does not already encode a theme class. */
    resolvedTheme,
    /** Persists the choice, updates `<html>` (classes / `data-theme` / `colorScheme`),
     * and refreshes hook state so consumers re-render with the new `mode` and `resolvedTheme`. */
    setThemeMode,
    /** `true` when `resolvedTheme` is `"dark"`. */
    isDark: resolvedTheme === "dark",
    /** `true` when `resolvedTheme` is `"light"`. */
    isLight: resolvedTheme === "light",
  };
}
