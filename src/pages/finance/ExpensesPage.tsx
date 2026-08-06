import { useState } from 'react';
import { PageHeader } from '@/components/ui/composed/PageHeader';
import { Receipt } from 'lucide-react';
import { motion } from 'framer-motion';
import { Dialog } from '@/components/ui/composed/Dialog';
import { Input } from '@/components/ui/primitives/Input';
import { Select } from '@/components/ui/primitives/Select';
import { Button } from '@/components/ui/primitives/Button';

interface Expense {
  id: number;
  category: string;
  description: string;
  amount: number;
  status: string;
}

const EXPENSE_CATEGORIES = [
  { label: 'Hardware', value: 'Hardware' },
  { label: 'Food & Drink', value: 'Food & Drink' },
  { label: 'Utilities', value: 'Utilities' },
  { label: 'Subscriptions', value: 'Subscriptions' },
  { label: 'Travel', value: 'Travel' },
  { label: 'Office Supplies', value: 'Office Supplies' },
];

const initialExpenses: Expense[] = [
  {
    id: 1,
    category: 'Hardware',
    description: 'MacBook Pro 16" - Engineering',
    amount: 2499,
    status: 'Approved',
  },
  {
    id: 2,
    category: 'Food & Drink',
    description: 'Team Lunch - Q2 Planning',
    amount: 120,
    status: 'Pending',
  },
  {
    id: 3,
    category: 'Utilities',
    description: 'Office Electricity - May',
    amount: 450,
    status: 'Approved',
  },
  {
    id: 4,
    category: 'Subscriptions',
    description: 'AWS Infrastructure',
    amount: 1560,
    status: 'Pending',
  },
];

const emptyForm = { category: '', description: '', amount: 0 };

export function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const handleSubmit = () => {
    if (!form.category || !form.description || !form.amount) return;
    const newExpense: Expense = {
      id: Date.now(),
      category: form.category,
      description: form.description,
      amount: form.amount,
      status: 'Pending',
    };
    setExpenses([newExpense, ...expenses]);
    setForm(emptyForm);
    setShowForm(false);
  };

  return (
    <div className="flex flex-col gap-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader
        title="Expenses"
        description="Track and manage organizational spending."
        breadcrumbs={[
          { label: 'Home', url: '/' },
          { label: 'Finance', url: '/finance' },
          { label: 'Expenses' },
        ]}
        primaryAction={{
          label: 'Record Expense',
          onClick: () => setShowForm(true),
          icon: 'pi pi-plus',
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {expenses.map((exp, i) => (
          <motion.div
            key={exp.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="bg-white rounded-[32px] border border-border-subtle shadow-soft p-8 group hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="w-12 h-12 rounded-2xl bg-surface-subtle flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                <Receipt size={24} />
              </div>
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${exp.status === 'Approved' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}
              >
                {exp.status}
              </span>
            </div>
            <div className="flex flex-col gap-1 mb-4">
              <h3 className="text-lg font-black text-foreground tracking-tight leading-tight">
                {exp.description}
              </h3>
              <span className="text-[10px] font-bold text-muted uppercase tracking-[0.1em]">
                {exp.category}
              </span>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-border-subtle/50">
              <span className="text-xl font-black text-foreground">
                ₹{exp.amount.toLocaleString()}
              </span>
              <button className="text-xs font-bold text-primary hover:underline">Details →</button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Record Expense Dialog */}
      <Dialog
        visible={showForm}
        onHide={() => setShowForm(false)}
        header="Record Expense"
        modal
        className="w-full max-w-xl mx-4"
        contentClassName="p-8"
        headerClassName="px-8 pt-8 pb-4 text-xl font-black tracking-tight border-none"
        pt={{
          root: { className: 'rounded-[32px] overflow-hidden border-none shadow-2xl bg-white' },
          mask: { className: 'backdrop-blur-md bg-black/40' },
        }}
      >
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
              Description
            </label>
            <Input
              placeholder="e.g. Team lunch for Q2 planning"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
                Category
              </label>
              <Select
                options={EXPENSE_CATEGORIES}
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.value })}
                placeholder="Select"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
                Amount (₹)
              </label>
              <Input
                type="number"
                placeholder="0"
                value={String(form.amount || '')}
                onChange={(e) => setForm({ ...form, amount: Number(e.target.value) || 0 })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
            <Button
              variant="ghost"
              label="Cancel"
              onClick={() => {
                setShowForm(false);
                setForm(emptyForm);
              }}
              className="rounded-xl!"
            />
            <Button
              label="Record Expense"
              onClick={handleSubmit}
              icon="pi pi-check"
              className="rounded-xl! px-8!"
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
