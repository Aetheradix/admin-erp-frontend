export interface InitialsOptions {
  max?: number;
  singleWord?: 'first' | 'two-chars';
  fallback?: string;
}

export function getInitials(name?: string | null, options: InitialsOptions = {}): string {
  const max = options.max ?? 2;
  const value = (name ?? '').trim();
  if (!value) return options.fallback ?? 'U';

  const words = value.split(/\s+/).filter(Boolean);
  if (words.length > 1) {
    return words
      .slice(0, max)
      .map((word) => word[0])
      .join('')
      .toUpperCase();
  }

  return options.singleWord === 'two-chars'
    ? value.slice(0, max).toUpperCase()
    : value.charAt(0).toUpperCase();
}
