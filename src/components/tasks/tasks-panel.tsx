import { useMemo, useState } from "react";
import { ListTodo, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/common/states";
import { useDeleteTask, useTasks } from "@/hooks/use-tasks";
import { errorMessage } from "@/lib/format";
import { TASK_PRIORITIES, TASK_STATUSES, type Task } from "@/types";
import { PRIORITY_META, STATUS_META } from "./task-badges";
import { TaskFormDialog } from "./task-form-dialog";
import { TaskRow } from "./task-row";

export function TasksPanel({ projectId }: { projectId: string }) {
  const { data, isLoading, error, refetch } = useTasks(projectId);
  const del = useDeleteTask(projectId);
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState<Task | null>(null);

  const filtered = useMemo(
    () => (data ?? []).filter((t) => (status === "all" || t.status === status) && (priority === "all" || t.priority === priority)),
    [data, status, priority],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="h-8 w-36" aria-label="Filter by status"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {TASK_STATUSES.map((s) => <SelectItem key={s} value={s}>{STATUS_META[s].label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger className="h-8 w-36" aria-label="Filter by priority"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            {TASK_PRIORITIES.map((p) => <SelectItem key={p} value={p}>{PRIORITY_META[p].label}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex-1" />
        <Button size="sm" onClick={() => { setEditing(null); setFormOpen(true); }}>
          <Plus className="size-4" /> New task
        </Button>
      </div>

      {isLoading ? (
        <ListSkeleton />
      ) : error ? (
        <ErrorState message={errorMessage(error)} onRetry={() => refetch()} />
      ) : !data?.length ? (
        <EmptyState icon={ListTodo} title="No tasks yet" description="Break this project into actionable tasks with priorities and due dates." action={<Button size="sm" onClick={() => setFormOpen(true)}><Plus className="size-4" /> Create first task</Button>} />
      ) : !filtered.length ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No tasks match these filters.</p>
      ) : (
        <div className="surface divide-y overflow-hidden">
          {filtered.map((t) => (
            <TaskRow key={t.id} task={t} onEdit={(t) => { setEditing(t); setFormOpen(true); }} onDelete={setDeleting} />
          ))}
        </div>
      )}

      <TaskFormDialog open={formOpen} onOpenChange={setFormOpen} projectId={projectId} task={editing} />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete task?"
        description={`“${deleting?.title}” will be permanently deleted.`}
        pending={del.isPending}
        onConfirm={() =>
          deleting &&
          del.mutate(deleting.id, {
            onSuccess: () => { toast.success("Task deleted"); setDeleting(null); },
            onError: (e) => toast.error(errorMessage(e)),
          })
        }
      />
    </div>
  );
}
