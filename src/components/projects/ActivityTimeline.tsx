import React from 'react';
import { Timeline, Tag, Tooltip, Empty } from 'antd';
import { User, Folder, Users } from 'lucide-react';
import type { ProjectActivity } from '@/store/api/projectApiSlice';

interface ActivityTimelineProps {
  activities: ProjectActivity[];
  className?: string;
}

const ACTION_CONFIG: Record<string, { color: string; label: string }> = {
  project_created: { color: 'green', label: 'Project Created' },
  project_updated: { color: 'blue', label: 'Project Updated' },
  project_deleted: { color: 'red', label: 'Project Deleted' },
  ownership_transferred: { color: 'purple', label: 'Ownership Transferred' },
  manager_updated: { color: 'gold', label: 'Manager Updated' },
  member_added: { color: 'cyan', label: 'Member Added' },
  member_removed: { color: 'orange', label: 'Member Removed' },
  task_created: { color: 'geekblue', label: 'Task Created' },
  task_updated: { color: 'blue', label: 'Task Updated' },
  task_reassigned: { color: 'magenta', label: 'Task Reassigned' },
};

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  activities,
  className = '',
}) => {
  if (!activities || activities.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="No activity recorded yet"
        className="py-12"
      />
    );
  }

  const items = activities.map((act) => {
    const cfg = ACTION_CONFIG[act.action] || { color: 'default', label: act.action };
    let newVal: Record<string, unknown> = {};
    let oldVal: Record<string, unknown> = {};
    try {
      if (act.new_value) newVal = JSON.parse(act.new_value);
    } catch {
      /* ignore */
    }
    try {
      if (act.old_value) oldVal = JSON.parse(act.old_value);
    } catch {
      /* ignore */
    }

    return {
      color: cfg.color,
      dot:
        act.entity_type === 'member' ? (
          <Users size={12} />
        ) : act.entity_type === 'task' ? (
          <Folder size={12} />
        ) : undefined,
      children: (
        <div className="pb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Tag color={cfg.color} className="text-[11px] font-bold m-0 rounded-md">
              {cfg.label}
            </Tag>
            {act.actor_name && (
              <span className="flex items-center gap-1 text-xs text-muted">
                <User size={11} /> {act.actor_name}
              </span>
            )}
            <Tooltip title={new Date(act.created_at).toLocaleString()}>
              <span className="text-[11px] text-muted ml-auto cursor-default">
                {new Date(act.created_at).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </Tooltip>
          </div>
          {(Object.keys(newVal).length > 0 || Object.keys(oldVal).length > 0) && (
            <div className="mt-1 text-xs text-muted pl-1 border-l-2 border-primary/20 ml-1">
              {Object.entries(newVal).map(([k, v]) => (
                <div key={k}>
                  <span className="font-medium text-foreground">{k.replace(/_/g, ' ')}: </span>
                  {oldVal[k] !== undefined && (
                    <span className="line-through text-muted mr-1">{String(oldVal[k])}</span>
                  )}
                  <span className="text-primary">{String(v)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ),
    };
  });

  return <Timeline items={items} className={className} />;
};
