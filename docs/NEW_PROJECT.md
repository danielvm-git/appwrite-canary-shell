# Consume the shell Todo app in a language canary

1. Checkout a shell release tag (2.x+) or run sync from a local clone.
2. From the **consumer repo root** (node, python, php, go):

```bash
bash ../appwrite-canary-shell/scripts/sync-shell.sh .
```

3. Copy env and set canary-specific values:

```bash
cp .env.example .env
# VITE_SHARE_FUNCTION_ID=share-task-python (etc.)
# VITE_CANARY_NAME=Python
# VITE_REPO_URL=https://github.com/danielvm-git/appwrite-canary-python
```

4. `public/shell/SHELL_PIN` records the shell git tag from sync.

5. `npm ci && npm run preflight && npm run build` — deploy `dist/` to the Appwrite Site (consumer CI).

6. Keep a single `VERSION` at consumer repo root (big-release); never hardcode version in source.

## Legacy (deprecated)

`prototype/ds` CSS sync is removed in shell 2.x. Use the React `app/` sync only.