import { describe, expect, it } from "vitest";
import { parseShareResponse } from "./share";

describe("SC-todo-share share response", () => {
  it("returns collaborators on success", () => {
    const body = JSON.stringify({ ok: true, sharedWith: ["ben"], sharedNames: ["Ben Lima"] });
    expect(parseShareResponse(body)).toEqual({ sharedWith: ["ben"], sharedNames: ["Ben Lima"] });
  });

  it("surfaces the function's message on failure", () => {
    const body = JSON.stringify({ ok: false, code: "no_user", message: "No user with that email." });
    expect(() => parseShareResponse(body)).toThrow("No user with that email.");
  });

  it("reports an unavailable service for empty or non-JSON bodies", () => {
    expect(() => parseShareResponse("")).toThrow(/unavailable/);
    expect(() => parseShareResponse("<html>")).toThrow(/unavailable/);
  });
});
