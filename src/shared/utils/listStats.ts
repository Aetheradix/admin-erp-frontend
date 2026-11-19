import { FALLBACK } from '../constants/fallbacks';

export function countByStatus<T>(
  rows: readonly T[],
  getStatus: (row: T) => string | null | undefined
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const row of rows) {
    const status = getStatus(row) ?? FALLBACK.UNKNOWN;
    counts[status] = (counts[status] ?? 0) + 1;
  }
  return counts;
}

export function filterBySearch<T>(
  rows: readonly T[],
  query: string,
  getFields: (row: T) => readonly (string | null | undefined)[]
): T[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [...rows];
  return rows.filter((row) =>
    getFields(row).some((field) => (field ?? '').toLowerCase().includes(needle))
  );
}

export function sumField<T>(rows: readonly T[], getValue: (row: T) => number): number {
  let total = 0;
  for (const row of rows) total += getValue(row);
  return total;
}
