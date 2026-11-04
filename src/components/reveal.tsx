import { animate, inView } from "motion";
import { type ComponentProps, useEffect, useRef } from "react";

/**
 * Content rendered on the server is always visible. Only blocks that start
 * below the fold rise in as they approach, and only once JS is running.
 */
export function Reveal({
  delay = 0,
  ...props
}: ComponentProps<"div"> & { delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (element.getBoundingClientRect().top < window.innerHeight) return;
    element.style.opacity = "0";
    element.style.transform = "translateY(16px)";
    return inView(
      element,
      () => {
        animate(
          element,
          { opacity: 1, transform: "translateY(0px)" },
          { duration: 0.6, delay, ease: [0.23, 1, 0.32, 1] },
        );
      },
      { margin: "0px 0px 10% 0px" },
    );
  }, [delay]);

  return <div ref={ref} {...props} />;
}
