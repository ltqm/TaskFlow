# AGENTS — 仓库协作说明

本文件供人类协作者与 AI Agent（如 Cursor）快速对齐本仓库边界与习惯。**修改代码前请按范围阅读对应子文档。**

## 项目概览

全栈任务/番茄钟类演示应用：

- **后端**：Node.js + TypeScript + Express + Prisma（PostgreSQL）+ JWT。
- **前端**：Vue 3 + Vite + TypeScript + Pinia + Vue Router + Tailwind + Reka UI / shadcn-vue 风格组件。

## 必读范围（工作边界）

| 修改范围 | 请先阅读 |
|----------|----------|
| 仅后端（API、数据库、鉴权、导入等） | [backend/AGENTS.md](backend/AGENTS.md) |
| 仅前端（页面、组件、状态、调用 API） | [frontend/AGENTS.md](frontend/AGENTS.md) |
| 跨端（路由/字段/错误码/契约变更） | **同时**阅读上述两份，并同步契约文档（见下） |

## 环境与密钥

- **勿**将 `.env`、真实数据库口令、JWT 密钥等提交到版本库（`.gitignore` 已忽略 `.env`）。
- 后端：`DATABASE_URL` 等见 `backend/.env`（本地自建，不入库）。
- 前端：可选 `VITE_API_BASE_URL`；未配置时使用 `frontend` 内默认开发地址（见 [frontend/AGENTS.md](frontend/AGENTS.md)）。

## 文档与契约

- 接口与业务约定摘要：[api.md](api.md)。
- OpenAPI / Swagger 定义：[backend/src/config/swagger.ts](backend/src/config/swagger.ts)。

**跨端变更时**：更新实现、`swagger` 与 `api.md` 中相关段落，避免前后端不一致。

## 常用命令（索引）

在仓库根目录分别进入子项目执行：

```bash
cd backend && npm run dev    # 后端开发
cd backend && npm run build  # 后端构建（含 prisma generate + tsc）

cd frontend && npm run dev   # 前端开发
cd frontend && npm run build # 前端构建（vue-tsc + vite）
```

根目录另有轻量脚本（无需在根安装依赖）：`npm run smoke`（需后端已启动，见 [README.md](README.md)）。

细节、目录结构与禁区见子目录 `AGENTS.md`。

## 通用协作规则

- **小步修改**：只改任务所需文件，避免无关重构与大面积格式化。
- **勿**手工提交 `node_modules/`、`dist/`、`build/` 等生成物或依赖目录（已由 `.gitignore` 忽略）。
- **提交信息**：用完整句子说明「改了什么、为什么」，避免无意义占位文案。
- **与用户沟通语言**：简体中文（除非用户明确要求其他语言）。

## 子文档入口

- [backend/AGENTS.md](backend/AGENTS.md) — Express、Prisma、路由、响应格式、迁移与禁区。
- [frontend/AGENTS.md](frontend/AGENTS.md) — Vue、Pinia、API 封装、UI 约定与禁区。
