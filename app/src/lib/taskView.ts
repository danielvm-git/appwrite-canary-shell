import type { TodoList } from "./lists";
import type { Task, TaskPriority, TaskStatus } from "./tasks";

export const STATUSES: { id: TaskStatus; label: string }[] = [
  { id: "open", label: "Open" },
  { id: "doing", label: "In progress" },
  { id: "review", label: "In review" },
  { id: "done", label: "Done" },
];

export const PRIORITIES: { id: TaskPriority; label: string }[] = [
  { id: "high", label: "High" },
  { id: "mid", label: "Medium" },
  { id: "low", label: "Low" },
];

export const LIST_COLORS = [
  "oklch(0.62 0.15 240)",
  "oklch(0.7 0.15 75)",
  "oklch(0.6 0.15 160)",
  "oklch(0.58 0.2 20)",
  "oklch(0.55 0.18 300)",
  "oklch(0.556 0 0)",
];

/** "all" | "mine" | "shared" | a list id */
export type Scope = string;

export type Person = { id: string; name: string; initials: string };

export function statusLabel(status: TaskStatus): string {
  return STATUSES.find((s) => s.id === status)?.label ?? status;
}

export function priorityOf(task: Task): TaskPriority {
  return task.priority ?? "mid";
}

export function priorityLabel(priority: TaskPriority): string {
  return PRIORITIES.find((p) => p.id === priority)?.label ?? priority;
}

export function toDay(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDays(day: string, days: number): string {
  const date = new Date(`${day}T00:00:00`);
  date.setDate(date.getDate() + days);
  return toDay(date);
}

export function dueDay(task: Task): string | undefined {
  return task.dueDate ? task.dueDate.slice(0, 10) : undefined;
}

export function isOverdue(task: Task, today: string): boolean {
  const due = dueDay(task);
  return Boolean(due && due < today && task.status !== "done");
}

export function formatDue(task: Task): string {
  const due = dueDay(task);
  if (!due) return "—";
  return new Date(`${due}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function taskNumber(task: Task): string {
  return task.$sequence !== undefined ? String(task.$sequence) : "";
}

export function isOwner(task: Task, me: string): boolean {
  return task.userId === me;
}

export function inScope(task: Task, scope: Scope, me: string): boolean {
  if (scope === "all") return true;
  if (scope === "mine") return task.userId === me;
  if (scope === "shared") return task.userId !== me;
  return task.listId === scope;
}

export function visibleTasks(tasks: Task[], opts: { scope: Scope; q: string; me: string }): Task[] {
  const q = opts.q.trim().toLowerCase();
  return tasks.filter((t) => inScope(t, opts.scope, opts.me) && (!q || t.title.toLowerCase().includes(q)));
}

export function navCounts(tasks: Task[], me: string) {
  const open = tasks.filter((t) => t.status !== "done");
  const lists: Record<string, number> = {};
  for (const t of open) {
    if (t.listId) lists[t.listId] = (lists[t.listId] ?? 0) + 1;
  }
  return {
    mine: open.filter((t) => t.userId === me).length,
    shared: open.filter((t) => t.userId !== me).length,
    lists,
  };
}

function pct(n: number, total: number): number {
  return total ? Math.round((n / total) * 100) : 0;
}

export function dashboardStats(tasks: Task[], me: string, today: string) {
  const done = tasks.filter((t) => t.status === "done").length;
  return {
    total: tasks.length,
    shared: tasks.filter((t) => t.userId !== me).length,
    done,
    donePct: pct(done, tasks.length),
    doing: tasks.filter((t) => t.status === "doing").length,
    review: tasks.filter((t) => t.status === "review").length,
    overdue: tasks.filter((t) => isOverdue(t, today)).length,
  };
}

export function statusSummary(tasks: Task[]) {
  const counts = STATUSES.map((s) => tasks.filter((t) => t.status === s.id).length);
  const max = Math.max(1, ...counts);
  return STATUSES.map((s, i) => ({ ...s, count: counts[i], heightPct: Math.round((counts[i] / max) * 100) }));
}

export function priorityShare(tasks: Task[]) {
  return PRIORITIES.map((p) => {
    const count = tasks.filter((t) => priorityOf(t) === p.id).length;
    return { ...p, count, pct: pct(count, tasks.length) };
  });
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return parts
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function person(id: string, name: string | undefined): Person {
  const display = name?.trim() || "";
  return { id, name: display || "Unknown", initials: initials(display) };
}

export function taskPeople(task: Task, me: { id: string; name: string }): Person[] {
  const ownerName = task.ownerName || (task.userId === me.id ? me.name : "");
  const people = [person(task.userId, ownerName)];
  (task.sharedWith ?? []).forEach((id, i) => {
    if (id !== task.userId) people.push(person(id, task.sharedNames?.[i]));
  });
  return people;
}

export function teamProgress(tasks: Task[], me: { id: string; name: string }) {
  const byId = new Map<string, { person: Person; total: number; done: number }>();
  for (const t of tasks) {
    for (const p of taskPeople(t, me)) {
      const entry = byId.get(p.id) ?? { person: p, total: 0, done: 0 };
      entry.total += 1;
      if (t.status === "done") entry.done += 1;
      byId.set(p.id, entry);
    }
  }
  return [...byId.values()].map((e) => ({ person: e.person, pct: pct(e.done, e.total) }));
}

export function avatarTone(id: string): number {
  let hash = 0;
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return hash % 3;
}

export function scopeLabel(scope: Scope, lists: TodoList[]): string {
  if (scope === "all") return "";
  if (scope === "mine") return "My tasks";
  if (scope === "shared") return "Shared with me";
  return lists.find((l) => l.$id === scope)?.name ?? "";
}

export function listName(listId: string | undefined, lists: TodoList[]): string {
  if (!listId) return "Inbox";
  return lists.find((l) => l.$id === listId)?.name ?? "Inbox";
}
