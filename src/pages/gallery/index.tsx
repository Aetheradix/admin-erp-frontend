import { PageHeader } from '@/components/ui/composed/PageHeader';
import { useCreateGalleryItemMutation, useDeleteGalleryItemMutation, useGetGalleryQuery } from '@/store/api/galleryApiSlice';
import { ProgressSpinner } from '@/components/ui/composed/ProgressSpinner';
import { useState } from 'react';
import { GalleryGrid } from './components/GalleryGrid';
import type { GalleryItem } from './hooks/mockGallery';
import { motion } from 'framer-motion';

import { Tabs } from '@/components/ui/primitives/Tabs';
import { Dialog } from '@/components/ui/composed/Dialog';
import { showConfirm } from '@/components/ui/composed/ConfirmDialog';
import { showToast } from '@/components/ui/composed/Toast';
import { GalleryForm } from './components/GalleryForm';
import { Search, Image, Cloud, Zap } from 'lucide-react';
import { Input } from '@/components/ui/primitives/Input';

const GalleryStats = ({ total }: { total: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    {[
      { label: 'Total Assets', value: total, icon: Image, color: 'primary' },
      { label: 'Storage Used', value: '4.2 GB', icon: Cloud, color: 'info' },
      { label: 'Processing', value: '0 Active', icon: Zap, color: 'success' }
    ].map((stat, idx) => (
      <motion.div
        key={stat.label}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: idx * 0.1 }}
        className="bg-white/40 backdrop-blur-xl rounded-[2rem] p-6 border border-white shadow-soft flex items-center gap-6 group hover:shadow-lg transition-all"
      >
        <div className={`w-12 h-12 rounded-2xl bg-${stat.color}/10 flex items-center justify-center border border-${stat.color}/20 group-hover:bg-${stat.color} transition-colors duration-500`}>
          <stat.icon size={20} className={`text-${stat.color} group-hover:text-white transition-colors`} />
        </div>
        <div>
          <span className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-1 block">{stat.label}</span>
          <h4 className="text-2xl font-black text-foreground tracking-tighter">{stat.value}</h4>
        </div>
      </motion.div>
    ))}
  </div>
);

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
          showToast({ severity: 'success', summary: 'Deleted', detail: 'Asset removed successfully.', life: 3000 });
        } catch (err: any) {
          console.error('Failed to delete asset:', err);
          showToast({ severity: 'error', summary: 'Error', detail: err.data?.message || 'Failed to delete asset', life: 3000 });
        }
      }
    });
  };

  const handleSubmit = async (data: Partial<GalleryItem>) => {
    try {
      if (editingItem) {
        console.warn('Update gallery item not supported yet on backend');
      } else {
        await createGalleryItem(data).unwrap();
        showToast({ severity: 'success', summary: 'Uploaded', detail: 'Asset uploaded successfully!', life: 3000 });
      }
      setShowForm(false);
    } catch (err: any) {
      console.error('Failed to save asset:', err);
      showToast({ severity: 'error', summary: 'Error', detail: err.data?.message || 'Failed to upload asset', life: 3000 });
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
        title="Visual Assets"
        description="A premium repository for high-tech workspaces, team moments, and product visuals."
        primaryAction={{
          label: 'Upload New Media',
          onClick: handleCreate,
          icon: 'pi pi-cloud-upload',
          className: 'px-8! py-4! rounded-2xl! font-black! tracking-[0.1em] shadow-xl! shadow-primary/25! text-xs!',
        }}
      />

      <GalleryStats total={items.length} />

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white/40 backdrop-blur-xl p-4 rounded-[40px] border border-white shadow-soft">
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
            className="pl-12! h-12! text-[11px]! rounded-2xl! bg-white/50! border-none! shadow-sm!"
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
        header={editingItem ? "Refine Asset Data" : "Initialize New Assets"}
        modal
        className="w-full max-w-4xl mx-4"
        contentClassName="p-8"
        headerClassName="px-8 pt-8 pb-4 text-2xl font-black tracking-tight border-none"
        pt={{
          root: { className: 'rounded-[3rem] overflow-hidden border-none shadow-2xl bg-white/90 backdrop-blur-2xl' },
          mask: { className: 'backdrop-blur-md bg-black/30' }
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
