import { FormField } from '@/components/ui/composed/FormField';
import { Button } from '@/components/ui/primitives/Button';
import { Input } from '@/components/ui/primitives/Input';
import { Select } from '@/components/ui/primitives/Select';
import { Textarea } from '@/components/ui/primitives/Textarea';
import { Calendar } from '@/components/ui/primitives/Calendar';
import { useState } from 'react';
import { FileText } from 'lucide-react';
import type { Reimbursement } from '../hooks/mockFinance';

interface FinanceFormProps {
  onSubmit: (data: Partial<Reimbursement>) => void;
  onCancel: () => void;
}

const CATEGORIES = [
  { label: 'Travel', value: 'Travel' },
  { label: 'Equipment', value: 'Equipment' },
  { label: 'Software', value: 'Software' },
  { label: 'Meals', value: 'Meals' },
  { label: 'Medical', value: 'Medical' },
  { label: 'Office Supplies', value: 'Office Supplies' },
];

export const FinanceForm = ({ onSubmit, onCancel }: FinanceFormProps) => {
  const [formData, setFormData] = useState<Partial<Reimbursement>>({
    item: '',
    category: 'Equipment',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    description: '',
  });

  const handleApply = () => {
    if (!formData.item || !formData.amount) return;
    onSubmit({
      ...formData,
      status: 'Pending',
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col gap-6">
          <FormField label="Item / Expense Name" required id="finance-item">
            <Input 
              id="finance-item"
              value={formData.item} 
              onChange={(e) => setFormData({ ...formData, item: e.target.value })}
              placeholder="e.g. Ergonomic Keyboard" 
            />
          </FormField>

          <FormField label="Category" required id="finance-category">
            <Select 
              id="finance-category"
              options={CATEGORIES}
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.value })}
              placeholder="Select category"
            />
          </FormField>

          <FormField label="Description / Justification" required id="finance-description">
            <Textarea 
              id="finance-description"
              value={formData.description} 
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Briefly explain the intent of this acquisition..." 
              rows={4}
            />
          </FormField>
        </div>

        <div className="flex flex-col gap-6">
          <FormField label="Amount ($)" required id="finance-amount">
            <Input 
              id="finance-amount"
              type="number"
              value={formData.amount?.toString() || ''} 
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
              placeholder="0.00" 
            />
          </FormField>

          <FormField label="Expense Date" required id="finance-date">
            <Calendar 
              id="finance-date"
              value={formData.date ? new Date(formData.date) : null}
              onChange={(e) => setFormData({ ...formData, date: e.value?.toISOString().split('T')[0] || '' })}
              placeholder="Select date" 
              dateFormat="yy-mm-dd"
            />
          </FormField>

          <div className="mt-4 p-6 rounded-3xl bg-surface-subtle border border-dashed border-border-strong flex flex-col gap-4">
            <span className="text-xs font-black text-muted uppercase tracking-widest">Evidence Upload</span>
            <div className="flex flex-col items-center justify-center py-6 gap-3">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm">
                <FileText size={20} />
              </div>
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider cursor-pointer hover:underline text-center">
                Click to upload receipt or proof of purchase
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-6 border-t border-border-subtle">
        <Button 
          variant="ghost" 
          onClick={onCancel} 
          className="px-8! rounded-3xl! font-bold text-muted!"
          aria-label="Discard changes"
        >
          Discard
        </Button>
        <Button 
          variant="primary" 
          onClick={handleApply}
          className="px-10! h-12 rounded-3xl! font-black tracking-wide shadow-lg shadow-primary/20"
          aria-label="Submit reimbursement request"
        >
          Submit Request
        </Button>
      </div>
    </div>
  );
};
