# appwrite-canary-shell

Shared **Todo React SPA** for Appwrite language canaries. Source lives in [`app/`](app/). Consumers sync via [`scripts/sync-shell.sh`](scripts/sync-shell.sh) v2 (shell 2.x).

**Program reference:** workspace `specs/product/TODO_APP_REQUIREMENTS.md`

## Develop

```bash
cd app && npm ci && npm run preflight && npm run build
```

Root shortcuts: `npm run preflight`, `npm run check` (sync temp consumer build).

## Pin shell in a consumer

After release tag `v2.x.x`:

```bash
bash /path/to/appwrite-canary-shell/scripts/sync-shell.sh /path/to/appwrite-canary-python
```

`public/shell/SHELL_PIN` is written with the shell tag. Set `VITE_*` in `.env` before build (see [`app/.env.example`](app/.env.example)).

## Deprecated

[`prototype/ds`](prototype/ds) and HTML prototype remain for history only; **not** synced in v2. Epic e03 replaces them with the Shadcn Todo app from the Node pilot.