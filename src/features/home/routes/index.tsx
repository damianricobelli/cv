import { createFileRoute } from "@tanstack/react-router";
import { MotionConfig } from "motion/react";
import { lazy, Suspense, useCallback, useState } from "react";
import { CareerSection } from "@/features/career/components/career-section";
import { ContactSection } from "@/features/contact/components/contact-section";
import {
  EggsProvider,
  useEggs,
} from "@/features/eggs/components/eggs-provider";
import { Hero } from "@/features/hero/components/hero";
import { OssSection } from "@/features/open-source/components/oss-section";
import { ossStatsQueryOptions } from "@/features/open-source/queries/options";
import { PaperBackground } from "@/features/paper/components/paper-background";
import { BlueprintMode } from "@/features/site/components/blueprint-mode";
import { FlowProvider } from "@/features/site/components/flow-provider";
import { SiteFooter } from "@/features/site/components/site-footer";
import { SiteHeader } from "@/features/site/components/site-header";
import { usePaletteShortcut } from "@/features/site/hooks/use-palette-shortcut";
import { buildSeoHead, profileJsonLd } from "@/lib/seo";
import { m } from "@/paraglide/messages";
import { getLocale } from "@/paraglide/runtime";

/** cmdk loads the first time the palette opens, not with the page. */
const CommandPalette = lazy(
  () => import("@/features/site/components/command-palette"),
);

/** The libraries named in structured data: the ones with real adoption. */
const PROJECTS = [
  {
    name: "Stepperize",
    url: "https://github.com/damianricobelli/stepperize",
    description: m.seo_project_stepperize,
  },
  {
    name: "shadcn-cal-com",
    url: "https://github.com/damianricobelli/shadcn-cal-com",
    description: m.seo_project_cal,
  },
  {
    name: "shadcn-phone-input",
    url: "https://github.com/damianricobelli/shadcn-phone-input",
    description: m.seo_project_phone,
  },
  {
    name: "radixcn",
    url: "https://github.com/damianricobelli/radixcn",
    description: m.seo_project_radixcn,
  },
];

export const Route = createFileRoute("/")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(ossStatsQueryOptions()),
  head: () => {
    const locale = getLocale();
    const description = m.meta_description();
    return {
      ...buildSeoHead({
        path: "/",
        locale,
        title: m.meta_title(),
        description,
        imageAlt: m.meta_image_alt(),
      }),
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(
            profileJsonLd({
              locale,
              description,
              jobTitle: m.meta_job_title(),
              projects: PROJECTS.map((project) => ({
                ...project,
                description: project.description(),
              })),
            }),
          ),
        },
      ],
    };
  },
  component: HomePage,
});

function HomePage() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteUsed, setPaletteUsed] = useState(false);
  if (paletteOpen && !paletteUsed) setPaletteUsed(true);
  const togglePalette = useCallback(
    (update: (open: boolean) => boolean) => setPaletteOpen(update),
    [],
  );
  usePaletteShortcut(togglePalette);

  return (
    // Every Motion animation on the page honors the visitor's reduced-motion setting.
    <MotionConfig reducedMotion="user">
      <EggsProvider>
        <FlowProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-foreground focus:px-3 focus:py-2 focus:text-background"
          >
            {m.skip_to_content()}
          </a>
          <HomePaper />
          <SiteHeader onOpenPalette={() => setPaletteOpen(true)} />
          <div className="page-gutter">
            <main id="main" className="mx-auto max-w-6xl">
              <Hero />
              <CareerSection />
              <OssSection />
              <ContactSection />
              <SiteFooter />
            </main>
          </div>
          {paletteUsed ? (
            <Suspense fallback={null}>
              <CommandPalette
                open={paletteOpen}
                onOpenChange={setPaletteOpen}
              />
            </Suspense>
          ) : null}
          <BlueprintMode />
        </FlowProvider>
      </EggsProvider>
    </MotionConfig>
  );
}

/** The page's paper; resting the light on its secret comment is an egg. */
function HomePaper() {
  const { find } = useEggs();
  return <PaperBackground onSecretFound={() => find("emboss")} />;
}
