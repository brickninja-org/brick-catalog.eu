import type { Job } from '@brickcatalog/database';

import { styleText } from 'node:util';

import { CronExpressionParser } from 'cron-parser';

import { db } from './db';
import { jobRegistry } from './jobs/job-registry';

export async function executeJob(job: Job) {
  const startedAt = new Date();

  // claim the job by marking it as running
  // include the current state in the where clause so we can detect whether another worker already claimed it
  const claimResult = await db.job.updateMany({
    where: { id: job.id, state: job.state },
    data: { state: 'Running', startedAt },
  });

  if (claimResult.count === 0) {
    console.log(styleText('yellow', `Job ${job.id} already claimed by another worker`));

    return;
  }

  try {
    // look up the job definition
    const jobDefinition = jobRegistry[job.type];

    if (!jobDefinition) {
      throw new Error(`Unknown job type ${job.type}`);
    }

    // execute the job
    const jobPayload = (job.payload as object | null) ?? undefined;
    const jobOutput = await jobDefinition.run(jobPayload);

    const completedAt = new Date();

    await db.job.update({
      where: { id: job.id },
      data: {
        state: 'Completed',
        completedAt,
        output: jobOutput ?? '',
      },
    });

    const runtimeMs = completedAt.valueOf() - startedAt.valueOf();

    // print the job output and runtime
    console.log(`${styleText('green', '>')} ${jobOutput ?? 'Done.'} ${styleText('gray', `(${runtimeMs} ms)`)}`);
    console.log();
  } catch (error) {
    const jobError = error as Error;

    console.error(styleText('red', '>'), jobError);
    console.log();

    await db.job.update({
      where: { id: job.id },
      data: {
        state: 'Failed',
        completedAt: new Date(),
        output: jobError.stack || jobError.toString() || 'Unknown Error',
      },
    });
  } finally {
    if (job.cron) {
      const cronSchedule = CronExpressionParser.parse(job.cron, { tz: 'utc', hashSeed: job.type });

      await db.job.update({
        where: { id: job.id },
        data: { scheduledAt: cronSchedule.next().toDate() },
      });
    }
  }
}

export async function startManualJob(type: string) {
  if (!(type in jobRegistry)) {
    throw new Error(`Unknown job type ${type}`);
  }

  const job = await db.job.create({
    data: {
      type,
      payload: {},
      state: 'Queued',
      flags: ['MANUAL_START'],
    },
  });

  return await executeJob(job);
}
