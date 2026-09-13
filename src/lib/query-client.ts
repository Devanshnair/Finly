import { QueryClient } from "@tanstack/react-query";

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 10 * 1000, // 10 seconds
        refetchOnWindowFocus: true,
        retry: 2,
      },
    },
  });
}
