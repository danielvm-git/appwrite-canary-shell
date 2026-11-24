import type { TaskInput } from "./tasks";

/** Shape sent to TablesDB — no empty optional strings. */
export function buildTaskRowData(userId: string, input: TaskInput): Record<string, unknown> {
  const data: Record<string, unknown> = {
    title: input.title,
    notes: input.notes ?? "",
    status: input.status ?? "open",
    priority: input.priority ?? "mid",
    userId,
  };
  if (input.dueDate) data.dueDate = input.dueDate;
  if (input.listId) data.listId = input.listId;
  if (input.ownerName) data.ownerName = input.ownerName;
  if (input.attachmentId) data.attachmentId = input.attachmentId;
  return data;
}

export function buildTaskPatch(patch: Partial<TaskInput>): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  if (patch.title !== undefined) data.title = patch.title;
  if (patch.notes !== undefined) data.notes = patch.notes;
  if (patch.status !== undefined) data.status = patch.status;
  if (patch.priority !== undefined) data.priority = patch.priority;
  if (patch.dueDate !== undefined) data.dueDate = patch.dueDate || null;
  if (patch.listId !== undefined) data.listId = patch.listId || null;
  if (patch.attachmentId !== undefined) data.attachmentId = patch.attachmentId || null;
  return data;
}
