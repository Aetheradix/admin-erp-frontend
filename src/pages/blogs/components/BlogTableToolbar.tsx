import { Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/primitives/Button';
import { Input } from '@/components/ui/primitives/Input';
import { Tabs } from '@/components/ui/primitives/Tabs';
import { mockBlogs } from '../hooks/mockBlogs';

interface BlogTableToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const CATEGORIES = [
  'All',
  ...new Set(mockBlogs.map((blog) => blog.category).filter(Boolean)),
] as string[];

export function BlogTableToolbar({
  searchValue,
  onSearchChange,
  activeCategory,
  onCategoryChange,
}: BlogTableToolbarProps) {
  return (
    <div className="flex flex-col p-6 gap-6 border-b border-border-subtle/50 mb-2">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors"
            size={18}
          />
          <Input
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search stories..."
            className="pl-12!"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            variant="secondary"
            className="flex-1 sm:flex-none h-12 px-6 rounded-2xl! gap-2 hover:bg-surface-elevated! border-border-subtle!"
            icon={<Filter size={18} />}
            label="Filters"
          />
        </div>
      </div>

      <div className="overflow-x-auto pb-2 scrollbar-none">
        <Tabs items={CATEGORIES} activeItem={activeCategory} onItemChange={onCategoryChange} />
      </div>
    </div>
  );
}
