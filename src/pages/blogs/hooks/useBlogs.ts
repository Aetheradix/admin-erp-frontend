import { useNavigate } from 'react-router-dom';
import { 
  useGetBlogsQuery, 
  useGetBlogQuery, 
  useCreateBlogMutation, 
  useUpdateBlogMutation, 
  useDeleteBlogMutation 
} from '@/store/api/blogSlice';

export const useBlogs = (id?: string) => {
  const navigate = useNavigate();

  // Queries
  const { data: blogs = [], isLoading: isFetchingList, isError: isListError } = useGetBlogsQuery();
  const { data: blog, isLoading: isFetchingSingle, isError: isSingleError } = useGetBlogQuery(id as string, { skip: !id });

  // Mutations
  const [createBlog, { isLoading: isCreating }] = useCreateBlogMutation();
  const [updateBlog, { isLoading: isUpdating }] = useUpdateBlogMutation();
  const [deleteBlog] = useDeleteBlogMutation();

  const handleSave = async (data: any) => {
    try {
      if (id) {
        await updateBlog({ ...data, id }).unwrap();
      } else {
        await createBlog(data).unwrap();
      }
      navigate('/blogs');
    } catch (error) {
      console.error('Failed to save blog:', error);
    }
  };

  const handleDelete = async (blogId: string) => {
    if (window.confirm('Are you sure you want to delete this story?')) {
      try {
        await deleteBlog(blogId).unwrap();
      } catch (error) {
        console.error('Failed to delete blog:', error);
      }
    }
  };

  return {
    blogs,
    blog,
    isLoading: isFetchingList || isFetchingSingle || isCreating || isUpdating,
    isError: isListError || isSingleError,
    handleSave,
    handleDelete,
    navigate
  };
};
