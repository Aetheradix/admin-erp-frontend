import { useState } from 'react';

import { useAssignRecreationalBenefitMutation } from '@/store/api/recreationalbenefitsSlice';

interface Employee {
  id: number;
  name?: string;
  email?: string;
}

interface Props {
  benefitId: number;
  open: boolean;
  onClose: () => void;
  employees?: Employee[];
}

const AssignBenefitDialog = ({ benefitId, open, onClose, employees = [] }: Props) => {
  const [employeeId, setEmployeeId] = useState('');
  const [validFrom, setValidFrom] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [error, setError] = useState('');

  const [assignBenefit, { isLoading }] = useAssignRecreationalBenefitMutation();

  if (!open) return null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError('');

    if (!employeeId) {
      setError('Please select an employee.');
      return;
    }

    if (validFrom && validUntil && validUntil < validFrom) {
      setError('Valid until date cannot be before valid from date.');
      return;
    }

    try {
      await assignBenefit({
        id: benefitId,
        data: {
          employee_id: Number(employeeId),
          valid_from: validFrom || null,
          valid_until: validUntil || null,
        },
      }).unwrap();

      setEmployeeId('');
      setValidFrom('');
      setValidUntil('');

      onClose();
    } catch (err) {
      console.error('Failed to assign benefit:', err);

      setError('Failed to assign benefit. The employee may already have this benefit.');
    }
  };

  const handleClose = () => {
    if (isLoading) return;

    setError('');
    setEmployeeId('');
    setValidFrom('');
    setValidUntil('');

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Assign Benefit</h2>

            <p className="mt-1 text-sm text-gray-500">
              Assign this recreational benefit to an employee.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="text-xl text-gray-400 hover:text-gray-700 disabled:opacity-50"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-5 p-6">
            {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>}

            {/* Employee */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Employee <span className="text-red-500">*</span>
              </label>

              <select
                value={employeeId}
                onChange={(event) => setEmployeeId(event.target.value)}
                disabled={isLoading}
                className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">Select employee</option>

                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name || employee.email || `Employee #${employee.id}`}
                  </option>
                ))}
              </select>

              {employees.length === 0 && (
                <p className="mt-1.5 text-xs text-gray-500">Connect your employee list API here.</p>
              )}
            </div>

            {/* Valid From */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Valid From</label>

              <input
                type="date"
                value={validFrom}
                onChange={(event) => setValidFrom(event.target.value)}
                disabled={isLoading}
                className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            {/* Valid Until */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Valid Until</label>

              <input
                type="date"
                value={validUntil}
                min={validFrom || undefined}
                onChange={(event) => setValidUntil(event.target.value)}
                disabled={isLoading}
                className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t bg-gray-50 p-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? 'Assigning...' : 'Assign Benefit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignBenefitDialog;
