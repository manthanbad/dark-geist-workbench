import { CalendarDays, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUpdateTask } from "@/hooks/use-tasks";
import { errorMessage, isOverdue, shortDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { TASK_PRIORITIES, TASK_STATUSES, type Task, type TaskPriority, type TaskStatus } from "@/types";
import { PRIORITY_META, PriorityBadge, STATUS_META, StatusBadge } from "./task-badges";

export function TaskRow({
  task,
  onEdit,
  onDelete,
  projectName,
}: {
  task: Task;
  onEdit?: (t: Task) => void;
  onDelete?: (t: Task) => void;
  projectName?: string;
}) {
  const update = useUpdateTask(task.projectId);
  const set = (input: { status?: TaskStatus; priority?: TaskPriority }) =>
    update.mutate({ id: task.id, input }, { onError: (e) => toast.error(errorMessage(e)) });

  const overdue = task.status !== "done" && isOverdue(task.dueDate);
  return (
    <div className={cn("flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-accent/40", update.isPending && "opacity-60")}>
      <div className="min-w-0 flex-1">
        <p className={cn("truncate text-sm", task.status === "done" && "text-muted-foreground line-through")}>{task.title}</p>
        {(projectName || task.description) && (
          <p className="truncate text-xs text-muted-foreground">{projectName ?? task.description}</p>
        )}
      </div>
      {task.dueDate && (
        <span className={cn("hidden items-center gap-1 text-xs sm:inline-flex", overdue ? "text-destructive" : "text-muted-foreground")}>
          <CalendarDays className="size-3" />
          {shortDate(task.dueDate)}
        </span>
      )}
      <div className="hidden w-20 sm:block"><PriorityBadge priority={task.priority} /></div>
      <StatusBadge status={task.status} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-7" aria-label={`Actions for ${task.title}`}>
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Status</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup value={task.status} onValueChange={(v) => set({ status: v as TaskStatus })}>
                {TASK_STATUSES.map((s) => (
                  <DropdownMenuRadioItem key={s} value={s}>{STATUS_META[s].label}</DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Priority</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup value={task.priority} onValueChange={(v) => set({ priority: v as TaskPriority })}>
                {TASK_PRIORITIES.map((p) => (
                  <DropdownMenuRadioItem key={p} value={p}>{PRIORITY_META[p].label}</DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          {(onEdit || onDelete) && <DropdownMenuSeparator />}
          {onEdit && (
            <DropdownMenuItem onSelect={() => onEdit(task)}>
              <Pencil className="size-4" /> Edit
            </DropdownMenuItem>
          )}
          {onDelete && (
            <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={() => onDelete(task)}>
              <Trash2 className="size-4" /> Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
