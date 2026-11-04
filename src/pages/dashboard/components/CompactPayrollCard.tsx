import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  FileCheck2,
  ArrowUpRight,
  CreditCard,
} from 'lucide-react';
import type { DashboardPayroll } from '@/types/dashboard';

interface CompactPayrollCardProps {
  payroll: DashboardPayroll | null;
  isLoading: boolean;
}

export const CompactPayrollCard: React.FC<CompactPayrollCardProps> = ({ payroll, isLoading }) => {
  const navigate = useNavigate();

  if (isLoading || !payroll) {
    return (
      <div className="bg-white rounded-[12px] p-4 border border-border-subtle shadow-2xs animate-pulse">
        <div className="h-4 w-28 bg-surface-subtle rounded mb-3" />
        <div className="h-16 bg-surface-subtle rounded" />
      </div>
    );
  }

  const { nextSalarySchedule, currentMonthPayslip, lastPayroll } = payroll;

  return (
    <div className="bg-white rounded-[12px] p-4 border border-border-subtle shadow-2xs hover:border-border transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-1">
            <CreditCard size={11} /> Compensation
          </span>
          <h3 className="text-sm font-black text-foreground">
            Payroll & Payslips
          </h3>
        </div>

        <button
          type="button"
          onClick={() => navigate('/finance/my-payslip')}
          className="flex items-center gap-1 text-[10px] font-bold text-muted hover:text-primary transition-colors cursor-pointer"
          title="View Payslips">
          <span>My Payslips</span>
          <ArrowUpRight size={11} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {/* Next Salary */}
        <div
          onClick={() => navigate('/finance/payroll')}
          className="p-3 rounded-xl bg-surface-subtle/70 hover:bg-surface-elevated border border-border-subtle/60 transition-all cursor-pointer group">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] font-bold text-muted uppercase tracking-wider flex items-center gap-1">
              <CalendarDays size={10} className="text-primary" /> Cycle
            </span>
            <span
              className={`text-[8.5px] font-black uppercase px-1.5 py-0.2 rounded ${
                nextSalarySchedule?.status === 'Paid'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-primary/10 text-primary'
              }`}>
              {nextSalarySchedule?.status || 'Scheduled'}
            </span>
          </div>

          <div className="text-sm font-black text-foreground">
            {nextSalarySchedule?.expectedDate
              ? new Date(nextSalarySchedule.expectedDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })
              : 'End of Month'}
          </div>

          <p className="text-[10px] text-muted mt-0.5 truncate">
            {nextSalarySchedule?.daysRemaining !== undefined
              ? `in ${nextSalarySchedule.daysRemaining} days`
              : 'Next cycle'}
          </p>
        </div>

        {/* Current Payslip */}
        <div
          onClick={() => navigate('/finance/my-payslip')}
          className="p-3 rounded-xl bg-surface-subtle/70 hover:bg-surface-elevated border border-border-subtle/60 transition-all cursor-pointer group">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] font-bold text-muted uppercase tracking-wider flex items-center gap-1">
              <FileCheck2 size={10} className="text-emerald-500" /> Payslip
            </span>
            <span
              className={`text-[8.5px] font-black uppercase px-1.5 py-0.2 rounded ${
                currentMonthPayslip?.available
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-zinc-100 text-zinc-600'
              }`}>
              {currentMonthPayslip?.available ? 'Available' : 'Pending'}
            </span>
          </div>

          <div className="text-sm font-black text-foreground">
            {currentMonthPayslip?.available ? 'Ready' : 'In Cycle'}
          </div>

          <p className="text-[10px] text-muted mt-0.5 truncate">
            {lastPayroll?.paySlipNo ? `#${lastPayroll.paySlipNo}` : 'Download PDF'}
          </p>
        </div>
      </div>
    </div>
  );
};

