/** TablesDB rows use `$id`; guard missing route params. */
export function rowDocumentId(row: { $id?: string } | null | undefined): string {
  const id = row?.$id?.trim();
  if (!id) throw new Error("Row response missing $id");
  return id;
}

export function routeOrRowId(routeParam: string | undefined, rowId: string | undefined): string {
  const fromRoute = routeParam?.trim();
  if (fromRoute && fromRoute !== "new") return fromRoute;
  const fromRow = rowId?.trim();
  if (fromRow) return fromRow;
  throw new Error("Missing task id");
}