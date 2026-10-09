import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/composed/PageHeader';
import { BlogForm } from './components/BlogForm';
import { useBlogs } from './hooks/useBlogs';
import { ProgressSpinner } from '@/components/ui/composed/ProgressSpinner';
import { Button } from '@/components/ui/primitives/Button';
import { ArrowLeft, AlertCircle } from 'lucide-react';

const BlogEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { blog, isLoading, isError, handleSave } = useBlogs(id);

  if (isLoading && !blog) {
    return (
      <div className="flex flex-col justify-center items-center h-80 gap-4">
        <ProgressSpinner />
        <span className="text-xs font-bold text-muted uppercase tracking-widest animate-pulse">
          Retrieving Story Narrative...
        </span>
      </div>
    );
  }

  if (isError && !blog) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-[2.5rem] bg-error/5 border border-error/15 my-8 max-w-xl mx-auto">
        <div className="w-16 h-16 rounded-3xl bg-error/10 text-error flex items-center justify-center mb-4">
          <AlertCircle size={32} />
        </div>
        <h3 className="text-lg font-black text-foreground mb-2">Story Not Found</h3>
        <p className="text-xs text-muted font-medium mb-6">
          The requested blog narrative could not be retrieved or has been removed.
        </p>
        <Button
          variant="secondary"
          onClick={() => navigate('/social/blogs')}
          className="rounded-2xl px-6 h-11 text-xs font-bold gap-2">
          <ArrowLeft size={16} />
          Back to Stories
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-16">
      <PageHeader
        title="Refine Narrative"
        description={`Polishing: "${blog?.title || 'Story'}"`}
        breadcrumbs={[{ label: 'Blogs', url: '/social/blogs' }, { label: 'Edit' }]}
        back
      />

      {blog && (
        <BlogForm
          key={String(blog.id || id)}
          initialData={blog}
          onSubmit={handleSave}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default BlogEdit;
