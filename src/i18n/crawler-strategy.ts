import {
  baseLocale,
  defineCustomServerStrategy,
  extractLocaleFromUrl,
} from "@/paraglide/runtime";

/** Search engines, link previews and other bots. */
const CRAWLER =
  /bot|crawl|spider|slurp|facebookexternalhit|embedly|preview|whatsapp|telegram|discord|linkedin|vercel|lighthouse|headless/i;

/**
 * Bots get the language of the URL they asked for: `/` is Spanish, `/en` is
 * English. Without this, a crawler sending `Accept-Language: en` would be
 * redirected from `/` and never index the Spanish page. People return
 * undefined and fall through to cookie and browser language.
 */
defineCustomServerStrategy("custom-crawler", {
  getLocale: (request) => {
    if (!request || !CRAWLER.test(request.headers.get("user-agent") ?? "")) {
      return undefined;
    }
    return extractLocaleFromUrl(request.url) ?? baseLocale;
  },
});
