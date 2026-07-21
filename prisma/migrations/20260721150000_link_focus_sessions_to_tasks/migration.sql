ALTER TABLE "FocusSession" ADD COLUMN "taskId" TEXT;

CREATE INDEX "FocusSession_taskId_idx" ON "FocusSession"("taskId");

ALTER TABLE "FocusSession" ADD CONSTRAINT "FocusSession_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;
