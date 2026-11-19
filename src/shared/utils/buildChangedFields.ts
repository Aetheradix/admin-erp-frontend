export interface ChangedField {
  field: string;
  from: unknown;
  to: unknown;
}

export interface BuildChangedFieldsOptions {
  normalizeEmpty?: boolean;
}

export function buildChangedFields<T extends object>(
  original: T,
  edited: T,
  fields: readonly (keyof T)[],
  options: BuildChangedFieldsOptions = {}
): ChangedField[] {
  const changed: ChangedField[] = [];

  for (const field of fields) {
    const from = original[field];
    const to = edited[field];

    if (options.normalizeEmpty) {
      const normalizedFrom = from ?? '';
      const normalizedTo = to ?? '';
      if (normalizedFrom !== normalizedTo) {
        changed.push({ field: String(field), from: normalizedFrom, to: normalizedTo });
      }
      continue;
    }

    if (from !== to) {
      changed.push({ field: String(field), from, to });
    }
  }

  return changed;
}
