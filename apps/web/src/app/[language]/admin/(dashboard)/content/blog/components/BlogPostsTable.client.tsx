'use client';

import type { PostWithMetadata } from '@/app/[language]/admin/actions/blog';
import type {
  DataGridColumn,
  DataGridSortDescriptor,
} from '@heroui-pro/react';
import type { ReactNode } from 'react';

import {
  isRegeneratablePostDataType,
} from '@brickcatalog/ai';
import {
  AlertDialog,
  Button,
  Card,
  Chip,
  Dropdown,
  Input,
  Label,
  ListBox,
  Modal,
  Select,
  TextField,
  toast,
} from '@heroui/react';
import { DataGrid, EmptyState } from '@heroui-pro/react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ExternalLink,
  Eye,
  FileText,
  ImageIcon,
  Loader2,
  MoreHorizontal,
  Pencil,
  RefreshCw,
  Search,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';

import {
  deleteBlogPostById,
  getAllBlogPosts,
  regeneratePost,
} from '@/app/[language]/admin/actions/blog';
import { regeneratePostHero } from '@/app/[language]/admin/actions/regenerate-hero';
import { estimateTokenCost } from '@/app/[language]/admin/lib/token-cost';

interface BlogPostsTableProps {
  initialPosts: PostWithMetadata[],
  previews: Record<string, ReactNode>,
}

const PAGE_SIZES = [10, 20, 30, 50];
const REGEN_POLL_INTERVAL_MS = 2000;
const REGEN_POLL_MAX_ATTEMPTS = 10;

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-SG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatTokens(post: PostWithMetadata): string {
  const totalTokens = post.metadata?.usage?.totalTokens;

  if (!totalTokens) {
    return 'N/A';
  }

  const input = post.metadata?.usage?.inputTokens ?? 0;
  const output = post.metadata?.usage?.outputTokens ?? 0;

  return `${totalTokens.toLocaleString()} (${input.toLocaleString()} + ${output.toLocaleString()})`;
}

function compareString(
  a: string | null | undefined,
  b: string | null | undefined,
) {
  return (a ?? '').localeCompare(b ?? '', undefined, {
    numeric: true,
    sensitivity: 'base',
  });
}

function compareNumber(
  a: number | null | undefined,
  b: number | null | undefined,
) {
  return (a ?? 0) - (b ?? 0);
}

