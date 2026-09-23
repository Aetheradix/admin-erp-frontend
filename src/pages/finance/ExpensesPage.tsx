// import { useState } from 'react';
// import { PageHeader } from '@/components/ui/composed/PageHeader';
// import { Receipt } from 'lucide-react';
// import { motion } from 'framer-motion';
// import { Dialog } from '@/components/ui/composed/Dialog';
// import { Input } from '@/components/ui/primitives/Input';
// import { Select } from '@/components/ui/primitives/Select';
// import { Button } from '@/components/ui/primitives/Button';

// interface Expense {
//   id: number;
//   category: string;
//   description: string;
//   amount: number;
//   status: string;
// }

// const EXPENSE_CATEGORIES = [
//   { label: 'Hardware', value: 'Hardware' },
//   { label: 'Food & Drink', value: 'Food & Drink' },
//   { label: 'Utilities', value: 'Utilities' },
//   { label: 'Subscriptions', value: 'Subscriptions' },
//   { label: 'Travel', value: 'Travel' },
//   { label: 'Office Supplies', value: 'Office Supplies' },
// ];

// const initialExpenses: Expense[] = [
//   {
//     id: 1,
//     category: 'Hardware',
//     description: 'MacBook Pro 16" - Engineering',
//     amount: 2499,
//     status: 'Approved',
//   },
//   {
//     id: 2,
//     category: 'Food & Drink',
//     description: 'Team Lunch - Q2 Planning',
//     amount: 120,
//     status: 'Pending',
//   },
//   {
//     id: 3,
//     category: 'Utilities',
//     description: 'Office Electricity - May',
//     amount: 450,
//     status: 'Approved',
//   },
//   {
//     id: 4,
//     category: 'Subscriptions',
//     description: 'AWS Infrastructure',
//     amount: 1560,
//     status: 'Pending',
//   },
// ];

// const emptyForm = { category: '', description: '', amount: 0 };

// export function ExpensesPage() {
//   const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
//   const [showForm, setShowForm] = useState(false);
//   const [form, setForm] = useState(emptyForm);

//   const handleSubmit = () => {
//     if (!form.category || !form.description || !form.amount) return;
//     const newExpense: Expense = {
//       id: Date.now(),
//       category: form.category,
//       description: form.description,
//       amount: form.amount,
//       status: 'Pending',
//     };
//     setExpenses([newExpense, ...expenses]);
//     setForm(emptyForm);
//     setShowForm(false);
//   };

