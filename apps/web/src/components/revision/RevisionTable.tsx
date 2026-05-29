import type { RevisionTableRow } from './RevisionTable.client';
import type { Language, Revision } from '@brickcatalog/database';
import type { ReactNode } from 'react';

import { Language as LanguageEnum } from '@brickcatalog/database';
import { getTranslations } from 'next-intl/server';

import { RevisionDataGrid } from './RevisionTable.client';

export interface RevisionTableProps {
  revisions: Pick<Revision, 'id' | 'type' | 'buildId' | 'hash' | 'description' | 'createdAt'>[],
  currentRevisionId: string,
  language?: Language,
  fixedRevision?: boolean,
  link: ({ revisionId, children }: { revisionId: string, children: ReactNode }) => ReactNode,
  diff?: ({ revisionIdA, revisionIdB, children }: { revisionIdA: string, revisionIdB: string, children: ReactNode }) => ReactNode,
}

export async function RevisionTable({
  revisions,
  currentRevisionId,
  language = LanguageEnum.en,
  fixedRevision,
  link,
}: RevisionTableProps) {
  const t = await getTranslations({ locale: language });
  const translations = {
    'actions': t('actions'),
    'actions.view': t('actions.view'),
    'revisions.build': t('revisions.build'),
    'revisions.date': t('revisions.date'),
    'revisions.description': t('revisions.description'),
    'revisions.empty-state': t('revisions.empty-state'),
  };

  const hiddenIndexes = new Set<number>();

  // iterate through all revisions and find indexes to hide
  for (const [i, revision] of revisions.entries()) {
    const earlierRevision = revisions[i + 1];

    if (
      // there has to be an earlier revision...
      earlierRevision &&
      // _that is a removal (so the current is a rediscovery)...
      revision.type === 'Updated' && earlierRevision.type === 'Removed' &&
      // _the hash has to match (and not be empty)...
      revision.hash === earlierRevision.hash && revision.hash !== '' &&
      // _and the user is not viewing any of these revisions...
      revision.id !== currentRevisionId && earlierRevision.id !== currentRevisionId
    ) {
      // _then hide them both
      hiddenIndexes.add(i);
      hiddenIndexes.add(i + 1);
    }
  }

  const data: RevisionTableRow[] = revisions.map((revision) => ({
    ...revision,
    viewLink:
      !fixedRevision || currentRevisionId !== revision.id
        ? link({
            revisionId: revision.id,
            children: translations['actions.view'],
          })
        : null
  }));

  return (
    <RevisionDataGrid
      aria-label={t('revisions')}
      data={data}
      translations={translations}
      variant="secondary"
    />
  );
}
