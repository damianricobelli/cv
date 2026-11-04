import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { PaperBackground } from "@/features/paper/components/paper-background";
import { m } from "@/paraglide/messages";
import { localizeHref } from "@/paraglide/runtime";
import { SECTION_IDS, SECTION_LABEL } from "../flow";
import { ThemeToggle } from "./theme-toggle";

const MAX_PATH = 32;

/**
 * "This page was never printed." The paper is there without ink: the 404, the
 * path that was asked for and the routes that do exist are pressed into it,
 * and show only where the cursor's light rakes across. The routes are real
 * links in invisible ink, so they work by click, keyboard and screen reader.
 * Without WebGL the same text stays visible as faint ink.
 */
export function NotFound() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const path =
    pathname.length > MAX_PATH
      ? `${pathname.slice(0, MAX_PATH - 1)}…`
      : pathname;

  useEffect(() => {
    document.title = m.not_found_meta_title();
  }, []);

  return (
    <div className="page-gutter min-h-svh pt-[env(safe-area-inset-top)]">
      <meta name="robots" content="noindex, nofollow" />
      <PaperBackground />
      <header className="mx-auto flex h-(--header-h) max-w-6xl items-center justify-between">
        <Link
          to="/"
          aria-label="Damián Ricobelli"
          className="font-display font-extrabold text-2xl tracking-[-0.06em]"
        >
          dr<span className="text-a9">.</span>
        </Link>
        <ThemeToggle />
      </header>

      <main className="mx-auto grid max-w-6xl gap-8 pt-8 pb-[calc(env(safe-area-inset-bottom,0px)+4rem)] sm:pt-12">
        <div className="grid gap-3">
          <p className="font-mono text-muted-foreground text-sm">
            {m.not_found_eyebrow()}
          </p>
          <p
            data-emboss
            className="w-fit font-display font-extrabold text-[clamp(8rem,30vw,20rem)] leading-[0.8] tracking-[-0.06em]"
          >
            404
          </p>
          <p className="flex flex-wrap items-baseline gap-x-3 font-mono text-[clamp(1rem,2.4vw,1.4rem)]">
            <span className="sr-only">{m.not_found_requested()}:</span>
            <span data-emboss className="whitespace-nowrap">
              GET {path} → 404
            </span>
          </p>
        </div>

        <div className="grid gap-4">
          <h1 className="max-w-[18ch] text-balance font-display-tight text-[clamp(2.4rem,6vw,4.5rem)]">
            {m.not_found_title()}
          </h1>
          <p className="max-w-[52ch] text-pretty text-lg text-muted-foreground">
            {m.not_found_body()}
          </p>
        </div>

        <nav aria-label={m.not_found_hint()} className="grid gap-4">
          <ul className="flex flex-wrap gap-x-10 gap-y-4">
            {SECTION_IDS.map((id) => (
              <li key={id}>
                <a
                  data-emboss
                  href={`${localizeHref("/")}#${id}`}
                  aria-label={SECTION_LABEL[id]()}
                  className="rounded-sm font-medium font-mono text-[clamp(1.1rem,2.2vw,1.5rem)] outline-offset-4 focus-visible:text-foreground!"
                >
                  /#{id}
                </a>
              </li>
            ))}
          </ul>
          <p className="text-muted-foreground text-sm">{m.not_found_hint()}</p>
        </nav>

        <Link
          to="/"
          className="w-fit font-medium text-ink underline decoration-a7 decoration-2 underline-offset-4 transition-colors hover:decoration-a9"
        >
          {m.not_found_back()}
        </Link>
      </main>
    </div>
  );
}
