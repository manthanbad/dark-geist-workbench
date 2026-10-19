import { apiRequest, unwrapItem, unwrapList } from "./api";
import type { CreateNoteInput, Note, UpdateNoteInput } from "@/types";

export const notesService = {
  list: async (projectId: string) =>
    unwrapList<Note>(await apiRequest(`/api/notes?projectId=${encodeURIComponent(projectId)}`), "notes"),
  create: async (input: CreateNoteInput) =>
    unwrapItem<Note>(await apiRequest("/api/notes", { method: "POST", body: input }), "note"),
  update: async (id: string, input: UpdateNoteInput) =>
    unwrapItem<Note>(await apiRequest(`/api/notes/${encodeURIComponent(id)}`, { method: "PATCH", body: input }), "note"),
  remove: (id: string) => apiRequest<unknown>(`/api/notes/${encodeURIComponent(id)}`, { method: "DELETE" }),
};
