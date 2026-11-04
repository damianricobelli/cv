import bricolageLatin from "@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-wght-normal.woff2?url";
import onestLatin from "@fontsource-variable/onest/files/onest-latin-wght-normal.woff2?url";
import type { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { NotFound } from "@/features/site/components/not-found";
import { THEME_COLORS } from "@/hooks/use-theme-mode";
import { m } from "@/paraglide/messages";
import { getLocale } from "@/paraglide/runtime";
import appCss from "../styles.css?url";

interface RouterContext {
  queryClient: QueryClient;
}

/**
 * Runs before first paint: the stored theme and accent scale are on <html>
 * before anything renders, so a dark-mode visitor never sees a cream flash.
 */
const PREFERENCES_INIT_SCRIPT = `(function(){try{var root=document.documentElement;var stored=localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'light';var dark=matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(dark?'dark':'light'):mode;root.classList.add(resolved);if(mode!=='auto')root.setAttribute('data-theme',mode);root.style.colorScheme=resolved;var accent=localStorage.getItem('accent');if(accent&&/^[a-z]+$/.test(accent))root.setAttribute('data-accent',accent);var meta=document.createElement('meta');meta.name='theme-color';meta.content=resolved==='dark'?${JSON.stringify(THEME_COLORS.dark)}:${JSON.stringify(THEME_COLORS.light)};document.head.appendChild(meta);}catch(e){}})();`;

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: () => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("lang", getLocale());
    }
  },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content:
          "width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content",
      },
      { name: "color-scheme", content: "light dark" },
      { title: m.meta_title() },
    ],
    links: [
      // Both faces are in the first paint (name and body); preloading them
      // avoids a reflow when the fallback swaps out.
      {
        rel: "preload",
        href: onestLatin,
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      {
        rel: "preload",
        href: bricolageLatin,
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/api/icon?size=180" },
      { rel: "manifest", href: "/site.webmanifest" },
    ],
  }),
  notFoundComponent: NotFound,
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang={getLocale()} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: PREFERENCES_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body>
        {children}
        <Toaster
          position="bottom-center"
          mobileOffset={{
            bottom: "calc(env(safe-area-inset-bottom, 0px) + 16px)",
          }}
        />
        <Scripts />
      </body>
    </html>
  );
}
