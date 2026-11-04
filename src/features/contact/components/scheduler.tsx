import { CopyIcon, MailIcon } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { enUS, es } from "react-day-picker/locale";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { intlLocale } from "@/i18n";
import { copyText } from "@/lib/clipboard";
import { PROFILE } from "@/lib/profile";
import { cn } from "@/lib/utils";
import { m } from "@/paraglide/messages";
import { getLocale } from "@/paraglide/runtime";

const SLOTS = [
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
];

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

/** The shadcn-cal-com idea, applied: pick a day, pick a time, take the message. */
export function Scheduler() {
  const reduce = useReducedMotion();
  const locale = getLocale();
  const [day, setDay] = useState<Date | undefined>();
  const [slot, setSlot] = useState<string | null>(null);
  // The visitor's zone and "today" are only known in the browser: the server
  // runs in UTC, so the calendar renders after hydration.
  const [timeZone, setTimeZone] = useState<string | null>(null);
  useEffect(() => {
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
  }, []);
  const zone = timeZone ?? "UTC";
  const zoneLabel = zone.split("/").pop()?.replaceAll("_", " ") ?? zone;

  const longDate = useMemo(
    () =>
      new Intl.DateTimeFormat(intlLocale[locale], {
        weekday: "long",
        day: "numeric",
        month: "long",
      }),
    [locale],
  );
  const shortDate = useMemo(
    () =>
      new Intl.DateTimeFormat(intlLocale[locale], {
        weekday: "short",
        day: "numeric",
      }),
    [locale],
  );

  const message =
    day && slot
      ? m.contact_message({
          date: longDate.format(day),
          time: slot,
          tz: zoneLabel,
        })
      : "";
  const mailto = `mailto:${PROFILE.email}?subject=${encodeURIComponent(m.contact_subject())}&body=${encodeURIComponent(message)}`;

  return (
    <div
      id="scheduler"
      className="grid gap-5 rounded-[1.5rem] border bg-card p-4 shadow-sm sm:p-6"
    >
      <div className="grid gap-5 sm:grid-cols-[auto_minmax(0,1fr)]">
        {timeZone ? (
          <Calendar
            mode="single"
            selected={day}
            onSelect={(next) => {
              setDay(next);
              setSlot(null);
            }}
            locale={locale === "es" ? es : enUS}
            weekStartsOn={1}
            disabled={[{ before: startOfToday() }, { dayOfWeek: [0, 6] }]}
            className="mx-auto rounded-2xl bg-transparent p-0 [--cell-size:--spacing(10)]"
          />
        ) : (
          <div aria-hidden className="mx-auto h-[22.75rem] w-[17.5rem]" />
        )}
        <div className="grid min-h-48 content-start gap-2">
          <p className="font-medium text-sm first-letter:uppercase">
            {day ? shortDate.format(day) : m.contact_pick_day()}
          </p>
          <p className="font-mono text-muted-foreground text-xs">
            {m.contact_timezone({ tz: zoneLabel })}
          </p>
          <AnimatePresence mode="popLayout" initial={false}>
            {day ? (
              <motion.ul
                key={day.toDateString()}
                className="mt-1 grid grid-cols-2 gap-2 sm:grid-cols-1 lg:grid-cols-2"
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, transition: { duration: 0.12 } }}
                variants={{
                  hidden: {},
                  visible: {
                    transition: { staggerChildren: reduce ? 0 : 0.03 },
                  },
                }}
              >
                {SLOTS.map((time) => (
                  <motion.li
                    key={time}
                    variants={{
                      hidden: reduce
                        ? { opacity: 0 }
                        : { opacity: 0, transform: "translateY(6px)" },
                      visible: { opacity: 1, transform: "translateY(0px)" },
                    }}
                    transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                  >
                    <button
                      type="button"
                      aria-pressed={slot === time}
                      onClick={() => setSlot(time)}
                      className={cn(
                        "h-10 w-full rounded-xl border font-mono text-sm tabular-nums transition-[background-color,border-color,color,scale] duration-150 ease-out active:scale-[0.97]",
                        slot === time
                          ? "border-transparent bg-primary text-primary-foreground"
                          : "bg-background hover:border-a8",
                      )}
                    >
                      {time}
                    </button>
                  </motion.li>
                ))}
              </motion.ul>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {message ? (
          <motion.div
            key="summary"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0, transition: { duration: 0.18 } }}
            transition={
              reduce
                ? { duration: 0 }
                : { type: "spring", duration: 0.4, bounce: 0 }
            }
            className="overflow-hidden"
          >
            <div className="grid gap-4 border-t pt-5">
              <blockquote className="text-pretty text-lg leading-relaxed">
                “{message}”
              </blockquote>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={async () => {
                    if (await copyText(message)) toast(m.contact_copied());
                  }}
                >
                  <CopyIcon data-icon="inline-start" />
                  {m.contact_copy()}
                </Button>
                <Button
                  variant="outline"
                  nativeButton={false}
                  render={<a href={mailto} />}
                >
                  <MailIcon data-icon="inline-start" />
                  {m.contact_send()}
                </Button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
