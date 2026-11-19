interface RejectExpenseModalProps {
  reason: string;
  onReasonChange: (value: string) => void;
  isUpdating: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function RejectExpenseModal({
  reason,
  onReasonChange,
  isUpdating,
  onCancel,
  onConfirm,
}: RejectExpenseModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-sm w-full p-5 shadow-xl space-y-4">
        <h3 className="text-md font-bold text-gray-900">Reject Expense</h3>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Reason for Rejection (Optional)
          </label>
          <textarea
            value={reason}
            onChange={(event) => onReasonChange(event.target.value)}
            rows={3}
            placeholder="e.g. Missing valid receipt"
            className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 border rounded text-xs text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isUpdating}
            className="px-3 py-1.5 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:opacity-50">
            Confirm Reject
          </button>
        </div>
      </div>
    </div>
  );
}
