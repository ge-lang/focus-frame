-- Persist task workflow data and provide an index for user-scoped task queries.
CREATE TYPE "TaskStatus" AS ENUM ('todo', 'in_progress', 'done');
CREATE TYPE "TaskPriority" AS ENUM ('low', 'medium', 'high');

ALTER TABLE "Task"
  ADD COLUMN "status" "TaskStatus" NOT NULL DEFAULT 'todo',
  ADD COLUMN "priority" "TaskPriority" NOT NULL DEFAULT 'medium',
  ADD COLUMN "dueDate" TIMESTAMP(3);

CREATE INDEX "Task_userId_status_idx" ON "Task"("userId", "status");
