import { message } from 'antd';
import { useState } from 'react';
import { useUploadGalleryItemMutation, useDeleteGalleryItemMutation } from '@/store/api/gallerySlice';

export const useGalleryActions = () => {
  const [uploadItem] = useUploadGalleryItemMutation();
  const [deleteItem] = useDeleteGalleryItemMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<any>(null);

  const handleDelete = async (id: string) => {
    try {
      await deleteItem(id).unwrap();
      message.success('Image deleted successfully');
    } catch (error) {
      message.error('Failed to delete image');
    }
  };

  const handleEdit = (img: any) => {
    setEditingImage(img);
    setIsModalOpen(true);
  };

  const handleUploadSubmit = async (values: any) => {
    try {
      if (editingImage) {
        message.info('System Update: Metadata modification initialized.');
      } else {
        const payload = {
          title: values.title,
          album: values.album,
          url: `https://picsum.photos/400/300?random=${Math.random()}`,
        };
        await uploadItem(payload).unwrap();
        message.success('Resource Node Created Successfully');
      }
      setIsModalOpen(false);
    } catch (error) {
      message.error('Critical Error: Failed to synchronize media.');
    }
  };

  return {
    isModalOpen,
    setIsModalOpen,
    editingImage,
    setEditingImage,
    handleDelete,
    handleEdit,
    handleUploadSubmit
  };
};
