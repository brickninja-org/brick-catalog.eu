import type { RouteHandler } from '@/lib/next';
import type { ElementDesign } from '@brickninjaapi/types/data/element';

import { notFound } from 'next/navigation';
import { NextResponse } from 'next/server';

import { createTooltip } from '@/components/element/DesignTooltip';
import { cache } from '@/lib/cache';
import { db } from '@/lib/prisma';

const getDesignRevision = cache(
  (id: number, revisionId?: string) => {
    return revisionId
      ? db.revision.findFirst({ where: { id: revisionId, entity: 'Design' }})
      : db.revision.findFirst({ where: { currentDesign: { id }}});
  },
  ['design-revision'],
  { revalidate: 60 },
);

export const GET: RouteHandler<'/[language]/element/design/[id]/tooltip'> =
  async (request, { params }) => {
    const { id } = await params;
    const designId = Number(id);

    const { searchParams } = new URL(request.url);
    const revisionId = searchParams.get('revision') ?? undefined;

    const revision = await getDesignRevision(designId, revisionId);

    if (!revision) {
      notFound();
    }

    const data: ElementDesign = JSON.parse(revision.data);
    const tooltip = await createTooltip(data);

    return NextResponse.json(tooltip, {
      headers: { 'cache-control': 'public, max-age=3600', 'Vary': 'Origin' },
    });
  };