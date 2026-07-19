-- CreateTable
CREATE TABLE "task_sessions" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "task_sessions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "task_sessions" ADD CONSTRAINT "task_sessions_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
