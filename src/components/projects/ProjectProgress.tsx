import React from 'react';
import { Progress, Tooltip } from 'antd';

interface ProjectProgressProps {
  completedCount?: number;
  totalCount?: number;
  health?: 'on_track' | 'at_risk' | 'off_track' | string;
  size?: 'small' | 'default';
  showLabel?: boolean;
  className?: string;
}

const HEALTH_COLORS: Record<string, string> = {
  on_track: '#52c41a',
  at_risk: '#faad14',
  off_track: '#ff4d4f',
};

export const ProjectProgress: React.FC<ProjectProgressProps> = ({
  completedCount = 0,
  totalCount = 0,
  health = 'on_track',
  size = 'default',
  showLabel = true,
  className = '',
}) => {
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const strokeColor = HEALTH_COLORS[health] || '#1677ff';

  const tooltipText = `${completedCount} of ${totalCount} tasks completed (${percent}%)`;

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {showLabel && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Progress</span>
          <span className="font-semibold text-foreground">{percent}%</span>
        </div>
      )}
      <Tooltip title={tooltipText}>
        <Progress
          percent={percent}
          size={size === 'small' ? 'small' : undefined}
          strokeColor={strokeColor}
          showInfo={!showLabel}
        />
      </Tooltip>
      {showLabel && totalCount > 0 && (
        <div className="text-[10px] text-muted-foreground text-right">
          {completedCount}/{totalCount} tasks
        </div>
      )}
    </div>
  );
};
