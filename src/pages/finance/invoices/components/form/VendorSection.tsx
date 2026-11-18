import { CheckCircle2, User, UserPlus } from 'lucide-react';
import { Input } from '@/components/ui/composed/Input';
import type { Vendor } from '@/store/api/financeApiSlice';
import type { InvoiceForm } from '../../types';
import type { InvoiceFormErrors } from '../../formValidation';
import { SectionTitle } from './SectionTitle';
import { VendorSearchField } from './VendorSearchField';
import { VendorSavePanel } from './VendorSavePanel';

interface VendorSectionProps {
  form: InvoiceForm;
  errors: InvoiceFormErrors;
  updateField: <K extends keyof InvoiceForm>(field: K, value: InvoiceForm[K]) => void;
  vendor: {
    dropdownRef: React.RefObject<HTMLDivElement | null>;
    filteredVendors: Vendor[];
    exactVendorMatch: Vendor | null;
    matchedVendor: Vendor | null;
    isDropdownOpen: boolean;
    setIsDropdownOpen: (open: boolean) => void;
    isSavingVendor: boolean;
    showExtraVendorDetails: boolean;
    setShowExtraVendorDetails: (updater: (prev: boolean) => boolean) => void;
    newVendorCategory: string;
    setNewVendorCategory: (value: string) => void;
    newVendorType: string;
    setNewVendorType: (value: string) => void;
    newVendorEmail: string;
    setNewVendorEmail: (value: string) => void;
    setMatchedVendor: (vendor: Vendor | null) => void;
    handleSelectVendor: (vendor: Vendor) => void;
    handleCreateNewVendor: () => void;
  };
}

export function VendorSection({ form, errors, updateField, vendor }: VendorSectionProps) {
  const isVendorLinked = Boolean(vendor.exactVendorMatch || vendor.matchedVendor);

  return (
    <section className="space-y-4">
      <SectionTitle
        icon={<User size={18} />}
        title="Vendor / Customer Details (Bill To)"
        description="Recipient company or vendor receiving the invoice."
        rightElement={
          isVendorLinked ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 size={14} className="text-emerald-600" />
              Database Vendor Linked
            </span>
          ) : form.billToName?.trim() ? (
            <button
              type="button"
              onClick={() => vendor.setShowExtraVendorDetails((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition">
              <UserPlus size={13} />
              New Vendor
            </button>
          ) : null
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <VendorSearchField
          dropdownRef={vendor.dropdownRef}
          billToName={form.billToName}
          error={errors.billToName}
          isOpen={vendor.isDropdownOpen}
          onOpen={() => vendor.setIsDropdownOpen(true)}
          onChange={(value) => {
            updateField('billToName', value);
            vendor.setIsDropdownOpen(true);
            vendor.setMatchedVendor(null);
          }}
          vendors={vendor.filteredVendors}
          exactMatch={vendor.exactVendorMatch}
          onSelectVendor={vendor.handleSelectVendor}
          onCreateNewVendor={() => {
            vendor.setIsDropdownOpen(false);
            vendor.setShowExtraVendorDetails(() => true);
          }}
        />

        <div>
          <Input
            label="Vendor Phone Number"
            value={form.billToPhone || ''}
            onChange={(e) => updateField('billToPhone', e.target.value)}
            error={errors.billToPhone}
            required
            placeholder="e.g. +91 98765 43210"
          />
        </div>

        <Input
          label="Vendor / Client GSTIN (Optional)"
          value={form.billToGSTIN}
          onChange={(e) => updateField('billToGSTIN', e.target.value.toUpperCase())}
          placeholder="e.g. 23AAAAA0000A1Z5"
        />

        <div className="md:col-span-2">
          <Input
            label="Billing Address"
            value={form.billToAddress}
            onChange={(e) => updateField('billToAddress', e.target.value)}
            placeholder="Office suite, building, street"
          />
        </div>

        <Input
          label="City"
          value={form.billToCity}
          onChange={(e) => updateField('billToCity', e.target.value)}
          placeholder="e.g. Bhopal"
        />

        <Input
          label="State"
          value={form.billToState}
          onChange={(e) => updateField('billToState', e.target.value)}
          placeholder="e.g. Madhya Pradesh"
        />

        <Input
          label="Pincode"
          value={form.billToPincode}
          onChange={(e) => updateField('billToPincode', e.target.value)}
          placeholder="e.g. 462001"
        />

        <Input
          label="Country"
          value={form.billToCountry}
          onChange={(e) => updateField('billToCountry', e.target.value)}
          placeholder="India"
        />

        {form.billToName?.trim() && !vendor.exactVendorMatch && (
          <VendorSavePanel
            vendorName={form.billToName}
            showExtraDetails={vendor.showExtraVendorDetails}
            onToggleExtraDetails={() => vendor.setShowExtraVendorDetails((prev) => !prev)}
            onSave={vendor.handleCreateNewVendor}
            isSaving={vendor.isSavingVendor}
            email={vendor.newVendorEmail}
            onEmailChange={vendor.setNewVendorEmail}
            category={vendor.newVendorCategory}
            onCategoryChange={vendor.setNewVendorCategory}
            vendorType={vendor.newVendorType}
            onVendorTypeChange={vendor.setNewVendorType}
          />
        )}
      </div>
    </section>
  );
}
