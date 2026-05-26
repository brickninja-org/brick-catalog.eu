import 'server-only';

import type { FC } from 'react';

import { Suspense } from 'react';

import { pageView } from '@/lib/page-view';

interface PageViewProps {
  page: string,
  pageId?: number,
}

// run this in a suspense, so this does not block rendering
export const PageView: FC<PageViewProps> = (props) => {
  return (
    <Suspense fallback={null}>
      <PageViewInternal {...props}/>
    </Suspense>
  );
};

const PageViewInternal: FC<PageViewProps> = async ({ page, pageId }) => {
  await pageView(page, pageId);

  return null;
};
