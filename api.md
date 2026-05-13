# 项目字段说明（Backend + Frontend）

## 1) 通用响应结构（后端统一返回）

```json
{
  "code": 0,
  "data": {},
  "msg": ""
}
```

- `code`: 业务状态码，`0` 表示成功，非 `0` 表示失败（如鉴权失败、参数错误等）。
- `data`: 业务数据主体；查询通常是对象/数组，删除等场景可能为 `null`。
- `msg`: 提示信息；成功时常为空字符串，失败时为错误原因。

## 2) 认证模块字段（`/auth/*`）

### `register/login` 成功返回 `data`

- `token`: JWT 令牌，前端放到 `Authorization: Bearer <token>`。
- `user`: 当前登录用户信息。
  - `id`: 用户唯一 ID（字符串时间戳）。
  - `username`: 用户名。
  - `email`: 邮箱。

### `getUser` 返回的用户字段

- `id`: 用户唯一 ID。
- `username`: 用户名。
- `email`: 邮箱。
- `createdAt`: 用户创建时间（ISO 时间字符串）。

## 3) 任务模块字段（`/tasks/*`）

### Task 核心字段

- `id`: 任务唯一 ID。
- `title`: 任务标题（必填）。
- `description`: 任务描述。
- `categoryId`: 所属分类 ID，可为 `null`。
- `versionId`: 所属版本 ID，可为 `null`。
- `priority`: 优先级，枚举：`high` / `medium` / `low`。
- `dueDate`: 截止时间（ISO 时间），可为 `null`。
- `reminderTime`: 提醒时间（ISO 时间），可为 `null`。
- `tags`: 标签数组（字符串数组）。
- `notes`: 备注内容。
- `completedPomodoros`: 已完成番茄钟数量。
- `totalPomodoros`: 预估番茄钟总数。
- `createdAt`: 创建时间（ISO 时间）。
- `isCompleted`: 是否完成。
- `userId`: 所属用户 ID。

### Task 扩展展示字段（后端拼接返回）

- `categoryName`: 分类名称（由 `categoryId` 关联得到），可为 `null`。
- `categoryColor`: 分类颜色（Hex），可为 `null`。
- `versionName`: 版本名称（由 `versionId` 关联得到），可为 `null`。

### 新增任务约束（`POST /tasks`）

- `versionId` 必填：新增任务必须绑定一个已存在且属于当前用户的版本。

## 4) 分类模块字段（`/categories/*`）

- `id`: 分类唯一 ID。
- `name`: 分类名称（同一用户下通常不重复）。
- `color`: 分类颜色（如 `#3B82F6`）。
- `userId`: 所属用户 ID。
- `createdAt`: 创建时间（ISO 时间）。

## 5) 版本模块字段（`/versions/*`）

### Version 核心字段

- `id`: 版本唯一 ID。
- `name`: 版本名称。
- `description`: 版本说明。
- `releaseDate`: 发布日期（`YYYY-MM-DD`）。
- `userId`: 所属用户 ID。
- `createdAt`: 创建时间（ISO 时间）。

### 版本详情附带字段

- `tasks`: 该版本下的任务数组（每项为 Task 结构）。

## 6) 子任务模块字段（`/subtasks/*`）

- `id`: 子任务唯一 ID。
- `taskId`: 所属主任务 ID。
- `title`: 子任务标题（必填）。
- `description`: 子任务描述。
- `isCompleted`: 是否完成。
- `createdAt`: 创建时间（ISO 时间）。
- `updatedAt`: 更新时间（ISO 时间）。

## 7) 前端类型中的字段说明（非独立后端接口）

### 前端 `Task` 类型中的补充字段

- `category?`: 旧兼容字段，表示分类文案（当前主要使用 `categoryId/categoryName`）。
- `updatedAt`: 前端类型保留字段；后端 Task 主体当前主要返回 `createdAt`，`updatedAt` 主要出现在 SubTask。
- `subTasks?`: 前端详情展示时挂载的子任务列表（来源于 `/subtasks/:taskId`）。

### 前端设置 `Settings`（本地状态）

