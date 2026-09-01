import React from 'react';
import { FileText, Building2, User, IndianRupee, Plus, Trash2 } from 'lucide-react';
import { Dialog } from '@/components/ui/composed/Dialog';
import { Input } from '@/components/ui/primitives/Input';
import { Button } from '@/components/ui/primitives/Button';
import type { InvoiceForm, InvoiceItem } from '../types/invoice.types';

interface InvoiceFormModalProps {
  visible: boolean;
  onHide: () => void;
  form: InvoiceForm;
  updateField: <K extends keyof InvoiceForm>(field: K, value: InvoiceForm[K]) => void;
  updateItem: (index: number, field: keyof InvoiceItem, value: string | number) => void;
  addItem: () => void;
  removeItem: (index: number) => void;
  onSubmit: () => void;
  emptyForm: InvoiceForm;
  setForm: (form: InvoiceForm) => void;
}

export function SectionTitle({
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
      <div className="w-10 h-10 rounded-xl bg-surface-subtle flex items-center justify-center text-primary">
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export function Field({
  label,
  className = '',
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
}) {
  return (
    <div className={className}>
      <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em] block mb-2">
        {label}
      </label>
      <input
        {...props}
        className="w-full border border-border-subtle rounded-xl px-4 py-2.5 bg-surface text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 font-medium"
      />
    </div>
  );
}

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
}) => {
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

  return (
    <Dialog
      visible={visible}
      onHide={() => {
        onHide();
        setForm(emptyForm);
      }}
      header="Create Invoice"
      modal
      className="w-[95vw] max-w-[1600px] mx-auto"
      contentClassName="p-0"
      headerClassName="px-8 pt-7 pb-5 text-2xl font-black tracking-tight border-none"
      pt={{
        root: {
          className: 'rounded-[32px] overflow-hidden border-none shadow-2xl bg-surface-elevated',
        },
        mask: {
          className: 'backdrop-blur-md bg-black/40',
        },
      }}
    >
      <div className="max-h-[78vh] overflow-y-auto">
        <div className="px-8 pb-8 space-y-8">
          <section>
            <SectionTitle
              icon={<FileText size={18} />}
              title="Invoice Details"
              description="Basic information about this invoice."
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
              <Field
                label="Invoice Number"
                value={form.invoiceNumber}
                onChange={(e) => updateField('invoiceNumber', e.target.value)}
              />

              <Field
                label="Invoice Date"
                type="date"
                value={form.invoiceDate}
                onChange={(e) => updateField('invoiceDate', e.target.value)}
              />

              <Field
                label="Due Date"
                type="date"
                value={form.dueDate}
                onChange={(e) => updateField('dueDate', e.target.value)}
              />

              <Field
                label="Place of Supply"
                value={form.placeOfSupply}
                onChange={(e) => updateField('placeOfSupply', e.target.value)}
              />

              <Field
                label="GST Rate (%)"
                type="number"
                value={String(form.gstRate)}
                onChange={(e) => updateField('gstRate', Number(e.target.value))}
              />
            </div>
          </section>

          <section>
            <SectionTitle
              icon={<Building2 size={18} />}
              title="Business Details"
              description="Information about the company issuing this invoice."
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
              <Field
                label="Company Name"
                value={form.companyName}
                onChange={(e) => updateField('companyName', e.target.value)}
              />

              <Field
                label="Contact Person"
                value={form.companyContact}
                onChange={(e) => updateField('companyContact', e.target.value)}
              />

              <Field
                label="GSTIN"
                value={form.companyGSTIN}
                onChange={(e) => updateField('companyGSTIN', e.target.value)}
              />

              <Field
                label="Address"
                value={form.companyAddress}
                onChange={(e) => updateField('companyAddress', e.target.value)}
                className="md:col-span-2"
              />

              <Field
                label="City"
                value={form.companyCity}
                onChange={(e) => updateField('companyCity', e.target.value)}
              />

              <Field
                label="State"
                value={form.companyState}
                onChange={(e) => updateField('companyState', e.target.value)}
              />

              <Field
                label="Country"
                value={form.companyCountry}
                onChange={(e) => updateField('companyCountry', e.target.value)}
              />

              <Field
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
              description="Customer or recipient information."
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
              <Field
                label="Customer / Company Name"
                value={form.billToName}
                onChange={(e) => updateField('billToName', e.target.value)}
                required
              />

              <Field
                label="GSTIN"
                value={form.billToGSTIN}
                onChange={(e) => updateField('billToGSTIN', e.target.value)}
              />

              <Field
                label="Address"
                value={form.billToAddress}
                onChange={(e) => updateField('billToAddress', e.target.value)}
              />

              <Field
                label="City"
                value={form.billToCity}
                onChange={(e) => updateField('billToCity', e.target.value)}
              />

              <Field
                label="State"
                value={form.billToState}
                onChange={(e) => updateField('billToState', e.target.value)}
              />

              <Field
                label="Country"
                value={form.billToCountry}
                onChange={(e) => updateField('billToCountry', e.target.value)}
              />

              <Field
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

            <div className="mt-5 border border-border-subtle rounded-2xl overflow-hidden">
              <div className="bg-surface-subtle text-foreground px-4 py-3 hidden md:grid grid-cols-[1fr_120px_160px_160px_50px] gap-3 text-xs font-black uppercase tracking-wider">
                <span>Description</span>
                <span>Qty</span>
                <span>Rate</span>
                <span>Amount</span>
                <span />
              </div>

              <div className="p-4 space-y-3">
                {form.items.map((item, index) => {
                  const itemAmount = Number(item.quantity || 0) * Number(item.rate || 0);

                  return (
                    <div
                      key={index}
                      className="grid grid-cols-1 md:grid-cols-[1fr_120px_160px_160px_50px] gap-3 items-center"
                    >
                      <div>
                        <label className="text-xs text-muted-foreground md:hidden">
                          Description
                        </label>
                        <Input
                          placeholder="Software Development Service"
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                        />
                      </div>

                      <Input
                        type="number"
                        min="1"
                        value={String(item.quantity)}
                        onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                      />

                      <Input
                        type="number"
                        min="0"
                        value={String(item.rate)}
                        onChange={(e) => updateItem(index, 'rate', Number(e.target.value))}
                      />

                      <div className="font-bold text-foreground px-2">
                        {formatCurrency(itemAmount)}
                      </div>

                      <button
                        type="button"
                        disabled={form.items.length === 1}
                        onClick={() => removeItem(index)}
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-muted hover:text-error hover:bg-error/10 disabled:opacity-30 cursor-pointer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })}

                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-border-strong text-xs font-bold text-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer"
                >
                  <Plus size={16} />
                  Add Item
                </button>
              </div>
            </div>
          </section>

          <div className="flex justify-end">
            <div className="w-full md:w-[380px] bg-surface-subtle border border-border-subtle rounded-2xl p-5 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sub Total</span>
                <span className="font-semibold">{formatCurrency(subTotal)}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">GST ({form.gstRate}%)</span>
                <span className="font-semibold">{formatCurrency(gstAmount)}</span>
              </div>

              <div className="border-t border-border-subtle pt-3 flex justify-between">
                <span className="text-lg font-bold text-foreground">Total</span>
                <span className="text-2xl font-black text-foreground">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          <section>
            <SectionTitle
              icon={<FileText size={18} />}
              title="Notes"
              description="Optional message displayed on the invoice."
            />

            <textarea
              value={form.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              rows={3}
              className="mt-5 w-full border border-border-subtle rounded-xl px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 resize-none bg-surface text-foreground font-medium"
              placeholder="Thank you for your business"
            />
          </section>
        </div>

        <div className="sticky bottom-0 bg-surface-elevated border-t border-border-subtle px-8 py-4 flex justify-between items-center">
          <div>
            <span className="text-xs text-muted-foreground block font-medium">Invoice Total</span>
            <span className="text-xl font-black text-foreground">{formatCurrency(total)}</span>
          </div>

          <div className="flex gap-3">
            <Button
              variant="ghost"
              label="Cancel"
              onClick={() => {
                onHide();
                setForm(emptyForm);
              }}
              className="rounded-xl!"
            />

            <Button
              label="Create Invoice"
              icon="pi pi-check"
              onClick={onSubmit}
              className="rounded-xl! px-8!"
            />
          </div>
        </div>
      </div>
    </Dialog>
  );
};
