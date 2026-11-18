import { Phone, Search, UserPlus } from 'lucide-react';
import { Input } from '@/components/ui/composed/Input';
import type { Vendor } from '@/store/api/financeApiSlice';

interface VendorSearchFieldProps {
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  billToName: string;
  error?: string;
  isOpen: boolean;
  onOpen: () => void;
  onChange: (value: string) => void;
  vendors: Vendor[];
  exactMatch: Vendor | null;
  onSelectVendor: (vendor: Vendor) => void;
  onCreateNewVendor: () => void;
}

export function VendorSearchField({
  dropdownRef,
  billToName,
  error,
  isOpen,
  onOpen,
  onChange,
  vendors,
  exactMatch,
  onSelectVendor,
  onCreateNewVendor,
}: VendorSearchFieldProps) {
  return (
    <div ref={dropdownRef} className="relative md:col-span-2">
      <Input
        label="Vendor / Customer Name"
        value={billToName}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onOpen}
        error={error}
        required
        placeholder="e.g. Acme Corporation Pvt Ltd (type to search database)"
      />

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-[100] max-h-72 overflow-y-auto bg-white rounded-2xl shadow-2xl border border-gray-200 p-2 space-y-1">
          {vendors.length > 0 ? (
            <>
              <div className="flex items-center justify-between px-3 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Search size={12} /> Database Vendors ({vendors.length})
                </span>
                <span className="text-[10px] text-gray-400 font-normal">Click to autofill</span>
              </div>
              {vendors.map((vendor) => (
                <button
                  key={vendor.vendor_id || vendor.id}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onSelectVendor(vendor)}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-gray-50 flex items-start justify-between gap-3 transition group">
                  <div>
                    <div className="text-sm font-semibold text-gray-900 group-hover:text-black flex items-center gap-2">
                      <span>{vendor.vendor_name || vendor.name}</span>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 border border-gray-200">
                        {vendor.vendor_type || 'Company'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
                      {(vendor.vendor_phoneNo || vendor.vendor_phone_no || vendor.phone) && (
                        <span className="flex items-center gap-1 text-gray-700">
                          <Phone size={11} className="text-gray-400" />
                          {vendor.vendor_phoneNo || vendor.vendor_phone_no || vendor.phone}
                        </span>
                      )}
                      {(vendor.vendor_city || vendor.city) && (
                        <span>📍 {vendor.vendor_city || vendor.city}</span>
                      )}
                      {(vendor.vendor_gstin || vendor.gstin) && (
                        <span className="font-mono text-[11px]">
                          GST: {vendor.vendor_gstin || vendor.gstin}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition">
                    Autofill ↵
                  </span>
                </button>
              ))}
            </>
          ) : (
            <div className="px-4 py-3 text-xs text-gray-500 text-center">
              No registered vendor matching &quot;{billToName}&quot;
            </div>
          )}

          {!exactMatch && billToName?.trim() && (
            <div className="pt-1 mt-1 border-t border-gray-100">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={onCreateNewVendor}
                className="w-full text-left px-3.5 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100/80 text-blue-900 flex items-center justify-between transition font-medium text-xs">
                <span className="flex items-center gap-2">
                  <UserPlus size={15} className="text-blue-600 shrink-0" />
                  <span>
                    Create new vendor <strong>&quot;{billToName}&quot;</strong> in database
                  </span>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white font-bold text-[10px] shrink-0">
                  + Add New
                </span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
