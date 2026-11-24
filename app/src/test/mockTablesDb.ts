import { vi } from "vitest";

export type TablesDbCalls = {
  createRow: Array<Record<string, unknown>>;
  updateRow: Array<Record<string, unknown>>;
  getRow: Array<Record<string, unknown>>;
  deleteRow: Array<Record<string, unknown>>;
  listRows: Array<Record<string, unknown>>;
};

export function createMockTablesDB() {
  const calls: TablesDbCalls = {
    createRow: [],
    updateRow: [],
    getRow: [],
    deleteRow: [],
    listRows: [],
  };

  const db = {
    createRow: vi.fn(async (params: {
      databaseId: string;
      tableId: string;
      rowId: string;
      data: Record<string, unknown>;
    }) => {
      calls.createRow.push(params);
      return { $id: params.rowId, ...params.data };
    }),
    updateRow: vi.fn(async (params: {
      databaseId: string;
      tableId: string;
      rowId: string;
      data?: Record<string, unknown>;
    }) => {
      calls.updateRow.push(params);
      return { $id: params.rowId, ...(params.data ?? {}) };
    }),
    getRow: vi.fn(async (params: { databaseId: string; tableId: string; rowId: string }): Promise<Record<string, unknown>> => {
      calls.getRow.push(params);
      return { $id: params.rowId, userId: "u1", title: "Test", status: "open" };
    }),
    deleteRow: vi.fn(async (params: Record<string, unknown>) => {
      calls.deleteRow.push(params);
    }),
    listRows: vi.fn(async (params: Record<string, unknown>) => {
      calls.listRows.push(params);
      return { rows: [], total: 0 };
    }),
  };

  return { db, calls };
}