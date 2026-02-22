import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { FixRequest } from "@/types/api";

// Active statuses that should be polled
const ACTIVE_STATUSES = new Set([
  "submitted",
  "triaging",
  "awaiting_payment",
  "in_progress",
  "deploying",
]);

/**
 * Polls a fix request's status every 5s while it's in an active state.
 */
export function useFixStatus(fixId: string | undefined) {
  return useQuery({
    queryKey: ["fix-status", fixId],
    queryFn: () => api.get<FixRequest>(`/fixes/${fixId}`),
    enabled: !!fixId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status && ACTIVE_STATUSES.has(status)) {
        return 5000; // poll every 5s
      }
      return false; // stop polling
    },
  });
}
