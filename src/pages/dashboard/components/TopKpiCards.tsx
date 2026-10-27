import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  Flame,
  CalendarCheck,
  CalendarDays,
  FileCheck2,
  Calendar,
  Home,
  Package,
  ArrowUpRight,
  LogIn,
  LogOut,
} from 'lucide-react';
import type { DashboardSummaryData } from '@/types/dashboard';
import { useCheckInMutation, useCheckOutMutation } from '@/store/api/attendanceSlice';
import { showToast } from '@/components/ui/composed/Toast.utils';
import { broadcastSync } from '@/services/syncService';

interface TopKpiCardsProps {
  data: DashboardSummaryData | null;
  isLoading: boolean;
}

export const TopKpiCards: React.FC<TopKpiCardsProps> = ({ data, isLoading }) => {
  const navigate = useNavigate();
  const [checkIn, { isLoading: isCheckingIn }] = useCheckInMutation();
  const [checkOut, { isLoading: isCheckingOut }] = useCheckOutMutation();

  const handleQuickCheckIn = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await checkIn({ work_mode: 'office' }).unwrap();
      showToast.success('Checked in successfully!');
      broadcastSync('attendance');
    } catch (err: any) {
      showToast.error(err?.data?.message || 'Check-in failed');
    }
  };

  const handleQuickCheckOut = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await checkOut().unwrap();
      showToast.success('Checked out successfully!');
      broadcastSync('attendance');
    } catch (err: any) {
      showToast.error(err?.data?.message || 'Check-out failed');
    }
  };

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="h-32 rounded-2xl bg-surface-elevated border border-border-subtle p-4 animate-pulse flex flex-col justify-between shadow-soft">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-surface-subtle" />
              <div className="w-16 h-3.5 rounded-full bg-surface-subtle" />
            </div>
            <div>
              <div className="w-24 h-5 rounded-lg bg-surface-subtle mb-1.5" />
              <div className="w-32 h-3 rounded-md bg-surface-subtle" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const { attendance, payroll, calendarAndLeave, inventory } = data;
  const isCheckedIn = attendance.todayStatus === 'checked-in';
  const isCheckedOut = attendance.todayStatus === 'checked-out';

  // Format check-in/out times
  const checkInTimeStr = attendance.todayRecord?.checkInTime
    ? new Date(attendance.todayRecord.checkInTime).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    : null;

  const checkOutTimeStr = attendance.todayRecord?.checkOutTime
    ? new Date(attendance.todayRecord.checkOutTime).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    : null;

  const nextSalarySchedule = payroll.nextSalarySchedule;
  const payslip = payroll.currentMonthPayslip;

  // WFH details
  const isTodayWfh = attendance.todayRecord?.workMode === 'wfh' || calendarAndLeave.wfhStats?.isTodayWfh;
  const wfhDaysMonth = calendarAndLeave.wfhStats?.approvedWfhDaysThisMonth ?? 0;
  const pendingWfhLeaves = calendarAndLeave.myUpcomingLeaves.filter(
    (l) => l.type === 'Work from home' && l.status === 'Pending'
  );
  const upcomingApprovedWfh = calendarAndLeave.myUpcomingLeaves.filter(
    (l) => l.type === 'Work from home' && l.status === 'Approved'
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
      {/* 1. Today's Attendance Status */}
      <motion.div
        whileHover={{ y: -3 }}
        transition={{ duration: 0.15 }}
        onClick={() => navigate('/checkin')}
        className="group relative bg-surface-elevated rounded-2xl p-4 border border-border-subtle shadow-soft hover:shadow-md hover:border-primary/30 transition-all cursor-pointer flex flex-col justify-between overflow-hidden min-h-[145px]">
        <div className="flex items-start justify-between">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
              isCheckedIn
                ? 'bg-emerald-500/10 text-emerald-600'
                : isCheckedOut
                  ? 'bg-blue-500/10 text-blue-600'
                  : 'bg-amber-500/10 text-amber-600'
            }`}>
            <Clock size={18} />
          </div>
          <span
            className={`text-[8.5px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
              isCheckedIn
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : isCheckedOut
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
            {isCheckedIn ? 'ACTIVE' : isCheckedOut ? 'COMPLETED' : 'OFFLINE'}
          </span>
        </div>

        <div className="mt-2.5">
          <span className="text-[9.5px] font-black text-muted uppercase tracking-[0.16em]">
            Today's Attendance
          </span>
          <h3 className="text-lg font-black text-foreground tracking-tight mt-0.5">
            {isCheckedIn ? 'Checked In' : isCheckedOut ? 'Checked Out' : 'Not Checked In'}
          </h3>
          <p className="text-[11px] font-medium text-muted mt-0.5 truncate">
            {checkInTimeStr
              ? `In: ${checkInTimeStr}${checkOutTimeStr ? ` · Out: ${checkOutTimeStr}` : ''}`
              : 'Tap to punch attendance'}
          </p>
        </div>

        {/* Quick Punch Button inside card */}
        <div className="mt-2.5 pt-2 border-t border-border-subtle flex items-center justify-between">
          <span className="text-[9.5px] font-bold text-muted">
            {isTodayWfh ? 'WFH Shift' : 'Office Shift'}
          </span>
          {isCheckedIn ? (
            <button
              onClick={handleQuickCheckOut}
              disabled={isCheckingOut}
              className="px-2.5 py-0.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[9.5px] font-black uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer">
              <LogOut size={11} />
              <span>{isCheckingOut ? '...' : 'Check Out'}</span>
            </button>
          ) : (
            <button
              onClick={handleQuickCheckIn}
              disabled={isCheckingIn || isCheckedOut}
              className="px-2.5 py-0.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-[9.5px] font-black uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50">
              <LogIn size={11} />
              <span>{isCheckingIn ? '...' : isCheckedOut ? 'Punched' : 'Check In'}</span>
            </button>
          )}
        </div>
      </motion.div>

      {/* 2. Attendance Streak */}
      <motion.div
        whileHover={{ y: -3 }}
        transition={{ duration: 0.15 }}
        onClick={() => navigate('/checkin')}
        className="group relative bg-surface-elevated rounded-2xl p-4 border border-border-subtle shadow-soft hover:shadow-md hover:border-primary/30 transition-all cursor-pointer flex flex-col justify-between overflow-hidden min-h-[145px]">
        <div className="flex items-start justify-between">
          <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center">
            <Flame size={18} className="animate-pulse" />
          </div>
          <span className="text-[8.5px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
            STREAK
          </span>
        </div>

        <div className="mt-2.5">
          <span className="text-[9.5px] font-black text-muted uppercase tracking-[0.16em]">
            Current Streak
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <h3 className="text-xl font-black text-foreground tracking-tight">
              {attendance.currentStreak} {attendance.currentStreak === 1 ? 'Day' : 'Days'}
            </h3>
            <span className="text-[9.5px] font-bold text-emerald-600">active</span>
          </div>
          <p className="text-[11px] font-medium text-muted mt-0.5">
            Longest record: <span className="font-bold text-foreground">{attendance.longestStreak} days</span>
          </p>
        </div>

        <div className="mt-2.5 pt-2 border-t border-border-subtle flex items-center justify-between text-[9.5px]">
          <span className="text-muted font-bold capitalize">{attendance.streakType} streak</span>
          <ArrowUpRight size={13} className="text-muted group-hover:text-primary transition-colors" />
        </div>
      </motion.div>

      {/* 3. Monthly Attendance Summary */}
      <motion.div
        whileHover={{ y: -3 }}
        transition={{ duration: 0.15 }}
        onClick={() => navigate('/checkin')}
        className="group relative bg-surface-elevated rounded-2xl p-4 border border-border-subtle shadow-soft hover:shadow-md hover:border-primary/30 transition-all cursor-pointer flex flex-col justify-between overflow-hidden min-h-[145px]">
        <div className="flex items-start justify-between">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
            <CalendarCheck size={18} />
          </div>
          <span className="text-[8.5px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            {attendance.monthlyStats.attendancePercentage}% RATE
          </span>
        </div>

        <div className="mt-2.5">
          <span className="text-[9.5px] font-black text-muted uppercase tracking-[0.16em]">
            Monthly Attendance
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <h3 className="text-xl font-black text-foreground tracking-tight">
              {attendance.monthlyStats.totalCheckedInDays} Days
            </h3>
            <span className="text-[9.5px] font-bold text-muted">
              of {attendance.monthlyStats.workingDaysSoFar} working
            </span>
          </div>
          <p className="text-[11px] font-medium text-muted mt-0.5">
            {attendance.monthlyStats.lateArrivals} late · {attendance.monthlyStats.missedCheckouts} missed checkout
          </p>
        </div>

        <div className="mt-2.5 pt-2 border-t border-border-subtle flex items-center justify-between text-[9.5px]">
          <span className="text-muted font-bold">Month to date</span>
          <ArrowUpRight size={13} className="text-muted group-hover:text-primary transition-colors" />
        </div>
      </motion.div>

      {/* 4. Dedicated Prominent Work From Home (WFH) Card */}
      <motion.div
        whileHover={{ y: -3 }}
        transition={{ duration: 0.15 }}
        onClick={() => navigate('/calendar')}
        className="group relative bg-gradient-to-br from-indigo-500/5 via-surface-elevated to-surface-elevated rounded-2xl p-4 border border-indigo-500/20 hover:border-indigo-500/40 shadow-soft hover:shadow-md transition-all cursor-pointer flex flex-col justify-between overflow-hidden min-h-[145px]">
        <div className="flex items-start justify-between">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-600 flex items-center justify-center">
            <Home size={18} />
          </div>
          <span
            className={`text-[8.5px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
              isTodayWfh
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-indigo-50 text-indigo-700 border-indigo-200'
            }`}>
            {isTodayWfh ? 'WFH TODAY' : 'REMOTE'}
          </span>
        </div>

        <div className="mt-2.5">
          <span className="text-[9.5px] font-black text-indigo-600 uppercase tracking-[0.16em]">
            Work From Home
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <h3 className="text-xl font-black text-foreground tracking-tight">
              {wfhDaysMonth} {wfhDaysMonth === 1 ? 'Day' : 'Days'}
            </h3>
            <span className="text-[9.5px] font-bold text-muted">this month</span>
          </div>
          <p className="text-[11px] font-medium text-muted mt-0.5 truncate">
            {pendingWfhLeaves.length > 0
              ? `${pendingWfhLeaves.length} pending WFH request${pendingWfhLeaves.length > 1 ? 's' : ''}`
              : upcomingApprovedWfh.length > 0
                ? `${upcomingApprovedWfh.length} scheduled WFH day${upcomingApprovedWfh.length > 1 ? 's' : ''}`
                : isTodayWfh ? 'Active WFH session today' : 'No pending WFH requests'}
          </p>
        </div>

        <div className="mt-2.5 pt-2 border-t border-border-subtle flex items-center justify-between text-[9.5px]">
          <span className="text-indigo-600 font-bold group-hover:underline">
            Request WFH / Calendar
          </span>
          <ArrowUpRight size={13} className="text-indigo-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>
      </motion.div>

      {/* 5. Next Expected Salary */}
      <motion.div
        whileHover={{ y: -3 }}
        transition={{ duration: 0.15 }}
        onClick={() => navigate('/finance/payroll')}
        className="group relative bg-surface-elevated rounded-2xl p-4 border border-border-subtle shadow-soft hover:shadow-md hover:border-primary/30 transition-all cursor-pointer flex flex-col justify-between overflow-hidden min-h-[145px]">
        <div className="flex items-start justify-between">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <CalendarDays size={18} />
          </div>
          <span
            className={`text-[8.5px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
              nextSalarySchedule.status === 'Paid'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-primary/10 text-primary border-primary/20'
            }`}>
            {nextSalarySchedule.status}
          </span>
        </div>

        <div className="mt-2.5">
          <span className="text-[9.5px] font-black text-muted uppercase tracking-[0.16em]">
            Next Salary Date
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <h3 className="text-xl font-black text-foreground tracking-tight">
              {new Date(nextSalarySchedule.expectedDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </h3>
            <span className="text-[9.5px] font-bold text-primary">
              {nextSalarySchedule.dayName}
            </span>
          </div>
          <p className="text-[11px] font-medium text-muted mt-0.5 truncate">
            {nextSalarySchedule.wasAdjustedForSunday
              ? 'Sunday adjusted to Monday'
              : `In ${nextSalarySchedule.daysRemaining} days`}
          </p>
        </div>

        <div className="mt-2.5 pt-2 border-t border-border-subtle flex items-center justify-between text-[9.5px]">
          <span className="text-muted font-bold">Payroll Schedule</span>
          <ArrowUpRight size={13} className="text-muted group-hover:text-primary transition-colors" />
        </div>
      </motion.div>

      {/* 6. Payslip Availability */}
      <motion.div
        whileHover={{ y: -3 }}
        transition={{ duration: 0.15 }}
        onClick={() => navigate('/finance/my-payslip')}
        className="group relative bg-surface-elevated rounded-2xl p-4 border border-border-subtle shadow-soft hover:shadow-md hover:border-primary/30 transition-all cursor-pointer flex flex-col justify-between overflow-hidden min-h-[145px]">
        <div className="flex items-start justify-between">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
            <FileCheck2 size={18} />
          </div>
          <span
            className={`text-[8.5px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
              payslip.available
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-zinc-100 text-zinc-600 border-zinc-200'
            }`}>
            {payslip.available ? 'GENERATED' : 'UPCOMING'}
          </span>
        </div>

        <div className="mt-2.5">
          <span className="text-[9.5px] font-black text-muted uppercase tracking-[0.16em]">
            Payslip Availability
          </span>
          <h3 className="text-lg font-black text-foreground tracking-tight mt-0.5 truncate">
            {payslip.available ? payslip.paySlipNo : 'Not Yet Available'}
          </h3>
          <p className="text-[11px] font-medium text-muted mt-0.5 truncate">
            {payslip.available && payslip.netSalary
              ? `Net: ₹ ${payslip.netSalary.toLocaleString('en-IN')}`
              : 'Disburses on cycle completion'}
          </p>
        </div>

        <div className="mt-2.5 pt-2 border-t border-border-subtle flex items-center justify-between text-[9.5px]">
          <span className="text-muted font-bold">
            {payslip.available ? 'View & Download' : 'My Payslips'}
          </span>
          <ArrowUpRight size={13} className="text-muted group-hover:text-primary transition-colors" />
        </div>
      </motion.div>

      {/* 7. Upcoming Activities */}
      <motion.div
        whileHover={{ y: -3 }}
        transition={{ duration: 0.15 }}
        onClick={() => navigate('/events')}
        className="group relative bg-surface-elevated rounded-2xl p-4 border border-border-subtle shadow-soft hover:shadow-md hover:border-primary/30 transition-all cursor-pointer flex flex-col justify-between overflow-hidden min-h-[145px]">
        <div className="flex items-start justify-between">
          <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
            <Calendar size={18} />
          </div>
          <span className="text-[8.5px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            {calendarAndLeave.upcomingEvents.length} UPCOMING
          </span>
        </div>

        <div className="mt-2.5">
          <span className="text-[9.5px] font-black text-muted uppercase tracking-[0.16em]">
            Upcoming Activities
          </span>
          <h3 className="text-lg font-black text-foreground tracking-tight mt-0.5 truncate">
            {calendarAndLeave.upcomingEvents[0]?.title || 'No Pending Events'}
          </h3>
          <p className="text-[11px] font-medium text-muted mt-0.5 truncate">
            {calendarAndLeave.upcomingEvents[0]?.time || 'Check organization calendar'}
          </p>
        </div>

        <div className="mt-2.5 pt-2 border-t border-border-subtle flex items-center justify-between text-[9.5px]">
          <span className="text-muted font-bold">Company Calendar</span>
          <ArrowUpRight size={13} className="text-muted group-hover:text-primary transition-colors" />
        </div>
      </motion.div>

      {/* 8. Inventory & Assets */}
      <motion.div
        whileHover={{ y: -3 }}
        transition={{ duration: 0.15 }}
        onClick={() => navigate('/inventory')}
        className="group relative bg-surface-elevated rounded-2xl p-4 border border-border-subtle shadow-soft hover:shadow-md hover:border-primary/30 transition-all cursor-pointer flex flex-col justify-between overflow-hidden min-h-[145px]">
        <div className="flex items-start justify-between">
          <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center">
            <Package size={18} />
          </div>
          <span className="text-[8.5px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
            {inventory.totalItems} ITEMS
          </span>
        </div>

        <div className="mt-2.5">
          <span className="text-[9.5px] font-black text-muted uppercase tracking-[0.16em]">
            Inventory & Assets
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <h3 className="text-xl font-black text-foreground tracking-tight">
              {inventory.availableItems} Available
            </h3>
            <span className="text-[9.5px] font-bold text-muted">
              · {inventory.myAssignedCount} assigned
            </span>
          </div>
          <p className="text-[11px] font-medium text-muted mt-0.5 truncate">
            {inventory.lowStockItems > 0 ? (
              <span className="text-amber-600 font-bold">
                {inventory.lowStockItems} low stock alert
              </span>
            ) : (
              'All stock levels optimal'
            )}
          </p>
        </div>

        <div className="mt-2.5 pt-2 border-t border-border-subtle flex items-center justify-between text-[9.5px]">
          <span className="text-muted font-bold">Asset Logistics</span>
          <ArrowUpRight size={13} className="text-muted group-hover:text-primary transition-colors" />
        </div>
      </motion.div>
    </div>
  );
};
