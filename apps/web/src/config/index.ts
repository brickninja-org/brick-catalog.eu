import { withRelatedProject } from '@vercel/related-projects';

// =============================================================================
// Brand Configuration
// =============================================================================
export const SITE_TITLE = 'BrickCatalog';
export const SITE_DESCRIPTION =
  'Explore LEGO elements, yearly trends, and part insights in one fast, searchable catalog.';

// =============================================================================
// Domain & URLs
// =============================================================================
export const DOMAIN_NAME = 'brick-catalog.eu';

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : `https://${DOMAIN_NAME}`);

// =============================================================================
// API Configuration
// =============================================================================
const API_VERSION = 'v1';
const DEFAULT_API_URL = `https://api.${DOMAIN_NAME}`;

export const API_BASE_URL =
  // TODO: Remove this check once Hono is working on Vercel
  process.env.NEXT_PUBLIC_API_URL ??
  withRelatedProject({
    projectName: 'api',
    defaultHost: process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL,
  });

export const API_URL = `${API_BASE_URL}/${API_VERSION}`;

// =============================================================================
// Feature Flags
// =============================================================================
export const FEATURE_FLAG_UNRELEASED =
  process.env.NEXT_PUBLIC_FEATURE_FLAG_UNRELEASED === 'true';
