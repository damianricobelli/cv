import { defineStepper } from "@stepperize/react/headless";
import { CheckIcon } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { m } from "@/paraglide/messages";

/** The real library, running a three-step signup with a guard per step. */
const signup = defineStepper([
  { id: "account" },
  { id: "plan" },
  { id: "done" },
] as const);

type Plan = "hobby" | "team";
type Log =
  | { kind: "idle" }
  | { kind: "ok"; call: string; to: string }
  | { kind: "refused"; call: string; reason: string; why: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const SLIDE = { type: "spring", duration: 0.34, bounce: 0 } as const;

export function StepperizeDemo() {
  const reduce = useReducedMotion();
  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState<Plan | null>(null);
  const [log, setLog] = useState<Log>({ kind: "idle" });
  const [direction, setDirection] = useState(1);
  const [shake, setShake] = useState(0);
  const why = useRef("");
  const values = useRef({ email, plan });
  values.current = { email, plan };

  const stepper = signup.useStepper({
    beforeStepChange: ({ from, direction: move }) => {
      if (move !== "next") return true;
      if (from.id === "account" && !EMAIL.test(values.current.email)) {
        why.current = m.oss_sz_guard_email();
        return false;
      }
      if (from.id === "plan" && !values.current.plan) {
        why.current = m.oss_sz_guard_plan();
        return false;
      }
      return true;
    },
  });

  const next = async () => {
    if (stepper.isLast) {
      setDirection(-1);
      await stepper.reset();
      setEmail("");
      setPlan(null);
      setLog({ kind: "idle" });
      return;
    }
    setDirection(1);
    const result = await stepper.next({ complete: true });
    if (result.accepted) {
      setLog({ kind: "ok", call: "next()", to: result.to });
    } else {
      setLog({
        kind: "refused",
        call: "next()",
        reason: result.reason,
        why: why.current,
      });
      setShake((value) => value + 1);
    }
  };

  const back = async () => {
    setDirection(-1);
    const result = await stepper.prev();
    if (result.accepted) setLog({ kind: "ok", call: "prev()", to: result.to });
  };

  const labels = {
    account: m.oss_sz_step_account(),
    plan: m.oss_sz_step_plan(),
    done: m.oss_sz_step_done(),
  };

  return (
    <div className="grid min-w-0 gap-4 rounded-2xl border bg-background/60 p-4 sm:p-5">
      <ol className="grid grid-cols-[auto_1fr_auto_1fr_auto] items-center gap-2">
        {stepper.steps.map((step, index) => {
          const done = index < stepper.index || stepper.isLast;
          const current = index === stepper.index;
          return (
            <li key={step.id} className="contents">
              <span
                className={cn(
                  "flex items-center gap-2 font-mono text-xs transition-colors duration-200",
                  current || done ? "text-foreground" : "text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "grid size-6 place-items-center rounded-full border text-[11px] transition-[background-color,border-color,color] duration-200",
                    done
                      ? "border-transparent bg-ink text-primary-foreground"
                      : current
                        ? "border-a9 text-ink"
                        : "border-input",
                  )}
                >
                  {done ? (
                    <CheckIcon className="size-3.5" strokeWidth={3} />
                  ) : (
                    index + 1
                  )}
                </span>
                <span className="hidden sm:inline">{labels[step.id]}</span>
              </span>
              {index < stepper.count - 1 ? (
                <span
                  aria-hidden
                  className="h-0.5 overflow-hidden rounded-full bg-border"
                >
                  <motion.span
                    className="block h-full origin-left bg-a9"
                    initial={false}
                    animate={{
                      transform: `scaleX(${index < stepper.index ? 1 : 0})`,
                    }}
                    transition={
                      reduce
                        ? { duration: 0 }
                        : { type: "spring", duration: 0.45, bounce: 0 }
                    }
                  />
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>

      <motion.div
        key={shake}
        animate={shake && !reduce ? { x: [0, -6, 6, -3, 3, 0] } : undefined}
        transition={{ duration: 0.36, ease: "easeOut" }}
        className="relative min-h-[7.25rem] overflow-hidden"
      >
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          <motion.div
            key={stepper.id}
            custom={direction}
            initial={
              reduce
                ? { opacity: 0 }
                : { opacity: 0, transform: `translateX(${direction * 24}px)` }
            }
            animate={{ opacity: 1, transform: "translateX(0px)" }}
            exit={
              reduce
                ? { opacity: 0 }
                : {
                    opacity: 0,
                    transform: `translateX(${direction * -24}px)`,
                    transition: { duration: 0.16 },
                  }
            }
            transition={SLIDE}
            className="grid gap-2"
          >
            {stepper.match({
              account: () => (
                <>
                  <label htmlFor="sz-email" className="font-medium text-sm">
                    {m.oss_sz_email()}
                  </label>
                  <Input
                    id="sz-email"
                    type="email"
                    inputMode="email"
                    autoComplete="off"
                    autoCapitalize="none"
                    enterKeyHint="next"
                    placeholder={m.oss_sz_email_placeholder()}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") void next();
                    }}
                  />
                </>
              ),
              plan: () => (
                <fieldset className="grid gap-2">
                  <legend className="mb-2 font-medium text-sm">
                    {m.oss_sz_plan_label()}
                  </legend>
                  <div className="grid grid-cols-2 gap-2">
                    {(["hobby", "team"] as const).map((option) => (
                      <button
                        key={option}
                        type="button"
                        aria-pressed={plan === option}
                        onClick={() => setPlan(option)}
                        className={cn(
                          "grid gap-0.5 rounded-xl border bg-card px-3 py-2.5 text-left transition-[background-color,border-color,box-shadow,scale] duration-150 ease-out active:scale-[0.97]",
                          plan === option
                            ? "border-a9 bg-a3 shadow-[inset_0_0_0_1px_var(--accent-9)]"
                            : "hover:border-input",
                        )}
                      >
                        <span className="font-medium text-sm">
                          {option === "hobby"
                            ? m.oss_sz_plan_hobby()
                            : m.oss_sz_plan_team()}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {option === "hobby"
                            ? m.oss_sz_plan_hobby_desc()
                            : m.oss_sz_plan_team_desc()}
                        </span>
                      </button>
                    ))}
                  </div>
                </fieldset>
              ),
              done: () => (
                <p className="flex items-center gap-3 py-4 font-display font-semibold text-xl tracking-tight">
                  <DrawnCheck />
                  {m.oss_sz_done()}
                </p>
              ),
            })}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          onClick={back}
          disabled={stepper.isFirst || stepper.isLast}
        >
          {m.oss_sz_back()}
        </Button>
        <Button onClick={next}>
          {stepper.isLast
            ? m.oss_sz_restart()
            : stepper.id === "plan"
              ? m.oss_sz_confirm()
              : m.oss_sz_next()}
        </Button>
      </div>

      <output
        aria-live="polite"
        className="block min-h-10 rounded-lg border border-dashed px-3 py-2 font-mono text-[12px] text-muted-foreground leading-relaxed [overflow-wrap:anywhere]"
      >
        {log.kind === "idle" ? (
          <span>{"// await stepper.next()"}</span>
        ) : log.kind === "ok" ? (
          <>
            stepper.{log.call} → {"{ accepted: "}
            <span className="font-semibold text-success-muted-foreground">
              true
            </span>
            {`, to: "${log.to}" }`}
          </>
        ) : (
          <>
            stepper.{log.call} → {"{ accepted: "}
            <span className="font-semibold text-destructive-muted-foreground">
              false
            </span>
            {", reason: "}
            <span className="font-semibold text-destructive-muted-foreground">
              "{log.reason}"
            </span>
            {" } "}
            <span className="block font-sans text-[12.5px] text-foreground/80">
              {log.why.charAt(0).toUpperCase() + log.why.slice(1)}
            </span>
          </>
        )}
      </output>
    </div>
  );
}

function DrawnCheck() {
  const reduce = useReducedMotion();
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-7 shrink-0 text-success"
      aria-hidden
    >
      <motion.path
        d="M5 12.5l4.5 4.5L19 7.5"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: reduce ? 1 : 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.45, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
      />
    </svg>
  );
}

export const STEPPERIZE_SNIPPET = `const signup = defineStepper([
  { id: "account" },
  { id: "plan" },
  { id: "done" },
])

const stepper = signup.useStepper({
  beforeStepChange: ({ from }) =>
    from.id !== "account" ||
    isEmail(email),
})

await stepper.next()
// { accepted: false,
//   reason: "guard" }`;
