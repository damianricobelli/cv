export const baseLocale = "es" as const;

export const locales = [baseLocale, "en"] as const;

export type AppLocale = (typeof locales)[number];

/** BCP 47 tags for Intl formatting: dates and numbers read like the visitor's language. */
export const intlLocale: Record<AppLocale, string> = {
  es: "es-AR",
  en: "en-US",
};
