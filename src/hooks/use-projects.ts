import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Project, ProjectStats } from "@/types/api";

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: () => api.get<Project[]>("/projects"),
  });
}

export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: ["projects", id],
    queryFn: () => api.get<Project>(`/projects/${id}`),
    enabled: !!id,
  });
}

export function useProjectStats(id: string | undefined) {
  return useQuery({
    queryKey: ["projects", id, "stats"],
    queryFn: () => api.get<ProjectStats>(`/projects/${id}/stats`),
    enabled: !!id,
  });
}

export function useCheckSubdomain(subdomain: string) {
  return useQuery({
    queryKey: ["subdomain-check", subdomain],
    queryFn: () =>
      api.get<{ available: boolean }>(
        `/projects/check-subdomain/${subdomain}`
      ),
    enabled: subdomain.length >= 3,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      githubRepoUrl?: string;
      supabaseUrl?: string;
      supabaseAnonKey?: string;
      subdomain?: string;
      customDomain?: string;
    }) => api.post<Project>("/projects", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<{
        name: string;
        customDomain: string;
        supabaseUrl: string;
        supabaseAnonKey: string;
      }>;
    }) => api.put<Project>(`/projects/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({
        queryKey: ["projects", variables.id],
      });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<{ success: boolean }>(`/projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
