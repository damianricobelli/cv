import { queryOptions } from "@tanstack/react-query";
import { getOssStats } from "../server/functions";
import { ossKeys } from "./keys";

export const ossStatsQueryOptions = () =>
  queryOptions({
    queryKey: ossKeys.stats(),
    queryFn: () => getOssStats(),
  });
