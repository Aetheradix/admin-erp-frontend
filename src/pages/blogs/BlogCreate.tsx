import { PageHeader } from '@/components/ui/composed/PageHeader';
import { BlogForm } from './components/BlogForm';
import { useBlogs } from './hooks/useBlogs';

const BlogCreate = () => {
  const { handleSave, isLoading } = useBlogs();

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-16">
      <PageHeader
        title="Create New Story"
        description="Craft, design, and broadcast high-impact editorial content across the enterprise."
        breadcrumbs={[{ label: 'Blogs', url: '/social/blogs' }, { label: 'Create' }]}
        back
      />

      <BlogForm onSubmit={handleSave} isLoading={isLoading} />
    </div>
  );
};

export default BlogCreate;
