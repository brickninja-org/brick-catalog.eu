import { db } from "./db";
import { executeJob } from "./execute-job";

export const worker = {
  pollTimeout: undefined as NodeJS.Timeout | undefined,
  lastPollAt: new Date(),
  shuttingDown: false,

  shutdown() {
    clearTimeout(this.pollTimeout);
    this.shuttingDown = true;
  },

  start() {
    console.log('Waiting for jobs...');
    void this.pollAndRunNextJob();
  },

  async pollAndRunNextJob() {
    this.lastPollAt = new Date();

    const nextJob = await db.job.findFirst({
      where: {
        // only run jobs scheduled for now or earlier
        scheduledAt: { lte: new Date() },
        OR: [
          // queued jobs
          { state: 'Queued' },

          // completed cron jobs waiting to be rescheduled
          { state: { in: ['Failed', 'Completed'] }, cron: { not: null }},
        ],
      },
      orderBy: [{ priority: 'desc' }, { scheduledAt: 'asc' }],
    });

    if (!nextJob) {
      if (!this.shuttingDown) {
        this.pollTimeout = setTimeout(() => void this.pollAndRunNextJob(), 10_000);
      } else {
        console.log('Shutting down...');
      }
      return;
    }

    // execute the next job
    await executeJob(nextJob);

    // continue polling unless the worker is shutting down
    if (!this.shuttingDown) {
      this.pollTimeout = setTimeout(() => void this.pollAndRunNextJob(), 1_000);
    } else {
      console.log('Shutting down...');
    }
  },
}
