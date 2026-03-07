import type { JobDefinition } from './job-definition';

import { CleanupJobsJob } from './jobs/cleanup';

export const jobDefinitions = {
  'system.test-run': { run: () => undefined },

  'jobs.cleanup': CleanupJobsJob,
} satisfies Record<string, JobDefinition>;

export const jobRegistry = jobDefinitions as Record<string, JobDefinition>;

export type JobName = keyof typeof jobDefinitions;
