import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCreateNote, useUpdateNote } from "@/hooks/use-notes";
import { errorMessage } from "@/lib/format";
import type { Note } from "@/types";

const schema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  content: z.string().max(50000),
});
type Values = z.infer<typeof schema>;

export function NoteEditorDialog({
  open,
  onOpenChange,
  projectId,
  note,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  projectId: string;
  note?: Note | null;
}) {
  const create = useCreateNote();
  const update = useUpdateNote(projectId);
  const pending = create.isPending || update.isPending;
  const form = useForm<Values>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (open) form.reset({ title: note?.title ?? "", content: note?.content ?? "" });
  }, [open, note, form]);

  const onSubmit = form.handleSubmit(async (v) => {
    try {
      if (note) await update.mutateAsync({ id: note.id, input: v });
      else await create.mutateAsync({ projectId, ...v });
      toast.success(note ? "Note saved" : "Note created");
      onOpenChange(false);
    } catch (e) {
      toast.error(errorMessage(e));
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="sr-only">{note ? "Edit note" : "New note"}</DialogTitle>
          <DialogDescription className="sr-only">Write a title and content for this note.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3" noValidate>
          <input
            aria-label="Note title"
            placeholder="Untitled note"
            autoFocus
            className="w-full bg-transparent text-xl font-semibold tracking-tight outline-none placeholder:text-muted-foreground/60"
            {...form.register("title")}
          />
          {form.formState.errors.title && <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>}
          <Textarea
            aria-label="Note content"
            placeholder="Architecture decisions, snippets, TODOs…"
            className="min-h-72 resize-y border-0 bg-code font-mono text-sm leading-relaxed focus-visible:ring-1"
            {...form.register("content")}
          />
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="size-4 animate-spin" />}
              {note ? "Save note" : "Create note"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
