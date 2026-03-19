import React from 'react';
import { Image, Popconfirm } from 'antd';
import { Edit2, Trash2 } from 'lucide-react';
import IconButton from '@/components/ui/IconButton';
import Badge from '@/components/ui/Badge';

interface GalleryItemProps {
  img: any;
  onEdit: (img: any) => void;
  onDelete: (id: string) => void;
}

const GalleryItem: React.FC<GalleryItemProps> = ({ img, onEdit, onDelete }) => {
  return (
    <div className="group relative bg-[#0f172a] rounded-3xl overflow-hidden border border-white/5 shadow-lg hover:border-cyan-500/30 transition-all duration-300">
      <div className="aspect-4/3 relative overflow-hidden">
        <Image 
          src={img.image_url} 
          alt={img.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          preview={{ mask: <div className="text-white/80 backdrop-blur-sm bg-black/40 w-full h-full flex items-center justify-center">View Asset</div> }}
        />
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <IconButton 
            icon={Edit2} 
            onClick={() => onEdit(img)} 
            size={14} 
            className="w-8! h-8! bg-black/60! backdrop-blur-md border-none!" 
          />
          <Popconfirm
            title="Evict resource node?"
            onConfirm={() => onDelete(img.id || img.key)}
            okText="Yes"
            cancelText="No"
            overlayClassName="!rounded-xl"
          >
            <IconButton 
              icon={Trash2} 
              size={14} 
              className="w-8! h-8! bg-rose-500/80! backdrop-blur-md text-white border-none!" 
            />
          </Popconfirm>
        </div>
      </div>
      <div className="p-4">
        <h4 className="text-white font-bold truncate text-sm mb-2 uppercase tracking-tight" title={img.title}>{img.title}</h4>
        <Badge variant="muted" className="uppercase text-[9px]! px-2! py-0.5! border-white/10!">{img.album}</Badge>
      </div>
    </div>
  );
};

export default GalleryItem;
