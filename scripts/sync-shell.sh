#!/usr/bin/env bash
# story: e03s03 — sync Todo app/ into consumer repos (v2)
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP="$ROOT/app"

usage() {
  echo "Usage: bash scripts/sync-shell.sh --check"
  echo "       bash scripts/sync-shell.sh <consumer-repo-root>"
}

shell_tag() {
  if git -C "$ROOT" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    git -C "$ROOT" describe --tags --always 2>/dev/null || echo "unpinned"
  else
    echo "unpinned"
  fi
}

run_check() {
  [[ -d "$APP/src" ]] || { echo "missing $APP/src" >&2; exit 1; }
  [[ -f "$APP/package.json" ]] || { echo "missing $APP/package.json" >&2; exit 1; }
  test -f "$ROOT/docs/footer.contract.schema.json"
  local tmp
  tmp="$(mktemp -d)"
  trap 'rm -rf "$tmp"' RETURN
  mkdir -p "$tmp/scripts"
  sync_into "$tmp"
  (cd "$tmp" && npm ci && npm run build)
  echo "OK: sync-shell v2 check"
}

sync_into() {
  local target="$1"
  local tag
  tag="$(shell_tag)"

  if [[ ! -d "$target" ]]; then
    echo "error: not a directory: $target" >&2
    exit 1
  fi

  rsync -a --delete "$APP/src/" "$target/src/"
  for f in index.html package.json package-lock.json vite.config.ts tsconfig.json eslint.config.js vitest.config.ts .env.example; do
    if [[ -f "$APP/$f" ]]; then
      install -m 644 "$APP/$f" "$target/$f"
    fi
  done
  if [[ -f "$APP/scripts/write-dist-health.mjs" ]]; then
    mkdir -p "$target/scripts"
    install -m 644 "$APP/scripts/write-dist-health.mjs" "$target/scripts/write-dist-health.mjs"
  fi

  mkdir -p "$target/public/shell"
  install -m 644 "$ROOT/docs/footer.contract.schema.json" "$target/public/shell/"
  install -m 644 "$ROOT/docs/footer.contract.example.json" "$target/public/shell/footer.contract.json"
  printf '%s\n' "$tag" >"$target/public/shell/SHELL_PIN"

  echo "synced shell app → $target (pin $tag)"
}

CHECK=0
TARGET=""

for arg in "$@"; do
  case "$arg" in
    --check) CHECK=1 ;;
    -h | --help) usage; exit 0 ;;
    *) TARGET="$arg" ;;
  esac
done

if ((CHECK)); then
  run_check
  exit 0
fi

if [[ -z "$TARGET" ]]; then
  echo "error: consumer repo path required" >&2
  usage >&2
  exit 1
fi

sync_into "$TARGET"