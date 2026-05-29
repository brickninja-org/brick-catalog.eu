import { KnownSchemaVersion } from '@brickninjaapi/types/schema';

export const schemaVersion = 'latest' satisfies KnownSchemaVersion | 'latest';
export type SchemaVersion = typeof schemaVersion;

export const schema = `v2+${schemaVersion}` as const;
