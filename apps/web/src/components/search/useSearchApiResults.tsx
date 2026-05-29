import type { SearchResult, SearchResults } from './Search.types';
import type { ApiSearchResponse } from '@/app/[language]/api/search/route';

import { useJsonFetch, useStaleJsonResponse } from '@/lib/use-fetch';

export function useSearchApiResults(searchValue: string) {
  const fetchResponse = useJsonFetch<ApiSearchResponse>(`/api/search?q=${encodeURIComponent(searchValue)}`);
  const response = useStaleJsonResponse(fetchResponse);

  const elements = response.loading ? [] : response.data.elements.map<SearchResult>((element) => ({
    title: element.name,
    href: `/element/${element.id}`,
    icon: null,
  }));

  const designs = response.loading ? [] : response.data.designs.map<SearchResult>((design) => ({
    title: design.name,
    subtitle: (
      <>
        {design.id}
        {!!design.pieceType && (<> ▪ {design.pieceType}</>)}
        {!!design.subcategory && (<> ▪ {design.subcategory.name}</>) }
      </>
    ),
    href: `/element/design/${design.id}`,
    icon: null,
  }));

  const categories = response.loading ? [] : response.data.designGroups.map<SearchResult>((category) => ({
    title: category.name,
    href: `/element#${category.id}`,
    icon: null,
  }));

  const results = <Id extends string>(id: Id, results: SearchResult[]): SearchResults<Id> => ({ id, results, loading: fetchResponse.loading });

  return [
    results('elements', elements),
    results('elements.designs', designs),
    results('elements.categories', categories),
  ];
}
