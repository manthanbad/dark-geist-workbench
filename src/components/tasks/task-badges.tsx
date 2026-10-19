import { ArrowDown, ArrowRight, ArrowUp, Circle, CircleCheck, CircleDot } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TaskPriority, TaskStatus } from "@/types";

export const STATUS_META: Record<TaskStatus, { label: string; icon: typeof Circle; className: string }> = {
  todo: { label: "Todo", icon: Circle, className: "text-muted-foreground border-border bg-muted/50" },
  in_progress: { label: "In progress", icon: CircleDot, className: "text-info border-info/30 bg-info/10" },
  done: { label: "Done", icon: CircleCheck, className: "text-success border-success/30 bg-success/10" },
};

export const PRIORITY_META: Record<TaskPriority, { label: string; icon: typeof ArrowUp; className: string }> = {
  low: { label: "Low", icon: ArrowDown, className: "text-muted-foreground" },
  medium: { label: "Medium", icon: ArrowRight, className: "text-warning" },
  high: { label: "High", icon: ArrowUp, className: "text-destructive" },
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  const m = STATUS_META[status] ?? STATUS_META.todo;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-xs font-medium", m.className)}>
      <m.icon className="size-3" />
      {m.label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const m = PRIORITY_META[priority] ?? PRIORITY_META.medium;
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-medium", m.className)}>
      <m.icon className="size-3" />
      {m.label}
    </span>
  );
}
