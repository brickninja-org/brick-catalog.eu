import type { PostGenerationParams } from './config';
import type { CatalogSnapshotSource } from './queries';
import type { SavePostResult } from './save-post';

import { generatePost } from './generate-post';
import { getCatalogSnapshot } from './queries';
import { savePost } from './save-post';

interface GenerateAndSaveFromSnapshotInput {
  month: string,
  dataType: PostGenerationParams['dataType'],
  data: string,
  status?: 'Draft' | 'Published',
}

interface GenerateAndSaveFromCatalogInput {
  month: string,
  dataType: PostGenerationParams['dataType'],
  status?: 'Draft' | 'Published',
}

export interface GenerateAndSavePostResult {
  post: SavePostResult,
  model: string,
}

export async function generateAndSavePostFromSnapshot(
  db: Parameters<typeof savePost>[0],
  input: GenerateAndSaveFromSnapshotInput,
): Promise<GenerateAndSavePostResult> {
  const { output, response } = await generatePost({
    month: input.month,
    dataType: input.dataType,
    data: input.data,
  });

  const post = await savePost(db, {
    month: input.month,
    dataType: input.dataType,
    status: input.status,
    generatedByAi: true,
    title: output.title,
    content: output.content,
    excerpt: output.excerpt,
    heroImage: null,
    tags: output.tags,
    highlights: output.highlights,
    responseMetadata: {
      responseId: response.id,
      modelId: response.modelId,
      timestamp: response.timestamp,
    },
  });

  return { post, model: response.modelId };
}

export async function generateAndSavePostFromCatalogSnapshot(
  db: Parameters<typeof savePost>[0] & CatalogSnapshotSource,
  input: GenerateAndSaveFromCatalogInput,
): Promise<GenerateAndSavePostResult> {
  const snapshot = await getCatalogSnapshot(db);
  const data = JSON.stringify(snapshot, null, 2);

  return generateAndSavePostFromSnapshot(db, {
    ...input,
    data,
  });
}
