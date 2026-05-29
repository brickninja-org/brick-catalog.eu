import type { UnwrapJsonResponse } from '../helper.ts';

import { NextResponse } from 'next/server';

import { searchDesigns, searchElements, splitSearchTerms } from './helper';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const searchValue = searchParams.get('q') ?? '';

  const terms = splitSearchTerms(searchValue);

  const [designs, elements] = await Promise.all([
    searchDesigns(terms),
    searchElements(terms),
  ]);

  return NextResponse.json({ searchValue, terms, ...designs, elements });
}

export type ApiSearchResponse = UnwrapJsonResponse<ReturnType<typeof GET>>;
