# New project from Appwrite Canaries scaffold

1. Pick language repo (`appwrite-canary-node` recommended).
2. **GitHub → Use this template** (enable template on Node repo only after pilot is live).
3. Rename remotes and Appwrite Site host in `docs/platform/DNS.md`.
4. Rotate secrets: `APPWRITE_*` in GitHub Actions.
5. Pin shell: `bash path/to/appwrite-canary-shell/scripts/sync-shell.sh .` then `echo vX.Y.Z > public/shell/SHELL_PIN`.
6. Keep single `VERSION` at repo root; never hardcode version in source.
7. Run `bash scripts/setup.sh` and `bash scripts/preflight.sh` before first PR.

## Version contract

`big-release` on `main` writes `VERSION` and the language manifest, then CI builds and deploys that SHA.