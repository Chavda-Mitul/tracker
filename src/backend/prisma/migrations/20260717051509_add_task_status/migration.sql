-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'COMPLETED', 'DISCARDED');

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "status" "TaskStatus" NOT NULL DEFAULT 'PENDING';
