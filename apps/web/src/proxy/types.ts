import type { NextRequest, NextResponse } from 'next/server';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ProxyContext {}

export type ProxyHandler = (request: NextRequest, next: ((request: NextRequest) => Promise<NextResponse>), data: Partial<ProxyContext>) => Promise<NextResponse> | NextResponse;
