import { ArrowUpRightIcon, ChevronDownIcon } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { intlLocale } from "@/i18n";
import { cn } from "@/lib/utils";
import { m } from "@/paraglide/messages";
import { getLocale } from "@/paraglide/runtime";
import { type CareerEntry, LANES, type Lane, shortHash } from "../types";

/** from-node: starts at this row's commit · through: crosses the row · to-node: ends here · merge: curves into main here. */
export type Segment = "from-node" | "through" | "to-node" | "merge";

const LANE_COLOR: Record<Lane, string> = {
  main: "bg-foreground/75",
  founder: "bg-warning blueprint:bg-white",
  oss: "bg-a9",
};
const LANE_STROKE: Record<Lane, string> = {
  main: "stroke-foreground/75",
  founder: "stroke-warning blueprint:stroke-white",
  oss: "stroke-a9",
};
const LANE_X: Record<Lane, string> = {
  main: "left-[var(--x-main)]",
  founder: "left-[var(--x-founder)]",
  oss: "left-[var(--x-oss)]",
};
const NODE: Record<Lane, string> = {
  main: "rounded-full border-foreground/80 bg-background",
  founder:
    "rotate-45 rounded-[3px] border-warning bg-warning blueprint:border-white blueprint:bg-white",
  oss: "rounded-full border-a9 bg-a9",
};
const BRANCH_PILL: Record<Lane, string> = {
  main: "border-border text-muted-foreground",
  founder:
    "border-warning-border bg-warning-muted text-warning-muted-foreground",
  oss: "border-a6 bg-a3 text-ink",
};
/** Merge curves, per breakpoint: from the branch's x down into main at the commit. */
const MERGE: Record<"founder" | "oss", [compact: string, regular: string]> = {
  founder: ["M27 0 C27 18 10 11 10 29", "M37 0 C37 20 14 12 14 32"],
  oss: ["M44 0 C44 18 10 11 10 29", "M60 0 C60 20 14 12 14 32"],
};

function formatPoint(point: string) {
  const [year, month] = point.split("-").map(Number);
  if (!month) return String(year);
  return new Intl.DateTimeFormat(intlLocale[getLocale()], {
    month: "short",
    year: "numeric",
  })
    .format(new Date(year, month - 1, 1))
    .replace(".", "");
}

function formatRange(entry: CareerEntry) {
  if (!entry.end) return formatPoint(entry.start);
  const end =
    entry.end === "present" ? m.career_present() : formatPoint(entry.end);
  return `${formatPoint(entry.start)} — ${end}`;
}

/**
 * Rows below the fold draw their branch lines and pop their commit as they
 * scroll in (CSS transitions on transform/opacity). Server markup and no-JS
 * visitors get everything drawn.
 */
function useDrawOnEnter() {
  const ref = useRef<HTMLLIElement>(null);
  useEffect(() => {
    const row = ref.current;
    if (!row) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (row.getBoundingClientRect().top < window.innerHeight * 0.85) return;
    row.dataset.pending = "";
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        delete row.dataset.pending;
        observer.disconnect();
      },
      { rootMargin: "0px 0px -18% 0px" },
    );
    observer.observe(row);
    return () => observer.disconnect();
  }, []);
  return ref;
}

