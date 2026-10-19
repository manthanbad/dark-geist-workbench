import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { projectsService } from "@/services/projects";
import type { CreateProjectInput } from "@/types";

export const projectKeys = { all: ["projects"] as const };

export function useProjects() {
  return useQuery({ queryKey: projectKeys.all, queryFn: projectsService.list });
}

export function useProject(projectId: string) {
  const q = useProjects();
  return { ...q, project: q.data?.find((p) => p.id === projectId) };
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProjectInput) => projectsService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: projectKeys.all }),
  });
}
