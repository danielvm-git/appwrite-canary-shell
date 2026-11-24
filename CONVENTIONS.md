# CONVENTIONS — appwrite-canary-shell

## Git

- Conventional Commits on all commits.
- No `Co-authored-by` footers.
- No direct feature work on `main` after initial scaffold (use feature branches).

## specs/

All planning output lives under `specs/`. Edit YAML cockpit files; do not duplicate plan in chat only.

## Generated / vendored

- `prototype/ds/` is vendored BigBase DS — bump only with intentional DS upgrades.
- Consumers receive copies via `scripts/sync-shell.sh`, not submodule.

## Tests

Shell script changes require a test in `scripts/` or `tests/` that `sync-shell.sh --check` passes.