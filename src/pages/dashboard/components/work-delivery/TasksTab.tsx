import { useNavigate } from 'react-router-dom';
import { Tag } from 'antd';
import { CheckCircle2, Clock, ListTodo, Plus } from 'lucide-react';
import type { Task } from '@/types/models';
import { COMPLETED_TASK_STATUS } from '../../constants';
import { WorkDeliveryEmpty, WorkDeliveryList, WorkDeliveryRow } from './WorkDeliveryPrimitives';

export function TasksTab({ tasks }: { tasks: Task[] }) {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col pt-1">
      {tasks.length === 0 ? (
        <WorkDeliveryEmpty
          icon={ListTodo}
          title="No tasks assigned yet"
          message="Assigned tasks and sprint tickets will display here."
          action={
            <button
              type="button"
              onClick={() => navigate('/tasks')}
              className="mt-2.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-subtle hover:bg-surface-elevated text-xs font-bold text-foreground border border-border-subtle transition-colors cursor-pointer">
              <Plus size={11} className="text-primary" />
              <span>Create First Task</span>
            </button>
          }
        />
      ) : (
        <WorkDeliveryList>
          {tasks.map((task, index) => (
            <WorkDeliveryRow key={index} onClick={() => navigate('/tasks')} group>
              <div className="flex items-center gap-2.5 min-w-0">
                {task.task_status === COMPLETED_TASK_STATUS ? (
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                ) : (
                  <Clock size={14} className="text-amber-500 shrink-0" />
                )}
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                    {task.task_title}
                  </h4>
                  {task.task_description && (
                    <p className="text-[10px] text-muted truncate mt-0.5">
                      {task.task_description}
                    </p>
                  )}
                </div>
              </div>
              <Tag
                color={task.task_status === COMPLETED_TASK_STATUS ? 'green' : 'gold'}
                className="text-[9px] font-bold border-none m-0 rounded-md shrink-0">
                {task.task_status}
              </Tag>
            </WorkDeliveryRow>
          ))}
        </WorkDeliveryList>
      )}
    </div>
  );
}
