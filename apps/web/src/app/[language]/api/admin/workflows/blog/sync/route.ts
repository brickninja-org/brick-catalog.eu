import type { BlogSyncInput } from '@/workflows/admin/blog-sync';

import { NextResponse } from 'next/server';
import { start } from 'workflow/api';

import { blogSyncWorkflow } from '@/workflows/admin/blog-sync';

function isAuthorized(request: Request): boolean {
  const adminToken = process.env.ADMIN_WORKFLOW_TOKEN;

  if (!adminToken) {
    return process.env.NODE_ENV !== 'production';
  }

  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return false;
  }

  const providedToken = authHeader.slice('Bearer '.length).trim();

  return providedToken.length > 0 && providedToken === adminToken;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as BlogSyncInput;
  const run = await start(blogSyncWorkflow, [body]);

  return NextResponse.json({
    ok: true,
    runId: run.runId,
    message: 'Blog sync workflow started',
  });
}

