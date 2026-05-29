import { createPrismaClient } from '../database/dist/setup.js';
import { generateAndSavePostFromCatalogSnapshot } from './src/generate-and-save-post.ts';

async function main() {
  const datasourceUrl = new URL(process.env.DATABASE_URL!);
  datasourceUrl.searchParams.set('application_name', 'ai-regenerate-elements');

  const db = createPrismaClient(datasourceUrl.toString(), {
    log: ['error', 'warn', 'info'],
  });

  const result = await generateAndSavePostFromCatalogSnapshot(db, {
    month: '2026-05',
    dataType: 'elements',
    status: 'Published',
  });

  console.log(JSON.stringify(result, null, 2));

  const saved = await db.post.findUnique({
    where: { id: result.post.id },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      updatedAt: true,
      publishedAt: true,
      highlights: true,
    },
  });

  console.log('\n=== Saved Post Snapshot ===');
  console.log(JSON.stringify(saved, null, 2));

  await db.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
