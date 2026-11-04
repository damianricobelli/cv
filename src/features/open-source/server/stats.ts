import "@tanstack/react-start/server-only";
import {
  FALLBACK_STATS,
  GITHUB_USER,
  type OssStats,
  PACKAGES,
  type Package,
  REPOS,
  type Repo,
} from "../types";

const TIMEOUT_MS = 1500;
/** Cloudflare caches each upstream answer for an hour at the edge. */
const EDGE_CACHE = { cacheTtl: 3600, cacheEverything: true } as const;

async function getJson(url: string): Promise<unknown> {
  const response = await fetch(url, {
    headers: {
      accept: "application/json",
      "user-agent": "damianricobelli.com",
    },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cf: EDGE_CACHE,
  } as RequestInit);
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.json();
}

async function repoStars(repo: Repo): Promise<number> {
  try {
    const data = await getJson(
      `https://api.github.com/repos/${GITHUB_USER}/${repo}`,
    );
    const stars = (data as { stargazers_count?: unknown }).stargazers_count;
    return typeof stars === "number" ? stars : FALLBACK_STATS.stars[repo];
  } catch {
    return FALLBACK_STATS.stars[repo];
  }
}

async function monthlyDownloads(pkg: Package): Promise<number> {
  try {
    const data = await getJson(
      `https://api.npmjs.org/downloads/point/last-month/${pkg}`,
    );
    const downloads = (data as { downloads?: unknown }).downloads;
    return typeof downloads === "number"
      ? downloads
      : FALLBACK_STATS.downloads[pkg];
  } catch {
    return FALLBACK_STATS.downloads[pkg];
  }
}

/** Every request runs in parallel; a slow or failing one falls back alone. */
export async function fetchOssStats(): Promise<OssStats> {
  const [stars, downloads] = await Promise.all([
    Promise.all(
      REPOS.map(async (repo) => [repo, await repoStars(repo)] as const),
    ),
    Promise.all(
      PACKAGES.map(async (pkg) => [pkg, await monthlyDownloads(pkg)] as const),
    ),
  ]);
  return {
    stars: Object.fromEntries(stars) as OssStats["stars"],
    downloads: Object.fromEntries(downloads) as OssStats["downloads"],
  };
}
