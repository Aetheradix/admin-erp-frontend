export function safeGet<T = unknown>(source: unknown, path: string, fallback?: T): T | undefined {
  if (source === null || source === undefined) return fallback;

  const segments = path.split('.').filter(Boolean);
  let current: unknown = source;

  for (const segment of segments) {
    if (current === null || typeof current !== 'object') return fallback;
    current = (current as Record<string, unknown>)[segment];
    if (current === undefined) return fallback;
  }

  return current as T;
}