- `workDuration`: 工作时长（分钟）。
- `breakDuration`: 休息时长（分钟）。
- `autoStartBreak`: 工作结束后是否自动开始休息。
- `autoStartWork`: 休息结束后是否自动开始工作。
- `soundEnabled`: 是否开启声音提醒。
- `darkMode`: 是否开启深色模式。

### 前端统计 `DailyStats`（当前为前端 store 示例数据）

- `date`: 统计维度日期（如“周一”“第1周”）。
- `pomodoros`: 番茄钟数量。
- `minutes`: 专注分钟数。

## 8) 时间与格式约定

- 大多数时间字段采用 ISO 8601 字符串（如 `2026-05-12T06:00:00.000Z`）。
- `releaseDate` 为日期字符串（不含时间），格式 `YYYY-MM-DD`。
- ID 在当前实现中多为字符串化时间戳。

## 9) 批量导入任务（`/tasks/import/*`）

### 导入流程（MVP）

- `POST /tasks/import/precheck`：上传 Excel（`.xlsx`/`.xls`）文件，仅预检，不写入。
- `POST /tasks/import/commit`：传入 `importToken + fileHash`，确认导入。
- 预检通过才会返回 `importToken`；有效期 10 分钟。

### 请求与响应字段

- `precheck` 请求：`multipart/form-data`，字段 `file`。
- `precheck` 返回 `data`：
  - `totalRows` / `validRows` / `errorRows` / `warningRows`
  - `canCommit`
  - `importToken`（不可提交时为 `null`）
  - `fileHash`、`expiresAt`
  - `errors[]`：`rowIndex`、`field`、`reason`
  - `warnings[]`：`rowIndex`、`field`、`reason`
  - `normalizedRows[]`：标准化后预览（含 `title`、`subTaskCount` 等）
- `commit` 请求：JSON，必填 `importToken`、`fileHash`。
- `commit` 返回 `data`：
  - `createdTaskCount`
  - `createdSubtaskCount`
  - `skippedRelationCount`
  - `createdTasks[]`（创建成功的任务）

### 错误码（导入相关）

- `20012`：未上传文件，或文件扩展名不是 `.xlsx`/`.xls`。
- `20013`：文件为空或缺少数据行。
- `20014`：超过大小/行数限制。
- `20015`：预检或上传失败（格式异常）。
- `20017`：导入令牌无效。
- `20018`：令牌过期、用户不匹配或文件校验失败。
- `20019`：`commit` 参数缺失。

### 文件限制与默认规则

- 文件类型：`.xlsx` / `.xls`（须含 `tasks`、`subtasks` 工作表）。
- 文件大小：最大 5MB。
- 行数限制：单次最多 100 行任务。
- `xlsx/xls` 必须包含 `tasks` 与 `subtasks` 两个工作表。
- 必填字段：`title` / `主任务标题`（任务主表中的主任务标题，在**同一导入文件内须唯一**，供子任务表引用）。
- `priority` 非 `high|medium|low`：回退为 `medium` 并给出 warning。
- `totalPomodoros < 1` 或非法：回退为 `1` 并给出 warning。
- `dueDate/reminderTime` 解析失败：置空并给出 warning。
- `categoryName` 无匹配：置空并给出 warning（不阻断导入）。
- `versionName` 无匹配：**自动创建版本**并关联，同时给出 warning。
- 旧 `subTasks` 单列拼接格式已废弃（`| ; 换行 ::` 规则不再支持）。

### 导入模板列（双 Sheet）

#### tasks 工作表

- `主任务标题` 或 `title` / `任务标题`（必填，**同一文件内不可重复**）
- `description` / `任务描述`
- `priority` / `优先级`
- `dueDate` / `截止时间`
- `reminderTime` / `提醒时间`
- `tags` / `标签`（支持 `,`、`，`、`|` 分隔）
- `notes` / `备注`
- `totalPomodoros` / `预估番茄钟`
- `categoryName` / `分类`
- `versionName` / `版本`

#### subtasks 工作表

- `主任务标题` 或 `parentTitle` / `所属主任务`（必填，须与 tasks 中某行主任务标题**逐字一致**）
- `title` / `子任务标题`（必填）
- `description` / `子任务描述`

### 模板文件

- 双 Sheet xlsx 模板：`frontend/public/task-import-template.xlsx`
