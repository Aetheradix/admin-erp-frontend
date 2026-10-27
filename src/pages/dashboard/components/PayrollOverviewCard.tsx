import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  FileCheck2,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import type { DashboardPayroll } from '@/types/dashboard';

interface PayrollOverviewCardProps {
  payroll: DashboardPayroll | null;
  isLoading: boolean;
}

export const PayrollOverviewCard: React.FC<PayrollOverviewCardProps> = ({ payroll, isLoading }) => {
  const navigate = useNavigate();

  if (isLoading || !payroll) {
    return (
      <div className="bg-surface-elevated rounded-3xl p-7 border border-border-subtle shadow-soft animate-pulse h-full">
        <div className="w-28 h-4 rounded-md bg-surface-subtle mb-3" />
        <div className="w-48 h-7 rounded-xl bg-surface-subtle mb-6" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-28 rounded-2xl bg-surface-subtle" />
          <div className="h-28 rounded-2xl bg-surface-subtle" />
        </div>
      </div>
    );
  }

  const { nextSalarySchedule, lastPayroll, currentMonthPayslip, ytdEarnings, paidCyclesCount, currentMonthlySalary } = payroll;

  return (
    <div className="bg-surface-elevated rounded-3xl p-5 sm:p-6 border border-border-subtle shadow-soft hover:shadow-md transition-all duration-300 flex flex-col justify-between">
      {/* Card Header */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.25em]">
              Compensation & Salary
            </span>
            <h2 className="text-xl font-black text-foreground tracking-tight mt-0.5">
              Payroll & Payslips
            </h2>
          </div>
          <button
            onClick={() => navigate('/finance/my-payslip')}
            className="px-3.5 py-1.5 rounded-2xl bg-surface-subtle hover:bg-surface-elevated border border-border-subtle text-[11px] font-black text-foreground uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs">
            <span>My Payslips</span>
            <ArrowUpRight size={13} className="text-muted" />
          </button>
        </div>

        {/* Primary Schedule Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-5">
          {/* Next Expected Salary Card */}
          <div
            onClick={() => navigate('/finance/payroll')}
            className="p-5 rounded-2xl bg-gradient-to-br from-primary/5 via-surface-subtle to-surface-subtle border border-primary/20 hover:border-primary/40 transition-all cursor-pointer group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted flex items-center gap-1">
                <CalendarDays size={12} className="text-primary" />
                <span>Next Salary Cycle</span>
              </span>
              <span
                className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  nextSalarySchedule.status === 'Paid'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-primary/10 text-primary border-primary/20'
                }`}>
                {nextSalarySchedule.status}
              </span>
            </div>

            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-2xl font-black text-foreground tracking-tight">
                {new Date(nextSalarySchedule.expectedDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </h3>
              <span className="text-xs font-bold text-primary">
                ({nextSalarySchedule.dayName})
              </span>
            </div>

            <p className="text-[11px] font-medium text-muted mt-1 leading-snug">
              {nextSalarySchedule.wasAdjustedForSunday ? (
                <span className="text-amber-600 font-bold">
                  * 1st is Sunday · Automatically adjusted to Monday
                </span>
              ) : (
                `Scheduled cycle in ${nextSalarySchedule.daysRemaining} days`
              )}
            </p>

            <div className="mt-3 pt-2.5 border-t border-border-subtle flex items-center justify-between text-[10px] font-bold text-muted group-hover:text-primary transition-colors">
              <span>View Payroll Calendar</span>
              <ArrowUpRight size={12} />
            </div>
          </div>

          {/* Current Month Payslip Card */}
          <div
            onClick={() => navigate('/finance/my-payslip')}
            className="p-5 rounded-2xl bg-surface-subtle border border-border-subtle hover:border-purple-300 transition-all cursor-pointer group flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted flex items-center gap-1">
                  <FileCheck2 size={12} className="text-purple-600" />
                  <span>Current Month Payslip</span>
                </span>
                <span
                  className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    currentMonthPayslip.available
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                  }`}>
                  {currentMonthPayslip.statusText}
                </span>
              </div>

              {currentMonthPayslip.available ? (
                <div>
                  <h3 className="text-xl font-black text-foreground tracking-tight mt-1">
                    {currentMonthPayslip.paySlipNo}
                  </h3>
                  {currentMonthPayslip.netSalary && (
                    <p className="text-xs font-bold text-emerald-600 mt-1">
                      ₹ {currentMonthPayslip.netSalary.toLocaleString('en-IN')} (Net Disbursed)
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <h3 className="text-base font-bold text-muted mt-1">
                    Payslip not yet available
                  </h3>
                  <p className="text-[11px] font-medium text-muted/80 mt-1">
                    Generated automatically once the monthly cycle is closed & approved.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-3 pt-2.5 border-t border-border-subtle flex items-center justify-between text-[10px] font-bold text-muted group-hover:text-purple-600 transition-colors">
              <span>{currentMonthPayslip.available ? 'View & Download Slip' : 'Check Payslip History'}</span>
              <ArrowUpRight size={12} />
            </div>
          </div>
        </div>

        {/* Secondary Detailed KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Last Disbursed Salary */}
          <div className="p-3.5 rounded-2xl bg-surface-subtle/70 border border-border-subtle">
            <span className="text-[9px] font-black uppercase tracking-wider text-muted block mb-1">
              Last Disbursed Salary
            </span>
            <div className="text-base font-black text-foreground">
              {lastPayroll?.netSalary ? `₹ ${lastPayroll.netSalary.toLocaleString('en-IN')}` : '—'}
            </div>
            <span className="text-[10px] text-muted font-medium block mt-0.5">
              {lastPayroll?.paymentDate
                ? `Paid on ${new Date(lastPayroll.paymentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                : 'No prior disbursements'}
            </span>
          </div>

          {/* Monthly Gross CTC / Base */}
          <div className="p-3.5 rounded-2xl bg-surface-subtle/70 border border-border-subtle">
            <span className="text-[9px] font-black uppercase tracking-wider text-muted block mb-1">
              Monthly Base / CTC
            </span>
            <div className="text-base font-black text-foreground">
              {currentMonthlySalary ? `₹ ${currentMonthlySalary.toLocaleString('en-IN')}` : '—'}
            </div>
            <span className="text-[10px] text-muted font-medium block mt-0.5">
              Active Compensation
            </span>
          </div>

          {/* Year-To-Date (YTD) */}
          <div className="p-3.5 rounded-2xl bg-surface-subtle/70 border border-border-subtle">
            <span className="text-[9px] font-black uppercase tracking-wider text-muted block mb-1">
              YTD Earnings (2026)
            </span>
            <div className="text-base font-black text-foreground">
              ₹ {ytdEarnings.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-muted font-medium block mt-0.5">
              {paidCyclesCount} Paid {paidCyclesCount === 1 ? 'Cycle' : 'Cycles'}
            </span>
          </div>
        </div>
      </div>

      {/* Card Footer notice */}
      <div className="mt-5 pt-4 border-t border-border-subtle flex items-center justify-between text-[11px] text-muted font-medium">
        <span className="flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span>Salary records secured by role-based employee privacy policy</span>
        </span>
        <button
          onClick={() => navigate('/finance/payroll')}
          className="text-primary hover:underline font-bold text-[10px] uppercase tracking-wider cursor-pointer">
          Detailed Payroll & Taxes →
        </button>
      </div>
    </div>
  );
};
