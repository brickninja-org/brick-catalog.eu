import { createPrismaClient } from '../database/dist/setup.js';
import { generateAndSavePostFromCatalogSnapshot } from './src/generate-and-save-post.ts';
import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';

const month = process.env.BLOG_HEALTH_MONTH ?? '2026-05';
const dataTypes = ['elements', 'designs', 'colors', 'sets', 'catalog-updates'] as const;

if (existsSync('../apps/web/.env')) {
  loadEnvFile('../apps/web/.env');
}
if (existsSync('../../apps/web/.env')) {
  loadEnvFile('../../apps/web/.env');
}

function contentLooksBroken(content: string): { escapedNewlines: boolean, tenMarkers: boolean, hasInThisReport: boolean } {
  return {
    escapedNewlines: content.includes('\\n') || content.includes('\\r\\n'),
    tenMarkers: /\s10\s/.test(content),
    hasInThisReport: /in this report/i.test(content),
  };
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is missing. Source apps/web/.env first or set DATABASE_URL.');
  }

  const datasourceUrl = new URL(databaseUrl);
  datasourceUrl.searchParams.set('application_name', 'ai-health-check-posts');

  const db = createPrismaClient(datasourceUrl.toString(), { log: ['error', 'warn'] });

  const results: Array<Record<string, unknown>> = [];

  for (const dataType of dataTypes) {
    const generated = await generateAndSavePostFromCatalogSnapshot(db, {
      month,
      dataType,
      status: 'Published',
    });

    const post = await db.post.findUnique({
      where: { id: generated.post.id },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        dataType: true,
        content: true,
        highlights: true,
      },
    });

    const embedding = await db.postEmbedding.findUnique({
      where: { postId: generated.post.id },
      select: {
        id: true,
        postId: true,
        provider: true,
        model: true,
        updatedAt: true,
      },
    });

    if (!post) {
      throw new Error(`Post not found after save for ${dataType}`);
    }

    const checks = contentLooksBroken(post.content);

    results.push({
      dataType,
      postId: post.id,
      slug: post.slug,
      status: post.status,
      model: generated.model,
      hasEmbedding: Boolean(embedding),
      highlightsCount: Array.isArray(post.highlights) ? post.highlights.length : null,
      ...checks,
    });
  }

  console.log(JSON.stringify({ month, results }, null, 2));

  await db.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
