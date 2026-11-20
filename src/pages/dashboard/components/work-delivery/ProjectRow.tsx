import { useNavigate } from 'react-router-dom';
import { Tag } from 'antd';
import { ArrowUpRight } from 'lucide-react';
import type { Project } from '@/types/models';
import { resolveProjectTagColor } from '../../utils/workDelivery';
import { WorkDeliveryRow } from './WorkDeliveryPrimitives';

export function ProjectRow({ project }: { project: Project }) {
  const navigate = useNavigate();

  return (
    <WorkDeliveryRow onClick={() => navigate(`/projects/${project.id}`)} group>
      <div className="flex items-center gap-2.5 min-w-0">
        <span
          style={{ backgroundColor: project.color || '#E8583A' }}
          className="w-2.5 h-2.5 rounded-full shrink-0"
        />
        <div className="min-w-0">
          <h4 className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
            {project.title}
          </h4>
          <p className="text-[10px] text-muted flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="font-semibold text-muted/90">{project.category || 'ENTERPRISE'}</span>
            <span>•</span>
            <span>{project.tasks || 0} tasks</span>
            {(project.participants ?? 0) > 0 && (
              <>
                <span>•</span>
                <span>{project.participants} team members</span>
              </>
            )}
            {project.endDate && (
              <>
                <span>•</span>
                <span className="text-amber-600/90 font-medium">Due {project.endDate}</span>
              </>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Tag
          color={resolveProjectTagColor(project)}
          className="text-[9px] font-bold border-none m-0 rounded-md">
          {project.value || project.status || 'Active'}
        </Tag>
        <ArrowUpRight
          size={12}
          className="text-muted group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
        />
      </div>
    </WorkDeliveryRow>
  );
}