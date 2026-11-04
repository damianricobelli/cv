import { CheckIcon } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useId, useState } from "react";
import { useEggs } from "@/features/eggs/components/eggs-provider";
import { EGG_COPY, EGG_IDS } from "@/features/eggs/types";
import { cn } from "@/lib/utils";
import { m } from "@/paraglide/messages";

export function SiteFooter() {
  return (
    <footer className="mt-20 grid gap-10 border-t pt-12 sm:mt-28 pb-[calc(env(safe-area-inset-bottom,0px)+3rem)]">
      <EggTracker />
      <div className="flex flex-wrap items-end justify-between gap-4 text-muted-foreground text-sm">
        <div className="grid gap-1">
          <p className="text-foreground">{m.footer_credit()}</p>
          <p>{m.footer_stack()}</p>
        </div>
        <p className="font-mono text-xs">© {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
}

/** A small stepper of its own: one dot per egg, filled as they're found. */
function EggTracker() {
  const { found } = useEggs();
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const listId = useId();
  const total = EGG_IDS.length;

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <span className="grid gap-0.5">
          <span className="font-medium">{m.eggs_label()}</span>
          <span className="text-muted-foreground text-sm">
            {m.eggs_intro({ total })}
          </span>
        </span>
        <ol
          className="flex gap-1.5"
          aria-label={m.eggs_progress({ found: found.size, total })}
        >
          {EGG_IDS.map((id) => (
            <li key={id} className="relative grid size-3.5 place-items-center">
              <span className="absolute inset-0 rounded-full border-[1.5px] border-input border-dashed" />
              <AnimatePresence>
                {found.has(id) ? (
                  <motion.span
                    initial={
                      reduce
                        ? { opacity: 0 }
                        : { opacity: 0, transform: "scale(0.5)" }
                    }
                    animate={{ opacity: 1, transform: "scale(1)" }}
                    transition={{ type: "spring", duration: 0.4, bounce: 0.35 }}
                    className="absolute inset-0 rounded-full bg-a9"
                  />
                ) : null}
              </AnimatePresence>
            </li>
          ))}
        </ol>
        <span className="font-mono text-muted-foreground text-sm tabular-nums">
          {m.eggs_progress({ found: found.size, total })}
        </span>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => setOpen((value) => !value)}
          className="h-9 rounded-lg border px-3 text-sm transition-[background-color,scale] duration-150 ease-out hover:bg-muted active:scale-[0.97]"
        >
          {open ? m.eggs_hide_hints() : m.eggs_show_hints()}
        </button>
      </div>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.ul
            id={listId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0, transition: { duration: 0.18 } }}
            transition={
              reduce
                ? { duration: 0 }
                : { type: "spring", duration: 0.4, bounce: 0 }
            }
            className="grid gap-x-8 gap-y-4 overflow-hidden text-sm sm:grid-cols-2"
          >
            {EGG_IDS.map((id) => {
              const done = found.has(id);
              return (
                <li
                  key={id}
                  className={cn(
                    "flex items-start gap-2",
                    done ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border",
                      done
                        ? "border-transparent bg-a9 text-white blueprint:text-background"
                        : "border-input",
                    )}
                  >
                    {done ? (
                      <CheckIcon
                        className="size-3"
                        strokeWidth={3}
                        aria-hidden
                      />
                    ) : null}
                  </span>
                  <span className="grid gap-0.5 font-sans">
                    <span className="font-medium text-foreground">
                      {EGG_COPY[id].name()}
                    </span>
                    <span>
                      {done ? EGG_COPY[id].found() : EGG_COPY[id].hint()}
                    </span>
                  </span>
                </li>
              );
            })}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
