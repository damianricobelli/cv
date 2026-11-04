import { createFileRoute } from "@tanstack/react-router";
import { locales } from "@/i18n";
import { PUBLIC_PATHS, pageUrl } from "@/lib/seo";

const escapeXml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

/** One entry per page, each listing every language and an x-default. */
function sitemapXml(): string {
  const lastmod = import.meta.env.BUILD_DATE
    ? `<lastmod>${import.meta.env.BUILD_DATE}</lastmod>`
    : "";
  const entries = PUBLIC_PATHS.flatMap((path) =>
    locales.map((locale) => {
      const alternates = locales
        .map(
          (alternate) =>
            `<xhtml:link rel="alternate" hreflang="${alternate}" href="${escapeXml(pageUrl(path, alternate))}"/>`,
        )
        .join("");
      return `<url><loc>${escapeXml(pageUrl(path, locale))}</loc>${lastmod}${alternates}<xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(pageUrl(path, "es"))}"/></url>`;
    }),
  ).join("");
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${entries}</urlset>`;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: () =>
        new Response(sitemapXml(), {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        }),
    },
  },
});
