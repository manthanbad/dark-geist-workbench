import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — DevSphere AI" }, { name: "description", content: "Sign in to DevSphere AI." }] }),
  component: () => <div className="p-8 text-sm text-muted-foreground">Sign-in page coming next.</div>,
});
