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

import React, { useState } from 'react';
import { useExpensesPage, EXPENSE_CATEGORIES, EXPENSE_STATUSES } from './hooks/useExpensesPage'; // Adjust import path as needed
import type { ExpenseRecord } from '@/store/api/expenseSlice';

export const ExpensesPage: React.FC = () => {
  const {
    // Data
    filteredExpenses,
    stats,

    // Status Flags
    isLoading,
    isFetching,
    isSubmitting,
    isUpdatingStatus,
    isError,
    error,

    // Modals
    showFormModal,
    setShowFormModal,
    showDetailModal,
    selectedExpense,
    openDetails,
    closeDetails,

    // Search & Filters
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    activeStatus,
    setActiveStatus,
    resetFilters,

    // Actions & Mutations
    handleCreateExpense,
    handleApprove,
    handleReject,
    handleMarkAsPaid,
    refetch,
  } = useExpensesPage();

  // Local state for rejection modal reason input
  const [rejectionModalId, setRejectionModalId] = useState<number | string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');

  // Helper for formatting currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Helper for status badge styling
  const getStatusBadge = (status?: string) => {
    const s = status?.toLowerCase();
    switch (s) {
      case 'approved':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  // Form submit wrapper
  const onFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await handleCreateExpense(formData);
  };

  // Rejection submit
  const onConfirmReject = async () => {
    if (!rejectionModalId) return;
    await handleReject(rejectionModalId, rejectionReason);
    setRejectionModalId(null);
    setRejectionReason('');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* --------------------------------------------------------- */}
      {/* HEADER SECTION */}
      {/* --------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses Management</h1>
          <p className="text-sm text-gray-500">
            Track, approve, and process employee company expenses.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50">
            {isFetching ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={() => setShowFormModal(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 shadow-sm">
            + New Expense
          </button>
        </div>
      </div>

      {/* --------------------------------------------------------- */}
      {/* FINANCIAL STATS CARDS */}
      {/* --------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase">Total Expenses</p>
          <p className="text-xl font-bold text-gray-900 mt-1">
            {formatCurrency(stats.totalExpenses)}
          </p>
        </div>
        <div className="p-4 bg-yellow-50/50 rounded-lg border border-yellow-200 shadow-sm">
          <p className="text-xs font-semibold text-yellow-700 uppercase">
            Pending ({stats.pendingCount})
          </p>
          <p className="text-xl font-bold text-yellow-900 mt-1">
            {formatCurrency(stats.pendingAmount)}
          </p>
        </div>
        <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-200 shadow-sm">
          <p className="text-xs font-semibold text-blue-700 uppercase">
            Approved ({stats.approvedCount})
          </p>
          <p className="text-xl font-bold text-blue-900 mt-1">
            {formatCurrency(stats.approvedAmount)}
          </p>
        </div>
        <div className="p-4 bg-green-50/50 rounded-lg border border-green-200 shadow-sm">
          <p className="text-xs font-semibold text-green-700 uppercase">Paid ({stats.paidCount})</p>
          <p className="text-xl font-bold text-green-900 mt-1">
            {formatCurrency(stats.paidAmount)}
          </p>
        </div>
        <div className="p-4 bg-red-50/50 rounded-lg border border-red-200 shadow-sm">
          <p className="text-xs font-semibold text-red-700 uppercase">
            Rejected ({stats.rejectedCount})
          </p>
          <p className="text-xl font-bold text-red-900 mt-1">
            {formatCurrency(stats.rejectedAmount)}
          </p>
        </div>
      </div>

      {/* --------------------------------------------------------- */}
      {/* FILTERS & SEARCH BAR */}
      {/* --------------------------------------------------------- */}
      <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Input */}
          <div className="w-full md:w-1/3">
            <input
              type="text"
              placeholder="Search by title, employee, vendor, or #"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Select Dropdowns */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <select
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  Category: {cat}
                </option>
              ))}
            </select>

            <select
              value={activeStatus}
              onChange={(e) => setActiveStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              {EXPENSE_STATUSES.map((st) => (
                <option key={st} value={st}>
                  Status: {st}
                </option>
              ))}
            </select>

            <button
              onClick={resetFilters}
              className="text-sm text-gray-500 hover:text-gray-800 underline px-2 py-1">
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------- */}
      {/* EXPENSES TABLE / DATA STATE */}
      {/* --------------------------------------------------------- */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500">Loading expenses...</div>
        ) : isError ? (
          <div className="p-12 text-center text-red-600">
            <p>Failed to load expenses.</p>
            <p className="text-xs text-gray-400 mt-1">{JSON.stringify(error)}</p>
            <button
              onClick={() => refetch()}
              className="mt-4 px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-md text-sm hover:bg-red-100">
              Try Again
            </button>
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No expenses found matching the selected criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 font-medium">
                <tr>
                  <th className="px-4 py-3">Expense #</th>
                  <th className="px-4 py-3">Title & Vendor</th>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-700">
                {filteredExpenses.map((expense: ExpenseRecord) => {
                  const status = expense.status?.toLowerCase();
                  return (
                    <tr key={expense.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">
                        {expense.expense_number || `#${expense.id}`}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{expense.title}</div>
                        <div className="text-xs text-gray-500">{expense.vendor_name || 'N/A'}</div>
                      </td>
                      <td className="px-4 py-3">{expense.employee_name || 'N/A'}</td>
                      <td className="px-4 py-3">{expense.category}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        {formatCurrency(Number(expense.amount || 0))}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full border ${getStatusBadge(
                            expense.status
                          )}`}>
                          {expense.status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button
                          onClick={() => openDetails(expense)}
                          className="text-xs font-medium text-gray-600 hover:text-gray-900 underline">
                          Details
                        </button>

                        {/* Status Mutations */}
                        {status === 'pending' && (
                          <>
                            <button
                              disabled={isUpdatingStatus}
                              onClick={() => handleApprove(expense.id)}
                              className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 disabled:opacity-50">
                              Approve
                            </button>
                            <button
                              disabled={isUpdatingStatus}
                              onClick={() => setRejectionModalId(expense.id)}
                              className="text-xs px-2 py-1 bg-red-50 text-red-700 rounded hover:bg-red-100 disabled:opacity-50">
                              Reject
                            </button>
                          </>
                        )}

                        {status === 'approved' && (
                          <button
                            disabled={isUpdatingStatus}
                            onClick={() => handleMarkAsPaid(expense.id)}
                            className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded hover:bg-green-100 disabled:opacity-50">
                            Mark Paid
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --------------------------------------------------------- */}
      {/* FORM MODAL (CREATE NEW EXPENSE) */}
      {/* --------------------------------------------------------- */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-xl relative">
            <h2 className="text-lg font-bold mb-4">Record New Expense</h2>
            <form onSubmit={onFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700">Title</label>
                <input
                  name="title"
                  required
                  type="text"
                  placeholder="e.g. Client Dinner"
                  className="mt-1 w-full border border-gray-300 rounded p-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700">Amount</label>
                  <input
                    name="amount"
                    required
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="mt-1 w-full border border-gray-300 rounded p-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">Category</label>
                  <select
                    name="category"
                    className="mt-1 w-full border border-gray-300 rounded p-2 text-sm bg-white">
                    {EXPENSE_CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700">Vendor</label>
                  <input
                    name="vendor_name"
                    type="text"
                    placeholder="e.g. Uber / Amazon"
                    className="mt-1 w-full border border-gray-300 rounded p-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">Payment Mode</label>
                  <input
                    name="payment_mode"
                    type="text"
                    placeholder="e.g. Corporate Card"
                    className="mt-1 w-full border border-gray-300 rounded p-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700">
                  Receipt Attachment
                </label>
                <input
                  name="receipt"
                  type="file"
                  className="mt-1 w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2 border rounded-md text-sm text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50">
                  {isSubmitting ? 'Submitting...' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* EXPENSE DETAILS MODAL */}
      {/* --------------------------------------------------------- */}
      {showDetailModal && selectedExpense && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-start border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{selectedExpense.title}</h3>
                <p className="text-xs text-gray-500">{selectedExpense.expense_number}</p>
              </div>
              <span
                className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${getStatusBadge(
                  selectedExpense.status
                )}`}>
                {selectedExpense.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-500">Amount</p>
                <p className="font-semibold text-gray-900">
                  {formatCurrency(Number(selectedExpense.amount || 0))}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Category</p>
                <p className="font-medium text-gray-800">{selectedExpense.category}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Employee</p>
                <p className="font-medium text-gray-800">
                  {selectedExpense.employee_name || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Vendor</p>
                <p className="font-medium text-gray-800">{selectedExpense.vendor_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Payment Mode</p>
                <p className="font-medium text-gray-800">{selectedExpense.payment_mode || 'N/A'}</p>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <button
                onClick={closeDetails}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* REJECTION REASON MODAL */}
      {/* --------------------------------------------------------- */}
      {rejectionModalId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-sm w-full p-5 shadow-xl space-y-4">
            <h3 className="text-md font-bold text-gray-900">Reject Expense</h3>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Reason for Rejection (Optional)
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                placeholder="e.g. Missing valid receipt"
                className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setRejectionModalId(null);
                  setRejectionReason('');
                }}
                className="px-3 py-1.5 border rounded text-xs text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={onConfirmReject}
                disabled={isUpdatingStatus}
                className="px-3 py-1.5 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:opacity-50">
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesPage;
