import { PageHeader } from '@/components/ui/composed/PageHeader';
import {
  useUploadGalleryItemMutation,
  useUpdateGalleryItemMutation,
  useDeleteGalleryItemMutation,
  useGetGalleryQuery,
} from '@/store/api/gallerySlice';
import { ProgressSpinner } from '@/components/ui/composed/ProgressSpinner';
import { useState, useMemo } from 'react';
import { GalleryGrid } from './components/GalleryGrid';
import type { GalleryItem } from '@/types/models';
import { motion } from 'framer-motion';

import { Tabs } from '@/components/ui/primitives/Tabs';
import { Dialog } from '@/components/ui/composed/Dialog';
import { showConfirm } from '@/components/ui/composed/ConfirmDialog.utils';
import { showToast } from '@/components/ui/composed/Toast.utils';
import { GalleryForm } from './components/GalleryForm';
import { Search, Image, Cloud, Zap } from 'lucide-react';
import { Input } from '@/components/ui/primitives/Input';

const GalleryStats = ({ total, categoriesCount }: { total: number; categoriesCount: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    {[
      {
        label: 'Total Assets',
        value: total,
        icon: Image,
        color: 'text-primary',
        bg: 'bg-primary/10',
        border: 'border-primary/20',
        hoverBg: 'group-hover:bg-primary',
      },
      {
        label: 'Active Categories',
        value: categoriesCount,
        icon: Cloud,
        color: 'text-sky-500',
        bg: 'bg-sky-500/10',
        border: 'border-sky-500/20',
        hoverBg: 'group-hover:bg-sky-500',
      },
      {
        label: 'Repository Health',
        value: 'Operational',
        icon: Zap,
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        hoverBg: 'group-hover:bg-emerald-500',
      },
    ].map((stat, idx) => (
      <motion.div
        key={stat.label}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: idx * 0.1 }}
        className="bg-white/40 backdrop-blur-xl rounded-[2rem] p-6 border border-white shadow-soft flex items-center gap-6 group hover:shadow-lg transition-all">
        <div
          className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center border ${stat.border} ${stat.hoverBg} transition-colors duration-500`}>
          <stat.icon
            size={20}
            className={`${stat.color} group-hover:text-white transition-colors`}
          />
        </div>
        <div>
          <span className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-1 block">
            {stat.label}
          </span>
          <h4 className="text-2xl font-black text-foreground tracking-tighter">{stat.value}</h4>
        </div>
      </motion.div>
    ))}
  </div>
);

const Gallery = () => {
  const { data: items = [], isLoading } = useGetGalleryQuery();
  const [uploadGalleryItem] = useUploadGalleryItemMutation();
  const [updateGalleryItem] = useUpdateGalleryItemMutation();
  const [deleteGalleryItem] = useDeleteGalleryItemMutation();

  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);

  const categories = useMemo(() => {
    const defaults = ['All', 'Events', 'Workplace', 'Team', 'Product'];
    const others = items
      .map((i: GalleryItem) => i.category)
      .filter((c): c is string => Boolean(c && !defaults.includes(c)));
    return [...defaults, ...Array.from(new Set(others))];
  }, [items]);

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
          showToast({
            severity: 'success',
            summary: 'Deleted',
            detail: 'Asset removed successfully.',
            life: 3000,
          });
        } catch (err: unknown) {
          const apiError = err as { data?: { message?: string } };
          console.error('Failed to delete asset:', err);
          showToast({
            severity: 'error',
            summary: 'Error',
            detail: apiError.data?.message || 'Failed to delete asset',
            life: 3000,
          });
        }
      },
    });
  };

  const handleSubmit = async (data: Partial<GalleryItem>) => {
    try {
      if (editingItem) {
        await updateGalleryItem({ id: editingItem.id, ...data }).unwrap();
        showToast({
          severity: 'success',
          summary: 'Updated',
          detail: 'Asset updated successfully!',
          life: 3000,
        });
      } else {
        await uploadGalleryItem(data).unwrap();
        showToast({
          severity: 'success',
          summary: 'Uploaded',
          detail: 'Asset uploaded successfully!',
          life: 3000,
        });
      }
      setShowForm(false);
      setEditingItem(null);
    } catch (err: unknown) {
      const apiError = err as { data?: { message?: string } };
      console.error('Failed to save asset:', err);
      showToast({
        severity: 'error',
        summary: 'Error',
        detail: apiError.data?.message || 'Failed to save asset',
        life: 3000,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <ProgressSpinner />
      </div>
    );
  }

  const uniqueCategoriesCount = new Set(
    items.map((i) => i.category).filter(Boolean)
  ).size;

  return (
    <div className="flex flex-col gap-8 pb-12">
      <PageHeader
        title="Visual Assets"
        description="A premium repository for high-tech workspaces, team moments, and product visuals."
        primaryAction={{
          label: 'Upload New Media',
          onClick: handleCreate,
          icon: 'pi pi-cloud-upload',
          className:
            'px-8! py-4! rounded-2xl! font-black! tracking-[0.1em] shadow-xl! shadow-primary/25! text-xs!',
        }}
      />

      <GalleryStats total={items.length} categoriesCount={uniqueCategoriesCount} />

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white/40 backdrop-blur-xl p-4 rounded-[40px] border border-white shadow-soft">
        <Tabs
          items={categories}
          activeItem={activeCategory}
          onItemChange={setActiveCategory}
          className="w-full md:w-auto"
        />

        <div className="relative w-full md:w-72 group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors"
            size={18}
          />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assets..."
            className="pl-12! h-12! text-[11px]! rounded-2xl! bg-white/50! border-none! shadow-sm!"
          />
        </div>
      </div>

      <GalleryGrid items={filteredItems} onEdit={handleEdit} onDelete={handleDelete} />

      {/* Upload/Edit Modal */}
      <Dialog
        visible={showForm}
        onHide={() => {
          setShowForm(false);
          setEditingItem(null);
        }}
        header={editingItem ? 'Refine Asset Data' : 'Initialize New Assets'}
        modal
        className="w-full max-w-4xl mx-4"
        contentClassName="p-8"
        headerClassName="px-8 pt-8 pb-4 text-2xl font-black tracking-tight border-none"
        pt={{
          root: {
            className:
              'rounded-[3rem] overflow-hidden border-none shadow-2xl bg-white/90 backdrop-blur-2xl',
          },
          mask: { className: 'backdrop-blur-md bg-black/30' },
        }}>
        <GalleryForm
          initialData={editingItem}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
        />
      </Dialog>
    </div>
  );
};

export default Gallery;
