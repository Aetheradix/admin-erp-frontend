import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/composed/PageHeader';
import { BlogForm } from './components/BlogForm';
import { type Blog } from './hooks/mockBlogs';

const BlogCreate = () => {
  const navigate = useNavigate();

  const handleSave = (data: Partial<Blog>) => {
    console.log('Saving blog:', data);
    // Add fake delay to show loading
    setTimeout(() => {
      navigate('/blogs');
    }, 1000);
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader 
        title="Create New Post" 
        description="Share your insights with the world."
        breadcrumbs={[
          { label: 'Blogs', url: '/blogs' },
          { label: 'Create' },
        ]}
      />

      <BlogForm onSubmit={handleSave} />
    </div>
  );
};

export default BlogCreate;
