import { physical, rootRoute, route } from "@tanstack/virtual-file-routes";

/** Each feature owns its pages; this file only registers their folders. */
const featureRoutes = [
  physical("features/home/routes"),
  route("/api/og-image", "features/seo/routes/api.og-image.ts"),
  route("/api/icon", "features/seo/routes/api.icon.ts"),
  route("/sitemap.xml", "features/seo/routes/sitemap.ts"),
];

export const routes = rootRoute("routes/__root.tsx", [...featureRoutes]);
