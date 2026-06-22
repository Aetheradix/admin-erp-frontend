import { useNavigate } from 'react-router-dom';
import { showToast } from '@/components/ui/composed/Toast.utils';
import { showConfirm } from '@/components/ui/composed/ConfirmDialog.utils';
import {
  useGetBlogsQuery,
  useGetBlogQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation
} from '@/store/api/blogSlice';
import type { Blog } from '@/types/models';

export const useBlogs = (id?: string) => {
  const navigate = useNavigate();

  // Queries
  const { data: blogs = [], isLoading: isFetchingList, isError: isListError } = useGetBlogsQuery();
  const { data: blog, isLoading: isFetchingSingle, isError: isSingleError } = useGetBlogQuery(id as string, { skip: !id });

  // Mutations
  const [createBlog, { isLoading: isCreating }] = useCreateBlogMutation();
  const [updateBlog, { isLoading: isUpdating }] = useUpdateBlogMutation();
  const [deleteBlog] = useDeleteBlogMutation();

  const handleSave = async (data: Partial<Blog>) => {
    try {
      if (id) {
        await updateBlog({ ...data, id }).unwrap();
      } else {
        await createBlog(data).unwrap();
      }
      showToast({ severity: 'success', summary: 'Success', detail: `Post ${id ? 'updated' : 'created'} successfully!`, life: 3000 });
      navigate('/blogs');
    } catch (error: unknown) {
      const apiError = error as { data?: { message?: string } };
      console.error('Failed to save blog:', error);
      showToast({ severity: 'error', summary: 'Error', detail: apiError.data?.message || 'Failed to save post', life: 3000 });
    }
  };

  const handleDelete = async (blogId: string) => {
    showConfirm({
      message: 'Are you sure you want to delete this story?',
      header: 'Confirm Deletion',
      accept: async () => {
        try {
          await deleteBlog(blogId).unwrap();
          showToast({ severity: 'success', summary: 'Success', detail: 'Post deleted successfully!', life: 3000 });
        } catch (error: unknown) {
          const apiError = error as { data?: { message?: string } };
          console.error('Failed to delete blog:', error);
          showToast({ severity: 'error', summary: 'Error', detail: apiError.data?.message || 'Failed to delete post', life: 3000 });
        }
      }
    });
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
