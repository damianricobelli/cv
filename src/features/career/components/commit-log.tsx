import { m } from "@/paraglide/messages";
import { CAREER, LANES, type Lane } from "../types";
import { CommitRow, type Segment } from "./commit-row";

/**
 * Which piece of each branch line a row draws. Lines live inside the rows,
 * so expanding a row stretches them with no measuring and no per-frame work.
 */
function segmentsFor(index: number): Partial<Record<Lane, Segment>> {
  const result: Partial<Record<Lane, Segment>> = {};
  for (const lane of LANES) {
    const start = CAREER.findIndex((entry) => entry.lane === lane);
    const end =
      lane === "main"
        ? CAREER.length - 1
        : CAREER.findIndex((entry) => entry.forkOf === lane);
    if (start < 0 || end < 0 || index < start || index > end) continue;
    if (index === start) result[lane] = "from-node";
    else if (index === end)
      result[lane] = lane === "main" ? "to-node" : "merge";
    else result[lane] = "through";
  }
  return result;
}

export function CommitLog() {
  return (
    <div className="grid gap-6">
      <ol className="relative grid [--graph-w:3.5rem] [--node-y:29px] [--x-founder:27px] [--x-main:10px] [--x-oss:44px] sm:[--graph-w:4.75rem] sm:[--node-y:32px] sm:[--x-founder:37px] sm:[--x-main:14px] sm:[--x-oss:60px]">
        {CAREER.map((entry, index) => (
          <CommitRow
            key={entry.id}
            entry={entry}
            segments={segmentsFor(index)}
          />
        ))}
      </ol>
      <Legend />
    </div>
  );
}

function Legend() {
  const items: Array<{ lane: Lane; label: string; dot: string }> = [
    {
      lane: "main",
      label: m.career_legend_main(),
      dot: "rounded-full border-foreground/80 bg-background",
    },
    {
      lane: "founder",
      label: m.career_legend_founder(),
      dot: "rotate-45 rounded-[2px] border-warning bg-warning blueprint:border-white blueprint:bg-white",
    },
    {
      lane: "oss",
      label: m.career_legend_oss(),
      dot: "rounded-full border-a9 bg-a9",
    },
  ];
  return (
    <ul className="flex flex-wrap gap-x-6 gap-y-2 pl-[3.5rem] font-mono text-muted-foreground text-xs sm:pl-[4.75rem]">
      {items.map((item) => (
        <li key={item.lane} className="flex items-center gap-2">
          <span aria-hidden className={`size-2.5 border-2 ${item.dot}`} />
          <span className="text-foreground">{item.lane}</span>
          <span>{item.label}</span>
        </li>
      ))}
    </ul>
  );
}
