import React from 'react';
import { Row, Col } from 'antd';
import { UploadCloud } from 'lucide-react';
import { useGetGalleryQuery } from '@/store/api/gallerySlice';
import PageHeader from '@/components/common/PageHeader';
import PrimaryButton from '@/components/common/PrimaryButton';
import GalleryUpload from './GalleryUpload';
import GalleryItem from './components/GalleryItem';
import { useGalleryActions } from '@/features/gallery/hooks/useGalleryActions';

const GalleryList: React.FC = () => {
  const { data: images = [], isLoading, isError } = useGetGalleryQuery();
  const { 
    isModalOpen, 
    setIsModalOpen, 
    editingImage, 
    setEditingImage,
    handleDelete, 
    handleEdit, 
    handleUploadSubmit 
  } = useGalleryActions();

  if (isError) return <div className="p-8 text-center text-rose-400 font-black uppercase tracking-tighter">ERROR: MEDIA DATA STREAM CORRUPTED.</div>;

  return (
    <div className="h-full flex flex-col pb-12">
      <PageHeader 
        title="Asset Library" 
        subtitle="Manage secure multimedia protocols and albums"
        actions={
          <PrimaryButton onClick={() => { setEditingImage(null); setIsModalOpen(true); }} className="w-fit! px-8! py-4!">
            <UploadCloud size={20} className="mr-2" /> UPLOAD CORE
          </PrimaryButton>
        }
      />

      <div className="">
        {isLoading ? (
          <div className="h-64 flex items-center justify-center text-cyan-400 font-bold tracking-widest uppercase animate-pulse">Synchronizing Local Grid...</div>
        ) : (
          <Row gutter={[24, 24]}>
            {images.map((img: any) => (
              <Col xs={24} sm={12} md={8} lg={6} xl={4} key={img.id || img.key}>
                <GalleryItem 
                  img={img} 
                  onEdit={handleEdit} 
                  onDelete={handleDelete} 
                />
              </Col>
            ))}
          </Row>
        )}
      </div>

      <GalleryUpload
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onSubmit={handleUploadSubmit}
        initialValues={editingImage}
      />
    </div>
  );
};

export default GalleryList;
