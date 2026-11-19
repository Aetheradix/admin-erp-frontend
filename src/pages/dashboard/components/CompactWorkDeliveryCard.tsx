import { useState } from 'react';
import { Tabs } from 'antd';
import { Activity, Calendar, FolderKanban, ListTodo, Package } from 'lucide-react';
import type { Project, Task } from '@/types/models';
import type {
  DashboardAttendance,
  DashboardCalendarAndLeave,
  DashboardInventory,
} from '@/types/dashboard';
import { cn } from '@/utils/cn';
import { DASHBOARD_CARD_CLASS } from '../constants';
import { buildActivityTimeline } from '../utils/workDelivery';
import { ActivityTab } from './work-delivery/ActivityTab';
import { AssetsTab } from './work-delivery/AssetsTab';
import { LeavesTab } from './work-delivery/LeavesTab';
import { ProjectsTab } from './work-delivery/ProjectsTab';
import { TasksTab } from './work-delivery/TasksTab';
import { TabLabel } from './work-delivery/WorkDeliveryPrimitives';
import { WorkDeliveryHeader } from './work-delivery/WorkDeliveryHeader';

interface CompactWorkDeliveryCardProps {
  projects: Project[];
  totalTasks: number;
  completedTasks: number;
  taskCompletionRate: number;
  calendarAndLeave: DashboardCalendarAndLeave | null;
  inventory: DashboardInventory | null;
  attendance?: DashboardAttendance | null;
  tasks?: Task[];
}

export function CompactWorkDeliveryCard({
  projects,
  totalTasks,
  completedTasks,
  taskCompletionRate,
  calendarAndLeave,
  inventory,
  attendance,
  tasks = [],
}: CompactWorkDeliveryCardProps) {
  const [activeTab, setActiveTab] = useState('projects');
  const [searchQuery, setSearchQuery] = useState('');

  const upcomingLeaves = calendarAndLeave?.myUpcomingLeaves || [];
  const assignedAssets = inventory?.myAssignedAssets || [];
  const activityTimeline = buildActivityTimeline(attendance, calendarAndLeave, inventory);

  return (
    <div className={cn(DASHBOARD_CARD_CLASS, 'h-full flex flex-col justify-between')}>
      <WorkDeliveryHeader
        completedTasks={completedTasks}
        totalTasks={totalTasks}
        taskCompletionRate={taskCompletionRate}
      />

      <div className="flex-1 flex flex-col pt-1">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          className="compact-dashboard-tabs flex-1 flex flex-col"
          items={[
            {
              key: 'projects',
              label: <TabLabel icon={FolderKanban}>Active Projects ({projects.length})</TabLabel>,
              children: (
                <ProjectsTab
                  projects={projects}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                />
              ),
            },
            {
              key: 'tasks',
              label: <TabLabel icon={ListTodo}>Tasks ({tasks.length})</TabLabel>,
              children: <TasksTab tasks={tasks} />,
            },
            {
              key: 'activity',
              label: <TabLabel icon={Activity}>Recent Activity ({activityTimeline.length})</TabLabel>,
              children: <ActivityTab items={activityTimeline} />,
            },
            {
              key: 'leaves',
              label: <TabLabel icon={Calendar}>My Schedules ({upcomingLeaves.length})</TabLabel>,
              children: <LeavesTab leaves={upcomingLeaves} />,
            },
            {
              key: 'assets',
              label: <TabLabel icon={Package}>Assigned Assets ({assignedAssets.length})</TabLabel>,
              children: <AssetsTab assets={assignedAssets} />,
            },
          ]}
        />
      </div>
    </div>
  );
}