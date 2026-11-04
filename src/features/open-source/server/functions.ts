import { createServerFn } from "@tanstack/react-start";

/** RPC boundary: thin, read-only, no input. */
export const getOssStats = createServerFn({ method: "GET" }).handler(
  async () => {
    const { fetchOssStats } = await import("./stats");
    return fetchOssStats();
  },
);
