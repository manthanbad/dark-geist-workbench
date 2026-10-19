import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCreateProject } from "@/hooks/use-projects";
import { errorMessage } from "@/lib/format";

const schema = z.object({
  name: z.string().trim().min(1, "Project name is required").max(100, "Keep it under 100 characters"),
  description: z.string().trim().max(1000, "Keep it under 1000 characters"),
});
type Values = z.infer<typeof schema>;

export function CreateProjectDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const create = useCreateProject();
  const navigate = useNavigate();
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { name: "", description: "" } });

  useEffect(() => {
    if (open) form.reset({ name: "", description: "" });
  }, [open, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const project = await create.mutateAsync(values);
      toast.success(`Created “${values.name}”`);
      onOpenChange(false);
      if (project?.id) navigate({ to: "/projects/$projectId", params: { projectId: project.id } });
    } catch (e) {
      toast.error(errorMessage(e));
    }
  });

  const { errors } = form.formState;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New project</DialogTitle>
          <DialogDescription>Group tasks, notes and repositories under one workspace.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="project-name">Name</Label>
            <Input id="project-name" placeholder="e.g. Payments API" autoFocus aria-invalid={!!errors.name} {...form.register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="project-desc">Description</Label>
            <Textarea id="project-desc" rows={4} placeholder="What is this project about?" {...form.register("description")} />
            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending && <Loader2 className="size-4 animate-spin" />}
              Create project
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
