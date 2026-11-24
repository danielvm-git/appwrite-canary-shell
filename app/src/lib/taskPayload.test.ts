import { describe, expect, it } from "vitest";
import { buildTaskPatch, buildTaskRowData } from "./taskPayload";

describe("SC-todo-P1-05 task payload", () => {
  it("omits empty optionals on create", () => {
    const data = buildTaskRowData("u1", { title: "A" });
    expect(data).toEqual({ title: "A", notes: "", status: "open", priority: "mid", userId: "u1" });
    expect(data).not.toHaveProperty("listId");
  });

  it("carries priority, status and owner name", () => {
    const data = buildTaskRowData("u1", { title: "A", status: "review", priority: "high", ownerName: "Ana" });
    expect(data).toMatchObject({ status: "review", priority: "high", ownerName: "Ana" });
  });

  it("includes listId when set", () => {
    const data = buildTaskRowData("u1", { title: "A", listId: "list1" });
    expect(data.listId).toBe("list1");
  });

  it("patch clears list with null", () => {
    expect(buildTaskPatch({ listId: "" })).toEqual({ listId: null });
  });
});