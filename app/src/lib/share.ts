import { ExecutionMethod } from "appwrite";
import { SHARE_FUNCTION_ID, createFunctions } from "./appwrite";
import { clientLog } from "./log";

export type ShareResult = { sharedWith: string[]; sharedNames: string[] };

export function parseShareResponse(body: string): ShareResult {
  let data: { ok?: boolean; message?: string; sharedWith?: string[]; sharedNames?: string[] };
  try {
    data = JSON.parse(body);
  } catch {
    throw new Error("Share service unavailable. Try again.");
  }
  if (!data.ok) throw new Error(data.message || "Could not share the task.");
  return { sharedWith: data.sharedWith ?? [], sharedNames: data.sharedNames ?? [] };
}

export async function shareTaskByEmail(taskId: string, email: string): Promise<ShareResult> {
  const execution = await createFunctions().createExecution({
    functionId: SHARE_FUNCTION_ID,
    body: JSON.stringify({ taskId, email }),
    async: false,
    method: ExecutionMethod.POST,
    headers: { "content-type": "application/json" },
  });
  try {
    return parseShareResponse(execution.responseBody);
  } catch (err) {
    clientLog.warn("share-task rejected", {
      operation: "shareTask",
      taskId,
      status: execution.responseStatusCode,
    });
    throw err;
  }
}
