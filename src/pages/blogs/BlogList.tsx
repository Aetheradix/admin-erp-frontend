import { useNavigate } from 'react-router-dom';
import { Column } from 'primereact/column';
import { DataTable } from '@/components/ui/composed/DataTable';
import { PageHeader } from '@/components/ui/composed/PageHeader';

import { mockBlogs } from './hooks/mockBlogs';
import type { Blog } from './hooks/mockBlogs';
import { useBlogFilters } from './hooks/useBlogFilters';
import { BlogTableToolbar } from './components/BlogTableToolbar';
import { BLOG_COLUMNS } from './components/Blogcolumnconfig';



const GLOBAL_FILTER_FIELDS = ['title', 'category', 'author.name'];


const BlogList = () => {
  const navigate = useNavigate();
  const { 
    searchValue, 
    activeCategory, 
    filters, 
    handleSearchChange, 
    handleCategoryChange 
  } = useBlogFilters();

  const handleDelete = (id: string) => {
    // TODO: wire to useDeleteBlog() mutation
    console.log('delete', id);
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      <PageHeader
        title="Content Management"
        description="Craft, curate, and command your digital narratives with a premium workspace."
        primaryAction={{
          label: 'Craft New Story',
          onClick: () => navigate('/blogs/create'),
          icon: 'pi pi-plus',
          className: 'px-8! py-3.5! rounded-xl! font-black! tracking-wide! shadow-lg! shadow-primary/20!',
        }}
      />

      <div className="bg-white rounded-[40px] p-2 border border-border-subtle shadow-soft overflow-hidden">
        <BlogTableToolbar
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />

        <DataTable
          value={mockBlogs}
          filters={filters}
          globalFilterFields={GLOBAL_FILTER_FIELDS}
          paginator
          rows={5}
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
              body={(row: Blog) => col.body(row, { onDelete: handleDelete })}
            />
          ))}
        </DataTable>
      </div>
    </div>
  );
};

export default BlogList;