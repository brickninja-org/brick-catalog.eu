import type { VercelConfig } from '@vercel/config';

export const config: VercelConfig = {
  git: {
    deploymentEnabled: {
      'dependabot/**': false,
      'renovate/**': false,
    },
  },
  regions: ['fra1'],
};
