import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { cloudflare } from "@cloudflare/vite-plugin";
import { paraglideVitePlugin } from "@inlang/paraglide-js";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

const appDirectory = fileURLToPath(new URL(".", import.meta.url));

/**
 * Base UI keeps the scripts that place server-rendered tab indicators behind a
 * `browser` import condition. The Worker renders with browser conditions too,
 * so on the server `#prehydration/*` resolves to the real script (same as Wonkka).
 */
function baseUiPrehydrationScripts(): Plugin {
  const packageMarker = "/@base-ui/react/";
  return {
    name: "landing:base-ui-prehydration-scripts",
    resolveId(source, importer) {
      if (!source.startsWith("#prehydration/") || !importer) return null;
      const at = importer.lastIndexOf(packageMarker);
      if (at < 0) return null;
      const packageRoot = importer.slice(0, at + packageMarker.length - 1);
      const imports = JSON.parse(
        readFileSync(join(packageRoot, "package.json"), "utf8"),
      ).imports as
        | Record<string, { default?: { import?: { default?: string } } }>
        | undefined;
      const target = imports?.[source]?.default?.import?.default;
      return target ? join(packageRoot, target) : null;
    },
  };
}

export default defineConfig({
  define: {
    // Sitemap `<lastmod>`: the page changes with deploys.
    "import.meta.env.BUILD_DATE": JSON.stringify(
      new Date().toISOString().slice(0, 10),
    ),
  },
  build: {
    // three.js lives in its own lazy chunk; the entry should stay well below this.
    chunkSizeWarningLimit: 900,
  },
  resolve: {
    tsconfigPaths: true,
    dedupe: ["react", "react-dom", "three"],
  },
  environments: {
    ssr: {
      optimizeDeps: {
        rolldownOptions: { plugins: [baseUiPrehydrationScripts()] },
      },
      build: {
        rolldownOptions: { output: { sourcemapExcludeSources: true } },
      },
    },
  },
  plugins: [
    paraglideVitePlugin({
      project: "./project.inlang",
      outdir: "./src/paraglide",
      strategy: ["url", "baseLocale"],
      // Physical message files, so `tsc` works without a dev server running.
      outputStructure:
        process.env.NODE_ENV === "production"
          ? "message-modules"
          : "locale-modules",
    }),
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    {
      ...baseUiPrehydrationScripts(),
      enforce: "pre",
      applyToEnvironment: (environment) => environment.name === "ssr",
    },
    tailwindcss(),
    tanstackStart({
      router: {
        generatedRouteTree: resolve(appDirectory, "src/routeTree.gen.ts"),
        routesDirectory: resolve(appDirectory, "src"),
        virtualRouteConfig: "./src/routes.ts",
      },
    }),
    viteReact(),
  ],
});
