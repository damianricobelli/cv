import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { m } from "@/paraglide/messages";
import { useFlow } from "./flow-provider";

/**
 * Shown when the stepper's guard refuses a jump to contact. It prints the
 * real NavigationResult that Stepperize returned.
 */
export function GuardNotice() {
  const { guard, dismissGuard, go, jump } = useFlow();
  const panel = useRef<HTMLDivElement>(null);
  const primary = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!guard) return;
    primary.current?.focus({ preventScroll: true });
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismissGuard();
    };
    const onPointer = (event: PointerEvent) => {
      if (!panel.current?.contains(event.target as Node)) dismissGuard();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [guard, dismissGuard]);

  return (
    <AnimatePresence>
      {guard ? (
        <motion.div
          ref={panel}
          role="alertdialog"
          aria-labelledby="guard-title"
          aria-describedby="guard-body"
          initial={{ opacity: 0, transform: "translateY(-6px) scale(0.97)" }}
          animate={{ opacity: 1, transform: "translateY(0px) scale(1)" }}
          exit={{
            opacity: 0,
            transform: "translateY(-4px) scale(0.98)",
            transition: { duration: 0.12, ease: [0.23, 1, 0.32, 1] },
          }}
          transition={{ type: "spring", duration: 0.32, bounce: 0 }}
          className="absolute top-[calc(100%+0.5rem)] left-1/2 z-50 w-[min(26rem,calc(100vw-2rem))] origin-top -translate-x-1/2 rounded-2xl border bg-popover p-4 text-popover-foreground shadow-lg"
        >
          <p
            id="guard-title"
            className="font-display font-semibold text-lg tracking-tight"
          >
            {m.guard_title()}
          </p>
          <p id="guard-body" className="mt-1 text-muted-foreground text-sm">
            {m.guard_body()}
          </p>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-muted px-3 py-2 font-mono text-[12.5px] leading-relaxed">
            <span className="text-muted-foreground">
              stepper.goTo("contact")
            </span>
            {"\n→ "}
            {"{ accepted: "}
            <span className="text-destructive-muted-foreground">false</span>
            {", reason: "}
            <span className="text-destructive-muted-foreground">
              "{guard.result.accepted ? "" : guard.result.reason}"
            </span>
            {" }"}
          </pre>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              ref={primary}
              onClick={() => {
                dismissGuard();
                void go("open-source");
              }}
            >
              {m.guard_go()}
            </Button>
            <Button variant="ghost" onClick={() => jump("contact")}>
              {m.guard_force()}
            </Button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
