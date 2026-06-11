import { Column, DataTable } from '@/components/ui/composed/DataTable';
import { PageHeader } from '@/components/ui/composed/PageHeader';
import { ProgressSpinner } from '@/components/ui/composed/ProgressSpinner';

import { useBlogFilters } from './hooks/useBlogFilters';
import { useBlogs } from './hooks/useBlogs';
import { BlogTableToolbar } from './components/BlogTableToolbar';
import { BLOG_COLUMNS } from './components/Blogcolumnconfig';
import { BlogFeatured } from './components/BlogFeatured';

const GLOBAL_FILTER_FIELDS = ['title', 'category', 'author.name'];

const BlogList = () => {
  const {
    searchValue,
    activeCategory,
    filters,
    handleSearchChange,
    handleCategoryChange
  } = useBlogFilters();

  const { blogs, isLoading, isError, handleDelete, navigate } = useBlogs();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <ProgressSpinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center h-64 text-red-500 font-bold bg-error/5 rounded-3xl border border-error/10">
        Error loading blogs. Please verify backend connectivity.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-12">
      <PageHeader
        title="Digital Narratives"
        description="Curate and command your brand's voice with a premium, high-velocity workspace."
        primaryAction={{
          label: 'Craft New Story',
          onClick: () => navigate('/blogs/create'),
          icon: 'pi pi-plus',
          className: 'px-8! py-4! rounded-2xl! font-black! tracking-[0.1em] shadow-xl! shadow-primary/25! text-xs!',
        }}
      />

      <BlogFeatured blogs={blogs} />

      <div className="bg-white/60 backdrop-blur-3xl rounded-[3rem] p-4 border border-white shadow-soft overflow-hidden">
        <BlogTableToolbar
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />

        <DataTable
          value={blogs}
          filters={filters}
          globalFilterFields={GLOBAL_FILTER_FIELDS}
          paginator
          rows={10}
          className="blog-datatable border-none"
          scrollable={true}
          breakpoint="960px"
          rowHover
          dataKey="id"
        >
          {BLOG_COLUMNS.map((col) => (
            <Column
              key={col.key}
              header={col.header}
              align={col.align}
              style={col.width ? { width: col.width } : undefined}
              className={col.className}
              headerClassName={col.headerClassName}
              body={(row: any) => col.body(row, { onDelete: handleDelete })}
            />
          ))}
        </DataTable>
      </div>
    </div>
  );
};

export default BlogList;
