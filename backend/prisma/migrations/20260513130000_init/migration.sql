-- CreateTable
CREATE TABLE "users" (
    "id" VARCHAR(64) NOT NULL,
    "username" VARCHAR(191) NOT NULL,
    "email" VARCHAR(191) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateTable
CREATE TABLE "categories" (
    "id" VARCHAR(64) NOT NULL,
    "name" VARCHAR(191) NOT NULL,
    "color" VARCHAR(32) NOT NULL,
    "user_id" VARCHAR(64) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "categories_user_id_idx" ON "categories"("user_id");

-- CreateTable
CREATE TABLE "versions" (
    "id" VARCHAR(64) NOT NULL,
    "name" VARCHAR(191) NOT NULL,
    "description" TEXT NOT NULL,
    "release_date" VARCHAR(32) NOT NULL,
    "user_id" VARCHAR(64) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "versions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "versions_user_id_idx" ON "versions"("user_id");

-- CreateTable
CREATE TABLE "tasks" (
    "id" VARCHAR(64) NOT NULL,
    "title" VARCHAR(191) NOT NULL,
    "description" TEXT NOT NULL,
    "category_id" VARCHAR(64),
    "version_id" VARCHAR(64),
    "priority" VARCHAR(16) NOT NULL,
    "due_date" VARCHAR(128),
    "reminder_time" VARCHAR(128),
    "tags" JSONB NOT NULL,
    "notes" TEXT NOT NULL,
    "completed_pomodoros" INTEGER NOT NULL,
    "total_pomodoros" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "is_completed" BOOLEAN NOT NULL,
    "user_id" VARCHAR(64) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tasks_user_id_idx" ON "tasks"("user_id");

-- CreateIndex
CREATE INDEX "tasks_category_id_idx" ON "tasks"("category_id");

-- CreateIndex
CREATE INDEX "tasks_version_id_idx" ON "tasks"("version_id");

-- CreateTable
CREATE TABLE "sub_tasks" (
    "id" VARCHAR(64) NOT NULL,
    "task_id" VARCHAR(64) NOT NULL,
    "title" VARCHAR(191) NOT NULL,
    "description" TEXT NOT NULL,
    "is_completed" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sub_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sub_tasks_task_id_idx" ON "sub_tasks"("task_id");

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "versions" ADD CONSTRAINT "versions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_tasks" ADD CONSTRAINT "sub_tasks_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
