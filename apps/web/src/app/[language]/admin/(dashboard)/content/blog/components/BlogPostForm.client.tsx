'use client';

import type { Post } from '@brickcatalog/database';

import {
  isRegeneratablePostDataType,
} from '@brickcatalog/ai';
import { PostStatus } from '@brickcatalog/database';
import {
  AlertDialog,
  Button,
  Description,
  FieldError,
  Form,
  Input,
  Label,
  ListBox,
  Surface,
  Select,
  TextArea,
  TextField,
  toast,
} from '@heroui/react';
import { buttonVariants } from '@heroui/styles';
import { Loader2, Plus, RefreshCw, Save, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import {
  createBlogPost,
  getBlogPostById,
  regeneratePost,
  updateBlogPost,
} from '@/app/[language]/admin/actions/blog';

interface Highlight {
  id: string,
  value: string,
  label: string,
  detail: string,
}

interface BlogPostFormProps {
  mode: 'create' | 'edit',
  initialPost?: null | Post,
  saveLabel: string,
  cancelLabel: string,
  cancelHref: string,
  titleLabel: string,
  excerptLabel: string,
  contentLabel: string,
}

function createHighlight(): Highlight {
  return {
    id: crypto.randomUUID(),
    value: '',
    label: '',
    detail: '',
  };
}

function parseTags(tags: string) {
  return tags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function parseHighlights(highlights: Highlight[]) {
  const parsed = highlights
    .map(({ value, label, detail }) => ({
      value: value.trim(),
      label: label.trim(),
      detail: detail.trim(),
    }))
    .filter(
      (highlight) =>
        highlight.value || highlight.label || highlight.detail,
    );

  return parsed.length > 0 ? parsed : null;
}

function createPostFingerprint(post: {
  title?: string | null,
  excerpt?: string | null,
  content?: string | null,
  tags?: string[] | null,
  highlights?: unknown,
}) {
  return JSON.stringify({
    title: post.title ?? '',
    excerpt: post.excerpt ?? '',
    content: post.content ?? '',
    tags: post.tags ?? [],
    highlights: post.highlights ?? [],
  });
}

const REGEN_POLL_INTERVAL_MS = 2000;
const REGEN_POLL_MAX_ATTEMPTS = 10;

export function BlogPostForm({
  mode,
  initialPost,
  saveLabel,
  cancelLabel,
  cancelHref,
  titleLabel,
  excerptLabel,
  contentLabel,
}: BlogPostFormProps) {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const [title, setTitle] = useState(initialPost?.title ?? '');
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt ?? '');
  const [content, setContent] = useState(initialPost?.content ?? '');
  const [tags, setTags] = useState(initialPost?.tags?.join(', ') ?? '');
  const [month, setMonth] = useState(initialPost?.month ?? '');
  const [dataType, setDataType] = useState(initialPost?.dataType ?? '');
  const [status, setStatus] = useState<PostStatus>(
    initialPost?.status ?? PostStatus.Draft,
  );

  const [highlights, setHighlights] = useState<Highlight[]>(() => {
    if (!initialPost?.highlights) {
      return [];
    }

    const raw = initialPost.highlights as Array<{
      value?: string,
      label?: string,
      detail?: string,
    }>;

    return raw.map((highlight) => ({
      id: crypto.randomUUID(),
      value: highlight.value ?? '',
      label: highlight.label ?? '',
      detail: highlight.detail ?? '',
    }));
  });

  const canRegenerate = mode === 'edit'
    && !!initialPost?.month
    && !!initialPost?.dataType
    && isRegeneratablePostDataType(initialPost.dataType);

  const addHighlight = () => {
    setHighlights((current) => [...current, createHighlight()]);
  };

  const removeHighlight = (highlightId: string) => {
    setHighlights((current) =>
      current.filter((highlight) => highlight.id !== highlightId),
    );
  };

  const updateHighlight = (
    highlightId: string,
    field: 'value' | 'label' | 'detail',
    value: string,
  ) => {
    setHighlights((current) =>
      current.map((highlight) =>
        highlight.id === highlightId
          ? { ...highlight, [field]: value }
          : highlight,
      ),
    );
  };

  const hydrateFormFromPost = (post: Post) => {
    setTitle(post.title ?? '');
    setExcerpt(post.excerpt ?? '');
    setContent(post.content ?? '');
    setTags(post.tags?.join(', ') ?? '');
    setMonth(post.month ?? '');
    setDataType(post.dataType ?? '');

    const raw = (post.highlights as Array<{
      value?: string,
      label?: string,
      detail?: string,
    }> | null) ?? [];

    setHighlights(
      raw.map((highlight) => ({
        id: crypto.randomUUID(),
        value: highlight.value ?? '',
        label: highlight.label ?? '',
        detail: highlight.detail ?? '',
      })),
    );
  };

  const handleRegenerate = () => {
    if (
      !initialPost?.month
      || !initialPost?.dataType
      || !isRegeneratablePostDataType(initialPost.dataType)
    ) {
      toast.danger('This post type cannot be regenerated via workflow.');

      return;
    }

    setIsRegenerating(true);

    void (async () => {
      try {
        const result = await regeneratePost({
          postId: initialPost.id,
          month: initialPost.month,
          dataType: initialPost.dataType,
        });

        if (!result.success) {
          toast.danger(result.error ?? 'Failed to regenerate blog post');

          return;
        }

        toast.success(
          `Regeneration started${result.runId ? ` (run: ${result.runId})` : ''}. Checking for updates...`,
        );

        const previousUpdatedAt = new Date(initialPost.updatedAt).getTime();
        const previousFingerprint = createPostFingerprint(initialPost);
        let hasUpdated = false;
        let refreshedPost: null | Post = null;

        for (let attempt = 0; attempt < REGEN_POLL_MAX_ATTEMPTS; attempt += 1) {
          await new Promise((resolve) => setTimeout(resolve, REGEN_POLL_INTERVAL_MS));

          const latestPost = await getBlogPostById(initialPost.id);

          if (!latestPost) {
            continue;
          }

          const latestUpdatedAt = new Date(latestPost.updatedAt).getTime();
          const latestFingerprint = createPostFingerprint(latestPost);

          if (
            latestUpdatedAt > previousUpdatedAt
            || latestFingerprint !== previousFingerprint
          ) {
            hasUpdated = true;
            refreshedPost = latestPost;
            break;
          }
        }

        if (!refreshedPost) {
          refreshedPost = await getBlogPostById(initialPost.id);
        }

        router.refresh();

        if (hasUpdated) {
          if (refreshedPost) {
            hydrateFormFromPost(refreshedPost);
          }

          toast.success('Post updated with regenerated content.');

          return;
        }

        if (refreshedPost) {
          const finalFingerprint = createPostFingerprint(refreshedPost);

          if (finalFingerprint !== previousFingerprint) {
            hydrateFormFromPost(refreshedPost);
            toast.success('Post updated with regenerated content.');

            return;
          }
        }

        toast.success('Regeneration is still running. Refresh again shortly for the latest content.');
      } catch (error) {
        toast.danger(
          error instanceof Error
            ? error.message
            : 'Failed to regenerate blog post',
        );
      } finally {
        setIsRegenerating(false);
      }
    })();
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    setIsSubmitting(true);

    void (async () => {
      const baseData = {
        title: title.trim(),
        content: content.trim(),
        excerpt: excerpt.trim() || undefined,
        tags: parseTags(tags),
        month: month.trim() || null,
        dataType: dataType.trim() || null,
        highlights: parseHighlights(highlights) || [],
      };

      if (!baseData.title) {
        toast.danger('Title is required');
        setIsSubmitting(false);

        return;
      }

      if (!baseData.content) {
        toast.danger('Content is required');
        setIsSubmitting(false);

        return;
      }

      try {
        if (mode === 'edit' && initialPost) {
          const result = await updateBlogPost({
            id: initialPost.id,
            status,
            ...baseData,
          });

          if (!result.success) {
            toast.danger(result.error ?? 'Failed to update blog post');

            return;
          }

          toast.success('Blog post updated');
          router.refresh();

          return;
        }

        const result = await createBlogPost({
          ...baseData,
          status,
        });

        if (!result.success) {
          toast.danger(result.error ?? 'Failed to create blog post');

          return;
        }

        toast.success('Blog post created');
        router.push(cancelHref);
      } catch (error) {
        toast.danger(
          error instanceof Error ? error.message : 'An unexpected error occurred',
        );
      } finally {
        setIsSubmitting(false);
      }
    })();
  };

  return (
    <Form
      className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]"
      onSubmit={handleSubmit}
    >
      <Surface className="flex min-w-0 flex-col gap-6 rounded-3xl p-6">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Editor</h2>
          <p className="text-muted text-sm">
            Write and refine the public blog content.
          </p>
        </div>

        <TextField isRequired className="flex flex-col gap-2">
          <Label>{titleLabel}</Label>
          <Input
            name="title"
            placeholder="Enter post title"
            value={title}
            variant="secondary"
            onChange={(event) => setTitle(event.target.value)}
          />
          <FieldError />
        </TextField>

        <TextField className="flex flex-col gap-2">
          <Label>{excerptLabel}</Label>
          <Input
            name="excerpt"
            placeholder="Short summary for cards and SEO"
            value={excerpt}
            variant="secondary"
            onChange={(event) => setExcerpt(event.target.value)}
          />
          <Description>
            Keep this short. It is used in previews and metadata.
          </Description>
        </TextField>

        <TextField isRequired className="flex flex-col gap-2">
          <Label>{contentLabel}</Label>
          <TextArea
            className="min-h-[60vh]"
            name="content"
            placeholder="Markdown content"
            value={content}
            variant="secondary"
            onChange={(event) => setContent(event.target.value)}
          />
          <FieldError />
        </TextField>
      </Surface>

      <aside className="flex flex-col gap-8">
        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="font-semibold">Publishing settings</h2>
            <p className="text-muted text-sm">
              Source data and metadata for this post.
            </p>
          </div>

          <TextField className="flex flex-col gap-2">
            <Label>Month</Label>
            <Input
              name="month"
              placeholder="YYYY-MM"
              value={month}
              onChange={(event) => setMonth(event.target.value)}
            />
          </TextField>

          <TextField className="flex flex-col gap-2">
            <Label>Data type</Label>
            <Input
              name="dataType"
              placeholder="elements, sets"
              value={dataType}
              onChange={(event) => setDataType(event.target.value)}
            />
          </TextField>

          <div className="flex flex-col gap-2">
            <Label>Status</Label>
            <Select
              aria-label="Status"
              selectedKey={status}
              onSelectionChange={(selection) => {
                if (selection === 'all') {
                  return;
                }

                const [nextStatus] = selection;
                if (!nextStatus) {
                  return;
                }

                if (nextStatus === PostStatus.Draft || nextStatus === PostStatus.Published) {
                  setStatus(nextStatus);
                }
              }}
            >
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>

              <Select.Popover>
                <ListBox>
                  <ListBox.Item key={PostStatus.Draft} id={PostStatus.Draft} textValue="Draft">
                    Draft
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                  <ListBox.Item key={PostStatus.Published} id={PostStatus.Published} textValue="Published">
                    Published
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                </ListBox>
              </Select.Popover>
            </Select>
          </div>

          <TextField className="flex flex-col gap-2">
            <Label>Tags</Label>
            <Input
              name="tags"
              placeholder="Comma-separated tags"
              value={tags}
              onChange={(event) => setTags(event.target.value)}
            />
          </TextField>
        </section>

        <section className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <h2 className="font-semibold">Highlights</h2>
              <p className="text-muted text-sm">Metrics shown on the post.</p>
            </div>

            <Button
              isIconOnly
              size="sm"
              type="button"
              variant="secondary"
              onPress={addHighlight}
            >
              <Plus className="size-4" />
            </Button>
          </div>

          {highlights.length === 0 ? (
            <p className="text-muted text-sm">No highlights yet.</p>
          ) : (
            <div className="space-y-5">
              {highlights.map((highlight, index) => (
                <div key={highlight.id} className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium">
                      Highlight {index + 1}
                    </span>

                    <Button
                      isIconOnly
                      size="sm"
                      type="button"
                      variant="tertiary"
                      onPress={() => removeHighlight(highlight.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>

                  <Input
                    placeholder="Value"
                    value={highlight.value}
                    onChange={(event) =>
                      updateHighlight(highlight.id, 'value', event.target.value)
                    }
                  />

                  <Input
                    placeholder="Label"
                    value={highlight.label}
                    onChange={(event) =>
                      updateHighlight(highlight.id, 'label', event.target.value)
                    }
                  />

                  <Input
                    placeholder="Detail"
                    value={highlight.detail}
                    onChange={(event) =>
                      updateHighlight(highlight.id, 'detail', event.target.value)
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {!!canRegenerate && (
          <section className="space-y-3">
            <div className="space-y-1">
              <h2 className="font-semibold">AI regeneration</h2>
              <p className="text-muted text-sm">
                Replace generated content using fresh source data.
              </p>
            </div>

            <AlertDialog>
              <Button
                className="w-full"
                isDisabled={isRegenerating}
                type="button"
                variant="secondary"
              >
                {isRegenerating ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <RefreshCw className="size-4" />
                )}
                Regenerate content
              </Button>

              <AlertDialog.Backdrop>
                <AlertDialog.Container>
                  <AlertDialog.Dialog className="sm:max-w-110">
                    <AlertDialog.CloseTrigger />
                    <AlertDialog.Header>
                      <AlertDialog.Icon status="warning" />
                      <AlertDialog.Heading>
                        Regenerate blog post?
                      </AlertDialog.Heading>
                    </AlertDialog.Header>

                    <AlertDialog.Body>
                      This replaces the generated content for{' '}
                      <strong>
                        {initialPost?.month} ({initialPost?.dataType})
                      </strong>
                      .
                    </AlertDialog.Body>

                    <AlertDialog.Footer>
                      <Button slot="close" variant="tertiary">
                        Cancel
                      </Button>
                      <Button slot="close" onPress={handleRegenerate}>
                        Regenerate
                      </Button>
                    </AlertDialog.Footer>
                  </AlertDialog.Dialog>
                </AlertDialog.Container>
              </AlertDialog.Backdrop>
            </AlertDialog>
          </section>
        )}

        <div className="sticky bottom-4 z-20 space-y-3 rounded-2xl bg-content1/90 p-3 shadow-lg backdrop-blur">
          <Button className="w-full" isDisabled={isSubmitting} type="submit">
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            {saveLabel}
          </Button>

          <Link
            href={cancelHref}
            className={buttonVariants({
              variant: 'tertiary',
              className: 'w-full justify-center',
            })}
          >
            {cancelLabel}
          </Link>
        </div>
      </aside>
    </Form>
  );
}
