import { NextResponse } from 'next/server';
import { getRun } from 'workflow/api';

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

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const runId = url.searchParams.get('runId');

  if (!runId) {
    return NextResponse.json({ error: 'Missing runId' }, { status: 400 });
  }

  try {
    const run = getRun(runId);
    const status = await run.status;
    const workflowName = await run.workflowName;
    const createdAt = await run.createdAt;
    const startedAt = await run.startedAt;
    const completedAt = await run.completedAt;
    const includeResult = url.searchParams.get('includeResult') === '1';
    const result = includeResult && status === 'completed'
      ? await run.returnValue
      : null;

    return NextResponse.json({
      ok: true,
      runId,
      status,
      workflowName,
      createdAt,
      startedAt,
      completedAt,
      result,
    });
  } catch {
    return NextResponse.json({ ok: false, runId, status: 'unknown' }, { status: 404 });
  }
}
