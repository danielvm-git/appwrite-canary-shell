#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/app"
export VITE_CANARY_NAME=ShellVerify
export VITE_REPO_URL=https://github.com/example/canary
export VITE_PRODUCT_LABEL=VerifyTodo
npm run build
bundle="$(ls dist/assets/index-*.js | head -1)"
grep -q ShellVerify "$bundle"
grep -q example/canary "$bundle"
echo "verify-story-e03s02: OK"