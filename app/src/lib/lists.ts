import { Query } from "appwrite";
import {
  LISTS_TABLE_ID,
  TODO_DATABASE_ID,
  createTablesDB,
  newId,
} from "./appwrite";

export type TodoList = {
  $id: string;
  name: string;
  color?: string;
  userId: string;
};

export async function listListsForUser(userId: string): Promise<TodoList[]> {
  const db = createTablesDB();
  const result = await db.listRows({
    databaseId: TODO_DATABASE_ID,
    tableId: LISTS_TABLE_ID,
    queries: [Query.equal("userId", userId), Query.orderAsc("name")],
  });
  return result.rows as unknown as TodoList[];
}

export async function createList(userId: string, name: string, color?: string): Promise<TodoList> {
  const db = createTablesDB();
  const row = await db.createRow({
    databaseId: TODO_DATABASE_ID,
    tableId: LISTS_TABLE_ID,
    rowId: newId(),
    data: { name, color: color ?? "", userId },
  });
  return row as unknown as TodoList;
}

export async function deleteList(userId: string, listId: string): Promise<void> {
  const db = createTablesDB();
  const list = (await db.getRow({
    databaseId: TODO_DATABASE_ID,
    tableId: LISTS_TABLE_ID,
    rowId: listId,
  })) as unknown as TodoList;
  if (list.userId !== userId) throw new Error("Not allowed");
  await db.deleteRow({
    databaseId: TODO_DATABASE_ID,
    tableId: LISTS_TABLE_ID,
    rowId: listId,
  });
}