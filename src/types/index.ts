export interface User {
  id: string;
  email: string;
  displayName: string;
  createdAt?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  displayName: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProjectInput {
  name: string;
  description: string;
}

export const TASK_STATUSES = ["todo", "in_progress", "done"] as const;
export const TASK_PRIORITIES = ["low", "medium", "high"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTaskInput {
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
}

export type UpdateTaskInput = Partial<Omit<CreateTaskInput, "projectId">>;

export interface Note {
  id: string;
  projectId: string;
  title: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateNoteInput {
  projectId: string;
  title: string;
  content: string;
}

export type UpdateNoteInput = Partial<Omit<CreateNoteInput, "projectId">>;

export type RepoIndexStatus = "pending" | "indexing" | "completed" | "failed";

export interface Repository {
  id: string;
  fullName: string;
  defaultBranch: string;
  status: RepoIndexStatus;
  lastIndexedAt: string | null;
  fileCount?: number;
  language?: string;
}

export interface SourceReference {
  path: string;
  startLine: number;
  endLine: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: SourceReference[];
  createdAt: string;
}
