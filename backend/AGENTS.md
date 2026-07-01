# AGENTS — 后端（backend）

面向在本目录或 `backend/src/**` 下工作的协作者与 AI Agent。

## 技术栈

- **运行时**：Node.js + TypeScript  
- **Web**：Express  
- **ORM / 数据库**：Prisma + **PostgreSQL**（`DATABASE_URL`）  
- **鉴权**：JWT（`Authorization: Bearer <token>`）  
- **上传**：Multer（如任务导入预检）  
- **表格**：`xlsx` 解析；`exceljs` 仅用于脚本生成导入模板（见 `package.json` scripts）

## 目录与职责

| 路径 | 说明 |
|------|------|
| [src/server.ts](src/server.ts) | 服务启动入口 |
| [src/app.ts](src/app.ts) | Express 应用装配 |
| [src/routes/index.ts](src/routes/index.ts) | 路由注册；部分路径含 OpenAPI JSDoc |
| [src/controllers/](src/controllers/) | 按资源拆分的请求处理（tasks、auth、versions 等） |
| [src/middleware/auth.ts](src/middleware/auth.ts) | JWT 鉴权中间件 |
| [src/utils/response.ts](src/utils/response.ts) | 统一 `ok` / `fail` 响应封装 |
| [src/database.ts](src/database.ts) | Prisma 数据访问与领域函数 |
| [prisma/schema.prisma](prisma/schema.prisma) | 数据模型 |
| [prisma/migrations/](prisma/migrations/) | 迁移 SQL |

## API 与响应约定

- 成功/失败统一使用 [src/utils/response.ts](src/utils/response.ts) 中的 **`ok`** / **`fail`**，保持与前端 `unwrapResponse` 约定的 `code` / `data` / `msg` 结构一致。
- 需要文档化的 HTTP 接口：在 [src/routes/index.ts](src/routes/index.ts) 的 JSDoc 中维护，并与 [src/config/swagger.ts](src/config/swagger.ts) 的 schema 对齐。
- **变更契约时**：同步更新仓库根目录 [api.md](../api.md) 中对应章节。

## 常用命令

```bash
npm install
npm run dev              # ts-node-dev 热重载开发
npm run build            # prisma generate && tsc
npm start                # node dist/server.js（需先 build）

npm run prisma:generate  # 仅生成 Prisma Client
npm run prisma:migrate   # 生产/部署环境 migrate deploy

npm run generate:import-template  # 生成 Excel 导入模板到 frontend/public（依赖 exceljs）
```

Prisma 迁移开发流（本地）：使用 `npx prisma migrate dev` 等标准流程；迁移文件入 `prisma/migrations/` 后应纳入版本控制。

## 鉴权与敏感数据

- 受保护路由需经 `authenticateToken`（见 [src/middleware/auth.ts](src/middleware/auth.ts)）。
- 密码使用 bcrypt；JWT `secret` 来自环境变量，**不得**硬编码或写入仓库。

## 禁区与注意事项

- **不要**将 `dist/`、`.env`、`backend/data/`（若存在旧 JSON 数据目录）强行加入 Git；遵循根目录 [.gitignore](../.gitignore)。
- 修改 Prisma schema 后需迁移 + `prisma generate`；避免在业务代码里手写与 schema 冲突的 SQL，除非有明确理由并加注释。
- 任务批量导入等逻辑若影响字段/错误码，需同步 **swagger**、**api.md** 与前端 [../frontend/AGENTS.md](../frontend/AGENTS.md) 中提到的 API 封装。

## 与前端协作

- 前端默认通过 `VITE_API_BASE_URL` 或内置默认地址访问 `/api` 前缀下的路由（以前端配置为准）。
- 列表分页等新增 query 参数时，在 `api.md` 与 swagger 中写清「可选 / 默认 / 返回形状」。