//   return (
//     <div className="flex flex-col gap-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
//       <PageHeader
//         title="Expenses"
//         description="Track and manage organizational spending."
//         breadcrumbs={[
//           { label: 'Home', url: '/' },
//           { label: 'Finance', url: '/finance' },
//           { label: 'Expenses' },
//         ]}
//         primaryAction={{
//           label: 'Record Expense',
//           onClick: () => setShowForm(true),
//           icon: 'pi pi-plus',
//         }}
//       />

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {expenses.map((exp, i) => (
//           <motion.div
//             key={exp.id}
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.4, delay: i * 0.1 }}
//             className="bg-white rounded-[32px] border border-border-subtle shadow-soft p-8 group hover:shadow-lg transition-all duration-300">
//             <div className="flex items-start justify-between mb-6">
//               <div className="w-12 h-12 rounded-2xl bg-surface-subtle flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
//                 <Receipt size={24} />
//               </div>
//               <span
//                 className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${exp.status === 'Approved' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
//                 {exp.status}
//               </span>
//             </div>
//             <div className="flex flex-col gap-1 mb-4">
//               <h3 className="text-lg font-black text-foreground tracking-tight leading-tight">
//                 {exp.description}
//               </h3>
//               <span className="text-[10px] font-bold text-muted uppercase tracking-[0.1em]">
//                 {exp.category}
//               </span>
//             </div>
//             <div className="flex items-center justify-between pt-4 border-t border-border-subtle/50">
//               <span className="text-xl font-black text-foreground">
//                 ₹{exp.amount.toLocaleString()}
//               </span>
//               <button className="text-xs font-bold text-primary hover:underline">Details →</button>
//             </div>
//           </motion.div>
//         ))}
//       </div>

//       {/* Record Expense Dialog */}
//       <Dialog
//         visible={showForm}
//         onHide={() => setShowForm(false)}
//         header="Record Expense"
//         modal
//         className="w-full max-w-xl mx-4"
//         contentClassName="p-8"
//         headerClassName="px-8 pt-8 pb-4 text-xl font-black tracking-tight border-none"
//         pt={{
//           root: { className: 'rounded-[32px] overflow-hidden border-none shadow-2xl bg-white' },
//           mask: { className: 'backdrop-blur-md bg-black/40' },
//         }}>
//         <div className="flex flex-col gap-5">
//           <div className="flex flex-col gap-2">
//             <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
//               Description
//             </label>
//             <Input
//               placeholder="e.g. Team lunch for Q2 planning"
//               value={form.description}
//               onChange={(e) => setForm({ ...form, description: e.target.value })}
//             />
//           </div>
//           <div className="grid grid-cols-2 gap-4">
//             <div className="flex flex-col gap-2">
//               <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
//                 Category
//               </label>
//               <Select
//                 options={EXPENSE_CATEGORIES}
//                 value={form.category}
//                 onChange={(e) => setForm({ ...form, category: e.value })}
//                 placeholder="Select"
//               />
//             </div>
//             <div className="flex flex-col gap-2">
//               <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
//                 Amount (₹)
//               </label>
//               <Input
//                 type="number"
//                 placeholder="0"
//                 value={String(form.amount || '')}
//                 onChange={(e) => setForm({ ...form, amount: Number(e.target.value) || 0 })}
//               />
//             </div>
//           </div>
//           <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
//             <Button
//               variant="ghost"
//               label="Cancel"
//               onClick={() => {
//                 setShowForm(false);
//                 setForm(emptyForm);
//               }}
//               className="rounded-xl!"
//             />
//             <Button
//               label="Record Expense"
//               onClick={handleSubmit}
//               icon="pi pi-check"
//               className="rounded-xl! px-8!"
//             />
//           </div>
//         </div>
//       </Dialog>
//     </div>
//   );
// }

import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/ui/composed/PageHeader';
import {
  Receipt,
  Search,
  Filter,
  Download,
  LayoutGrid,
  List,
  Plus,
  CreditCard,
  Calendar,
  User,
  Building2,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  FileText,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog } from '@/components/ui/composed/Dialog';
import { Input } from '@/components/ui/primitives/Input';
import { Select } from '@/components/ui/primitives/Select';
import { Button } from '@/components/ui/primitives/Button';

/* =========================================================
   TYPES & CONSTANTS
========================================================= */

export type ExpenseStatus = 'Approved' | 'Pending' | 'Rejected' | 'Reimbursed';

export interface Expense {
  id: string | number;
  employeeName: string;
  department: string;
  category: string;
  merchant: string;
  description: string;
  amount: number;
  date: string;
  status: ExpenseStatus;
  paymentMethod: 'Company Card' | 'Personal (Reimbursement)' | 'Corporate Invoice';
  receiptUrl?: string;
}

const EXPENSE_CATEGORIES = [
  { label: 'All Categories', value: 'ALL' },
  { label: 'Hardware', value: 'Hardware' },
  { label: 'Software & Cloud', value: 'Software & Cloud' },
  { label: 'Food & Dining', value: 'Food & Dining' },
  { label: 'Utilities', value: 'Utilities' },
  { label: 'Travel & Transport', value: 'Travel & Transport' },
  { label: 'Office Supplies', value: 'Office Supplies' },
  { label: 'Marketing', value: 'Marketing' },
];

const DEPARTMENTS = [
  { label: 'Engineering', value: 'Engineering' },
  { label: 'Product & Design', value: 'Product & Design' },
  { label: 'Sales & Marketing', value: 'Sales & Marketing' },
  { label: 'Operations & HR', value: 'Operations & HR' },
  { label: 'Finance & Legal', value: 'Finance & Legal' },
];

const PAYMENT_METHODS = [
  { label: 'Company Card', value: 'Company Card' },
  { label: 'Personal (Reimbursement)', value: 'Personal (Reimbursement)' },
  { label: 'Corporate Invoice', value: 'Corporate Invoice' },
];

const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'EXP-1001',
    employeeName: 'Sarah Jenkins',
    department: 'Engineering',
    category: 'Hardware',
    merchant: 'Apple Store',
    description: 'MacBook Pro 16" M3 Max - Dev Setup',
    amount: 2499,
    date: '2026-09-18',
    status: 'Approved',
    paymentMethod: 'Company Card',
    receiptUrl: 'https://example.com/receipt-1001.pdf',
  },
  {
    id: 'EXP-1002',
    employeeName: 'Rahul Sharma',
    department: 'Sales & Marketing',
    category: 'Food & Dining',
    merchant: 'Taj Hotel',
    description: 'Quarterly Client Appreciation Dinner',
    amount: 320,
    date: '2026-09-21',
    status: 'Pending',
    paymentMethod: 'Personal (Reimbursement)',
    receiptUrl: 'https://example.com/receipt-1002.pdf',
  },
  {
    id: 'EXP-1003',
    employeeName: 'Elena Rostova',
    department: 'Operations & HR',
    category: 'Utilities',
    merchant: 'Power Grid Co.',
    description: 'HQ Electricity & HVAC Bill - Aug',
    amount: 1450,
    date: '2026-09-15',
    status: 'Reimbursed',
    paymentMethod: 'Corporate Invoice',
  },
  {
    id: 'EXP-1004',
    employeeName: 'Alex Mercer',
    department: 'Engineering',
    category: 'Software & Cloud',
    merchant: 'Amazon Web Services',
    description: 'Production Infrastructure Monthly Billing',
    amount: 4560,
    date: '2026-09-01',
    status: 'Approved',
    paymentMethod: 'Company Card',
  },
  {
    id: 'EXP-1005',
    employeeName: 'Priya Nair',
    department: 'Product & Design',
    category: 'Software & Cloud',
    merchant: 'Figma Inc.',
    description: 'Annual Enterprise Seats Renewal',
    amount: 840,
    date: '2026-09-10',
    status: 'Pending',
    paymentMethod: 'Company Card',
  },
  {
    id: 'EXP-1006',
    employeeName: 'David Kim',
    department: 'Sales & Marketing',
    category: 'Travel & Transport',
    merchant: 'Delta Airlines',
    description: 'Flight to Tech Summit NYC',
    amount: 680,
    date: '2026-09-22',
    status: 'Rejected',
    paymentMethod: 'Personal (Reimbursement)',
  },
];

