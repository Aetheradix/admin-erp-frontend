import { useState } from 'react';
import { X, Plus, Trash2, FileText, Building2, User, IndianRupee, AlertCircle } from 'lucide-react';

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
}

export interface InvoiceFormData {
  invoiceNumber: string;

  invoiceDate: string;
  dueDate: string;
  placeOfSupply: string;

  companyName: string;
  companyContact: string;
  companyAddress: string;
  companyCity: string;
  companyState: string;
  companyCountry: string;
  companyPincode: string;
  companyGSTIN: string;

  billToName: string;
  billToAddress: string;
  billToCity: string;
  billToState: string;
  billToCountry: string;
  billToPincode: string;
  billToGSTIN: string;

  items: InvoiceItem[];

  gstRate: number;
  notes: string;
}

interface InvoiceFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: InvoiceFormData) => void;
}

const initialForm: InvoiceFormData = {
  invoiceNumber: 'INV-2604A011',

  invoiceDate: '2026-04-07',
  dueDate: '2026-04-15',
  placeOfSupply: 'Madhya Pradesh',

  companyName: 'Aetheradix Private Limited',
  companyContact: 'Pratyush Shrivastava',
  companyAddress: 'F-N 507, Crystal Tower, IBD Kings Park',
  companyCity: 'Bawadia Kalan, Bhopal',
  companyState: 'Madhya Pradesh',
  companyCountry: 'India',
  companyPincode: '462039',
  companyGSTIN: '23ABDCA8625L1ZJ',

  billToName: 'SFA Technologies Private Limited',
  billToAddress: 'SFA Tower, Sector-A, Kasturba Nagar',
  billToCity: 'Bhopal',
  billToState: 'Madhya Pradesh',
  billToCountry: 'India',
  billToPincode: '',
  billToGSTIN: '',

  items: [
    {
      description: 'Software Development Service',
      quantity: 1,
      rate: 1000,
    },
  ],

  gstRate: 18,

  notes: 'Thank you for your business',
};

// Validation Patterns
const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i;
const PINCODE_REGEX = /^[1-9][0-9]{5}$/;

