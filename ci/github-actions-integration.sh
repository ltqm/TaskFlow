#!/usr/bin/env bash
# 供 GitHub Actions integration job 调用：迁移 → 起 API → smoke。
# 依赖 workflow 中已配置的 PostgreSQL service 与 DATABASE_URL / JWT_SECRET / PORT。
set -eu
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT/backend"
npm ci
npm run build
npx prisma migrate deploy

node dist/server.js &
PID=$!
cleanup() { kill "$PID" 2>/dev/null || true; }
trap cleanup EXIT

PORT_VALUE="${PORT:-8089}"
for i in $(seq 1 90); do
  if out=$(curl -sf "http://127.0.0.1:${PORT_VALUE}/" 2>/dev/null) && echo "$out" | grep -q '"code":0'; then
    echo "Backend ready after ${i}s"
    break
  fi
  if [[ "$i" -eq 90 ]]; then
    echo "Timeout waiting for backend"
    exit 1
  fi
  sleep 1
done

cd "$ROOT"
SMOKE_BASE_URL="http://127.0.0.1:${PORT_VALUE}" node scripts/smoke.mjs
