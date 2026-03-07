import type { JobDefinition } from "../job-definition";

import { db } from "../../db";

const FAILED_RETENTION_MINUTES = 60 * 24; // 24h
const COMPLETED_RETENTION_MINUTES = 60;   // 1h
const JOB_TIMEOUT_MINUTES = 10;           // 10m

export const CleanupJobsJob: JobDefinition = {
  run: async () => {
    const now = new Date();

    // delete old failed jobs
    const failedRetentionDate = new Date(now);
    failedRetentionDate.setMinutes(now.getMinutes() - FAILED_RETENTION_MINUTES);

    await db.job.deleteMany({
      where: { state: 'Failed', completedAt: { lt: failedRetentionDate }, cron: null },
    });

    // delete old completed jobs
    const completedRetentionDate = new Date(now);
    completedRetentionDate.setMinutes(now.getMinutes() - COMPLETED_RETENTION_MINUTES);

    await db.job.deleteMany({
      where: { state: 'Completed', completedAt: { lt: completedRetentionDate }, cron: null },
    });

    // mark timed out running jobs as failed
    const timeoutDate = new Date(now);
    timeoutDate.setMinutes(now.getMinutes() - JOB_TIMEOUT_MINUTES);

    await db.job.updateMany({
      where: { state: 'Running', startedAt: { lt: timeoutDate }, NOT: { flags: { has: 'LONG_RUNNING' }}},
      data: { state: 'Failed', output: 'Timeout', completedAt: now },
    });
  },
};
