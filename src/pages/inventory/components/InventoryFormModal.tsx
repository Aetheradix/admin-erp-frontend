import React, { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/composed/Dialog';
import { Input } from '@/components/ui/primitives/Input';
import { Select } from '@/components/ui/primitives/Select';
import { Textarea } from '@/components/ui/primitives/Textarea';
import { Switch } from '@/components/ui/primitives/Switch';
import { Button } from '@/components/ui/primitives/Button';
import { FormField } from '@/components/ui/composed/FormField';
import { useUploadImageMutation } from '@/store/api/uploadSlice';
import { resolveImageUrl } from '@/utils/imageUrl';
import { showToast } from '@/components/ui/composed/Toast.utils';
import { Sparkles, UploadCloud, RefreshCw, Layers } from 'lucide-react';
import type { InventoryItem, InventoryCondition, InventoryStatus } from '@/types/inventory';

interface InventoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<InventoryItem>) => Promise<void>;
  initialData?: InventoryItem | null;
  isLoading?: boolean;
}

const CATEGORY_OPTIONS = [
  { label: 'Laptops', value: 'Laptops' },
  { label: 'Monitors', value: 'Monitors' },
  { label: 'Meeting Rooms', value: 'Meeting Rooms' },
  { label: 'Vehicles', value: 'Vehicles' },
  { label: 'Office Furniture', value: 'Office Furniture' },
  { label: 'Equipment', value: 'Equipment' },
  { label: 'Electronics & Audio', value: 'Electronics & Audio' },
  { label: 'Other Resources', value: 'Other' },
];

const CONDITION_OPTIONS = [
  { label: 'New (Pristine Condition)', value: 'New' },
  { label: 'Good (Minor Cosmetic Wear)', value: 'Good' },
  { label: 'Fair (Functional with Wear)', value: 'Fair' },
  { label: 'Poor (Requires Service)', value: 'Poor' },
];

const STATUS_OPTIONS = [
  { label: 'Available', value: 'Available' },
  { label: 'Booked', value: 'Booked' },
  { label: 'Assigned', value: 'Assigned' },
  { label: 'Under Maintenance', value: 'Under Maintenance' },
  { label: 'Retired', value: 'Retired' },
];

