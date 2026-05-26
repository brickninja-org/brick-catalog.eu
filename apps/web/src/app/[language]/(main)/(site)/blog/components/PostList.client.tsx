'use client';

import type { Post as TPost } from '@brickcatalog/database';
import type { FC } from 'react';

import { Tabs } from '@heroui/react';
import { EmptyState } from '@heroui-pro/react';
import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';

import { staggerContainerVariants, staggerItemVariants } from '@/config/animations';

import { Post } from './post';

interface PostCounts {
  total: number,
  category: Record<string, number>,
}

interface PostListClientProps {
  posts: TPost[],
  counts: PostCounts,
  query: string,
}

interface PostGridProps {
  posts: TPost[],
}

const tabLabels: Record<string, string> = {
  all: 'All posts',
  elements: 'Elements',
  sets: 'Sets',
};

const PostGrid: FC<PostGridProps> = ({ posts }) => {
  return (
    <motion.div
      animate="visible"
      className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
      initial="hidden"
      variants={staggerContainerVariants}
    >
      {posts.map((post) => (
        <motion.div key={post.id} variants={staggerItemVariants}>
          {/* <Post.Card post={post}/> */}
          <Post.Card post={post}/>
        </motion.div>
      ))}
    </motion.div>
  );
};

export const PostListClient: FC<PostListClientProps> = ({
  counts,
  posts,
  query,
}) => {
  const [selectedTab, setSelectedTab] = useState('all');

  const filteredPosts = useMemo(() => {
    if (selectedTab === 'all') {
      return posts;
    }

    return posts.filter((post) => post.dataType === selectedTab);
  }, [posts, selectedTab]);

  const heroPost = filteredPosts[0];
  const remainingPosts = filteredPosts.slice(1);

  if (posts.length === 0) {
    return (
      <div className="w-105">
        <EmptyState>
          <EmptyState.Header>
            <EmptyState.Title>Nothing here yet</EmptyState.Title>
            <EmptyState.Description>
              {query
                ? `No results found for ${query}`
                : 'Content will appear here once it becomes available.'}
            </EmptyState.Description>
          </EmptyState.Header>
        </EmptyState>
      </div>
    );
  }

  if (query) {
    return (
      <div className="flex flex-col gap-8">
        <p className="text-muted">
          {filteredPosts.length} result{filteredPosts.length !== 1 && 's'} for "{query}"
        </p>
        <PostGrid posts={filteredPosts}/>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <Tabs
        selectedKey={selectedTab}
        variant="secondary"
        onSelectionChange={(key) => {
          setSelectedTab(key as string);
        }}
      >
        <Tabs.ListContainer>
          <Tabs.List
            aria-label="Post categories"
            className="gap-6 *:h-10 *:px-0"
          >
            <Tabs.Tab id="all">
              {tabLabels.all} ({counts.total})
              <Tabs.Indicator/>
            </Tabs.Tab>
            {Object.keys(counts.category)
              .sort((a, b) => a.localeCompare(b))
              .map((cat) => (
                <Tabs.Tab key={cat} id={cat}>
                  {tabLabels[cat] || cat} ({counts.category[cat]})
                  <Tabs.Indicator/>
                </Tabs.Tab>
              ))}
          </Tabs.List>
        </Tabs.ListContainer>
      </Tabs>

      {!!heroPost && (
        <motion.div
          animate="visible"
          initial="hidden"
          variants={staggerContainerVariants}
        >
          <motion.div variants={staggerItemVariants}>
            {/* <Post.Hero post={heroPost}/> */}
            <Post.Hero post={heroPost}/>
          </motion.div>
        </motion.div>
      )}

      {remainingPosts.length > 0 && <PostGrid posts={remainingPosts}/>}
    </div>
  );
};
