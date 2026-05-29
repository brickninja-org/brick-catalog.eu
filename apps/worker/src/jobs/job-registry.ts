import type { JobDefinition } from './job-definition';

import { CategoryJob } from './element/categories';
import { ColorJob } from './element/colors';
import { DesignJob } from './element/designs';
import { ElementJob } from './element/elements';
import { SubcategoryJob } from './element/subcategories';
import { CleanupJobsJob } from './job/cleanup';

export const jobDefinitions = {
  'system.test-run': { run: () => undefined },

  'elements.colors': ColorJob,
  'elements.categories': CategoryJob,
  'elements.subcategories': SubcategoryJob,
  'elements.designs': DesignJob,
  'elements': ElementJob,

  'jobs.cleanup': CleanupJobsJob,
} satisfies Record<string, JobDefinition>;

export const jobRegistry = jobDefinitions as Record<string, JobDefinition>;

export type JobName = keyof typeof jobDefinitions;