export const InventoryFormModal: React.FC<InventoryFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}) => {
  const [uploadImage, { isLoading: isUploading }] = useUploadImageMutation();

  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    name: '',
    asset_id: '',
    category: 'Laptops',
    description: '',
    brand_model: '',
    serial_number: '',
    quantity: 1,
    location: '',
    purchase_date: new Date().toISOString().slice(0, 10),
    purchase_cost: 0,
    condition_status: 'Good',
    image_url: '',
    status: 'Available',
    is_bookable: false,
    notes: '',
  });

  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        is_bookable: Boolean(initialData.is_bookable),
      });
      setPreviewUrl(initialData.image_url || '');
    } else {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      setFormData({
        name: '',
        asset_id: `AST-LAP-${randomSuffix}`,
        category: 'Laptops',
        description: '',
        brand_model: '',
        serial_number: '',
        quantity: 1,
        location: 'HQ - 3rd Floor',
        purchase_date: new Date().toISOString().slice(0, 10),
        purchase_cost: 0,
        condition_status: 'Good',
        image_url: '',
        status: 'Available',
        is_bookable: false,
        notes: '',
      });
      setPreviewUrl('');
    }
  }, [initialData, isOpen]);

  const handleGenerateAssetId = () => {
    const prefixMap: Record<string, string> = {
      'Laptops': 'AST-LAP',
      'Monitors': 'AST-MON',
      'Meeting Rooms': 'AST-ROM',
      'Vehicles': 'AST-VEH',
      'Office Furniture': 'AST-FRN',
      'Equipment': 'AST-EQP',
    };
    const prefix = prefixMap[formData.category || ''] || 'AST-ITM';
    const num = Math.floor(1000 + Math.random() * 9000);
    setFormData((prev) => ({ ...prev, asset_id: `${prefix}-${num}` }));
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    showToast({
      severity: 'info',
      summary: 'Uploading...',
      detail: 'Uploading image to Hostinger storage.',
    });

    try {
      const res = await uploadImage({ file, category: 'general' }).unwrap();
      const serverUrl = res.data?.url;
      if (serverUrl) {
        setFormData((prev) => ({ ...prev, image_url: serverUrl }));
        showToast({
          severity: 'success',
          summary: 'Uploaded Successfully',
          detail: 'Asset image stored securely on server.',
        });
      }
    } catch {
      showToast({
        severity: 'error',
        summary: 'Upload Failed',
        detail: 'Failed to upload image. Please try again.',
      });
      setPreviewUrl(formData.image_url || '');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      showToast({
        severity: 'warn',
        summary: 'Name Required',
        detail: 'Please provide an item or asset name.',
      });
      return;
    }

    if (!formData.asset_id?.trim()) {
      showToast({
        severity: 'warn',
        summary: 'Asset ID Required',
        detail: 'Every inventory item must have a unique Asset ID or SKU.',
      });
      return;
    }

    await onSubmit({
      ...formData,
      purchase_cost: parseFloat(String(formData.purchase_cost || 0)) || 0,
      quantity: parseInt(String(formData.quantity || 1), 10) || 1,
      is_bookable: Boolean(formData.is_bookable),
    });
  };

  return (
    <Dialog
      visible={isOpen}
      onHide={onClose}
      header={
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <Layers size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black text-foreground">
              {initialData ? 'Edit Inventory Asset' : 'Register New Inventory Asset'}
            </h2>
            <p className="text-xs text-muted font-bold">
              Track asset specs, location, and resource booking eligibility
            </p>
          </div>
        </div>
      }
      className="w-full max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 pt-2">
        {/* Top 2 Columns: Identity & Classification */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Asset / Item Name" required id="inv-name">
            <Input
              id="inv-name"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. MacBook Pro 16 M3 Max"
              className="h-11"
            />
          </FormField>

          <FormField label="Unique Asset ID / SKU" required id="inv-asset-id">
            <div className="flex items-center gap-2">
              <Input
                id="inv-asset-id"
                value={formData.asset_id || ''}
                onChange={(e) => setFormData({ ...formData, asset_id: e.target.value })}
                placeholder="e.g. AST-LAP-1029"
                className="h-11 font-mono uppercase"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={handleGenerateAssetId}
                title="Generate Unique Asset ID"
                className="px-3! h-11! text-xs font-bold shrink-0"
              >
                <RefreshCw size={14} className="mr-1" /> Auto
              </Button>
            </div>
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="Category" required id="inv-category">
            <Select
              id="inv-category"
              options={CATEGORY_OPTIONS}
              value={formData.category}
              onChange={(e) => {
                const newCat = e.value as string;
                setFormData((prev) => ({ ...prev, category: newCat }));
              }}
            />
          </FormField>

          <FormField label="Condition" required id="inv-condition">
            <Select
              id="inv-condition"
              options={CONDITION_OPTIONS}
              value={formData.condition_status}
              onChange={(e) => setFormData({ ...formData, condition_status: e.value as InventoryCondition })}
            />
          </FormField>

          <FormField label="Current Status" required id="inv-status">
            <Select
              id="inv-status"
              options={STATUS_OPTIONS}
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.value as InventoryStatus })}
            />
          </FormField>
        </div>

        {/* Secondary Toggle: Available as a Bookable Resource */}
        <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/30 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-foreground">
                  Available as a Bookable Resource
                </span>
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  formData.is_bookable 
                    ? 'bg-amber-500 text-white' 
                    : 'bg-muted/20 text-muted'
                }`}>
                  {formData.is_bookable ? 'BOOKABLE (ON)' : 'INVENTORY ONLY (OFF)'}
                </span>
              </div>
              <p className="text-xs text-muted font-medium mt-1 leading-relaxed">
                When enabled, authorized employees can discover, reserve, and schedule this resource via the 
                Resource Booking system. Overlapping bookings will be prevented automatically.
              </p>
            </div>
          </div>

          <div className="shrink-0 pt-1">
            <Switch
              checked={Boolean(formData.is_bookable)}
              onChange={(e) => setFormData({ ...formData, is_bookable: e.value })}
            />
          </div>
        </div>

        {/* Brand / Model, Serial No, Quantity, Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FormField label="Brand / Model" id="inv-brand">
            <Input
              id="inv-brand"
              value={formData.brand_model || ''}
              onChange={(e) => setFormData({ ...formData, brand_model: e.target.value })}
              placeholder="e.g. Apple MacBook Pro"
              className="h-11"
            />
          </FormField>

          <FormField label="Serial Number" id="inv-serial">
            <Input
              id="inv-serial"
              value={formData.serial_number || ''}
              onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
              placeholder="e.g. C02G901XMD6R"
              className="h-11 font-mono uppercase"
            />
          </FormField>

          <FormField label="Quantity" id="inv-quantity">
            <Input
              id="inv-quantity"
              type="number"
              min="1"
              value={String(formData.quantity || 1)}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value, 10) || 1 })}
              className="h-11"
            />
          </FormField>

          <FormField label="Location" id="inv-location">
            <Input
              id="inv-location"
              value={formData.location || ''}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g. HQ - 3rd Floor Lab"
              className="h-11"
            />
          </FormField>
        </div>

        {/* Purchase Info & Financials */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Purchase Date" id="inv-pdate">
            <Input
              id="inv-pdate"
              type="date"
              value={formData.purchase_date || ''}
              onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
              className="h-11"
            />
          </FormField>

          <FormField label="Purchase Cost ($ USD)" id="inv-pcost">
            <Input
              id="inv-pcost"
              type="number"
              step="0.01"
              min="0"
              value={String(formData.purchase_cost || 0)}
              onChange={(e) => setFormData({ ...formData, purchase_cost: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
              className="h-11"
            />
          </FormField>
        </div>

        {/* Image Upload Area */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-black uppercase tracking-wider text-muted">
            Asset Visual / Photograph
          </label>
          <div className="flex items-center gap-4 p-4 rounded-3xl border border-dashed border-border-subtle bg-surface-subtle/40">
            {previewUrl ? (
              <div className="w-20 h-20 rounded-2xl overflow-hidden border border-border-subtle shrink-0 relative group">
                <img
                  src={resolveImageUrl(previewUrl)}
                  alt="Asset Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPreviewUrl('');
                    setFormData({ ...formData, image_url: '' });
                  }}
                  className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-bold"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-surface flex items-center justify-center text-muted border border-border-subtle shrink-0">
                <UploadCloud size={24} />
              </div>
            )}

            <div className="flex-1 flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all shadow-xs">
                  <UploadCloud size={14} />
                  <span>{isUploading ? 'Uploading...' : 'Choose Image File'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageFileChange}
                    disabled={isUploading}
                  />
                </label>
                <span className="text-[11px] text-muted font-bold">or direct URL</span>
              </div>
              <Input
                value={formData.image_url || ''}
                onChange={(e) => {
                  setFormData({ ...formData, image_url: e.target.value });
                  setPreviewUrl(e.target.value);
                }}
                placeholder="https://... direct image link"
                className="h-9 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Description & Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Asset Description" id="inv-desc">
            <Textarea
              id="inv-desc"
              rows={3}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Full technical specifications, key features, and hardware breakdown..."
            />
          </FormField>

          <FormField label="Internal Notes & Maintenance Instructions" id="inv-notes">
            <Textarea
              id="inv-notes"
              rows={3}
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Warranty expiry, checkout protocols, licensing keys, handling notes..."
            />
          </FormField>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="px-6 rounded-2xl font-bold"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading || isUploading}
            className="px-8 rounded-2xl font-black shadow-lg shadow-primary/20"
          >
            {isLoading ? 'Saving...' : initialData ? 'Update Asset' : 'Save to Inventory'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
