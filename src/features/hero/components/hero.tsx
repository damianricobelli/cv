import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowDownIcon, ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { EGG_IDS } from "@/features/eggs/types";
import { ossStatsQueryOptions } from "@/features/open-source/queries/options";
import { useFlow } from "@/features/site/components/flow-provider";
import { formatNumber } from "@/lib/format";
import { m } from "@/paraglide/messages";
import { HeroCode } from "./hero-code";
import { HeroName } from "./hero-name";

export function Hero() {
  const { jump } = useFlow();
  const { data } = useSuspenseQuery(ossStatsQueryOptions());

  return (
    <section
      id="intro"
      data-bp="<section id=intro>"
      aria-labelledby="intro-title"
      className="grid gap-10 pt-10 pb-6 sm:pt-16 lg:gap-14"
    >
      <p
        id="intro-title"
        className="hero-in flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-muted-foreground text-xs sm:text-sm"
        style={{ "--delay": "0s" } as React.CSSProperties}
      >
        <span className="text-foreground">{m.hero_role()}</span>
        <span aria-hidden className="h-px w-6 bg-border" />
        <span>
          <span className="text-ink">{m.hero_now_label()}:</span> {m.hero_now()}
        </span>
      </p>

      <HeroName />

      <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16">
        <div className="grid gap-8">
          <div
            className="hero-in grid gap-5"
            style={{ "--delay": "0.5s" } as React.CSSProperties}
          >
            <p className="max-w-[46ch] text-pretty text-[clamp(1.15rem,1.9vw,1.4rem)] leading-[1.5]">
              {m.hero_lead()}
            </p>
            <p className="max-w-[52ch] text-muted-foreground">
              {m.hero_oss_author()}{" "}
              <a
                href="https://stepperize.com"
                target="_blank"
                rel="noopener"
                className="font-medium text-foreground underline decoration-a7 decoration-2 underline-offset-4 transition-colors hover:decoration-a9"
              >
                Stepperize
              </a>
              ,{" "}
              <span className="rounded-md bg-a3 px-1.5 py-0.5 font-medium font-mono text-[0.92em] text-ink tabular-nums">
                {formatNumber(data.downloads["@stepperize/react"])}
              </span>{" "}
              {m.hero_oss_downloads()}
            </p>
          </div>

          <div
            className="hero-in flex flex-wrap items-center gap-3"
            style={{ "--delay": "0.62s" } as React.CSSProperties}
          >
            <Button size="lg" onClick={() => jump("contact")}>
              {m.hero_cta_contact()}
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => jump("career")}>
              {m.hero_cta_career()}
              <ArrowDownIcon data-icon="inline-end" />
            </Button>
            <span className="hidden items-center gap-1.5 pl-2 text-muted-foreground text-sm md:flex">
              <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
              {m.hero_palette_hint()}
            </span>
          </div>
        </div>

        <div
          className="hero-in grid gap-4 lg:pt-2"
          style={{ "--delay": "0.74s" } as React.CSSProperties}
        >
          <HeroCode />
          <p className="px-1 text-muted-foreground text-sm">
            {m.hero_eggs_hint({ count: EGG_IDS.length })}
          </p>
        </div>
      </div>
    </section>
  );
}
