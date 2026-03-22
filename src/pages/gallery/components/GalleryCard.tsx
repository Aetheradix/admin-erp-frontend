import { Button } from '@/components/ui/primitives/Button';
import { Edit2, Maximize2, Trash2 } from 'lucide-react';
import type { GalleryItem } from '../hooks/mockGallery';

interface GalleryCardProps {
  item: GalleryItem;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const GalleryCard = ({ item, onView, onEdit, onDelete }: GalleryCardProps) => {
  return (
    <div className="group relative break-inside-avoid mb-6 rounded-3xl overflow-hidden border border-border-subtle shadow-sm hover:shadow-xl transition-all duration-500">
      {/* Image */}
      <img
        src={item.url}
        alt={item.title}
        className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
      />

      {/* Glass Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-between p-6">
        {/* Top Actions */}
        <div className="flex justify-end gap-2 translate-y-[-20px] group-hover:translate-y-0 transition-transform duration-500 delay-100">
           <Button 
            variant="ghost" 
            className="w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 border-none backdrop-blur-md" 
            onClick={() => onView(item.id)}
          >
            <Maximize2 size={18} />
          </Button>
        </div>

        {/* Bottom Info & Main Actions */}
        <div className="translate-y-[20px] group-hover:translate-y-0 transition-transform duration-500 delay-150">
          <div className="mb-4">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70 mb-1 block">
              {item.category}
            </span>
            <h4 className="text-white font-black text-lg leading-tight tracking-tight line-clamp-2">
              {item.title}
            </h4>
            <span className="text-[10px] text-white/50 font-medium mt-1 block tracking-wider uppercase">
              {item.date}
            </span>
          </div>

          <div className="flex gap-2 pt-4 border-t border-white/10">
            <Button 
              variant="ghost" 
              className="flex-1 h-11 rounded-xl bg-white/10 text-white hover:bg-white/20 border-none backdrop-blur-md font-bold text-xs gap-2"
              onClick={() => onEdit(item.id)}
            >
              <Edit2 size={14} />
              Edit
            </Button>
            <Button 
              variant="ghost" 
              className="w-11 h-11 rounded-xl bg-white/10 text-white hover:bg-red-500/30 border-none backdrop-blur-md"
              onClick={() => onDelete(item.id)}
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
