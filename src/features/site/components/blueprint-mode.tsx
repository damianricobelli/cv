import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import { useEggs } from "@/features/eggs/components/eggs-provider";
import { useBlueprint } from "@/hooks/use-blueprint";
import { m } from "@/paraglide/messages";

/** Typing this word anywhere toggles blueprint mode (the Konami code still works too). */
const WORD = "blueprint";
const KONAMI = [
  "arrowup",
  "arrowup",
  "arrowdown",
  "arrowdown",
  "arrowleft",
  "arrowright",
  "arrowleft",
  "arrowright",
  "b",
  "a",
];

/** Listens for the Konami code and shows a way out while blueprint mode is on. */
export function BlueprintMode() {
  const { active, setBlueprint } = useBlueprint();
  const { find } = useEggs();

  useEffect(() => {
    let sequence: string[] = [];
    let typed = "";
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']"))
        return;
      const key = event.key.toLowerCase();
      sequence = [...sequence, key].slice(-KONAMI.length);
      typed = key.length === 1 ? (typed + key).slice(-WORD.length) : typed;
      const konami = KONAMI.every((value, index) => sequence[index] === value);
      if (konami || typed === WORD) {
        typed = "";
        sequence = [];
        setBlueprint(!document.documentElement.classList.contains("blueprint"));
        find("blueprint");
      }
      if (
        event.key === "Escape" &&
        document.documentElement.classList.contains("blueprint")
      ) {
        setBlueprint(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setBlueprint, find]);

  return (
    <AnimatePresence>
      {active ? (
        <motion.div
          initial={{ opacity: 0, transform: "translateY(16px)" }}
          animate={{ opacity: 1, transform: "translateY(0px)" }}
          exit={{
            opacity: 0,
            transform: "translateY(16px)",
            transition: { duration: 0.16 },
          }}
          transition={{ type: "spring", duration: 0.4, bounce: 0 }}
          className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+1rem)] left-1/2 z-40 -translate-x-1/2"
        >
          <div className="flex items-center gap-3 rounded-full border border-white/40 bg-background/80 py-1.5 pr-1.5 pl-4 font-mono text-xs shadow-lg backdrop-blur-xl">
            <span>{m.blueprint_label()}</span>
            <span className="hidden opacity-70 sm:inline">
              {m.blueprint_hint()}
            </span>
            <button
              type="button"
              onClick={(event) =>
                setBlueprint(false, { x: event.clientX, y: event.clientY })
              }
              className="h-8 rounded-full bg-foreground px-3 font-medium text-background transition-[scale] duration-150 ease-out active:scale-[0.96]"
            >
              {m.blueprint_exit()}
            </button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