export function CommitRow({
  entry,
  segments,
}: {
  entry: CareerEntry;
  segments: Partial<Record<Lane, Segment>>;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const row = useDrawOnEnter();
  const isJob = "role" in entry.title;
  const name = isJob
    ? `${(entry.title as { role: string }).role} · ${(entry.title as { org: string }).org}`
    : (entry.title as { commit: string }).commit;
  const hasDetails = Boolean(entry.highlights?.length || entry.link);
  // Rows without details are plain text, not a dead button.
  const Header = hasDetails ? "button" : "div";

  return (
    <li
      ref={row}
      className="group/row relative grid grid-cols-[var(--graph-w)_minmax(0,1fr)]"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-[var(--graph-w)]"
      >
        {LANES.map((lane) => {
          const segment = segments[lane];
          return segment ? (
            <LaneSegment key={lane} lane={lane} segment={segment} />
          ) : null;
        })}
        <span
          className={cn(
            "absolute top-[calc(var(--node-y)-6px)] z-10 size-3 -translate-x-1/2 border-2",
            "transition-[opacity,scale] delay-300 duration-300 ease-out group-data-pending/row:scale-50 group-data-pending/row:opacity-0 group-data-pending/row:delay-0",
            LANE_X[entry.lane],
            NODE[entry.lane],
          )}
        />
      </span>
      <span />
      <div className="min-w-0">
        <Header
          {...(hasDetails
            ? {
                type: "button" as const,
                "aria-expanded": open,
                "aria-controls": panelId,
                "aria-label": m.career_toggle({ name }),
                onClick: () => setOpen((value) => !value),
              }
            : {})}
          className={cn(
            "group grid w-full grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 gap-y-1.5 rounded-2xl px-3 py-3.5 text-left sm:px-4 sm:py-4",
            "transition-[background-color,scale] duration-150 ease-out",
            hasDetails &&
              "cursor-pointer hover:bg-card/80 active:scale-[0.995] aria-expanded:bg-card/80",
          )}
        >
          <span className="flex min-w-0 flex-wrap items-baseline gap-x-2.5 gap-y-1">
            <span className="hidden font-mono text-muted-foreground text-xs md:inline">
              {shortHash(entry.id)}
            </span>
            <span
              className={cn(
                "rounded-full border px-2 py-px font-mono text-[11px]",
                BRANCH_PILL[entry.lane],
              )}
            >
              {entry.end === "present" ? `HEAD → ${entry.lane}` : entry.lane}
            </span>
            <span
              className={cn(
                "min-w-0 text-pretty font-display font-semibold text-[1.15rem] leading-snug tracking-[-0.015em] sm:text-[1.3rem]",
                !isJob &&
                  "font-medium font-mono text-[0.98rem] tracking-normal sm:text-[1.05rem]",
              )}
            >
              {isJob ? (
                <>
                  {(entry.title as { role: string }).role}{" "}
                  <span className="text-muted-foreground">·</span>{" "}
                  <span className="text-ink">
                    {(entry.title as { org: string }).org}
                  </span>
                </>
              ) : (
                name
              )}
            </span>
          </span>
          <span className="flex items-center gap-2 whitespace-nowrap font-mono text-muted-foreground text-xs tabular-nums">
            {formatRange(entry)}
            {hasDetails ? (
              <ChevronDownIcon
                aria-hidden
                className="size-4 transition-transform duration-200 ease-out group-aria-expanded:rotate-180"
              />
            ) : null}
          </span>
          <span className="col-span-2 max-w-[68ch] text-pretty text-muted-foreground leading-relaxed">
            {entry.location ? (
              <span className="text-foreground/80">{entry.location()} · </span>
            ) : null}
            {entry.summary()}
          </span>
        </Header>

        {hasDetails ? (
          // grid-template-rows 0fr → 1fr: a CSS-only height transition the
          // browser runs and interrupts on its own, with no JS per frame.
          <div
            id={panelId}
            inert={!open}
            className={cn(
              "grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none",
              open
                ? "grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0",
            )}
          >
            <div className="min-h-0 overflow-hidden">
              <div className="grid gap-1.5 px-3 pt-1 pb-5 font-mono text-[13px] sm:px-4">
                {entry.highlights?.map((line, index) => (
                  <p key={index} className="text-pretty">
                    <span className="text-success-muted-foreground">+ </span>
                    {line()}
                  </p>
                ))}
                {entry.link ? (
                  <a
                    href={entry.link.href}
                    target="_blank"
                    rel="noopener"
                    className="mt-1 inline-flex w-fit items-center gap-1 text-ink underline-offset-4 hover:underline"
                  >
                    {entry.link.label}
                    <ArrowUpRightIcon className="size-3.5" aria-hidden />
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </li>
  );
}

function LaneSegment({ lane, segment }: { lane: Lane; segment: Segment }) {
  const draw =
    "origin-top transition-[scale] duration-500 ease-out group-data-pending/row:scale-y-0";
  if (segment === "merge" && lane !== "main") {
    return (
      <>
        {MERGE[lane].map((d, index) => (
          <svg
            key={d}
            aria-hidden
            className={cn(
              "absolute top-0 left-0 h-[var(--node-y)] w-full overflow-visible",
              index === 0 ? "sm:hidden" : "hidden sm:block",
              draw,
            )}
            viewBox={index === 0 ? "0 0 56 29" : "0 0 76 32"}
            preserveAspectRatio="none"
          >
            <path
              d={d}
              fill="none"
              strokeWidth={2}
              vectorEffect="non-scaling-stroke"
              className={LANE_STROKE[lane]}
            />
          </svg>
        ))}
      </>
    );
  }
  return (
    <span
      className={cn(
        "absolute w-0.5 -translate-x-1/2 rounded-full",
        LANE_X[lane],
        LANE_COLOR[lane],
        draw,
        segment === "through" && "inset-y-0",
        segment === "from-node" && "top-[var(--node-y)] bottom-0",
        segment === "to-node" && "top-0 h-[var(--node-y)]",
      )}
    />
  );
}
