import { getAccessToken } from "./session";

/** Base URL from env — never hardcode hosts elsewhere. */
export const API_BASE_URL = (import.meta.env["VITE_API_BASE_URL"] as string | undefined)?.replace(/\/$/, "") ?? "http://localhost:4000";

export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

type UnauthorizedHandler = () => void;
let onUnauthorized: UnauthorizedHandler | null = null;
export function setUnauthorizedHandler(fn: UnauthorizedHandler | null) {
  onUnauthorized = fn;
}

const FALLBACK_MESSAGES: Record<number, string> = {
  400: "The request was invalid. Please check your input.",
  401: "Your session has expired. Please sign in again.",
  403: "You don't have access to this resource.",
  404: "The requested resource was not found.",
  409: "This conflicts with existing data.",
  500: "The server ran into a problem. Please try again.",
};

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  auth?: boolean;
  signal?: AbortSignal;
}

export async function apiRequest<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true, signal } = opts;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = getAccessToken();
    if (!token) {
      onUnauthorized?.();
      throw new ApiError(401, FALLBACK_MESSAGES[401] ?? "Unauthorized");
    }
    headers["Authorization"] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : null,
      signal: signal ?? null,
    });
  } catch {
    throw new ApiError(0, `Can't reach the API at ${API_BASE_URL}. Is the server running?`);
  }

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    if (res.status === 401 && auth) onUnauthorized?.();
    const msg =
      (data && typeof data === "object" && ("message" in data || "error" in data)
        ? String((data as Record<string, unknown>)["message"] ?? (data as Record<string, unknown>)["error"])
        : null) ??
      FALLBACK_MESSAGES[res.status] ??
      `Request failed (${res.status})`;
    throw new ApiError(res.status, msg, data);
  }
  return data as T;
}

/** Accept either a bare array or an envelope like { projects: [...] } / { data: [...] }. */
export function unwrapList<T>(data: unknown, key: string): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    for (const k of [key, "data", "items"]) if (Array.isArray(obj[k])) return obj[k] as T[];
  }
  return [];
}

export function unwrapItem<T>(data: unknown, key: string): T {
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (obj[key] && typeof obj[key] === "object") return obj[key] as T;
    if (obj["data"] && typeof obj["data"] === "object" && !Array.isArray(obj["data"])) return obj["data"] as T;
  }
  return data as T;
}
