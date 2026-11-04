import { CheckIcon, SearchIcon } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Kbd } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";
import { m } from "@/paraglide/messages";
import { SECTION_IDS, SECTION_LABEL, type SectionId } from "../flow";
import { useFlow } from "./flow-provider";
import { GuardNotice } from "./guard-notice";
import { LanguageSwitch } from "./language-switch";
import { ThemeToggle } from "./theme-toggle";

/** Critically damped: the pill glides to its step without overshooting. */
const PILL_SPRING = { type: "spring", duration: 0.38, bounce: 0 } as const;

export function SiteHeader({ onOpenPalette }: { onOpenPalette: () => void }) {
  const { jump } = useFlow();
  const scrolled = useScrolled();

  return (
    <header
      data-material
      data-scrolled={scrolled || undefined}
      className={cn(
        "page-gutter sticky top-0 z-40 pt-[env(safe-area-inset-top)]",
        "bg-background/75 backdrop-blur-xl backdrop-saturate-150",
        "transition-[box-shadow] duration-300",
        "data-scrolled:shadow-[0_1px_0_var(--border)]",
      )}
    >
      <div className="mx-auto flex h-(--header-h) max-w-6xl items-center gap-3 sm:gap-4">
        {/* biome-ignore lint/a11y/useValidAnchor: a real link without JS; with JS it glides through the flow. */}
        <a
          href="#intro"
          onClick={(event) => {
            event.preventDefault();
            jump("intro");
          }}
          className="hidden shrink-0 font-display font-extrabold text-2xl tracking-[-0.06em] sm:block"
          aria-label="Damián Ricobelli"
        >
          dr<span className="text-a9">.</span>
        </a>

        <StepRail />

        <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:ml-0 sm:gap-1.5">
          <LanguageSwitch />
          <ThemeToggle />
          <button
            type="button"
            onClick={onOpenPalette}
            className="flex h-10 items-center gap-2 rounded-lg border bg-card/70 px-2.5 text-muted-foreground text-sm transition-[background-color,scale] duration-150 ease-out hover:bg-card active:scale-[0.97]"
          >
            <SearchIcon className="size-4" aria-hidden />
            <span className="sr-only sm:not-sr-only">{m.header_menu()}</span>
            <Kbd className="hidden md:inline-flex">⌘K</Kbd>
          </button>
        </div>
      </div>
      <ScrollProgress />
      <GuardNotice />
    </header>
  );
}

function StepRail() {
  const { active, visited, go, guard } = useFlow();
  const reduce = useReducedMotion();
  const activeIndex = SECTION_IDS.indexOf(active);

  return (
    <nav aria-label={m.nav_label()} className="min-w-0 sm:mx-auto">
      <ol className="flex items-center gap-0.5 rounded-full border bg-card/80 p-1 shadow-sm">
        {SECTION_IDS.map((id, index) => {
          const isActive = id === active;
          const done = index < activeIndex && visited.has(id);
          return (
            <li key={id}>
              <motion.button
                type="button"
                onClick={() => go(id)}
                aria-current={isActive ? "step" : undefined}
                aria-label={`${SECTION_LABEL[id]()} · ${m.nav_step_of({ current: index + 1, total: SECTION_IDS.length })}`}
                animate={
                  guard && id === "contact" && !reduce
                    ? { x: [0, -5, 5, -3, 3, 0] }
                    : { x: 0 }
                }
                transition={{ duration: 0.36, ease: "easeOut" }}
                className={cn(
                  "group relative flex h-9 items-center gap-2 rounded-full pr-1.5 pl-1.5 text-sm transition-colors duration-200",
                  isActive
                    ? "pr-3.5 text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                  "sm:pr-3.5",
                )}
              >
                {isActive ? (
                  <motion.span
                    layoutId="rail-pill"
                    transition={reduce ? { duration: 0 } : PILL_SPRING}
                    className="absolute inset-0 rounded-full bg-a3 shadow-[inset_0_0_0_1px_var(--accent-6)]"
                  />
                ) : null}
                <StepDot index={index} active={isActive} done={done} />
                <span
                  className={cn(
                    "relative whitespace-nowrap",
                    isActive ? "inline" : "hidden sm:inline",
                  )}
                >
                  {SECTION_LABEL[id]()}
                </span>
              </motion.button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function StepDot({
  index,
  active,
  done,
}: {
  index: number;
  active: boolean;
  done: boolean;
}) {
  return (
    <span
      className={cn(
        "relative grid size-6 place-items-center rounded-full border font-mono text-[11px] tabular-nums transition-[background-color,border-color,color] duration-200",
        done
          ? "border-transparent bg-ink text-primary-foreground"
          : active
            ? "border-a9 bg-background text-ink"
            : "border-input bg-background",
      )}
      aria-hidden
    >
      <AnimatePresence initial={false} mode="popLayout">
        {done ? (
          <motion.span
            key="check"
            initial={{ opacity: 0, transform: "scale(0.6)" }}
            animate={{ opacity: 1, transform: "scale(1)" }}
            exit={{ opacity: 0, transform: "scale(0.6)" }}
            transition={{ type: "spring", duration: 0.3, bounce: 0.2 }}
          >
            <CheckIcon className="size-3.5" strokeWidth={3} />
          </motion.span>
        ) : (
          <motion.span
            key="number"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {index + 1}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

/** Reading progress: a hairline that follows the scroll with a light spring. */
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const reduce = useReducedMotion();
  const smooth = useSpring(scrollYProgress, {
    stiffness: 260,
    damping: 40,
    restDelta: 0.001,
  });
  return (
    <motion.div
      aria-hidden
      className="absolute inset-x-0 bottom-0 h-px origin-left bg-a9"
      style={{ scaleX: reduce ? scrollYProgress : smooth }}
    />
  );
}

function useScrolled() {
  const [scrolled, setScrolled] = useState(false);
  const last = useRef(false);
  useEffect(() => {
    const onScroll = () => {
      const next = window.scrollY > 8;
      if (next !== last.current) {
        last.current = next;
        setScrolled(next);
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return scrolled;
}

export type { SectionId };
