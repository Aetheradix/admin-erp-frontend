import { useState } from 'react';
import { AlertCircle, FileText, Loader2, X } from 'lucide-react';
import type { InvoiceForm, InvoiceItem } from '../types';
import { computeInvoiceTotals } from '../payloads';
import { validateInvoiceForm, type InvoiceFormErrors } from '../formValidation';
import { useVendorSelection } from '../hooks/useVendorSelection';
import { InvoiceSpecSection } from './form/InvoiceSpecSection';
import { IssuerSection } from './form/IssuerSection';
import { LineItemsSection } from './form/LineItemsSection';
import { InvoiceSummarySection } from './form/InvoiceSummarySection';
import { VendorSection } from './form/VendorSection';

interface InvoiceFormModalProps {
  visible: boolean;
  onHide: () => void;
  form: InvoiceForm;
  updateField: <K extends keyof InvoiceForm>(field: K, value: InvoiceForm[K]) => void;
  updateItem: (index: number, field: keyof InvoiceItem, value: string | number) => void;
  addItem: () => void;
  removeItem: (index: number) => void;
  onSubmit: () => Promise<void> | void;
  emptyForm: InvoiceForm;
  setForm: (form: InvoiceForm) => void;
  isSubmitting?: boolean;
  isEditing?: boolean;
}

export function InvoiceFormModal({
  visible,
  onHide,
  form,
  updateField,
  updateItem,
  addItem,
  removeItem,
  onSubmit,
  emptyForm,
  setForm,
  isSubmitting = false,
  isEditing = false,
}: InvoiceFormModalProps) {
  const [errors, setErrors] = useState<InvoiceFormErrors>({});
  const vendor = useVendorSelection({
    billToName: form.billToName,
    billToPhone: form.billToPhone,
    billToAddress: form.billToAddress,
    billToCity: form.billToCity,
    billToState: form.billToState,
    billToPincode: form.billToPincode,
    billToGSTIN: form.billToGSTIN,
    updateField,
    setErrors,
  });

  if (!visible) return null;

  const safeItems = Array.isArray(form?.items) ? form.items : [];
  const totals = computeInvoiceTotals(safeItems, Number(form?.gstRate || 0));

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors = validateInvoiceForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      onSubmit();
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setErrors({});
    vendor.setIsDropdownOpen(false);
    vendor.setShowExtraVendorDetails(() => false);
    vendor.setMatchedVendor(null);
    onHide();
    setForm(emptyForm);
  };

  return (
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}>
      <div className="bg-white w-full max-w-5xl max-h-[92vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-black text-white flex items-center justify-center">
              <FileText size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900">
                  {isEditing ? 'Edit Tax Invoice' : 'Create Tax Invoice'}
                </h1>
                <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-gray-100 text-gray-800 border border-gray-200">
                  {form.invoiceNumber || 'NEW'}
                </span>
                {isEditing && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Editing Mode
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">
                {isEditing
                  ? 'Update billing information, items, notes, or payment status.'
                  : 'Enter billing information, items, and tax breakdown.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleClose}
            className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-gray-100 transition disabled:opacity-50">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} noValidate className="overflow-y-auto flex-1 p-6 space-y-6">
          {Object.keys(errors).length > 0 && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-700 text-sm font-medium">
              <AlertCircle size={20} className="shrink-0 text-red-500" />
              <span>Please fill all required fields and check line items.</span>
            </div>
          )}

          <InvoiceSpecSection
            form={form}
            errors={errors}
            updateField={updateField}
            isEditing={isEditing}
          />

          <VendorSection form={form} errors={errors} updateField={updateField} vendor={vendor} />

          <IssuerSection form={form} updateField={updateField} />

          <LineItemsSection
            items={safeItems}
            errors={errors}
            subTotal={totals.subTotal}
            onAddItem={addItem}
            onUpdateItem={updateItem}
            onRemoveItem={removeItem}
          />

          <InvoiceSummarySection form={form} totals={totals} updateField={updateField} />
        </form>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 sticky bottom-0 shrink-0">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleClose}
            className="px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition disabled:opacity-50 cursor-pointer">
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleFormSubmit}
            className="px-6 py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:bg-gray-800 transition flex items-center gap-2 disabled:opacity-50 shadow-xs cursor-pointer">
            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
            {isSubmitting
              ? isEditing
                ? 'Updating Invoice...'
                : 'Creating Invoice...'
              : isEditing
                ? 'Update Invoice'
                : 'Create Invoice'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default InvoiceFormModal;
