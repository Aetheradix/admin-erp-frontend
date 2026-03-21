import { useState } from 'react';
import { PageHeader } from '@/components/ui/composed/PageHeader';
import { GalleryGrid } from './components/GalleryGrid';
import { mockGallery as initialMockData, type GalleryItem } from './hooks/mockGallery';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/primitives/Input';
import { Dialog } from 'primereact/dialog';
import { GalleryForm } from './components/GalleryForm';

import { Tabs } from '@/components/ui/primitives/Tabs';

const Gallery = () => {
  const [items, setItems] = useState<GalleryItem[]>(initialMockData);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);

  const categories = ['All', 'Events', 'Workplace', 'Team', 'Product'];

  const filteredItems = items.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCreate = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const handleEdit = (id: string) => {
    const item = items.find(i => i.id === id);
    if (item) {
      setEditingItem(item);
      setShowForm(true);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to remove this asset?')) {
      setItems(prev => prev.filter(i => i.id !== id));
    }
  };

  const handleSubmit = (data: Partial<GalleryItem>) => {
    if (editingItem) {
      // Update
      setItems(prev => prev.map(i => i.id === editingItem.id ? { ...i, ...data } as GalleryItem : i));
    } else {
      // Create
      const newItem: GalleryItem = {
        ...data,
        id: Math.random().toString(36).substr(2, 9),
      } as GalleryItem;
      setItems(prev => [newItem, ...prev]);
    }
    setShowForm(false);
  };

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
