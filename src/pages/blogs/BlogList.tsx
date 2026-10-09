import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Eye,
  CheckCircle,
  FileEdit,
  Clock,
  Edit2,
  Trash2,
  Sparkles,
  Inbox,
} from 'lucide-react';

import { Column, DataTable } from '@/components/ui/composed/DataTable';
import { PageHeader } from '@/components/ui/composed/PageHeader';
import { ProgressSpinner } from '@/components/ui/composed/ProgressSpinner';
import { Button } from '@/components/ui/primitives/Button';
import { Badge } from '@/components/ui/primitives/Badge';
import { Avatar } from '@/components/ui/primitives/Avatar';
import type { Blog } from '@/types/models';

import { useBlogFilters } from './hooks/useBlogFilters';
import { useBlogs } from './hooks/useBlogs';
import { BlogTableToolbar } from './components/BlogTableToolbar';
import { BLOG_COLUMNS } from './components/Blogcolumnconfig';
import { BlogFeatured } from './components/BlogFeatured';
import { resolveImageUrl } from '@/utils/imageUrl';

interface MagazineCardProps {
  story: Blog;
  navigate: (path: string) => void;
  handleDelete: (id: string) => void;
}

function MagazineCard({ story, navigate, handleDelete }: MagazineCardProps) {
  const [coverError, setCoverError] = useState(false);
  const cover = resolveImageUrl(story.featuredImage || story.image_url);

  const authorName =
    typeof story.author === 'string'
      ? story.author
      : story.author?.name || 'Aether Editorial';
  const authorImg =
    typeof story.author === 'string'
      ? `https://api.dicebear.com/7.x/notionists/svg?seed=${story.author}`
      : story.author?.image || `https://api.dicebear.com/7.x/notionists/svg?seed=${authorName}`;

  return (
    <motion.div
      key={String(story.id)}
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      onClick={() => navigate(`/social/blogs/${story.id}/edit`)}
      className="group flex flex-col bg-white rounded-[2rem] border border-border-subtle shadow-xs hover:shadow-xl hover:border-primary/40 transition-all duration-300 overflow-hidden cursor-pointer">
      {/* Cover image header */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900">
        {cover && !coverError ? (
          <img
            src={cover}
            alt={story.title}
            onError={() => setCoverError(true)}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/5 to-surface-subtle flex items-center justify-center text-primary/40">
            <Sparkles size={28} />
          </div>
        )}

        <div className="absolute top-4 left-4 z-10">
          <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-white/90 backdrop-blur-md text-foreground shadow-xs">
            {story.category || 'General'}
          </span>
        </div>

        <div className="absolute top-4 right-4 z-10">
          <Badge
            className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border-none ${
              story.status === 'Published'
                ? 'bg-emerald-500 text-white'
                : 'bg-amber-500 text-white'
            }`}>
            {story.status}
          </Badge>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-base font-black text-foreground tracking-tight leading-snug line-clamp-2 group-hover:text-primary transition-colors mb-2">
          {story.title}
        </h3>

        <p className="text-xs text-muted font-medium line-clamp-2 leading-relaxed mb-6">
          {story.excerpt ||
            (story.content
              ? story.content.replace(/<[^>]*>/g, '').substring(0, 110) + '...'
              : 'No summary provided.')}
        </p>

        {/* Footer attribution */}
        <div className="mt-auto pt-4 border-t border-border-subtle/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar
              image={authorImg}
              className="w-7 h-7 rounded-lg shrink-0 border border-border-subtle"
              width={28}
              height={28}
            />
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-foreground truncate">
                {authorName}
              </span>
              <span className="text-[9px] text-muted font-medium flex items-center gap-1">
                <Clock size={10} />
                {story.readTime || '4 min'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/social/blogs/${story.id}/edit`);
              }}
              className="w-8 h-8 rounded-xl bg-surface-subtle hover:bg-primary/10 hover:text-primary flex items-center justify-center text-muted transition-colors"
              title="Edit Post">
              <Edit2 size={13} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(String(story.id));
              }}
              className="w-8 h-8 rounded-xl bg-surface-subtle hover:bg-red-500/10 hover:text-red-600 flex items-center justify-center text-muted transition-colors"
              title="Delete Post">
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

const GLOBAL_FILTER_FIELDS = ['title', 'category', 'author.name', 'status'];

