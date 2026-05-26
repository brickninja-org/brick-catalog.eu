import type { Post } from '@brickcatalog/database';
import type { FC } from 'react';

import { getPostCountsByCategory } from '@/queries/posts';

import { PostListClient } from './PostList.client';

interface PostListProps {
  posts: Post[],
  query: string,
}

export const PostList: FC<PostListProps> = async ({
  posts,
  query,
}) => {
  const postCounts = await getPostCountsByCategory();

  const counts = {
    total: postCounts.reduce((sum, row) => sum + row.count, 0),
    category: Object.fromEntries(
      postCounts
        .filter((row): row is typeof row & { category: string } => row.category !== null)
        .map((row) => [row.category, row.count]),
    )
  };

  return <PostListClient counts={counts} posts={posts} query={query}/>;
};
