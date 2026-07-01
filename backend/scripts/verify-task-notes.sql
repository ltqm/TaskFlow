-- 在 Navicat / psql 中执行，用于确认「备注」业务数据已写入数据库。
-- 若结果为空，请在任务表单填写备注并保存后重试。
SELECT id, title, left(notes, 120) AS notes_preview
FROM tasks
WHERE notes IS NOT NULL AND btrim(notes) <> ''
ORDER BY created_at DESC
LIMIT 20;
