import { apiRequest } from "./api";
import type { AuthResponse, LoginInput, RegisterInput } from "@/types";

export const authService = {
  register: (input: RegisterInput) =>
    apiRequest<AuthResponse>("/api/auth/register", { method: "POST", body: input, auth: false }),
  login: (input: LoginInput) =>
    apiRequest<AuthResponse>("/api/auth/login", { method: "POST", body: input, auth: false }),
};
