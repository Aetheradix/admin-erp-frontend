import { useNavigate } from 'react-router-dom';
import { Progress } from 'antd';
import { FolderKanban, Plus } from 'lucide-react';

interface WorkDeliveryHeaderProps {
  completedTasks: number;
  totalTasks: number;
  taskCompletionRate: number;
}

export function WorkDeliveryHeader({
  completedTasks,
  totalTasks,
  taskCompletionRate,
}: WorkDeliveryHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-subtle/70 shrink-0">
      <div>
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-1">
            <FolderKanban size={11} /> Workspaces & Pulse
          </span>
          <span className="text-muted text-xs">•</span>
          <span className="text-[10px] font-bold text-muted">
            {completedTasks} of {totalTasks} tasks complete
          </span>
        </div>
        <h3 className="text-sm font-black text-foreground">Project Delivery & Work Operations</h3>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-28 sm:w-36">
          <div className="flex items-center justify-between text-[10px] font-bold mb-1">
            <span className="text-muted">Completion</span>
            <span className="text-foreground">{taskCompletionRate}%</span>
          </div>
          <Progress
            percent={taskCompletionRate}
            showInfo={false}
            size="small"
            strokeColor="#E8583A"
            trailColor="#F3F4F6"
          />
        </div>

        <button
          type="button"
          onClick={() => navigate('/tasks')}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface-subtle hover:bg-surface-elevated text-xs font-bold text-foreground border border-border-subtle transition-colors cursor-pointer shrink-0"
          title="Create Task">
          <Plus size={12} className="text-primary" />
          <span>Task</span>
        </button>
      </div>
    </div>
  );
}
