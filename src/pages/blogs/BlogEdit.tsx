import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/ui/composed/PageHeader';
import { BlogForm } from './components/BlogForm';
import { useGetBlogQuery, useUpdateBlogMutation } from '@/store/api/blogSlice';
import { ProgressSpinner } from 'primereact/progressspinner';

const BlogEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const { data: blog, isLoading: isFetching, isError } = useGetBlogQuery(id as string, { skip: !id });
  const [updateBlog, { isLoading: isUpdating }] = useUpdateBlogMutation();

  const handleSave = async (data: any) => {
    try {
      await updateBlog({ ...data, id }).unwrap();
      navigate('/blogs');
    } catch (error) {
      console.error('Failed to update blog:', error);
    }
  };

  if (isFetching) {
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

      <BlogForm initialData={blog} onSubmit={handleSave} isLoading={isUpdating} />
    </div>
  );
};

export default BlogEdit;
