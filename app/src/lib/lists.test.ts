import { describe, expect, it, vi } from "vitest";
import { createMockTablesDB } from "../test/mockTablesDb";

const mock = createMockTablesDB();

vi.mock("./appwrite", () => ({
  TODO_DATABASE_ID: "todo",
  LISTS_TABLE_ID: "lists",
  newId: () => "list-row-1",
  createTablesDB: () => mock.db,
}));

import { createList } from "./lists";

describe("lists TablesDB contracts", () => {
  it("SC-todo-P0-01 createRow passes rowId", async () => {
    mock.calls.createRow.length = 0;
    await createList("u1", "Projeto");
    expect(mock.calls.createRow[0]).toMatchObject({
      databaseId: "todo",
      tableId: "lists",
      rowId: "list-row-1",
    });
  });
});