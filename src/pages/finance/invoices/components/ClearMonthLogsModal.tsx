import { Trash2 } from 'lucide-react';
import { Modal } from 'antd';
import { AUDIT_MONTH_NAMES, AUDIT_YEAR_OPTIONS } from '../constants';

interface ClearMonthLogsModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  isClearing: boolean;
  selectedMonth: number;
  selectedYear: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
}

export function ClearMonthLogsModal({
  open,
  onCancel,
  onConfirm,
  isClearing,
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
}: ClearMonthLogsModalProps) {
  const monthLabel = new Date(selectedYear, selectedMonth - 1).toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-rose-600 font-bold">
          <Trash2 size={18} />
          <span>Clear 1 Month of Invoice Audit Logs</span>
        </div>
      }
      open={open}
      onCancel={onCancel}
      onOk={onConfirm}
      okText="Clear Month"
      okButtonProps={{ danger: true, loading: isClearing }}
      cancelButtonProps={{ disabled: isClearing }}>
      <div className="flex flex-col gap-3 py-2 text-sm text-slate-600">
        <p>
          Select the specific <strong>1 month</strong> of invoice audit logs you wish to permanently
          clear. All other months remain untouched, ensuring you never lose all 3 months of logs and
          keeping the other 2 months safely in the system.
        </p>
        <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => onMonthChange(Number(e.target.value))}
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg">
              {AUDIT_MONTH_NAMES.map((month, index) => (
                <option key={index + 1} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => onYearChange(Number(e.target.value))}
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg">
              {AUDIT_YEAR_OPTIONS.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
           <strong>Safety note:</strong> This action permanently purges only logs matching{' '}
          <strong>{monthLabel}</strong>. Logs outside this month will NOT be affected.
        </p>
      </div>
    </Modal>
  );
}
