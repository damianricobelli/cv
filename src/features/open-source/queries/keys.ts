export const ossKeys = {
  all: ["open-source"] as const,
  stats: () => [...ossKeys.all, "stats"] as const,
};
