import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useEggs } from "@/features/eggs/components/eggs-provider";

const WORDS = ["Damián", "Ricobelli"] as const;
/** On touch, tapping this many different letters in a row counts as found. */
const TAPS_FOR_EGG = 4;

/**
 * The name rises in with a CSS animation (it plays before hydration). After
 * that every letter is elastic: with a mouse you can grab one and fling it,
 * and it springs home carrying the velocity you let go with. On touch, a tap
 * makes the letter hop, so the name never steals the page's scroll.
 */
export function HeroName() {
  const { find } = useEggs();
  const reduce = useReducedMotion();
  const [canDrag, setCanDrag] = useState(false);
  const taps = useRef<Set<number>>(new Set());

  useEffect(() => {
    const query = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setCanDrag(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const chars = WORDS.flatMap((word, wordIndex) => [
    ...[...word].map((char) => ({ char, word: wordIndex })),
    ...(wordIndex === WORDS.length - 1 ? [{ char: ".", word: wordIndex }] : []),
  ]);

  return (
    <h1
      aria-label="Damián Ricobelli"
      className="font-display font-extrabold text-[clamp(3.6rem,12.4vw,10.5rem)] leading-[0.84] tracking-[-0.055em]"
    >
      {WORDS.map((word, wordIndex) => (
        <span key={word} aria-hidden className="inline-block whitespace-nowrap">
          {chars.map((item, index) =>
            item.word === wordIndex ? (
              <Letter
                key={index}
                index={index}
                char={item.char}
                accent={item.char === "."}
                drag={canDrag && !reduce}
                onFling={() => find("elastic")}
                onTap={() => {
                  if (canDrag) return;
                  taps.current.add(index);
                  if (taps.current.size >= TAPS_FOR_EGG) find("elastic");
                }}
              />
            ) : null,
          )}
          {wordIndex < WORDS.length - 1 ? (
            <span className="inline-block w-[0.22em]" />
          ) : null}
        </span>
      ))}
    </h1>
  );
}

function Letter({
  char,
  index,
  accent,
  drag,
  onFling,
  onTap,
}: {
  char: string;
  index: number;
  accent: boolean;
  drag: boolean;
  onFling: () => void;
  onTap: () => void;
}) {
  const reduce = useReducedMotion();
  const [hop, setHop] = useState(0);

  return (
    // The outer span owns the CSS entrance; the inner one owns the physics,
    // so the two never fight over `transform`.
    <span
      className="hero-char inline-block"
      style={{ "--i": index } as React.CSSProperties}
    >
      <motion.span
        className={
          accent
            ? "inline-block select-none text-a9"
            : "inline-block select-none"
        }
        drag={drag}
        dragSnapToOrigin
        dragElastic={0.55}
        // Release hands the pointer's velocity to a spring with a little bounce:
        // the gesture had momentum, so the overshoot reads as physical.
        dragTransition={{ bounceStiffness: 420, bounceDamping: 16 }}
        whileDrag={{ scale: 1.08, cursor: "grabbing" }}
        onDragEnd={(_, info) => {
          if (Math.hypot(info.offset.x, info.offset.y) > 40) onFling();
        }}
        style={{
          cursor: drag ? "grab" : "default",
          touchAction: drag ? "none" : "auto",
        }}
        onTap={() => {
          onTap();
          if (!drag && !reduce) setHop((count) => count + 1);
        }}
        animate={
          hop ? { y: [0, "-0.28em", 0], scaleY: [1, 1.06, 0.92, 1] } : undefined
        }
        transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
        key={hop}
      >
        {char}
      </motion.span>
    </span>
  );
}
