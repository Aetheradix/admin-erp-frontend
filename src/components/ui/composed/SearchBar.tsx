import { Search, Command, CornerDownLeft, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SearchResult } from '@/hooks/useGlobalSearch';

interface SearchBarProps {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  query: string;
  setQuery: (q: string) => void;
  groupedResults: Record<string, SearchResult[]>;
  flatResults: SearchResult[];
  activeIndex: number;
  setActiveIndex: (i: number) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  selectItem: (item: SearchResult) => void;
  className?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  OVERVIEW: 'Overview',
  MANAGEMENT: 'Management',
  SYSTEM: 'System',
  OTHER: 'Other',
};

const CATEGORY_ORDER = ['OVERVIEW', 'MANAGEMENT', 'SYSTEM', 'OTHER'];

export const SearchBar = ({
  isOpen,
  open,
  close,
  query,
  setQuery,
  groupedResults,
  flatResults,
  activeIndex,
  setActiveIndex,
  onKeyDown,
  selectItem,
  className,
}: SearchBarProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return;
    const active = listRef.current.querySelector('[data-active="true"]');
    if (active) {
      active.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, close]);

  let flatIdx = -1;

  return (
    <div ref={containerRef} className={cn('relative w-full max-w-lg', className)}>
      {/* Search Trigger / Active Input */}
      {!isOpen ? (
        <button
          type="button"
          onClick={open}
          className={cn(
            'relative flex items-center w-full gap-3 px-4 py-2.5',
            'rounded-pill border border-border-subtle bg-surface-subtle',
            'hover:bg-surface-elevated hover:border-border-strong',
            'transition-all duration-300 cursor-pointer group'
          )}
        >
          <Search
            size={16}
            className="text-muted shrink-0 group-hover:text-primary transition-colors"
          />
          <span className="text-sm text-muted font-medium truncate flex-1 text-left">
            Search features, documents, staff...
          </span>
          <kbd className="hidden sm:flex items-center gap-0.5 px-2 py-1 rounded-md bg-background border border-border-subtle text-[10px] font-bold text-muted uppercase tracking-wider shrink-0">
            <Command size={10} />K
          </kbd>
        </button>
      ) : (
        <div
          className={cn(
            'flex items-center w-full gap-3 px-4 py-2.5',
            'rounded-pill border-2 border-primary bg-surface-elevated',
            'shadow-md transition-all duration-200'
          )}
        >
          <Search size={16} className="text-primary shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search pages, features, modules..."
            className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-foreground placeholder:text-muted/60"
            autoComplete="off"
            spellCheck={false}
          />
          <kbd
            onClick={close}
            className="flex items-center px-2 py-1 rounded-md bg-surface-subtle border border-border-subtle text-[10px] font-bold text-muted uppercase tracking-wider shrink-0 cursor-pointer hover:bg-background transition-colors"
          >
            Esc
          </kbd>
        </div>
      )}

      {/* Dropdown Results Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="search-dropdown"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="global-search-dropdown"
          >
            {/* Results */}
            <div ref={listRef} className="global-search-results">
              {flatResults.length === 0 && query.trim() ? (
                <div className="global-search-empty">
                  <Search size={36} className="text-muted/30 mx-auto mb-2" />
                  <p className="text-muted text-sm font-medium">
                    No results for "<span className="text-foreground">{query}</span>"
                  </p>
                  <p className="text-muted/60 text-xs mt-1">Try a different search term</p>
                </div>
              ) : (
                CATEGORY_ORDER.map((cat) => {
                  const items = groupedResults[cat];
                  if (!items || items.length === 0) return null;

                  return (
                    <div key={cat} className="global-search-group">
                      <p className="global-search-group-label">{CATEGORY_LABELS[cat] || cat}</p>
                      {items.map((item) => {
                        flatIdx++;
                        const idx = flatIdx;
                        const isActive = idx === activeIndex;
                        const Icon = item.icon;

                        return (
                          <button
                            key={item.path + item.label}
                            type="button"
                            data-active={isActive}
                            className={`global-search-item ${isActive ? 'global-search-item--active' : ''}`}
                            onClick={() => selectItem(item)}
                            onMouseEnter={() => setActiveIndex(idx)}
                          >
                            <div className="global-search-item-icon">
                              <Icon size={16} />
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-foreground truncate">
                                  {item.label}
                                </span>
                                {item.parentLabel && (
                                  <span className="text-xs text-muted truncate">
                                    in {item.parentLabel}
                                  </span>
                                )}
                              </div>
                              {item.description && (
                                <p className="text-xs text-muted/70 truncate mt-0.5">
                                  {item.description}
                                </p>
                              )}
                            </div>
                            {isActive && (
                              <CornerDownLeft
                                size={13}
                                className="text-primary shrink-0 opacity-50"
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Hints */}
            <div className="global-search-footer">
              <div className="flex items-center gap-3 text-[10px] text-muted/50 font-medium">
                <span className="flex items-center gap-1">
                  <ArrowUp size={10} />
                  <ArrowDown size={10} />
                  navigate
                </span>
                <span className="flex items-center gap-1">
                  <CornerDownLeft size={10} />
                  select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="global-search-kbd-sm">Esc</kbd>
                  close
                </span>
                <span className="ml-auto flex items-center gap-1">
                  <Command size={9} />
                  <span>K to toggle</span>
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
