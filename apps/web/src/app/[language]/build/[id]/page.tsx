import type { FC } from 'react';

import { Headline } from '@brickninja-org/ui';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { FormatDate } from '@/components/format';
import { DetailLayout } from '@/components/layout/DetailLayout';
import { cache } from '@/lib/cache';
import { db } from '@/lib/prisma';

function timed<Args extends unknown[], Out>(callback: (...args: Args) => Promise<Out>): (...args: Args) => Promise<Out> {
  const timedFunction = async (...args: Args): Promise<Out> => {
    const start = new Date();
    const result = await callback(...args);
    const end = new Date();

    console.log(`timed - ${callback.name} - took ${end.valueOf() - start.valueOf()}ms`);

    return result;
  };

  return timedFunction;
} 

const getBuild = cache(
  timed(async function getBuild(buildId: string) {
    const build = await db.build.findUnique({ where: { id: buildId }});

    if (!build) {
      notFound();
    }

    return build;
  }),
  ['build'],
  { revalidate: 600 },
);

const getUpatedDesigns = cache(
  timed(function getUpatedDesigns(buildId: string) {
    return db.revision.findMany({
      where: { buildId, type: 'Updated', entity: 'Design' },
      include: { designHistory: { include: { design: { select: { id: true, name: true }}}}},
      take: 500,
    });
  }),
  ['build-updated-designs'],
  { revalidate: 600 },
);

export default async function BuildDetailPage({ params }: PageProps<'/[language]/build/[id]'>) {
  const { id } = await params;
  const buildId = id;

  const designsPromise = getUpatedDesigns(buildId);

  const build = await getBuild(buildId);

  return (
    <DetailLayout breadcrumbs="Build" title={`Build ${build.id}`}>
      Released on <FormatDate date={build.createdAt}/>

      <Suspense fallback={<Fallback headline="Updated designs" id="designs" />}>
        <UpdatedDesigns designsPromise={designsPromise}/>
      </Suspense>
    </DetailLayout>
  );
}

const Fallback: FC<{ headline: string, id: string }> = ({ headline, id }) => {
  return (
    <>
      <Headline id={id}>{headline}</Headline>
    </>
  );
};

const UpdatedDesigns: FC<{ designsPromise: ReturnType<typeof getUpatedDesigns> }> = async function({ designsPromise }) {
  const designRevisions = await designsPromise;

  return (
    <>
      <Headline id="designs">Updated designs ({designRevisions.length})</Headline>
    </>
  );
};
