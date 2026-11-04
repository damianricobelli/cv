import "@tanstack/react-start/server-only";

import { env, waitUntil } from "cloudflare:workers";

/**
 * A Worker's own responses are not cached by Cloudflare's CDN, so expensive
 * ones (rendered images, the sitemap) are kept in `caches.default`, per data
 * center and per deploy. Same approach as Wonkka.
 */
type WorkerCache = Pick<Cache, "match" | "put">;

/** Absent where it is not bound (local dev): those render fresh. */
const workerCache = (): WorkerCache | undefined =>
  (globalThis as { caches?: { default?: WorkerCache } }).caches?.default;

/** This deploy's version id; absent in local dev. */
export function deploymentVersion(): string | null {
  const metadata = (env as { CF_VERSION_METADATA?: { id?: unknown } })
    .CF_VERSION_METADATA;
  return typeof metadata?.id === "string" ? metadata.id : null;
}

/**
 * A key on a host no request reaches. `parts` names everything that changes
 * the bytes; the deploy is always one of them.
 */
export function edgeCacheKey(
  name: string,
  parts: Record<string, string>,
  version: string,
): Request {
  const url = new URL(`https://edge-cache.internal/${name}`);
  for (const [key, value] of Object.entries(parts)) {
    url.searchParams.set(key, value);
  }
  url.searchParams.set("v", version);
  return new Request(url.toString());
}

/**
 * Serves `render()`'s 200 from the edge cache, rendering and storing it on a
 * miss. A cache that fails never fails the response.
 */
export async function cachedEdgeResponse(input: {
  key: Request | null;
  edgeTtlSeconds: number;
  browserCacheControl: string;
  render: () => Promise<Response>;
}): Promise<Response> {
  const cache = input.key ? workerCache() : undefined;
  const hit =
    input.key && cache
      ? await cache.match(input.key).catch(() => undefined)
      : undefined;
  if (hit) return forBrowser(hit, input.browserCacheControl);

  const response = await input.render();
  if (!input.key || !cache || response.status !== 200) {
    return response.status === 200
      ? forBrowser(response, input.browserCacheControl)
      : response;
  }
  const stored = response.clone();
  const headers = new Headers(stored.headers);
  headers.set("Cache-Control", `public, max-age=${input.edgeTtlSeconds}`);
  waitUntil(
    cache
      .put(input.key, new Response(stored.body, { status: 200, headers }))
      .catch(() => undefined),
  );
  return forBrowser(response, input.browserCacheControl);
}

function forBrowser(response: Response, cacheControl: string): Response {
  const copy = new Response(response.body, response);
  copy.headers.set("Cache-Control", cacheControl);
  return copy;
}