export default function InvoiceFormModal({ open, onClose, onSubmit }: InvoiceFormModalProps) {
  const [form, setForm] = useState<InvoiceFormData>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [, setTouched] = useState<Record<string, boolean>>({});

  if (!open) return null;

  // Validation Routine
  const validate = (data: InvoiceFormData): Record<string, string> => {
    const errs: Record<string, string> = {};

    // Invoice Details
    if (!data.invoiceNumber.trim()) {
      errs.invoiceNumber = 'Invoice number is required.';
    }
    if (!data.invoiceDate) {
      errs.invoiceDate = 'Invoice date is required.';
    }
    if (!data.dueDate) {
      errs.dueDate = 'Due date is required.';
    } else if (data.invoiceDate && new Date(data.dueDate) < new Date(data.invoiceDate)) {
      errs.dueDate = 'Due date cannot be prior to invoice date.';
    }
    if (!data.placeOfSupply.trim()) {
      errs.placeOfSupply = 'Place of supply is required.';
    }
    if (isNaN(data.gstRate) || data.gstRate < 0 || data.gstRate > 100) {
      errs.gstRate = 'GST Rate must be between 0% and 100%.';
    }

    // Company Details
    if (!data.companyName.trim()) {
      errs.companyName = 'Company name is required.';
    }
    if (data.companyGSTIN.trim() && !GSTIN_REGEX.test(data.companyGSTIN.trim())) {
      errs.companyGSTIN = 'Enter a valid 15-character GSTIN (e.g. 23ABDCA8625L1ZJ).';
    }
    if (data.companyPincode.trim() && !PINCODE_REGEX.test(data.companyPincode.trim())) {
      errs.companyPincode = 'Pincode must be 6 digits.';
    }

    // Bill To Details
    if (!data.billToName.trim()) {
      errs.billToName = 'Customer / Company name is required.';
    }
    if (data.billToGSTIN.trim() && !GSTIN_REGEX.test(data.billToGSTIN.trim())) {
      errs.billToGSTIN = 'Enter a valid 15-character GSTIN.';
    }
    if (data.billToPincode.trim() && !PINCODE_REGEX.test(data.billToPincode.trim())) {
      errs.billToPincode = 'Pincode must be 6 digits.';
    }

    // Line Items Validation
    if (!data.items || data.items.length === 0) {
      errs.items = 'At least one item is required.';
    } else {
      data.items.forEach((item, index) => {
        if (!item.description.trim()) {
          errs[`item_${index}_description`] = 'Description is required.';
        }
        if (isNaN(item.quantity) || item.quantity <= 0) {
          errs[`item_${index}_quantity`] = 'Qty must be > 0.';
        }
        if (isNaN(item.rate) || item.rate < 0) {
          errs[`item_${index}_rate`] = 'Rate must be ≥ 0.';
        }
      });
    }

    return errs;
  };

  const updateField = <K extends keyof InvoiceFormData>(field: K, value: InvoiceFormData[K]) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field as string]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field as string];
        return next;
      });
    }
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      ),
    }));

    const key = `item_${index}_${field}`;
    if (errors[key] || errors.items) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        delete next.items;
        return next;
      });
    }
  };

  const addItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          description: '',
          quantity: 1,
          rate: 0,
        },
      ],
    }));

    if (errors.items) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.items;
        return next;
      });
    }
  };

  const removeItem = (index: number) => {
    setForm((prev) => {
      const filtered = prev.items.filter((_, i) => i !== index);
      const currentErrors = validate({ ...prev, items: filtered });
      setErrors(currentErrors);

      return {
        ...prev,
        items: filtered,
      };
    });
  };

  const markBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const subTotal = form.items.reduce(
    (sum, item) => sum + Number(item.quantity || 0) * Number(item.rate || 0),
    0
  );

  const gstAmount = (subTotal * Number(form.gstRate || 0)) / 100;
  const total = subTotal + gstAmount;

  const formatCurrency = (value: number) =>
    `₹${value.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validate(form);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const formNode = e.currentTarget as HTMLElement;
      formNode.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    onSubmit?.(form);
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Expanded Max Width Container (max-w-7xl) */}
      <div className="bg-white w-[98vw] max-w-[1800px] max-h-[94vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-black text-white flex items-center justify-center shadow-sm">
              <FileText size={20} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900">Create Invoice</h2>
              <p className="text-xs sm:text-sm text-gray-500">
                Enter invoice, customer, itemized breakdown and billing details.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} noValidate className="flex-1 overflow-y-auto">
          <div className="p-6 sm:p-8 lg:p-10 space-y-8">
            {/* Global Error Banner */}
            {hasErrors && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-700 text-sm font-medium">
                <AlertCircle size={20} className="shrink-0 text-red-500" />
                <span>Please fix the highlighted errors before submitting the invoice.</span>
              </div>
            )}

            {/* Invoice Details Section - Single row 5-column layout on wide screens */}
            <section>
              <SectionTitle
                icon={<FileText size={18} />}
                title="Invoice Details"
                description="Basic metadata, issuance details, and taxation percentages."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-5">
                <Input
                  label="Invoice Number"
                  value={form.invoiceNumber}
                  onChange={(e) => updateField('invoiceNumber', e.target.value)}
                  onBlur={() => markBlur('invoiceNumber')}
                  placeholder="INV-2604A011"
                  error={errors.invoiceNumber}
                  required
                />

                <Input
                  label="Invoice Date"
                  type="date"
                  value={form.invoiceDate}
                  onChange={(e) => updateField('invoiceDate', e.target.value)}
                  onBlur={() => markBlur('invoiceDate')}
                  error={errors.invoiceDate}
                  required
                />

                <Input
                  label="Due Date"
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => updateField('dueDate', e.target.value)}
                  onBlur={() => markBlur('dueDate')}
                  error={errors.dueDate}
                  required
                />

                <Input
                  label="Place of Supply"
                  value={form.placeOfSupply}
                  onChange={(e) => updateField('placeOfSupply', e.target.value)}
                  onBlur={() => markBlur('placeOfSupply')}
                  placeholder="Madhya Pradesh"
                  error={errors.placeOfSupply}
                  required
                />

                <Input
                  label="GST Rate (%)"
                  type="number"
                  min="0"
                  max="100"
                  value={form.gstRate}
                  onChange={(e) => updateField('gstRate', Number(e.target.value))}
                  onBlur={() => markBlur('gstRate')}
                  error={errors.gstRate}
                />
              </div>
            </section>

            {/* Business Details Section - 4 Column Layout */}
            <section>
              <SectionTitle
                icon={<Building2 size={18} />}
                title="Business Details"
                description="Information about your company issuing the invoice."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
                <Input
                  label="Company Name"
                  value={form.companyName}
                  onChange={(e) => updateField('companyName', e.target.value)}
                  onBlur={() => markBlur('companyName')}
                  error={errors.companyName}
                  required
                />

                <Input
                  label="Contact Person"
                  value={form.companyContact}
                  onChange={(e) => updateField('companyContact', e.target.value)}
                />

                <Input
                  label="GSTIN"
                  value={form.companyGSTIN}
                  onChange={(e) => updateField('companyGSTIN', e.target.value)}
                  onBlur={() => markBlur('companyGSTIN')}
                  placeholder="23ABDCA8625L1ZJ"
                  error={errors.companyGSTIN}
                />

                <Input
                  label="Pincode"
                  value={form.companyPincode}
                  onChange={(e) => updateField('companyPincode', e.target.value)}
                  onBlur={() => markBlur('companyPincode')}
                  error={errors.companyPincode}
                />

                <Input
                  label="Address"
                  value={form.companyAddress}
                  onChange={(e) => updateField('companyAddress', e.target.value)}
                  className="lg:col-span-2"
                />

                <Input
                  label="City / Area"
                  value={form.companyCity}
                  onChange={(e) => updateField('companyCity', e.target.value)}
                />

                <Input
                  label="State & Country"
                  value={`${form.companyState}${form.companyCountry ? `, ${form.companyCountry}` : ''}`}
                  onChange={(e) => {
                    const [state = '', country = ''] = e.target.value
                      .split(',')
                      .map((s) => s.trim());
                    updateField('companyState', state);
                    if (country) updateField('companyCountry', country);
                  }}
                  placeholder="State, Country"
                />
              </div>
            </section>

            {/* Bill To Section - 4 Column Layout */}
            <section>
              <SectionTitle
                icon={<User size={18} />}
                title="Bill To"
                description="Enter the client or customer billing details."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
                <Input
                  label="Customer / Company Name"
                  value={form.billToName}
                  onChange={(e) => updateField('billToName', e.target.value)}
                  onBlur={() => markBlur('billToName')}
                  error={errors.billToName}
                  required
                />

                <Input
                  label="GSTIN"
                  value={form.billToGSTIN}
                  onChange={(e) => updateField('billToGSTIN', e.target.value)}
                  onBlur={() => markBlur('billToGSTIN')}
                  placeholder="Optional"
                  error={errors.billToGSTIN}
                />

                <Input
                  label="Pincode"
                  value={form.billToPincode}
                  onChange={(e) => updateField('billToPincode', e.target.value)}
                  onBlur={() => markBlur('billToPincode')}
                  error={errors.billToPincode}
                />

                <Input
                  label="Address"
                  value={form.billToAddress}
                  onChange={(e) => updateField('billToAddress', e.target.value)}
                />

                <Input
                  label="City / Area"
                  value={form.billToCity}
                  onChange={(e) => updateField('billToCity', e.target.value)}
                />

                <Input
                  label="State"
                  value={form.billToState}
                  onChange={(e) => updateField('billToState', e.target.value)}
                />

                <Input
                  label="Country"
                  value={form.billToCountry}
                  onChange={(e) => updateField('billToCountry', e.target.value)}
                />
              </div>
            </section>

            {/* Invoice Items Section - Spacious Table Layout */}
            <section>
              <SectionTitle
                icon={<IndianRupee size={18} />}
                title="Invoice Items"
                description="Add itemized products or services being billed."
              />

              {errors.items && (
                <p className="text-xs font-semibold text-red-500 mt-2">{errors.items}</p>
              )}

              <div className="mt-5 border border-gray-200 rounded-2xl overflow-x-auto bg-white shadow-sm">
                <div className="min-w-[768px]">
                  {/* Table Header */}
                  <div className="grid grid-cols-[1fr_140px_180px_180px_52px] gap-4 bg-gray-900 text-white px-5 py-3.5 text-xs font-semibold uppercase tracking-wider">
                    <span>Description</span>
                    <span>Quantity</span>
                    <span>Rate (₹)</span>
                    <span className="text-right pr-4">Amount</span>
                    <span />
                  </div>

                  {/* Table Rows */}
                  <div className="p-4 space-y-3">
                    {form.items.map((item, index) => {
                      const amount = Number(item.quantity || 0) * Number(item.rate || 0);
                      const descErr = errors[`item_${index}_description`];
                      const qtyErr = errors[`item_${index}_quantity`];
                      const rateErr = errors[`item_${index}_rate`];

                      return (
                        <div
                          key={index}
                          className="grid grid-cols-[1fr_140px_180px_180px_52px] gap-4 items-center bg-gray-50/50 p-2.5 rounded-xl border border-gray-100"
                        >
                          {/* Description */}
                          <div>
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => updateItem(index, 'description', e.target.value)}
                              placeholder="Service or Product Description"
                              className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-sm outline-none transition ${
                                descErr
                                  ? 'border-red-500 focus:border-red-500'
                                  : 'border-gray-200 focus:border-black'
                              }`}
                            />
                            {descErr && <p className="mt-1 text-xs text-red-500">{descErr}</p>}
                          </div>

                          {/* Quantity */}
                          <div>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.quantity}
                              onChange={(e) =>
                                updateItem(index, 'quantity', Number(e.target.value))
                              }
                              className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-sm outline-none transition ${
                                qtyErr
                                  ? 'border-red-500 focus:border-red-500'
                                  : 'border-gray-200 focus:border-black'
                              }`}
                            />
                            {qtyErr && <p className="mt-1 text-xs text-red-500">{qtyErr}</p>}
                          </div>

                          {/* Rate */}
                          <div>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.rate}
                              onChange={(e) => updateItem(index, 'rate', Number(e.target.value))}
                              className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-sm outline-none transition ${
                                rateErr
                                  ? 'border-red-500 focus:border-red-500'
                                  : 'border-gray-200 focus:border-black'
                              }`}
                            />
                            {rateErr && <p className="mt-1 text-xs text-red-500">{rateErr}</p>}
                          </div>

                          {/* Line Total */}
                          <div className="text-right pr-4 font-bold text-gray-900 text-base">
                            {formatCurrency(amount)}
                          </div>

                          {/* Remove Button */}
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            disabled={form.items.length === 1}
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:hover:bg-transparent transition"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      );
                    })}

                    <button
                      type="button"
                      onClick={addItem}
                      className="mt-3 flex items-center gap-2 px-5 py-2.5 rounded-xl border border-dashed border-gray-300 text-sm font-semibold text-gray-700 hover:border-black hover:text-black hover:bg-gray-50 transition"
                    >
                      <Plus size={16} />
                      Add Line Item
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Totals Summary & Notes Section Side by Side on Large Screens */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Notes Section */}
              <div className="lg:col-span-7">
                <SectionTitle
                  icon={<FileText size={18} />}
                  title="Notes & Payment Terms"
                  description="Optional instructions or bank details displayed on the invoice."
                />

                <textarea
                  value={form.notes}
                  onChange={(e) => updateField('notes', e.target.value)}
                  rows={4}
                  className="mt-4 w-full border border-gray-200 rounded-xl p-3.5 text-sm outline-none focus:border-black resize-none"
                  placeholder="Thank you for your business..."
                />
              </div>

              {/* Totals Summary */}
              <div className="lg:col-span-5 bg-gray-50 border border-gray-200 rounded-2xl p-6 space-y-4 shadow-sm">
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-2">
                  Invoice Summary
                </h4>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sub Total</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(subTotal)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">GST ({form.gstRate}%)</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(gstAmount)}</span>
                </div>

                <div className="border-t border-gray-300 pt-3.5 flex justify-between items-baseline">
                  <span className="text-base font-bold text-gray-900">Total Amount</span>
                  <span className="text-2xl font-black text-gray-900">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 sm:px-8 py-4 flex items-center justify-between shrink-0 z-10 shadow-lg">
            <div className="hidden sm:flex items-baseline gap-2">
              <span className="text-sm text-gray-500">Invoice Total:</span>
              <span className="text-xl font-black text-gray-900">{formatCurrency(total)}</span>
            </div>

            <div className="flex items-center gap-3 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:bg-gray-800 transition flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                <FileText size={17} />
                Create Invoice
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// Reusable Input Field Component
function Input({
  label,
  error,
  className = '',
  required,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <input
        {...props}
        className={`w-full border rounded-xl px-3.5 py-2.5 text-sm outline-none transition ${
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/20'
            : 'border-gray-200 focus:border-black focus:ring-1 focus:ring-black/10'
        }`}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function SectionTitle({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-800 shrink-0">
        {icon}
      </div>

      <div>
        <h3 className="font-bold text-gray-900 text-base">{title}</h3>
        <p className="text-xs sm:text-sm text-gray-500">{description}</p>
      </div>
    </div>
  );
}
