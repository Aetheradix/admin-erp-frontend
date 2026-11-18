export type QueryParamValue = string | number | boolean | null | undefined;

export function buildQueryParams(params: Record<string, QueryParamValue>): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    search.set(key, String(value));
  }

  return search.toString();
}

export function buildQueryString(params: Record<string, QueryParamValue>): string {
  const query = buildQueryParams(params);
  return query ? `?${query}` : '';
}
