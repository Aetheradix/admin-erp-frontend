import { Loader2, Plus, UserPlus } from 'lucide-react';
import { VENDOR_CATEGORY_OPTIONS, VENDOR_TYPE_OPTIONS } from '../../constants';

interface VendorSavePanelProps {
  vendorName: string;
  showExtraDetails: boolean;
  onToggleExtraDetails: () => void;
  onSave: () => void;
  isSaving: boolean;
  email: string;
  onEmailChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  vendorType: string;
  onVendorTypeChange: (value: string) => void;
}

export function VendorSavePanel({
  vendorName,
  showExtraDetails,
  onToggleExtraDetails,
  onSave,
  isSaving,
  email,
  onEmailChange,
  category,
  onCategoryChange,
  vendorType,
  onVendorTypeChange,
}: VendorSavePanelProps) {
  return (
    <div className="col-span-full bg-gradient-to-r from-blue-50/90 to-indigo-50/70 border border-blue-200/80 rounded-2xl p-4 space-y-3 animate-in fade-in duration-150">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <UserPlus size={18} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-gray-900">
              Save &quot;{vendorName}&quot; to Vendor Database?
            </h3>
            <p className="text-[11px] text-gray-600">
              Store this vendor in the database so their phone number, GSTIN, and address autofill
              automatically next time.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleExtraDetails}
            className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-white hover:bg-blue-100 border border-blue-200 rounded-xl transition">
            {showExtraDetails ? 'Fewer Fields' : 'More Fields'}
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-sm disabled:opacity-50">
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Save Vendor to Database
          </button>
        </div>
      </div>

      {showExtraDetails && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-blue-200/60">
          <div>
            <label className="block text-[11px] font-medium text-gray-700 mb-1">
              Vendor Email (Optional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder="contact@vendor.com"
              className="w-full text-xs rounded-xl border border-gray-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-700 mb-1">
              Vendor Category
            </label>
            <select
              value={category}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full text-xs rounded-xl border border-gray-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              {VENDOR_CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-700 mb-1">Vendor Type</label>
            <select
              value={vendorType}
              onChange={(e) => onVendorTypeChange(e.target.value)}
              className="w-full text-xs rounded-xl border border-gray-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              {VENDOR_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
