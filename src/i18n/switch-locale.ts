import {
  cookieMaxAge,
  cookieName,
  type Locale,
  localizeHref,
} from "@/paraglide/runtime";

/** The home page in `locale`: `/` for Spanish, `/en/` for English. */
export const homeHref = (locale: Locale) => localizeHref("/", { locale });

/**
 * Saves the visitor's choice where the server reads it first (Paraglide's
 * cookie strategy), so `/` stops following the browser language. Paraglide's
 * own `setLocale` can't drop the `/en` prefix here, because Spanish has no
 * URL pattern of its own; the switch is a plain link plus this cookie.
 */
export function rememberLocale(locale: Locale) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  // biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API is not in Safari; this is Paraglide's own cookie.
  document.cookie = `${cookieName}=${locale}; Path=/; Max-Age=${cookieMaxAge}; SameSite=Lax${secure}`;
}

export function switchLocale(locale: Locale) {
  rememberLocale(locale);
  window.location.assign(homeHref(locale));
}
