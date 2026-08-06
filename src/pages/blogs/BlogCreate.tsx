import { PageHeader } from '@/components/ui/composed/PageHeader';
import { BlogForm } from './components/BlogForm';
import { useBlogs } from './hooks/useBlogs';

const BlogCreate = () => {
  const { handleSave, isLoading } = useBlogs();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Create New Post"
        description="Share your insights with the world."
        breadcrumbs={[{ label: 'Blogs', url: '/blogs' }, { label: 'Create' }]}
      />

      <BlogForm onSubmit={handleSave} isLoading={isLoading} />
    </div>
  );
};

export default BlogCreate;
