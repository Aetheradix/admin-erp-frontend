import { message } from 'antd';
import { useState } from 'react';
import { useCreateBlogMutation, useDeleteBlogMutation, useUpdateBlogMutation } from '@/store/api/blogSlice';

export const useBlogActions = () => {
  const [deleteBlog] = useDeleteBlogMutation();
  const [createBlog] = useCreateBlogMutation();
  const [updateBlog] = useUpdateBlogMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<any>(null);

  const handleEdit = (record: any) => {
    setEditingBlog(record);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingBlog(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteBlog(id).unwrap();
      message.success('Blog deleted successfully');
    } catch (error) {
      message.error('Failed to delete blog');
    }
  };

  const handleModalSubmit = async (values: any) => {
    try {
      const payload = {
        ...values,
        status: values.isPublished ? 'Published' : 'Draft',
        author: 'Current User', // Mocked
        date: new Date().toISOString().split('T')[0],
      };

      if (editingBlog) {
        await updateBlog({ ...editingBlog, ...payload }).unwrap();
        message.success('Blog updated successfully');
      } else {
        await createBlog(payload).unwrap();
        message.success('Blog created successfully');
      }
      setIsModalOpen(false);
    } catch (error) {
      message.error('Failed to save blog');
    }
  };

  return {
    isModalOpen,
    setIsModalOpen,
    editingBlog,
    handleEdit,
    handleCreate,
    handleDelete,
    handleModalSubmit
  };
};
