-- PostgreSQL column comments (visible in Navicat design view / pg_description)
COMMENT ON COLUMN "tasks"."id" IS '任务唯一 ID';
COMMENT ON COLUMN "tasks"."title" IS '任务标题';
COMMENT ON COLUMN "tasks"."description" IS '任务详细描述';
COMMENT ON COLUMN "tasks"."category_id" IS '所属分类 ID，可为空';
COMMENT ON COLUMN "tasks"."version_id" IS '所属版本 ID，可为空';
COMMENT ON COLUMN "tasks"."priority" IS '优先级：high / medium / low';
COMMENT ON COLUMN "tasks"."due_date" IS '截止日期（字符串存储）';
COMMENT ON COLUMN "tasks"."reminder_time" IS '提醒时间（字符串存储）';
COMMENT ON COLUMN "tasks"."tags" IS '标签 JSON 数组';
COMMENT ON COLUMN "tasks"."notes" IS '任务备注，由用户在应用内填写';
COMMENT ON COLUMN "tasks"."completed_pomodoros" IS '已完成番茄钟数';
COMMENT ON COLUMN "tasks"."total_pomodoros" IS '预估番茄钟总数';
COMMENT ON COLUMN "tasks"."created_at" IS '创建时间';
COMMENT ON COLUMN "tasks"."is_completed" IS '主任务是否已完成（含子任务全完成同步）';
COMMENT ON COLUMN "tasks"."user_id" IS '所属用户 ID';
