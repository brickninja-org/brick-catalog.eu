'use client';

import { toast } from '@heroui/react';
import { Button } from '@heroui/react/button';
import { Loader2, Play, RefreshCw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { upsertWorkflowDraftPost } from '@/app/[language]/admin/actions/blog';

const STORAGE_KEY = 'admin.blog.workflow.lastRun';
const UPDATE_EVENT = 'admin-blog-workflow-updated';

interface TriggerBlogSyncButtonProps {
  title: string,
  description: string,
  compact?: boolean,
}

interface BlogWorkflowResult {
  draft?: {
    title?: string,
    slug?: string,
    excerpt?: string,
    markdown?: string,
  },
}

export function TriggerBlogSyncButton({ title, description, compact = false }: TriggerBlogSyncButtonProps) {
  const isMountedRef = useRef(true);
  const [isPending, setIsPending] = useState(false);
  const [lastRunId, setLastRunId] = useState('');
  const [runStatus, setRunStatus] = useState<'idle' | 'running' | 'completed' | 'failed'>('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleTrigger = async () => {
    try {
      setIsPending(true);
      setError('');

      const response = await fetch('/api/admin/workflows/blog/sync', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ requestedBy: 'admin-dashboard' }),
      });

      if (!response.ok) {
        setLastRunId('');
        setError('Workflow could not be started.');
        toast.danger('Workflow could not be started.');

        return;
      }

      const data = await response.json() as { runId?: string };

      const runId = data.runId ?? '';
      if (!isMountedRef.current) {
        return;
      }

      setLastRunId(runId);
      if (runId) {
        setRunStatus('running');
        toast('Blog sync started.');
        const payload = JSON.stringify({ runId, startedAt: new Date().toISOString() });
        localStorage.setItem(STORAGE_KEY, payload);
        window.dispatchEvent(new Event(UPDATE_EVENT));
        await waitForWorkflowAndSaveDraft(runId);
      }
    } catch {
      setLastRunId('');
      setRunStatus('failed');
      setError('Workflow could not be started.');
      toast.danger('Workflow could not be started.');
    } finally {
      setIsPending(false);
    }
  };

  const waitForWorkflowAndSaveDraft = async (runId: string) => {
    for (let attempt = 0; attempt < 30; attempt++) {
      if (!isMountedRef.current) {
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 1500));
      try {
        const response = await fetch(`/api/admin/workflows/blog/run?runId=${encodeURIComponent(runId)}&includeResult=1`);
        if (!response.ok) {
          continue;
        }
        const data = await response.json() as {
          status?: string,
          result?: BlogWorkflowResult,
        };
        if (data.status !== 'completed') {
          continue;
        }

        const draft = data.result?.draft;
        if (!draft?.title || !draft.slug || !draft.markdown) {
          setRunStatus('failed');
          setError('Workflow completed without a usable draft.');
          toast.warning('Workflow completed without a usable draft.');

          return;
        }

        await upsertWorkflowDraftPost({
          title: draft.title,
          slug: draft.slug,
          excerpt: draft.excerpt ?? '',
          content: draft.markdown,
        });
        if (!isMountedRef.current) {
          return;
        }

        setRunStatus('completed');
        window.dispatchEvent(new Event(UPDATE_EVENT));
        toast.success('Blog draft updated successfully.');

        return;
      } catch {
        // keep polling within retry budget
      }
    }

    setRunStatus('failed');
    setError('Workflow status remained pending for too long.');
    toast.warning('Workflow took too long. Check run status.');
  };

  return (
    <Button
      isDisabled={isPending}
      size="sm"
      variant="outline"
      onPress={handleTrigger}
    >
      {runStatus === 'running' || isPending ? <Loader2 className=""/> : <Play className="size-4"/>}
      {compact ? title : (
        <div className="text-left">
          <div className="font-medium">{title}</div>
          <div className="text-muted text-xs">{description}</div>
        </div>
      )}
    </Button>
  );
}
