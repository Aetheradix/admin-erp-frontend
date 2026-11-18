import { FileText } from 'lucide-react';
import { Input } from '@/components/ui/composed/Input';
import { GST_RATE_OPTIONS, INVOICE_STATUS_OPTIONS } from '../../constants';
import type { InvoiceForm, InvoiceStatus } from '../../types';
import type { InvoiceFormErrors } from '../../formValidation';
import { SectionTitle } from './SectionTitle';

interface InvoiceSpecSectionProps {
  form: InvoiceForm;
  errors: InvoiceFormErrors;
  updateField: <K extends keyof InvoiceForm>(field: K, value: InvoiceForm[K]) => void;
  isEditing: boolean;
}

export function InvoiceSpecSection({
  form,
  errors,
  updateField,
  isEditing,
}: InvoiceSpecSectionProps) {
  return (
    <section className="space-y-4">
      <SectionTitle
        icon={<FileText size={18} />}
        title="Invoice Specifications"
        description="Basic numbers, timeline, and jurisdiction."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <Input
            label="Invoice Number"
            value={form.invoiceNumber}
            onChange={(e) => updateField('invoiceNumber', e.target.value)}
            error={errors.invoiceNumber}
            required
            disabled={isEditing}
            placeholder="e.g. INV-2026-005"
          />
          {isEditing && (
            <p className="text-[10px] text-gray-500 mt-1">Invoice ID is locked during editing</p>
          )}
        </div>

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
          <label className="block text-sm font-medium text-gray-700 mb-1">GST Rate (%)</label>
          <select
            value={String(form.gstRate)}
            onChange={(e) => updateField('gstRate', Number(e.target.value))}
            className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black">
            {GST_RATE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
          <select
            value={form.status || 'Pending'}
            onChange={(e) => updateField('status', e.target.value as InvoiceStatus)}
            className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black">
            {INVOICE_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}
