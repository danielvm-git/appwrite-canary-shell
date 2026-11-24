# AGENTS — appwrite-canary-shell

Shared UI shell for Appwrite Canaries. Master plan: `specs/MASTER_PLAN.md`.

## Commands

| Action | Command |
|--------|---------|
| Prototype | `cd prototype && python3 -m http.server 8765` |
| Sync check | `bash scripts/sync-shell.sh --check` |
| Sync apply | `bash scripts/sync-shell.sh <target-repo>` |

## Session start

1. Read `CONVENTIONS.md`
2. Read `specs/state.yaml`
3. Read `specs/release-plan.yaml`

## Rules

- Route feature work through bigpowers skills (`plan-work`, `develop-tdd`).
- Version contract in `specs/MASTER_PLAN.md` applies to consumer repos, not shell tags in app footers.