#!/usr/bin/env bash
# story: e00s01
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

usage() {
  echo "Usage: bash scripts/sync-shell.sh --check"
  echo "       bash scripts/sync-shell.sh <consumer-repo-root>"
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
  test -f "$ROOT/docs/footer.contract.schema.json"
  test -d "$ROOT/prototype/ds"
  test -f "$ROOT/prototype/node-scaffold-prototype.html"
  echo "OK: sync-shell prerequisites"
  exit 0
fi

if [[ -z "$TARGET" ]]; then
  echo "error: consumer repo path required" >&2
  usage >&2
  exit 1
fi

if [[ ! -d "$TARGET" ]]; then
  echo "error: not a directory: $TARGET" >&2
  exit 1
fi

DEST="$TARGET/public/shell"
mkdir -p "$DEST/ds"

rsync -a --delete "$ROOT/prototype/ds/" "$DEST/ds/"
install -m 644 "$ROOT/docs/footer.contract.schema.json" "$DEST/"
install -m 644 "$ROOT/docs/footer.contract.example.json" "$DEST/footer.contract.json"
install -m 644 "$ROOT/prototype/node-scaffold-prototype.html" "$DEST/reference-prototype.html"

TAG_FILE="$DEST/SHELL_PIN"
if [[ ! -f "$TAG_FILE" ]]; then
  echo "unpinned" >"$TAG_FILE"
fi

echo "synced shell → $DEST"