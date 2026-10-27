import React from 'react';
import { useProfile } from '../profile/hooks/useProfile';
import { useDashboardData } from './hooks/useDashboardData';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Settings,
  Calendar,
} from 'lucide-react';

import { TopKpiCards } from './components/TopKpiCards';
import { AttendanceHeatmapCard } from './components/AttendanceHeatmapCard';
import { PayrollOverviewCard } from './components/PayrollOverviewCard';
import { UpcomingActivitiesCard } from './components/UpcomingActivitiesCard';
import { InventoryOverviewCard } from './components/InventoryOverviewCard';
import { QuickActionsBar } from './components/QuickActionsBar';
import { ProjectList } from './components/ProjectList';

const Dashboard: React.FC = () => {
  const { summary, projects, isLoading, liveCounts } = useDashboardData();
  const { user } = useProfile();
  const navigate = useNavigate();

  const isCheckedIn = summary?.attendance?.todayStatus === 'checked-in';
  const userRole = user.roles?.[0]?.name || user.designation || 'Staff Member';

  const formattedToday = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen pb-16">
      <h1 className="sr-only">StartupOS Enterprise Dashboard</h1>

      {/* Section A: Compact Header — Welcome & Date */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.25em]">
              StartupOS
            </span>
            <span className="text-[10px] text-muted font-bold">·</span>
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider">
              {userRole}
            </span>
            <span className="text-[10px] text-muted font-bold">·</span>
            <span className="text-[10px] font-semibold text-muted flex items-center gap-1">
              <Calendar size={11} className="text-muted/70" />
              <span>{formattedToday}</span>
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Welcome back, {user.name}
          </h2>
        </div>

        {/* Quick Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/settings')}
            className="px-3.5 py-1.5 rounded-2xl bg-primary text-white text-[11px] font-black uppercase tracking-wider hover:bg-primary-hover transition-colors shadow-xs cursor-pointer flex items-center gap-1.5">
            <Settings size={13} />
            <span>Settings</span>
          </button>
        </div>
      </motion.div>

      {/* Section B: Compact 8 KPI Cards Grid (Prioritizing above-fold visibility) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}>
        <TopKpiCards data={summary || null} isLoading={isLoading} />
      </motion.div>

      {/* Section C: Full-Width Attendance Streak Heatmap Section */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1 }}
        className="mb-6 w-full">
        <AttendanceHeatmapCard
          currentStreak={summary?.attendance?.currentStreak}
          longestStreak={summary?.attendance?.longestStreak}
          monthlyPresentDays={summary?.attendance?.monthlyStats?.totalCheckedInDays}
          wfhDaysThisMonth={summary?.calendarAndLeave?.wfhStats?.approvedWfhDaysThisMonth}
          leavesThisMonth={summary?.calendarAndLeave?.myUpcomingLeaves?.length}
        />
      </motion.div>

      {/* Section D: Two-Column Operational Overview - Symmetrically Balanced */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Left Column (50%): Active Projects & Tasks + Upcoming Activities */}
        <div className="flex flex-col gap-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15 }}>
            <ProjectList
              projects={projects}
              totalTasks={summary?.projects?.totalTasks || liveCounts.tasks}
              completedTasks={summary?.projects?.completedTasks}
              taskCompletionRate={summary?.projects?.taskCompletionRate}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.25 }}>
            <UpcomingActivitiesCard
              data={summary?.calendarAndLeave || null}
              isLoading={isLoading}
            />
          </motion.div>
        </div>

        {/* Right Column (50%): Payroll & Payslips + Inventory & Devices */}
        <div className="flex flex-col gap-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2 }}>
            <PayrollOverviewCard
              payroll={summary?.payroll || null}
              isLoading={isLoading}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.3 }}>
            <InventoryOverviewCard
              inventory={summary?.inventory || null}
              isLoading={isLoading}
            />
          </motion.div>
        </div>
      </div>

      {/* Section E: Quick Actions Row at Bottom */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.35 }}>
        <QuickActionsBar isCheckedIn={isCheckedIn} />
      </motion.div>
    </div>
  );
};

export default Dashboard;
