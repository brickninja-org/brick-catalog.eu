import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { embed } from 'ai';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

/**
 * Embedding provider configuration.
 */
export const POST_EMBEDDING_PROVIDER = 'google';

export const POST_EMBEDDING_MODEL = 'gemini-embedding-001';

export const POST_EMBEDDING_DIMENSIONS = 768;

export const POST_EMBEDDING_VERSION = 'post-embedding-v1';

/**
 * Maximum content length used for embeddings.
 *
 * Prevents excessive token usage while preserving semantic meaning.
 */
const MAX_CONTENT_LENGTH = 2_000;

export interface GeneratePostEmbeddingInput {
  title: string,
  excerpt?: string | null,
  content: string,
}

/**
 * Normalize text for more stable embeddings.
 */
function normalizeText(value: string): string {
  return value
    .replace(/\r\n/g, '\n')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Build deterministic embedding input.
 *
 * Consistent formatting improves embedding quality
 * and search relevance over time.
 */
function buildEmbeddingText(
  post: GeneratePostEmbeddingInput,
): string {
  const parts: string[] = [];

  const title = normalizeText(post.title);

  if (title) {
    parts.push(`Title: ${title}`);
  }

  const excerpt = normalizeText(post.excerpt ?? '');

  if (excerpt) {
    parts.push(`Excerpt: ${excerpt}`);
  }

  const content = normalizeText(
    post.content.slice(0, MAX_CONTENT_LENGTH),
  );

  if (content) {
    parts.push(`Content: ${content}`);
  }

  return parts.join('\n\n');
}

/**
 * Generate semantic embedding for a post.
 */
export async function generatePostEmbedding(
  post: GeneratePostEmbeddingInput,
): Promise<number[]> {
  const value = buildEmbeddingText(post);

  const { embedding } = await embed({
    model: google.embeddingModel(POST_EMBEDDING_MODEL),

    value,

    providerOptions: {
      google: {
        outputDimensionality: POST_EMBEDDING_DIMENSIONS,
      },
    },

    experimental_telemetry: {
      isEnabled: true,

      functionId: POST_EMBEDDING_VERSION,

      metadata: {
        provider: POST_EMBEDDING_PROVIDER,
        model: POST_EMBEDDING_MODEL,
        dimensions: String(POST_EMBEDDING_DIMENSIONS),
        titleLength: String(post.title.length),
        contentLength: String(post.content.length),
      },
    },
  });

  return embedding;
}