const emptyForm = {
  employeeName: '',
  department: 'Engineering',
  category: 'Hardware',
  merchant: '',
  description: '',
  amount: '',
  date: new Date().toISOString().split('T')[0],
  paymentMethod: 'Company Card' as Expense['paymentMethod'],
  receiptUrl: '',
};

/* =========================================================
   MAIN EXPENSES PAGE COMPONENT
========================================================= */

export function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [showForm, setShowForm] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [form, setForm] = useState(emptyForm);

  // Filters & View States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  /* ---------- Computed KPI Analytics ---------- */
  const stats = useMemo(() => {
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const pending = expenses
      .filter((e) => e.status === 'Pending')
      .reduce((sum, e) => sum + e.amount, 0);
    const approved = expenses
      .filter((e) => e.status === 'Approved' || e.status === 'Reimbursed')
      .reduce((sum, e) => sum + e.amount, 0);
    const count = expenses.length;

    return { total, pending, approved, count };
  }, [expenses]);

  /* ---------- Filtered Expense Items ---------- */
  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      const matchesSearch =
        exp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.id.toString().toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === 'ALL' || exp.category === selectedCategory;

      const matchesStatus = selectedStatus === 'ALL' || exp.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [expenses, searchQuery, selectedCategory, selectedStatus]);

  /* ---------- Handle Submitting New Expense ---------- */
  const handleSubmit = () => {
    if (!form.description || !form.amount || !form.merchant) return;

    const newExpense: Expense = {
      id: `EXP-${Math.floor(1000 + Math.random() * 9000)}`,
      employeeName: form.employeeName || 'Current User',
      department: form.department,
      category: form.category,
      merchant: form.merchant,
      description: form.description,
      amount: Number(form.amount) || 0,
      date: form.date,
      status: 'Pending',
      paymentMethod: form.paymentMethod,
      receiptUrl: form.receiptUrl || undefined,
    };

    setExpenses([newExpense, ...expenses]);
    setForm(emptyForm);
    setShowForm(false);
  };

  /* ---------- Export CSV Handler ---------- */
  const handleExportCSV = () => {
    const headers = [
      'ID,Employee,Department,Merchant,Category,Description,Amount,Date,Status,Payment Method',
    ];
    const rows = filteredExpenses.map(
      (e) =>
        `"${e.id}","${e.employeeName}","${e.department}","${e.merchant}","${e.category}","${e.description}",${e.amount},"${e.date}","${e.status}","${e.paymentMethod}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `company_expenses_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: ExpenseStatus) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-200';
      case 'Reimbursed':
        return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'Pending':
        return 'bg-amber-500/10 text-amber-600 border-amber-200';
      case 'Rejected':
        return 'bg-rose-500/10 text-rose-600 border-rose-200';
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <PageHeader
        title="Company Expenses"
        description="Comprehensive expense tracking, reimbursement claims, and financial compliance."
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

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-[24px] border border-border-subtle p-6 shadow-soft flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold text-muted uppercase tracking-[0.15em]">
              Total Spend
            </p>
            <h4 className="text-2xl font-black text-foreground mt-1">
              ₹{stats.total.toLocaleString()}
            </h4>
            <span className="text-[11px] text-muted font-medium mt-1 inline-block">
              Across {stats.count} recorded transactions
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <TrendingUp size={22} />
          </div>
        </div>

        <div className="bg-white rounded-[24px] border border-border-subtle p-6 shadow-soft flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold text-amber-600 uppercase tracking-[0.15em]">
              Pending Approval
            </p>
            <h4 className="text-2xl font-black text-foreground mt-1">
              ₹{stats.pending.toLocaleString()}
            </h4>
            <span className="text-[11px] text-amber-600/80 font-medium mt-1 inline-block">
              Awaiting manager review
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <Clock size={22} />
          </div>
        </div>

        <div className="bg-white rounded-[24px] border border-border-subtle p-6 shadow-soft flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-[0.15em]">
              Approved & Settled
            </p>
            <h4 className="text-2xl font-black text-foreground mt-1">
              ₹{stats.approved.toLocaleString()}
            </h4>
            <span className="text-[11px] text-emerald-600/80 font-medium mt-1 inline-block">
              Ready for payout / settled
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="bg-white rounded-[24px] border border-border-subtle p-6 shadow-soft flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold text-muted uppercase tracking-[0.15em]">
              Primary Category
            </p>
            <h4 className="text-xl font-black text-foreground mt-1 truncate max-w-[140px]">
              Software & Cloud
            </h4>
            <span className="text-[11px] text-muted font-medium mt-1 inline-block">
              Top operational cost
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-surface-subtle text-foreground flex items-center justify-center">
            <Receipt size={22} />
          </div>
        </div>
      </div>

      {/* Filter & Control Bar */}
      <div className="bg-white rounded-[24px] border border-border-subtle p-4 shadow-soft flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search merchant, employee, claim..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface-subtle border border-transparent rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-primary transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <Select
            options={EXPENSE_CATEGORIES}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.value)}
            className="text-xs h-9"
          />

          <Select
            options={[
              { label: 'All Statuses', value: 'ALL' },
              { label: 'Approved', value: 'Approved' },
              { label: 'Pending', value: 'Pending' },
              { label: 'Reimbursed', value: 'Reimbursed' },
              { label: 'Rejected', value: 'Rejected' },
            ]}
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.value)}
            className="text-xs h-9"
          />

          <div className="h-6 w-[1px] bg-border-subtle hidden sm:block" />

          {/* Export Button */}
          <button
            onClick={handleExportCSV}
            className="p-2 text-muted hover:text-foreground hover:bg-surface-subtle rounded-xl border border-border-subtle transition-all"
            title="Export CSV">
            <Download size={18} />
          </button>

          {/* Toggle View */}
          <div className="flex items-center bg-surface-subtle p-1 rounded-xl border border-border-subtle">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-muted'
              }`}>
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'table' ? 'bg-white shadow-sm text-primary' : 'text-muted'
              }`}>
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Expenses View */}
      {filteredExpenses.length === 0 ? (
        <div className="bg-white rounded-[32px] border border-border-subtle p-12 text-center flex flex-col items-center justify-center min-h-[280px]">
          <div className="w-16 h-16 rounded-full bg-surface-subtle flex items-center justify-center text-muted mb-4">
            <Receipt size={32} />
          </div>
          <h3 className="text-lg font-bold text-foreground">No expenses found</h3>
          <p className="text-xs text-muted max-w-sm mt-1">
            Try adjusting your search queries or category filters to find the recorded claims.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExpenses.map((exp, i) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="bg-white rounded-[32px] border border-border-subtle shadow-soft p-6 group hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-surface-subtle flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                      <Receipt size={20} />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold text-muted uppercase tracking-wider block">
                        {exp.id}
                      </span>
                      <h4 className="text-xs font-bold text-foreground">{exp.merchant}</h4>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${getStatusBadge(
                      exp.status
                    )}`}>
                    {exp.status}
                  </span>
                </div>

                <div className="flex flex-col gap-1 mb-4">
                  <h3 className="text-base font-black text-foreground tracking-tight leading-snug line-clamp-2">
                    {exp.description}
                  </h3>
                  <div className="flex items-center gap-2 mt-2 text-[11px] font-medium text-muted">
                    <User size={13} />
                    <span>{exp.employeeName}</span>
                    <span>•</span>
                    <Building2 size={13} />
                    <span>{exp.department}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border-subtle/60 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-muted block">Amount</span>
                  <span className="text-xl font-black text-foreground">
                    ₹{exp.amount.toLocaleString()}
                  </span>
                </div>

                <button
                  onClick={() => setSelectedExpense(exp)}
                  className="px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/5 rounded-xl transition-all flex items-center gap-1">
                  Details <ChevronRight size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-[32px] border border-border-subtle shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border-subtle bg-surface-subtle/50 text-muted uppercase font-extrabold text-[10px] tracking-wider">
                  <th className="py-4 px-6">Claim ID / Merchant</th>
                  <th className="py-4 px-6">Employee</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">Amount</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/50 font-medium">
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-surface-subtle/40 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-black text-foreground text-sm">{exp.merchant}</div>
                      <div className="text-[10px] text-muted font-bold">
                        {exp.id} • {exp.description}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-foreground font-bold">{exp.employeeName}</div>
                      <div className="text-[10px] text-muted">{exp.department}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-lg bg-surface-subtle font-bold text-foreground">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-muted">{exp.date}</td>
                    <td className="py-4 px-6 font-black text-foreground text-sm">
                      ₹{exp.amount.toLocaleString()}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${getStatusBadge(
                          exp.status
                        )}`}>
                        {exp.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setSelectedExpense(exp)}
                        className="text-xs font-bold text-primary hover:underline">
                        View Claim
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Expense Dialog Modal */}
      <Dialog
        visible={showForm}
        onHide={() => setShowForm(false)}
        header="Record Company Expense"
        modal
        className="w-full max-w-2xl mx-4"
        contentClassName="p-8"
        headerClassName="px-8 pt-8 pb-4 text-xl font-black tracking-tight border-none"
        pt={{
          root: { className: 'rounded-[32px] overflow-hidden border-none shadow-2xl bg-white' },
          mask: { className: 'backdrop-blur-md bg-black/40' },
        }}>
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
                Employee Name
              </label>
              <Input
                placeholder="e.g. Sarah Jenkins"
                value={form.employeeName}
                onChange={(e) => setForm({ ...form, employeeName: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
                Department
              </label>
              <Select
                options={DEPARTMENTS}
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
                Merchant / Vendor *
              </label>
              <Input
                placeholder="e.g. Apple Store, AWS, Uber"
                value={form.merchant}
                onChange={(e) => setForm({ ...form, merchant: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
                Category *
              </label>
              <Select
                options={EXPENSE_CATEGORIES.filter((c) => c.value !== 'ALL')}
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.value })}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
              Description / Business Purpose *
            </label>
            <Input
              placeholder="e.g. Development workstation for senior engineer"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
                Amount (₹) *
              </label>
              <Input
                type="number"
                placeholder="0.00"
                value={String(form.amount || '')}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
                Date *
              </label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
                Payment Method
              </label>
              <Select
                options={PAYMENT_METHODS}
                value={form.paymentMethod}
                onChange={(e) => setForm({ ...form, paymentMethod: e.value })}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
              Receipt URL / Document Link
            </label>
            <Input
              placeholder="https://drive.google.com/file/d/..."
              value={form.receiptUrl}
              onChange={(e) => setForm({ ...form, receiptUrl: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-border-subtle">
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
              label="Submit Expense"
              onClick={handleSubmit}
              icon="pi pi-check"
              className="rounded-xl! px-8!"
            />
          </div>
        </div>
      </Dialog>

      {/* Expense Detail Modal */}
      {selectedExpense && (
        <Dialog
          visible={!!selectedExpense}
          onHide={() => setSelectedExpense(null)}
          header={`Claim Detail - ${selectedExpense.id}`}
          modal
          className="w-full max-w-lg mx-4"
          contentClassName="p-6"
          headerClassName="px-6 pt-6 pb-2 text-lg font-black tracking-tight"
          pt={{
            root: { className: 'rounded-[32px] overflow-hidden border-none shadow-2xl bg-white' },
            mask: { className: 'backdrop-blur-md bg-black/40' },
          }}>
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between bg-surface-subtle p-4 rounded-2xl">
              <div>
                <span className="text-[10px] font-extrabold text-muted uppercase">
                  Claim Amount
                </span>
                <div className="text-2xl font-black text-foreground">
                  ₹{selectedExpense.amount.toLocaleString()}
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase border ${getStatusBadge(
                  selectedExpense.status
                )}`}>
                {selectedExpense.status}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-border-subtle/50">
                <span className="text-muted font-bold">Merchant:</span>
                <span className="font-bold text-foreground">{selectedExpense.merchant}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border-subtle/50">
                <span className="text-muted font-bold">Employee:</span>
                <span className="font-bold text-foreground">
                  {selectedExpense.employeeName} ({selectedExpense.department})
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border-subtle/50">
                <span className="text-muted font-bold">Category:</span>
                <span className="font-bold text-foreground">{selectedExpense.category}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border-subtle/50">
                <span className="text-muted font-bold">Payment Mode:</span>
                <span className="font-bold text-foreground">{selectedExpense.paymentMethod}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border-subtle/50">
                <span className="text-muted font-bold">Expense Date:</span>
                <span className="font-bold text-foreground">{selectedExpense.date}</span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-extrabold text-muted uppercase">
                Purpose / Notes
              </span>
              <p className="text-xs font-medium text-foreground bg-surface-subtle p-3 rounded-xl">
                {selectedExpense.description}
              </p>
            </div>

            {selectedExpense.receiptUrl && (
              <a
                href={selectedExpense.receiptUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 p-3 bg-primary/5 text-primary rounded-xl text-xs font-bold hover:bg-primary/10 transition-all">
                <FileText size={16} /> View Receipt Document
              </a>
            )}

            <div className="pt-2 flex justify-end">
              <Button
                variant="ghost"
                label="Close"
                onClick={() => setSelectedExpense(null)}
                className="rounded-xl!"
              />
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
