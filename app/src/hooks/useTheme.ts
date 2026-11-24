import { useCallback, useState } from "react";

export type Theme = "light" | "dark";
const KEY = "tasks-theme";

function current(): Theme {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

export function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>(current);
  const toggle = useCallback(() => {
    const next: Theme = current() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      // private mode: theme still applies for this tab
    }
    setTheme(next);
  }, []);
  return [theme, toggle];
}
