import type { ReactNode } from 'react';

export type ViewMode = 'table' | 'grid' | 'cards';

export interface FilterOption {
  label: string;
  value: string;
}

export interface ViewToggleOption {
  value: ViewMode;
  label: string;
  icon: ReactNode;
}

export type FilterConfig =
  | {
      kind: 'search';
      value: string;
      onChange: (value: string) => void;
      placeholder?: string;
      clearable?: boolean;
      className?: string;
      inputClassName?: string;
      iconClassName?: string;
      iconSize?: number;
      ariaLabel?: string;
    }
  | {
      kind: 'tabs';
      items: readonly string[];
      value: string;
      onChange: (value: string) => void;
      tabsClassName?: string;
    }
  | {
      kind: 'select';
      options: readonly FilterOption[];
      value: string;
      onChange: (value: string) => void;
      placeholder?: string;
      ariaLabel?: string;
      className?: string;
    }
  | {
      kind: 'segmented';
      items: readonly string[];
      value: string;
      onChange: (value: string) => void;
      className?: string;
      ariaLabel?: string;
    }
  | {
      kind: 'viewToggle';
      value: ViewMode;
      onChange: (value: ViewMode) => void;
      options: readonly ViewToggleOption[];
      className?: string;
      ariaLabel?: string;
    }
  | {
      kind: 'count';
      label: ReactNode;
      className?: string;
    }
  | {
      kind: 'custom';
      node: ReactNode;
      className?: string;
    };

export interface TabConfig {
  key: string;
  label: string;
}
