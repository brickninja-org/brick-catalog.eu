-- CreateEnum
CREATE TYPE "JobState" AS ENUM ('Queued', 'Running', 'Completed', 'Failed');

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "state" "JobState" NOT NULL DEFAULT 'Queued',
    "output" TEXT NOT NULL DEFAULT '',
    "flags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "cron" TEXT,
    "scheduledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);
