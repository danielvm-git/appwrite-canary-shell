import { describe, expect, it, vi } from "vitest";

const createFile = vi.fn(async (params: { bucketId: string; fileId: string }) => ({
  $id: params.fileId,
}));

vi.mock("./appwrite", () => ({
  ATTACHMENTS_BUCKET_ID: "task-attachments",
  newId: () => "file-1",
  createStorage: () => ({ createFile }),
}));

import { uploadAttachment } from "./attachments";

describe("attachments", () => {
  it("calls createFile with object params", async () => {
    const file = new File(["x"], "note.txt", { type: "text/plain" });
    const id = await uploadAttachment("u1", file);
    expect(id).toBe("file-1");
    expect(createFile).toHaveBeenCalledWith({
      bucketId: "task-attachments",
      fileId: "file-1",
      file,
    });
  });
});