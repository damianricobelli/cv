import { useCallback } from "react";
import { revealTransition } from "@/lib/view-transition";
import { useHtmlState } from "./use-html-attribute";

const readBlueprint = (root: HTMLElement) =>
  root.classList.contains("blueprint");

/** Easter egg: the page redrawn as a technical drawing. Never persisted. */
export function useBlueprint() {
  const active = useHtmlState(readBlueprint, false);
  const setBlueprint = useCallback(
    (next: boolean, origin?: { x: number; y: number }) => {
      revealTransition(() => {
        document.documentElement.classList.toggle("blueprint", next);
      }, origin);
    },
    [],
  );
  return { active, setBlueprint };
}
