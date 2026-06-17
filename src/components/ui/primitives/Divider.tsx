import { Divider as AntDivider } from 'antd';
import type { DividerProps as AntDividerProps } from 'antd';
import { cn } from '@/utils/cn';

export const Divider = ({ className, ...props }: AntDividerProps) => {
  return (
    <AntDivider
      className={cn('border-border-subtle my-6', className)}
      {...props}
    />
  );
};
