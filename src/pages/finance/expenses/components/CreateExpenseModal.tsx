import type { FormEvent } from 'react';
import type { UserOption } from '../types';
import type { useExpenseForm } from '../hooks/useExpenseForm';
import { ExpenseBasicFields } from './ExpenseBasicFields';
import { SharedExpenseSelector } from './SharedExpenseSelector';

interface CreateExpenseModalProps {
  availableUsers: UserOption[];
  form: ReturnType<typeof useExpenseForm>;
  isSubmitting: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
}

export function CreateExpenseModal({
  availableUsers,
  form,
  isSubmitting,
  onSubmit,
  onClose,
}: CreateExpenseModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">Record New Expense</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <ExpenseBasicFields
            selectedCategory={form.selectedCategory}
            onCategoryChange={form.handleCategoryChange}
            amountInput={form.amountInput}
            onAmountChange={form.setAmountInput}
          />

          <SharedExpenseSelector
            isSharedExpense={form.isSharedExpense}
            onSharedExpenseChange={form.setIsSharedExpense}
            availableUsers={availableUsers}
            selectedUserIds={form.selectedUserIds}
            onToggleUser={form.toggleUserSelection}
            onSelectAll={form.handleSelectAllUsers}
            parsedAmount={form.parsedAmount}
            participantCount={form.participantCount}
            splitAmount={form.splitAmount}
          />

          <div className="flex justify-end gap-2 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md text-sm text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50 font-medium">
              {isSubmitting ? 'Submitting...' : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
