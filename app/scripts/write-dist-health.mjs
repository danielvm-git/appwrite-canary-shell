import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = fileURLToPath(new URL("..", import.meta.url));
const dist = path.join(appRoot, "dist");
let version = "dev";
for (const versionPath of [path.join(appRoot, "../VERSION"), path.join(appRoot, "VERSION")]) {
  try {
    version = fs.readFileSync(versionPath, "utf-8").trim();
    break;
  } catch {
    /* try next */
  }
}
fs.mkdirSync(dist, { recursive: true });
const body = JSON.stringify({ status: "ok", version });
fs.writeFileSync(path.join(dist, "health"), body);
fs.writeFileSync(path.join(dist, "health.json"), body);