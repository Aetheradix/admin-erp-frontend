import { useParams } from 'react-router-dom';
import { PageHeader } from '@/components/ui/composed/PageHeader';
import { BlogForm } from './components/BlogForm';
import { useBlogs } from './hooks/useBlogs';
import { ProgressSpinner } from '@/components/ui/composed/ProgressSpinner';

const BlogEdit = () => {
  const { id } = useParams();
  const { blog, isLoading, isError, handleSave } = useBlogs(id);

  if (isLoading && !blog) {
    return (
      <div className="flex justify-center items-center h-64">
        <ProgressSpinner />
      </div>
    );
  }

  if (isError || !blog) {
    return (
      <div className="flex justify-center items-center h-64 text-red-500">
        Blog not found or error fetching data.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader 
        title="Edit Post" 
        description={`Refining: ${blog.title}`}
        breadcrumbs={[
          { label: 'Blogs', url: '/blogs' },
          { label: 'Edit' },
        ]}
      />

      <BlogForm initialData={blog} onSubmit={handleSave} isLoading={isLoading} />
    </div>
  );
};

export default BlogEdit;
