import { Carousel, Modal } from 'antd';
import { useState } from 'react';
import type { GalleryItem } from '../hooks/mockGallery';
import { GalleryCard } from './GalleryCard';
import { X, ChevronLeft, ChevronRight, Share2, Info } from 'lucide-react';

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
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-8 px-1">
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
        width="100vw"
        centered
        className="gallery-full-modal"
        classNames={{
          mask: 'backdrop-blur-3xl !bg-black/95',
          body: '!bg-transparent !p-0 !shadow-none',
        }}
        styles={{
          body: { background: 'transparent', padding: 0 },
        }}
        closeIcon={null}
      >
        <div className="relative h-screen flex flex-col justify-center items-center overflow-hidden">
          {/* Top Navbar */}
          <div className="absolute top-0 inset-x-0 p-8 flex justify-between items-center z-50">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <Info size={18} className="text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-white font-black text-lg tracking-tight leading-none">{items[activeIndex]?.title}</span>
                <span className="text-white/40 text-[10px] font-medium uppercase tracking-[0.2em] mt-1">{items[activeIndex]?.category}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="w-12 h-12 rounded-2xl bg-white/5 text-white hover:bg-white/10 flex items-center justify-center border border-white/10 transition-all backdrop-blur-md">
                <Share2 size={18} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-12 h-12 rounded-2xl bg-white text-primary hover:bg-primary-hover hover:text-white flex items-center justify-center transition-all shadow-xl active:scale-95"
                aria-label="Close Lightbox"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          <Carousel
            dots={false}
            initialSlide={activeIndex}
            afterChange={setActiveIndex}
            className="w-full"
            arrows={true}
            prevArrow={<div className="custom-arrow-left"><ChevronLeft size={32} /></div>}
            nextArrow={<div className="custom-arrow-right"><ChevronRight size={32} /></div>}
          >
            {items.map((item) => (
              <div key={item.id} className="h-screen flex flex-col items-center justify-center relative p-12 transition-all duration-700">
                <div className="relative group max-w-[85vw] max-h-[70vh]">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="rounded-[3rem] shadow-[0_0_80px_rgba(0,0,0,0.5)] object-contain w-full h-full border border-white/10"
                  />

                  {/* Unique Info Tag in Lightbox */}
                  <div className="absolute -bottom-6 -right-6 bg-white/10 backdrop-blur-3xl px-8 py-4 rounded-3xl border border-white/20 shadow-2xl flex items-center gap-4 group-hover:bg-white transition-all duration-500">
                    <div className="w-1.5 h-8 bg-primary rounded-full" />
                    <div className="flex flex-col">
                      <span className="text-white text-[10px] font-black uppercase tracking-widest group-hover:text-primary transition-colors">Metadata Verified</span>
                      <span className="text-white/40 text-[9px] font-medium uppercase tracking-tight group-hover:text-muted transition-colors">{item.id.toString().substring(0, 8)} • High Res</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Carousel>

          {/* Bottom Indicators */}
          <div className="absolute bottom-12 flex gap-3 z-50">
            {items.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-500 ${idx === activeIndex ? 'w-12 bg-primary' : 'w-2 bg-white/20 hover:bg-white/40 cursor-pointer'}`}
                onClick={() => setActiveIndex(idx)}
              />
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};
