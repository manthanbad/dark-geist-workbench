import { apiRequest, unwrapItem, unwrapList } from "./api";
import type { CreateProjectInput, Project } from "@/types";

// The backend derives the owner from the JWT — never send userId.
export const projectsService = {
  list: async () => unwrapList<Project>(await apiRequest("/api/projects"), "projects"),
  create: async (input: CreateProjectInput) =>
    unwrapItem<Project>(await apiRequest("/api/projects", { method: "POST", body: input }), "project"),
};
