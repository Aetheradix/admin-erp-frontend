import React from 'react';
import { Select } from '../primitives/Select';
import type { SelectProps } from 'antd';

interface PrimeDropdownChangeEvent {
  value: unknown;
}

interface DropdownProps extends Omit<SelectProps, 'onChange'> {
  onChange?: (e: PrimeDropdownChangeEvent) => void;
}

export const Dropdown = React.forwardRef<HTMLDivElement, DropdownProps>(
  ({ onChange, ...props }, ref) => {
    return <Select ref={ref} onChange={(e) => onChange?.({ value: e.value })} {...props} />;
  }
);

Dropdown.displayName = 'Dropdown';
