import { useSuspenseQuery } from "@tanstack/react-query";
import { CalendarIcon, CheckIcon, CopyIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { lazy, Suspense, useState } from "react";
import { toast } from "sonner";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import { useFlow } from "@/features/site/components/flow-provider";
import { SECTION_IDS } from "@/features/site/flow";
import { copyText } from "@/lib/clipboard";
import { m } from "@/paraglide/messages";
import { ossStatsQueryOptions } from "../queries/options";
import { repoUrl } from "../types";
import { OssCard } from "./oss-card";
import { PriorityDemo } from "./priority-demo";
import { RadixDemo } from "./radix-demo";
import { STEPPERIZE_SNIPPET, StepperizeDemo } from "./stepperize-demo";

/** libphonenumber's metadata is the heaviest thing on the page: its own chunk. */
const PhoneDemo = lazy(() =>
  import("./phone-demo").then((module) => ({ default: module.PhoneDemo })),
);

export function OssSection() {
  const { data } = useSuspenseQuery(ossStatsQueryOptions());
  const { stars, downloads } = data;

  return (
    <section
      id="open-source"
      data-bp="<section id=open-source>"
      aria-labelledby="oss-heading"
      className="mt-36 grid gap-12 py-6 sm:mt-52"
    >
      <SectionHeading
        step={SECTION_IDS.indexOf("open-source") + 1}
        total={SECTION_IDS.length}
        tag={m.oss_tag()}
        title={<span id="oss-heading">{m.oss_title()}</span>}
        intro={m.oss_intro()}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
        <OssCard.Root className="md:col-span-6 lg:col-span-4">
          <OssCard.Header name="stepperize">
            <OssCard.Stars count={stars.stepperize} />
            <OssCard.Downloads count={downloads["@stepperize/react"]} />
            <OssCard.Link
              href={repoUrl("stepperize")}
              label={m.oss_open_repo({ name: "stepperize" })}
            />
          </OssCard.Header>
          <OssCard.Description>{m.oss_stepperize_desc()}</OssCard.Description>
          <div className="grid gap-4 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
            <pre className="hidden overflow-x-auto rounded-2xl border bg-background/60 p-4 font-mono text-[12px] text-muted-foreground leading-relaxed xl:block">
              <code>{STEPPERIZE_SNIPPET}</code>
            </pre>
            <StepperizeDemo />
          </div>
          <OssCard.Footer>
            <InstallCommand command="npm i @stepperize/react" />
          </OssCard.Footer>
        </OssCard.Root>

        <OssCard.Root className="md:col-span-6 lg:col-span-2" delay={0.06}>
          <OssCard.Header name="radixcn">
            <OssCard.Stars count={stars.radixcn} />
            <OssCard.Link
              href="https://radixcn.com"
              label={m.oss_open_site({ name: "radixcn" })}
            />
          </OssCard.Header>
          <OssCard.Description>{m.oss_radixcn_desc()}</OssCard.Description>
          <RadixDemo />
        </OssCard.Root>

        <OssCard.Root className="md:col-span-3 lg:col-span-2">
          <OssCard.Header name="phonefield">
            <OssCard.Stars
              count={stars["shadcn-phone-input"] + stars.phonefield}
            />
            <OssCard.Link
              href="https://phonefield.vercel.app"
              label={m.oss_open_site({ name: "phonefield" })}
            />
          </OssCard.Header>
          <OssCard.Description>{m.oss_phone_desc()}</OssCard.Description>
          <div className="mt-auto">
            <Suspense fallback={<div className="h-[6.5rem]" />}>
              <PhoneDemo />
            </Suspense>
          </div>
        </OssCard.Root>

        <OssCard.Root className="md:col-span-3 lg:col-span-2" delay={0.06}>
          <OssCard.Header name="linear-combobox">
            <OssCard.Stars count={stars["shadcn-linear-combobox"]} />
            <OssCard.Link
              href={repoUrl("shadcn-linear-combobox")}
              label={m.oss_open_repo({ name: "shadcn-linear-combobox" })}
            />
          </OssCard.Header>
          <OssCard.Description>{m.oss_combobox_desc()}</OssCard.Description>
          <div className="mt-auto grid gap-2">
            <span className="font-medium text-sm">
              {m.oss_combobox_label()}
            </span>
            <PriorityDemo />
          </div>
        </OssCard.Root>

        <OssCard.Root className="md:col-span-6 lg:col-span-2" delay={0.12}>
          <OssCard.Header name="cal-com">
            <OssCard.Stars count={stars["shadcn-cal-com"]} />
            <OssCard.Link
              href="https://shadcn-cal-com.vercel.app"
              label={m.oss_open_site({ name: "shadcn-cal-com" })}
            />
          </OssCard.Header>
          <OssCard.Description>{m.oss_cal_desc()}</OssCard.Description>
          <OssCard.Footer>
            <CalTeaserButton />
          </OssCard.Footer>
        </OssCard.Root>
      </div>
    </section>
  );
}

function CalTeaserButton() {
  const { jump } = useFlow();
  return (
    <Button variant="outline" onClick={() => jump("contact")}>
      <CalendarIcon data-icon="inline-start" />
      {m.oss_cal_cta()}
    </Button>
  );
}

function InstallCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border bg-background/60 py-1 pr-1 pl-4 font-mono text-[13px] sm:flex-none">
      <code className="min-w-0 flex-1 truncate">
        <span className="text-muted-foreground">$ </span>
        {command}
      </code>
      <button
        type="button"
        aria-label={m.oss_copy_install()}
        onClick={async () => {
          if (!(await copyText(command))) return;
          setCopied(true);
          toast(m.oss_install_copied());
          window.setTimeout(() => setCopied(false), 1600);
        }}
        className="relative grid size-8 shrink-0 place-items-center rounded-lg border bg-card transition-[scale,background-color] duration-150 ease-out hover:bg-muted active:scale-[0.92]"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={copied ? "check" : "copy"}
            initial={{
              opacity: 0,
              transform: "scale(0.6)",
              filter: "blur(2px)",
            }}
            animate={{ opacity: 1, transform: "scale(1)", filter: "blur(0px)" }}
            exit={{ opacity: 0, transform: "scale(0.6)", filter: "blur(2px)" }}
            transition={{ type: "spring", duration: 0.28, bounce: 0 }}
          >
            {copied ? (
              <CheckIcon className="size-4 text-success" aria-hidden />
            ) : (
              <CopyIcon className="size-4" aria-hidden />
            )}
          </motion.span>
        </AnimatePresence>
      </button>
    </div>
  );
}
