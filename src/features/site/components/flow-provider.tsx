import type { NavigationResult } from "@stepperize/react/headless";
import {
  createContext,
  type ReactNode,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useEggs } from "@/features/eggs/components/eggs-provider";
import { SECTION_IDS, type SectionId, siteFlow } from "../flow";

type GuardState = { result: NavigationResult<SectionId> } | null;

type FlowContextValue = {
  /** The section in view (scroll is authoritative; Stepperize is controlled by it). */
  active: SectionId;
  visited: ReadonlySet<SectionId>;
  /** Navigate through the stepper, so its guard runs. */
  go: (id: SectionId) => Promise<void>;
  /** Navigate without the guard: CTAs and the palette never block anyone. */
  jump: (id: SectionId) => void;
  guard: GuardState;
  dismissGuard: () => void;
};

const FlowContext = createContext<FlowContextValue | null>(null);

export function FlowProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<SectionId>("intro");
  const [visited, setVisited] = useState<ReadonlySet<SectionId>>(
    () => new Set<SectionId>(["intro"]),
  );
  const visitedRef = useRef(visited);
  visitedRef.current = visited;

  const markVisited = useCallback((id: SectionId) => {
    if (visitedRef.current.has(id)) return;
    const next = new Set(visitedRef.current).add(id);
    visitedRef.current = next;
    setVisited(next);
  }, []);

  // While a programmatic scroll glides, the rail shows its destination
  // right away instead of ticking through every section it passes.
  const lockRef = useRef<SectionId | null>(null);
  const showActive = useCallback(
    (id: SectionId) => {
      setActive(id);
      markVisited(id);
    },
    [markVisited],
  );

  const scrollTo = useCallback(
    (id: SectionId) => {
      const target = document.getElementById(id);
      if (!target) return;
      lockRef.current = id;
      showActive(id);
      target.scrollIntoView({ block: "start" });
      history.replaceState(null, "", id === "intro" ? " " : `#${id}`);
      const release = () => {
        lockRef.current = null;
      };
      if ("onscrollend" in window) {
        window.addEventListener("scrollend", release, { once: true });
      }
      window.setTimeout(release, 1200);
    },
    [showActive],
  );

  useSectionSpy(lockRef, showActive);

  return (
    <siteFlow.Provider
      step={active}
      beforeStepChange={({ to }) =>
        // The guard: contact waits until open source has been seen.
        !(to.id === "contact" && !visitedRef.current.has("open-source"))
      }
      onStepChange={scrollTo}
    >
      <FlowBridge
        active={active}
        visited={visited}
        scrollTo={scrollTo}
        markVisited={markVisited}
      >
        {children}
      </FlowBridge>
    </siteFlow.Provider>
  );
}

function FlowBridge({
  active,
  visited,
  scrollTo,
  markVisited,
  children,
}: {
  active: SectionId;
  visited: ReadonlySet<SectionId>;
  scrollTo: (id: SectionId) => void;
  markVisited: (id: SectionId) => void;
  children: ReactNode;
}) {
  const stepper = siteFlow.useStepperContext();
  const { find } = useEggs();
  const [guard, setGuard] = useState<GuardState>(null);

  const go = useCallback(
    async (id: SectionId) => {
      if (id === active) {
        scrollTo(id);
        return;
      }
      const result = await stepper.goTo(id, { bypassPolicy: true });
      if (!result.accepted && result.reason === "guard") {
        setGuard({ result });
        find("guard");
      }
    },
    [active, find, scrollTo, stepper],
  );

  const jump = useCallback(
    (id: SectionId) => {
      setGuard(null);
      if (id === "contact") markVisited("open-source");
      scrollTo(id);
    },
    [markVisited, scrollTo],
  );

  const dismissGuard = useCallback(() => setGuard(null), []);

  const value = useMemo(
    () => ({
      active,
      visited,
      go,
      jump,
      guard,
      dismissGuard,
    }),
    [active, visited, go, jump, guard, dismissGuard],
  );

  return <FlowContext value={value}>{children}</FlowContext>;
}

export function useFlow() {
  const context = use(FlowContext);
  if (!context) throw new Error("useFlow must be used inside <FlowProvider>");
  return context;
}

/**
 * The section whose top has crossed 40% of the viewport is the current step;
 * reaching the bottom of the page completes the flow.
 */
function useSectionSpy(
  lockRef: React.RefObject<SectionId | null>,
  onChange: (id: SectionId) => void,
) {
  useEffect(() => {
    let frame = 0;
    let last: SectionId | null = null;
    const measure = () => {
      frame = 0;
      if (lockRef.current) return;
      const line = window.innerHeight * 0.4;
      let current: SectionId = "intro";
      for (const id of SECTION_IDS) {
        const element = document.getElementById(id);
        if (!element) continue;
        // Sections are spaced by margins; half the gap above one already
        // belongs to it (the paper there carries its source).
        const gap = Number.parseFloat(getComputedStyle(element).marginTop) || 0;
        if (element.getBoundingClientRect().top - gap / 2 < line) current = id;
      }
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 48;
      if (atBottom) current = "contact";
      if (current !== last) {
        last = current;
        onChange(current);
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [lockRef, onChange]);
}
