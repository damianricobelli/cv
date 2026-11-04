import { createFileRoute } from "@tanstack/react-router";

/** PNG app icons (apple-touch-icon, web manifest), drawn from the favicon. */
export const Route = createFileRoute("/api/icon")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { ICON_SIZES, renderIcon } = await import(
          "@/features/seo/server/icon"
        );
        const requested = Number(new URL(request.url).searchParams.get("size"));
        const size = ICON_SIZES.find((candidate) => candidate === requested);
        return size
          ? renderIcon(size)
          : new Response("Unknown icon size", { status: 404 });
      },
    },
  },
});
