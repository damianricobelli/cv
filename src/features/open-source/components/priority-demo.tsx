import { Combobox as ComboboxPrimitive } from "@base-ui/react";
import { CheckIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { m } from "@/paraglide/messages";

type Priority = { value: 0 | 1 | 2 | 3 | 4; label: () => string };

const PRIORITIES: Priority[] = [
  { value: 0, label: m.oss_priority_none },
  { value: 1, label: m.oss_priority_urgent },
  { value: 2, label: m.oss_priority_high },
  { value: 3, label: m.oss_priority_medium },
  { value: 4, label: m.oss_priority_low },
];

/**
 * Linear's priority picker on Base UI's Combobox: a button that opens a
 * searchable list, with 0–4 as shortcuts both on the trigger and in the list.
 * The popup scales from its trigger and opens instantly from the keyboard.
 */
export function PriorityDemo() {
  const [priority, setPriority] = useState<Priority>(PRIORITIES[3]);
  const [open, setOpen] = useState(false);

  const pickByKey = (key: string) => {
    const match = PRIORITIES.find((item) => String(item.value) === key);
    if (!match) return false;
    setPriority(match);
    setOpen(false);
    return true;
  };

  return (
    <ComboboxPrimitive.Root
      items={PRIORITIES}
      value={priority}
      onValueChange={(next) => {
        if (next) setPriority(next);
      }}
      open={open}
      onOpenChange={setOpen}
      itemToStringLabel={(item) => item.label()}
      isItemEqualToValue={(a, b) => a.value === b.value}
    >
      <ComboboxPrimitive.Trigger
        aria-label={`${m.oss_combobox_label()}: ${priority.label()}`}
        onKeyDown={(event) => {
          if (pickByKey(event.key)) event.preventDefault();
        }}
        className="inline-flex h-9 w-fit items-center gap-2 rounded-lg border bg-background px-3 text-sm transition-[background-color,scale] duration-150 ease-out hover:bg-muted active:scale-[0.97] data-popup-open:bg-muted"
      >
        <PriorityIcon value={priority.value} />
        <span>{priority.label()}</span>
      </ComboboxPrimitive.Trigger>
      <ComboboxPrimitive.Portal>
        <ComboboxPrimitive.Positioner
          side="bottom"
          align="start"
          sideOffset={6}
          className="isolate z-50"
        >
          <ComboboxPrimitive.Popup
            className={cn(
              "w-60 origin-(--transform-origin) overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-lg outline-none",
              "transition-[opacity,scale] duration-150 ease-out data-ending-style:scale-[0.97] data-ending-style:opacity-0 data-starting-style:scale-[0.97] data-starting-style:opacity-0",
              "data-[instant]:transition-none motion-reduce:transition-none",
            )}
          >
            <ComboboxPrimitive.Input
              placeholder={m.oss_combobox_placeholder()}
              aria-label={m.oss_combobox_placeholder()}
              onKeyDown={(event) => {
                if (!event.currentTarget.value && pickByKey(event.key))
                  event.preventDefault();
              }}
              className="h-10 w-full border-b bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground"
            />
            <ComboboxPrimitive.Empty className="px-3 py-4 text-center text-muted-foreground text-sm empty:hidden">
              {m.oss_combobox_empty()}
            </ComboboxPrimitive.Empty>
            <ComboboxPrimitive.List className="grid p-1">
              {(item: Priority) => (
                <ComboboxPrimitive.Item
                  key={item.value}
                  value={item}
                  className="flex h-9 cursor-default items-center gap-2.5 rounded-lg px-2.5 text-sm outline-none data-highlighted:bg-accent data-highlighted:text-accent-foreground"
                >
                  <PriorityIcon value={item.value} />
                  <span className="flex-1">{item.label()}</span>
                  <ComboboxPrimitive.ItemIndicator>
                    <CheckIcon className="size-4 text-ink" aria-hidden />
                  </ComboboxPrimitive.ItemIndicator>
                  <kbd className="w-4 text-center font-mono text-muted-foreground text-xs">
                    {item.value}
                  </kbd>
                </ComboboxPrimitive.Item>
              )}
            </ComboboxPrimitive.List>
          </ComboboxPrimitive.Popup>
        </ComboboxPrimitive.Positioner>
      </ComboboxPrimitive.Portal>
    </ComboboxPrimitive.Root>
  );
}

function PriorityIcon({ value }: { value: Priority["value"] }) {
  if (value === 0) {
    return (
      <svg
        viewBox="0 0 16 16"
        className="size-4 text-muted-foreground"
        aria-hidden
      >
        <path
          d="M3 8h1.5M7.25 8h1.5M11.5 8H13"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (value === 1) {
    return (
      <svg viewBox="0 0 16 16" className="size-4 text-warning" aria-hidden>
        <rect
          x="1.5"
          y="1.5"
          width="13"
          height="13"
          rx="3.5"
          fill="currentColor"
        />
        <path
          d="M8 4.6v4.1M8 11.1v.3"
          stroke="var(--popover)"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  const filled = 5 - value; // high = 3 bars, medium = 2, low = 1
  return (
    <svg viewBox="0 0 16 16" className="size-4 text-foreground" aria-hidden>
      {[0, 1, 2].map((bar) => (
        <rect
          key={bar}
          x={2 + bar * 4.5}
          y={10 - bar * 3}
          width="3"
          height={4 + bar * 3}
          rx="1"
          fill="currentColor"
          opacity={bar < filled ? 1 : 0.25}
        />
      ))}
    </svg>
  );
}
