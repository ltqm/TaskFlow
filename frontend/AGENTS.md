# AGENTS — 前端（frontend）

面向在本目录或 `frontend/src/**` 下工作的协作者与 AI Agent。

## 技术栈

- **框架**：Vue 3（Composition API）  
- **构建**：Vite + TypeScript  
- **状态**：Pinia  
- **路由**：Vue Router  
- **样式**：Tailwind CSS  
- **组件**：Reka UI + 与 [components.json](components.json) 一致的 **shadcn-vue / new-york** 风格封装（`src/components/ui/**`）  
- **HTTP**：Axios（统一封装于 [src/services/api.ts](src/services/api.ts)）  
- **图标**：lucide-vue-next  

## 目录与职责

| 路径 | 说明 |
|------|------|
| [src/main.ts](src/main.ts) | 应用入口 |
| [src/App.vue](src/App.vue) | 根组件、全局加载与布局壳 |
| [src/router/index.ts](src/router/index.ts) | 路由表 |
| [src/views/](src/views/) | 页面级视图 |
| [src/stores/](src/stores/) | Pinia 状态模块 |
| [src/services/api.ts](src/services/api.ts) | API 基址、拦截器、`requestData` 与业务方法 |
| [src/types/index.ts](src/types/index.ts) | 与后端对齐的 TS 类型 |
| [src/components/ui/](src/components/ui/) | 可复用基础 UI（Button、Card、Pagination 等） |
| [src/components/](src/components/) | 业务组件（含 `task-import` 等） |
| [public/](public/) | 静态资源（如任务导入模板 `task-import-template.xlsx`） |

## 代码约定

- **新组件 / 新页面**：优先 `<script setup lang="ts">`，类型明确；避免在无必要时引入 Options API。
- **样式**：以 Tailwind 工具类为主；与现有 `Button`、`Card`、`Input` 等保持视觉与间距一致。
- **状态**：跨页面共享数据用 Pinia；单次请求优先在视图或 composable 内组合 `api` 与本地 `ref`。
- **API 调用**：统一通过 [src/services/api.ts](src/services/api.ts)；成功载荷需符合后端 `code === 0` 的 envelope（见 `unwrapResponse`）。
- **环境变量**：`VITE_API_BASE_URL` 可覆盖后端根地址；未设置时默认 **`http://localhost:8089/api`**（与当前 `api.ts` 一致）。部署时务必在构建环境注入正确值。

## 常用命令

```bash
npm install
npm run dev      # Vite 开发服务器
npm run build    # vue-tsc && vite build
npm run preview  # 预览生产构建
```

本地开发需后端已启动且 CORS/端口与 `VITE_API_BASE_URL` 一致。

## 与后端协作

- 新增或修改接口路径、query、body、错误码时：同步阅读仓库根 [api.md](../api.md) 与 [../backend/src/config/swagger.ts](../backend/src/config/swagger.ts)，并更新 `api.ts` 中的类型与方法。
- **静态模板路径**（如批量导入下载链接）：若移动 `public/` 下文件，需全局搜索引用（例如 `TaskImportModal.vue` 中的 `href`）。

## 禁区与注意事项

- **不要**对无关文件做全量格式化或重排 import，除非用户明确要求。
- **不要**把密钥写入前端代码或 `.env` 并提交；仅使用 `VITE_*` 且非敏感配置（鉴权仍走后端 JWT）。
- 新增 shadcn 组件时：优先与现有 [components.json](components.json) 别名一致；若 CLI registry 不可用，可手写组件但需保持 API 与样式 token（`border-border`、`ring-ring` 等）一致。

## 上级说明

全仓总览与跨端规则见仓库根 [../AGENTS.md](../AGENTS.md)。
