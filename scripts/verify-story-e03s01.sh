#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/app"
npm ci
CI=1 npm test
npm run build
test -f dist/index.html
echo "verify-story-e03s01: OK"