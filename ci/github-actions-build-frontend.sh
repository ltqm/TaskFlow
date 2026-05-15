#!/usr/bin/env bash
# 供 GitHub Actions frontend job 调用。
set -eu
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT/frontend"
npm ci
npm run build
