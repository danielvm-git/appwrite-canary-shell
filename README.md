# appwrite-canary-shell

Shared UI shell for **Appwrite Canaries**: Appwrite Console–like layout (top nav, sidebar, footer) with BigBase-compatible footer content.

This repo has **no runtime deploy**. Consumer repos (`appwrite-canary-node`, etc.) sync assets via `scripts/sync-shell.sh` (e00).

**Master plan:** [specs/MASTER_PLAN.md](specs/MASTER_PLAN.md)

**Prototype (e00):** [prototype/node-scaffold-prototype.html](prototype/node-scaffold-prototype.html) — landing + console, BigBase [Design System](prototype/ds/README.md), Sites panel lists [node/python/php/go].danielvm.net. Serve from `prototype/`: `python3 -m http.server 8765`.

**e02:** `sync-shell.sh --check` green; release tags prove SemVer loop.

## Pin shell in a consumer

After release tag `v0.1.0`:

```bash
bash scripts/sync-shell.sh /path/to/appwrite-canary-node
echo v0.1.0 > /path/to/appwrite-canary-node/public/shell/SHELL_PIN
```

Consumers record the site version in repo root `VERSION` (big-release), not in `vendor/shell/VERSION`. The pin file is `public/shell/SHELL_PIN`.