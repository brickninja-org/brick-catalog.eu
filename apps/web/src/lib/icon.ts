import type { Icon } from '@brickcatalog/database';

export type FixedIconSize = 16 | 32 | 64;
export type IconSize = FixedIconSize | (number & {});

export function getIconUrl({ id, signature }: Pick<Icon, 'id'> & Partial<Pick<Icon, 'signature'>>, size: FixedIconSize, useOrginalRenderSvr = false) {
  return signature
    ? !useOrginalRenderSvr
        ? `https://cdn.brick.ninja/${signature}/${id}-${size}px.png`
        : `https://www.lego.com/cdn/product-assets/element.img.photoreal.192x192/${id}.jpg`
    : '';
}

const iconSizes: FixedIconSize[] = [16, 32, 64];

export function getIconSize(size: IconSize): FixedIconSize {
  return iconSizes.find((iconSize) => iconSize >= size) || 64;
}

const regex = /^https:\/\/www\.lego\.com\/cdn\/product-assets\/(?<signature>[^/]*)\/(?<id>[^/]*)\.png$/;

export function parseIcon(url: string | undefined): { id: number, signature: string } | undefined {
  if (typeof url !== 'string') {
    return;
  }

  const match = url.match(regex)?.groups;

  return match
    ? {
        id: Number(match.id),
        signature: match.signature,
      }
    : undefined;
}
