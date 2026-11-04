import React from 'react';
import { motion } from 'framer-motion';
import { useProfile } from '../profile/hooks/useProfile';
import { useDashboardData } from './hooks/useDashboardData';

import { DashboardWelcomeBar } from './components/DashboardWelcomeBar';
import { CompactKpiRow } from './components/CompactKpiRow';
import { CompactAttendanceHeatmap } from './components/CompactAttendanceHeatmap';
import { CompactWorkDeliveryCard } from './components/CompactWorkDeliveryCard';
import { CompactHolidayCalendarCard } from './components/CompactHolidayCalendarCard';
import { CompactPayrollCard } from './components/CompactPayrollCard';
import { CompactPendingActionsCard } from './components/CompactPendingActionsCard';
import { CompactQuickActions } from './components/CompactQuickActions';

const Dashboard: React.FC = () => {
  const { summary, projects, isLoading, stats, tasks } = useDashboardData();
  const { user } = useProfile();

  const userRole = user.roles?.[0]?.name || user.designation || 'Staff Member';
  const isCheckedIn = summary?.attendance?.todayStatus === 'checked-in';

  const totalTasks = stats?.totalTasks || summary?.projects?.totalTasks || 0;
  const completedTasks = stats?.completedTasks || summary?.projects?.completedTasks || 0;
  const taskCompletionRate = stats?.tasksVsLy ? parseInt(stats.tasksVsLy) || 0 : summary?.projects?.taskCompletionRate || 0;

  return (
    <div className="space-y-3.5 pb-8 antialiased">
      <h1 className="sr-only">StartupOS Enterprise Dashboard</h1>

      {/* Section A: Linear-style Compact Welcome Bar */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}>
        <DashboardWelcomeBar
          userName={user.name}
          userRole={userRole}
          attendance={summary?.attendance || null}
          isLoading={isLoading}
        />
      </motion.div>

      {/* Section B: Compact 7-Item Employee KPI Row */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}>
        <CompactKpiRow data={summary || null} isLoading={isLoading} />
      </motion.div>

      {/* Section C: Balanced Main Content Grid (62% Left / 38% Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
        {/* Left Column (60-65%): Attendance Heatmap & Work Delivery Hub */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-3.5">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}>
            <CompactAttendanceHeatmap />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.15 }}
            className="flex-1 flex flex-col">
            <CompactWorkDeliveryCard
              projects={projects}
              totalTasks={totalTasks}
              completedTasks={completedTasks}
              taskCompletionRate={taskCompletionRate}
              calendarAndLeave={summary?.calendarAndLeave || null}
              inventory={summary?.inventory || null}
              attendance={summary?.attendance || null}
              tasks={tasks}
            />
          </motion.div>
        </div>

        {/* Right Column (35-40%): Holidays, Payroll & Pending Attention */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-3.5 justify-between">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.12 }}>
            <CompactHolidayCalendarCard />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.18 }}>
            <CompactPayrollCard
              payroll={summary?.payroll || null}
              isLoading={isLoading}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.22 }}
            className="flex-1 flex flex-col">
            <CompactPendingActionsCard
              calendarAndLeave={summary?.calendarAndLeave || null}
              totalTasks={totalTasks}
              completedTasks={completedTasks}
            />
          </motion.div>
        </div>
      </div>

      {/* Section D: Compact 1-Click Workflow Actions Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.25 }}>
        <CompactQuickActions isCheckedIn={isCheckedIn} />
      </motion.div>
    </div>
  );
};

export default Dashboard;
