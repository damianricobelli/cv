import { ArrowUpRightIcon, DownloadIcon, StarIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { Reveal } from "@/components/reveal";
import { formatCompact } from "@/lib/format";
import { cn } from "@/lib/utils";
import { m } from "@/paraglide/messages";

/**
 * A library card, composed from parts instead of configured with flags:
 * each demo picks the meta it has (stars, downloads, links) and its own body.
 */
function Root({
  className,
  children,
  delay,
  ...props
}: ComponentProps<"article"> & { delay?: number }) {
  return (
    <Reveal delay={delay} className={cn("min-w-0", className)}>
      <article
        data-bp="<OssCard>"
        className="flex h-full flex-col gap-5 rounded-[1.5rem] border bg-card p-5 shadow-sm sm:p-6"
        {...props}
      >
        {children}
      </article>
    </Reveal>
  );
}

function Header({ name, children }: { name: string; children?: ReactNode }) {
  return (
    <header className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <h3 className="font-mono font-semibold text-[15px]">{name}</h3>
      <div className="ml-auto flex items-center gap-1.5">{children}</div>
    </header>
  );
}

function Stars({ count }: { count: number }) {
  return (
    <span
      className="inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 font-mono text-muted-foreground text-xs tabular-nums"
      title={m.oss_stars({ count })}
    >
      <StarIcon className="size-3.5 fill-current" aria-hidden />
      <span aria-hidden>{formatCompact(count)}</span>
      <span className="sr-only">{m.oss_stars({ count })}</span>
    </span>
  );
}

function Downloads({ count }: { count: number }) {
  return (
    <span
      className="inline-flex h-7 items-center gap-1.5 rounded-full border border-a6 bg-a3 px-2.5 font-mono text-ink text-xs tabular-nums"
      title={m.oss_downloads({ count })}
    >
      <DownloadIcon className="size-3.5" aria-hidden />
      <span aria-hidden>
        {formatCompact(count)} {m.oss_per_month()}
      </span>
      <span className="sr-only">{m.oss_downloads({ count })}</span>
    </span>
  );
}

function Link({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      aria-label={label}
      className="grid size-9 place-items-center rounded-lg border transition-[background-color,scale] duration-150 ease-out hover:bg-muted active:scale-[0.95]"
    >
      <ArrowUpRightIcon className="size-4" aria-hidden />
    </a>
  );
}

function Description({ children }: { children: ReactNode }) {
  return (
    <p className="max-w-[56ch] text-pretty text-muted-foreground leading-relaxed">
      {children}
    </p>
  );
}

function Footer({ className, ...props }: ComponentProps<"footer">) {
  return (
    <footer
      className={cn("mt-auto flex flex-wrap items-center gap-2", className)}
      {...props}
    />
  );
}

export const OssCard = {
  Root,
  Header,
  Stars,
  Downloads,
  Link,
  Description,
  Footer,
};
