import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CornerDownLeft, ArrowUp, ArrowDown, Command } from 'lucide-react';
import type { SearchResult } from '@/hooks/useGlobalSearch';

interface GlobalSearchOverlayProps {
    isOpen: boolean;
    close: () => void;
    query: string;
    setQuery: (q: string) => void;
    groupedResults: Record<string, SearchResult[]>;
    flatResults: SearchResult[];
    activeIndex: number;
    setActiveIndex: (i: number) => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
    selectItem: (item: SearchResult) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
    OVERVIEW: 'Overview',
    MANAGEMENT: 'Management',
    SYSTEM: 'System',
    OTHER: 'Other',
};

const CATEGORY_ORDER = ['OVERVIEW', 'MANAGEMENT', 'SYSTEM', 'OTHER'];

export function GlobalSearchOverlay({
    isOpen,
    close,
    query,
    setQuery,
    groupedResults,
    flatResults,
    activeIndex,
    setActiveIndex,
    onKeyDown,
    selectItem,
}: GlobalSearchOverlayProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    // Auto-focus input when overlay opens
    useEffect(() => {
        if (isOpen) {
            // Small delay to let animation start
            const t = setTimeout(() => inputRef.current?.focus(), 80);
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

    // Build a flat index so we can map grouped render → flat index
    let flatIdx = -1;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="search-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="global-search-backdrop"
                        onClick={close}
                    />

                    {/* Palette */}
                    <motion.div
                        key="search-palette"
                        initial={{ opacity: 0, scale: 0.96, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: -20 }}
                        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                        className="global-search-palette"
                        onKeyDown={onKeyDown}
                    >
                        {/* Search Input */}
                        <div className="global-search-input-wrapper">
                            <Search size={20} className="text-muted shrink-0" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search pages, features, modules..."
                                className="global-search-input"
                                autoComplete="off"
                                spellCheck={false}
                            />
                            <kbd className="global-search-kbd">Esc</kbd>
                        </div>

                        {/* Divider */}
                        <div className="w-full h-px bg-border-subtle" />

                        {/* Results */}
                        <div ref={listRef} className="global-search-results">
                            {flatResults.length === 0 ? (
                                <div className="global-search-empty">
                                    <Search size={40} className="text-muted/30 mx-auto mb-3" />
                                    <p className="text-muted text-sm font-medium">
                                        No results for "<span className="text-foreground">{query}</span>"
                                    </p>
                                    <p className="text-muted/60 text-xs mt-1">
                                        Try searching for a page name or feature
                                    </p>
                                </div>
                            ) : (
                                CATEGORY_ORDER.map((cat) => {
                                    const items = groupedResults[cat];
                                    if (!items || items.length === 0) return null;

                                    return (
                                        <div key={cat} className="global-search-group">
                                            <p className="global-search-group-label">
                                                {CATEGORY_LABELS[cat] || cat}
                                            </p>
                                            {items.map((item) => {
                                                flatIdx++;
                                                const idx = flatIdx; // capture for closure
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
                                                            <Icon size={18} />
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
                                                            <CornerDownLeft size={14} className="text-primary shrink-0 opacity-60" />
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
                            <div className="flex items-center gap-3 text-xs text-muted/60">
                                <span className="flex items-center gap-1">
                                    <ArrowUp size={12} />
                                    <ArrowDown size={12} />
                                    navigate
                                </span>
                                <span className="flex items-center gap-1">
                                    <CornerDownLeft size={12} />
                                    select
                                </span>
                                <span className="flex items-center gap-1">
                                    <kbd className="global-search-kbd-sm">Esc</kbd>
                                    close
                                </span>
                                <span className="ml-auto flex items-center gap-1">
                                    <Command size={11} />
                                    <span>K to toggle</span>
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
