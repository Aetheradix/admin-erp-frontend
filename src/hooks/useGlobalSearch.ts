import { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { navItems, hasAccess, type UserRole } from '@/config/navItems';
import { useAuth } from './useAuth';
import type { LucideIcon } from 'lucide-react';

export interface SearchResult {
    label: string;
    path: string;
    description?: string;
    icon: LucideIcon;
    category: string;
    parentLabel?: string;
}

/**
 * Flatten navItems (including children) into a single searchable list,
 * filtered by the current user's role.
 */
function buildSearchableItems(userRole: UserRole | undefined): SearchResult[] {
    const items: SearchResult[] = [];

    for (const nav of navItems) {
        // Role-gate the parent
        if (userRole && !hasAccess(nav.roles, userRole)) continue;

        items.push({
            label: nav.label,
            path: nav.path,
            description: nav.description,
            icon: nav.icon,
            category: nav.category || 'OTHER',
        });

        if (nav.children) {
            for (const child of nav.children) {
                if (userRole && !hasAccess(child.roles, userRole)) continue;
                items.push({
                    label: child.label,
                    path: child.path,
                    description: nav.description,
                    icon: nav.icon,
                    category: nav.category || 'OTHER',
                    parentLabel: nav.label,
                });
            }
        }
    }

    return items;
}

function fuzzyMatch(text: string, query: string): boolean {
    return text.toLowerCase().includes(query.toLowerCase());
}

export function useGlobalSearch() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const navigate = useNavigate();
    const { user } = useAuth();

    const allItems = useMemo(
        () => buildSearchableItems(user?.role as UserRole | undefined),
        [user?.role]
    );

    const results = useMemo(() => {
        if (!query.trim()) return allItems;

        return allItems.filter(
            (item) =>
                fuzzyMatch(item.label, query) ||
                fuzzyMatch(item.description || '', query) ||
                fuzzyMatch(item.parentLabel || '', query) ||
                fuzzyMatch(item.category, query)
        );
    }, [query, allItems]);

    // Group results by category for display
    const groupedResults = useMemo(() => {
        const groups: Record<string, SearchResult[]> = {};
        for (const item of results) {
            if (!groups[item.category]) groups[item.category] = [];
            groups[item.category].push(item);
        }
        return groups;
    }, [results]);

    // Flat list for arrow key navigation (same order as grouped render)
    const flatResults = useMemo(() => {
        const flat: SearchResult[] = [];
        const order = ['OVERVIEW', 'MANAGEMENT', 'SYSTEM', 'OTHER'];
        for (const cat of order) {
            if (groupedResults[cat]) flat.push(...groupedResults[cat]);
        }
        return flat;
    }, [groupedResults]);

    const open = useCallback(() => {
        setIsOpen(true);
        setQuery('');
        setActiveIndex(0);
    }, []);

    const close = useCallback(() => {
        setIsOpen(false);
        setQuery('');
        setActiveIndex(0);
    }, []);

    const selectItem = useCallback(
        (item: SearchResult) => {
            navigate(item.path);
            close();
        },
        [navigate, close]
    );

    const onKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveIndex((prev) => (prev + 1) % (flatResults.length || 1));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveIndex((prev) =>
                    prev <= 0 ? (flatResults.length || 1) - 1 : prev - 1
                );
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (flatResults[activeIndex]) {
                    selectItem(flatResults[activeIndex]);
                }
            } else if (e.key === 'Escape') {
                e.preventDefault();
                close();
            }
        },
        [flatResults, activeIndex, selectItem, close]
    );

    // Reset active index when query changes
    useEffect(() => {
        setActiveIndex(0);
    }, [query]);

    // Global Ctrl+K / ⌘+K shortcut
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                if (isOpen) {
                    close();
                } else {
                    open();
                }
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [isOpen, open, close]);

    return {
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
    };
}
