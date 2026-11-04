import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogIn,
  LogOut,
  Calendar,
  Home,
  FileText,
  CalendarCheck2,
  Package,
} from 'lucide-react';
import { useCheckInMutation, useCheckOutMutation } from '@/store/api/attendanceSlice';
import { showToast } from '@/components/ui/composed/Toast.utils';
import { broadcastSync } from '@/services/syncService';

interface CompactQuickActionsProps {
  isCheckedIn: boolean;
}

export const CompactQuickActions: React.FC<CompactQuickActionsProps> = ({ isCheckedIn }) => {
  const navigate = useNavigate();
  const [checkIn, { isLoading: isCheckingIn }] = useCheckInMutation();
  const [checkOut, { isLoading: isCheckingOut }] = useCheckOutMutation();

  const handleToggleAttendance = async () => {
    try {
      if (isCheckedIn) {
        await checkOut().unwrap();
        showToast.success('Checked out successfully!');
      } else {
        await checkIn({ work_mode: 'office' }).unwrap();
        showToast.success('Checked in successfully!');
      }
      broadcastSync('attendance');
    } catch (err: any) {
      showToast.error(err?.data?.message || 'Attendance action failed');
    }
  };

  const actionItems = [
    {
      id: 'attendance',
      label: isCheckedIn ? 'Check Out' : 'Check In',
      desc: isCheckedIn ? 'End Shift' : 'Punch In',
      icon: isCheckedIn ? LogOut : LogIn,
      onClick: handleToggleAttendance,
      highlight: true,
      color: isCheckedIn ? 'text-amber-600' : 'text-primary',
      badge: isCheckedIn ? 'bg-amber-500/10' : 'bg-primary/10',
    },
    {
      id: 'leave',
      label: 'Apply for Leave',
      desc: 'Day Off / Sick',
      icon: Calendar,
      onClick: () => navigate('/calendar'),
      color: 'text-purple-600',
      badge: 'bg-purple-500/10',
    },
    {
      id: 'wfh',
      label: 'Request WFH',
      desc: 'Remote Day',
      icon: Home,
      onClick: () => navigate('/calendar'),
      color: 'text-indigo-600',
      badge: 'bg-indigo-500/10',
    },
    {
      id: 'payslips',
      label: 'View Payslips',
      desc: 'Salary & Taxes',
      icon: FileText,
      onClick: () => navigate('/finance/my-payslip'),
      color: 'text-emerald-600',
      badge: 'bg-emerald-500/10',
    },
    {
      id: 'events',
      label: 'Events & Meetings',
      desc: 'All Schedules',
      icon: CalendarCheck2,
      onClick: () => navigate('/events'),
      color: 'text-blue-600',
      badge: 'bg-blue-500/10',
    },
    {
      id: 'inventory',
      label: 'Inventory & Assets',
      desc: 'Devices & Track',
      icon: Package,
      onClick: () => navigate('/inventory'),
      color: 'text-zinc-600',
      badge: 'bg-zinc-500/10',
    },
  ];

  return (
    <div className="bg-white rounded-[12px] p-3.5 border border-border-subtle shadow-2xs">
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted">
          Quick Workflow Actions
        </span>
        <span className="text-[9px] text-muted font-medium">1-Click Shortcuts</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {actionItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={item.onClick}
              disabled={item.id === 'attendance' && (isCheckingIn || isCheckingOut)}
              className="p-2.5 rounded-xl bg-surface-subtle/70 hover:bg-surface-elevated border border-border-subtle/60 hover:border-border transition-all cursor-pointer flex items-center gap-2.5 text-left group disabled:opacity-50">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.badge} ${item.color} group-hover:scale-105 transition-transform`}>
                <Icon size={14} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                  {item.label}
                </p>
                <p className="text-[10px] text-muted truncate">
                  {item.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

