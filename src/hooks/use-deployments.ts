import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Deployment } from "@/types/api";

export function useDeployments(projectId: string | undefined) {
  return useQuery({
    queryKey: ["deployments", projectId],
    queryFn: () =>
      api.get<Deployment[]>(`/projects/${projectId}/deployments`),
    enabled: !!projectId,
  });
}

export function useTriggerDeploy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (projectId: string) =>
      api.post<Deployment>(`/projects/${projectId}/deployments`),
    onSuccess: (_, projectId) => {
      queryClient.invalidateQueries({
        queryKey: ["deployments", projectId],
      });
    },
  });
}

export function useRollback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (deploymentId: string) =>
      api.post<Deployment>(`/deployments/${deploymentId}/rollback`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deployments"] });
    },
  });
}
