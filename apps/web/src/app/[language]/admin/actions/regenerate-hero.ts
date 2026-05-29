'use server';

import { start } from 'workflow/api';

import { regenerateHeroWorkflow } from '@/workflows/regenerate-hero';

export async function regeneratePostHero(
  postId: string,
): Promise<{ success: boolean, error?: string, runId?: string }> {
  try {
    const run = await start(regenerateHeroWorkflow, [{ postId }]);

    return { success: true, runId: run.runId };
  } catch (error) {
    console.error('Error triggering regenerate-hero workflow:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
