import "@tanstack/react-start/server-only";

import { ImageResponse } from "takumi-js/response";

/** The favicon's stair (a stepper's steps) on full-bleed ink: iOS and Android mask the corners. */
const MARK = new TextEncoder().encode(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M14 46h9v-9h9v-9h9v-9h9" fill="none" stroke="#f5f1e8" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="50" cy="13" r="5" fill="#3e63dd"/></svg>`,
);

export const ICON_SIZES = [180, 192, 512] as const;
export type IconSize = (typeof ICON_SIZES)[number];

export async function renderIcon(size: IconSize): Promise<Response> {
  // The mark sits inside the maskable safe zone (the central 80%).
  const mark = Math.round(size * 0.72);
  const response = new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#141a2e",
      }}
    >
      <img src="mark" width={mark} height={mark} alt="" />
    </div>,
    {
      width: size,
      height: size,
      format: "png",
      images: [{ src: "mark", data: MARK }],
      headers: { "Cache-Control": "public, max-age=604800, immutable" },
    },
  );
  await response.ready;
  return response;
}
