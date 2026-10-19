import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { notesService } from "@/services/notes";
import type { CreateNoteInput, Note, Project, UpdateNoteInput } from "@/types";

export const noteKeys = {
  byProject: (projectId: string) => ["notes", projectId] as const,
};

export function useNotes(projectId: string) {
  return useQuery({ queryKey: noteKeys.byProject(projectId), queryFn: () => notesService.list(projectId), enabled: !!projectId });
}

export function useAllNotes(projects: Project[] | undefined) {
  return useQueries({
    queries: (projects ?? []).map((p) => ({
      queryKey: noteKeys.byProject(p.id),
      queryFn: () => notesService.list(p.id),
    })),
    combine: (results) => ({
      data: results.flatMap((r) => r.data ?? []) as Note[],
      isLoading: results.some((r) => r.isLoading),
      isError: results.some((r) => r.isError),
    }),
  });
}

export function useCreateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateNoteInput) => notesService.create(input),
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: noteKeys.byProject(v.projectId) }),
  });
}

export function useUpdateNote(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateNoteInput }) => notesService.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: noteKeys.byProject(projectId) }),
  });
}

export function useDeleteNote(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notesService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: noteKeys.byProject(projectId) }),
  });
}
