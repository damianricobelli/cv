import { ArrowUpRightIcon, CopyIcon } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { lazy, Suspense } from "react";
import { toast } from "sonner";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import { useEggs } from "@/features/eggs/components/eggs-provider";
import { SECTION_IDS } from "@/features/site/flow";
import { copyText } from "@/lib/clipboard";
import { PROFILE } from "@/lib/profile";
import { m } from "@/paraglide/messages";

/** react-day-picker and its locales load in their own chunk. */
const Scheduler = lazy(() =>
  import("./scheduler").then((module) => ({ default: module.Scheduler })),
);

export function ContactSection() {
  // psst: if you can read this in the paper,
  // you already know how this site is built.
  return (
    <section
      id="contact"
      data-bp="<section id=contact>"
      aria-labelledby="contact-heading"
      className="mt-36 grid gap-12 py-6 sm:mt-52"
    >
      <SectionHeading
        step={SECTION_IDS.indexOf("contact") + 1}
        total={SECTION_IDS.length}
        tag={m.contact_tag()}
        title={<span id="contact-heading">{m.contact_title()}</span>}
        intro={m.contact_intro()}
      />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)]">
        <Reveal className="relative min-w-0">
          <Suspense
            fallback={
              <div className="h-[25rem] rounded-[1.5rem] border bg-card" />
            }
          >
            <Scheduler />
          </Suspense>
          <ApprovalStamp />
        </Reveal>
        <Reveal delay={0.08} className="grid content-start gap-4">
          <div className="grid gap-3 rounded-[1.5rem] border bg-card p-5 shadow-sm sm:p-6">
            <span className="font-mono text-muted-foreground text-xs">
              {m.contact_email_label()}
            </span>
            <span className="select-all break-all font-mono text-lg">
              {PROFILE.email}
            </span>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={async () => {
                  if (await copyText(PROFILE.email))
                    toast(m.contact_email_copied());
                }}
              >
                <CopyIcon data-icon="inline-start" />
                {m.contact_copy_email()}
              </Button>
            </div>
          </div>
          <nav
            aria-label={m.contact_elsewhere()}
            className="grid rounded-[1.5rem] border bg-card px-5 py-2 shadow-sm sm:px-6"
          >
            {[
              {
                label: "GitHub",
                handle: "@damianricobelli",
                href: PROFILE.github,
              },
              {
                label: "LinkedIn",
                handle: "/in/damianricobelli",
                href: PROFILE.linkedin,
              },
              { label: "X", handle: "@damianricobelli", href: PROFILE.x },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener"
                className="group flex min-h-12 items-center justify-between gap-3 border-b py-3 last:border-0"
              >
                <span className="font-medium">{link.label}</span>
                <span className="flex items-center gap-1.5 font-mono text-muted-foreground text-xs transition-colors group-hover:text-ink">
                  {link.handle}
                  <ArrowUpRightIcon
                    className="size-3.5 transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </span>
              </a>
            ))}
          </nav>
        </Reveal>
      </div>
    </section>
  );
}

/** Easter egg: once `sudo` was used in the palette, the contact card carries the stamp. */
function ApprovalStamp() {
  const { found } = useEggs();
  const reduce = useReducedMotion();
  return (
    <AnimatePresence>
      {found.has("sudo") ? (
        <motion.div
          aria-hidden
          initial={
            reduce
              ? { opacity: 0 }
              : { opacity: 0, transform: "scale(2.2) rotate(-24deg)" }
          }
          animate={{ opacity: 1, transform: "scale(1) rotate(-11deg)" }}
          transition={{
            type: "spring",
            duration: 0.5,
            bounce: 0.3,
            delay: 0.25,
          }}
          className="pointer-events-none absolute right-5 bottom-5 rounded-xl border-[3px] border-destructive px-3 py-0.5 font-display font-extrabold text-2xl text-destructive uppercase tracking-[0.06em] opacity-90 blueprint:border-white blueprint:text-white"
        >
          {m.contact_approved()}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
