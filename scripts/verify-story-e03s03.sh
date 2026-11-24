#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
bash "$ROOT/scripts/sync-shell.sh" "$tmp"
pin="$(cat "$tmp/public/shell/SHELL_PIN")"
[[ -n "$pin" ]]
test -f "$tmp/src/App.tsx"
(cd "$tmp" && npm ci && npm run build)
echo "verify-story-e03s03: OK (pin $pin)"