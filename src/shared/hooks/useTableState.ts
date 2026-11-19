import { useCallback, useState } from 'react';
import { DEFAULT_PAGE_SIZE } from '../constants/pagination';

export type SortOrder = 'ASC' | 'DESC';

export interface TableStateOptions {
  initialPage?: number;
  initialLimit?: number;
  initialSortBy?: string;
  initialSortOrder?: SortOrder;
  total?: number;
}

export interface TableStatePagination {
  current: number;
  pageSize: number;
  total?: number;
  onChange: (page: number, pageSize: number) => void;
}

export function useTableState(options: TableStateOptions = {}) {
  const [page, setPage] = useState(options.initialPage ?? 1);
  const [limit, setLimit] = useState(options.initialLimit ?? DEFAULT_PAGE_SIZE);
  const [sortBy, setSortBy] = useState<string | undefined>(options.initialSortBy);
  const [sortOrder, setSortOrder] = useState<SortOrder | undefined>(options.initialSortOrder);

  const setSort = useCallback((nextBy?: string, nextOrder: SortOrder = 'DESC') => {
    setPage(1);
    setSortBy(nextBy);
    setSortOrder(nextBy ? nextOrder : undefined);
  }, []);

  const pagination: TableStatePagination = {
    current: page,
    pageSize: limit,
    total: options.total,
    onChange: (nextPage, nextLimit) => {
      setPage(nextPage);
      setLimit(nextLimit);
    },
  };

  return { page, setPage, limit, setLimit, sortBy, sortOrder, setSort, pagination };
}
