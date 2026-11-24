import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import type { Scope } from "../lib/taskView";

/** Scope (all, mine, shared, list id) and search text live in the URL so views keep them. */
export function useScope() {
  const [params, setParams] = useSearchParams();
  const scope: Scope = params.get("scope") || "all";
  const q = params.get("q") ?? "";

  const update = useCallback(
    (key: "scope" | "q", value: string) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (!value || (key === "scope" && value === "all")) next.delete(key);
          else next.set(key, value);
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  const toggleScope = useCallback((value: Scope) => update("scope", scope === value ? "all" : value), [scope, update]);
  const setQ = useCallback((value: string) => update("q", value), [update]);

  return { scope, q, toggleScope, setQ, search: params.toString() };
}
