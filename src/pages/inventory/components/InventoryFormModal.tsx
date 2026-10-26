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
import { WORLD_CURRENCIES, getCurrencySymbol, formatPriceWithCurrency } from '@/utils/currency';
import {
  Sparkles,
  UploadCloud,
  RefreshCw,
  Layers,
  CheckCircle2,
  Image as ImageIcon,
  Trash2,
  Tag,
  Cpu,
  FileText,
} from 'lucide-react';
import type { InventoryItem, InventoryCondition, InventoryStatus } from '@/types/inventory';

const CURRENCY_SELECT_OPTIONS = WORLD_CURRENCIES.map((c) => ({
  label: `${c.code} (${c.symbol}) - ${c.name.split(' - ')[1] || c.name}`,
  value: c.code,
}));

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
    currency: 'USD',
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
        currency: initialData.currency || 'USD',
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
        currency: 'USD',
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
      Laptops: 'AST-LAP',
      Monitors: 'AST-MON',
      'Meeting Rooms': 'AST-ROM',
      Vehicles: 'AST-VEH',
      'Office Furniture': 'AST-FRN',
      Equipment: 'AST-EQP',
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
      currency: formData.currency || 'USD',
      purchase_cost: parseFloat(String(formData.purchase_cost || 0)) || 0,
      quantity: parseInt(String(formData.quantity || 1), 10) || 1,
      is_bookable: Boolean(formData.is_bookable),
    });
  };

  return (
    <Dialog
      visible={isOpen}
      onHide={onClose}
      width="min(860px, 94vw)"
      header={
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20 shadow-xs">
            <Layers size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-foreground tracking-tight">
                {initialData ? 'Edit Inventory Asset' : 'Register New Inventory Asset'}
              </h2>
              {initialData?.asset_id && (
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-surface-subtle text-muted border border-border-subtle">
                  {initialData.asset_id}
                </span>
              )}
            </div>
            <p className="text-xs text-muted font-medium mt-0.5">
              Track asset specs, location, and resource booking eligibility
            </p>
          </div>
        </div>
      }
      headerClassName="px-7 pt-6 pb-4 border-b border-border-subtle/80 bg-surface"
      className="rounded-3xl overflow-hidden shadow-2xl">
      <form onSubmit={handleSubmit} className="flex flex-col">
        {/* Scrollable Form Body with fixed height boundary */}
        <div className="max-h-[min(70vh,660px)] overflow-y-auto px-6 sm:px-8 py-6 space-y-6">
          {/* Section 1: Core Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-muted">
              <Tag size={13} className="text-primary" />
              <span>Core Identification</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <FormField
                label="Asset / Item Name"
                required
                id="inv-name"
                className="sm:col-span-7 mb-0">
                <Input
                  id="inv-name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. MacBook Pro 16 M3 Max"
                  className="h-11 rounded-xl"
                />
              </FormField>

              <FormField
                label="Unique Asset ID / SKU"
                required
                id="inv-asset-id"
                className="sm:col-span-5 mb-0">
                <div className="flex items-center gap-2">
                  <Input
                    id="inv-asset-id"
                    value={formData.asset_id || ''}
                    onChange={(e) => setFormData({ ...formData, asset_id: e.target.value })}
                    placeholder="e.g. AST-LAP-1029"
                    className="h-11 font-mono uppercase rounded-xl"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleGenerateAssetId}
                    title="Generate Unique Asset ID"
                    className="px-3! h-11! text-xs font-bold shrink-0 rounded-xl">
                    <RefreshCw size={14} className="mr-1" /> Auto
                  </Button>
                </div>
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField label="Category" required id="inv-category" className="mb-0">
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

              <FormField label="Condition" required id="inv-condition" className="mb-0">
                <Select
                  id="inv-condition"
                  options={CONDITION_OPTIONS}
                  value={formData.condition_status}
                  onChange={(e) =>
                    setFormData({ ...formData, condition_status: e.value as InventoryCondition })
                  }
                />
              </FormField>

              <FormField label="Current Status" required id="inv-status" className="mb-0">
                <Select
                  id="inv-status"
                  options={STATUS_OPTIONS}
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.value as InventoryStatus })}
                />
              </FormField>
            </div>
          </div>

          {/* Section 2: Bookable Resource Toggle Banner */}
          <div className="p-4 sm:p-4.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/30 flex items-start justify-between gap-4 transition-all">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center shrink-0 mt-0.5 border border-amber-500/20">
                <Sparkles size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-foreground">
                    Available as a Bookable Resource
                  </span>
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full transition-colors ${
                      formData.is_bookable
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-muted/15 text-muted'
                    }`}>
                    {formData.is_bookable ? 'BOOKABLE (ON)' : 'INVENTORY ONLY (OFF)'}
                  </span>
                </div>
                <p className="text-xs text-muted font-medium mt-1 leading-relaxed">
                  When enabled, employees can discover and reserve this resource via the Resource
                  Booking calendar. Overlapping reservations will be automatically prevented.
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

          {/* Section 3: Hardware Specifications & Location */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-muted">
              <Cpu size={13} className="text-primary" />
              <span>Hardware & Allocation Details</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <FormField label="Brand / Model" id="inv-brand" className="sm:col-span-6 mb-0">
                <Input
                  id="inv-brand"
                  value={formData.brand_model || ''}
                  onChange={(e) => setFormData({ ...formData, brand_model: e.target.value })}
                  placeholder="e.g. Apple MacBook Pro 16"
                  className="h-11 rounded-xl"
                />
              </FormField>

              <FormField label="Serial Number" id="inv-serial" className="sm:col-span-6 mb-0">
                <Input
                  id="inv-serial"
                  value={formData.serial_number || ''}
                  onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                  placeholder="e.g. C02G901XMD6R"
                  className="h-11 font-mono uppercase rounded-xl"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <FormField label="Quantity" id="inv-quantity" className="sm:col-span-3 mb-0">
                <Input
                  id="inv-quantity"
                  type="number"
                  min="1"
                  value={String(formData.quantity || 1)}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: parseInt(e.target.value, 10) || 1 })
                  }
                  className="h-11 rounded-xl text-center"
                />
              </FormField>

              <FormField label="Location" id="inv-location" className="sm:col-span-5 mb-0">
                <Input
                  id="inv-location"
                  value={formData.location || ''}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. HQ - 3rd Floor Lab"
                  className="h-11 rounded-xl"
                />
              </FormField>

              <FormField label="Purchase Date" id="inv-pdate" className="sm:col-span-4 mb-0">
                <Input
                  id="inv-pdate"
                  type="date"
                  value={formData.purchase_date || ''}
                  onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                  className="h-11 rounded-xl"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-8 flex flex-col gap-1.5">
                <label
                  htmlFor="inv-pcost"
                  className="text-sm font-semibold text-foreground/80 ml-1">
                  Purchase Cost / Valuation (Universal Currency)
                </label>
                <div className="flex items-center gap-2">
                  <div className="w-56 shrink-0">
                    <Select
                      id="inv-currency"
                      options={CURRENCY_SELECT_OPTIONS}
                      value={formData.currency || 'USD'}
                      onChange={(e) => setFormData({ ...formData, currency: e.value as string })}
                      className="h-11 rounded-xl"
                      placeholder="Currency"
                    />
                  </div>
                  <div className="relative flex-1">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted font-bold text-xs pointer-events-none select-none">
                      {getCurrencySymbol(formData.currency || 'USD')}
                    </span>
                    <Input
                      id="inv-pcost"
                      type="number"
                      step="0.01"
                      min="0"
                      value={String(formData.purchase_cost || 0)}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          purchase_cost: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="0.00"
                      className="h-11 rounded-xl font-mono pl-9"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Asset Visual / Image */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-muted">
              <ImageIcon size={13} className="text-primary" />
              <span>Asset Visual / Photograph</span>
            </div>

            <div className="p-4 rounded-2xl border border-dashed border-border-subtle bg-surface-subtle/40 flex flex-col sm:flex-row items-center gap-4">
              {previewUrl ? (
                <div className="w-24 h-24 rounded-2xl overflow-hidden border border-border-subtle shrink-0 relative group bg-surface">
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
                    className="absolute inset-0 bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-xs font-bold">
                    <Trash2 size={16} />
                    <span>Remove</span>
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-surface flex flex-col items-center justify-center text-muted border border-border-subtle shrink-0">
                  <UploadCloud size={24} className="text-muted/60 mb-1" />
                  <span className="text-[10px] font-bold text-muted/80">No Image</span>
                </div>
              )}

              <div className="flex-1 w-full flex flex-col gap-2.5">
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all shadow-xs">
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
                  <span className="text-[11px] text-muted font-bold">or direct URL link</span>
                </div>
                <Input
                  value={formData.image_url || ''}
                  onChange={(e) => {
                    setFormData({ ...formData, image_url: e.target.value });
                    setPreviewUrl(e.target.value);
                  }}
                  placeholder="https://... direct image URL"
                  className="h-10 text-xs rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Description & Internal Notes */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-muted">
              <FileText size={13} className="text-primary" />
              <span>Documentation & Notes</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Asset Description" id="inv-desc" className="mb-0">
                <Textarea
                  id="inv-desc"
                  rows={3}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Technical specifications, components, and hardware breakdown..."
                  className="rounded-xl min-h-[90px]! text-xs leading-relaxed"
                />
              </FormField>

              <FormField
                label="Internal Notes & Maintenance Instructions"
                id="inv-notes"
                className="mb-0">
                <Textarea
                  id="inv-notes"
                  rows={3}
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Warranty expiry, maintenance cadence, service history, handling notes..."
                  className="rounded-xl min-h-[90px]! text-xs leading-relaxed"
                />
              </FormField>
            </div>
          </div>
        </div>

        {/* Sticky Footer with Actions */}
        <div className="px-6 sm:px-8 py-4 bg-surface-elevated/95 backdrop-blur-md border-t border-border-subtle flex items-center justify-between gap-4 sticky bottom-0 z-10">
          <div className="hidden sm:flex items-center gap-2.5 text-xs text-muted font-medium">
            <span
              className={`w-2 h-2 rounded-full ${
                formData.is_bookable ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
            />
            <span>
              {formData.is_bookable
                ? 'Bookable Resource enabled'
                : 'Registered as standard inventory asset'}
            </span>
            {Number(formData.purchase_cost || 0) > 0 && (
              <span className="px-2.5 py-0.5 rounded-lg bg-surface-subtle font-black text-foreground border border-border-subtle flex items-center gap-1 shadow-2xs">
                <span className="text-muted font-bold text-[10px]">Valuation:</span>
                <span>{formatPriceWithCurrency(formData.purchase_cost, formData.currency)}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-bold text-xs h-10">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading || isUploading}
              className="px-6 py-2.5 rounded-xl font-black text-xs h-10 shadow-lg shadow-primary/20 flex items-center gap-1.5">
              <CheckCircle2 size={15} />
              <span>
                {isLoading ? 'Saving...' : initialData ? 'Update Asset' : 'Save to Inventory'}
              </span>
            </Button>
          </div>
        </div>
      </form>
    </Dialog>
  );
};
