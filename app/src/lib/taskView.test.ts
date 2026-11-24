import { describe, expect, it } from "vitest";
import type { TodoList } from "./lists";
import type { Task } from "./tasks";
import {
  dashboardStats,
  formatDue,
  initials,
  isOverdue,
  navCounts,
  priorityShare,
  scopeLabel,
  statusSummary,
  taskPeople,
  teamProgress,
  visibleTasks,
} from "./taskView";

const me = { id: "ana", name: "Ana Souza" };
const today = "2026-11-24";

function task(partial: Partial<Task>): Task {
  return { $id: "t", title: "Task", status: "open", userId: "ana", ...partial };
}

const tasks: Task[] = [
  task({ $id: "t1", title: "Design schema", status: "done", priority: "mid", listId: "api", dueDate: "2026-11-18T00:00:00.000+00:00", sharedWith: ["ben"], sharedNames: ["Ben Lima"] }),
  task({ $id: "t2", title: "JWT auth", status: "doing", priority: "high", listId: "api", dueDate: "2026-11-26T00:00:00.000+00:00" }),
  task({ $id: "t3", title: "CRUD endpoints", status: "doing", priority: "high", listId: "api", dueDate: "2026-11-22T00:00:00.000+00:00" }),
  task({ $id: "t4", title: "Buy coffee", status: "open", priority: "low", listId: "home" }),
  task({ $id: "t5", title: "Seed database", status: "review", userId: "ben", ownerName: "Ben Lima", sharedWith: ["ana"], sharedNames: ["Ana Souza"], listId: "work" }),
];

const lists: TodoList[] = [
  { $id: "api", name: "Todo API", userId: "ana" },
  { $id: "home", name: "Home", userId: "ana" },
];

describe("SC-todo-view task view model", () => {
  it("flags overdue only for unfinished tasks before today", () => {
    expect(isOverdue(tasks[2], today)).toBe(true);
    expect(isOverdue(tasks[0], today)).toBe(false);
    expect(isOverdue(tasks[1], today)).toBe(false);
    expect(isOverdue(tasks[3], today)).toBe(false);
  });

  it("formats due dates as short month and day", () => {
    expect(formatDue(tasks[1])).toBe("Nov 26");
    expect(formatDue(tasks[3])).toBe("—");
  });

  it("filters by scope and search text", () => {
    expect(visibleTasks(tasks, { scope: "all", q: "", me: me.id })).toHaveLength(5);
    expect(visibleTasks(tasks, { scope: "mine", q: "", me: me.id }).map((t) => t.$id)).not.toContain("t5");
    expect(visibleTasks(tasks, { scope: "shared", q: "", me: me.id }).map((t) => t.$id)).toEqual(["t5"]);
    expect(visibleTasks(tasks, { scope: "api", q: "", me: me.id })).toHaveLength(3);
    expect(visibleTasks(tasks, { scope: "all", q: " jwt ", me: me.id }).map((t) => t.$id)).toEqual(["t2"]);
  });

  it("counts open tasks for the sidebar", () => {
    expect(navCounts(tasks, me.id)).toEqual({ mine: 3, shared: 1, lists: { api: 2, home: 1, work: 1 } });
  });

  it("computes dashboard stats", () => {
    expect(dashboardStats(tasks, me.id, today)).toEqual({
      total: 5,
      shared: 1,
      done: 1,
      donePct: 20,
      doing: 2,
      review: 1,
      overdue: 1,
    });
    expect(dashboardStats([], me.id, today).donePct).toBe(0);
  });

  it("summarises status bars relative to the tallest column", () => {
    expect(statusSummary(tasks).map((s) => [s.id, s.count, s.heightPct])).toEqual([
      ["open", 1, 50],
      ["doing", 2, 100],
      ["review", 1, 50],
      ["done", 1, 50],
    ]);
  });

  it("shares priorities, treating missing priority as medium", () => {
    expect(priorityShare(tasks).map((p) => [p.id, p.count, p.pct])).toEqual([
      ["high", 2, 40],
      ["mid", 2, 40],
      ["low", 1, 20],
    ]);
  });

  it("lists owner first then collaborators", () => {
    expect(taskPeople(tasks[0], me).map((p) => p.initials)).toEqual(["AS", "BL"]);
    expect(taskPeople(tasks[4], me).map((p) => p.name)).toEqual(["Ben Lima", "Ana Souza"]);
    expect(taskPeople(task({ userId: "zoe" }), me)[0].initials).toBe("?");
  });

  it("computes completion per person", () => {
    const progress = teamProgress(tasks, me);
    expect(progress.find((p) => p.person.id === "ana")?.pct).toBe(20);
    expect(progress.find((p) => p.person.id === "ben")?.pct).toBe(50);
  });

  it("builds initials and scope labels", () => {
    expect(initials("ana souza silva")).toBe("AS");
    expect(initials("")).toBe("?");
    expect(scopeLabel("mine", lists)).toBe("My tasks");
    expect(scopeLabel("api", lists)).toBe("Todo API");
    expect(scopeLabel("all", lists)).toBe("");
  });
});
