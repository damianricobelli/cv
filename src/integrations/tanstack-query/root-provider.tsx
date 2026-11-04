import { QueryClient } from "@tanstack/react-query";

export function getContext() {
  const queryClient = new QueryClient({
    defaultOptions: {
      // Public stats change slowly; a visit never needs to refetch them.
      queries: { staleTime: 60 * 60 * 1000, retry: 1 },
    },
  });
  return { queryClient };
}
