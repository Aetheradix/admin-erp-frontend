import React from 'react';
import { Tag } from 'antd';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface PriorityTagProps {
  priority: 'High' | 'Medium' | 'Low' | string;
  showIcon?: boolean;
  className?: string;
}

export const PriorityTag: React.FC<PriorityTagProps> = ({
  priority,
  showIcon = true,
  className = '',
}) => {
  const norm = (priority || 'medium').toLowerCase();

  let color = 'default';
  let icon = <Minus size={10} />;
  let label = 'Medium';

  if (norm === 'high' || norm === 'urgent') {
    color = 'error';
    icon = <ArrowUp size={10} />;
    label = 'High';
  } else if (norm === 'low') {
    color = 'blue';
    icon = <ArrowDown size={10} />;
    label = 'Low';
  } else {
    color = 'warning';
    icon = <Minus size={10} />;
    label = 'Medium';
  }

  return (
    <Tag
      color={color}
      className={`font-semibold text-[11px] rounded-md px-1.5 py-0.5 m-0 inline-flex items-center gap-1 ${className}`}>
      {showIcon && icon}
      <span>{label}</span>
    </Tag>
  );
};
