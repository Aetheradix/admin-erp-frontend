import { FileText } from 'lucide-react';
import type { InvoiceForm, InvoiceTotals } from '../../types';
import { SectionTitle } from './SectionTitle';

interface InvoiceSummarySectionProps {
  form: InvoiceForm;
  totals: InvoiceTotals;
  updateField: <K extends keyof InvoiceForm>(field: K, value: InvoiceForm[K]) => void;
}

export function InvoiceSummarySection({
  form,
  totals,
  updateField,
}: InvoiceSummarySectionProps) {
  return (
    <>
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
                ₹{totals.subTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center text-gray-600">
              <span>GST ({form.gstRate}%)</span>
              <span className="font-mono font-semibold text-gray-900">
                ₹{totals.gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
              ₹{totals.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-black text-white flex justify-between items-center">
        <div>
          <p className="text-xs text-gray-400 font-medium">Total Invoice Amount</p>
          <p className="text-xl font-bold font-mono mt-0.5">
            ₹{totals.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </>
  );
}
