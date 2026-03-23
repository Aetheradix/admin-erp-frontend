import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/composed/PageHeader';
import { BlogForm } from './components/BlogForm';
import { useCreateBlogMutation } from '@/store/api/blogSlice';

const BlogCreate = () => {
  const navigate = useNavigate();
  const [createBlog, { isLoading }] = useCreateBlogMutation();

  const handleSave = async (data: any) => {
    try {
      await createBlog(data).unwrap();
      navigate('/blogs');
    } catch (error) {
      console.error('Failed to create blog:', error);
    }
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

      <BlogForm onSubmit={handleSave} isLoading={isLoading} />
    </div>
  );
};

export default BlogCreate;
