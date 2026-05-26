import type { Blog, WithContext } from 'schema-dts';


import { Suspense } from 'react';

import { StructuredData } from '@/components/structured-data';

import { BlogPageHeader, BlogSearchField } from './components';
import { BlogSection } from './components/BlogSection';

const title = 'LEGO Catalog Insights and Analysis';
const description = 'Data-driven analysis of LEGO catalog trends, element availability, design and color coverage, and monthly data quality changes. Clear insights for builders, collectors, and inventory teams.';
const url = '/blog';

const structuredData: WithContext<Blog> = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  'name': title,
  url,
  description,
};

async function PostListWithSearch({
  searchParams,
}: { searchParams: Promise<Record<string, string | string[]>> }) {
  const { q: query } = await searchParams;

  return <BlogSection query={query as string}/>;
}

export default function BlogPage({ searchParams }: PageProps<'/[language]/blog'>) {
  return (
    <>
      <StructuredData data={structuredData}/>
      <section className="flex flex-col gap-8">
        <BlogPageHeader description={description} title={title}/>

        <Suspense>
          <BlogSearchField/>
        </Suspense>

        <Suspense>
          <PostListWithSearch searchParams={searchParams}/>
        </Suspense>
      </section>
    </>
  );
}
