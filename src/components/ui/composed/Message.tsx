import { Alert } from 'antd';
import { cn } from '@/utils/cn';

interface MessageProps {
  severity?: 'success' | 'info' | 'warn' | 'error';
  text?: string;
  className?: string;
}

const severityMap = {
  success: 'success' as const,
  info: 'info' as const,
  warn: 'warning' as const,
  error: 'error' as const,
};

export const Message = ({ severity = 'info', text, className }: MessageProps) => {
  return (
    <Alert
      type={severityMap[severity]}
      message={text}
      showIcon
      className={cn('w-full', className)}
    />
  );
};
