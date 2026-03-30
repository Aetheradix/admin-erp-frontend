import { PageHeader } from '@/components/ui/composed/PageHeader';
import { useCreateGalleryItemMutation, useDeleteGalleryItemMutation, useGetGalleryQuery } from '@/store/api/galleryApiSlice';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useState } from 'react';
import { GalleryGrid } from './components/GalleryGrid';
import type { GalleryItem } from './hooks/mockGallery';

import { Tabs } from '@/components/ui/primitives/Tabs';
import { Dialog } from 'primereact/dialog';
import { showConfirm } from '@/components/ui/composed/ConfirmDialog';
import { GalleryForm } from './components/GalleryForm';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/primitives/Input';


const Gallery = () => {
  const { data: items = [], isLoading } = useGetGalleryQuery();
  const [createGalleryItem] = useCreateGalleryItemMutation();
  const [deleteGalleryItem] = useDeleteGalleryItemMutation();
  
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);

  const categories = ['All', 'Events', 'Workplace', 'Team', 'Product'];

  const filteredItems = items.filter((item: GalleryItem) => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const title = item.title || '';
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCreate = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const handleEdit = (id: string) => {
    const item = items.find((i: GalleryItem) => String(i.id) === String(id));
    if (item) {
      setEditingItem(item);
      setShowForm(true);
    }
  };

  const handleDelete = async (id: string) => {
    showConfirm({
      message: 'Are you sure you want to remove this asset?',
      header: 'Confirm Deletion',
      accept: async () => {
        try {
          await deleteGalleryItem(id).unwrap();
        } catch (err) {
          console.error('Failed to delete asset:', err);
        }
      }
    });
  };

  const handleSubmit = async (data: Partial<GalleryItem>) => {
    try {
      if (editingItem) {
        // Update not yet implemented on backend for gallery items based on simple service
        console.warn('Update gallery item not supported yet on backend');
      } else {
        await createGalleryItem(data).unwrap();
      }
      setShowForm(false);
    } catch (err) {
      console.error('Failed to save asset:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <ProgressSpinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-12">
      <PageHeader 
        title="Asset Library" 
        description="A curated collection of your team moments, high-tech workspaces, and product visual assets."
        primaryAction={{
          label: 'Upload Assets',
          onClick: handleCreate,
          icon: 'pi pi-cloud-upload',
        }}
      />

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-4 rounded-[40px] border border-border-subtle shadow-soft">
        <Tabs 
          items={categories} 
          activeItem={activeCategory} 
          onItemChange={setActiveCategory} 
          className="w-full md:w-auto"
        />

        <div className="relative w-full md:w-72 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" size={18} />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assets..."
            className="pl-12! h-11! text-xs!"
          />
        </div>
      </div>

      <GalleryGrid 
        items={filteredItems} 
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Upload/Edit Modal */}
      <Dialog 
        visible={showForm} 
        onHide={() => setShowForm(false)}
        header={editingItem ? "Edit Asset Details" : "Upload New Assets"}
        modal
        className="w-full max-w-4xl mx-4"
        contentClassName="p-8"
        headerClassName="px-8 pt-8 pb-4 text-xl font-black tracking-tight border-none"
        pt={{
            root: { className: 'rounded-[32px] overflow-hidden border-none shadow-2xl' },
            mask: { className: 'backdrop-blur-sm bg-black/20' }
        }}
      >
        <GalleryForm 
            initialData={editingItem} 
            onSubmit={handleSubmit}
            onCancel={() => setShowForm(false)}
        />
      </Dialog>
    </div>
  );
};

export default Gallery;
