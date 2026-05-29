import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

interface RevalidatePayload {
  paths?: string[],
}

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

  const body = (await request.json().catch(() => ({}))) as RevalidatePayload;
  const paths = body.paths?.length ? body.paths : ['/blog'];

  paths.forEach((path) => revalidatePath(path));

  return NextResponse.json({ ok: true, paths });
}

