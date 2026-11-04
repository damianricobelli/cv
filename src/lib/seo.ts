import { type AppLocale, locales } from "@/i18n";
import { localizeUrl } from "@/paraglide/runtime";
import { PROFILE } from "./profile";

/** Production origin: canonicals, sitemaps and share cards always point here. */
export const SITE_ORIGIN = "https://damianricobelli.com";

export const OG_IMAGE_SIZE = { width: 1200, height: 630 } as const;

const OPEN_GRAPH_LOCALE: Record<AppLocale, string> = {
  es: "es_AR",
  en: "en_US",
};

/** Every page a crawler should know about. One for now: the site is one page. */
export const PUBLIC_PATHS = ["/"] as const;
export type PublicPath = (typeof PUBLIC_PATHS)[number];

export function pageUrl(path: string, locale: AppLocale): string {
  return localizeUrl(new URL(path, SITE_ORIGIN), { locale }).toString();
}

export function ogImageUrl(locale: AppLocale): string {
  return localizeUrl(new URL("/api/og-image", SITE_ORIGIN), {
    locale,
  }).toString();
}

/**
 * Head tags for an indexable page: canonical, one alternate per language plus
 * x-default, Open Graph (as a profile) and a large Twitter card.
 */
export function buildSeoHead({
  path,
  locale,
  title,
  description,
  imageAlt,
}: {
  path: PublicPath;
  locale: AppLocale;
  title: string;
  description: string;
  imageAlt: string;
}) {
  const canonical = pageUrl(path, locale);
  const image = ogImageUrl(locale);
  const [firstName, ...rest] = PROFILE.name.split(" ");

  return {
    meta: [
      { title },
      { name: "description", content: description },
      { name: "author", content: PROFILE.name },
      {
        name: "robots",
        content:
          "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
      },
      { property: "og:type", content: "profile" },
      { property: "profile:first_name", content: firstName },
      { property: "profile:last_name", content: rest.join(" ") },
      { property: "profile:username", content: PROFILE.handle },
      { property: "og:site_name", content: PROFILE.name },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: canonical },
      { property: "og:locale", content: OPEN_GRAPH_LOCALE[locale] },
      ...locales
        .filter((other) => other !== locale)
        .map((other) => ({
          property: "og:locale:alternate",
          content: OPEN_GRAPH_LOCALE[other],
        })),
      { property: "og:image", content: image },
      { property: "og:image:secure_url", content: image },
      { property: "og:image:type", content: "image/png" },
      { property: "og:image:width", content: String(OG_IMAGE_SIZE.width) },
      { property: "og:image:height", content: String(OG_IMAGE_SIZE.height) },
      { property: "og:image:alt", content: imageAlt },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: `@${PROFILE.handle}` },
      { name: "twitter:creator", content: `@${PROFILE.handle}` },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: image },
      { name: "twitter:image:alt", content: imageAlt },
    ],
    links: [
      { rel: "canonical", href: canonical },
      ...locales.map((alternate) => ({
        rel: "alternate",
        hrefLang: alternate,
        href: pageUrl(path, alternate),
      })),
      { rel: "alternate", hrefLang: "x-default", href: pageUrl(path, "es") },
      { rel: "me", href: PROFILE.github },
      { rel: "me", href: PROFILE.linkedin },
      { rel: "me", href: PROFILE.x },
    ],
  };
}

type ProjectFacts = { name: string; url: string; description: string };

/**
 * Structured data for the home page: a ProfilePage about a Person, the
 * WebSite it belongs to, and the libraries he maintains. Google uses
 * ProfilePage for name, photo and social links in results.
 */
export function profileJsonLd({
  locale,
  description,
  jobTitle,
  projects,
}: {
  locale: AppLocale;
  description: string;
  jobTitle: string;
  projects: ProjectFacts[];
}) {
  const url = pageUrl("/", locale);
  const personId = `${SITE_ORIGIN}/#person`;
  const websiteId = `${SITE_ORIGIN}/#website`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: SITE_ORIGIN,
        name: PROFILE.name,
        inLanguage: [...locales],
        publisher: { "@id": personId },
      },
      {
        "@type": "ProfilePage",
        "@id": `${url}#page`,
        url,
        name: PROFILE.name,
        description,
        inLanguage: locale,
        isPartOf: { "@id": websiteId },
        primaryImageOfPage: ogImageUrl(locale),
        mainEntity: { "@id": personId },
      },
      {
        "@type": "Person",
        "@id": personId,
        name: PROFILE.name,
        givenName: "Damián",
        familyName: "Ricobelli",
        alternateName: PROFILE.handle,
        url: SITE_ORIGIN,
        image: ogImageUrl(locale),
        email: `mailto:${PROFILE.email}`,
        jobTitle,
        description,
        worksFor: [
          { "@type": "Organization", name: "Urbs Data" },
          {
            "@type": "Organization",
            name: "Wonkka",
            url: "https://wonkka.app",
          },
        ],
        homeLocation: {
          "@type": "Place",
          address: { "@type": "PostalAddress", addressCountry: "AR" },
        },
        knowsLanguage: ["es", "en"],
        knowsAbout: [
          "React",
          "TypeScript",
          "TanStack",
          "Frontend architecture",
          "Design systems",
          "Developer experience",
          "Web performance",
          "Accessibility",
        ],
        sameAs: [PROFILE.github, PROFILE.linkedin, PROFILE.x],
        owns: projects.map((project) => ({
          "@type": "SoftwareSourceCode",
          name: project.name,
          codeRepository: project.url,
          description: project.description,
          programmingLanguage: "TypeScript",
          author: { "@id": personId },
        })),
      },
    ],
  };
}
