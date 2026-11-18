import { IndianRupee, Plus, Trash2 } from 'lucide-react';
import type { InvoiceItem } from '../../types';
import type { InvoiceFormErrors } from '../../formValidation';
import { SectionTitle } from './SectionTitle';

interface LineItemsSectionProps {
  items: InvoiceItem[];
  errors: InvoiceFormErrors;
  subTotal: number;
  onAddItem: () => void;
  onUpdateItem: (index: number, field: keyof InvoiceItem, value: string | number) => void;
  onRemoveItem: (index: number) => void;
}

export function LineItemsSection({
  items,
  errors,
  subTotal,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
}: LineItemsSectionProps) {
  return (
    <section className="space-y-4">
      <SectionTitle
        icon={<IndianRupee size={18} />}
        title="Invoice Line Items"
        description="Add deliverables, professional services, or products."
      />

      {errors.items && <p className="text-xs text-red-500 font-medium">{errors.items}</p>}

      <div className="bg-gray-50/70 p-4 rounded-2xl border border-gray-200">
        <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-3">
          <span className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
            <IndianRupee size={16} className="text-emerald-600" /> Billed Items
          </span>
          <button
            type="button"
            onClick={onAddItem}
            className="text-xs text-black font-semibold flex items-center gap-1 hover:underline cursor-pointer">
            <Plus size={14} /> Add Line Item
          </button>
        </div>

        <div className="space-y-3">
          {items.map((item, index) => {
            const lineTotal = Number(item.quantity || 0) * Number(item.rate || 0);

            return (
              <div
                key={index}
                className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center bg-white p-2.5 rounded-xl border border-gray-200">
                <input
                  type="text"
                  placeholder="Item Description / Professional Service"
                  value={item.description}
                  onChange={(e) => onUpdateItem(index, 'description', e.target.value)}
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
                      onChange={(e) => onUpdateItem(index, 'quantity', Number(e.target.value))}
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
                      onChange={(e) => onUpdateItem(index, 'rate', Number(e.target.value))}
                      className="w-28 border border-gray-200 rounded-lg px-2.5 py-2 text-xs text-right font-mono focus:border-black outline-none bg-white"
                    />
                  </div>

                  <div className="w-28 text-right font-mono font-bold text-xs text-gray-900 px-2 shrink-0">
                    ₹{lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>

                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onRemoveItem(index)}
                      className="text-gray-400 hover:text-red-500 transition p-1.5 cursor-pointer">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between font-bold text-xs text-gray-900">
          <span>Subtotal (Excl. Tax)</span>
          <span className="font-mono">
            ₹{subTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </section>
  );
}
