import "@tanstack/react-start/server-only";

import { ImageResponse } from "takumi-js/response";
import { MONOGRAM_SVG } from "./monogram";

/** The "dr." monogram on full-bleed ink: iOS and Android mask the corners. */
const MARK = new TextEncoder().encode(MONOGRAM_SVG);

export const ICON_SIZES = [180, 192, 512] as const;
export type IconSize = (typeof ICON_SIZES)[number];

export async function renderIcon(size: IconSize): Promise<Response> {
  // The drawing already sits inside the maskable safe zone (central 80%).
  const mark = size;
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
