import { useGetProjectActivityQuery } from '@/store/api/projectApiSlice';
import { Spin, Tag } from 'antd';
import { Activity } from 'lucide-react';
import { ActivityTimeline } from '@/components/projects/ActivityTimeline';

interface ActivityTabProps {
  projectId: number;
}

export function ActivityTab({ projectId }: ActivityTabProps) {
  const { data: activities = [], isLoading } = useGetProjectActivityQuery({
    id: projectId,
    limit: 100,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spin size="large" tip="Loading activity..." />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-2 mb-4">
        <Activity size={16} className="text-primary" />
        <span className="font-bold text-sm">Project Activity Log</span>
        <Tag color="blue" className="ml-1">
          {activities.length} events
        </Tag>
      </div>
      <ActivityTimeline activities={activities} />
    </div>
  );
}
