import React from 'react';
import { Avatar, Tooltip } from 'antd';

interface AssigneeAvatarProps {
  name?: string | null;
  imageUrl?: string | null;
  designation?: string | null;
  department?: string | null;
  size?: number | 'small' | 'default' | 'large';
  showName?: boolean;
  className?: string;
}

export const AssigneeAvatar: React.FC<AssigneeAvatarProps> = ({
  name,
  imageUrl,
  designation,
  department,
  size = 'default',
  showName = false,
  className = '',
}) => {
  const safeName = (typeof name === 'string' && name.trim()) || 'Unassigned';
  const initials = safeName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const tooltipTitle = (
    <div className="text-xs">
      <div className="font-bold">{safeName}</div>
      {designation && <div className="text-muted-foreground">{designation}</div>}
      {department && <div className="text-[10px] text-muted-foreground">{department}</div>}
    </div>
  );

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <Tooltip title={tooltipTitle}>
        <Avatar
          size={size}
          src={imageUrl || undefined}
          className="bg-primary/20 text-primary font-bold text-xs border border-primary/30 flex items-center justify-center">
          {initials || 'U'}
        </Avatar>
      </Tooltip>
      {showName && (
        <span className="text-xs font-medium text-foreground truncate max-w-[120px]">
          {safeName}
        </span>
      )}
    </div>
  );
};
