import { useState } from "react";
import { NotebookPen, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/common/states";
import { useDeleteNote, useNotes } from "@/hooks/use-notes";
import { errorMessage, relative, shortDate } from "@/lib/format";
import type { Note } from "@/types";
import { NoteEditorDialog } from "./note-editor-dialog";

export function NotesPanel({ projectId }: { projectId: string }) {
  const { data, isLoading, error, refetch } = useNotes(projectId);
  const del = useDeleteNote(projectId);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Note | null>(null);
  const [deleting, setDeleting] = useState<Note | null>(null);

  const startNew = () => { setEditing(null); setOpen(true); };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={startNew}><Plus className="size-4" /> New note</Button>
      </div>
      {isLoading ? (
        <ListSkeleton rows={3} />
      ) : error ? (
        <ErrorState message={errorMessage(error)} onRetry={() => refetch()} />
      ) : !data?.length ? (
        <EmptyState icon={NotebookPen} title="No notes yet" description="Capture architecture decisions, setup steps and snippets alongside your tasks." action={<Button size="sm" onClick={startNew}><Plus className="size-4" /> Write a note</Button>} />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {data.map((n) => (
            <article key={n.id} className="group surface flex flex-col p-4">
              <div className="flex items-start justify-between gap-2">
                <button className="text-left font-medium hover:text-primary" onClick={() => { setEditing(n); setOpen(true); }}>
                  {n.title}
                </button>
                <div className="flex opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
                  <Button variant="ghost" size="icon" className="size-7" aria-label="Edit note" onClick={() => { setEditing(n); setOpen(true); }}><Pencil className="size-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="size-7 text-destructive" aria-label="Delete note" onClick={() => setDeleting(n)}><Trash2 className="size-3.5" /></Button>
                </div>
              </div>
              <p className="mt-2 line-clamp-4 whitespace-pre-wrap font-mono text-xs text-muted-foreground">{n.content || "Empty note"}</p>
              <p className="mt-auto pt-3 text-[11px] text-muted-foreground">
                Created {shortDate(n.createdAt)} · Updated {relative(n.updatedAt)}
              </p>
            </article>
          ))}
        </div>
      )}
      <NoteEditorDialog open={open} onOpenChange={setOpen} projectId={projectId} note={editing} />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete note?"
        description={`“${deleting?.title}” will be permanently deleted.`}
        pending={del.isPending}
        onConfirm={() =>
          deleting &&
          del.mutate(deleting.id, {
            onSuccess: () => { toast.success("Note deleted"); setDeleting(null); },
            onError: (e) => toast.error(errorMessage(e)),
          })
        }
      />
    </div>
  );
}
