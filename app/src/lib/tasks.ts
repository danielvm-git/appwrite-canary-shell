import { Query } from "appwrite";
import {
  TASKS_TABLE_ID,
  TODO_DATABASE_ID,
  createTablesDB,
  newId,
} from "./appwrite";
import { clientLog } from "./log";
import { buildTaskPatch, buildTaskRowData } from "./taskPayload";
import { rowDocumentId } from "./rowId";

export type TaskStatus = "open" | "doing" | "review" | "done";
export type TaskPriority = "high" | "mid" | "low";

export type Task = {
  $id: string;
  $sequence?: string | number;
  title: string;
  notes?: string;
  status: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  listId?: string;
  userId: string;
  ownerName?: string;
  sharedWith?: string[];
  sharedNames?: string[];
  attachmentId?: string;
};

export type TaskInput = {
  title: string;
  notes?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  listId?: string;
  ownerName?: string;
  attachmentId?: string;
};

const TASK_LIMIT = 500;

function requireTaskId(taskId: string | undefined): string {
  const id = taskId?.trim();
  if (!id || id === "new") throw new Error("Missing task id");
  return id;
}

function canAccess(task: Task, userId: string): boolean {
  return task.userId === userId || (task.sharedWith ?? []).includes(userId);
}

/** Tasks the user owns plus tasks shared with them. */
export async function listAccessibleTasks(userId: string): Promise<Task[]> {
  const db = createTablesDB();
  const result = await db.listRows({
    databaseId: TODO_DATABASE_ID,
    tableId: TASKS_TABLE_ID,
    queries: [
      Query.or([Query.equal("userId", userId), Query.contains("sharedWith", [userId])]),
      Query.orderDesc("$createdAt"),
      Query.limit(TASK_LIMIT),
    ],
  });
  return result.rows as unknown as Task[];
}

export async function getTask(taskId: string): Promise<Task> {
  const id = requireTaskId(taskId);
  const db = createTablesDB();
  return (await db.getRow({
    databaseId: TODO_DATABASE_ID,
    tableId: TASKS_TABLE_ID,
    rowId: id,
  })) as unknown as Task;
}

export async function createTask(userId: string, input: TaskInput): Promise<Task> {
  const rowId = newId();
  const db = createTablesDB();
  try {
    const row = await db.createRow({
      databaseId: TODO_DATABASE_ID,
      tableId: TASKS_TABLE_ID,
      rowId,
      data: buildTaskRowData(userId, input),
    });
    const task = row as unknown as Task;
    rowDocumentId(task);
    return task;
  } catch (err) {
    clientLog.error("tasks.createRow failed", err, { tableId: TASKS_TABLE_ID, operation: "createTask" });
    throw err;
  }
}

async function writePatch(id: string, patch: Partial<TaskInput>, operation: string): Promise<Task> {
  const db = createTablesDB();
  try {
    const row = await db.updateRow({
      databaseId: TODO_DATABASE_ID,
      tableId: TASKS_TABLE_ID,
      rowId: id,
      data: buildTaskPatch(patch),
    });
    return row as unknown as Task;
  } catch (err) {
    clientLog.error("tasks.updateRow failed", err, { tableId: TASKS_TABLE_ID, operation, rowId: id });
    throw err;
  }
}

/** Owners edit every field; collaborators may only change status. */
export async function updateTask(
  userId: string,
  taskId: string | undefined,
  patch: Partial<TaskInput>,
): Promise<Task> {
  const id = requireTaskId(taskId);
  const existing = await getTask(id);
  if (!canAccess(existing, userId)) throw new Error("Not allowed");
  const onlyStatus = Object.keys(patch).every((k) => k === "status");
  if (existing.userId !== userId && !onlyStatus) {
    throw new Error("Only the owner can edit this task");
  }
  return writePatch(id, patch, "updateTask");
}

export async function setTaskStatus(userId: string, task: Task, status: TaskStatus): Promise<Task> {
  const id = requireTaskId(task.$id);
  if (!canAccess(task, userId)) throw new Error("Not allowed");
  return writePatch(id, { status }, "setTaskStatus");
}

export async function toggleTaskStatus(userId: string, task: Task): Promise<Task> {
  return setTaskStatus(userId, task, task.status === "done" ? "open" : "done");
}

export async function deleteTask(userId: string, taskId: string | undefined): Promise<void> {
  const id = requireTaskId(taskId);
  const existing = await getTask(id);
  if (existing.userId !== userId) throw new Error("Not allowed");
  const db = createTablesDB();
  await db.deleteRow({
    databaseId: TODO_DATABASE_ID,
    tableId: TASKS_TABLE_ID,
    rowId: id,
  });
}
