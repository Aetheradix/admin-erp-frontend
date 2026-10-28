import React, { useState, useEffect } from 'react';
import { Modal } from 'antd';
import { AlertTriangle, User, Calendar, Ban, DollarSign } from 'lucide-react';
import type { PayrollRecord } from '../PayrollPage';

interface VoidPayrollModalProps {
  isOpen: boolean;
  record: PayrollRecord | null;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: (reason: string, notes: string) => Promise<void>;
}

const VOID_REASONS = [
  'Incorrect tax calculation (TDS / Deductions)',
  'Wrong base salary or allowance amount',
  'Incorrect working days / LOP calculation',
  'Wrong tax regime applied (Old vs New Regime)',
  'Duplicate payroll slip generated',
  'Clerical / manual entry error',
  'Other calculation discrepancy',
];

export const VoidPayrollModal: React.FC<VoidPayrollModalProps> = ({
  isOpen,
  record,
  isLoading = false,
  onClose,
  onConfirm,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>(VOID_REASONS[0]);
  const [customNotes, setCustomNotes] = useState<string>('');
  const [confirmChecked, setConfirmChecked] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedReason(VOID_REASONS[0]);
      setCustomNotes('');
      setConfirmChecked(false);
    }
  }, [isOpen]);

  if (!record) return null;

  const handleSubmit = async () => {
    if (!selectedReason) return;
    await onConfirm(selectedReason, customNotes.trim());
  };

  return (
    <Modal
      open={isOpen}
      onCancel={() => {
        if (!isLoading) onClose();
      }}
      footer={null}
      width={560}
      centered
      destroyOnClose
      className="void-payroll-modal">
      <div className="flex flex-col gap-5 p-1 sm:p-2">
        {/* Header */}
        <div className="flex items-start gap-3.5 border-b border-rose-100 pb-4">
          <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0 shadow-xs">
            <AlertTriangle size={22} />
          </div>
          <div className="flex flex-col">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Mark Payroll as Void
              <span className="text-[10px] font-bold uppercase bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full border border-rose-200">
                Action Required
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Invalidate incorrect salary computations, wrong TDS deductions, or clerical errors.
            </p>
          </div>
        </div>

        {/* Record Overview Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <User size={15} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-900">{record.employeeName}</span>
                <span className="text-[11px] text-slate-500">ID: {record.employeeCode} • {record.department}</span>
              </div>
            </div>
            <span className="font-mono text-xs font-bold bg-white text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
              {record.paySlipNo}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <Calendar size={14} className="text-slate-400" />
              <span>Period: <strong>{record.monthYear}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <DollarSign size={14} className="text-slate-400" />
              <span>Net Pay: <strong className="text-slate-900">₹{Number(record.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></span>
            </div>
          </div>
        </div>

        {/* Reason Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700">
            Reason for Voiding <span className="text-rose-500">*</span>
          </label>
          <select
            value={selectedReason}
            onChange={(e) => setSelectedReason(e.target.value)}
            disabled={isLoading}
            className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 shadow-xs cursor-pointer">
            {VOID_REASONS.map((reason) => (
              <option key={reason} value={reason}>
                {reason}
              </option>
            ))}
          </select>
        </div>

        {/* Additional Explanation / Details */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700">
            Discrepancy Details & Justification <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <textarea
            rows={3}
            value={customNotes}
            onChange={(e) => setCustomNotes(e.target.value)}
            disabled={isLoading}
            placeholder="e.g. TDS was computed under Old Tax Regime instead of New Regime rebate, or base salary miscalculated by ₹10,000. Replacement payslip to be issued."
            className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 resize-none shadow-xs"
          />
        </div>

        {/* Consequence Notice */}
        <div className="bg-rose-50/70 border border-rose-200/90 rounded-2xl p-3.5 text-xs text-rose-800 flex items-start gap-2.5">
          <Ban size={16} className="text-rose-600 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1 text-[11px] leading-relaxed">
            <span className="font-bold text-rose-900">What happens when marked as Void:</span>
            <ul className="list-disc list-inside space-y-0.5 text-rose-700">
              <li>This payslip is flagged as <strong>VOID</strong> across financial records and reports.</li>
              <li>A diagonal <strong>VOID watermark</strong> and cancellation banner will appear on the payslip.</li>
              <li>An official audit log entry is saved under the <strong>3-month retention policy</strong>.</li>
            </ul>
          </div>
        </div>

        {/* Confirmation Checkbox */}
        <label className="flex items-center gap-2.5 text-xs text-slate-700 font-medium cursor-pointer select-none">
          <input
            type="checkbox"
            checked={confirmChecked}
            onChange={(e) => setConfirmChecked(e.target.checked)}
            disabled={isLoading}
            className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500 cursor-pointer"
          />
          <span>I confirm this payroll contains calculation errors and should be marked void.</span>
        </label>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer">
            Cancel
          </button>
          <button
            type="button"
            disabled={isLoading || !confirmChecked}
            onClick={handleSubmit}
            className="px-5 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer active:scale-95">
            <Ban size={15} />
            {isLoading ? 'Voiding Payroll...' : 'Confirm & Mark as Void'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
export default VoidPayrollModal;
