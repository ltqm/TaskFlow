#!/usr/bin/env bash
# 供 GitHub Actions backend job 调用；逻辑放在仓库根目录，便于少改 workflow 文件。
set -eu
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT/backend"
npm ci
npm run build
