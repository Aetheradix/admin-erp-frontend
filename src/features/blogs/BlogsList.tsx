import React from 'react';
import { useGetBlogsQuery } from '@/store/api/blogSlice';
import DataTable from '@/components/common/DataTable';
import PageHeader from '@/components/common/PageHeader';
import PrimaryButton from '@/components/common/PrimaryButton';
import BlogForm from './BlogForm';
import { useBlogActions } from '@/features/blogs/hooks/useBlogActions';
import { useBlogColumns } from '@/features/blogs/hooks/useBlogColumns';
import { Plus } from 'lucide-react';

const BlogsList: React.FC = () => {
  const { data: blogs = [], isLoading, isError } = useGetBlogsQuery();
  const {
    isModalOpen,
    setIsModalOpen,
    editingBlog,
    handleEdit,
    handleCreate,
    handleDelete,
    handleModalSubmit
  } = useBlogActions();

  const columns = useBlogColumns(handleEdit, handleDelete);

  if (isError) return <div className="p-8 text-center text-rose-400 font-bold uppercase tracking-widest">System Signal Interrupted: Resource Retrieval Failed.</div>;

  return (
    <div className="h-full flex flex-col pb-12">
      <PageHeader
        title="Content Protocol"
        subtitle="Initialize and manage corporate data streams"
        actions={
          <PrimaryButton onClick={handleCreate} className="w-fit! px-8! py-4! shadow-xl shadow-cyan-500/20">
            <Plus size={20} className="mr-2" /> NEW ENTRY
          </PrimaryButton>
        }
      />


      <DataTable
        columns={columns}
        dataSource={blogs}
        rowKey={(record) => record.id}
        loading={isLoading}
      />


      <BlogForm
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialValues={editingBlog}
      />
    </div>
  );
};

export default BlogsList;
