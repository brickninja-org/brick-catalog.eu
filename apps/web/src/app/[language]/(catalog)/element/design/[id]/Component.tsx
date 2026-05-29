import { Language } from '@brickcatalog/database';
import { Headline } from '@brickninja-org/ui';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { DesignInfobox } from '@/components/element/DesignInfobox';
import { DesignLink } from '@/components/element/DesignLink';
import { Json } from '@/components/format';
import { DetailLayout } from '@/components/layout/DetailLayout';
import { Notification } from '@/components/notification/Notification';
import { RemovedFromApiNotification } from '@/components/notification/RemovedFromApiNotification';
import { PageView } from '@/components/page/PageView';
import { RevisionTable } from '@/components/revision/RevisionTable';
import { cache } from '@/lib/cache';
import { db } from '@/lib/prisma';

import { ComponentBreadcrumbs } from './Component.client';
import { getRevision } from './data';

export interface DesignPageComponentProps {
  designId: number,
  language: Language,
  revisionId?: string,
}

const getDesign = cache(
  async (id: number, revisionId?: string) => {
    const [design, revision] = await Promise.all([
      db.design.findUnique({
        where: { id },
        include: {
          subcategory: {
            select: {
              categoryId: true,
              category: { select: { id: true, name: true }},
              name: true,
            },
          },
          history: {
            include: { revision: { select: { id: true, buildId: true, hash: true, type: true, createdAt: true, description: true }}},
            orderBy: { revision: { createdAt: 'desc' }},
          },
        },
      }),
      getRevision(id, revisionId),
    ]);

    if (!design || !revision.data) {
      notFound();
    }

    return { design, revision };
  },
  ['design'],
  { revalidate: 60 },
);

export type Design = Awaited<ReturnType<typeof getDesign>>['design'];

export async function DesignPageComponent({ designId, language, revisionId }: DesignPageComponentProps) {
  const t = await getTranslations({ locale: language });
  const translations = {
    'category.unknown': t('category.unknown'),
    'subcategory.unknown': t('subcategory.unknown'),
    'navigation.elements': t('navigation.elements'),
  };

  const { design, revision: { revision, data }} = await getDesign(designId, revisionId);

  // 404 if item doesn't exists
  if (!design || !revision || !data) {
    notFound();
  }

  const fixedRevision = revisionId !== undefined;

  return (
    <DetailLayout
      breadcrumbs={<ComponentBreadcrumbs design={design} translations={translations}/>}
      infobox={<DesignInfobox design={design}/>}
      title={data.name}
    >
      <PageView page="design" pageId={designId}/>

      {design.currentId !== revision.id && (
        <Notification title="Viewing old revision">
          You are viewing an old revision of this design
          {revision.buildId ? (
            <>
              {' '}
              (<Link className="link" href={`/build/${revision.buildId}`}>Build {revision.buildId}</Link>)
            </>
          ) : null}
          . Some data is only available when viewing the latest version. <Link className="link" href={`/element/design/${design.id}`}>View latest</Link>.
        </Notification>
      )}

      {design.currentId === revision.id && !!fixedRevision && (
        <Notification title="">
          You are viewing this design at a fixed revision
          {revision.buildId ? (
            <>
              {' '}
              (<Link className="link" href={`/build/${revision.buildId}`}>Build {revision.buildId}</Link>)
            </>
          ) : null}
          . Some data is only available when viewing the latest version. <Link className="link" href={`/element/design/${design.id}`}>View latest</Link>.
        </Notification>
      )}

      {!fixedRevision && !!design.removedFromApi && <RemovedFromApiNotification type="design"/>}
      
      <Headline id="history">{t('revisions.history')}</Headline>
      <RevisionTable
        currentRevisionId={revision.id}
        fixedRevision={fixedRevision}
        language={language}
        link={({ revisionId, children }) => (<DesignLink design={design} icon="none" revision={revisionId}>{children}</DesignLink>)}
        revisions={design.history.map(({ revision }) => revision)}
      />

      <Headline id="data">Data</Headline>
      <Json data={data}/>
    </DetailLayout>
  );
}
