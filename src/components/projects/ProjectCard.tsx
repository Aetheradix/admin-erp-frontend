import React from 'react';
import { Card, Space, Tag } from 'antd';
import { Calendar, ArrowRight, Building2 } from 'lucide-react';
import { StatusTag } from './StatusTag';
import { ProjectProgress } from './ProjectProgress';
import { AssigneeAvatar } from './AssigneeAvatar';
import type { BackendProject } from '@/store/api/projectApiSlice';

interface ProjectCardProps {
  project: BackendProject;
  onClick: (project: BackendProject) => void;
  className?: string;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick, className = '' }) => {
  const status = project.project_status || 'planning';
  const taskCount = project.task_count ?? 0;
  const completedCount = project.completed_task_count ?? 0;

  return (
    <Card
      hoverable
      onClick={() => onClick(project)}
      className={`h-full rounded-2xl border border-border-subtle bg-card shadow-xs transition-all hover:border-primary/50 hover:shadow-sm cursor-pointer group ${className}`}
      styles={{
        body: {
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100%',
        },
      }}>
      <div>
        {/* Card Top: Key, Department, Status */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <Space size={6}>
            <span className="font-mono text-xs font-bold text-primary px-2 py-0.5 rounded-md bg-primary/10">
              {project.project_key || 'N/A'}
            </span>
            {project.department_name && (
              <Tag
                bordered={false}
                className="flex items-center gap-1 font-semibold text-[11px] m-0 bg-surface-elevated text-muted">
                <Building2 size={11} className="text-primary" />
                {project.department_name}
              </Tag>
            )}
          </Space>
          <StatusTag status={status} />
        </div>

        {/* Title & Description */}
        <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-1">
          {project.project_name}
        </h3>
        <p className="text-xs text-muted line-clamp-2 mb-3">
          {project.project_description || 'No description provided.'}
        </p>

        {/* Ownership details */}
        <div className="flex items-center gap-3 text-xs text-muted mb-3">
          {project.owner_name && (
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-muted-foreground">Owner:</span>
              <AssigneeAvatar name={project.owner_name} size={18} showName />
            </div>
          )}
          {project.project_manager_name && (
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-muted-foreground">PM:</span>
              <AssigneeAvatar name={project.project_manager_name} size={18} showName />
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <ProjectProgress
          completedCount={completedCount}
          totalCount={taskCount}
          health={project.health}
          size="small"
          className="mb-2"
        />
      </div>

      {/* Card Footer */}
      <div className="pt-3 border-t border-border-subtle flex items-center justify-between text-xs text-muted">
        <span className="flex items-center gap-1.5 font-medium">
          <Calendar size={13} className="text-primary" />
          {project.deadline
            ? `Due ${String(project.deadline).split('T')[0]}`
            : project.end_date
            ? `Due ${String(project.end_date).split('T')[0]}`
            : 'No deadline'}
        </span>

        <span className="flex items-center gap-1 font-bold text-primary group-hover:translate-x-1 transition-transform">
          <span>Open</span>
          <ArrowRight size={13} />
        </span>
      </div>
    </Card>
  );
};
