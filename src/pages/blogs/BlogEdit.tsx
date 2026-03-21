import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/ui/composed/PageHeader';
import { BlogForm } from './components/BlogForm';
import { mockBlogs, type Blog } from './hooks/mockBlogs';

const BlogEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const blog = mockBlogs.find(b => b.id === id);

  const handleSave = (data: Partial<Blog>) => {
    console.log('Updating blog:', data);
    setTimeout(() => {
      navigate('/blogs');
    }, 1000);
  };

  if (!blog) {
    return <div>Blog not found</div>;
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

      <BlogForm initialData={blog} onSubmit={handleSave} />
    </div>
  );
};

export default BlogEdit;
