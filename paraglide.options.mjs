// @ts-check
/**
 * Paraglide's compile options, shared by the Vite plugin (dev and build) and
 * `pnpm paraglide` (typecheck), so both produce the same runtime.
 *
 * This is Paraglide's TanStack Start setup. Only English declares a URL, so
 * an unprefixed path is not claimed by "url": it falls through to the
 * visitor's saved choice (cookie), then the browser language
 * (Accept-Language), then Spanish. A prefixed /en URL always wins. The
 * middleware redirects document requests whose URL doesn't match the
 * resolved locale.
 *
 * Crawlers and the machine endpoints are exempt from detection (below), so
 * search engines index `/` in Spanish and `/en` in English.
 *
 * @satisfies {Partial<import("@inlang/paraglide-js").CompilerOptions>}
 */
export const paraglideOptions = {
  project: "./project.inlang",
  outdir: "./src/paraglide",
  // `custom-crawler` (src/i18n/crawler-strategy.ts) answers first for bots:
  // they get the language of the URL they asked for and are never redirected.
  strategy: [
    "custom-crawler",
    "url",
    "cookie",
    "preferredLanguage",
    "baseLocale",
  ],
  urlPatterns: [
    { pattern: "/:path(.*)?", localized: [["en", "/en/:path(.*)?"]] },
  ],
  // Machine endpoints speak the language of their URL only: the share card
  // of the Spanish page is Spanish whatever the crawler's Accept-Language.
  routeStrategies: [
    { match: "/api/:path(.*)?", strategy: ["url", "baseLocale"] },
    { match: "/sitemap.xml", strategy: ["url", "baseLocale"] },
  ],
};
