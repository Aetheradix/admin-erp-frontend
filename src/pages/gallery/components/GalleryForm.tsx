import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/primitives/Input';
import { Select } from '@/components/ui/primitives/Select';
import { FormField } from '@/components/ui/composed/FormField';
import { FileUpload } from '@/components/ui/composed/FileUpload';
import { Button } from '@/components/ui/primitives/Button';
import type { GalleryItem } from '../hooks/mockGallery';

interface GalleryFormProps {
  initialData?: GalleryItem | null;
  onSubmit: (data: Partial<GalleryItem>) => void;
  onCancel: () => void;
}

import { Calendar } from '@/components/ui/primitives/Calendar';

export const GalleryForm = ({ initialData, onSubmit, onCancel }: GalleryFormProps) => {
  const [formData, setFormData] = useState<Partial<GalleryItem>>({
    title: '',
    category: 'Workplace',
    url: '',
    date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const categories = [
    { label: 'Events', value: 'Events' },
    { label: 'Workplace', value: 'Workplace' },
    { label: 'Team', value: 'Team' },
    { label: 'Product', value: 'Product' },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Upload Area */}
        <div className="flex flex-col gap-4">
          <label className="text-sm font-black text-foreground uppercase tracking-widest">Media Asset</label>
          <div className="aspect-square w-full rounded-4xl border-2 border-dashed border-border-subtle bg-surface-subtle flex flex-col items-center justify-center gap-4 group hover:border-primary/50 hover:bg-primary/5 transition-all overflow-hidden relative shadow-inner">
            {formData.url ? (
                <>
                  <img src={formData.url} alt="Preview" width={400} height={400} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 hover:opacity-100 transition-all flex items-center justify-center">
                    <Button variant="primary" className="rounded-full! p-4!" aria-label="Change image">
                      <i className="pi pi-pencil text-xl"></i>
                    </Button>
                  </div>
                </>
            ) : (
                <>
                  <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-soft text-primary group-hover:scale-110 transition-transform">
                    <i className="pi pi-cloud-upload text-3xl"></i>
                  </div>
                  <div className="text-center px-6">
                    <p className="text-base font-black text-foreground">Drop image here</p>
                    <p className="text-[10px] text-muted font-black mt-1 uppercase tracking-widest">or click to browse library</p>
                  </div>
                </>
            )}
            <FileUpload 
                mode="basic" 
                auto 
                className="absolute inset-0 opacity-0 cursor-pointer" 
                onUpload={(e) => console.log('Upload', e)}
                aria-label="Upload media asset"
            />
          </div>
          <div className="pt-2">
            <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-3">Asset Source</p>
            <Input 
              id="gallery-source"
              value={formData.url} 
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="Paste image URL if not uploading..." 
              className="text-[11px]! py-3!"
              aria-label="Image URL"
            />
          </div>
        </div>

        {/* Right: Metadata */}
        <div className="flex flex-col gap-6">
          <FormField label="Asset Title" required id="gallery-title">
            <Input 
              id="gallery-title"
              value={formData.title} 
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Give your capture a name..." 
            />
          </FormField>

          <FormField label="Category" id="gallery-category">
            <Select 
              id="gallery-category"
              options={categories}
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.value })}
              placeholder="Select category"
            />
          </FormField>

          <FormField label="Capture Date" id="gallery-date">
            <Calendar 
              id="gallery-date"
              value={formData.date ? new Date(formData.date) : null}
              onChange={(e) => setFormData({ ...formData, date: e.value?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) || '' })}
              placeholder="Select date" 
              dateFormat="MM d, yy"
            />
          </FormField>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-6 border-t border-border-subtle">
        <Button 
          variant="ghost" 
          onClick={onCancel} 
          className="px-8! rounded-3xl! font-bold text-muted!"
          aria-label="Cancel asset upload"
        >
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={() => onSubmit(formData)}
          className="px-10! h-12 rounded-3xl! font-black tracking-wide shadow-lg shadow-primary/20"
          aria-label={initialData ? 'Update asset details' : 'Add asset to gallery collection'}
        >
          {initialData ? 'Update Asset' : 'Add to Collection'}
        </Button>
      </div>
    </div>
  );
};
