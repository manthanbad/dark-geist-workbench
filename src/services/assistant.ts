/**
 * AI Code Assistant integration layer.
 * The Python FastAPI RAG service is not deployed yet. Set VITE_RAG_API_BASE_URL
 * once it exists; until then the UI shows an "unavailable" state and never
 * fabricates answers.
 */
import type { ChatMessage, SourceReference } from "@/types";

export const RAG_API_BASE_URL = (import.meta.env["VITE_RAG_API_BASE_URL"] as string | undefined)?.replace(/\/$/, "") ?? null;

export const isAssistantAvailable = () => RAG_API_BASE_URL !== null;

export interface AskInput {
  projectId: string;
  question: string;
  history: Pick<ChatMessage, "role" | "content">[];
}

export interface AskResponse {
  answer: string;
  sources?: SourceReference[];
}

export async function askAssistant(input: AskInput, token: string): Promise<AskResponse> {
  if (!RAG_API_BASE_URL) throw new Error("The AI assistant service is not connected yet.");
  const res = await fetch(`${RAG_API_BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Assistant request failed (${res.status})`);
  return res.json();
}
