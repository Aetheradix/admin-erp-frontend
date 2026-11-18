import { useCallback, useEffect, useRef, useState } from 'react';
import { searchLocations, type GeocodingResult } from '@/services/geocodingService';

const EMPTY_RESULTS: GeocodingResult[] = [];

interface SearchResultBatch {
  query: string;
  results: GeocodingResult[];
}

export function usePlaceSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [resultBatch, setResultBatch] = useState<SearchResultBatch | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isTooShort = searchQuery.trim().length < 2;
  const searchResults = isTooShort ? EMPTY_RESULTS : (resultBatch?.results ?? EMPTY_RESULTS);
  const isSearching = !isTooShort && resultBatch?.query !== searchQuery;

  useEffect(() => {
    if (searchQuery.trim().length < 2) return;

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      const results = await searchLocations(searchQuery);
      setResultBatch({ query: searchQuery, results });
      setShowSuggestions(true);
    }, 350);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const resetSearch = useCallback((initialQuery = '') => {
    setSearchQuery(initialQuery);
    setResultBatch(null);
    setShowSuggestions(false);
  }, []);

  const clearSearch = useCallback(() => resetSearch(''), [resetSearch]);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    showSuggestions,
    setShowSuggestions,
    resetSearch,
    clearSearch,
  };
}
