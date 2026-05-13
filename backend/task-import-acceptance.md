# 批量导入任务验收用例（MVP）

## 1. 双 Sheet 成功导入（含子任务和关联）
- 前置：用户存在 `Work` 分类与 `Release-1.0` 版本。
- 输入：上传合法 xlsx，包含 `tasks` + `subtasks` 两个 sheet。
- 预期：
  - `precheck` 返回 `code=0`、`canCommit=true`、`errorRows=0`。
  - `commit` 返回 `createdTaskCount=2`，`createdSubtaskCount` 与输入一致。
  - 创建任务中包含展示字段 `categoryName/versionName`。

## 2. 存在 warning 但可导入
- 输入：`priority=urgent`、`totalPomodoros=0`、`dueDate=invalid-date`。
- 预期：
  - `precheck` 返回 `canCommit=true`，`warnings` 包含三类回退说明。
  - `commit` 后任务优先级为 `medium`，番茄数为 `1`，时间字段为 `null`。

## 3. 错误行阻断提交
- 输入：至少一行 `title` 为空。
- 预期：
  - `precheck` 返回 `canCommit=false`，`errors` 包含 `title` 错误。
  - 不返回可用 `importToken`。

## 4. 主任务标题引用校验
- 输入：`subtasks` 中「主任务标题」在 `tasks` 中不存在（拼写不一致或未填写主行）。
- 预期：
  - `precheck` 返回 `canCommit=false`。
  - `errors` 中包含 `subtasks.parentTitle` 的「未找到主任务」类错误。

## 5. 主任务标题唯一性校验
- 输入：`tasks` 中出现重复的主任务标题（`title` / `主任务标题` 列去空格后相同）。
- 预期：
  - `precheck` 返回 `canCommit=false`。
  - `errors` 中包含 `title` 的「重复」说明。

## 6. 旧格式失败（不兼容）
- 输入：仅 `tasks` sheet 且仍使用 `subTasks` 单列拼接字符串。
- 预期：
  - `precheck` 返回 `canCommit=false`。
  - `errors` 中提示旧 `subTasks` 格式已废弃，请使用 `subtasks` sheet。

## 7. 超限拦截
- 输入：101 行任务数据文件。
- 预期：
  - `precheck` 返回 HTTP 400，`code=20014`。
  - 提示单次最多 100 行。

## 8. 非法格式与空文件
- 输入：无 `file` 字段或空数据文件。
- 预期：
  - 无文件：HTTP 400，`code=20012`。
  - 空文件：HTTP 400，`code=20013`。

## 9. 鉴权失败
- 输入：不带 token 调用 `precheck/commit`。
- 预期：
  - HTTP 401，`code=10001`，`msg=未授权`。

## 10. 预检令牌校验
- 场景：
  - `commit` 时缺 `importToken/fileHash`；
  - 使用过期令牌；
  - 使用错误 `fileHash`。
- 预期：
  - 分别返回 `code=20019`、`code=20018`、`code=20018`。

## 11. CSV 降级导入
- 输入：上传 CSV（仅 tasks 主表字段，不含 subtasks）。
- 预期：
  - `precheck` 返回 `canCommit=true`。
  - `warnings` 包含“CSV 仅支持 tasks 主表，子任务不会被导入”。
  - `commit` 后 `createdSubtaskCount=0`。
