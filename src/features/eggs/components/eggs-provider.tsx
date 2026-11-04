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
import { toast } from "sonner";
import { m } from "@/paraglide/messages";
import { EGG_COPY, EGG_IDS, type EggId, isEggId } from "../types";

const STORAGE_KEY = "eggs:v2";

type EggsContextValue = {
  found: ReadonlySet<EggId>;
  find: (id: EggId) => void;
};

const EggsContext = createContext<EggsContextValue | null>(null);

function readStored(): Set<EggId> {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return new Set(Array.isArray(raw) ? raw.filter(isEggId) : []);
  } catch {
    return new Set();
  }
}

export function EggsProvider({ children }: { children: ReactNode }) {
  // Server and first client render agree on "none found"; storage fills it in after.
  const [found, setFound] = useState<ReadonlySet<EggId>>(() => new Set());
  const foundRef = useRef(found);
  foundRef.current = found;

  useEffect(() => {
    setFound(readStored());
  }, []);

  const find = useCallback((id: EggId) => {
    if (foundRef.current.has(id)) return;
    const next = new Set(foundRef.current).add(id);
    foundRef.current = next;
    setFound(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
    } catch {
      // Blocked storage: progress lasts for this visit.
    }
    const total = EGG_IDS.length;
    toast(
      m.eggs_toast_title({
        found: next.size,
        total,
        name: EGG_COPY[id].name(),
      }),
      {
        description:
          next.size === total
            ? m.eggs_all_found({ total })
            : EGG_COPY[id].found(),
        duration: 5000,
      },
    );
  }, []);

  useTabReturnEgg(find);

  const value = useMemo(() => ({ found, find }), [found, find]);
  return <EggsContext value={value}>{children}</EggsContext>;
}

export function useEggs() {
  const context = use(EggsContext);
  if (!context) throw new Error("useEggs must be used inside <EggsProvider>");
  return context;
}

/** Leaving the tab changes its title; coming back after a moment counts as found. */
function useTabReturnEgg(find: (id: EggId) => void) {
  useEffect(() => {
    let hiddenAt = 0;
    let title = document.title;
    const onVisibility = () => {
      if (document.hidden) {
        hiddenAt = Date.now();
        title = document.title;
        document.title = m.tab_away_title();
        return;
      }
      document.title = title;
      if (hiddenAt && Date.now() - hiddenAt > 1500) find("tab");
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [find]);
}
