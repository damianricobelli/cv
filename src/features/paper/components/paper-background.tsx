import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * The page's paper, with the site's drawing blind-embossed into it. three.js
 * loads once the browser is idle, so it never competes with the first paint;
 * without WebGL the plain CSS background stays and nothing is lost.
 */
export function PaperBackground({
  onSecretFound,
}: {
  /** The light rested on the secret comment (the home page's easter egg). */
  onSecretFound?: () => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const foundRef = useRef(onSecretFound);
  foundRef.current = onSecretFound;

  useEffect(() => {
    let cancelled = false;
    let dispose: (() => void) | undefined;
    const start = () => {
      import("../lib/paper")
        .then(({ createPaper }) => {
          if (cancelled || !canvas.current) return;
          dispose = createPaper(canvas.current, {
            onSecretFound: () => foundRef.current?.(),
          });
          setReady(true);
          // Text marked data-emboss turns to invisible ink: the paper shows it now.
          document.documentElement.dataset.paper = "ready";
        })
        .catch(() => {
          // No WebGL (or the chunk failed): the CSS paper is enough.
        });
    };
    const idle =
      typeof window.requestIdleCallback === "function"
        ? window.requestIdleCallback(start, { timeout: 2500 })
        : window.setTimeout(start, 1200);
    return () => {
      cancelled = true;
      if (typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idle);
      }
      window.clearTimeout(idle);
      dispose?.();
      delete document.documentElement.dataset.paper;
    };
  }, []);

  return (
    // Page-sized and clipped: the canvas inside scrolls with the content and
    // never makes the page taller.
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <canvas
        ref={canvas}
        className={cn(
          "absolute inset-x-0 top-0 w-full transition-opacity duration-700",
          ready ? "opacity-100" : "opacity-0",
        )}
      />
    </div>
  );
}
