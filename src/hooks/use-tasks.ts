import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { tasksService } from "@/services/tasks";
import type { CreateTaskInput, Project, Task, UpdateTaskInput } from "@/types";

export const taskKeys = {
  all: ["tasks"] as const,
  byProject: (projectId: string) => ["tasks", projectId] as const,
};

export function useTasks(projectId: string) {
  return useQuery({ queryKey: taskKeys.byProject(projectId), queryFn: () => tasksService.list(projectId), enabled: !!projectId });
}

/** Aggregates tasks across projects (the API lists tasks per project). */
export function useAllTasks(projects: Project[] | undefined) {
  return useQueries({
    queries: (projects ?? []).map((p) => ({
      queryKey: taskKeys.byProject(p.id),
      queryFn: () => tasksService.list(p.id),
    })),
    combine: (results) => ({
      data: results.flatMap((r) => r.data ?? []) as Task[],
      isLoading: results.some((r) => r.isLoading),
      isError: results.some((r) => r.isError),
    }),
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTaskInput) => tasksService.create(input),
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: taskKeys.byProject(v.projectId) }),
  });
}

export function useUpdateTask(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTaskInput }) => tasksService.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: taskKeys.byProject(projectId) }),
  });
}

export function useDeleteTask(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tasksService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: taskKeys.byProject(projectId) }),
  });
}
