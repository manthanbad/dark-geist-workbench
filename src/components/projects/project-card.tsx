import { Link } from "@tanstack/react-router";
import { FolderKanban, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useTasks } from "@/hooks/use-tasks";
import { relative } from "@/lib/format";
import type { Project } from "@/types";

export function ProjectCard({ project }: { project: Project }) {
  const { data: tasks } = useTasks(project.id);
  const total = tasks?.length ?? 0;
  const done = tasks?.filter((t) => t.status === "done").length ?? 0;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="group surface relative flex flex-col p-4 transition-colors hover:border-primary/40">
      <div className="flex items-start justify-between gap-2">
        <div className="flex size-8 items-center justify-center rounded-md border bg-muted">
          <FolderKanban className="size-4 text-primary" />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative z-10 size-7" aria-label="Project actions">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Requires backend endpoint</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              <Pencil className="size-4" /> Edit (not connected)
            </DropdownMenuItem>
            <DropdownMenuItem disabled className="text-destructive">
              <Trash2 className="size-4" /> Delete (not connected)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Link to="/projects/$projectId" params={{ projectId: project.id }} className="mt-3 after:absolute after:inset-0">
        <h3 className="font-medium leading-tight">{project.name}</h3>
      </Link>
      <p className="mt-1 line-clamp-2 min-h-10 text-sm text-muted-foreground">{project.description || "No description"}</p>
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {done}/{total} tasks done
          </span>
          <span>{project.updatedAt ? `Updated ${relative(project.updatedAt)}` : ""}</span>
        </div>
        <Progress value={pct} className="h-1" />
      </div>
    </div>
  );
}
