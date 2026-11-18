import { formatCurrency } from '@/shared/utils/formatCurrency';
import type { UserOption } from '../types';

interface SharedExpenseSelectorProps {
  isSharedExpense: boolean;
  onSharedExpenseChange: (value: boolean) => void;
  availableUsers: UserOption[];
  selectedUserIds: Array<number | string>;
  onToggleUser: (userId: number | string) => void;
  onSelectAll: () => void;
  parsedAmount: number;
  participantCount: number;
  splitAmount: number;
}

export function SharedExpenseSelector({
  isSharedExpense,
  onSharedExpenseChange,
  availableUsers,
  selectedUserIds,
  onToggleUser,
  onSelectAll,
  parsedAmount,
  participantCount,
  splitAmount,
}: SharedExpenseSelectorProps) {
  return (
    <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-md space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-semibold text-blue-900 block">
            Shared / Multi-User Expense
          </label>
          <p className="text-[11px] text-gray-600">
            Include involved team members (e.g. Travel, Outings, Group Meals)
          </p>
        </div>
        <input
          type="checkbox"
          checked={isSharedExpense}
          onChange={(event) => onSharedExpenseChange(event.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
        />
      </div>

      {isSharedExpense && (
        <div className="space-y-2 pt-2 border-t border-blue-200/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-700">
              Select Participants ({selectedUserIds.length} selected)
            </span>
            <button
              type="button"
              onClick={onSelectAll}
              className="text-xs text-blue-700 hover:text-blue-900 font-medium underline">
              {selectedUserIds.length === availableUsers.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
            {availableUsers.map((user) => {
              const isChecked = selectedUserIds.includes(user.id);
              return (
                <div
                  key={user.id}
                  onClick={() => onToggleUser(user.id)}
                  className={`flex items-center gap-2 p-2 rounded border text-xs cursor-pointer select-none transition-colors ${
                    isChecked
                      ? 'bg-blue-100/80 border-blue-400 text-blue-900 font-medium'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    readOnly
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 pointer-events-none"
                  />
                  <div className="truncate">
                    <p className="truncate font-medium">{user.name}</p>
                    {user.department && (
                      <p className="text-[10px] text-gray-500 truncate">{user.department}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {parsedAmount > 0 && participantCount > 0 && (
            <div className="flex items-center justify-between text-xs bg-white p-2.5 rounded border border-blue-300 text-blue-900 mt-2 font-medium">
              <span>Cost per person ({participantCount} participants):</span>
              <span className="font-bold text-sm text-blue-700">{formatCurrency(splitAmount)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
