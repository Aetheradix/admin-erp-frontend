import { useState } from 'react';
import { PageHeader } from '@/components/ui/composed/PageHeader';
import { Package, Tag, DollarSign, Layers } from 'lucide-react';
import { motion } from 'framer-motion';
import { Dialog } from '@/components/ui/composed/Dialog';
import { Input } from '@/components/ui/primitives/Input';
import { Select } from '@/components/ui/primitives/Select';
import { Button } from '@/components/ui/primitives/Button';

interface Item {
  id: number;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  price: number;
  status: string;
}

const CATEGORIES = [
  { label: 'Hardware', value: 'Hardware' },
  { label: 'Accessories', value: 'Accessories' },
  { label: 'Furniture', value: 'Furniture' },
  { label: 'Software', value: 'Software' },
];

const initialItems: Item[] = [
  {
    id: 1,
    name: 'MacBook Pro 16"',
    sku: 'HW-MBP-001',
    category: 'Hardware',
    quantity: 24,
    price: 2499,
    status: 'In Stock',
  },
  {
    id: 2,
    name: 'Dell Monitor 27"',
    sku: 'HW-DM27-002',
    category: 'Hardware',
    quantity: 15,
    price: 449,
    status: 'In Stock',
  },
  {
    id: 3,
    name: 'Ergonomic Keyboard',
    sku: 'ACC-EK-003',
    category: 'Accessories',
    quantity: 42,
    price: 129,
    status: 'In Stock',
  },
  {
    id: 4,
    name: 'USB-C Hub',
    sku: 'ACC-UCH-004',
    category: 'Accessories',
    quantity: 3,
    price: 79,
    status: 'Low Stock',
  },
  {
    id: 5,
    name: 'Standing Desk',
    sku: 'FRN-SD-005',
    category: 'Furniture',
    quantity: 8,
    price: 699,
    status: 'In Stock',
  },
  {
    id: 6,
    name: 'Office Chair Pro',
    sku: 'FRN-OCP-006',
    category: 'Furniture',
    quantity: 0,
    price: 899,
    status: 'Out of Stock',
  },
  {
    id: 7,
    name: 'Wireless Mouse',
    sku: 'ACC-WM-007',
    category: 'Accessories',
    quantity: 67,
    price: 59,
    status: 'In Stock',
  },
  {
    id: 8,
    name: 'Webcam HD',
    sku: 'HW-WC-008',
    category: 'Hardware',
    quantity: 2,
    price: 149,
    status: 'Low Stock',
  },
  {
    id: 9,
    name: 'Noise-Cancelling Headphones',
    sku: 'ACC-NCH-009',
    category: 'Accessories',
    quantity: 18,
    price: 299,
    status: 'In Stock',
  },
];

const statusColors: Record<string, string> = {
  'In Stock': 'text-success',
  'Low Stock': 'text-warning',
  'Out of Stock': 'text-error',
};
const categoryColors: Record<string, string> = {
  Hardware: 'bg-primary/10 text-primary',
  Accessories: 'bg-info/10 text-info',
  Furniture: 'bg-warning/10 text-warning',
  Software: 'bg-success/10 text-success',
};

const emptyForm = { name: '', sku: '', category: '', quantity: 0, price: 0 };

export function ItemsPage() {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const totalValue = items.reduce((a, i) => a + i.quantity * i.price, 0);

  const handleSubmit = () => {
    if (!form.name || !form.sku || !form.category) return;
    const status =
      form.quantity === 0 ? 'Out of Stock' : form.quantity <= 5 ? 'Low Stock' : 'In Stock';
    const newItem: Item = { id: Date.now(), ...form, status };
    setItems([newItem, ...items]);
    setForm(emptyForm);
    setShowForm(false);
  };

  return (
    <div className="flex flex-col gap-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader
        title="Inventory Items"
        description="Manage your organization's inventory catalog."
        breadcrumbs={[{ label: 'Home', url: '/' }, { label: 'Inventory' }]}
        primaryAction={{ label: 'Add Item', onClick: () => setShowForm(true), icon: 'pi pi-plus' }}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Items', value: items.length, icon: Package },
          { label: 'Categories', value: new Set(items.map((i) => i.category)).size, icon: Tag },
          { label: 'Total Units', value: items.reduce((a, i) => a + i.quantity, 0), icon: Layers },
          { label: 'Total Value', value: `₹${totalValue.toLocaleString()}`, icon: DollarSign },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white p-6 rounded-[28px] border border-border-subtle shadow-soft flex items-center gap-5 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-surface-subtle flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
              <stat.icon size={22} />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xl font-black text-foreground">{stat.value}</span>
              <span className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
                {stat.label}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.05 }}
            className="bg-white rounded-[28px] border border-border-subtle shadow-soft p-7 flex flex-col gap-5 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-bold text-foreground">{item.name}</h3>
                <span className="text-[10px] font-bold text-muted tracking-wider">{item.sku}</span>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${categoryColors[item.category] || 'bg-surface-subtle text-muted'}`}
              >
                {item.category}
              </span>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-border-subtle/50">
              <div className="flex flex-col gap-0.5">
                <span className="text-lg font-black text-foreground">
                  ₹{item.price.toLocaleString()}
                </span>
                <span className="text-[10px] text-muted font-bold">Qty: {item.quantity}</span>
              </div>
              <span className={`text-xs font-bold ${statusColors[item.status]}`}>
                ● {item.status}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Item Dialog */}
      <Dialog
        visible={showForm}
        onHide={() => setShowForm(false)}
        header="Add Inventory Item"
        modal
        className="w-full max-w-xl mx-4"
        contentClassName="p-8"
        headerClassName="px-8 pt-8 pb-4 text-xl font-black tracking-tight border-none"
        pt={{
          root: { className: 'rounded-[32px] overflow-hidden border-none shadow-2xl bg-white' },
          mask: { className: 'backdrop-blur-md bg-black/40' },
        }}
      >
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
              Item Name
            </label>
            <Input
              placeholder="e.g. MacBook Pro 16"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
                SKU
              </label>
              <Input
                placeholder="e.g. HW-MBP-001"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
                Category
              </label>
              <Select
                options={CATEGORIES}
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.value })}
                placeholder="Select"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
                Quantity
              </label>
              <Input
                type="number"
                placeholder="0"
                value={String(form.quantity)}
                onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) || 0 })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
                Unit Price (₹)
              </label>
              <Input
                type="number"
                placeholder="0"
                value={String(form.price)}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) || 0 })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
            <Button
              variant="ghost"
              label="Cancel"
              onClick={() => {
                setShowForm(false);
                setForm(emptyForm);
              }}
              className="rounded-xl!"
            />
            <Button
              label="Add Item"
              onClick={handleSubmit}
              icon="pi pi-check"
              className="rounded-xl! px-8!"
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
