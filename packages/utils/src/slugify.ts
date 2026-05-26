import baseSlugify from '@sindresorhus/slugify';

export function slugify(input: string): string {
  return baseSlugify(input, { decamelize: false });
}
