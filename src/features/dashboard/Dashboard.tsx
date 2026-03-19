import React from 'react';
import DashboardHeader from '@/features/dashboard/components/DashboardHeader';
import DashboardProjectGrid from '@/features/dashboard/components/DashboardProjectGrid';
import DashboardBottomStats from '@/features/dashboard/components/DashboardBottomStats';
import DashboardCalendar from '@/features/dashboard/components/DashboardCalendar';

const Dashboard: React.FC = () => {
  return (
    <div className="w-full h-full flex flex-col gap-6 max-w-350 mx-auto p-4 lg:p-8 overflow-y-auto">
      <DashboardHeader />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1 min-h-0">
        <div className="xl:col-span-2 flex flex-col gap-6">
          <DashboardProjectGrid />
          <DashboardBottomStats />
        </div>

        <div className="xl:col-span-1">
          <DashboardCalendar />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
