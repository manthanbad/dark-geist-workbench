import { apiRequest, unwrapItem, unwrapList } from "./api";
import type { CreateTaskInput, Task, UpdateTaskInput } from "@/types";

export const tasksService = {
  list: async (projectId: string) =>
    unwrapList<Task>(await apiRequest(`/api/tasks?projectId=${encodeURIComponent(projectId)}`), "tasks"),
  create: async (input: CreateTaskInput) =>
    unwrapItem<Task>(await apiRequest("/api/tasks", { method: "POST", body: input }), "task"),
  update: async (id: string, input: UpdateTaskInput) =>
    unwrapItem<Task>(await apiRequest(`/api/tasks/${encodeURIComponent(id)}`, { method: "PATCH", body: input }), "task"),
  remove: (id: string) => apiRequest<unknown>(`/api/tasks/${encodeURIComponent(id)}`, { method: "DELETE" }),
};
