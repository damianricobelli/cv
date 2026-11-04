import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";

/** Eyebrow with the step number, a display title and a short intro. */
export function SectionHeading({
  step,
  total,
  tag,
  title,
  intro,
  className,
}: {
  step: number;
  total: number;
  tag: string;
  title: ReactNode;
  intro?: ReactNode;
  className?: string;
}) {
  return (
    <Reveal className={cn("grid max-w-3xl gap-5", className)}>
      <p className="flex items-center gap-3 font-mono text-ink text-xs">
        <span className="tabular-nums">
          {String(step).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
        <span aria-hidden className="h-px w-8 bg-current opacity-50" />
        <span>{tag}</span>
      </p>
      <h2 className="text-balance font-display font-bold text-[clamp(2.25rem,5.4vw,4rem)] leading-[0.95] tracking-[-0.035em]">
        {title}
      </h2>
      {intro ? (
        <p className="max-w-[60ch] text-pretty text-lg text-muted-foreground leading-relaxed">
          {intro}
        </p>
      ) : null}
    </Reveal>
  );
}
