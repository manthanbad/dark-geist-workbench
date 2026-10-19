import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/projects/$projectId")({
  head: () => ({ meta: [{ title: "Project — DevSphere AI" }, { name: "description", content: "Project details in DevSphere AI." }] }),
  component: () => <div className="p-8 text-sm text-muted-foreground">Project details coming next.</div>,
});
