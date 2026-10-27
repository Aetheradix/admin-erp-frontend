import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  LogIn,
  LogOut,
  Calendar,
  Home,
  FileText,
  Package,
} from 'lucide-react';
import { useCheckInMutation, useCheckOutMutation } from '@/store/api/attendanceSlice';
import { showToast } from '@/components/ui/composed/Toast.utils';
import { broadcastSync } from '@/services/syncService';

interface QuickActionsBarProps {
  isCheckedIn: boolean;
  onOpenScanModal?: () => void;
}

export const QuickActionsBar: React.FC<QuickActionsBarProps> = ({ isCheckedIn, onOpenScanModal }) => {
  const navigate = useNavigate();
  const [checkIn, { isLoading: isCheckingIn }] = useCheckInMutation();
  const [checkOut, { isLoading: isCheckingOut }] = useCheckOutMutation();

  const handleToggleAttendance = async () => {
    try {
      if (isCheckedIn) {
        await checkOut().unwrap();
        showToast.success('Successfully checked out');
      } else {
        await checkIn({ work_mode: 'office' }).unwrap();
        showToast.success('Successfully checked in');
      }
      broadcastSync('attendance');
    } catch (err: any) {
      showToast.error(err?.data?.message || 'Attendance action failed');
    }
  };

  const actions = [
    {
      id: 'attendance',
      label: isCheckedIn ? 'Check Out' : 'Check In',
      subtitle: isCheckedIn ? 'End Shift' : 'Punch Now',
      icon: isCheckedIn ? LogOut : LogIn,
      onClick: handleToggleAttendance,
      isLoading: isCheckingIn || isCheckingOut,
      primary: true,
      color: isCheckedIn ? 'bg-amber-500 hover:bg-amber-600' : 'bg-primary hover:bg-primary-hover',
    },
    {
      id: 'leave',
      label: 'Apply for Leave',
      subtitle: 'Day Off / Sick',
      icon: Calendar,
      onClick: () => navigate('/calendar'),
      color: 'bg-surface-elevated hover:bg-surface-subtle border border-border-subtle text-foreground',
    },
    {
      id: 'wfh',
      label: 'Request WFH',
      subtitle: 'Remote Work',
      icon: Home,
      onClick: () => navigate('/calendar'),
      color: 'bg-surface-elevated hover:bg-surface-subtle border border-border-subtle text-foreground',
    },
    {
      id: 'payslip',
      label: 'View Payslips',
      subtitle: 'Salary & Taxes',
      icon: FileText,
      onClick: () => navigate('/finance/my-payslip'),
      color: 'bg-surface-elevated hover:bg-surface-subtle border border-border-subtle text-foreground',
    },
    {
      id: 'calendar',
      label: 'Events & Meet',
      subtitle: 'All Schedules',
      icon: Calendar,
      onClick: () => navigate('/events'),
      color: 'bg-surface-elevated hover:bg-surface-subtle border border-border-subtle text-foreground',
    },
    {
      id: 'inventory',
      label: 'Inventory & Assets',
      subtitle: 'Scan & Track',
      icon: Package,
      onClick: onOpenScanModal || (() => navigate('/inventory')),
      color: 'bg-surface-elevated hover:bg-surface-subtle border border-border-subtle text-foreground',
    },
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-muted">
          Quick Workflow Actions
        </span>
        <div className="h-px bg-border-subtle flex-1" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {actions.map((act) => (
          <motion.button
            key={act.id}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.98 }}
            onClick={act.onClick}
            disabled={act.isLoading}
            className={`p-4 rounded-2xl flex flex-col items-start justify-between min-h-[92px] transition-all cursor-pointer shadow-soft group ${
              act.primary ? `${act.color} text-white` : `${act.color}`
            }`}>
            <div className="flex items-center justify-between w-full">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  act.primary ? 'bg-white/20 text-white' : 'bg-surface-subtle text-primary group-hover:scale-110 transition-transform'
                }`}>
                <act.icon size={16} />
              </div>
              <span className={`text-[9px] font-bold ${act.primary ? 'text-white/80' : 'text-muted'}`}>
                {act.subtitle}
              </span>
            </div>

            <div className="mt-3 text-left">
              <span className="text-xs font-black tracking-tight block">
                {act.isLoading ? 'Processing...' : act.label}
              </span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};
