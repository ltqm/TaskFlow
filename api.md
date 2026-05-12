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
