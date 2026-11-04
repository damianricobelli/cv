import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/og-image")({
  server: {
    handlers: {
      HEAD: () =>
        new Response(null, {
          headers: {
            "Cache-Control": "public, max-age=3600",
            "Content-Type": "image/png",
          },
        }),
      // The renderer (and Takumi's WASM) loads only for this route.
      GET: async ({ request }) => {
        const { renderOpenGraphImage } = await import(
          "@/features/seo/server/og-image"
        );
        return renderOpenGraphImage(request);
      },
    },
  },
});
