import { Edit2, Maximize2, Trash2 } from 'lucide-react';
import type { GalleryItem } from '../hooks/mockGallery';
import { motion } from 'framer-motion';

interface GalleryCardProps {
  item: GalleryItem;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const GalleryCard = ({ item, onView, onEdit, onDelete }: GalleryCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="group relative break-inside-avoid mb-8 rounded-[2rem] overflow-hidden border border-white/20 shadow-soft hover:shadow-2xl transition-all duration-500 bg-white"
    >
      {/* Image with Zoom */}
      <div className="relative overflow-hidden aspect-auto">
        <img
          src={item.image_url || ''}
          alt={item.title}
          width={400}
          height={500}
          className="w-full h-auto object-cover transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-1"
        />

        {/* Subtle Gradient Overlay (Always visible) */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent opacity-60 group-hover:opacity-0 transition-opacity duration-500" />
      </div>

      {/* Glass Overlay (Hover Only) */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-between p-8">
        {/* Top Actions */}
        <div className="flex justify-end gap-3 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">
          <button
            className="w-11 h-11 rounded-2xl bg-white/10 text-white hover:bg-white hover:text-primary border border-white/10 backdrop-blur-xl transition-all flex items-center justify-center group/view active:scale-95"
            onClick={() => onView(String(item.id))}
            aria-label={`View ${item.title} in full screen`}
          >
            <Maximize2 size={18} className="group-hover/view:scale-110 transition-transform" />
          </button>
        </div>

        {/* Bottom Info & Main Actions */}
        <div className="translate-y-6 group-hover:translate-y-0 transition-transform duration-500 delay-150">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/90">
                {item.category}
              </span>
            </div>
            <h4 className="text-white font-black text-2xl leading-[1.2] tracking-tight line-clamp-2">
              {item.title}
            </h4>
            <div className="flex items-center gap-3 mt-3">
              <span className="text-[10px] text-white/40 font-black uppercase tracking-widest leading-none">
                {item.date}
              </span>
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t border-white/10">
            <button
              className="flex-1 h-12 rounded-2xl bg-white text-primary hover:bg-primary-hover hover:text-white font-black text-[10px] uppercase tracking-widest gap-2 flex items-center justify-center transition-all active:scale-95 shadow-lg"
              onClick={() => onEdit(String(item.id))}
              aria-label={`Edit details for ${item.title}`}
            >
              <Edit2 size={14} />
              Customize
            </button>
            <button
              className="w-12 h-12 rounded-2xl bg-white/10 text-white hover:bg-red-500 hover:text-white border border-white/10 backdrop-blur-xl transition-all flex items-center justify-center active:scale-95"
              onClick={() => onDelete(String(item.id))}
              aria-label={`Delete ${item.title} from gallery`}
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
