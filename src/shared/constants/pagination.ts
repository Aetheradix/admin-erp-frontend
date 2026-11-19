export const PAGE_SIZES = {
  XS: 5,
  SM: 8,
  MD: 10,
  LG: 12,
  XL: 15,
} as const;

export type PageSize = (typeof PAGE_SIZES)[keyof typeof PAGE_SIZES];

export const DEFAULT_PAGE_SIZE: PageSize = PAGE_SIZES.MD;

export const ALL_FILTER = 'All';
export const ALL_FILTER_UPPER = 'ALL';
