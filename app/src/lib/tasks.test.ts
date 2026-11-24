import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMockTablesDB } from "../test/mockTablesDb";

const mock = createMockTablesDB();

vi.mock("./appwrite", () => ({
  TODO_DATABASE_ID: "todo",
  TASKS_TABLE_ID: "tasks",
  newId: () => "generated-row-id",
  createTablesDB: () => mock.db,
}));

import {
  createTask,
  deleteTask,
  listAccessibleTasks,
  setTaskStatus,
  toggleTaskStatus,
  updateTask,
} from "./tasks";

describe("tasks TablesDB contracts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mock.calls.createRow.length = 0;
    mock.calls.updateRow.length = 0;
  });

  it("SC-todo-P0-01 createRow includes databaseId tableId rowId", async () => {
    await createTask("u1", { title: "Ship" });
    expect(mock.calls.createRow[0]).toMatchObject({
      databaseId: "todo",
      tableId: "tasks",
      rowId: "generated-row-id",
    });
  });

  it("SC-todo-P0-01 updateRow includes rowId", async () => {
    await updateTask("u1", "task-abc", { title: "Updated" });
    expect(mock.calls.updateRow[0]).toMatchObject({
      databaseId: "todo",
      tableId: "tasks",
      rowId: "task-abc",
    });
  });

  it("SC-todo-P0-02 rejects missing task id on update", async () => {
    await expect(updateTask("u1", undefined, { title: "x" })).rejects.toThrow(/Missing task id/);
    expect(mock.calls.updateRow).toHaveLength(0);
  });

  it("SC-todo-P0-03 rejects delete for other user", async () => {
    mock.db.getRow.mockResolvedValueOnce({ $id: "t1", userId: "other", title: "X", status: "open" });
    await expect(deleteTask("u1", "t1")).rejects.toThrow(/Not allowed/);
  });

  it("SC-todo-P1-04 lists owned and shared tasks in one query", async () => {
    await listAccessibleTasks("u1");
    const queries = (mock.calls.listRows.at(-1)?.queries ?? []) as string[];
    const or = JSON.parse(queries[0]);
    expect(or.method).toBe("or");
    const nested = or.values.map((q: unknown) => (typeof q === "string" ? JSON.parse(q) : q));
    expect(nested).toEqual([
      expect.objectContaining({ method: "equal", attribute: "userId", values: ["u1"] }),
      expect.objectContaining({ method: "contains", attribute: "sharedWith", values: ["u1"] }),
    ]);
  });

  it("SC-todo-share collaborators may change status only", async () => {
    mock.db.getRow.mockResolvedValue({ $id: "t1", userId: "owner", sharedWith: ["u1"], title: "X", status: "open" });
    await expect(updateTask("u1", "t1", { status: "review" })).resolves.toMatchObject({ status: "review" });
    await expect(updateTask("u1", "t1", { title: "Hijack" })).rejects.toThrow(/Only the owner/);
    mock.db.getRow.mockReset();
  });

  it("SC-todo-share strangers cannot change status", async () => {
    await expect(
      setTaskStatus("u1", { $id: "t1", title: "X", status: "open", userId: "owner" }, "done"),
    ).rejects.toThrow(/Not allowed/);
    expect(mock.calls.updateRow).toHaveLength(0);
  });

  it("toggles status", async () => {
    const task = await toggleTaskStatus("u1", {
      $id: "t1",
      title: "Test",
      status: "open",
      userId: "u1",
    });
    expect(task.status).toBe("done");
  });
});