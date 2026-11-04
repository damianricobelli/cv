import { useCallback } from "react";
import { revealTransition } from "@/lib/view-transition";
import { useHtmlState } from "./use-html-attribute";

export const ACCENTS = [
  "indigo",
  "blue",
  "iris",
  "violet",
  "cyan",
  "teal",
] as const;
export type Accent = (typeof ACCENTS)[number];
export const DEFAULT_ACCENT: Accent = "indigo";

function isAccent(value: string | null): value is Accent {
  return ACCENTS.some((accent) => accent === value);
}

const readAccent = (root: HTMLElement): Accent => {
  const value = root.getAttribute("data-accent");
  return isAccent(value) ? value : DEFAULT_ACCENT;
};

/** The Radix scale that paints every accent on the page. */
export function useAccent() {
  const accent = useHtmlState(readAccent, DEFAULT_ACCENT);

  const setAccent = useCallback(
    (next: Accent, origin?: { x: number; y: number }) => {
      revealTransition(() => {
        document.documentElement.setAttribute("data-accent", next);
      }, origin);
      try {
        localStorage.setItem("accent", next);
      } catch {
        // Blocked storage: the scale lasts for this visit.
      }
    },
    [],
  );

  return { accent, setAccent };
}
