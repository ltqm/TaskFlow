# 批量导入任务验收用例（MVP）

## 1. 成功导入（含子任务和关联）
- 前置：用户存在 `Work` 分类与 `Release-1.0` 版本。
- 输入：上传合法 CSV，2 行任务，均含 `title`，并提供 `subTasks`。
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

## 4. 超限拦截
- 输入：101 行任务数据文件。
- 预期：
  - `precheck` 返回 HTTP 400，`code=20014`。
  - 提示单次最多 100 行。

## 5. 非法格式与空文件
- 输入：无 `file` 字段或空数据文件。
- 预期：
  - 无文件：HTTP 400，`code=20012`。
  - 空文件：HTTP 400，`code=20013`。

## 6. 鉴权失败
- 输入：不带 token 调用 `precheck/commit`。
- 预期：
  - HTTP 401，`code=10001`，`msg=未授权`。

## 7. 预检令牌校验
- 场景：
  - `commit` 时缺 `importToken/fileHash`；
  - 使用过期令牌；
  - 使用错误 `fileHash`。
- 预期：
  - 分别返回 `code=20019`、`code=20018`、`code=20018`。
