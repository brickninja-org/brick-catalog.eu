import { generatePost, getCatalogSnapshot } from '@brickcatalog/ai';

import { db } from '@/lib/prisma';

const BLOG_SYNC_TASKS = [
  'collect-post-metadata',
  'refresh-hero-images',
  'revalidate-blog-pages',
] as const;

export interface BlogSyncInput {
  requestedBy?: string,
  tasks?: Array<typeof BLOG_SYNC_TASKS[number]>,
}

interface BlogSyncResult {
  requestedBy: string,
  startedAt: string,
  plannedTasks: string[],
  snapshot: {
    totalElements: number,
    totalDesigns: number,
    totalColors: number,
    latestBuildId: null | string,
  },
  draft: {
    title: string,
    slug: string,
    excerpt: string,
    markdown: string,
  },
  revalidatedPaths: string[],
}

export async function blogSyncWorkflow(input: BlogSyncInput = {}): Promise<BlogSyncResult> {
  'use workflow';

  const requestedBy = input.requestedBy?.trim() || 'admin-dashboard';
  const plannedTasks = await planBlogSyncTasksStep(input.tasks);
  const snapshot = await collectCatalogSnapshotStep();
  const draft = await generateBlogDraftStep(snapshot);
  const revalidatedPaths = await revalidateBlogPagesStep();

  return {
    requestedBy,
    startedAt: new Date().toISOString(),
    plannedTasks,
    snapshot,
    draft,
    revalidatedPaths,
  };
}

async function planBlogSyncTasksStep(tasks?: Array<typeof BLOG_SYNC_TASKS[number]>) {
  'use step';

  await Promise.resolve();

  return tasks?.length ? tasks : [...BLOG_SYNC_TASKS];
}

async function collectCatalogSnapshotStep() {
  'use step';

  return await getCatalogSnapshot(db);
}

async function generateBlogDraftStep(snapshot: {
  [key: string]: unknown,
}) {
  'use step';

  const month = new Date().toISOString().slice(0, 10);
  const dataset = JSON.stringify(snapshot, null, 2);
  const { output } = await generatePost({
    month,
    dataType: 'elements',
    data: dataset,
  });

  const slug = output.title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  return {
    title: output.title.trim(),
    slug,
    excerpt: output.excerpt.trim(),
    markdown: output.content.trim(),
  };
}

async function revalidateBlogPagesStep() {
  'use step';

  const paths = ['/blog', '/'];
  const baseUrl = process.env.BC_URL ?? 'http://127.0.0.1:3000';
  const token = process.env.ADMIN_WORKFLOW_TOKEN ?? '';

  try {
    await fetch(`${baseUrl}/api/admin/workflows/blog/revalidate`, {
      method: 'POST',
      headers: {
        'authorization': token ? `Bearer ${token}` : '',
        'content-type': 'application/json',
      },
      body: JSON.stringify({ paths }),
    });
  } catch {
    // We keep the workflow successful even when revalidation fails.
  }

  return paths;
}
