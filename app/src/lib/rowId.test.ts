import { describe, expect, it } from "vitest";
import { routeOrRowId, rowDocumentId } from "./rowId";

describe("rowId", () => {
  it("prefers route param", () => {
    expect(routeOrRowId("abc", "def")).toBe("abc");
  });

  it("falls back to loaded row id", () => {
    expect(routeOrRowId(undefined, "row-1")).toBe("row-1");
  });

  it("throws when missing", () => {
    expect(() => routeOrRowId(undefined, undefined)).toThrow(/Missing task id/);
  });

  it("requires $id on row", () => {
    expect(rowDocumentId({ $id: "x" })).toBe("x");
    expect(() => rowDocumentId({})).toThrow(/missing \$id/);
  });
});