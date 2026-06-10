import { Carousel, Modal } from 'antd';
import { useState } from 'react';
import type { GalleryItem } from '../hooks/mockGallery';
import { GalleryCard } from './GalleryCard';

interface GalleryGridProps {
  items: GalleryItem[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const GalleryGrid = ({ items, onEdit, onDelete }: GalleryGridProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const onView = (id: string) => {
    const index = items.findIndex(item => item.id === id);
    setActiveIndex(index >= 0 ? index : 0);
    setIsOpen(true);
  };

  return (
    <div className="w-full">
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 px-1">
        {items.map((item) => (
          <GalleryCard
            key={item.id}
            item={item}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      <Modal
        open={isOpen}
        onCancel={() => setIsOpen(false)}
        footer={null}
        width="90vw"
        centered
        className="gallery-lightbox"
        classNames={{
          mask: 'backdrop-blur-2xl !bg-black/95',
          body: '!bg-transparent !shadow-none',
        }}
        styles={{
          body: { background: 'transparent', boxShadow: 'none' },
        }}
        closeIcon={null}
      >
        <div className="relative">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute -top-16 right-0 w-12 h-12 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all flex items-center justify-center border border-white/10 backdrop-blur-md z-100"
            aria-label="Close Lightbox"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>

          <Carousel
            dots={false}
            initialSlide={activeIndex}
            afterChange={setActiveIndex}
          >
            {items.map((item) => (
              <div key={item.id} className="flex flex-col items-center relative gap-6">
                <img
                  src={item.image_url}
                  alt={item.title}
                  width={1200}
                  height={800}
                  style={{ width: '100%', display: 'block', maxHeight: '75vh', objectFit: 'contain' }}
                  className="rounded-3xl shadow-2xl"
                />
                <div className="text-center group">
                  <h4 className="text-white font-black text-3xl tracking-tight mb-2 group-hover:text-primary transition-colors">{item.title}</h4>
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-primary font-black uppercase tracking-[0.2em] text-[10px]">{item.category}</span>
                    <span className="w-1 h-1 rounded-full bg-white/20"></span>
                    <span className="text-white/40 font-medium uppercase tracking-widest text-[10px]">{item.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </Carousel>
        </div>
      </Modal>
    </div>
  );
};
