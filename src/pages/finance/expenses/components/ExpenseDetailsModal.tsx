import { FileText } from 'lucide-react';
import type { ExpenseRecord } from '@/store/api/expenseSlice';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { getExpenseParticipants, getExpenseStatusBadge } from '../utils';

interface ExpenseDetailsModalProps {
  expense: ExpenseRecord;
  onClose: () => void;
  onDownloadVoucher: (expense: ExpenseRecord) => void;
}

export function ExpenseDetailsModal({
  expense,
  onClose,
  onDownloadVoucher,
}: ExpenseDetailsModalProps) {
  const participants = getExpenseParticipants(expense);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl space-y-4">
        <div className="flex justify-between items-start border-b pb-3">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{expense.title}</h3>
            <p className="text-xs text-gray-500">{expense.expense_number}</p>
          </div>
          <span
            className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${getExpenseStatusBadge(
              expense.status
            )}`}>
            {expense.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-gray-500">Amount</p>
            <p className="font-semibold text-gray-900">
              {formatCurrency(Number(expense.amount || 0))}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Category</p>
            <p className="font-medium text-gray-800">{expense.category}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Employee</p>
            <p className="font-medium text-gray-800">{expense.employee_name || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Vendor</p>
            <p className="font-medium text-gray-800">{expense.vendor_name || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Payment Mode</p>
            <p className="font-medium text-gray-800">{expense.payment_mode || 'N/A'}</p>
          </div>

          {participants.length > 0 && (
            <div className="col-span-2 pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-1 font-medium">Involved Team Members</p>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {participants.map((participant, index) => (
                  <span
                    key={participant.id ?? participant.userId ?? index}
                    className="px-2 py-0.5 text-xs bg-blue-50 text-blue-800 rounded border border-blue-200">
                    {participant.participantName}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <button
            type="button"
            onClick={() => onDownloadVoucher(expense)}
            className="px-3.5 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors">
            <FileText size={14} /> Download Voucher (PDF)
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
