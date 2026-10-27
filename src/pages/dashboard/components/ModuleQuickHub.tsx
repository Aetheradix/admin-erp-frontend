import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  CheckSquare,
  CreditCard,
  Users,
  Package,
  Settings,
  ArrowUpRight,
  Calendar,
} from 'lucide-react';
import type { DashboardSummaryData } from '@/types/dashboard';

interface LiveCounts {
  isCheckedIn: boolean;
  tasks: number;
  reimbursements: number;
  users: number;
  projects: number;
}

interface Stats {
  completedTasks: number;
  tasksVsLy: string;
}

interface ModuleQuickHubProps {
  liveCounts: LiveCounts;
  stats: Stats;
  summary?: DashboardSummaryData | null;
}

export const ModuleQuickHub: React.FC<ModuleQuickHubProps> = ({ liveCounts, stats, summary }) => {
  const navigate = useNavigate();

  const inventoryTotal = summary?.inventory?.totalItems ?? 0;
  const inventoryAvailable = summary?.inventory?.availableItems ?? 0;
  const ytdPayroll = summary?.payroll?.ytdEarnings ?? 0;

  const moduleCards = [
    {
      title: 'Check-In Status',
      value: liveCounts.isCheckedIn ? 'Checked In' : 'Checked Out',
      subtitle: summary?.attendance?.todayRecord?.checkInTime
        ? `Since ${new Date(summary.attendance.todayRecord.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
        : 'Attendance velocity',
      icon: Clock,
      route: '/checkin',
      color: liveCounts.isCheckedIn
        ? 'text-emerald-500 bg-emerald-500/10'
        : 'text-amber-500 bg-amber-500/10',
      badge: liveCounts.isCheckedIn ? 'ACTIVE' : 'OFFLINE',
    },
    {
      title: 'Active Tasks',
      value: `${liveCounts.tasks} Tasks`,
      subtitle: `${stats.completedTasks} Completed`,
      icon: CheckSquare,
      route: '/tasks',
      color: 'text-primary bg-primary/10',
      badge: `${stats.tasksVsLy}`,
    },
    {
      title: 'Payroll & Earnings',
      value: ytdPayroll > 0 ? `₹ ${Math.round(ytdPayroll).toLocaleString('en-IN')}` : `${liveCounts.reimbursements} Claims`,
      subtitle: `${summary?.payroll?.paidCyclesCount || 0} Cycles Disbursed`,
      icon: CreditCard,
      route: '/finance/payroll',
      color: 'text-purple-500 bg-purple-500/10',
      badge: summary?.payroll?.nextSalarySchedule?.status || 'SCHEDULED',
    },
    {
      title: 'Organization Staff',
      value: `${liveCounts.users} Members`,
      subtitle: 'Active Directory',
      icon: Users,
      route: '/staff',
      color: 'text-blue-500 bg-blue-500/10',
      badge: 'TEAM',
    },
    {
      title: 'Inventory Assets',
      value: `${inventoryTotal} Items`,
      subtitle: `${inventoryAvailable} Available Stock`,
      icon: Package,
      route: '/inventory',
      color: 'text-teal-500 bg-teal-500/10',
      badge: `${inventoryAvailable} READY`,
    },
    {
      title: 'Calendar & Meets',
      value: `${summary?.calendarAndLeave?.upcomingEvents?.length || 0} Events`,
      subtitle: 'Upcoming Schedules',
      icon: Calendar,
      route: '/events',
      color: 'text-indigo-500 bg-indigo-500/10',
      badge: 'EVENTS',
    },
    {
      title: 'System Settings',
      value: 'Configured',
      subtitle: 'Security & Profile',
      icon: Settings,
      route: '/settings',
      color: 'text-slate-500 bg-slate-500/10',
      badge: 'PREFS',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="mb-8">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {moduleCards.map((card) => (
          <motion.div
            key={card.title}
            whileHover={{ y: -3, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(card.route)}
            className="group relative bg-surface-elevated rounded-2xl p-4 border border-border-subtle shadow-soft hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden">
            {/* Top Row: Icon & Status Badge */}
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center ${card.color} group-hover:scale-110 transition-transform duration-300`}>
                <card.icon size={16} />
              </div>
              <span className="text-[9px] font-black uppercase tracking-wider text-muted/80 bg-surface-subtle px-2 py-0.5 rounded-full border border-border-subtle">
                {card.badge}
              </span>
            </div>

            {/* Bottom Row: Metric Text */}
            <div>
              <span className="text-[9px] font-black text-muted uppercase tracking-[0.15em] block truncate mb-0.5">
                {card.title}
              </span>
              <h4 className="text-sm font-black text-foreground tracking-tight group-hover:text-primary transition-colors truncate">
                {card.value}
              </h4>
              <p className="text-[10px] font-semibold text-muted/70 truncate mt-0.5">
                {card.subtitle}
              </p>
            </div>

            {/* Hover Indicator Corner */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowUpRight size={12} className="text-primary" />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
