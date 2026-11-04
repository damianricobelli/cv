/** Repositories and npm packages whose numbers the page shows. */
export const REPOS = [
  "stepperize",
  "shadcn-cal-com",
  "shadcn-phone-input",
  "shadcn-linear-combobox",
  "radixcn",
  "phonefield",
] as const;
export type Repo = (typeof REPOS)[number];

export const PACKAGES = ["@stepperize/react", "phonefield"] as const;
export type Package = (typeof PACKAGES)[number];

export type OssStats = {
  stars: Record<Repo, number>;
  downloads: Record<Package, number>;
};

/**
 * Last known values (November 2026). Used when GitHub or npm don't answer in
 * time, so the page never renders an empty number.
 */
export const FALLBACK_STATS: OssStats = {
  stars: {
    stepperize: 1610,
    "shadcn-cal-com": 441,
    "shadcn-phone-input": 277,
    "shadcn-linear-combobox": 267,
    radixcn: 11,
    phonefield: 6,
  },
  downloads: {
    "@stepperize/react": 740311,
    phonefield: 1755,
  },
};

export const GITHUB_USER = "damianricobelli";
export const repoUrl = (repo: Repo) =>
  `https://github.com/${GITHUB_USER}/${repo}`;