export function BlogPostsTable({
  initialPosts,
  previews,
}: BlogPostsTableProps) {
  const router = useRouter();

  const [posts, setPosts] = useState(initialPosts);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [sortDescriptor, setSortDescriptor] = useState<DataGridSortDescriptor>({
    column: 'createdAt',
    direction: 'descending',
  });

  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [heroRegeneratingId, setHeroRegeneratingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean,
    type: 'regenerate' | 'delete',
    post: PostWithMetadata | null,
  }>({ open: false, type: 'regenerate', post: null });

  const [previewDialog, setPreviewDialog] = useState<{
    open: boolean,
    post: PostWithMetadata | null,
  }>({ open: false, post: null });

  const handleRegenerate = async (post: PostWithMetadata) => {
    if (!post.month || !post.dataType || !isRegeneratablePostDataType(post.dataType)) {
      toast.danger('This post type cannot be regenerated via workflow.');

      return;
    }

    setRegeneratingId(post.id);
    setConfirmDialog({ open: false, type: 'regenerate', post: null });

    try {
      const result = await regeneratePost({
        postId: post.id,
        month: post.month,
        dataType: post.dataType,
      });

      if (!result.success) {
        throw new Error(result.error ?? 'Unknown error');
      }

      toast.success(
        `Regeneration started for ${post.month} (${post.dataType})${result.runId ? ` (run: ${result.runId})` : ''}. Checking for updates...`,
      );

      const previousUpdatedAt = new Date(post.updatedAt).getTime();
      let hasUpdated = false;

      for (let attempt = 0; attempt < REGEN_POLL_MAX_ATTEMPTS; attempt += 1) {
        await new Promise((resolve) => setTimeout(resolve, REGEN_POLL_INTERVAL_MS));

        const allPosts = await getAllBlogPosts();
        const refreshedPost = allPosts.find((item) => item.id === post.id);

        if (!refreshedPost) {
          continue;
        }

        const refreshedUpdatedAt = new Date(refreshedPost.updatedAt).getTime();

        if (refreshedUpdatedAt > previousUpdatedAt) {
          setPosts(allPosts);
          hasUpdated = true;
          break;
        }
      }

      const latestPosts = await getAllBlogPosts();
      setPosts(latestPosts);

      if (hasUpdated) {
        toast.success('Post updated with regenerated content.');

        return;
      }

      toast.success('Regeneration is still running. Refresh again shortly for the latest content.');
    } catch (error) {
      toast.danger(
        error instanceof Error
          ? error.message
          : 'Failed to regenerate blog post.',
      );
    } finally {
      setRegeneratingId(null);
    }
  };

  const handleRegenerateHero = useCallback(async (post: PostWithMetadata) => {
    setHeroRegeneratingId(post.id);

    try {
      const result = await regeneratePostHero(post.id);

      if (!result.success) {
        throw new Error(result.error ?? 'Unknown error');
      }

      toast.success(
        `Hero image regeneration started for "${post.title}". Refresh in a moment to see the new image.`,
      );
    } catch (error) {
      toast.danger(
        error instanceof Error
          ? error.message
          : 'Failed to regenerate hero image.',
      );
    } finally {
      setHeroRegeneratingId(null);
    }
  }, []);

  const handleDelete = async (post: PostWithMetadata) => {
    setDeletingId(post.id);
    setConfirmDialog({ open: false, type: 'delete', post: null });

    try {
      const result = await deleteBlogPostById(post.id);

      if (!result.success) {
        throw new Error(result.error ?? 'Unknown error');
      }

      toast.success(`"${post.title}" deleted successfully.`);

      setPosts((currentPosts) =>
        currentPosts.filter((currentPost) => currentPost.id !== post.id),
      );
    } catch (error) {
      toast.danger(
        error instanceof Error ? error.message : 'Failed to delete blog post.',
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handlePreview = useCallback((post: PostWithMetadata) => {
    setPreviewDialog({ open: true, post });
  }, []);

  const columns = useMemo<DataGridColumn<PostWithMetadata>[]>(
    () => [
      {
        id: 'title',
        header: 'Title',
        accessorKey: 'title',
        isRowHeader: true,
        allowsSorting: true,
        minWidth: 260,
        pinned: 'start',
        cell: (post) => (
          <Link
            className="line-clamp-1 font-medium hover:underline"
            href={`/admin/content/blog/${post.id}/edit`}
          >
            {post.title}
          </Link>
        ),
        sortFn: (a, b) => compareString(a.title, b.title),
      },
      {
        id: 'status',
        header: 'Status',
        accessorKey: 'status',
        minWidth: 120,
        cell: (post) => (
          <Chip
            color={post.status === 'Published' ? 'success' : 'default'}
            variant={post.status === 'Published' ? 'primary' : 'secondary'}
          >
            {post.status ?? 'Draft'}
          </Chip>
        ),
      },
      {
        id: 'month',
        header: 'Month',
        accessorKey: 'month',
        allowsSorting: true,
        minWidth: 120,
        cell: (post) => post.month ?? 'N/A',
        sortFn: (a, b) => compareString(a.month, b.month),
      },
      {
        id: 'dataType',
        header: 'Type',
        accessorKey: 'dataType',
        minWidth: 110,
        cell: (post) => (
          <Chip variant="secondary">
            {post.dataType?.toUpperCase() ?? 'N/A'}
          </Chip>
        ),
      },
      {
        id: 'model',
        header: 'Model',
        minWidth: 180,
        cell: (post) => (
          <span className="text-muted text-sm">
            {post.metadata?.modelId ?? 'N/A'}
          </span>
        ),
      },
      {
        id: 'tokens',
        header: 'Tokens',
        allowsSorting: true,
        align: 'end',
        minWidth: 180,
        cell: (post) => (
          <span className="text-muted text-sm">
            {formatTokens(post)}
          </span>
        ),
        sortFn: (a, b) =>
          compareNumber(
            a.metadata?.usage?.totalTokens,
            b.metadata?.usage?.totalTokens,
          ),
      },
      {
        id: 'createdAt',
        header: 'Created',
        accessorKey: 'createdAt',
        allowsSorting: true,
        minWidth: 140,
        cell: (post) => (
          <span className="text-muted text-sm">
            {formatDate(post.createdAt)}
          </span>
        ),
        sortFn: (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
      },
      {
        id: 'actions',
        header: '',
        width: 56,
        pinned: 'end',
        align: 'end',
        cell: (post) => {
          const isLoading =
            regeneratingId === post.id ||
            heroRegeneratingId === post.id ||
            deletingId === post.id;

          if (isLoading) {
            return <Loader2 className="size-4 animate-spin text-muted" />;
          }

          return (
            <Dropdown>
              <Button
                isIconOnly
                aria-label="Open menu"
                className="size-8 p-0"
                size="sm"
                variant="ghost"
              >
                <MoreHorizontal className="size-4" />
              </Button>

              <Dropdown.Popover placement="bottom end">
                <Dropdown.Menu
                  onAction={(key) => {
                    if (key === 'view') {
                      window.open(
                        `/blog/${post.slug}`,
                        '_blank',
                        'noopener,noreferrer',
                      );
                    }

                    if (key === 'edit') {
                      router.push(`/admin/content/blog/${post.id}/edit`);
                    }

                    if (key === 'preview') {
                      handlePreview(post);
                    }

                    if (key === 'regenerate') {
                      setConfirmDialog({
                        open: true,
                        type: 'regenerate',
                        post,
                      });
                    }

                    if (key === 'regenerate-hero') {
                      handleRegenerateHero(post);
                    }

                    if (key === 'delete') {
                      setConfirmDialog({
                        open: true,
                        type: 'delete',
                        post,
                      });
                    }
                  }}
                >
                  <Dropdown.Item id="view" textValue="View">
                    <ExternalLink className="mr-2 size-4" />
                    <Label>View</Label>
                  </Dropdown.Item>

                  <Dropdown.Item id="edit" textValue="Edit">
                    <Pencil className="mr-2 size-4" />
                    <Label>Edit</Label>
                  </Dropdown.Item>

                  <Dropdown.Item id="preview" textValue="Preview">
                    <Eye className="mr-2 size-4" />
                    <Label>Preview</Label>
                  </Dropdown.Item>

                  {!!post.month && !!post.dataType && (
                    <>
                      <Dropdown.Item id="regenerate" textValue="Regenerate">
                        <RefreshCw className="mr-2 size-4" />
                        <Label>Regenerate</Label>
                      </Dropdown.Item>

                      <Dropdown.Item
                        id="regenerate-hero"
                        textValue="Regenerate Hero"
                      >
                        <ImageIcon className="mr-2 size-4" />
                        <Label>Regenerate Hero</Label>
                      </Dropdown.Item>
                    </>
                  )}

                  <Dropdown.Item id="delete" textValue="Delete" variant="danger">
                    <Trash2 className="mr-2 size-4" />
                    <Label>Delete</Label>
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown.Popover>
            </Dropdown>
          );
        },
      },
    ],
    [
      deletingId,
      handlePreview,
      handleRegenerateHero,
      heroRegeneratingId,
      regeneratingId,
      router,
    ],
  );

  const filteredPosts = useMemo(() => {
    const search = globalFilter.trim().toLowerCase();

    if (!search) {
      return posts;
    }

    return posts.filter((post) => (
      post.title?.toLowerCase().includes(search) ||
      post.month?.toLowerCase().includes(search) ||
      post.dataType?.toLowerCase().includes(search) ||
      post.status?.toLowerCase().includes(search) ||
      post.metadata?.modelId?.toLowerCase().includes(search)
    ));
  }, [globalFilter, posts]);

  const sortedPosts = useMemo(() => {
    const column = columns.find((item) => item.id === sortDescriptor.column);

    if (!column?.sortFn) {
      return filteredPosts;
    }

    return [...filteredPosts].sort((a, b) => {
      const result = column.sortFn!(a, b);

      return sortDescriptor.direction === 'descending' ? -result : result;
    });
  }, [columns, filteredPosts, sortDescriptor]);

  const pageCount = Math.max(1, Math.ceil(sortedPosts.length / pageSize));
  const currentPageIndex = Math.min(pageIndex, pageCount - 1);

  const paginatedPosts = useMemo(() => {
    const start = currentPageIndex * pageSize;

    return sortedPosts.slice(start, start + pageSize);
  }, [currentPageIndex, pageSize, sortedPosts]);

  return (
    <>
      <Card>
        <Card.Header>
          <Card.Title>All Blog Posts</Card.Title>
          <Card.Description>
            {filteredPosts.length} of {posts.length} post
            {posts.length !== 1 ? 's' : ''}
          </Card.Description>
        </Card.Header>

        <Card.Content className="flex flex-col gap-4">
          <TextField
            aria-label="Search blog posts"
            className="relative max-w-sm"
          >
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
            <Input
              className="pl-9"
              placeholder="Search by title, month, type, status, or model..."
              value={globalFilter}
              onChange={(event) => {
                setGlobalFilter(event.target.value);
                setPageIndex(0);
              }}
            />
          </TextField>

          <DataGrid
            allowsColumnResize
            aria-label="Blog posts"
            columns={columns}
            contentClassName="min-w-[1120px]"
            data={paginatedPosts}
            getRowId={(post) => post.id}
            scrollContainerClassName="overflow-x-auto"
            sortDescriptor={sortDescriptor}
            variant="secondary"
            verticalAlign="middle"
            renderEmptyState={() => (
              <EmptyState size="sm">
                <EmptyState.Header>
                  <EmptyState.Media variant="icon">
                    <FileText className="size-5" />
                  </EmptyState.Media>
                  <EmptyState.Title>No blog posts found</EmptyState.Title>
                  <EmptyState.Description>
                    Try changing your search query.
                  </EmptyState.Description>
                </EmptyState.Header>
              </EmptyState>
            )}
            onRowAction={(key) => {
              router.push(`/admin/content/blog/${key}/edit`);
            }}
            onSortChange={(descriptor) => {
              setSortDescriptor(descriptor);
              setPageIndex(0);
            }}
          />

          <div className="flex flex-col items-center gap-2 lg:flex-row lg:justify-between">
            <p className="text-muted text-sm">
              {filteredPosts.length} row
              {filteredPosts.length !== 1 ? 's' : ''}
            </p>

            <div className="flex flex-col items-center gap-4 lg:flex-row lg:gap-6">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">Rows per page</span>

                <Select
                  aria-label="Rows per page"
                  selectedKey={`${pageSize}`}
                  onSelectionChange={(selection) => {
                    if (selection === 'all') {
                      return;
                    }

                    const [nextPageSize] = selection;

                    if (!nextPageSize) {
                      return;
                    }

                    setPageSize(Number(nextPageSize));
                    setPageIndex(0);
                  }}
                >
                  <Select.Trigger className="h-8 w-20">
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>

                  <Select.Popover placement="top">
                    <ListBox>
                      {PAGE_SIZES.map((size) => (
                        <ListBox.Item
                          key={size}
                          id={`${size}`}
                          textValue={`${size}`}
                        >
                          {size}
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>
              </div>

              <span className="font-medium text-sm">
                Page {currentPageIndex + 1} of {pageCount}
              </span>

              <div className="flex items-center gap-1">
                <Button
                  className="hidden size-8 p-0 lg:flex"
                  isDisabled={currentPageIndex === 0}
                  size="sm"
                  variant="outline"
                  onPress={() => setPageIndex(0)}
                >
                  <span className="sr-only">First page</span>
                  <ChevronsLeft className="size-4" />
                </Button>

                <Button
                  className="size-8 p-0"
                  isDisabled={currentPageIndex === 0}
                  size="sm"
                  variant="outline"
                  onPress={() => {
                    setPageIndex((current) => Math.max(0, current - 1));
                  }}
                >
                  <span className="sr-only">Previous page</span>
                  <ChevronLeft className="size-4" />
                </Button>

                <Button
                  className="size-8 p-0"
                  isDisabled={currentPageIndex >= pageCount - 1}
                  size="sm"
                  variant="outline"
                  onPress={() => {
                    setPageIndex((current) =>
                      Math.min(pageCount - 1, current + 1),
                    );
                  }}
                >
                  <span className="sr-only">Next page</span>
                  <ChevronRight className="size-4" />
                </Button>

                <Button
                  className="hidden size-8 p-0 lg:flex"
                  isDisabled={currentPageIndex >= pageCount - 1}
                  size="sm"
                  variant="outline"
                  onPress={() => setPageIndex(pageCount - 1)}
                >
                  <span className="sr-only">Last page</span>
                  <ChevronsRight className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card.Content>
      </Card>

      <AlertDialog.Backdrop
        isOpen={confirmDialog.open}
        onOpenChange={(open) => {
          setConfirmDialog((current) => ({ ...current, open }));
        }}
      >
        <AlertDialog.Container>
          <AlertDialog.Dialog className="sm:max-w-120">
            <AlertDialog.CloseTrigger />
            <AlertDialog.Header>
              <AlertDialog.Icon
                status={confirmDialog.type === 'delete' ? 'danger' : 'warning'}
              />
              <AlertDialog.Heading>
                {confirmDialog.type === 'delete'
                  ? 'Delete Blog Post?'
                  : 'Regenerate Blog Post?'}
              </AlertDialog.Heading>
            </AlertDialog.Header>

            <AlertDialog.Body>
              <div className="flex flex-col gap-3">
                {confirmDialog.type === 'delete' ? (
                  <p>
                    This will permanently delete{' '}
                    <strong>"{confirmDialog.post?.title}"</strong>. This action
                    cannot be undone.
                  </p>
                ) : (
                  <>
                    <p>
                      This will generate a new blog post for{' '}
                      <strong>
                        {confirmDialog.post?.month} (
                        {confirmDialog.post?.dataType})
                      </strong>{' '}
                      using the latest data and AI model. The existing post will
                      be updated.
                    </p>

                    {!!confirmDialog.post?.metadata?.usage && (
                      <div className="flex flex-col gap-1 rounded-md bg-surface p-3 text-sm">
                        <span className="font-medium">
                          Estimated regeneration cost:
                        </span>
                        <span>
                          Previous usage:{' '}
                          {confirmDialog.post.metadata.usage.totalTokens?.toLocaleString()}{' '}
                          tokens
                        </span>
                        <span>
                          Estimated cost: ~
                          {estimateTokenCost(confirmDialog.post.metadata.usage)}
                        </span>
                        <span className="text-muted text-xs">
                          Based on Gemini Flash pricing. Actual cost may vary.
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </AlertDialog.Body>

            <AlertDialog.Footer>
              <Button slot="close" variant="tertiary">
                Cancel
              </Button>
              <Button
                variant={confirmDialog.type === 'delete' ? 'danger' : 'primary'}
                onPress={() => {
                  if (!confirmDialog.post) {
                    return;
                  }

                  if (confirmDialog.type === 'delete') {
                    handleDelete(confirmDialog.post);
                  } else {
                    handleRegenerate(confirmDialog.post);
                  }
                }}
              >
                {confirmDialog.type === 'delete' ? 'Delete' : 'Regenerate'}
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>

      <Modal.Backdrop
        isOpen={previewDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setPreviewDialog({ open: false, post: null });
          }
        }}
      >
        <Modal.Container scroll="inside" size="cover">
          <Modal.Dialog>
            <Modal.CloseTrigger />

            <Modal.Header>
              <Modal.Heading className="line-clamp-2">
                {previewDialog.post?.title}
              </Modal.Heading>
            </Modal.Header>

            <Modal.Body>
              {!!previewDialog.post && previews[previewDialog.post.id]}
            </Modal.Body>

            <Modal.Footer>
              {!!previewDialog.post?.slug && (
                <Link
                  href={`/blog/${previewDialog.post.slug}`}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Button variant="outline">
                    <ExternalLink className="mr-2 size-4" />
                    View Live
                  </Button>
                </Link>
              )}
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </>
  );
}
