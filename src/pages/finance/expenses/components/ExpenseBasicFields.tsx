import { EXPENSE_CATEGORIES } from '../constants';

interface ExpenseBasicFieldsProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  amountInput: string;
  onAmountChange: (value: string) => void;
}

export function ExpenseBasicFields({
  selectedCategory,
  onCategoryChange,
  amountInput,
  onAmountChange,
}: ExpenseBasicFieldsProps) {
  return (
    <>
      <div>
        <label className="block text-xs font-medium text-gray-700">Title</label>
        <input
          name="title"
          required
          type="text"
          placeholder="e.g. Flight tickets or Team Dinner"
          className="mt-1 w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700">Total Amount</label>
          <input
            name="amount"
            required
            type="number"
            step="0.01"
            placeholder="0.00"
            value={amountInput}
            onChange={(event) => onAmountChange(event.target.value)}
            className="mt-1 w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700">Expense Date</label>
          <input
            name="expenseDate"
            required
            type="date"
            defaultValue={new Date().toISOString().split('T')[0]}
            className="mt-1 w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700">Category</label>
          <select
            name="category"
            value={selectedCategory}
            onChange={(event) => onCategoryChange(event.target.value)}
            className="mt-1 w-full border border-gray-300 rounded p-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            {EXPENSE_CATEGORIES.filter((category) => category !== 'All').map((category) => (
              <option key={category} value={category}>
                {category}
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
            placeholder="e.g. Delta Airlines / Marriott"
            className="mt-1 w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700">Payment Mode</label>
          <input
            name="payment_mode"
            type="text"
            placeholder="e.g. Corporate Card"
            className="mt-1 w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700">Receipt Attachment</label>
        <input
          name="receipt"
          type="file"
          className="mt-1 w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
        />
      </div>
    </>
  );
}
