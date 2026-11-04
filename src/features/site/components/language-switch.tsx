import { homeHref, rememberLocale } from "@/i18n/switch-locale";
import { cn } from "@/lib/utils";
import { m } from "@/paraglide/messages";
import { getLocale, locales } from "@/paraglide/runtime";

const NAME = { es: "Español", en: "English" } as const;

/**
 * Both languages side by side, the current one filled: it says where you
 * are, not where a click takes you. Each is a real link; the click also
 * saves the choice so `/` keeps it on the next visit.
 */
export function LanguageSwitch({ className }: { className?: string }) {
  const current = getLocale();
  return (
    <nav
      aria-label={m.header_language()}
      className={cn(
        "flex h-8 shrink-0 items-center rounded-full border bg-card/70 p-0.5 font-medium font-mono text-[11px]",
        className,
      )}
    >
      {locales.map((locale) => {
        const active = locale === current;
        return (
          <a
            key={locale}
            href={homeHref(locale)}
            hrefLang={locale}
            lang={locale}
            aria-label={NAME[locale]}
            aria-current={active ? "true" : undefined}
            onClick={() => rememberLocale(locale)}
            className={cn(
              "grid h-full min-w-8 place-items-center rounded-full px-1.5 uppercase transition-[background-color,color] duration-150 ease-out",
              active
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {locale}
          </a>
        );
      })}
    </nav>
  );
}
