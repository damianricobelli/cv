import { SectionHeading } from "@/components/section-heading";
import { SECTION_IDS } from "@/features/site/flow";
import { m } from "@/paraglide/messages";
import { CommitLog } from "./commit-log";

export function CareerSection() {
  return (
    <section
      id="career"
      data-bp="<section id=career>"
      aria-labelledby="career-heading"
      className="mt-36 grid gap-12 py-6 sm:mt-52"
    >
      <SectionHeading
        step={SECTION_IDS.indexOf("career") + 1}
        total={SECTION_IDS.length}
        tag={m.career_tag()}
        title={
          <span id="career-heading">
            {m.career_title_before()}{" "}
            <code className="whitespace-nowrap rounded-xl bg-a3 px-[0.22em] font-medium font-mono text-[0.78em] text-ink tracking-[-0.04em]">
              git log
            </code>
            .
          </span>
        }
        intro={m.career_intro()}
      />
      <CommitLog />
    </section>
  );
}
