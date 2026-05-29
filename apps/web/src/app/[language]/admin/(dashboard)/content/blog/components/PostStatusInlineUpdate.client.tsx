'use client';

import { PostStatus } from '@brickcatalog/database';
import { toast } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { updateBlogPostStatus } from '@/app/[language]/admin/actions/blog-status';

import { PostStatusCellSelect } from './PostStatusCellSelect.client';

interface PostStatusInlineUpdateProps {
  postId: string,
  value: PostStatus,
  label: string,
  draftLabel: string,
  publishedLabel: string,
}

export function PostStatusInlineUpdate({
  postId,
  value,
  label,
  draftLabel,
  publishedLabel,
}: PostStatusInlineUpdateProps) {
  const router = useRouter();

  const [status, setStatus] = useState(value);
  const [isPending, startTransition] = useTransition();

  const updateStatus = (nextStatus: PostStatus) => {
    if (nextStatus === status) {
      return;
    }

    const previousStatus = status;
    setStatus(nextStatus);

    startTransition(async () => {
      const result = await updateBlogPostStatus({
        id: postId,
        status: nextStatus,
      });

      if (result.success) {
        toast.success('Status updated');
        router.refresh();

        return;
      }

      setStatus(previousStatus);
      toast.danger(result.error ?? 'Failed to update status');
    });
  };

  return (
    <PostStatusCellSelect
      draftLabel={draftLabel}
      isDisabled={isPending}
      label={label}
      publishedLabel={publishedLabel}
      value={status}
      onValueChange={updateStatus}
    />
  );
}
