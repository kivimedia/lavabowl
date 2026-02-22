import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { FixRequest } from "@/types/api";

export function useFixes(projectId: string | undefined) {
  return useQuery({
    queryKey: ["fixes", projectId],
    queryFn: () => api.get<FixRequest[]>(`/projects/${projectId}/fixes`),
    enabled: !!projectId,
  });
}

export function useFix(id: string | undefined) {
  return useQuery({
    queryKey: ["fix", id],
    queryFn: () => api.get<FixRequest>(`/fixes/${id}`),
    enabled: !!id,
  });
}

export function useSubmitFix() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectId,
      description,
    }: {
      projectId: string;
      description: string;
    }) =>
      api.post<FixRequest>(`/projects/${projectId}/fixes`, { description }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["fixes", variables.projectId],
      });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useConfirmFix() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (fixId: string) =>
      api.post<FixRequest>(`/fixes/${fixId}/confirm`),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["fixes", data.projectId],
      });
      queryClient.invalidateQueries({ queryKey: ["fix", data.id] });
    },
  });
}

export function useApproveFix() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (fixId: string) =>
      api.post<FixRequest>(`/fixes/${fixId}/approve`),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["fixes", data.projectId],
      });
      queryClient.invalidateQueries({ queryKey: ["fix", data.id] });
    },
  });
}

export function useRejectFix() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (fixId: string) =>
      api.post<FixRequest>(`/fixes/${fixId}/reject`),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["fixes", data.projectId],
      });
      queryClient.invalidateQueries({ queryKey: ["fix", data.id] });
    },
  });
}
