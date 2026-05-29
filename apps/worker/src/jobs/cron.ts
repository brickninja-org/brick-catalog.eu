import type { JobName } from './job-registry';
import type { Prisma } from '@brickcatalog/database';

import { styleText } from 'node:util';

import CronExpressionParser from 'cron-parser';

import { db } from '../db';

import { toId } from './helper/toId';

const cronSchedules = {
  daily: '0 0 * * *',
  hourly: '0 * * * *',
  every5Minutes: '*/5 * * * *',
  every5MinutesOffset2: '2-59/5 * * * *',
  every5MinutesOffset3: '3-59/5 * * * *',
  every5MinutesOffset4: '4-59/5 * * * *',
} as const;

export async function registerCronJobs() {
  console.log('Registering cron jobs...');

  await registerCronJob('system.test-run', '0 0 * * *');

  // Run jobs without relations first.
  await registerCronJob('elements', cronSchedules.every5Minutes);

  // Run jobs with relations afterwards in dependency order.
  await registerCronJob('elements.designs', cronSchedules.every5MinutesOffset2);
  await registerCronJob('elements.colors', cronSchedules.every5MinutesOffset2);
  await registerCronJob('elements.subcategories', cronSchedules.every5MinutesOffset3);
  await registerCronJob('elements.categories', cronSchedules.every5MinutesOffset4);


  await registerCronJob('jobs.cleanup', cronSchedules.hourly);
}

async function registerCronJob(
  jobName: JobName,
  cronExpression: string,
  payload: Prisma.InputJsonValue = {},
) {
  // check if a matching job exists
  const existingCronJobs = await db.job.findMany({
    where: { type: jobName, cron: { not: '' }},
  });

  if (existingCronJobs.length > 1) {
    console.warn(`Found multiple cron jobs for ${styleText('blue', jobName)}. Deleting superfluous jobs.`);

    await db.job.deleteMany({
      where: { id: { in: existingCronJobs.slice(1).map(toId) }},
    });
  }

  if (existingCronJobs.length === 0) {
    // add new cron job
    console.log(`Registering new cron job ${styleText('blue', jobName)}.`);

    const scheduledAt = CronExpressionParser
      .parse(cronExpression, { tz: 'utc', hashSeed: jobName })
      .next()
      .toDate();

    await db.job.create({
      data: { type: jobName, payload, cron: cronExpression, scheduledAt },
    });

    return;
  }

  const existingCronJob = existingCronJobs[0];

  // update the cron job if the schedule or payload changed
  if (
    existingCronJob.cron !== cronExpression ||
    JSON.stringify(existingCronJob.payload) !== JSON.stringify(payload)
  ) {
    console.log(`Updating cron job ${styleText('blue', jobName)}...`);

    const scheduledAt = CronExpressionParser.parse(cronExpression, { tz: 'utc', hashSeed: jobName }).next().toDate();

    await db.job.update({
      where: { id: existingCronJob.id },
      data: { payload, cron: cronExpression, scheduledAt },
    });
  }

  return;
}
