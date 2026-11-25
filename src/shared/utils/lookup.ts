export function createLookupMap<T, K>(items: readonly T[], getKey: (item: T) => K): Map<K, T> {
  const map = new Map<K, T>();
  for (const item of items) {
    map.set(getKey(item), item);
  }
  return map;
}

export function createGroupMap<T, K>(items: readonly T[], getKey: (item: T) => K): Map<K, T[]> {
  const map = new Map<K, T[]>();
  for (const item of items) {
    const key = getKey(item);
    const group = map.get(key);
    if (group) {
      group.push(item);
    } else {
      map.set(key, [item]);
    }
  }
  return map;
}

export function groupBy<T, K extends string>(
  items: readonly T[],
  getKey: (item: T) => K
): Record<K, T[]> {
  const groups = {} as Record<K, T[]>;
  for (const item of items) {
    const key = getKey(item);
    if (groups[key]) {
      groups[key].push(item);
    } else {
      groups[key] = [item];
    }
  }
  return groups;
}

export function indexBy<T>(
  items: readonly T[],
  getKey: (item: T) => string | number
): Record<string, T> {
  const index: Record<string, T> = {};
  for (const item of items) {
    index[String(getKey(item))] = item;
  }
  return index;
}
