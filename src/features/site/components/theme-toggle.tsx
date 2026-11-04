import { MoonIcon, SunIcon } from "lucide-react";
import { useThemeMode } from "@/hooks/use-theme-mode";
import { originOf, revealTransition } from "@/lib/view-transition";
import { m } from "@/paraglide/messages";

/**
 * Light ↔ dark. The icons follow the `.dark` class the init script puts on
 * <html> before first paint, so the right one shows before hydration. The
 * change reveals as a circle from the click (or from the button, by keyboard).
 */
export function ThemeToggle() {
  const { setThemeMode } = useThemeMode();
  return (
    <button
      type="button"
      aria-label={m.theme_toggle()}
      title={m.theme_toggle()}
      onClick={(event) => {
        const next = document.documentElement.classList.contains("dark")
          ? "light"
          : "dark";
        const origin =
          event.detail === 0
            ? originOf(event.currentTarget)
            : { x: event.clientX, y: event.clientY };
        revealTransition(() => setThemeMode(next), origin);
      }}
      className="relative grid size-9 shrink-0 place-items-center sm:size-10 rounded-lg text-muted-foreground transition-[background-color,color,scale] duration-150 ease-out hover:bg-muted hover:text-foreground active:scale-[0.97]"
    >
      <SunIcon
        aria-hidden
        className="size-[18px] transition-[scale,rotate,opacity] duration-300 ease-out dark:rotate-90 dark:scale-50 dark:opacity-0"
      />
      <MoonIcon
        aria-hidden
        className="absolute size-[18px] -rotate-90 scale-50 opacity-0 transition-[scale,rotate,opacity] duration-300 ease-out dark:rotate-0 dark:scale-100 dark:opacity-100"
      />
    </button>
  );
}
