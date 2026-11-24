import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

function appVersion(): string {
  if (process.env.APP_VERSION) return process.env.APP_VERSION;
  try {
    const versionPath = fileURLToPath(new URL("../VERSION", import.meta.url));
    return readFileSync(versionPath, "utf-8").trim();
  } catch {
    return "dev";
  }
}

export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(appVersion()),
  },
  server: {
    proxy: {
      "/health": "http://127.0.0.1:8080",
    },
  },
});