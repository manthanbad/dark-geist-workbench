import { format, formatDistanceToNow, isPast, isToday, parseISO } from "date-fns";

export function safeDate(value?: string | null): Date | null {
  if (!value) return null;
  const d = parseISO(value);
  return isNaN(d.getTime()) ? null : d;
}

export function relative(value?: string | null) {
  const d = safeDate(value);
  return d ? formatDistanceToNow(d, { addSuffix: true }) : "—";
}

export function shortDate(value?: string | null) {
  const d = safeDate(value);
  return d ? format(d, "MMM d, yyyy") : "—";
}

export function isOverdue(value?: string | null) {
  const d = safeDate(value);
  return !!d && isPast(d) && !isToday(d);
}

export function initials(name?: string | null) {
  if (!name) return "?";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]!.toUpperCase())
    .join("");
}

export function errorMessage(err: unknown) {
  return err instanceof Error ? err.message : "Something went wrong.";
}
