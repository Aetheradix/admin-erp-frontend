import React, { useState } from 'react';
import {
  FileText,
  Building2,
  User,
  IndianRupee,
  Plus,
  Trash2,
  X,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Input } from '@/components/ui/composed/Input';
import type { InvoiceForm, InvoiceItem } from '../types/invoice.types';

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
}

interface SectionTitleProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  rightElement?: React.ReactNode;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ icon, title, description, rightElement }) => (
  <div className="flex items-center justify-between pb-2 border-b border-gray-100">
    <div className="flex items-center gap-2.5">
      <div className="p-2 bg-gray-100 text-gray-800 rounded-xl">{icon}</div>
      <div>
        <h2 className="text-base font-bold text-gray-900">{title}</h2>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </div>
    {rightElement}
  </div>
);

export const InvoiceFormModal: React.FC<InvoiceFormModalProps> = ({
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
}) => {
  const [showIssuerDetails, setShowIssuerDetails] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!visible) return null;

  const subTotal = form.items.reduce(
    (sum, item) => sum + Number(item.quantity || 0) * Number(item.rate || 0),
    0
  );

  const gstAmount = (subTotal * Number(form.gstRate || 0)) / 100;
  const total = subTotal + gstAmount;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!form.invoiceNumber?.trim()) {
      newErrors.invoiceNumber = 'Invoice number is required.';
    }
    if (!form.billToName?.trim()) {
      newErrors.billToName = 'Customer or company name is required.';
    }

    const hasInvalidItem = form.items.some(
      (item) => !item.description?.trim() || Number(item.quantity || 0) <= 0
    );
    if (hasInvalidItem) {
      newErrors.items = 'Please ensure all items have a description and quantity greater than zero.';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSubmit();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          onHide();
          setForm(emptyForm);
        }
      }}>
      <div className="bg-white w-full max-w-5xl max-h-[92vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-black text-white flex items-center justify-center">
              <FileText size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900">Create Tax Invoice</h1>
                <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-gray-100 text-gray-800 border border-gray-200">
                  {form.invoiceNumber || 'NEW'}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                Enter billing information, items, and tax breakdown.
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => {
              onHide();
              setForm(emptyForm);
            }}
            className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-gray-100 transition disabled:opacity-50">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleFormSubmit} noValidate className="overflow-y-auto flex-1 p-6 space-y-6">
          {Object.keys(errors).length > 0 && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-700 text-sm font-medium">
              <AlertCircle size={20} className="shrink-0 text-red-500" />
              <span>Please fill all required fields and check line items.</span>
            </div>
          )}

          {/* Section 1: Invoice Specifications */}
          <section className="space-y-4">
            <SectionTitle
              icon={<FileText size={18} />}
              title="Invoice Specifications"
              description="Basic numbers, timeline, and jurisdiction."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <Input
                label="Invoice Number"
                value={form.invoiceNumber}
                onChange={(e) => updateField('invoiceNumber', e.target.value)}
                error={errors.invoiceNumber}
                required
                placeholder="e.g. INV-2026-005"
              />

              <Input
                label="Invoice Date"
                type="date"
                value={form.invoiceDate}
                onChange={(e) => updateField('invoiceDate', e.target.value)}
                required
              />

              <Input
                label="Due Date"
                type="date"
                value={form.dueDate}
                onChange={(e) => updateField('dueDate', e.target.value)}
              />

              <Input
                label="Place of Supply"
                value={form.placeOfSupply}
                onChange={(e) => updateField('placeOfSupply', e.target.value)}
                placeholder="e.g. Madhya Pradesh"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GST Rate (%)
                </label>
                <select
                  value={String(form.gstRate)}
                  onChange={(e) => updateField('gstRate', Number(e.target.value))}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black">
                  <option value="0">0% (Nil / Exempt)</option>
                  <option value="5">5% (Concessional)</option>
                  <option value="12">12% (Standard Lower)</option>
                  <option value="18">18% (Standard Services Default)</option>
                  <option value="28">28% (Luxury / Higher)</option>
                </select>
              </div>
            </div>
          </section>

          {/* Section 2: Bill To (Customer Details) */}
          <section className="space-y-4">
            <SectionTitle
              icon={<User size={18} />}
              title="Customer Details (Bill To)"
              description="Recipient company or client receiving the invoice."
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Input
                  label="Customer / Company Name"
                  value={form.billToName}
                  onChange={(e) => updateField('billToName', e.target.value)}
                  error={errors.billToName}
                  required
                  placeholder="e.g. Acme Corporation Pvt Ltd"
                />
              </div>

              <Input
                label="Client GSTIN (Optional)"
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
            </div>
          </section>

          {/* Section 3: Issuer Business Details */}
          <section className="space-y-4">
            <SectionTitle
              icon={<Building2 size={18} />}
              title="Issuer Business Details"
              description="Organization issuing this tax invoice."
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowIssuerDetails(!showIssuerDetails)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-black hover:underline cursor-pointer">
                  {showIssuerDetails ? 'Collapse Details' : 'Edit Issuer Details'}
                  {showIssuerDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              }
            />

            {!showIssuerDetails ? (
              <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 flex flex-wrap items-center gap-3 text-xs text-gray-600 font-medium">
                <span>
                  <strong>Company:</strong> {form.companyName || 'Aetheradix Private Limited'}
                </span>
                <span>•</span>
                <span>
                  <strong>GSTIN:</strong> {form.companyGSTIN || '23ABDCA8625L1ZJ'}
                </span>
                <span>•</span>
                <span>
                  <strong>Address:</strong> {form.companyCity || 'Bhopal'}, {form.companyState || 'Madhya Pradesh'}
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-200 animate-in fade-in duration-200">
                <Input
                  label="Company Name"
                  value={form.companyName}
                  onChange={(e) => updateField('companyName', e.target.value)}
                />
                <Input
                  label="Contact Person"
                  value={form.companyContact}
                  onChange={(e) => updateField('companyContact', e.target.value)}
                />
                <Input
                  label="Company GSTIN"
                  value={form.companyGSTIN}
                  onChange={(e) => updateField('companyGSTIN', e.target.value)}
                />
                <div className="md:col-span-2">
                  <Input
                    label="Company Address"
                    value={form.companyAddress}
                    onChange={(e) => updateField('companyAddress', e.target.value)}
                  />
                </div>
                <Input
                  label="City"
                  value={form.companyCity}
                  onChange={(e) => updateField('companyCity', e.target.value)}
                />
                <Input
                  label="State"
                  value={form.companyState}
                  onChange={(e) => updateField('companyState', e.target.value)}
                />
                <Input
                  label="Pincode"
                  value={form.companyPincode}
                  onChange={(e) => updateField('companyPincode', e.target.value)}
                />
                <Input
                  label="Country"
                  value={form.companyCountry}
                  onChange={(e) => updateField('companyCountry', e.target.value)}
                />
              </div>
            )}
          </section>

          {/* Section 4: Invoice Line Items */}
          <section className="space-y-4">
            <SectionTitle
              icon={<IndianRupee size={18} />}
              title="Invoice Line Items"
              description="Add deliverables, professional services, or products."
            />

            {errors.items && (
              <p className="text-xs text-red-500 font-medium">{errors.items}</p>
            )}

            <div className="bg-gray-50/70 p-4 rounded-2xl border border-gray-200">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-3">
                <span className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                  <IndianRupee size={16} className="text-emerald-600" /> Billed Items
                </span>
                <button
                  type="button"
                  onClick={addItem}
                  className="text-xs text-black font-semibold flex items-center gap-1 hover:underline cursor-pointer">
                  <Plus size={14} /> Add Line Item
                </button>
              </div>

              <div className="space-y-3">
                {form.items.map((item, idx) => {
                  const lineTotal = Number(item.quantity || 0) * Number(item.rate || 0);

                  return (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center bg-white p-2.5 rounded-xl border border-gray-200">
                      <input
                        type="text"
                        placeholder="Item Description / Professional Service"
                        value={item.description}
                        onChange={(e) => updateItem(idx, 'description', e.target.value)}
                        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:border-black outline-none bg-white font-medium"
                      />

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] text-gray-500 font-medium sm:hidden">Qty:</span>
                          <input
                            type="number"
                            min="1"
                            placeholder="Qty"
                            value={item.quantity || ''}
                            onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))}
                            className="w-20 border border-gray-200 rounded-lg px-2.5 py-2 text-xs text-center font-mono focus:border-black outline-none bg-white"
                          />
                        </div>

                        <div className="flex items-center gap-1">
                          <span className="text-[11px] text-gray-500 font-medium sm:hidden">Rate:</span>
                          <input
                            type="number"
                            min="0"
                            placeholder="Rate (₹)"
                            value={item.rate || ''}
                            onChange={(e) => updateItem(idx, 'rate', Number(e.target.value))}
                            className="w-28 border border-gray-200 rounded-lg px-2.5 py-2 text-xs text-right font-mono focus:border-black outline-none bg-white"
                          />
                        </div>

                        <div className="w-28 text-right font-mono font-bold text-xs text-gray-900 px-2 shrink-0">
                          ₹{lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>

                        {form.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(idx)}
                            className="text-gray-400 hover:text-red-500 transition p-1.5 cursor-pointer">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Items Subtotal Footer */}
              <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between font-bold text-xs text-gray-900">
                <span>Subtotal (Excl. Tax)</span>
                <span className="font-mono">₹{subTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </section>

          {/* Section 5: Calculation Summary & Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <SectionTitle
                icon={<FileText size={18} />}
                title="Notes & Payment Terms"
                description="Optional terms displayed on the invoice."
              />
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                placeholder="e.g. Thank you for your business. Payment is due within 15 days."
                className="mt-3 w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:ring-2 focus:ring-black resize-none"
              />
            </div>

            <div className="bg-gray-50/80 border border-gray-200 rounded-2xl p-4.5 flex flex-col justify-between space-y-3">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center text-gray-600">
                  <span>Sub Total (Taxable Value)</span>
                  <span className="font-mono font-semibold text-gray-900">
                    ₹{subTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center text-gray-600">
                  <span>GST ({form.gstRate}%)</span>
                  <span className="font-mono font-semibold text-gray-900">
                    ₹{gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-3 flex justify-between items-baseline">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block">
                    Total Amount Due
                  </span>
                  <span className="text-[11px] text-gray-400">Includes all applicable taxes</span>
                </div>
                <span className="text-2xl font-black font-mono text-gray-900">
                  ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Net Amount Banner - Matching Payroll Pattern */}
          <div className="p-4 rounded-2xl bg-black text-white flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-400 font-medium">Total Invoice Amount</p>
              <p className="text-xl font-bold font-mono mt-0.5">
                ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </form>

        {/* Sticky Modal Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 sticky bottom-0 shrink-0">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => {
              onHide();
              setForm(emptyForm);
            }}
            className="px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition disabled:opacity-50 cursor-pointer">
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleFormSubmit}
            className="px-6 py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:bg-gray-800 transition flex items-center gap-2 disabled:opacity-50 shadow-xs cursor-pointer">
            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
            {isSubmitting ? 'Creating Invoice...' : 'Create Invoice'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceFormModal;
