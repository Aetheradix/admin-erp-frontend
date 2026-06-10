import React from 'react';
import { Select as AntSelect } from 'antd';
import type { SelectProps as AntSelectProps } from 'antd';
import { cn } from '@/utils/cn';

interface PrimeSelectChangeEvent<T = unknown> {
  value: T;
  originalEvent?: React.SyntheticEvent;
}

interface SelectProps<T = unknown> extends Omit<AntSelectProps<T>, 'onChange'> {
  onChange?: (e: PrimeSelectChangeEvent<T>) => void;
}

export const Select = React.forwardRef(function SelectInner<T = unknown>(
  { className, onChange, ...props }: SelectProps<T>,
  ref: React.Ref<unknown>
) {
  return (
    <AntSelect<T>
      ref={ref as React.Ref<never>}
      className={cn('w-full [&_.ant-select-selector]:!h-14 [&_.ant-select-selector]:!rounded-2xl [&_.ant-select-selector]:!px-2', className)}
      onChange={(value) => onChange?.({ value })}
      {...props}
    />
  );
}) as <T = unknown>(props: SelectProps<T> & { ref?: React.Ref<unknown> }) => React.ReactElement;
