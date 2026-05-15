# 任务 / 番茄钟全栈演示

个人任务、版本、分类、提醒、统计与批量导入（Excel）。技术栈与协作边界见根目录 [AGENTS.md](AGENTS.md)。

## 环境要求

- **Node.js** ≥ 18（本地 smoke 与构建脚本依赖 `fetch`）。
- **PostgreSQL**（后端通过 Prisma 连接）。
- 仓库内 **无根级 `node_modules`**：依赖分别在 `backend/`、`frontend/` 下安装。

## 环境变量一览

### 后端 `backend/.env`

从 [backend/.env.example](backend/.env.example) 复制为 `backend/.env` 后填写（**勿将含真实密钥的 `.env` 提交到 Git**）。

| 变量 | 说明 |
|------|------|
| `DATABASE_URL` | Prisma 连接串，如 `postgresql://USER:PASSWORD@localhost:5432/DBNAME?schema=public` |
| `JWT_SECRET` | 签发 JWT 的密钥，生产环境须为足够长的随机串 |
| `PORT` | HTTP 端口，默认未设置时代码侧为 `3000`；示例与前端默认联调为 **8089**，建议与 `.env.example` 一致 |

### 前端 `frontend/.env.local`（可选）

| 变量 | 说明 |
|------|------|
| `VITE_API_BASE_URL` | 后端 API 根路径，**须以 `/api` 结尾**，例如 `http://localhost:8089/api`。未配置时前端内置默认 `http://localhost:8089/api`。 |

生产构建前请注入正确的 `VITE_API_BASE_URL`，否则打包后的页面仍会请求构建机上的默认地址。

## 本地运行

### 1. 数据库与后端

```bash
cd backend
cp .env.example .env   # Windows: copy .env.example .env
# 编辑 .env：DATABASE_URL、JWT_SECRET、PORT（建议 8089）
npm ci
npx prisma migrate deploy
npm run dev
```

启动后控制台会打印 `Swagger` 与 `OpenAPI JSON` 地址。根路径 `GET /` 返回统一信封 `{ code, data, msg }`。

### 2. 前端

```bash
cd frontend
npm ci
npm run dev
```

浏览器访问 Vite 提示的本地地址；需与 `VITE_API_BASE_URL` / 默认后端端口一致。

### 3. 生产构建（摘要）

```bash
cd backend && npm ci && npm run build && npm start
cd frontend && npm ci && npm run build
```

将 `frontend/dist` 置于静态资源服务器；确保用户浏览器能访问后端 API（同源反向代理或配置 **CORS**：当前开发态为 `cors()` 全开，生产环境建议按域名收紧）。

## 上线前自检（可选）

在**后端已启动**且端口与 `SMOKE_BASE_URL` 一致时，于仓库根目录执行：

```bash
npm run smoke
```

默认请求 `http://localhost:8089` 的根路径与 `/docs.json`。自定义示例：

```bash
set SMOKE_BASE_URL=http://127.0.0.1:3000&& npm run smoke
# Linux/macOS: SMOKE_BASE_URL=http://127.0.0.1:3000 npm run smoke
```

根目录 [package.json](package.json) 还提供 `build:backend`、`build:frontend`、`build:all` 便于本地一次性构建。

## 试用说明（小范围用户）

- 番茄「今日完成」与按周统计保存在浏览器 **localStorage**，换设备或清除站点数据后会重置。
- **浏览器任务提醒**：在「提醒中心」请求通知权限后，应用需保持打开；系统在任务 `reminderTime` 之后约 **10 分钟内**尝试弹出一次系统通知（详见该页说明）。

## CI

见 [`.github/workflows/ci.yml`](.github/workflows/ci.yml)：在 `push`/`pull_request`（`main`、`master`）及 **手动 `workflow_dispatch`** 时执行：

1. **backend** / **frontend**：各自 `npm ci` 与 `npm run build`（纯编译，不连库）。
2. **integration**（在以上两个 job 均成功后）：启动 **PostgreSQL 16** 服务容器，设置 `DATABASE_URL` / `JWT_SECRET` / `PORT=8089`，在 `backend` 内 `npm ci`、`npm run build`、`prisma migrate deploy`，后台启动 `node dist/server.js`，用根路径 JSON 轮询就绪后，在仓库根执行 `SMOKE_BASE_URL=... node scripts/smoke.mjs`（与本地 `npm run smoke` 同源脚本）。

可执行步骤写在仓库根目录 [`ci/`](ci/)（如 `github-actions-integration.sh`）；**日常改 CI 逻辑优先改这些脚本**，少动 `.github/workflows/ci.yml`（用 PAT 推送时，修改 workflow 文件需要 token 具备 `workflow` 权限）。

> 说明：integration 仅验证「迁移可应用 + API 可启动 + 根路径与 OpenAPI 可读」，**不**跑浏览器端到端或登录业务流；完整联调仍依赖本地或预发环境。

## 故障排查

| 现象 | 建议 |
|------|------|
| Prisma 报连不上库 | 检查 `DATABASE_URL`、PostgreSQL 是否监听、库是否已创建 |
| 前端 401 / 网络错误 | 核对 `VITE_API_BASE_URL`、后端 `PORT`、防火墙 |
| `prisma migrate deploy` 失败 | 确认迁移目录已随仓库拉取；勿在已忽略路径手工改库结构而不写迁移 |

## 变更记录

见 [CHANGELOG.md](CHANGELOG.md)。
