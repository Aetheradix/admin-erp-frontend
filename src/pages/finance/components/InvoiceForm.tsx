import { useState } from 'react';
import { X, Plus, Trash2, FileText, Building2, User, IndianRupee } from 'lucide-react';

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

export default function InvoiceFormModal({ open, onClose, onSubmit }: InvoiceFormModalProps) {
  const [form, setForm] = useState<InvoiceFormData>(initialForm);

  if (!open) return null;

  const updateField = <K extends keyof InvoiceFormData>(field: K, value: InvoiceFormData[K]) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
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
  };

  const removeItem = (index: number) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
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

    onSubmit?.(form);
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white w-full max-w-6xl max-h-[92vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-black text-white flex items-center justify-center">
              <FileText size={20} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900">Create Invoice</h2>

              <p className="text-sm text-gray-500">Enter invoice, customer and billing details.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-gray-100 transition"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-8">
            <section>
              <SectionTitle
                icon={<FileText size={18} />}
                title="Invoice Details"
                description="Basic information about this invoice."
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <Input
                  label="Invoice Number"
                  value={form.invoiceNumber}
                  onChange={(e) => updateField('invoiceNumber', e.target.value)}
                  placeholder="INV-2604A011"
                  required
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
                  required
                />

                <Input
                  label="Place of Supply"
                  value={form.placeOfSupply}
                  onChange={(e) => updateField('placeOfSupply', e.target.value)}
                  placeholder="Madhya Pradesh"
                  required
                />

                <Input
                  label="GST Rate (%)"
                  type="number"
                  min="0"
                  max="100"
                  value={form.gstRate}
                  onChange={(e) => updateField('gstRate', Number(e.target.value))}
                />
              </div>
            </section>

            <section>
              <SectionTitle
                icon={<Building2 size={18} />}
                title="Business Details"
                description="Information about the company issuing the invoice."
              />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                <Input
                  label="Company Name"
                  value={form.companyName}
                  onChange={(e) => updateField('companyName', e.target.value)}
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
                  placeholder="23ABDCA8625L1ZJ"
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
                  label="State"
                  value={form.companyState}
                  onChange={(e) => updateField('companyState', e.target.value)}
                />

                <Input
                  label="Country"
                  value={form.companyCountry}
                  onChange={(e) => updateField('companyCountry', e.target.value)}
                />

                <Input
                  label="Pincode"
                  value={form.companyPincode}
                  onChange={(e) => updateField('companyPincode', e.target.value)}
                />
              </div>
            </section>

            <section>
              <SectionTitle
                icon={<User size={18} />}
                title="Bill To"
                description="Enter the customer or recipient details."
              />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                <Input
                  label="Customer / Company Name"
                  value={form.billToName}
                  onChange={(e) => updateField('billToName', e.target.value)}
                  required
                />

                <Input
                  label="GSTIN"
                  value={form.billToGSTIN}
                  onChange={(e) => updateField('billToGSTIN', e.target.value)}
                  placeholder="Optional"
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

                <Input
                  label="Pincode"
                  value={form.billToPincode}
                  onChange={(e) => updateField('billToPincode', e.target.value)}
                />
              </div>
            </section>

            <section>
              <SectionTitle
                icon={<IndianRupee size={18} />}
                title="Invoice Items"
                description="Add products or services being billed."
              />

              <div className="mt-4 border border-gray-200 rounded-2xl overflow-hidden">
                {/* ITEMS HEADER */}
                <div className="hidden md:grid grid-cols-[1fr_120px_160px_160px_50px] gap-3 bg-gray-900 text-white px-4 py-3 text-sm font-semibold">
                  <span>Description</span>
                  <span>Quantity</span>
                  <span>Rate</span>
                  <span>Amount</span>
                  <span />
                </div>

                <div className="p-4 space-y-3">
                  {form.items.map((item, index) => {
                    const amount = Number(item.quantity || 0) * Number(item.rate || 0);

                    return (
                      <div
                        key={index}
                        className="grid grid-cols-1 md:grid-cols-[1fr_120px_160px_160px_50px] gap-3 items-center"
                      >
                        <div>
                          <label className="md:hidden text-xs text-gray-500 mb-1 block">
                            Description
                          </label>

                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                            placeholder="Software Development Service"
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-black"
                            required
                          />
                        </div>

                        <div>
                          <label className="md:hidden text-xs text-gray-500 mb-1 block">
                            Quantity
                          </label>

                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-black"
                          />
                        </div>

                        <div>
                          <label className="md:hidden text-xs text-gray-500 mb-1 block">Rate</label>

                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.rate}
                            onChange={(e) => updateItem(index, 'rate', Number(e.target.value))}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-black"
                          />
                        </div>

                        <div className="px-3 font-semibold text-gray-900">
                          {formatCurrency(amount)}
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          disabled={form.items.length === 1}
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:hover:bg-transparent"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    );
                  })}

                  <button
                    type="button"
                    onClick={addItem}
                    className="mt-2 flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-gray-300 text-sm font-semibold text-gray-600 hover:border-black hover:text-black transition"
                  >
                    <Plus size={16} />
                    Add Item
                  </button>
                </div>
              </div>
            </section>

            <section className="flex justify-end">
              <div className="w-full md:w-[400px] bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sub Total</span>

                  <span className="font-medium">{formatCurrency(subTotal)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">GST ({form.gstRate}%)</span>

                  <span className="font-medium">{formatCurrency(gstAmount)}</span>
                </div>

                <div className="border-t border-gray-300 pt-3 flex justify-between">
                  <span className="text-lg font-bold">Total</span>

                  <span className="text-2xl font-bold">{formatCurrency(total)}</span>
                </div>
              </div>
            </section>

            <section>
              <SectionTitle
                icon={<FileText size={18} />}
                title="Notes"
                description="Optional message displayed at the bottom of the invoice."
              />

              <textarea
                value={form.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                rows={3}
                className="mt-4 w-full border border-gray-200 rounded-xl px-3 py-3 text-sm outline-none focus:border-black resize-none"
                placeholder="Thank you for your business"
              />
            </section>
          </div>

          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="hidden sm:block">
              <span className="text-sm text-gray-500">Invoice Total</span>

              <span className="ml-3 text-lg font-bold">{formatCurrency(total)}</span>
            </div>

            <div className="flex items-center gap-3 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:bg-gray-800 transition flex items-center gap-2"
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

function Input({
  label,
  className = '',
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>

      <input
        {...props}
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black/10 transition"
      />
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
      <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700">
        {icon}
      </div>

      <div>
        <h3 className="font-bold text-gray-900">{title}</h3>

        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  );
}
