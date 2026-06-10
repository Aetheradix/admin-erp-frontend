import { Spin } from 'antd';
import { cn } from '@/utils/cn';

interface ProgressSpinnerProps {
  className?: string;
  style?: React.CSSProperties;
  strokeWidth?: string;
  animationDuration?: string;
}

export const ProgressSpinner = ({ className, style }: ProgressSpinnerProps) => {
  return (
    <div className={cn('flex justify-center items-center', className)} style={style}>
      <Spin size="large" />
    </div>
  );
};
