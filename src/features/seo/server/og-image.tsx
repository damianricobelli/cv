import "@tanstack/react-start/server-only";

import { ImageResponse } from "takumi-js/response";
import { fetchOssStats } from "@/features/open-source/server/stats";
import { SECTION_IDS } from "@/features/site/flow";
import {
  cachedEdgeResponse,
  deploymentVersion,
  edgeCacheKey,
} from "@/lib/edge-cache";
import { formatNumber } from "@/lib/format";
import { OG_IMAGE_SIZE, SITE_ORIGIN } from "@/lib/seo";
import { m } from "@/paraglide/messages";
import { getLocale } from "@/paraglide/runtime";

/** What a crawler keeps; the edge copy is the Worker's own, per deploy. */
const BROWSER_CACHE_CONTROL = "public, max-age=3600";
const EDGE_TTL_SECONDS = 86_400;

const PAPER = "#f5f1e8";
const INK = "#141a2e";
const MUTED = "#5b6278";
const BLUE = "#3e63dd";

/** Fontsource static faces; Takumi reads the family name from each file. */
const font = (id: string, weight: number) =>
  `https://cdn.jsdelivr.net/fontsource/fonts/${id}@latest/latin-${weight}-normal.woff2`;
const FONTS = [
  font("bricolage-grotesque", 800),
  font("onest", 400),
  font("onest", 600),
  font("jetbrains-mono", 500),
];

/**
 * Blind emboss, as on the site's paper: the type is the paper's own color,
 * and only a highlight above and a shadow below draw it.
 */
const EMBOSS = {
  color: PAPER,
  textShadow:
    "-1px -1px 0 rgba(255,255,255,0.95), 1px 1.5px 0 rgba(90,70,30,0.28)",
};

/** The site's own definition, the same code the hero prints. */
const CODE = [
  "const site = defineStepper([",
  ...SECTION_IDS.map((id) => `  { id: "${id}" },`),
  "])",
];

function Card({ downloads }: { downloads: string }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "64px 72px 56px",
        backgroundColor: PAPER,
        color: INK,
        fontFamily: "Onest",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 196,
          right: 64,
          display: "flex",
          flexDirection: "column",
          fontFamily: "JetBrains Mono",
          fontSize: 19,
          lineHeight: 1.7,
          ...EMBOSS,
        }}
      >
        {CODE.map((line, index) => (
          <div
            key={index}
            style={{ display: "flex", whiteSpace: "pre", height: 34 }}
          >
            {line}
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          fontFamily: "JetBrains Mono",
          fontSize: 22,
          color: MUTED,
        }}
      >
        <div style={{ color: INK }}>{m.hero_now_label()}:</div>
        <div>{m.hero_now()}</div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          fontFamily: "Bricolage Grotesque",
          fontWeight: 800,
          fontSize: 164,
          lineHeight: 0.86,
          letterSpacing: "-7px",
        }}
      >
        <div>Damián</div>
        <div style={{ display: "flex" }}>
          Ricobelli<span style={{ color: BLUE }}>.</span>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 26,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ color: MUTED }}>{m.og_author()}</div>
          <div style={{ fontWeight: 600 }}>Stepperize</div>
          <div
            style={{
              display: "flex",
              padding: "6px 14px",
              borderRadius: 10,
              backgroundColor: "#e1e9ff",
              color: "#33468f",
              fontFamily: "JetBrains Mono",
              fontSize: 22,
            }}
          >
            {m.og_downloads({ count: downloads })}
          </div>
        </div>
        <div
          style={{ fontFamily: "JetBrains Mono", fontSize: 22, color: MUTED }}
        >
          {new URL(SITE_ORIGIN).host}
        </div>
      </div>
    </div>
  );
}

async function render(signal: AbortSignal): Promise<Response> {
  try {
    const stats = await fetchOssStats();
    const response = new ImageResponse(
      <Card downloads={formatNumber(stats.downloads["@stepperize/react"])} />,
      {
        ...OG_IMAGE_SIZE,
        format: "png",
        fonts: FONTS,
        signal,
      },
    );
    await response.ready;
    return response;
  } catch (error) {
    console.error("Failed to render the Open Graph image", error);
    return new Response("Unable to render the Open Graph image", {
      status: 500,
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }
}

/** Drawn once per data center, deploy and language. */
export function renderOpenGraphImage(request: Request): Promise<Response> {
  const version = deploymentVersion();
  return cachedEdgeResponse({
    key: version
      ? edgeCacheKey("og-image", { locale: getLocale() }, version)
      : null,
    edgeTtlSeconds: EDGE_TTL_SECONDS,
    browserCacheControl: BROWSER_CACHE_CONTROL,
    render: () => render(request.signal),
  });
}
