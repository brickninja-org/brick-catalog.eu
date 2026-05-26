import { Suspense } from 'react';

import { ListSkeleton } from '@/components/shared/skeleton';
import { getAllPosts } from '@/queries/posts';

import { PostList } from './PostList';

interface BlogSectionProps {
  query: string,
}

function fetchPosts(query: string) {
  /*
  if (query) {
    return searchPosts(query);
  }
  */

  const posts = getAllPosts();

  return posts;
}

async function BlogContent({ query }: BlogSectionProps) {
  const posts = await fetchPosts(query);

  return <PostList posts={posts} query={query}/>;
}

function BlogContentSkeleton() {
  return <ListSkeleton count={3}/>;
}

export function BlogSection({ query }: BlogSectionProps) {
  return (
    <Suspense key={query} fallback={<BlogContentSkeleton/>}>
      <BlogContent query={query}/>
    </Suspense>
  );
}