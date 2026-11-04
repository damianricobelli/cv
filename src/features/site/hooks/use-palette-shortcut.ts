import { useEffect } from "react";

/** ⌘K / Ctrl+K anywhere, and "/" when nothing is focused. */
export function usePaletteShortcut(
  setOpen: (update: (open: boolean) => boolean) => void,
) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((open) => !open);
        return;
      }
      const target = event.target as HTMLElement | null;
      const typing = target?.closest(
        "input, textarea, select, [contenteditable='true']",
      );
      if (event.key === "/" && !typing) {
        event.preventDefault();
        setOpen(() => true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);
}
