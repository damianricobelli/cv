import { blue, cyan, indigo, iris, teal, violet } from "@radix-ui/colors";
import { motion, useReducedMotion } from "motion/react";
import { toast } from "sonner";
import { useEggs } from "@/features/eggs/components/eggs-provider";
import { ACCENTS, type Accent, useAccent } from "@/hooks/use-accent";
import { copyText } from "@/lib/clipboard";
import { cn } from "@/lib/utils";
import { m } from "@/paraglide/messages";

const SCALES: Record<Accent, Record<string, string>> = {
  indigo,
  blue,
  iris,
  violet,
  cyan,
  teal,
};

const steps = (accent: Accent) =>
  Array.from(
    { length: 12 },
    (_, index) => SCALES[accent][`${accent}${index + 1}`],
  );

/**
 * Picking a scale repaints the whole site through `data-accent` on <html>,
 * with a circular reveal from the swatch that was pressed.
 */
export function RadixDemo() {
  const { accent, setAccent } = useAccent();
  const { find } = useEggs();
  const reduce = useReducedMotion();
  const scale = steps(accent);

  return (
    <div className="grid gap-4">
      <div
        role="radiogroup"
        aria-label={m.oss_radixcn_scales()}
        className="flex flex-wrap gap-2"
      >
        {ACCENTS.map((name) => {
          const checked = name === accent;
          return (
            // biome-ignore lint/a11y/useSemanticElements: a swatch is a pressable color; radio semantics give it group navigation and checked state.
            <button
              key={name}
              type="button"
              role="radio"
              aria-checked={checked}
              aria-label={name}
              title={name}
              onClick={(event) => {
                if (checked) return;
                setAccent(name, { x: event.clientX, y: event.clientY });
                find("accent");
              }}
              className={cn(
                "relative size-9 rounded-full transition-[scale,box-shadow] duration-150 ease-out active:scale-[0.92]",
                "shadow-[inset_0_0_0_1px_rgb(0_0_0/0.12)]",
                checked &&
                  "ring-2 ring-foreground ring-offset-2 ring-offset-card",
              )}
              style={{ background: SCALES[name][`${name}9`] }}
            />
          );
        })}
      </div>

      <div className="grid grid-cols-12 overflow-hidden rounded-xl border">
        {scale.map((hex, index) => (
          <motion.button
            key={`${accent}-${hex}`}
            type="button"
            initial={reduce ? false : { opacity: 0, transform: "scaleY(0.6)" }}
            animate={{ opacity: 1, transform: "scaleY(1)" }}
            transition={{
              delay: index * 0.022,
              type: "spring",
              duration: 0.4,
              bounce: 0,
            }}
            onClick={async () => {
              if (await copyText(hex)) toast(m.oss_radixcn_copied({ hex }));
            }}
            aria-label={m.oss_radixcn_step({ step: index + 1, hex })}
            title={hex}
            className="flex h-14 origin-bottom items-end justify-center pb-1.5 font-mono text-[10px] transition-[filter] hover:brightness-95"
            style={{
              background: hex,
              color: index < 8 ? scale[11] : "#fff",
            }}
          >
            {index + 1}
          </motion.button>
        ))}
      </div>
      <p className="flex justify-between gap-2 font-mono text-muted-foreground text-xs">
        <span>{accent} · 12 steps</span>
        <span>{m.oss_radixcn_hint()}</span>
      </p>
    </div>
  );
}
