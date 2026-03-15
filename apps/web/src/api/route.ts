import { NextResponse } from 'next/server';

import { getLanguage } from '@/lib/translate';
import { getBaseUrl } from '@/lib/url';

export async function GET() {
  const language = await getLanguage();
  const documentation = new URL('/dev/api', getBaseUrl());

  return NextResponse.json({ api: true, language, documentation });
}
