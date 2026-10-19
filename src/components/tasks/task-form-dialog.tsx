import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateTask, useUpdateTask } from "@/hooks/use-tasks";
import { errorMessage } from "@/lib/format";
import { TASK_PRIORITIES, TASK_STATUSES, type Task } from "@/types";
import { PRIORITY_META, STATUS_META } from "./task-badges";

const schema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().max(2000),
  status: z.enum(TASK_STATUSES),
  priority: z.enum(TASK_PRIORITIES),
  dueDate: z.string(),
});
type Values = z.infer<typeof schema>;

export function TaskFormDialog({
  open,
  onOpenChange,
  projectId,
  task,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  projectId: string;
  task?: Task | null;
}) {
  const create = useCreateTask();
  const update = useUpdateTask(projectId);
  const pending = create.isPending || update.isPending;
  const form = useForm<Values>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (open)
      form.reset({
        title: task?.title ?? "",
        description: task?.description ?? "",
        status: task?.status ?? "todo",
        priority: task?.priority ?? "medium",
        dueDate: task?.dueDate ? task.dueDate.slice(0, 10) : "",
      });
  }, [open, task, form]);

  const onSubmit = form.handleSubmit(async (v) => {
    const payload = { ...v, dueDate: v.dueDate ? new Date(v.dueDate).toISOString() : null };
    try {
      if (task) {
        await update.mutateAsync({ id: task.id, input: payload });
        toast.success("Task updated");
      } else {
        await create.mutateAsync({ projectId, ...payload });
        toast.success("Task created");
      }
      onOpenChange(false);
    } catch (e) {
      toast.error(errorMessage(e));
    }
  });

  const { errors } = form.formState;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{task ? "Edit task" : "New task"}</DialogTitle>
          <DialogDescription>{task ? "Update the task details." : "Add a task to this project."}</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="task-title">Title</Label>
            <Input id="task-title" autoFocus placeholder="Implement authentication" aria-invalid={!!errors.title} {...form.register("title")} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="task-desc">Description</Label>
            <Textarea id="task-desc" rows={3} placeholder="Add login and registration" {...form.register("description")} />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Controller
                control={form.control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger aria-label="Status"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TASK_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>{STATUS_META[s].label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Controller
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger aria-label="Priority"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TASK_PRIORITIES.map((p) => (
                        <SelectItem key={p} value={p}>{PRIORITY_META[p].label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="task-due">Due date</Label>
              <Input id="task-due" type="date" {...form.register("dueDate")} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="size-4 animate-spin" />}
              {task ? "Save changes" : "Create task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
