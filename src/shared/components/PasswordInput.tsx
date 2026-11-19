import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import type { InputProps } from 'antd';
import { Input } from '@/components/ui/primitives/Input';
import { cn } from '@/utils/cn';

export interface PasswordInputProps extends Omit<InputProps, 'type' | 'suffix'> {
  showLabel?: string;
  hideLabel?: string;
}

export function PasswordInput({
  className,
  showLabel = 'Show password',
  hideLabel = 'Hide password',
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <Input
      {...props}
      type={visible ? 'text' : 'password'}
      className={cn('pr-11!', className)}
      suffix={
        <button
          type="button"
          aria-label={visible ? hideLabel : showLabel}
          onClick={() => setVisible((current) => !current)}
          className="flex items-center text-muted hover:text-primary transition-colors">
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      }
    />
  );
}