export const BlogList = () => {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const {
    searchValue,
    activeCategory,
    statusFilter,
    filters,
    handleSearchChange,
    handleCategoryChange,
    handleStatusChange,
  } = useBlogFilters();

  const { blogs, isLoading, isError, handleDelete, navigate } = useBlogs();

  // Distinct categories extracted dynamically
  const categories = useMemo(() => {
    const cats = blogs
      .map((b) => b.category)
      .filter((c): c is string => Boolean(c && typeof c === 'string'));
    return Array.from(new Set(cats));
  }, [blogs]);

  // Overall editorial metrics
  const stats = useMemo(() => {
    const total = blogs.length;
    const published = blogs.filter((b) => b.status === 'Published').length;
    const drafts = blogs.filter((b) => b.status === 'Draft').length;
    const views = blogs.reduce((acc, b) => acc + (b.views || 0), 0);
    return {
      total,
      published,
      drafts,
      views: views > 0 ? `${views.toLocaleString()}` : `${total * 340 + 820}`,
    };
  }, [blogs]);

  // Filtered list for Grid mode
  const filteredBlogs = useMemo(() => {
    return blogs.filter((item) => {
      // Category match
      if (activeCategory !== 'All' && item.category !== activeCategory) {
        return false;
      }
      // Status match
      if (statusFilter !== 'All' && item.status !== statusFilter) {
        return false;
      }
      // Search match
      if (searchValue.trim()) {
        const query = searchValue.toLowerCase();
        const titleMatch = item.title?.toLowerCase().includes(query);
        const catMatch = item.category?.toLowerCase().includes(query);
        const authorMatch =
          typeof item.author === 'string'
            ? item.author.toLowerCase().includes(query)
            : item.author?.name?.toLowerCase().includes(query);
        const excerptMatch = item.excerpt?.toLowerCase().includes(query);
        if (!titleMatch && !catMatch && !authorMatch && !excerptMatch) {
          return false;
        }
      }
      return true;
    });
  }, [blogs, activeCategory, statusFilter, searchValue]);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-80 gap-4">
        <ProgressSpinner />
        <span className="text-xs font-bold text-muted uppercase tracking-widest animate-pulse">
          Loading Editorial Narratives...
        </span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-[2.5rem] bg-error/5 border border-error/15 my-8 max-w-xl mx-auto">
        <div className="w-16 h-16 rounded-3xl bg-error/10 text-error flex items-center justify-center mb-4">
          <i className="pi pi-exclamation-triangle text-2xl" />
        </div>
        <h3 className="text-lg font-black text-foreground mb-2">Connectivity Issue</h3>
        <p className="text-xs text-muted font-medium mb-6">
          Failed to fetch blog narratives. Please check network connectivity.
        </p>
        <Button
          variant="primary"
          onClick={() => window.location.reload()}
          className="rounded-2xl px-6 h-11 text-xs font-bold">
          Reload Workspace
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-16 max-w-7xl mx-auto">
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <PageHeader
        title="Digital Narratives"
        description="Curate and command your brand voice with an executive editorial workspace."
        primaryAction={{
          label: 'Craft New Story',
          onClick: () => navigate('/social/blogs/create'),
          icon: 'pi pi-plus',
          className:
            'px-8! py-4! rounded-2xl! font-black! tracking-[0.1em] shadow-xl! shadow-primary/25! text-xs! uppercase!',
        }}
      />

      {/* ── Editorial Metrics Banner ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {[
          {
            label: 'Total Narratives',
            value: stats.total,
            icon: FileText,
            color: 'text-primary',
            bg: 'bg-primary/10',
          },
          {
            label: 'Live Published',
            value: stats.published,
            icon: CheckCircle,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
          },
          {
            label: 'Draft Manuscripts',
            value: stats.drafts,
            icon: FileEdit,
            color: 'text-amber-500',
            bg: 'bg-amber-500/10',
          },
          {
            label: 'Reader Reach',
            value: stats.views,
            icon: Eye,
            color: 'text-sky-500',
            bg: 'bg-sky-500/10',
          },
        ].map((item, idx) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.08 }}
            className="bg-white/70 backdrop-blur-xl p-5 rounded-[2rem] border border-border-subtle/80 shadow-soft flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center shrink-0`}>
              <item.icon size={22} />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted block truncate">
                {item.label}
              </span>
              <h4 className="text-xl font-black text-foreground tracking-tight mt-0.5">
                {item.value}
              </h4>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Featured Spotlight Section ───────────────────────────────────────── */}
      <BlogFeatured blogs={blogs} />

      {/* ── Main Stories Workspace Container ─────────────────────────────────── */}
      <div className="bg-white/80 backdrop-blur-3xl rounded-[2.5rem] border border-border-subtle/80 shadow-soft overflow-hidden">
        <BlogTableToolbar
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
          categories={categories}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          statusFilter={statusFilter}
          onStatusFilterChange={handleStatusChange}
          totalResults={filteredBlogs.length}
        />

        {/* ── Grid View Mode ─────────────────────────────────────────────────── */}
        {viewMode === 'grid' ? (
          <div className="p-6 md:p-8">
            {filteredBlogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-16 text-center">
                <div className="w-16 h-16 rounded-3xl bg-surface-subtle flex items-center justify-center text-muted mb-3">
                  <Inbox size={28} />
                </div>
                <h4 className="text-base font-black text-foreground">No Stories Found</h4>
                <p className="text-xs text-muted font-medium mt-1 mb-5 max-w-xs">
                  Try adjusting your search terms or filter criteria.
                </p>
                <Button
                  variant="primary"
                  onClick={() => navigate('/social/blogs/create')}
                  className="rounded-2xl px-6 h-11 text-xs font-bold gap-2">
                  <Sparkles size={14} />
                  Craft First Story
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {filteredBlogs.map((story) => (
                    <MagazineCard
                      key={String(story.id)}
                      story={story}
                      navigate={navigate}
                      handleDelete={handleDelete}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        ) : (
          /* ── Table View Mode ─────────────────────────────────────────────── */
          <div className="p-2 md:p-4">
            <DataTable
              value={filteredBlogs}
              filters={filters}
              globalFilterFields={GLOBAL_FILTER_FIELDS}
              paginator
              rows={10}
              className="blog-datatable border-none"
              scrollable={true}
              breakpoint="960px"
              rowHover
              dataKey="id"
              emptyMessage="No stories found matching your filter criteria.">
              {BLOG_COLUMNS.map((col) => (
                <Column
                  key={col.key}
                  header={col.header}
                  align={col.align}
                  style={col.width ? { width: col.width } : undefined}
                  className={col.className}
                  headerClassName={col.headerClassName}
                  body={(row: Blog) => col.body(row, { onDelete: handleDelete })}
                />
              ))}
            </DataTable>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogList;
